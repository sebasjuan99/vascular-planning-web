import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/courses'
import { getHydratedCourses } from '@/lib/products'
import { getUserCourseAccess } from '@/lib/access'
import CourseCardActions from '@/components/dashboard/course-card-actions'

export default async function CursosDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/cursos')

  const access = await getUserCourseAccess(supabase, user)
  const accessMap = new Map(access.map((a) => [a.courseId, a]))
  // Show every product the user already owns even if inactive, plus all
  // active products. Inactive + not-owned products are hidden.
  const all = await getHydratedCourses()
  const courses = all.filter((c) => c.active || accessMap.has(c.id))

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cursos
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Formación clínica especializada en cirugía vascular y endovascular
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => {
          const hasAccess = accessMap.has(course.id)
          const accessRecord = accessMap.get(course.id)

          return (
            <div
              key={course.id}
              className="bg-white rounded-2xl shadow-apple overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Media */}
              <div className="relative h-44 overflow-hidden">
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
                    alt={course.shortTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${course.gradient}`}
                  />
                )}
                <span
                  className={`absolute top-3 left-3 ${
                    course.category === 'Aorta' ? 'bg-blue-600' : 'bg-green-600'
                  } text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}
                >
                  {course.category}
                </span>
                {hasAccess && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    Acceso activo
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                  {course.shortTitle}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                  {course.description}
                </p>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100">
                  <CourseCardActions
                    courseId={course.id}
                    courseTitle={course.shortTitle}
                    priceLabel={formatCLP(course.price)}
                    hasAccess={hasAccess}
                    accessSource={accessRecord?.source}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {courses.length === 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-900">
          No hay productos disponibles en este momento.
        </div>
      )}

      {courses.length > 0 && access.length === 0 && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-900">
          Compra cualquiera de los cursos para reservar tu cupo. Te notificaremos
          por correo cuando el contenido esté disponible.
        </div>
      )}
    </div>
  )
}
