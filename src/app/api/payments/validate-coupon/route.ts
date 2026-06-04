export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validateCoupon } from '@/lib/coupons'
import { getCourse } from '@/lib/courses'
import { getProductPrice } from '@/lib/products'

/**
 * Lets the dashboard try a coupon code before clicking "Pagar".
 * Returns the discount preview without creating a preference yet.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { code?: string; courseId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = (body.code || '').trim()
  const courseId = body.courseId
  if (!code || !courseId) {
    return NextResponse.json({ error: 'code y courseId requeridos' }, { status: 400 })
  }

  const course = getCourse(courseId)
  if (!course) {
    return NextResponse.json({ error: 'Unknown course' }, { status: 400 })
  }

  const basePrice = await getProductPrice(courseId)
  const result = await validateCoupon(code, courseId, basePrice)

  if (!result.ok) {
    return NextResponse.json({
      ok: false,
      reason: result.reason,
      message: result.message ?? 'Cupón no válido',
    })
  }

  return NextResponse.json({
    ok: true,
    couponCode: result.coupon!.code,
    discount: result.discount,
    finalPrice: result.finalPrice,
    basePrice,
    discountType: result.coupon!.discount_type,
    discountValue: result.coupon!.discount_value,
  })
}
