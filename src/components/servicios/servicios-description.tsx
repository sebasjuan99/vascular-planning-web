import { ShieldCheck, Users } from 'lucide-react'

const features = [
  {
    icon: ShieldCheck,
    title: 'Precisión Certificada',
    description: 'Cada planificación es revisada por especialistas con protocolos de calidad validados.',
  },
  {
    icon: Users,
    title: 'Colaboración Experta',
    description: 'Trabajamos junto al cirujano tratante para personalizar cada estrategia quirúrgica.',
  },
]

export default function ServiciosDescription() {
  return (
    <section className="py-24 bg-[#f9f9fb]">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-6 leading-tight">
              Servicio de Planificación Profesional
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Ofrecemos un servicio integral de planificación endovascular donde nuestro equipo
              especializado analiza las imágenes de sus pacientes y genera reportes detallados con
              mediciones, reconstrucciones 3D y estrategias quirúrgicas.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Cada caso es tratado de forma individual, considerando la anatomía específica del paciente,
              los dispositivos disponibles y las preferencias del cirujano tratante.
            </p>
          </div>

          {/* Right: feature card */}
          <div className="bg-white rounded-2xl border border-vp-border p-8 shadow-apple">
            <div className="space-y-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-clinical-light flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-clinical-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-vp-dark mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
