export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { dispatchMpWebhook } from '@/lib/webhook-dispatcher'

/**
 * Alias for /api/payments/webhook. Both endpoints share the same
 * dispatcher so it doesn't matter which URL is configured in MP.
 * Useful if you ever want to separate the URLs again.
 */
export async function POST(req: NextRequest) {
  return dispatchMpWebhook(req)
}

export async function GET() {
  return NextResponse.json({ ok: true, message: 'MercadoPago subscription webhook endpoint' })
}
