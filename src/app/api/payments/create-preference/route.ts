export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCourse } from '@/lib/courses'
import { hasAccessToCourse } from '@/lib/access'
import { createPreference } from '@/lib/mercadopago'

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000

export async function POST(req: NextRequest) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Parse body
  let body: { courseId?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const courseId = body?.courseId
  if (!courseId) {
    return NextResponse.json({ error: 'courseId is required' }, { status: 400 })
  }

  const course = getCourse(courseId)
  if (!course) {
    return NextResponse.json({ error: 'Unknown course' }, { status: 400 })
  }

  // 3. Block if user already has access
  if (await hasAccessToCourse(supabase, user, courseId)) {
    return NextResponse.json(
      { error: 'already-owned', message: 'Ya tienes acceso a este curso' },
      { status: 409 }
    )
  }

  const admin = createAdminClient()

  // 4. Idempotency: reuse a pending preference if it's < 24h old
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

  // 5. Insert pending row first so we have the UUID for external_reference
  const { data: inserted, error: insertError } = await admin
    .from('course_purchases')
    .insert({
      user_id: user.id,
      course_id: courseId,
      status: 'pending',
      amount: course.price,
      currency: course.currency,
    })
    .select('id')
    .single()

  if (insertError || !inserted) {
    console.error('[create-preference] insert failed:', insertError?.message)
    return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 })
  }

  // 6. Create preference with MercadoPago
  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`

  try {
    const result = await createPreference({
      courseId: course.id,
      courseTitle: course.title,
      externalReference: inserted.id,
      userEmail: user.email ?? 'unknown@vascularplanning.com',
      amount: course.price,
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
  } catch (err) {
    console.error('[create-preference] MP failure:', err)
    // Mark the row as rejected so it doesn't block future attempts
    await admin
      .from('course_purchases')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', inserted.id)
    return NextResponse.json(
      { error: 'mercadopago-failure', message: err instanceof Error ? err.message : 'Unknown error' },
      { status: 502 }
    )
  }
}
