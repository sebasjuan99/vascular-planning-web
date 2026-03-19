import Link from 'next/link'

interface ToolCardProps {
  type: 'evar' | 'fevar'
  href: string
}

const config = {
  evar: {
    title: 'EVAR',
    subtitle: 'Reparación Endovascular de Aneurisma',
    description: 'Planificación de endoprótesis aórticas bifurcadas. Configura diámetros, longitudes y posicionamiento con visualización en tiempo real.',
    barColor: 'from-vp-red to-red-400',
    btnColor: 'bg-vp-dark hover:bg-vp-dark/90',
    badgeBg: 'bg-red-50',
    badgeText: 'text-vp-red',
  },
  fevar: {
    title: 'FEVAR',
    subtitle: 'EVAR Fenestrada',
    description: 'Planificación de endoprótesis fenestradas para casos complejos. Posiciona fenestraciones y ramas con precisión anatómica.',
    barColor: 'from-vp-blue to-blue-500',
    btnColor: 'bg-vp-blue hover:bg-vp-blue/90',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-vp-blue',
  }
}

export default function ToolCard({ type, href }: ToolCardProps) {
  const c = config[type]
  return (
    <div className="bg-white border border-vp-border rounded-xl overflow-hidden flex flex-col relative">
      <div className={`h-1 bg-gradient-to-r ${c.barColor}`} />
      <div className="p-6 flex flex-col gap-4 flex-1">
        <div className={`w-11 h-11 rounded-xl ${c.badgeBg} flex items-center justify-center`}>
          <span className={`text-xs font-black ${c.badgeText}`}>{c.title}</span>
        </div>
        <div>
          <h3 className="text-lg font-black text-vp-dark">{c.title}</h3>
          <p className={`text-xs font-semibold uppercase tracking-wide ${c.badgeText} mb-2`}>{c.subtitle}</p>
          <p className="text-xs text-vp-muted leading-relaxed">{c.description}</p>
        </div>
        <Link href={href} className={`mt-auto ${c.btnColor} text-white text-sm font-bold py-2.5 px-4 rounded-lg text-center transition-colors`}>
          Iniciar {c.title} →
        </Link>
      </div>
    </div>
  )
}
