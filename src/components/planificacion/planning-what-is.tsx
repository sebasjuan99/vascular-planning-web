import Image from 'next/image'
import { Microscope, Ruler } from 'lucide-react'

const features = [
  {
    icon: Microscope,
    title: 'Precisión Anatómica',
    description: 'Reconstrucción tomográfica detallada para visualizar la anatomía vascular real del paciente.',
  },
  {
    icon: Ruler,
    title: 'Simulación de Stent-Grafts',
    description: 'Modelado virtual de dispositivos endovasculares adaptados a las mediciones individuales.',
  },
]

export default function PlanningWhatIs() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: text content */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-6 leading-tight">
              Planeamiento Endovascular: La base de la precisión.
            </h2>
            <p className="text-gray-600 leading-relaxed mb-10">
              Nuestro sistema analiza imágenes DICOM para generar reconstrucciones anatómicas tridimensionales
              y simular la colocación de stent-grafts con precisión milimétrica. Cada planificación se adapta
              a la anatomía única de cada paciente.
            </p>
            <div className="space-y-6">
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

          {/* Right: image */}
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3]">
            <Image
              src="/images/planning-ct-reconstruction.jpg"
              alt="Reconstrucción tomográfica 3D"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
