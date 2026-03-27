'use client'

import { useState } from 'react'
import { Ruler, Target, X, Lock } from 'lucide-react'

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
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
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
                <button
                  onClick={() => setShowPopup(true)}
                  className="clinical-gradient text-white font-semibold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity text-center"
                >
                  Acceder
                </button>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400 mt-10">
            Requiere cuenta activa para acceder a las herramientas de medición.
          </p>
        </div>
      </section>

      {/* Popup Próximo Lanzamiento */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setShowPopup(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-16 h-16 rounded-full bg-[#0058bc]/10 flex items-center justify-center mx-auto mb-6">
              <Lock className="w-8 h-8 text-[#0058bc]" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Próximo Lanzamiento
            </h3>
            <p className="text-slate-500 leading-relaxed mb-2">
              Acceso Exclusivo
            </p>
            <p className="text-sm text-slate-400 leading-relaxed mb-8">
              Esta herramienta estará disponible próximamente para usuarios verificados.
              Regístrate para ser notificado cuando esté disponible.
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="clinical-gradient text-white font-semibold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  )
}
