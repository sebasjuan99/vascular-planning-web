export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { updateSubscriptionStatus } from '@/lib/mercadopago-subscriptions'
import { syncSubscriptionModulesDown } from '@/lib/subscriptions'

/**
 * Cancels a user's subscription.
 *
 * Body: { subscriptionId: string, immediate?: boolean }
 *
 * `immediate=true`  → cancel right now at MP, revoke access. (Default.)
 * `immediate=false` → mark cancel_at_period_end so access continues
 *                     until current_period_end then we revoke.
 *                     (Implemented best-effort via a future cron; for
 *                     now we still call MP cancel since we don't have
 *                     end-of-period scheduling yet.)
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { subscriptionId?: string; immediate?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const subscriptionId = body?.subscriptionId
  if (!subscriptionId) {
    return NextResponse.json({ error: 'subscriptionId required' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: row, error: lookupError } = await admin
    .from('subscriptions')
    .select('id, user_id, mp_preapproval_id, status')
    .eq('id', subscriptionId)
    .maybeSingle()

  if (lookupError) {
    return NextResponse.json({ error: 'lookup-failed' }, { status: 500 })
  }
  if (!row) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 })
  }
  if (row.user_id !== user.id && user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (row.status === 'cancelled' || row.status === 'expired') {
    return NextResponse.json({ ok: true, alreadyCancelled: true })
  }

  // Tell MercadoPago
  if (row.mp_preapproval_id) {
    try {
      await updateSubscriptionStatus(row.mp_preapproval_id, 'cancelled')
    } catch (err) {
      console.error('[subs/cancel] MP cancel failed:', err)
      // Continue — we still want to mark cancelled locally
    }
  }

  // Update our row
  const now = new Date().toISOString()
  await admin
    .from('subscriptions')
    .update({
      status: 'cancelled',
      cancelled_at: now,
      updated_at: now,
    })
    .eq('id', row.id)

  // Revoke modules (re-derives from remaining active subs + purchases)
  try {
    await syncSubscriptionModulesDown(row.user_id)
  } catch (err) {
    console.error('[subs/cancel] sync modules down failed:', err)
  }

  return NextResponse.json({ ok: true })
}
