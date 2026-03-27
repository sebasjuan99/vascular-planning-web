import Image from 'next/image'
import { ClipboardList, Printer, Glasses, Headset, Ruler } from 'lucide-react'

export default function ServiciosDeliverables() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Entregables
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cada consultoría incluye un paquete completo de herramientas para la toma de decisiones quirúrgicas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Plan Quirúrgico (spans 2 rows) */}
          <div className="md:row-span-2 p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <ClipboardList className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Plan Quirúrgico</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Reporte detallado con estrategia endovascular, dispositivos sugeridos y accesos recomendados.
            </p>
            <div className="relative flex-1 min-h-[160px] rounded-xl overflow-hidden mt-auto">
              <Image
                src="/images/process-strategy-report.jpg"
                alt="Reporte de planificación quirúrgica"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Card 2: Impresión 3D */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Printer className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Impresión 3D</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Modelo físico impreso en 3D de la anatomía del paciente para estudio y planificación.
            </p>
          </div>

          {/* Card 3: Realidad Virtual */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Glasses className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Realidad Virtual</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Visualización inmersiva de la anatomía vascular en realidad mixta para acompañamiento.
            </p>
          </div>

          {/* Card 4: Proctorización */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Headset className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Proctorización</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Acompañamiento experto durante el procedimiento quirúrgico.
            </p>
          </div>

          {/* Card 5: Mediciones */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Ruler className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Mediciones</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Mediciones anatómicas precisas con diámetros, longitudes y angulaciones críticas.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
