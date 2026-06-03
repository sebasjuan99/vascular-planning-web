export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPayment, mpStatusToDb, verifyWebhookSignature } from '@/lib/mercadopago'

/**
 * MercadoPago Webhook handler.
 *
 * Receives notifications for the `payment` topic. For each notification:
 *   1. Validate the x-signature header (HMAC-SHA256 of the canonical template)
 *   2. Fetch the payment from MP REST API to get the canonical status
 *      (don't trust the webhook body — only the dataId)
 *   3. Locate the matching course_purchases row by external_reference
 *   4. Update status, mp_payment_id, approved_at
 *
 * Always returns 200 OK after signature validation passes (even on
 * processing errors), so MP doesn't retry indefinitely.
 */
export async function POST(req: NextRequest) {
  let body: { type?: string; action?: string; data?: { id?: string | number } }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid-json' }, { status: 400 })
  }

  // MP also sends `merchant_order` notifications — we only care about payments.
  const topic = body?.type || (req.nextUrl.searchParams.get('topic') ?? '')
  if (topic && topic !== 'payment') {
    return NextResponse.json({ ok: true, skipped: 'topic-not-payment' })
  }

  const dataId = String(body?.data?.id ?? '')
  if (!dataId) {
    return NextResponse.json({ error: 'missing-data-id' }, { status: 400 })
  }

  // 1. Validate signature
  const sig = verifyWebhookSignature(req, dataId)
  if (!sig.ok) {
    console.warn('[webhook] Signature check failed:', sig.reason)
    return NextResponse.json({ error: 'unauthorized', reason: sig.reason }, { status: 401 })
  }

  // 2. Fetch canonical payment details
  let payment
  try {
    payment = await fetchPayment(dataId)
  } catch (err) {
    console.error('[webhook] fetchPayment failed:', err)
    // Return 200 so MP doesn't retry — we'll see the error in logs
    return NextResponse.json({ ok: true, error: 'fetch-failed' })
  }

  const externalReference = payment.externalReference
  if (!externalReference) {
    console.warn('[webhook] Payment has no external_reference, ignoring:', payment.id)
    return NextResponse.json({ ok: true, ignored: 'no-external-reference' })
  }

  const admin = createAdminClient()

  // 3. Find the purchase row by external_reference (= course_purchases.id UUID)
  const { data: row, error: lookupError } = await admin
    .from('course_purchases')
    .select('id, status, user_id, course_id')
    .eq('id', externalReference)
    .maybeSingle()

  if (lookupError) {
    console.error('[webhook] DB lookup failed:', lookupError.message)
    return NextResponse.json({ ok: true, error: 'lookup-failed' })
  }
  if (!row) {
    console.warn('[webhook] No matching purchase row for external_reference:', externalReference)
    return NextResponse.json({ ok: true, ignored: 'no-row' })
  }

  // 4. State-machine: once approved, only refunds can change status
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
  if (newStatus === 'approved') {
    update.approved_at = now
  }

  const { error: updateError } = await admin
    .from('course_purchases')
    .update(update)
    .eq('id', row.id)

  if (updateError) {
    console.error('[webhook] DB update failed:', updateError.message)
    return NextResponse.json({ ok: true, error: 'update-failed' })
  }

  return NextResponse.json({ ok: true, status: newStatus })
}

// Some MP integrations also send GET requests during webhook validation.
// Return 200 so the URL is recognized as live.
export async function GET() {
  return NextResponse.json({ ok: true, message: 'MercadoPago webhook endpoint' })
}
