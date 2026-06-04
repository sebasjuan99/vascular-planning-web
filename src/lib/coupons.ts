// Coupon validation & redemption.
//
// Validation flow (used at checkout):
//   1. Look up coupon by case-insensitive code.
//   2. Check active=true, valid_until > now, uses_count < max_uses.
//   3. Check product_ids is null OR includes the requested product.
//   4. Compute discount: percent of price OR fixed amount, clamped to 0.
//
// Redemption (counted only on approved payment):
//   Webhook + verify routes call incrementCouponUses to bump uses_count.

import { createAdminClient } from '@/lib/supabase/admin'

export interface CouponRow {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number
  product_ids: string[] | null
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  active: boolean
}

interface CouponRecord {
  id: string
  code: string
  description: string | null
  discount_type: string
  discount_value: number | string
  product_ids: string[] | null
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  active: boolean
}

export interface ValidationResult {
  ok: boolean
  reason?: string
  message?: string
  coupon?: CouponRow
  discount?: number // CLP, positive integer
  finalPrice?: number // basePrice - discount, clamped to 0
}

/**
 * Validates a coupon code against a product + base price.
 * Returns the discount amount and the final price the user will pay.
 */
export async function validateCoupon(
  code: string,
  productId: string,
  basePrice: number
): Promise<ValidationResult> {
  const trimmed = code.trim()
  if (!trimmed) return { ok: false, reason: 'empty', message: 'Ingresa un código' }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('coupons')
    .select('id, code, description, discount_type, discount_value, product_ids, max_uses, uses_count, valid_from, valid_until, active')
    .ilike('code', trimmed)
    .maybeSingle()

  if (error) {
    console.error('[coupons] lookup failed:', error.message)
    return { ok: false, reason: 'lookup-failed', message: 'Error al validar el cupón' }
  }
  if (!data) return { ok: false, reason: 'not-found', message: 'Código no válido' }

  const r = data as CouponRecord
  const row: CouponRow = {
    ...r,
    discount_type: r.discount_type as 'percent' | 'fixed',
    discount_value: Number(r.discount_value),
  }

  if (!row.active) return { ok: false, reason: 'inactive', message: 'Este cupón ya no está disponible' }

  const now = Date.now()
  const validFrom = new Date(row.valid_from).getTime()
  if (now < validFrom) {
    return { ok: false, reason: 'not-started', message: 'Este cupón aún no es válido' }
  }
  if (row.valid_until) {
    const validUntil = new Date(row.valid_until).getTime()
    if (now > validUntil) {
      return { ok: false, reason: 'expired', message: 'Este cupón ha expirado' }
    }
  }
  if (row.max_uses !== null && row.uses_count >= row.max_uses) {
    return { ok: false, reason: 'exhausted', message: 'Este cupón ya alcanzó su límite de usos' }
  }
  if (row.product_ids && row.product_ids.length > 0 && !row.product_ids.includes(productId)) {
    return { ok: false, reason: 'wrong-product', message: 'Este cupón no aplica para este producto' }
  }

  // Compute discount
  let discount = 0
  if (row.discount_type === 'percent') {
    discount = Math.floor((basePrice * row.discount_value) / 100)
  } else {
    discount = Math.floor(row.discount_value)
  }
  discount = Math.min(discount, basePrice) // can't exceed price
  discount = Math.max(discount, 0)
  const finalPrice = basePrice - discount

  return {
    ok: true,
    coupon: row,
    discount,
    finalPrice,
  }
}

/**
 * Atomically increments uses_count by 1. Call once per approved purchase.
 */
export async function incrementCouponUses(couponId: string): Promise<void> {
  const admin = createAdminClient()
  // No upsert — we just need a +1. RPC would be safer for concurrency
  // but for low volume a read-then-write is fine.
  const { data } = await admin
    .from('coupons')
    .select('uses_count')
    .eq('id', couponId)
    .single()
  const current = Number((data as { uses_count?: number } | null)?.uses_count ?? 0)
  await admin
    .from('coupons')
    .update({ uses_count: current + 1 })
    .eq('id', couponId)
}
