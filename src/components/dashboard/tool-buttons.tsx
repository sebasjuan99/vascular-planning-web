'use client'

import { useState } from 'react'
import { ChevronRight, X, Lock } from 'lucide-react'

export default function DashboardToolButtons() {
  const [showPopup, setShowPopup] = useState(false)

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => setShowPopup(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#0058bc]/5 to-transparent border border-[#0058bc]/10 hover:border-[#0058bc]/30 transition-colors group text-left"
        >
          <div>
            <p className="font-semibold text-sm text-slate-900">Aorta (EVAR)</p>
            <p className="text-xs text-slate-500 mt-0.5">Reparación Endovascular</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0058bc] transition-colors" />
        </button>
        <button
          onClick={() => setShowPopup(true)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-colors group text-left"
        >
          <div>
            <p className="font-semibold text-sm text-slate-900">Periférico (FEVAR)</p>
            <p className="text-xs text-slate-500 mt-0.5">EVAR Fenestrada</p>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </button>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md mx-4 text-center relative">
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
