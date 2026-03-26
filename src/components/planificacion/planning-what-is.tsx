import Link from 'next/link'
import { Ruler, Target } from 'lucide-react'

const tools = [
  {
    icon: Ruler,
    title: 'EVAR Planning Tool',
    description:
      'Herramienta de planificación para reparación endovascular de aneurismas aórticos infrarrenales. Permite realizar mediciones precisas de diámetros, longitudes y angulaciones del cuello aórtico, saco aneurismático y arterias ilíacas para la correcta selección del endoinjerto.',
  },
  {
    icon: Target,
    title: 'FEVAR Planning Tool',
    description:
      'Herramienta avanzada para planificación de reparación endovascular fenestrada y ramificada. Diseñada para aneurismas yuxtarrenales y toracoabdominales, permite mapear arterias viscerales y planificar la posición de fenestras y ramas.',
  },
]

export default function PlanningWhatIs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Herramientas de Medición Endovascular
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.title}
              className="p-8 rounded-2xl bg-gray-50 border border-vp-border hover:shadow-lg transition-shadow flex flex-col"
            >
              <div className="w-14 h-14 rounded-xl bg-clinical-light flex items-center justify-center mb-6">
                <tool.icon className="w-7 h-7 text-clinical-blue" />
              </div>
              <h3 className="text-xl font-semibold text-vp-dark mb-3">
                {tool.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">
                {tool.description}
              </p>
              <Link
                href="/login"
                className="clinical-gradient text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-center"
              >
                Acceder
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          Requiere cuenta activa para acceder a las herramientas de medición.
        </p>
      </div>
    </section>
  )
}
