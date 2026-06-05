'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CreditCard, Loader2, Repeat } from 'lucide-react'

interface Props {
  productId: string
  productTitle: string
  priceLabel: string
  frequencyLabel: string  // e.g. "/mes" or "/año"
  hasActiveSubscription: boolean
  ownsLegacy?: boolean    // if user already has access via legacy purchase
}

export default function SubscriptionCardActions({
  productId,
  productTitle,
  priceLabel,
  frequencyLabel,
  hasActiveSubscription,
  ownsLegacy,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubscribe() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === 'already-subscribed') {
          window.location.href = '/dashboard/suscripciones'
          return
        }
        throw new Error(data?.message || data?.error || 'Error al iniciar suscripción')
      }
      if (!data.initPoint) throw new Error('No se recibió la URL de pago')
      window.location.href = data.initPoint
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  if (hasActiveSubscription) {
    return (
      <Link
        href="/dashboard/suscripciones"
        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        Ver mi suscripción
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  if (ownsLegacy) {
    return (
      <Link
        href={`/dashboard/cursos/${productId}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        title="Tienes acceso de por vida desde una compra anterior"
      >
        Acceder
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0058bc] hover:bg-[#004493] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Conectando con MercadoPago...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Suscribirse {priceLabel} CLP{frequencyLabel}
          </>
        )}
      </button>
      <p className="text-[11px] text-slate-500 inline-flex items-center gap-1 justify-center">
        <Repeat className="w-3 h-3" />
        Cobro recurrente. Puedes cancelar cuando quieras.
      </p>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
