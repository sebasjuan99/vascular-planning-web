export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/courses'

/**
 * Manually grants a course to a user (e.g. paid by bank transfer).
 *
 * Creates an approved course_purchases row with:
 *   - status='approved'
 *   - granted_manually=true
 *   - manual_grant_notes=<reason>
 *   - granted_by=<admin id>
 *   - amount=0  (no money flowed through MP)
 *
 * Also grants any modules tied to the product (e.g. EVAR+FEVAR for
 * 'acceso-calculadoras').
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { userId?: string; courseId?: string; notes?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { userId, courseId, notes } = body
  if (!userId || !courseId) {
    return NextResponse.json({ error: 'userId y courseId requeridos' }, { status: 400 })
  }

  const course = getCourse(courseId)
  if (!course) return NextResponse.json({ error: 'Unknown course' }, { status: 400 })

  const admin = createAdminClient()

  // Verify the target user exists
  const { data: targetData, error: targetErr } = await admin.auth.admin.getUserById(userId)
  if (targetErr || !targetData?.user) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
  }

  // Skip if there's already an approved row for this user+course
  const { data: existing } = await admin
    .from('course_purchases')
    .select('id, status')
    .eq('user_id', userId)
    .eq('course_id', courseId)
    .eq('status', 'approved')
    .limit(1)
    .maybeSingle()

  if (existing) {
    return NextResponse.json(
      { error: 'already-granted', message: 'Este usuario ya tiene acceso al producto.' },
      { status: 409 }
    )
  }

  const now = new Date().toISOString()
  const { error: insertError } = await admin.from('course_purchases').insert({
    user_id: userId,
    course_id: courseId,
    status: 'approved',
    amount: 0,
    currency: course.currency,
    granted_manually: true,
    manual_grant_notes: notes ?? null,
    granted_by: user.id,
    approved_at: now,
    updated_at: now,
  })

  if (insertError) {
    console.error('[manual-grant] insert failed:', insertError.message)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  // Grant modules if applicable
  const grants = course.grantsModules ?? []
  if (grants.length > 0) {
    const currentMeta = targetData.user.user_metadata ?? {}
    const currentModules: string[] = Array.isArray(currentMeta.modules)
      ? currentMeta.modules
      : []
    const merged = Array.from(new Set([...currentModules, ...grants]))
    if (merged.length !== currentModules.length) {
      await admin.auth.admin.updateUserById(userId, {
        user_metadata: { ...currentMeta, modules: merged },
      })
    }
  }

  return NextResponse.json({ ok: true })
}
