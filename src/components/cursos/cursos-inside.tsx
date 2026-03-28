import {
  BookOpen,
  Box,
  Glasses,
  Award,
  FolderOpen,
} from 'lucide-react'

const includes = [
  {
    icon: BookOpen,
    text: 'Contenido teórico y casos clínicos reales',
  },
  {
    icon: Box,
    text: 'Simulaciones 3D y reconstrucciones anatómicas',
  },
  {
    icon: Glasses,
    text: 'Experiencias en Realidad Virtual (cursos VR)',
  },
  {
    icon: Award,
    text: 'Certificado de completación',
  },
  {
    icon: FolderOpen,
    text: 'Acceso a materiales de referencia',
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
              ¿Qué incluyen nuestros cursos?
            </h2>
            <p className="text-gray-500 leading-relaxed mb-10">
              Cada programa está diseñado para ofrecer una experiencia de
              aprendizaje completa, combinando teoría, práctica y tecnología
              de vanguardia.
            </p>
            <ul className="space-y-5">
              {includes.map((item) => (
                <li key={item.text} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-clinical-light flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-clinical-blue" />
                  </div>
                  <span className="text-gray-700 font-medium">
                    {item.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: video preview */}
          <div className="relative aspect-video rounded-2xl overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            >
              <source src="/videos/curso-ultrasonido.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
