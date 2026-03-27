import Image from 'next/image'

export default function PlanningHero() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      <Image
        src="/images/hero-surgery-bg.jpg"
        alt="Cirugía vascular en quirófano"
        fill
        className="object-cover opacity-50"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/80" />
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6">
          Planning Tool
        </h1>
        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
          Herramientas de medición EVAR y FEVAR para planificación endovascular de alta precisión.
        </p>
      </div>
    </section>
  )
}
