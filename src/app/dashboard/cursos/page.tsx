import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { formatCLP } from '@/lib/courses'
import { getHydratedCourses } from '@/lib/products'
import { getUserCourseAccess } from '@/lib/access'
import { getActiveSubscriptions } from '@/lib/subscriptions'
import CourseCardActions from '@/components/dashboard/course-card-actions'
import SubscriptionCardActions from '@/components/dashboard/subscription-card-actions'

export default async function CursosDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/cursos')

  const access = await getUserCourseAccess(supabase, user)
  const accessMap = new Map(access.map((a) => [a.courseId, a]))

  const subs = await getActiveSubscriptions(supabase, user.id)
  const activeSubProductIds = new Set(subs.map((s) => s.product_id))

  // Catalog: every active product + every product the user already owns
  // (so even if a product was deactivated, the user still sees it as theirs)
  const all = await getHydratedCourses()
  const courses = all.filter((c) => c.active || accessMap.has(c.id) || activeSubProductIds.has(c.id))

  // Group: subscriptions (Calculadoras) at the top, then formación courses
  const subscriptionCourses = courses.filter((c) => c.subscription)
  const oneTimeCourses = courses.filter((c) => !c.subscription)

  return (
    <div className="max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Cursos y herramientas
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Formación clínica y acceso a las calculadoras de planificación quirúrgica
        </p>
      </div>

      {subscriptionCourses.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Herramientas con suscripción
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subscriptionCourses.map((course) => {
              const hasActive = activeSubProductIds.has(course.id)
              const ownsLegacy = accessMap.has(course.id)
              const freq = course.subscription!.displayLabel
              return (
                <div key={course.id}
                  className="bg-white rounded-2xl shadow-apple overflow-hidden border border-slate-100 flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    {course.image ? (
                      <Image src={course.image} alt={course.shortTitle} fill className="object-cover" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient}`} />
                    )}
                    <span className="absolute top-3 left-3 bg-cyan-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {course.subscription!.displayLabel === '/mes' ? 'Mensual' : course.subscription!.displayLabel === '/año' ? 'Anual' : 'Semanal'}
                    </span>
                    {hasActive && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Suscripción activa
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-1 leading-tight">
                      {course.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                      {course.description}
                    </p>
                    <div className="pt-4 border-t border-slate-100">
                      <SubscriptionCardActions
                        productId={course.id}
                        productTitle={course.shortTitle}
                        priceLabel={formatCLP(course.price)}
                        frequencyLabel={freq}
                        hasActiveSubscription={hasActive}
                        ownsLegacy={ownsLegacy}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {oneTimeCourses.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Cursos de formación
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oneTimeCourses.map((course) => {
              const hasAccess = accessMap.has(course.id)
              const accessRecord = accessMap.get(course.id)
              return (
                <div key={course.id}
                  className="bg-white rounded-2xl shadow-apple overflow-hidden border border-slate-100 flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    {course.video ? (
                      <video autoPlay loop muted playsInline
                        className="absolute inset-0 w-full h-full object-cover">
                        <source src={course.video} type="video/mp4" />
                      </video>
                    ) : course.image ? (
                      <Image src={course.image} alt={course.shortTitle} fill className="object-cover" />
                    ) : (
                      <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient}`} />
                    )}
                    <span className={`absolute top-3 left-3 ${
                        course.category === 'Aorta' ? 'bg-blue-600' : 'bg-green-600'
                      } text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full`}>
                      {course.category}
                    </span>
                    {hasAccess && (
                      <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Acceso activo
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-base font-bold text-slate-900 mb-2 leading-tight">
                      {course.shortTitle}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4 flex-1">
                      {course.description}
                    </p>
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
        </section>
      )}

      {courses.length === 0 && (
        <div className="mt-8 bg-amber-50 border border-amber-100 rounded-xl p-5 text-sm text-amber-900">
          No hay productos disponibles en este momento.
        </div>
      )}
    </div>
  )
}
