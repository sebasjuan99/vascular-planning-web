// MercadoPago Checkout Pro integration (server-only)
//
// NEVER import this from a client component — it uses the server-side
// access token. The token is loaded lazily so the module can be
// imported in environments that don't have it (e.g. type-only imports).

import { MercadoPagoConfig, Preference, Payment } from 'mercadopago'
import { createHmac, timingSafeEqual } from 'crypto'
import type { NextRequest } from 'next/server'

function getConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN
  if (!accessToken) {
    throw new Error('MERCADOPAGO_ACCESS_TOKEN is not set')
  }
  return new MercadoPagoConfig({ accessToken, options: { timeout: 8000 } })
}

interface CreatePreferenceInput {
  courseId: string
  courseTitle: string
  externalReference: string // course_purchases.id (UUID)
  userEmail: string
  amount: number
  currency: 'CLP'
  appUrl: string // e.g. https://vascularplanning.com
}

export interface CreatePreferenceResult {
  preferenceId: string
  initPoint: string
}

export async function createPreference(
  input: CreatePreferenceInput
): Promise<CreatePreferenceResult> {
  const config = getConfig()
  const preference = new Preference(config)

  const result = await preference.create({
    body: {
      items: [
        {
          id: input.courseId,
          title: input.courseTitle,
          description: 'Curso de formación clínica - Vascular Planning',
          category_id: 'learnings',
          quantity: 1,
          unit_price: input.amount,
          currency_id: input.currency,
        },
      ],
      payer: {
        email: input.userEmail,
      },
      back_urls: {
        success: `${input.appUrl}/pago/success`,
        pending: `${input.appUrl}/pago/pending`,
        failure: `${input.appUrl}/pago/failure`,
      },
      auto_return: 'approved',
      notification_url: `${input.appUrl}/api/payments/webhook`,
      external_reference: input.externalReference,
      metadata: {
        course_id: input.courseId,
        purchase_id: input.externalReference,
      },
      statement_descriptor: 'VASCULARPLAN',
    },
  })

  if (!result.id || !result.init_point) {
    throw new Error('MercadoPago did not return preference id or init_point')
  }

  return {
    preferenceId: String(result.id),
    initPoint: result.init_point,
  }
}

/**
 * Verifies the x-signature header sent by MercadoPago.
 * Reference: https://www.mercadopago.com.ar/developers/en/docs/your-integrations/notifications/webhooks
 *
 * Canonical template: id:<data.id>;request-id:<x-request-id>;ts:<ts>;
 *
 * In development (no MERCADOPAGO_WEBHOOK_SECRET configured) returns true so
 * local testing works without ngrok. Set the secret in production.
 */
export function verifyWebhookSignature(
  req: NextRequest,
  dataId: string
): { ok: true } | { ok: false; reason: string } {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET

  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, reason: 'webhook-secret-not-configured' }
    }
    // Dev mode: skip verification but log
    console.warn('[mercadopago] WEBHOOK_SECRET not set, skipping verification (dev only)')
    return { ok: true }
  }

  const signatureHeader = req.headers.get('x-signature')
  const requestId = req.headers.get('x-request-id')

  if (!signatureHeader || !requestId) {
    return { ok: false, reason: 'missing-signature-headers' }
  }

  // Parse "ts=...,v1=..." into a map
  const parts = Object.fromEntries(
    signatureHeader.split(',').map((p) => {
      const [k, ...rest] = p.split('=')
      return [k.trim(), rest.join('=').trim()]
    })
  )

  const ts = parts['ts']
  const v1 = parts['v1']

  if (!ts || !v1) {
    return { ok: false, reason: 'malformed-signature' }
  }

  // Replay protection: reject if ts > 5 minutes old
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

/**
 * Calls MP REST API to get authoritative payment details.
 * Use this in the webhook to confirm the payment state, never trust
 * the webhook body alone.
 */
export interface MPPaymentDetails {
  id: string
  status: 'approved' | 'pending' | 'in_process' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back'
  externalReference: string | null
  preferenceId: string | null
  amount: number | null
  currency: string | null
}

export async function fetchPayment(paymentId: string): Promise<MPPaymentDetails> {
  const config = getConfig()
  const payment = new Payment(config)
  const result = await payment.get({ id: paymentId })

  return {
    id: String(result.id),
    status: (result.status ?? 'pending') as MPPaymentDetails['status'],
    externalReference: result.external_reference ?? null,
    preferenceId: (result as { preference_id?: string }).preference_id ?? null,
    amount: result.transaction_amount ?? null,
    currency: result.currency_id ?? null,
  }
}

/**
 * Maps MP payment status → our DB status enum.
 * MP statuses we collapse:
 *   approved, charged_back  -> approved (charged_back only matters for refunds we don't handle here)
 *   pending, in_process     -> pending
 *   rejected, cancelled     -> rejected
 *   refunded                -> refunded
 */
export function mpStatusToDb(
  status: MPPaymentDetails['status']
): 'pending' | 'approved' | 'rejected' | 'refunded' {
  switch (status) {
    case 'approved':
      return 'approved'
    case 'pending':
    case 'in_process':
      return 'pending'
    case 'refunded':
    case 'charged_back':
      return 'refunded'
    case 'rejected':
    case 'cancelled':
    default:
      return 'rejected'
  }
}
