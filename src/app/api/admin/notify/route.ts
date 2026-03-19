export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendAdminNotification } from '@/lib/resend'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  if (body.userId !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    await sendAdminNotification(body)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Failed to send admin notification:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
