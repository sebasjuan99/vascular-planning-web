import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendApprovalEmail } from '@/lib/resend'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export async function POST(req: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const secret = req.headers.get('x-admin-secret')
  if (!adminSecret || !secret || secret !== adminSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { userId } = await req.json()
  if (!userId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 })
  }

  const { data: userData, error: fetchError } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (fetchError || !userData.user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...userData.user.user_metadata,
      approved: true,
      approved_at: new Date().toISOString(),
    }
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const email = userData.user.email!
  const name = userData.user.user_metadata?.full_name || 'Doctor'
  await sendApprovalEmail(email, name)

  return NextResponse.json({ ok: true })
}
