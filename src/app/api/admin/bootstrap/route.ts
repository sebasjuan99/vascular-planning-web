export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ADMIN_EMAIL = 'sebastian@gprevive.com'

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const secret = req.headers.get('x-admin-secret')
  if (!adminSecret || !secret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const user = data.users.find((u) => u.email === ADMIN_EMAIL)
  if (!user) {
    return NextResponse.json({ error: `User ${ADMIN_EMAIL} not found` }, { status: 404 })
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      role: 'admin',
      approved: true,
    },
  })

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({ ok: true, message: `${ADMIN_EMAIL} is now admin` })
}
