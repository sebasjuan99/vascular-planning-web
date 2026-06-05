import Link from 'next/link'
import { Ruler, Target, CreditCard, Repeat, UserPlus, LogIn } from 'lucide-react'

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

              <div className="bg-white border border-vp-border rounded-xl p-5 flex flex-col gap-3">
                <p className="text-sm text-slate-600 font-medium text-center">
                  Obtén acceso a esta herramienta
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/registro"
                    className="clinical-gradient text-white font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    Crear una cuenta
                  </Link>
                  <Link
                    href="/login"
                    className="border border-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-center flex items-center justify-center gap-2 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    Acceder con mi cuenta
                  </Link>
                </div>
                <p className="text-[11px] text-gray-400 inline-flex items-center gap-1 justify-center">
                  <CreditCard className="w-3 h-3" />
                  Suscripción desde{' '}
                  <strong className="text-slate-600">$25.000 CLP/mes</strong>
                  <span className="mx-1">·</span>
                  <Repeat className="w-3 h-3" />
                  Cancela cuando quieras
                </p>
              </div>
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
