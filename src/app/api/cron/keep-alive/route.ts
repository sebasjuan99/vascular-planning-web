export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Keeps the Supabase project active by performing a lightweight query.
// Triggered by Vercel Cron daily — see vercel.json
export async function GET() {
  try {
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      casesCount: count,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
