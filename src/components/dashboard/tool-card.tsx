'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, X, Lock } from 'lucide-react'

interface ToolCardProps {
  type: 'evar' | 'fevar'
  href: string
  hasAccess?: boolean
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

export default function ToolCard({ type, href, hasAccess = false }: ToolCardProps) {
  const [showPopup, setShowPopup] = useState(false)
  const router = useRouter()
  const c = config[type]

  const handleClick = () => {
    if (hasAccess) {
      router.push(href)
    } else {
      setShowPopup(true)
    }
  }

  return (
    <>
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
          <button
            onClick={handleClick}
            className={`mt-auto ${hasAccess ? c.btnClass : 'bg-slate-400'} text-white text-sm font-semibold py-3 px-5 rounded-full text-center transition-all hover:shadow-lg flex items-center justify-center gap-2`}
          >
            {hasAccess ? `Iniciar ${c.title}` : 'Sin Acceso'}
            {hasAccess ? <ChevronRight className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center relative">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-[#0058bc]/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-[#0058bc]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Acceso Restringido
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              No tienes acceso a esta herramienta. Contacta a tu administrador para solicitar acceso.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="clinical-gradient text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
