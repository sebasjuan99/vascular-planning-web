import Image from 'next/image'
import { FileText, Box, Wrench, Play } from 'lucide-react'

const curriculum = [
  {
    icon: FileText,
    title: 'Módulos Teóricos',
    description: 'Contenido académico actualizado sobre anatomía, dispositivos y criterios de selección.',
  },
  {
    icon: Box,
    title: 'Simulación 3D',
    description: 'Práctica con modelos tridimensionales interactivos basados en casos reales anonimizados.',
  },
  {
    icon: Wrench,
    title: 'Talleres Prácticos',
    description: 'Sesiones en vivo con expertos para resolver casos clínicos complejos paso a paso.',
  },
]

export default function CursosInside() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
              Dentro del Curso
            </h2>
            <p className="text-gray-500 leading-relaxed mb-10">
              Cada programa combina teoría, simulación interactiva y acompañamiento clínico para
              garantizar un aprendizaje aplicable desde el primer día.
            </p>
            <div className="space-y-6">
              {curriculum.map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-clinical-blue" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-vp-dark mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: video preview */}
          <div className="relative aspect-video rounded-2xl overflow-hidden group">
            <Image
              src="/images/cursos-video-preview.jpg"
              alt="Vista previa del curso"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <Play className="w-7 h-7 text-clinical-blue ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-lg">
              Tráiler del Curso
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
