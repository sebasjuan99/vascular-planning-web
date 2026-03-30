export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') {
    return null
  }
  return user
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = params
  const body = await req.json()
  const supabaseAdmin = createAdminClient()

  // Fetch current user to merge metadata
  const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (fetchError || !userData.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const currentMeta = userData.user.user_metadata || {}
  const updates: Record<string, unknown> = {}

  // Email update
  if (body.email && body.email !== userData.user.email) {
    updates.email = body.email
  }

  // Password update
  if (body.password) {
    updates.password = body.password
  }

  // Metadata updates (merge)
  const metaUpdates: Record<string, unknown> = { ...currentMeta }
  if (body.full_name !== undefined) metaUpdates.full_name = body.full_name
  if (body.specialty !== undefined) metaUpdates.specialty = body.specialty
  if (body.institution !== undefined) metaUpdates.institution = body.institution
  if (body.approved !== undefined) metaUpdates.approved = body.approved
  if (body.modules !== undefined) metaUpdates.modules = body.modules
  if (body.courses !== undefined) metaUpdates.courses = body.courses

  // Role change - prevent removing own admin role
  if (body.role !== undefined) {
    if (userId === admin.id && body.role !== 'admin') {
      return NextResponse.json({ error: 'Cannot remove your own admin role' }, { status: 400 })
    }
    metaUpdates.role = body.role
  }

  // Approval timestamp
  if (body.approved === true && !currentMeta.approved) {
    metaUpdates.approved_at = new Date().toISOString()
  }

  updates.user_metadata = metaUpdates

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { userId } = params

  // Prevent self-deletion
  if (userId === admin.id) {
    return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
