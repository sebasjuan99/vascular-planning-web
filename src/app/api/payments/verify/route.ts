export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPayment, mpStatusToDb } from '@/lib/mercadopago'
import { getCourse } from '@/lib/courses'

/**
 * Active payment verification — called from /pago/success.
 *
 * Doesn't trust the redirect query params. Hits MercadoPago's REST API
 * with the payment_id to get the canonical status, then updates the
 * course_purchases row + grants modules if applicable.
 *
 * This gives us a deterministic confirmation path independent of the
 * webhook (which may be misconfigured or rejected by signature check
 * during initial setup).
 *
 * Returns:
 *   200 { status, courseId, granted } on success
 *   200 { ignored: 'not-yours' } if the purchase row doesn't belong to caller
 *   400 if payment_id missing
 *   401 if not authenticated
 *   502 if MP fetch fails
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { paymentId?: string | number }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const paymentId = body?.paymentId ? String(body.paymentId) : ''
  if (!paymentId) {
    return NextResponse.json({ error: 'paymentId required' }, { status: 400 })
  }

  // 1. Ask MercadoPago for the authoritative payment record
  let payment
  try {
    payment = await fetchPayment(paymentId)
  } catch (err) {
    console.error('[verify] fetchPayment failed:', err)
    return NextResponse.json(
      { error: 'mp-fetch-failed', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }

  const externalReference = payment.externalReference
  if (!externalReference) {
    return NextResponse.json({ ok: true, ignored: 'no-external-reference' })
  }

  const admin = createAdminClient()

  // 2. Look up the matching purchase row (must belong to the caller)
  const { data: row, error: lookupError } = await admin
    .from('course_purchases')
    .select('id, status, user_id, course_id')
    .eq('id', externalReference)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: 'db-lookup-failed' }, { status: 500 })
  }
  if (!row) {
    return NextResponse.json({ ok: true, ignored: 'no-row' })
  }
  if (row.user_id !== user.id) {
    return NextResponse.json({ ok: true, ignored: 'not-yours' })
  }

  // 3. Skip if already approved
  const newStatus = mpStatusToDb(payment.status)
  if (row.status === 'approved' && newStatus !== 'refunded') {
    return NextResponse.json({
      ok: true,
      status: 'approved',
      courseId: row.course_id,
      alreadyApproved: true,
    })
  }

  // 4. Update the row
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
    console.error('[verify] DB update failed:', updateError.message)
    return NextResponse.json({ error: 'db-update-failed' }, { status: 500 })
  }

  // 5. Grant modules if the product unlocks them
  let granted: string[] = []
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
        granted = [...grants]
      } catch (err) {
        console.error('[verify] grantsModules update failed:', err)
      }
    }
  }

  return NextResponse.json({
    ok: true,
    status: newStatus,
    courseId: row.course_id,
    granted,
  })
}
