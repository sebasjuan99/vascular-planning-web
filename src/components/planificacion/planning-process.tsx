import Image from 'next/image'

const steps = [
  {
    title: 'Carga de DICOM',
    description: 'Suba las imágenes tomográficas del paciente en formato DICOM para iniciar el análisis automatizado.',
    image: '/images/process-dicom-upload.jpg',
  },
  {
    title: 'Análisis y Medición',
    description: 'El sistema genera reconstrucciones 3D y realiza mediciones anatómicas clave de forma automática.',
    image: '/images/process-analysis.jpg',
  },
  {
    title: 'Estrategia Sugerida',
    description: 'Reciba un reporte con la estrategia endovascular recomendada, dispositivos sugeridos y simulaciones.',
    image: '/images/process-strategy-report.jpg',
  },
]

export default function PlanningProcess() {
  return (
    <section id="proceso" className="py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            El Proceso de Planificación
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Tres pasos simples para obtener una planificación endovascular completa y precisa.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="bg-white rounded-2xl overflow-hidden border border-vp-border shadow-sm hover:shadow-xl transition-shadow"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={step.image}
                  alt={step.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 w-8 h-8 rounded-full bg-clinical-blue text-white text-sm font-bold flex items-center justify-center">
                  {index + 1}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-vp-dark mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
