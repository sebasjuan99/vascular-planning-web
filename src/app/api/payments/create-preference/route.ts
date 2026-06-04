export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourse } from '@/lib/courses'
import { hasAccessToCourse } from '@/lib/access'
import { createPreference } from '@/lib/mercadopago'
import { getProductRow } from '@/lib/products'
import { validateCoupon } from '@/lib/coupons'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: { courseId?: string; couponCode?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const courseId = body?.courseId
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }
  const couponCode = (body?.couponCode ?? '').trim()

  const course = getCourse(courseId)
  if (!course) {
    return NextResponse.json({ error: 'Unknown course' }, { status: 400 })
  }

  // Read current price + active flag from DB. Falls back to course.price
  // if the row doesn't exist (shouldn't after migration 005).
  const productRow = await getProductRow(courseId)
  const currentPrice = productRow?.price ?? course.price
  const isActive = productRow?.active ?? true
  if (!isActive) {
    return NextResponse.json(
      { error: 'product-inactive', message: 'Este producto no está disponible actualmente.' },
      { status: 410 }
    )
  }

  // 3. Block if user already has access
  if (await hasAccessToCourse(supabase, user, courseId)) {
    return NextResponse.json(
      { error: 'already-owned', message: 'Ya tienes acceso a este curso' },
      { status: 409 }
    )
  }

  // 3b. Apply coupon if provided (server-side re-validation, never trust client)
  let appliedCouponId: string | null = null
  let discountAmount = 0
  let finalPrice = currentPrice
  if (couponCode) {
    const cv = await validateCoupon(couponCode, courseId, currentPrice)
    if (!cv.ok) {
      return NextResponse.json(
        { error: 'invalid-coupon', message: cv.message ?? 'Cupón no válido' },
        { status: 400 }
      )
    }
    appliedCouponId = cv.coupon!.id
    discountAmount = cv.discount ?? 0
    finalPrice = cv.finalPrice ?? currentPrice
  }

  // MercadoPago requires unit_price >= 500 CLP in Chile. If the coupon
  // takes the price below that floor, reject so we don't get an MP error.
  if (finalPrice > 0 && finalPrice < 500) {
    return NextResponse.json(
      { error: 'price-below-minimum', message: 'El precio con descuento es menor al mínimo permitido por MercadoPago (500 CLP).' },
      { status: 400 }
    )
  }
  // If coupon makes it free (100%), we can't create a $0 MP preference.
  // Instead, grant access directly and return a synthetic redirect URL.
  // Handled below by short-circuiting after inserting the purchase row.

  const admin = createAdminClient()

  // 4. Idempotency: reuse a pending preference if it's < 24h old.
  //    Skip when a coupon is in play — the user might be trying a different
  //    code and we don't want to reuse a preference with the old discount.
  if (!couponCode) {
    const cutoff = new Date(Date.now() - TWENTY_FOUR_HOURS_MS).toISOString()
    const { data: existing } = await admin
      .from('course_purchases')
      .select('id, mp_preference_id, mp_init_point, created_at')
      .eq('user_id', user.id)
      .eq('course_id', courseId)
      .eq('status', 'pending')
      .gte('created_at', cutoff)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existing?.mp_init_point) {
      return NextResponse.json({
        initPoint: existing.mp_init_point,
        preferenceId: existing.mp_preference_id,
        reused: true,
      })
    }
  }

  // 5. Insert pending row first so we have the UUID for external_reference
  const { data: inserted, error: insertError } = await admin
    .from('course_purchases')
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: 'pending',
      amount: finalPrice,
      currency: course.currency,
      coupon_id: appliedCouponId,
      discount_amount: discountAmount,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('[create-preference] insert failed:', insertError?.message)
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
  }

  // 5b. Fully-discounted purchase (100% off coupon): skip MercadoPago entirely,
  //     mark as approved + grant modules immediately, redirect to access page.
  if (finalPrice === 0) {
    const now = new Date().toISOString()
    await admin
      .from('course_purchases')
      .update({
        status: 'approved',
        approved_at: now,
        updated_at: now,
      })
      .eq('id', inserted.id)

    // Grant modules if applicable (same merge logic as webhook)
    const grants = course.grantsModules ?? []
    if (grants.length > 0) {
      try {
        const { data: userData } = await admin.auth.admin.getUserById(user.id)
        const currentMeta = userData?.user?.user_metadata ?? {}
        const currentModules: string[] = Array.isArray(currentMeta.modules)
          ? currentMeta.modules
          : []
        const merged = Array.from(new Set([...currentModules, ...grants]))
        if (merged.length !== currentModules.length) {
          await admin.auth.admin.updateUserById(user.id, {
            user_metadata: { ...currentMeta, modules: merged },
          })
        }
      } catch (err) {
        console.error('[create-preference] free-grant modules update failed:', err)
      }
    }

    // Increment coupon uses now (no webhook will fire to do it later)
    if (appliedCouponId) {
      const { data: cdata } = await admin
        .from('coupons').select('uses_count').eq('id', appliedCouponId).single()
      const c = cdata as { uses_count?: number } | null
      const used = Number(c?.uses_count ?? 0)
      await admin.from('coupons').update({ uses_count: used + 1 }).eq('id', appliedCouponId)
    }

    // The client treats `initPoint` as the redirect URL. Send it straight
    // to the access page.
    return NextResponse.json({
      initPoint: `/dashboard/cursos/${courseId}`,
      freeGrant: true,
    })
  }

  // 6. Build base URL for back_urls / notification_url
  // MercadoPago requires valid HTTPS URLs. We always derive from the
  // actual request host and force https, ignoring NEXT_PUBLIC_APP_URL
  // (which can be stale or contain a wrong value like localhost).
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.host
  const appUrl = `https://${host}`.replace(/\/+$/, '')

  try {
    const result = await createPreference({
      courseId: course.id,
      courseTitle: course.title,
      externalReference: inserted.id,
      userEmail: user.email ?? 'unknown@vascularplanning.com',
      amount: finalPrice,
      currency: course.currency,
      appUrl,
    })

    // 7. Save preference id + init_point back to the row
    await admin
      .from('course_purchases')
      .update({
        mp_preference_id: result.preferenceId,
        mp_init_point: result.initPoint,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inserted.id)

    return NextResponse.json({
      initPoint: result.initPoint,
      preferenceId: result.preferenceId,
      reused: false,
    })
  } catch (err: unknown) {
    // MercadoPago SDK throws objects with a non-standard shape — capture
    // everything useful so we can debug what they rejected.
    const errAny = err as {
      message?: string
      status?: number
      error?: string
      cause?: unknown
      response?: { data?: unknown }
    }
    const fullDetails = {
      message: errAny?.message,
      status: errAny?.status,
      error: errAny?.error,
      cause: errAny?.cause,
      responseData: errAny?.response?.data,
      stringified: (() => {
        try { return JSON.stringify(err) } catch { return String(err) }
      })(),
    }
    console.error('[create-preference] MP failure FULL:', JSON.stringify(fullDetails, null, 2))

    // Mark the row as rejected so it doesn't block future attempts
    await admin
      .from('course_purchases')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', inserted.id)

    // Build a human-friendly message for the UI
    const humanMsg =
      errAny?.message ||
      (typeof errAny?.cause === 'string' ? errAny.cause : undefined) ||
      'MercadoPago rechazó la solicitud. Revisa el access token y el país de la cuenta.'

    return NextResponse.json(
      {
        error: 'mercadopago-failure',
        message: humanMsg,
        debug: fullDetails, // Temporary: expose details to client for debugging
      },
      { status: 502 }
    )
  }
}
