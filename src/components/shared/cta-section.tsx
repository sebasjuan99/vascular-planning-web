import Link from 'next/link'

interface CtaSectionProps {
  title?: string
  subtitle?: string
}

export default function CtaSection({
  title = 'Eleve su práctica quirúrgica hoy mismo.',
  subtitle = 'Únase a los centros cardiovasculares líderes que ya están transformando la planificación quirúrgica.',
}: CtaSectionProps) {
  return (
    <section className="py-24 bg-vp-dark">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {title}
        </h2>
        <p className="text-white/70 mb-10 max-w-xl mx-auto">
          {subtitle}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/registro"
            className="clinical-gradient text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
          >
            Crear Cuenta Gratis
          </Link>
          <Link
            href="/servicios"
            className="border border-white/25 text-white font-medium px-8 py-3.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            Ver Servicios
          </Link>
        </div>
      </div>
    </section>
  )
}
