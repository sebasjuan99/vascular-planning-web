// Course access logic.
//
// A user has access to a course if EITHER:
//   (a) There's a row in course_purchases with status='approved' for that course, OR
//   (b) The admin has granted it via user_metadata.courses[] in Supabase Auth.
//
// (b) preserves backward compatibility with the admin panel's existing
// "Cursos" tab which writes to user_metadata.

import type { SupabaseClient, User } from '@supabase/supabase-js'

export type AccessSource = 'purchase' | 'admin'

export interface CourseAccess {
  courseId: string
  source: AccessSource
  approvedAt: string | null
}

/**
 * Returns all courses the given user has access to, combining purchases
 * and admin grants. The user object is what supabase.auth.getUser() returns.
 */
export async function getUserCourseAccess(
  supabase: SupabaseClient,
  user: User
): Promise<CourseAccess[]> {
  const adminCourses: string[] = Array.isArray(user.user_metadata?.courses)
    ? user.user_metadata.courses
    : []

  // Fetch approved purchases for this user (RLS already filters by user_id)
  const { data, error } = await supabase
    .from('course_purchases')
    .select('course_id, approved_at')
    .eq('status', 'approved')

  if (error) {
    console.error('[access] Failed to load course_purchases:', error.message)
    // Fall through with empty purchases - admin grants still work
  }

  const purchases = data ?? []
  const purchaseMap = new Map(purchases.map((p) => [p.course_id, p.approved_at]))

  // Merge: prefer 'purchase' source when both exist
  const seen = new Set<string>()
  const result: CourseAccess[] = []

  for (const p of purchases) {
    if (seen.has(p.course_id)) continue
    seen.add(p.course_id)
    result.push({
      courseId: p.course_id,
      source: 'purchase',
      approvedAt: p.approved_at,
    })
  }

  for (const courseId of adminCourses) {
    if (seen.has(courseId)) continue
    seen.add(courseId)
    result.push({
      courseId,
      source: 'admin',
      approvedAt: null,
    })
  }

  return result
}

/**
 * Convenience: does this user have access to a specific course?
 */
export async function hasAccessToCourse(
  supabase: SupabaseClient,
  user: User,
  courseId: string
): Promise<boolean> {
  const adminCourses: string[] = Array.isArray(user.user_metadata?.courses)
    ? user.user_metadata.courses
    : []
  if (adminCourses.includes(courseId)) return true

  const { data, error } = await supabase
    .from('course_purchases')
    .select('id')
    .eq('status', 'approved')
    .eq('course_id', courseId)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[access] hasAccessToCourse query failed:', error.message)
    return false
  }
  return data != null
}
