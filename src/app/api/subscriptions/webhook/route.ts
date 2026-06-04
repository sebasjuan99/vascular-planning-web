export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  getSubscription,
  getAuthorizedPayment,
  mpSubStatusToDb,
  verifySubscriptionSignature,
} from '@/lib/mercadopago-subscriptions'
import {
  syncSubscriptionModulesUp,
  syncSubscriptionModulesDown,
} from '@/lib/subscriptions'

/**
 * MercadoPago Subscriptions webhook.
 *
 * Two relevant topics:
 *   - subscription_preapproval        → status changed (authorized, paused, cancelled)
 *   - subscription_authorized_payment → recurring charge happened
 *
 * For each event we:
 *   1. Verify x-signature.
 *   2. Fetch the canonical resource from MP REST.
 *   3. Update our subscriptions / subscription_charges row.
 *   4. Sync user_metadata.modules (grant/revoke) accordingly.
 *
 * Always returns 200 after signature passes so MP doesn't retry on
 * processing errors that we've already logged.
 */
export async function POST(req: NextRequest) {
  let body: { type?: string; action?: string; data?: { id?: string | number } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  const topic = body?.type || req.nextUrl.searchParams.get('topic') || ''
  const dataId = String(body?.data?.id ?? '')
  if (!dataId) return NextResponse.json({ error: 'missing-data-id' }, { status: 400 })

  // 1. Validate signature
  const sig = verifySubscriptionSignature(req, dataId)
  if (!sig.ok) {
    console.warn('[sub-webhook] signature failed:', sig.reason)
    return NextResponse.json({ error: 'unauthorized', reason: sig.reason }, { status: 401 })
  }

  const admin = createAdminClient()

  // ─── Topic: subscription_preapproval (lifecycle changes) ──────────────
  if (topic === 'subscription_preapproval' || topic === 'preapproval') {
    let preapproval
    try {
      preapproval = await getSubscription(dataId)
    } catch (err) {
      console.error('[sub-webhook] preapproval fetch failed:', err)
      return NextResponse.json({ ok: true, error: 'fetch-failed' })
    }

    const externalReference = preapproval.external_reference
    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: 'no-external-ref' })
    }

    const { data: row } = await admin
      .from('subscriptions')
      .select('id, status, user_id, product_id')
      .eq('id', externalReference)
      .maybeSingle()

    if (!row) return NextResponse.json({ ok: true, ignored: 'no-row' })

    const newStatus = mpSubStatusToDb(preapproval.status)
    const wasActive = row.status === 'authorized'
    const becomesActive = newStatus === 'authorized'

    const now = new Date().toISOString()
    const update: Record<string, unknown> = {
      status: newStatus,
      mp_preapproval_id: preapproval.id,
      updated_at: now,
    }
    if (preapproval.next_payment_date) {
      update.current_period_end = preapproval.next_payment_date
    }
    if (newStatus === 'cancelled') {
      update.cancelled_at = now
    }

    await admin.from('subscriptions').update(update).eq('id', row.id)

    // Sync modules
    if (!wasActive && becomesActive) {
      try {
        await syncSubscriptionModulesUp(row.user_id, row.product_id)
      } catch (err) {
        console.error('[sub-webhook] grant modules failed:', err)
      }
    } else if (wasActive && !becomesActive) {
      try {
        await syncSubscriptionModulesDown(row.user_id)
      } catch (err) {
        console.error('[sub-webhook] revoke modules failed:', err)
      }
    }

    return NextResponse.json({ ok: true, status: newStatus })
  }

  // ─── Topic: subscription_authorized_payment (recurring charges) ───────
  if (topic === 'subscription_authorized_payment' || topic === 'authorized_payment') {
    let ap
    try {
      ap = await getAuthorizedPayment(dataId)
    } catch (err) {
      console.error('[sub-webhook] authorized_payment fetch failed:', err)
      return NextResponse.json({ ok: true, error: 'fetch-failed' })
    }

    const preapprovalId = ap.preapproval_id
    if (!preapprovalId) {
      return NextResponse.json({ ok: true, ignored: 'no-preapproval-id' })
    }

    // Find subscription by MP preapproval id
    const { data: subRow } = await admin
      .from('subscriptions')
      .select('id, user_id, product_id, status')
      .eq('mp_preapproval_id', preapprovalId)
      .maybeSingle()

    if (!subRow) return NextResponse.json({ ok: true, ignored: 'no-sub' })

    // Insert a charge row (idempotent on mp_payment_id when present)
    const paymentId = ap.payment?.id ? String(ap.payment.id) : String(ap.id)
    const status = ap.payment?.status ?? ap.status ?? 'unknown'
    const amount = ap.transaction_amount ?? 0
    const currency = ap.currency_id ?? 'CLP'

    // Skip if we already recorded this payment
    const { data: existing } = await admin
      .from('subscription_charges')
      .select('id')
      .eq('subscription_id', subRow.id)
      .eq('mp_payment_id', paymentId)
      .limit(1)
      .maybeSingle()

    if (!existing) {
      await admin.from('subscription_charges').insert({
        subscription_id: subRow.id,
        mp_payment_id: paymentId,
        amount,
        currency,
        status,
      })
    }

    // If charge approved, ensure modules are granted (some edge cases
    // where preapproval webhook didn't fire) and refresh current_period_end
    if (status === 'approved') {
      if (subRow.status !== 'authorized') {
        await admin
          .from('subscriptions')
          .update({ status: 'authorized', updated_at: new Date().toISOString() })
          .eq('id', subRow.id)
      }
      try {
        await syncSubscriptionModulesUp(subRow.user_id, subRow.product_id)
      } catch (err) {
        console.error('[sub-webhook] grant modules after charge failed:', err)
      }
    }

    return NextResponse.json({ ok: true, recordedCharge: !existing })
  }

  return NextResponse.json({ ok: true, ignored: `topic-${topic}` })
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'MercadoPago subscription webhook endpoint' })
}
