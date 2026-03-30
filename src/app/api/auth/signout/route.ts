import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://vascularplanning.com'
  return NextResponse.redirect(new URL('/', origin), 303)
}
