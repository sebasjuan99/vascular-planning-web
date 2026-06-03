import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { COURSES, type Course, getCoursesByCategory, formatCLP } from '@/lib/courses'

// Public catalog: clicking "Inscribirse" sends the user to /dashboard/cursos.
// If not authenticated, middleware bounces to /login?redirect=/dashboard/cursos.

function CourseCard({ course }: { course: Course }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow border border-vp-border overflow-hidden flex flex-col">
      {/* Image, Video or Gradient */}
      <div className="relative h-48 overflow-hidden">
        {course.video ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={course.video} type="video/mp4" />
          </video>
        ) : course.image ? (
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
              {course.shortTitle.charAt(0)}
            </span>
          </div>
        )}
        <span
          className={`absolute top-4 left-4 ${
            course.category === 'Aorta' ? 'bg-blue-600' : 'bg-green-600'
          } text-white text-xs font-semibold px-3 py-1 rounded-full z-10`}
        >
          {course.category}
        </span>
      </div>

      {/* Body */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-vp-dark mb-2">
          {course.shortTitle}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1">
          {course.description}
        </p>

        {/* Footer */}
        <div className="pt-4 border-t border-vp-border flex items-center justify-between">
          <span className="text-sm font-bold text-vp-dark">
            {formatCLP(course.price)}
          </span>
          <Link
            href="/dashboard/cursos"
            className="inline-flex items-center gap-2 text-sm font-semibold text-clinical-blue hover:text-clinical-container transition-colors"
          >
            Inscribirse
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CursosCatalog() {
  const aortaCourses = getCoursesByCategory('Aorta')
  const perifericoCourses = getCoursesByCategory('Periférico')

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
              <CourseCard key={course.id} course={course} />
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
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        {/* Below catalog: confirm all 6 are visible */}
        {COURSES.length !== aortaCourses.length + perifericoCourses.length && (
          <p className="text-center text-xs text-red-500 mt-8">
            Faltan cursos: {COURSES.length} totales, {aortaCourses.length + perifericoCourses.length} mostrados
          </p>
        )}
      </div>
    </section>
  )
}
