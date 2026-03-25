import Link from 'next/link'

export default function CtaSection() {
  return (
    <section className="py-24 bg-vp-dark">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Comienza a planificar con precisión
        </h2>
        <p className="text-white/70 mb-10 max-w-xl mx-auto">
          Accede a herramientas clínicas avanzadas para planificación endovascular EVAR y FEVAR.
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
