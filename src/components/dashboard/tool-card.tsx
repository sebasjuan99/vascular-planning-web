'use client'

import Link from 'next/link'
import { ChevronRight, CreditCard, Lock, Repeat } from 'lucide-react'

interface ToolCardProps {
  type: 'evar' | 'fevar'
  href: string
  hasAccess?: boolean
  /** Where to send the user to subscribe when they don't have access. */
  subscribeHref?: string
  /** Optional label shown next to the subscribe CTA (e.g. "desde $50.000/mes") */
  subscribeFromLabel?: string
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
  subscribeHref,
  subscribeFromLabel,
}: ToolCardProps) {
  const c = config[type]

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
        ) : subscribeHref ? (
          <div className="mt-auto flex flex-col gap-2">
            <Link
              href={subscribeHref}
              className={`${c.btnClass} text-white text-sm font-semibold py-3 px-5 rounded-full text-center transition-all hover:shadow-lg flex items-center justify-center gap-2`}
            >
              <CreditCard className="w-4 h-4" />
              {subscribeFromLabel ? `Suscríbete ${subscribeFromLabel}` : 'Suscríbete para desbloquear'}
            </Link>
            <p className="text-[11px] text-slate-500 inline-flex items-center gap-1 justify-center">
              <Repeat className="w-3 h-3" />
              Cobro recurrente. Cancela cuando quieras.
            </p>
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
