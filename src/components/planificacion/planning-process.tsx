'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Building2 } from 'lucide-react'

const brands = [
  {
    name: 'Medtronic',
    devices: [
      'Endurant II/IIs Stent Graft System',
      'Valiant Navion Thoracic Stent Graft',
      'E-nside FEVAR Custom System',
    ],
  },
  {
    name: 'Gore',
    devices: [
      'GORE EXCLUDER AAA Endoprosthesis',
      'GORE TAG Thoracic Endoprosthesis',
      'GORE EXCLUDER Iliac Branch Endoprosthesis',
    ],
  },
  {
    name: 'Cook Medical',
    devices: [
      'Zenith Alpha Abdominal AAA Endovascular Graft',
      'Zenith TX2 TAA Endovascular Graft',
      'Zenith t-Branch Multi-Branched Stent Graft',
    ],
  },
  {
    name: 'Terumo Aortic',
    devices: [
      'Anaconda AAA Stent Graft System',
      'Relay Pro/NBS Thoracic Stent Graft',
      'Fenestrated Anaconda Custom Device',
    ],
  },
]

export default function PlanningProcess() {
  const [expandedBrand, setExpandedBrand] = useState<string | null>(null)

  const toggleBrand = (name: string) => {
    setExpandedBrand(expandedBrand === name ? null : name)
  }

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Catálogo de Prótesis Comerciales
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Fichas técnicas y brochures de los principales dispositivos endovasculares del mercado.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {brands.map((brand) => {
            const isExpanded = expandedBrand === brand.name
            return (
              <div
                key={brand.name}
                className="bg-white rounded-2xl border border-vp-border shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleBrand(brand.name)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-clinical-light flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-clinical-blue" />
                    </div>
                    <h3 className="text-lg font-semibold text-vp-dark">
                      {brand.name}
                    </h3>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-vp-border">
                    <ul className="mt-4 space-y-3">
                      {brand.devices.map((device) => (
                        <li
                          key={device}
                          className="text-sm text-gray-600 pl-4 border-l-2 border-clinical-blue/30 py-1"
                        >
                          {device}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          Contenido administrado por el equipo de Vascular Planning. Los documentos se actualizan periódicamente.
        </p>
      </div>
    </section>
  )
}
