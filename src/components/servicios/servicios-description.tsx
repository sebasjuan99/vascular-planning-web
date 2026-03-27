import { Compass, Printer, Glasses, Users } from 'lucide-react'

const features = [
  {
    icon: Compass,
    title: 'Planificación Guiada por Expertos',
    description:
      'Estrategia quirúrgica personalizada con recomendaciones de abordaje, procedimiento y planificación.',
  },
  {
    icon: Printer,
    title: 'Impresión 3D del Caso Clínico',
    description:
      'Modelo físico impreso en 3D de la anatomía del paciente para estudio y planificación prequirúrgica.',
  },
  {
    icon: Glasses,
    title: 'Realidad Mixta para Cirugía',
    description:
      'Renderizado en realidad mixta para soporte en la planificación y durante el procedimiento quirúrgico.',
  },
  {
    icon: Users,
    title: 'Acompañamiento en Procedimiento',
    description:
      'Presencia y asesoría experta durante la intervención quirúrgica para garantizar los mejores resultados.',
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
              Consultoría Quirúrgica Integral
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Nuestro servicio es una asesoría completa basada en planificación quirúrgica
              guiada por expertos. Proporcionamos acompañamiento tecnológico, diseño e
              impresión 3D del caso clínico, renderizado en realidad mixta para soporte en
              planificación y cirugía, y recomendaciones de especialistas sobre abordaje,
              procedimiento y planificación.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Cada caso es tratado de forma integral, combinando tecnología de vanguardia
              con la experiencia clínica de nuestro equipo para ofrecer la mejor estrategia
              quirúrgica posible.
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
