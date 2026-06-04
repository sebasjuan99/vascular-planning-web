export const dynamic = 'force-dynamic'
import { NextRequest, NextResponse } from 'next/server'
import { dispatchMpWebhook } from '@/lib/webhook-dispatcher'

/**
 * Unified MercadoPago webhook endpoint.
 *
 * Handles ALL MP topics (payment + subscription_preapproval +
 * subscription_authorized_payment) so the user only needs ONE
 * notification URL configured in MP. Routing happens in
 * dispatchMpWebhook based on the body.type.
 *
 * The URL is kept as /api/payments/webhook for backwards compatibility
 * with the existing MP configuration. /api/subscriptions/webhook is
 * an alias that does the exact same thing.
 */
export async function POST(req: NextRequest) {
  return dispatchMpWebhook(req)
}

// Some MP integrations send GETs during webhook validation. Return 200
// so the URL is recognized as live.
export async function GET() {
  return NextResponse.json({ ok: true, message: 'MercadoPago webhook endpoint' })
}
