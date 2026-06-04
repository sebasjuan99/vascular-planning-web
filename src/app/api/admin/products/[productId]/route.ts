export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { invalidateProductCache } from '@/lib/products'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return null
  return user
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { price?: number; active?: boolean }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const update: Record<string, unknown> = {
    updated_by: admin.id,
    updated_at: new Date().toISOString(),
  }
  if (typeof body.price === 'number' && body.price >= 0) {
    update.price = body.price
  }
  if (typeof body.active === 'boolean') {
    update.active = body.active
  }
  if (Object.keys(update).length === 2) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const supabaseAdmin = createAdminClient()
  // Upsert in case the product row doesn't exist yet
  const { error } = await supabaseAdmin
    .from('products')
    .upsert({ id: params.productId, ...update }, { onConflict: 'id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  invalidateProductCache()
  return NextResponse.json({ ok: true })
}
