export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { COURSES } from '@/lib/courses'

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
    .from('products')
    .select('id, price, currency, active, updated_at, updated_by')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Hydrate with static metadata (title, description, image, etc.)
  const dbMap = new Map((data ?? []).map((r) => [r.id, r]))
  const products = COURSES.map((c) => {
    const row = dbMap.get(c.id)
    return {
      id: c.id,
      title: c.title,
      shortTitle: c.shortTitle,
      category: c.category,
      price: row ? Number(row.price) : c.price,
      currency: (row?.currency || 'CLP') as 'CLP',
      active: row?.active ?? true,
      updated_at: row?.updated_at ?? null,
      hasDbRow: !!row,
    }
  })

  // Also include any DB rows that don't match a COURSE id (orphans)
  for (const r of data ?? []) {
    if (!COURSES.find((c) => c.id === r.id)) {
      products.push({
        id: r.id,
        title: r.id,
        shortTitle: r.id,
        category: 'Aorta',
        price: Number(r.price),
        currency: (r.currency || 'CLP') as 'CLP',
        active: r.active,
        updated_at: r.updated_at,
        hasDbRow: true,
      })
    }
  }

  return NextResponse.json({ products })
}
