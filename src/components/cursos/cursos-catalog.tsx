import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

const ENROLLMENT_URL =
  'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=wCgnBPvgaEeCV5k43x4jJso4i2xa0TRLtdz2-zpMnxVUOU1PSDZNVkJDNUlDRUdMSjFHME1SOUJYQi4u'

interface Course {
  title: string
  description: string
  category: 'Aorta' | 'Periférico'
  image?: string
  gradient: string
}

const aortaCourses: Course[] = [
  {
    title: 'EVAR',
    description:
      'Reparación Endovascular de Aneurisma Aórtico. Planificación y simulación del abordaje endovascular estándar.',
    category: 'Aorta',
    image: '/images/curso-evar.jpg',
    gradient: 'from-blue-600 to-blue-800',
  },
  {
    title: 'FEVAR',
    description:
      'Reparación Endovascular Fenestrada. Técnicas avanzadas para anatomías complejas con dispositivos fenestrados y ramificados.',
    category: 'Aorta',
    image: '/images/curso-fevar.jpg',
    gradient: 'from-purple-600 to-purple-800',
  },
  {
    title: 'TEVAR',
    description:
      'Reparación Endovascular Torácica. Abordaje endovascular de patología aórtica torácica con planificación avanzada.',
    category: 'Aorta',
    gradient: 'from-indigo-600 to-indigo-800',
  },
]

const perifericoCourses: Course[] = [
  {
    title: 'Angiografía Básica',
    description:
      'Fundamentos de la angiografía diagnóstica y terapéutica en el territorio vascular periférico.',
    category: 'Periférico',
    image: '/images/curso-periferico.jpg',
    gradient: 'from-green-600 to-green-800',
  },
  {
    title: 'Uso de Ultrasonido en Cirugía Vascular (VR)',
    description:
      'Entrenamiento en realidad virtual para el uso de ultrasonido doppler en evaluación y diagnóstico vascular.',
    category: 'Periférico',
    gradient: 'from-teal-600 to-teal-800',
  },
  {
    title: 'Accesos Vasculares Guiados con Ultrasonido (VR)',
    description:
      'Simulación en realidad virtual de accesos vasculares guiados por ecografía para procedimientos seguros.',
    category: 'Periférico',
    gradient: 'from-emerald-600 to-emerald-800',
  },
]

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-vp-border overflow-hidden flex flex-col">
      {/* Image or Gradient */}
      <div className="relative h-48 overflow-hidden">
        {course.image ? (
          <Image
            src={course.image}
            alt={course.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${course.gradient} flex items-center justify-center`}
          >
            <span className="text-white/30 text-6xl font-bold">
              {course.title.charAt(0)}
            </span>
          </div>
        )}
        <span
          className={`absolute top-4 left-4 ${
            course.category === 'Aorta' ? 'bg-blue-600' : 'bg-green-600'
          } text-white text-xs font-semibold px-3 py-1 rounded-full`}
        >
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-vp-dark mb-2">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
          {course.description}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-vp-border">
          <a
            href={ENROLLMENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-blue hover:text-clinical-container transition-colors"
          >
            Inscribirse
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CursosCatalog() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Programas de Formación
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cursos diseñados por especialistas para dominar la planificación
            endovascular y las técnicas vasculares periféricas.
          </p>
        </div>

        {/* Cursos de Aorta */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-vp-dark mb-8">
            Cursos de Aorta
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {aortaCourses.map((course) => (
              <CourseCard key={course.title} course={course} />
            ))}
          </div>
        </div>

        {/* Cursos de Vascular Periférico */}
        <div>
          <h3 className="text-2xl font-bold text-vp-dark mb-8">
            Cursos de Vascular Periférico
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
            {perifericoCourses.map((course) => (
              <CourseCard key={course.title} course={course} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
