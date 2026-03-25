import Image from 'next/image'
import Link from 'next/link'

export default function PlanningHero() {
  return (
    <section className="relative h-[85vh] flex items-center justify-center overflow-hidden bg-black">
      <Image
        src="/images/hero-surgery-bg.jpg"
        alt="Cirugía vascular en quirófano"
        fill
        className="object-cover opacity-60"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70" />
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <p className="text-sm uppercase tracking-[0.25em] text-white/70 mb-4 font-medium">
          Precisión Clínica Digital
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
          VASCULAR PLANNING
        </h1>
        <p className="text-lg text-white/80 max-w-xl mx-auto mb-10 leading-relaxed">
          Plataforma de planificación endovascular avanzada. Reconstrucciones 3D, simulación de stent-grafts
          y estrategias quirúrgicas basadas en datos clínicos reales.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/registro"
            className="clinical-gradient text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Comenzar Ahora
          </Link>
          <Link
            href="#proceso"
            className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Ver el Proceso
          </Link>
        </div>
      </div>
    </section>
  )
}
