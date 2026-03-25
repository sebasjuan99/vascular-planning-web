import Image from 'next/image'
import { Ruler, ClipboardList, Box, Glasses, Headset } from 'lucide-react'

const deliverables = [
  {
    icon: Ruler,
    title: 'Mediciones',
    description: 'Mediciones anatómicas precisas: diámetros, longitudes y angulaciones críticas.',
    span: '',
  },
  {
    icon: ClipboardList,
    title: 'Plan Quirúrgico',
    description: 'Reporte detallado con la estrategia endovascular, dispositivos sugeridos y accesos recomendados.',
    span: 'md:row-span-2',
    hasImage: true,
  },
  {
    icon: Box,
    title: 'Modelos 3D',
    description: 'Reconstrucciones tridimensionales interactivas de la anatomía del paciente.',
    span: '',
  },
  {
    icon: Glasses,
    title: 'Experiencia VR',
    description: 'Visualización inmersiva de la anatomía vascular en realidad virtual.',
    span: '',
  },
  {
    icon: Headset,
    title: 'Proctorización',
    description: 'Acompañamiento experto durante el procedimiento quirúrgico.',
    span: '',
  },
]

export default function ServiciosDeliverables() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Entregables
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cada planificación incluye un paquete completo de herramientas para la toma de decisiones quirúrgicas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Mediciones */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Ruler className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Mediciones</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Mediciones anatómicas precisas: diámetros, longitudes y angulaciones críticas.
            </p>
          </div>

          {/* Card 2: Plan Quirúrgico (spans 2 rows) */}
          <div className="md:row-span-2 p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow flex flex-col">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <ClipboardList className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Plan Quirúrgico</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4">
              Reporte detallado con la estrategia endovascular, dispositivos sugeridos y accesos recomendados.
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

          {/* Card 3: Modelos 3D */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Box className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Modelos 3D</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Reconstrucciones tridimensionales interactivas de la anatomía del paciente.
            </p>
          </div>

          {/* Card 4: Experiencia VR */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Glasses className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Experiencia VR</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Visualización inmersiva de la anatomía vascular en realidad virtual.
            </p>
          </div>

          {/* Card 5: Proctorización */}
          <div className="p-6 rounded-2xl bg-white border border-vp-border hover:shadow-lg transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center mb-4">
              <Headset className="w-5 h-5 text-clinical-blue" />
            </div>
            <h3 className="font-semibold text-vp-dark mb-2">Proctorización</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Acompañamiento experto durante el procedimiento quirúrgico.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
