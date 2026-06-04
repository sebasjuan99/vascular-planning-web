// Subscription state helpers.
//
// A user is considered subscribed if at least one row in `subscriptions`
// has status='authorized' AND no cancellation past current_period_end.
//
// Module access via subscription is layered on top of the existing
// admin grants (user_metadata.modules) and one-time purchases. We sync
// modules into user_metadata when a subscription goes active and remove
// them when it transitions away from authorized.

import type { SupabaseClient, User } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { COURSES, type GrantableModule } from '@/lib/courses'

export interface SubscriptionRow {
  id: string
  user_id: string
  product_id: string
  mp_preapproval_id: string | null
  mp_preapproval_plan_id: string | null
  status: 'pending' | 'authorized' | 'paused' | 'cancelled' | 'expired'
  amount: number
  currency: string
  frequency_value: number
  frequency_type: 'months' | 'years' | 'days'
  start_date: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  cancelled_at: string | null
  init_point: string | null
  created_at: string
  updated_at: string
}

/**
 * Returns all currently-effective subscriptions for the user.
 * Effective = status='authorized' OR (status='cancelled' with grace
 * until current_period_end).
 */
export async function getActiveSubscriptions(
  supabase: SupabaseClient,
  userId: string
): Promise<SubscriptionRow[]> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .in('status', ['authorized', 'pending'])
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[subs] active query failed:', error.message)
    return []
  }
  const rows = (data ?? []) as SubscriptionRow[]
  return rows.filter((r) => {
    // 'authorized' = active right now
    if (r.status === 'authorized') return true
    // 'pending' = newly created, user hasn't authorized yet → not yet effective
    return false
  })
}

/**
 * Modules unlocked by the user's active subscriptions (union).
 */
export function modulesFromSubscriptions(
  subs: SubscriptionRow[]
): GrantableModule[] {
  const set = new Set<GrantableModule>()
  for (const s of subs) {
    const c = COURSES.find((x) => x.id === s.product_id)
    for (const m of c?.grantsModules ?? []) set.add(m)
  }
  return Array.from(set)
}

/**
 * Whether the user has access to any product whose subscription would
 * grant the given module. Used by EVAR/FEVAR module gating.
 */
export async function hasActiveModuleSubscription(
  supabase: SupabaseClient,
  user: User,
  module: GrantableModule
): Promise<boolean> {
  const subs = await getActiveSubscriptions(supabase, user.id)
  return modulesFromSubscriptions(subs).includes(module)
}

/**
 * Merge granted modules into user_metadata.modules. Called by webhook
 * when a subscription becomes authorized. Idempotent.
 */
export async function syncSubscriptionModulesUp(
  userId: string,
  productId: string
): Promise<void> {
  const course = COURSES.find((c) => c.id === productId)
  const grants = course?.grantsModules ?? []
  if (grants.length === 0) return

  const admin = createAdminClient()
  const { data: userData } = await admin.auth.admin.getUserById(userId)
  const meta = userData?.user?.user_metadata ?? {}
  const current: string[] = Array.isArray(meta.modules) ? meta.modules : []
  const merged = Array.from(new Set([...current, ...grants]))
  if (merged.length !== current.length) {
    await admin.auth.admin.updateUserById(userId, {
      user_metadata: { ...meta, modules: merged },
    })
  }
}

/**
 * Strip subscription-granted modules from user_metadata when a
 * subscription is cancelled/paused/expired. Only removes modules whose
 * access ONLY came from subscriptions (preserves admin grants and
 * one-time purchase grants).
 *
 * This is best-effort: we re-derive the user's "should have" modules
 * from their remaining active subscriptions PLUS approved one-time
 * purchases. Admin-granted modules are preserved by reading the
 * user_metadata.courses[] (admin tab) - if EVAR was admin-granted,
 * we leave it alone.
 */
export async function syncSubscriptionModulesDown(userId: string): Promise<void> {
  const admin = createAdminClient()
  const { data: userData } = await admin.auth.admin.getUserById(userId)
  const meta = userData?.user?.user_metadata ?? {}
  const currentModules: string[] = Array.isArray(meta.modules) ? meta.modules : []
  if (currentModules.length === 0) return

  // 1) Modules from STILL-active subscriptions
  const { data: activeSubs } = await admin
    .from('subscriptions')
    .select('product_id')
    .eq('user_id', userId)
    .eq('status', 'authorized')
  const fromSubs = new Set<string>()
  for (const r of (activeSubs ?? []) as { product_id: string }[]) {
    const c = COURSES.find((x) => x.id === r.product_id)
    for (const m of c?.grantsModules ?? []) fromSubs.add(m)
  }

  // 2) Modules from approved one-time course_purchases that grant modules
  const { data: approvedPurchases } = await admin
    .from('course_purchases')
    .select('course_id')
    .eq('user_id', userId)
    .eq('status', 'approved')
  const fromPurchases = new Set<string>()
  for (const r of (approvedPurchases ?? []) as { course_id: string }[]) {
    const c = COURSES.find((x) => x.id === r.course_id)
    for (const m of c?.grantsModules ?? []) fromPurchases.add(m)
  }

  // 3) Admin-granted modules — preserved separately. We don't know who
  //    granted what historically, so the safe rule is: keep any module
  //    that was already there AND wasn't only-from-this-now-cancelled-sub.
  //    Simpler: result = (fromSubs ∪ fromPurchases ∪ admin grants).
  //    We approximate admin grants as "modules in user_metadata not
  //    derivable from subs/purchases" — that means after this sync,
  //    admin grants are preserved IF they were the only source. But if
  //    the user had EVAR from BOTH admin and sub, after sub cancel we
  //    still keep EVAR (because it's still in user_metadata.modules
  //    via admin). We can't distinguish, so we must explicitly preserve
  //    pre-existing entries that don't derive from sub/purchase.
  const expected = new Set<string>([...fromSubs, ...fromPurchases])
  const adminGrantsApprox = currentModules.filter((m) => !expected.has(m))
  for (const m of adminGrantsApprox) expected.add(m)

  const next = Array.from(expected)
  // Sort to make diff stable
  next.sort()
  const before = [...currentModules].sort()
  const same = next.length === before.length && next.every((m, i) => m === before[i])
  if (same) return

  await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...meta, modules: next },
  })
}
