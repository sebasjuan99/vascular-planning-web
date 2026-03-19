import Link from 'next/link'

const features = [
  {
    title: 'Planificar Cirugía',
    description: 'Simuladores EVAR y FEVAR interactivos. Exporta tu plan en PDF para el quirófano.',
    href: '/dashboard/planificar',
    accent: 'bg-red-50',
    dot: 'bg-gradient-to-br from-vp-red to-vp-blue',
  },
  {
    title: 'Cursos y Actualizaciones',
    description: 'Formación especializada en cirugía endovascular con los últimos avances.',
    href: '/dashboard/cursos',
    accent: 'bg-blue-50',
    dot: 'bg-vp-blue',
  },
  {
    title: 'Consultoría de Casos',
    description: 'Asesoría experta en planificación de casos complejos. Solicita una consulta.',
    href: '/dashboard/consultoria',
    accent: 'bg-green-50',
    dot: 'bg-green-600',
  },
  {
    title: 'Mis Casos',
    description: 'Historial de planificaciones. Retoma, edita y comparte tus casos anteriores.',
    href: '/dashboard/mis-casos',
    accent: 'bg-yellow-50',
    dot: 'bg-yellow-600',
  },
]

export default function FeaturesGrid() {
  return (
    <section id="features" className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="text-xs uppercase tracking-widest text-vp-muted mb-2">Todo en un solo lugar</p>
        <h2 className="text-2xl font-bold text-vp-dark">¿Qué encuentras en la plataforma?</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link key={f.title} href={f.href}
            className="border border-vp-border rounded-xl p-6 bg-white hover:shadow-md transition-shadow group">
            <div className={`w-8 h-8 rounded-lg ${f.accent} flex items-center justify-center mb-3`}>
              <div className={`w-3.5 h-3.5 rounded-full ${f.dot}`} />
            </div>
            <h3 className="font-bold text-vp-dark text-sm mb-1.5 group-hover:text-vp-red transition-colors">
              {f.title}
            </h3>
            <p className="text-xs text-vp-muted leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
