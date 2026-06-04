export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourse } from '@/lib/courses'
import { getProductRow } from '@/lib/products'
import { createSubscription } from '@/lib/mercadopago-subscriptions'

/**
 * Creates a MercadoPago subscription (preapproval) and inserts a
 * pending row in our `subscriptions` table.
 *
 * Returns { initPoint } which the client uses to redirect the user
 * to MercadoPago for card authorization.
 *
 * Idempotency: if the user already has a pending or authorized
 * subscription for this product, we don't create a duplicate.
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { productId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const productId = body?.productId
  if (!productId) {
    return NextResponse.json({ error: 'productId required' }, { status: 400 })
  }

  const course = getCourse(productId)
  if (!course?.subscription) {
    return NextResponse.json(
      { error: 'not-subscription', message: 'Este producto no es una suscripción.' },
      { status: 400 }
    )
  }

  const productRow = await getProductRow(productId)
  const currentPrice = productRow?.price ?? course.price
  const isActive = productRow?.active ?? true
  if (!isActive) {
    return NextResponse.json(
      { error: 'product-inactive', message: 'Este producto no está disponible actualmente.' },
      { status: 410 }
    )
  }

  const admin = createAdminClient()

  // Block if already has authorized subscription for this product
  const { data: existing } = await admin
    .from('subscriptions')
    .select('id, status, init_point')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .in('status', ['authorized', 'pending'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing?.status === 'authorized') {
    return NextResponse.json(
      { error: 'already-subscribed', message: 'Ya tienes una suscripción activa a este producto.' },
      { status: 409 }
    )
  }
  if (existing?.status === 'pending' && existing.init_point) {
    // Reuse the still-pending checkout URL
    return NextResponse.json({ initPoint: existing.init_point, reused: true })
  }

  // 1. Insert pending row to get our local id (external_reference)
  const { data: inserted, error: insertError } = await admin
    .from('subscriptions')
    .insert({
      user_id: user.id,
      product_id: productId,
      status: 'pending',
      amount: currentPrice,
      currency: course.currency,
      frequency_value: course.subscription.frequencyValue,
      frequency_type: course.subscription.frequencyType,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('[subs/create] insert failed:', insertError?.message)
    return NextResponse.json({ error: 'Failed to record subscription' }, { status: 500 })
  }

  // 2. Build URLs for MP callback + webhook
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    req.nextUrl.host
  const appUrl = `https://${host}`.replace(/\/+$/, '')

  // 3. Call MP API to create the preapproval.
  //    MP rejects start_date if it's in the past, so we add a small buffer
  //    to account for network latency between our server and MP's API.
  try {
    const startDate = new Date(Date.now() + 2 * 60 * 1000).toISOString()
    const result = await createSubscription({
      externalReference: inserted.id,
      payerEmail: user.email ?? 'unknown@vascularplanning.com',
      reason: course.title,
      amount: currentPrice,
      currency: course.currency,
      frequencyValue: course.subscription.frequencyValue,
      frequencyType: course.subscription.frequencyType,
      startDateIso: startDate,
      backUrl: `${appUrl}/dashboard/suscripciones?return=1`,
      notificationUrl: `${appUrl}/api/subscriptions/webhook`,
      preapprovalPlanId: course.subscription.preapprovalPlanId,
    })

    // 4. Save MP ids + init_point back to row
    await admin
      .from('subscriptions')
      .update({
        mp_preapproval_id: result.id,
        mp_preapproval_plan_id: course.subscription.preapprovalPlanId ?? null,
        init_point: result.init_point,
        start_date: result.auto_recurring?.start_date ?? startDate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inserted.id)

    return NextResponse.json({
      initPoint: result.init_point,
      subscriptionId: inserted.id,
      mpPreapprovalId: result.id,
    })
  } catch (err: unknown) {
    const errAny = err as { message?: string; stack?: string }
    const message = errAny?.message || (err instanceof Error ? err.message : 'Unknown error')
    // Always dump the full MP error so we can debug subscription failures
    console.error('[subs/create] MP FULL ERROR:', JSON.stringify({
      message,
      stack: errAny?.stack?.slice(0, 1500),
      raw: (() => { try { return JSON.stringify(err) } catch { return String(err) } })(),
    }, null, 2))
    // Mark our row as cancelled so the user can retry cleanly
    await admin
      .from('subscriptions')
      .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
      .eq('id', inserted.id)
    return NextResponse.json(
      { error: 'mercadopago-failure', message },
      { status: 502 }
    )
  }
}
