import Link from 'next/link'

export default function InnovationLab() {
  return (
    <section className="py-24 px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#0058bc] mb-3">
              Innovation Lab
            </p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-3">
              El Futuro de la Cirugía
            </h2>
            <p className="text-slate-500 text-base leading-relaxed max-w-lg">
              Explore nuestro motor de renderizado anatómico en tiempo real.
              Tecnología de vanguardia para la próxima generación de planificación quirúrgica.
            </p>
          </div>
          <Link
            href="/servicios"
            className="shrink-0 border border-slate-300 text-slate-700 text-sm font-semibold px-6 py-3 rounded-full hover:bg-slate-50 hover:border-slate-400 transition-all"
          >
            Acceder al Visualizador
          </Link>
        </div>

        {/* Large Video Container */}
        <div className="relative bg-[#e2e2e4] rounded-[2.5rem] p-1 overflow-hidden">
          <div className="relative aspect-[21/9] rounded-[2.25rem] overflow-hidden">
            <video
              src="/images/vascular-planning-aorta.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />

            {/* Bottom-left Label */}
            <div className="absolute bottom-6 left-6">
              <span className="bg-white/90 backdrop-blur-sm text-slate-900 text-sm font-semibold px-4 py-2 rounded-full shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Motor de Renderizado Anatómico en Vivo
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
