'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CreditCard, Loader2, Tag, Check } from 'lucide-react'
import { formatCLP } from '@/lib/courses'

interface Props {
  courseId: string
  courseTitle: string
  priceLabel: string
  hasAccess: boolean
  accessSource?: 'purchase' | 'admin'
}

interface ValidatedCoupon {
  code: string
  discount: number
  finalPrice: number
  basePrice: number
}

export default function CourseCardActions({
  courseId,
  courseTitle,
  priceLabel,
  hasAccess,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [couponInput, setCouponInput] = useState('')
  const [couponOpen, setCouponOpen] = useState(false)
  const [validating, setValidating] = useState(false)
  const [validCoupon, setValidCoupon] = useState<ValidatedCoupon | null>(null)
  const [couponError, setCouponError] = useState('')

  async function applyCoupon() {
    if (!couponInput.trim()) return
    setValidating(true)
    setCouponError('')
    setValidCoupon(null)
    try {
      const res = await fetch('/api/payments/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput.trim(), courseId }),
      })
      const data = await res.json()
      if (!res.ok || data?.ok === false) {
        setCouponError(data?.message || 'Cupón no válido')
        return
      }
      setValidCoupon({
        code: data.couponCode,
        discount: data.discount,
        finalPrice: data.finalPrice,
        basePrice: data.basePrice,
      })
    } finally {
      setValidating(false)
    }
  }

  function clearCoupon() {
    setValidCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  async function handlePay() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          couponCode: validCoupon?.code,
        }),
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

  const displayPrice = validCoupon ? formatCLP(validCoupon.finalPrice) : priceLabel

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
            {validCoupon && validCoupon.finalPrice === 0
              ? 'Obtener gratis'
              : `Pagar ${displayPrice}`}
          </>
        )}
      </button>

      {validCoupon && (
        <div className="flex items-center justify-between gap-2 text-xs bg-emerald-50 border border-emerald-100 rounded px-2 py-1.5">
          <span className="text-emerald-700 flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5" />
            Cupón <span className="font-mono font-semibold">{validCoupon.code}</span> aplicado
            <span className="text-emerald-600">-{formatCLP(validCoupon.discount)}</span>
          </span>
          <button onClick={clearCoupon} className="text-emerald-700 hover:text-emerald-900 underline">
            Quitar
          </button>
        </div>
      )}

      {!validCoupon && (
        <>
          {!couponOpen ? (
            <button
              type="button"
              onClick={() => setCouponOpen(true)}
              className="text-xs text-slate-500 hover:text-[#0058bc] inline-flex items-center gap-1 self-start"
            >
              <Tag className="w-3 h-3" />
              ¿Tienes un código de descuento?
            </button>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError('') }}
                  placeholder="CÓDIGO"
                  className="flex-1 px-2 py-1.5 text-xs font-mono border border-slate-300 rounded uppercase"
                />
                <button
                  type="button"
                  onClick={applyCoupon}
                  disabled={validating || !couponInput.trim()}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-50 rounded inline-flex items-center gap-1"
                >
                  {validating && <Loader2 className="w-3 h-3 animate-spin" />}
                  Aplicar
                </button>
              </div>
              {couponError && (
                <p className="text-xs text-red-600">{couponError}</p>
              )}
            </div>
          )}
        </>
      )}

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-2 py-1.5">
          {error}
        </p>
      )}
    </div>
  )
}
