export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return null
  return user
}

export async function GET() {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ coupons: data ?? [] })
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: {
    code?: string
    description?: string
    discount_type?: 'percent' | 'fixed'
    discount_value?: number
    product_ids?: string[] | null
    max_uses?: number | null
    valid_until?: string | null
    active?: boolean
  }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const code = (body.code || '').trim()
  if (!code) return NextResponse.json({ error: 'code requerido' }, { status: 400 })
  if (!body.discount_type || !['percent', 'fixed'].includes(body.discount_type)) {
    return NextResponse.json({ error: 'discount_type debe ser percent o fixed' }, { status: 400 })
  }
  const value = Number(body.discount_value)
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: 'discount_value debe ser > 0' }, { status: 400 })
  }
  if (body.discount_type === 'percent' && value > 100) {
    return NextResponse.json({ error: 'percent no puede exceder 100' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from('coupons')
    .insert({
      code,
      description: body.description ?? null,
      discount_type: body.discount_type,
      discount_value: value,
      product_ids: body.product_ids && body.product_ids.length > 0 ? body.product_ids : null,
      max_uses: body.max_uses ?? null,
      valid_until: body.valid_until ?? null,
      active: body.active ?? true,
      created_by: admin.id,
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: 'Ya existe un cupón con ese código' }, { status: 409 })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ coupon: data })
}
