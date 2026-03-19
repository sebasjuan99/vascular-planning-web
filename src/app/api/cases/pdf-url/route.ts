import { NextRequest, NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'

function getSupabaseAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export async function GET(req: NextRequest) {
  const supabaseAdmin = getSupabaseAdmin()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const caseId = req.nextUrl.searchParams.get('id')
  if (!caseId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { data: caso } = await supabase
    .from('cases').select('pdf_url').eq('id', caseId).eq('user_id', user.id).single()

  if (!caso?.pdf_url) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const path = caso.pdf_url.split('/case-pdfs/')[1]
  const { data, error } = await supabaseAdmin.storage
    .from('case-pdfs').createSignedUrl(path, 3600)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.redirect(data.signedUrl)
}
