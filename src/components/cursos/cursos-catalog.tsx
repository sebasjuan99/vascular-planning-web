import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'

const courses = [
  {
    title: 'Planificación EVAR',
    badge: 'Avanzado',
    badgeColor: 'bg-blue-600',
    description: 'Domina la planificación endovascular para reparación de aneurismas aórticos abdominales con técnicas de imagen avanzadas.',
    image: '/images/curso-evar.jpg',
    instructor: 'Dr. Carlos Méndez',
    instructorImage: '/images/instructor-mendez.jpg',
    duration: '12 Semanas',
  },
  {
    title: 'Planificación FEVAR',
    badge: 'Experto',
    badgeColor: 'bg-purple-600',
    description: 'Curso especializado en planificación fenestrada y ramificada para anatomías complejas y casos de alto riesgo.',
    image: '/images/curso-fevar.jpg',
    instructor: 'Dra. Elena Rivas',
    instructorImage: '/images/instructor-rivas.jpg',
    duration: '16 Semanas',
  },
  {
    title: 'Planificación Periférica',
    badge: 'Intermedio',
    badgeColor: 'bg-green-600',
    description: 'Abordaje endovascular de patología arterial periférica: ilíacas, femorales y tibiales con simulación digital.',
    image: '/images/curso-periferico.jpg',
    instructor: 'Dr. Miguel Santos',
    instructorImage: '/images/instructor-santos.jpg',
    duration: '10 Semanas',
  },
]

export default function CursosCatalog() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-4">
            Programas de Formación
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Cursos diseñados por especialistas para dominar la planificación endovascular en todas sus variantes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div
              key={course.title}
              className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-vp-border overflow-hidden flex flex-col"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className={`absolute top-4 left-4 ${course.badgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {course.badge}
                </span>
              </div>

              {/* Body */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-semibold text-vp-dark mb-2">{course.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">{course.description}</p>

                {/* Instructor */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="relative w-9 h-9 rounded-full overflow-hidden">
                    <Image
                      src={course.instructorImage}
                      alt={course.instructor}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium text-vp-dark">{course.instructor}</span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-vp-border">
                  <div className="flex items-center gap-1.5 text-sm text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                  <Link
                    href="#"
                    className="text-sm font-semibold text-clinical-blue hover:text-clinical-container transition-colors"
                  >
                    VER DETALLES
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
