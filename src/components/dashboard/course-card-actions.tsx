'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CreditCard, Loader2 } from 'lucide-react'

interface Props {
  courseId: string
  courseTitle: string
  priceLabel: string
  hasAccess: boolean
  accessSource?: 'purchase' | 'admin'
}

export default function CourseCardActions({
  courseId,
  courseTitle,
  priceLabel,
  hasAccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === 'already-owned') {
          window.location.href = `/dashboard/cursos/${courseId}`
          return
        }
        throw new Error(data?.message || data?.error || 'Error al crear el pago')
      }
      if (!data.initPoint) throw new Error('No se recibió la URL de pago')
      window.location.href = data.initPoint
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      setLoading(false)
    }
  }

  if (hasAccess) {
    return (
      <Link
        href={`/dashboard/cursos/${courseId}`}
        className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        aria-label={`Acceder al curso ${courseTitle}`}
      >
        Acceder al curso
        <ArrowRight className="w-4 h-4" />
      </Link>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#0058bc] hover:bg-[#004493] disabled:opacity-60 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
        aria-label={`Pagar curso ${courseTitle}`}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Conectando con MercadoPago...
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            Pagar {priceLabel}
          </>
        )}
      </button>
      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
