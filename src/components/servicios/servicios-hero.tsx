import Image from 'next/image'
import Link from 'next/link'

export default function ServiciosHero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-black">
      <Image
        src="/images/servicios-hero-bg.jpg"
        alt="Servicios de planificación vascular"
        fill
        className="object-cover opacity-50"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-32">
        <p className="text-sm uppercase tracking-[0.25em] text-white/60 mb-4 font-medium">
          VASCULAR PLANNING
        </p>
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight mb-6 max-w-2xl">
          Planificamos{' '}
          <span className="text-blue-400">tus Casos</span>
        </h1>
        <p className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed">
          Nuestro equipo de especialistas realiza la planificación endovascular de tus pacientes con
          precisión certificada y tecnología de vanguardia.
        </p>
        <div className="flex gap-4 flex-wrap">
          <Link
            href="/registro"
            className="clinical-gradient text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Solicitar Planificación
          </Link>
          <Link
            href="#como-funciona"
            className="border border-white/30 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Cómo Funciona
          </Link>
        </div>
      </div>
    </section>
  )
}
