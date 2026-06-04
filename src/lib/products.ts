// Dynamic pricing & product activation, sourced from the `products` table
// in Supabase. Lookups are batched per request via a request-scoped cache.
//
// Hardcoded prices in src/lib/courses.ts are still used as fallback when
// a row doesn't exist (shouldn't happen after migration 005, but useful
// during local dev or rollback).

import { createAdminClient } from '@/lib/supabase/admin'
import { COURSES, COURSE_PRICE_CLP, type Course } from '@/lib/courses'

export interface ProductRow {
  id: string
  price: number
  currency: 'CLP'
  active: boolean
  updated_at: string
}

interface ProductRecord {
  id: string
  price: number | string
  currency: string
  active: boolean
  updated_at: string
}

// Per-request cache. In serverless this is fresh each invocation but
// avoids duplicate queries within a single render.
let cache: { fetchedAt: number; rows: Map<string, ProductRow> } | null = null
const CACHE_TTL_MS = 60_000 // 60 seconds

function getFallbackPrice(courseId: string): number {
  const c = COURSES.find((x) => x.id === courseId)
  return c?.price ?? COURSE_PRICE_CLP
}

/**
 * Loads all product rows from the DB, with a 60s in-memory cache to keep
 * repeated calls in the same instance fast.
 */
export async function getAllProductRows(): Promise<Map<string, ProductRow>> {
  if (cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.rows
  }

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('products')
    .select('id, price, currency, active, updated_at')

  if (error) {
    console.error('[products] DB read failed:', error.message)
    return new Map() // Empty → fallback to hardcoded prices
  }

  const rows = new Map<string, ProductRow>()
  for (const r of (data ?? []) as ProductRecord[]) {
    rows.set(r.id, {
      id: r.id,
      price: Number(r.price),
      currency: (r.currency || 'CLP') as 'CLP',
      active: !!r.active,
      updated_at: r.updated_at,
    })
  }

  cache = { fetchedAt: Date.now(), rows }
  return rows
}

/** Force-invalidate the cache; call after admin edits price/active. */
export function invalidateProductCache(): void {
  cache = null
}

export async function getProductRow(
  courseId: string
): Promise<ProductRow | null> {
  const rows = await getAllProductRows()
  return rows.get(courseId) ?? null
}

/**
 * Returns the price for a course, falling back to the hardcoded value
 * if no DB row exists.
 */
export async function getProductPrice(courseId: string): Promise<number> {
  const row = await getProductRow(courseId)
  return row?.price ?? getFallbackPrice(courseId)
}

/** Whether the product is currently for sale. Defaults to true. */
export async function isProductActive(courseId: string): Promise<boolean> {
  const row = await getProductRow(courseId)
  return row?.active ?? true
}

/**
 * Hydrates the static COURSES list with current DB pricing + active flag.
 * Filters by active = true when `onlyActive` is set, otherwise returns all.
 */
export interface HydratedCourse extends Course {
  active: boolean
}

export async function getHydratedCourses(
  opts: { onlyActive?: boolean } = {}
): Promise<HydratedCourse[]> {
  const rows = await getAllProductRows()
  const list: HydratedCourse[] = COURSES.map((c) => {
    const row = rows.get(c.id)
    return {
      ...c,
      price: row?.price ?? c.price,
      active: row?.active ?? true,
    }
  })
  if (opts.onlyActive) return list.filter((c) => c.active)
  return list
}
