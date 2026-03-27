import Link from 'next/link'

export default function PlanningBenefits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-gray-50 rounded-2xl border border-vp-border shadow-lg p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Comienza a planificar con precisión
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto mb-10 leading-relaxed">
            Accede a herramientas clínicas avanzadas para planificación endovascular EVAR y FEVAR.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/registro"
              className="clinical-gradient text-white font-semibold px-8 py-3.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              Crear Cuenta
            </Link>
            <Link
              href="/login"
              className="border border-vp-border text-vp-dark font-medium px-8 py-3.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
