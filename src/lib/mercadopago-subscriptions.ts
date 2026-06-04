// MercadoPago Preapproval (Subscriptions) API wrapper.
//
// We use the "simple subscription" model: POST /preapproval without a
// preapproval_plan_id and without card_token_id. MP returns an init_point
// where the user authorizes the card. After authorization, MP recurringly
// charges the card at the configured frequency and notifies us via webhook.
//
// Reference: https://www.mercadopago.com.cl/developers/en/reference/subscriptions

import type { NextRequest } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

const MP_API_BASE = 'https://api.mercadopago.com'

function getAccessToken(): string {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!token) throw new Error('MERCADOPAGO_ACCESS_TOKEN is not set')
  return token
}

export interface CreateSubscriptionInput {
  externalReference: string                // our subscriptions.id
  payerEmail: string
  reason: string                            // shown on MP checkout UI
  amount: number                            // CLP, no decimals
  currency: 'CLP'
  frequencyValue: number                    // 1
  frequencyType: 'months' | 'years' | 'days'
  startDateIso: string                      // ISO timestamp (now or future)
  backUrl: string                           // where MP sends the user back after auth
  notificationUrl: string                   // our webhook
  preapprovalPlanId?: string                // optional plan to associate
}

export interface MPPreapprovalResponse {
  id: string                                // preapproval id
  status: 'pending' | 'authorized' | 'paused' | 'cancelled'
  reason: string
  external_reference: string
  init_point: string                        // URL to redirect the user to
  auto_recurring: {
    frequency: number
    frequency_type: string
    transaction_amount: number
    currency_id: string
    start_date?: string
    end_date?: string
  }
  next_payment_date?: string
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<MPPreapprovalResponse> {
  // Minimal body: MP defaults status to 'pending' and infers start_date
  // when omitted. Sending too many fields can trigger Internal Server
  // Error in MP's CLP sandbox.
  const body: Record<string, unknown> = {
    reason: input.reason,
    external_reference: input.externalReference,
    payer_email: input.payerEmail,
    back_url: input.backUrl,
    auto_recurring: {
      frequency: input.frequencyValue,
      frequency_type: input.frequencyType,
      transaction_amount: input.amount,
      currency_id: input.currency,
      start_date: input.startDateIso,
    },
    notification_url: input.notificationUrl,
    // Do NOT send `status: 'pending'` — MP sandbox returns 500 if status
    // is present without card_token_id. Leave it for MP to default.
  }
  if (input.preapprovalPlanId) {
    body.preapproval_plan_id = input.preapprovalPlanId
  }

  const res = await fetch(`${MP_API_BASE}/preapproval`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errBody = await res.text()
    // Include the request body (with email masked) so we can debug what
    // MP rejected. The Error message gets returned to the client too.
    const debugBody = JSON.stringify({ ...body, payer_email: '<masked>' })
    throw new Error(
      `MP preapproval create failed (${res.status}): ${errBody.slice(0, 800)} | request=${debugBody.slice(0, 500)}`
    )
  }

  const data = (await res.json()) as MPPreapprovalResponse
  if (!data.id || !data.init_point) {
    throw new Error('MP returned no preapproval id or init_point')
  }
  return data
}

/** Fetches the authoritative subscription state. Use in webhook + verify. */
export async function getSubscription(
  preapprovalId: string
): Promise<MPPreapprovalResponse> {
  const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` },
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`MP preapproval get failed (${res.status}): ${errBody.slice(0, 500)}`)
  }
  return (await res.json()) as MPPreapprovalResponse
}

/** Pauses or cancels a subscription. MP doesn't distinguish "cancel at
 * period end" — we just mark `cancel_at_period_end=true` locally and
 * call this when current_period_end passes. For immediate cancel we
 * call this now. */
export async function updateSubscriptionStatus(
  preapprovalId: string,
  status: 'paused' | 'cancelled' | 'authorized'
): Promise<void> {
  const res = await fetch(`${MP_API_BASE}/preapproval/${preapprovalId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`MP preapproval update failed (${res.status}): ${errBody.slice(0, 500)}`)
  }
}

interface AuthorizedPaymentResponse {
  id: number | string
  preapproval_id: string
  status: string
  transaction_amount?: number
  currency_id?: string
  payment?: {
    id?: number | string
    status?: string
  }
  debit_date?: string
}

/** Fetches an authorized_payment (a single recurring charge). */
export async function getAuthorizedPayment(
  id: string
): Promise<AuthorizedPaymentResponse> {
  const res = await fetch(`${MP_API_BASE}/authorized_payments/${id}`, {
    headers: { 'Authorization': `Bearer ${getAccessToken()}` },
  })
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`MP authorized_payment get failed (${res.status}): ${errBody.slice(0, 500)}`)
  }
  return (await res.json()) as AuthorizedPaymentResponse
}

/**
 * Map MP subscription status → our DB enum.
 * MP uses: pending, authorized, paused, cancelled
 * We add 'expired' to mark subs whose end_date passed without renewal.
 */
export function mpSubStatusToDb(
  status: string
): 'pending' | 'authorized' | 'paused' | 'cancelled' | 'expired' {
  switch (status) {
    case 'authorized': return 'authorized'
    case 'paused': return 'paused'
    case 'cancelled': return 'cancelled'
    case 'pending':
    default: return 'pending'
  }
}

/**
 * Webhook signature verification (same template as Preference webhooks).
 * Subscription webhooks use the same x-signature scheme.
 */
export function verifySubscriptionSignature(
  req: NextRequest,
  dataId: string
): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'webhook-secret-not-configured' }
    }
    return { ok: true } // dev only
  }

  const signatureHeader = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')
  if (!signatureHeader || !requestId) {
    return { ok: false, reason: 'missing-signature-headers' }
  }

  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.split('=')
      return [k.trim(), rest.join('=').trim()]
    })
  )
  const ts = parts['ts']
  const v1 = parts['v1']
  if (!ts || !v1) return { ok: false, reason: 'malformed-signature' }

  const tsMs = Number(ts)
  if (Number.isNaN(tsMs) || Math.abs(Date.now() - tsMs) > 5 * 60 * 1000) {
    return { ok: false, reason: 'timestamp-out-of-window' }
  }

  const template = `id:${dataId};request-id:${requestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(template).digest('hex')
  try {
    const a = Buffer.from(expected, 'hex')
    const b = Buffer.from(v1, 'hex')
    if (a.length !== b.length) return { ok: false, reason: 'signature-length-mismatch' }
    if (!timingSafeEqual(a, b)) return { ok: false, reason: 'signature-mismatch' }
    return { ok: true }
  } catch {
    return { ok: false, reason: 'signature-comparison-error' }
  }
}
