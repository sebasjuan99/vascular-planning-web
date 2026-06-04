// Single MercadoPago webhook dispatcher.
//
// MercadoPago accepts only ONE notification URL per application, but
// sends events for multiple topics: 'payment', 'subscription_preapproval',
// 'subscription_authorized_payment', 'merchant_order', etc.
//
// This dispatcher inspects the topic and routes to the appropriate
// handler. Both /api/payments/webhook and /api/subscriptions/webhook
// invoke it, so either URL configured in MP will work.

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPayment, mpStatusToDb, verifyWebhookSignature } from '@/lib/mercadopago'
import { getCourse } from '@/lib/courses'
import { incrementCouponUses } from '@/lib/coupons'
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

interface MPWebhookBody {
  type?: string
  action?: string
  data?: { id?: string | number }
}

/**
 * Reads the webhook body and routes to the right handler based on topic.
 * Returns the NextResponse to send back to MP.
 */
export async function dispatchMpWebhook(req: NextRequest): Promise<NextResponse> {
  let body: MPWebhookBody
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  // Topic can come in body.type (modern) or ?topic= (legacy/manual tests)
  const topic =
    body?.type ||
    req.nextUrl.searchParams.get('topic') ||
    ''

  const dataId = String(body?.data?.id ?? '')
  if (!dataId) {
    return NextResponse.json({ ok: true, ignored: 'no-data-id' })
  }

  switch (topic) {
    case 'payment':
      return handlePayment(req, dataId)

    case 'subscription_preapproval':
    case 'preapproval':
      return handleSubscriptionPreapproval(req, dataId)

    case 'subscription_authorized_payment':
    case 'authorized_payment':
      return handleAuthorizedPayment(req, dataId)

    // We don't care about merchant_order or unknown topics
    default:
      return NextResponse.json({ ok: true, skipped: `topic-${topic || 'empty'}` })
  }
}

// ─── Payment topic (one-time purchases via Checkout Pro) ──────────────────

async function handlePayment(req: NextRequest, dataId: string): Promise<NextResponse> {
  const sig = verifyWebhookSignature(req, dataId)
  if (!sig.ok) {
    console.warn('[mp-webhook/payment] sig failed:', sig.reason)
    return NextResponse.json({ error: 'unauthorized', reason: sig.reason }, { status: 401 })
  }

  let payment
  try {
    payment = await fetchPayment(dataId)
  } catch (err) {
    console.error('[mp-webhook/payment] fetchPayment failed:', err)
    return NextResponse.json({ ok: true, error: 'fetch-failed' })
  }

  const externalReference = payment.externalReference
  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: 'no-external-reference' })
  }

  const admin = createAdminClient()
  const { data: row, error: lookupError } = await admin
    .from('course_purchases')
    .select('id, status, user_id, course_id, coupon_id')
    .eq('id', externalReference)
    .maybeSingle()

  if (lookupError) {
    console.error('[mp-webhook/payment] lookup failed:', lookupError.message)
    return NextResponse.json({ ok: true, error: 'lookup-failed' })
  }
  if (!row) {
    return NextResponse.json({ ok: true, ignored: 'no-row' })
  }

  const newStatus = mpStatusToDb(payment.status)
  if (row.status === 'approved' && newStatus !== 'refunded') {
    return NextResponse.json({ ok: true, ignored: 'already-approved' })
  }

  const now = new Date().toISOString()
  const update: Record<string, unknown> = {
    status: newStatus,
    mp_payment_id: payment.id,
    updated_at: now,
  }
  if (newStatus === 'approved') update.approved_at = now

  const { error: updateError } = await admin
    .from('course_purchases')
    .update(update)
    .eq('id', row.id)

  if (updateError) {
    console.error('[mp-webhook/payment] update failed:', updateError.message)
    return NextResponse.json({ ok: true, error: 'update-failed' })
  }

  if (newStatus === 'approved') {
    const course = getCourse(row.course_id)
    const grants = course?.grantsModules ?? []
    if (grants.length > 0) {
      try {
        const { data: userData } = await admin.auth.admin.getUserById(row.user_id)
        const currentMeta = userData?.user?.user_metadata ?? {}
        const currentModules: string[] = Array.isArray(currentMeta.modules)
          ? currentMeta.modules
          : []
        const merged = Array.from(new Set([...currentModules, ...grants]))
        if (merged.length !== currentModules.length) {
          await admin.auth.admin.updateUserById(row.user_id, {
            user_metadata: { ...currentMeta, modules: merged },
          })
        }
      } catch (err) {
        console.error('[mp-webhook/payment] grant modules failed:', err)
      }
    }

    const rowAny = row as { coupon_id?: string | null }
    if (rowAny.coupon_id) {
      try {
        await incrementCouponUses(rowAny.coupon_id)
      } catch (err) {
        console.error('[mp-webhook/payment] coupon increment failed:', err)
      }
    }
  }

  return NextResponse.json({ ok: true, status: newStatus })
}

// ─── Subscription preapproval topic (lifecycle changes) ───────────────────

async function handleSubscriptionPreapproval(
  req: NextRequest,
  dataId: string
): Promise<NextResponse> {
  const sig = verifySubscriptionSignature(req, dataId)
  if (!sig.ok) {
    console.warn('[mp-webhook/sub-preapproval] sig failed:', sig.reason)
    return NextResponse.json({ error: 'unauthorized', reason: sig.reason }, { status: 401 })
  }

  let preapproval
  try {
    preapproval = await getSubscription(dataId)
  } catch (err) {
    console.error('[mp-webhook/sub-preapproval] fetch failed:', err)
    return NextResponse.json({ ok: true, error: 'fetch-failed' })
  }

  const externalReference = preapproval.external_reference
  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: 'no-external-ref' })
  }

  const admin = createAdminClient()
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

  if (!wasActive && becomesActive) {
    try {
      await syncSubscriptionModulesUp(row.user_id, row.product_id)
    } catch (err) {
      console.error('[mp-webhook/sub-preapproval] grant modules failed:', err)
    }
  } else if (wasActive && !becomesActive) {
    try {
      await syncSubscriptionModulesDown(row.user_id)
    } catch (err) {
      console.error('[mp-webhook/sub-preapproval] revoke modules failed:', err)
    }
  }

  return NextResponse.json({ ok: true, status: newStatus })
}

// ─── Subscription authorized_payment topic (recurring charges) ────────────

async function handleAuthorizedPayment(
  req: NextRequest,
  dataId: string
): Promise<NextResponse> {
  const sig = verifySubscriptionSignature(req, dataId)
  if (!sig.ok) {
    console.warn('[mp-webhook/sub-payment] sig failed:', sig.reason)
    return NextResponse.json({ error: 'unauthorized', reason: sig.reason }, { status: 401 })
  }

  let ap
  try {
    ap = await getAuthorizedPayment(dataId)
  } catch (err) {
    console.error('[mp-webhook/sub-payment] fetch failed:', err)
    return NextResponse.json({ ok: true, error: 'fetch-failed' })
  }

  const preapprovalId = ap.preapproval_id
  if (!preapprovalId) {
    return NextResponse.json({ ok: true, ignored: 'no-preapproval-id' })
  }

  const admin = createAdminClient()
  const { data: subRow } = await admin
    .from('subscriptions')
    .select('id, user_id, product_id, status')
    .eq('mp_preapproval_id', preapprovalId)
    .maybeSingle()

  if (!subRow) return NextResponse.json({ ok: true, ignored: 'no-sub' })

  const paymentId = ap.payment?.id ? String(ap.payment.id) : String(ap.id)
  const status = ap.payment?.status ?? ap.status ?? 'unknown'
  const amount = ap.transaction_amount ?? 0
  const currency = ap.currency_id ?? 'CLP'

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
      console.error('[mp-webhook/sub-payment] grant modules failed:', err)
    }
  }

  return NextResponse.json({ ok: true, recordedCharge: !existing })
}
