'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CreditCard, Loader2, Lock } from 'lucide-react'

interface ToolCardProps {
  type: 'evar' | 'fevar'
  href: string
  hasAccess?: boolean
  /** Course id whose purchase grants this module (e.g. 'acceso-calculadoras') */
  unlockCourseId?: string
  /** Formatted price label, e.g. "$50.000 CLP" */
  unlockPriceLabel?: string
}

const config = {
  evar: {
    title: 'EVAR',
    subtitle: 'Reparación Endovascular de Aneurisma',
    description: 'Planificación de endoprótesis aórticas bifurcadas. Configura diámetros, longitudes y posicionamiento con visualización en tiempo real.',
    gradient: 'from-[#0058bc]/5 to-transparent',
    borderHover: 'hover:border-[#0058bc]/30',
    badgeBg: 'bg-[#0058bc]/10',
    badgeText: 'text-[#0058bc]',
    btnClass: 'clinical-gradient',
  },
  fevar: {
    title: 'FEVAR',
    subtitle: 'EVAR Fenestrada',
    description: 'Planificación de endoprótesis fenestradas para casos complejos. Posiciona fenestraciones y ramas con precisión anatómica.',
    gradient: 'from-blue-500/5 to-transparent',
    borderHover: 'hover:border-blue-500/30',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-600',
    btnClass: 'bg-blue-600 hover:bg-blue-700',
  }
}

export default function ToolCard({
  type,
  href,
  hasAccess = false,
  unlockCourseId,
  unlockPriceLabel,
}: ToolCardProps) {
  const c = config[type]
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleBuy() {
    if (!unlockCourseId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/payments/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: unlockCourseId }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data?.error === 'already-owned') {
          // Edge case: server says we already have it — refresh to reflect
          router.refresh()
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

  return (
    <div className={`bg-white rounded-xl shadow-apple overflow-hidden border border-slate-100 ${c.borderHover} transition-all flex flex-col`}>
      <div className={`h-2 bg-gradient-to-r ${c.gradient}`} />
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className={`w-12 h-12 rounded-xl ${c.badgeBg} flex items-center justify-center`}>
          <span className={`text-xs font-black ${c.badgeText}`}>{c.title}</span>
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{c.title}</h3>
          <p className={`text-xs font-semibold uppercase tracking-wide ${c.badgeText} mb-2`}>{c.subtitle}</p>
          <p className="text-sm text-slate-500 leading-relaxed">{c.description}</p>
        </div>

        {hasAccess ? (
          <Link
            href={href}
            className={`mt-auto ${c.btnClass} text-white text-sm font-semibold py-3 px-5 rounded-full text-center transition-all hover:shadow-lg flex items-center justify-center gap-2`}
          >
            Iniciar {c.title}
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : unlockCourseId && unlockPriceLabel ? (
          <div className="mt-auto flex flex-col gap-2">
            <button
              type="button"
              onClick={handleBuy}
              disabled={loading}
              className={`${c.btnClass} disabled:opacity-60 text-white text-sm font-semibold py-3 px-5 rounded-full text-center transition-all hover:shadow-lg flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando con MercadoPago...
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  Pagar {unlockPriceLabel}
                </>
              )}
            </button>
            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="mt-auto bg-slate-100 text-slate-500 text-sm font-semibold py-3 px-5 rounded-full text-center flex items-center justify-center gap-2">
            <Lock className="w-4 h-4" />
            Sin Acceso
          </div>
        )}
      </div>
    </div>
  )
}
