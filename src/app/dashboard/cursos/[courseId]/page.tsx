import { redirect } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Mail, ArrowLeft, Wrench, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCourse } from '@/lib/courses'
import { hasAccessToCourse } from '@/lib/access'

interface Props {
  params: { courseId: string }
}

export default async function CourseAccessPage({ params }: Props) {
  const course = getCourse(params.courseId)
  if (!course) redirect('/dashboard/cursos')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?redirect=/dashboard/cursos/${params.courseId}`)

  const access = await hasAccessToCourse(supabase, user, course.id)
  if (!access) {
    // No access → bounce back to catalog so they can buy
    redirect('/dashboard/cursos')
  }

  // Products that grant module access (e.g. EVAR + FEVAR calculators)
  // skip the pre-inscription thank-you and show a "tools ready" page instead.
  if (course.grantsModules && course.grantsModules.length > 0) {
    return (
      <div className="max-w-3xl mx-auto">
        <Link
          href="/dashboard/cursos"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Cursos
        </Link>

        <div className="bg-white rounded-2xl shadow-apple border border-slate-100 overflow-hidden">
          <div className={`h-2 bg-gradient-to-r ${course.gradient}`} aria-hidden="true" />
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-600" strokeWidth={2} />
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">
                Acceso activo
              </p>
              <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
                {course.title}
              </h1>
              <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
                Tus calculadoras están listas para usar. Planifica tus casos con
                precisión milimétrica directamente desde tu dashboard.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
              {course.grantsModules.includes('evar') && (
                <Link
                  href="/dashboard/planificar/evar"
                  className="group bg-gradient-to-br from-[#0058bc] to-[#004493] hover:from-[#004493] hover:to-[#003478] text-white p-6 rounded-xl transition-colors"
                >
                  <Wrench className="w-6 h-6 mb-3 opacity-80" />
                  <h2 className="text-lg font-bold mb-1">Iniciar EVAR</h2>
                  <p className="text-sm text-white/80 mb-4">
                    Reparación endovascular de aorta abdominal
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    Abrir calculadora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
              {course.grantsModules.includes('fevar') && (
                <Link
                  href="/dashboard/planificar/fevar"
                  className="group bg-gradient-to-br from-cyan-600 to-cyan-800 hover:from-cyan-700 hover:to-cyan-900 text-white p-6 rounded-xl transition-colors"
                >
                  <Wrench className="w-6 h-6 mb-3 opacity-80" />
                  <h2 className="text-lg font-bold mb-1">Iniciar FEVAR</h2>
                  <p className="text-sm text-white/80 mb-4">
                    Reparación fenestrada para anatomías complejas
                  </p>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold">
                    Abrir calculadora
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default: courses with no content yet → pre-inscription thank you
  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href="/dashboard/cursos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a Cursos
      </Link>

      <div className="bg-white rounded-2xl shadow-apple border border-slate-100 overflow-hidden">
        <div
          className={`h-2 bg-gradient-to-r ${course.gradient}`}
          aria-hidden="true"
        />
        <div className="p-8 md:p-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9 text-emerald-600" strokeWidth={2} />
            </div>
          </div>

          <div className="text-center mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700 mb-2">
              Inscripción confirmada
            </p>
            <h1 className="text-3xl font-bold text-slate-900 mb-3 leading-tight">
              {course.title}
            </h1>
            <p className="text-slate-500 max-w-xl mx-auto leading-relaxed">
              ¡Gracias por reservar tu cupo! Tu pre-inscripción al curso quedó
              registrada. El contenido del programa estará disponible
              próximamente.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 mb-6 flex gap-4">
            <Mail className="w-6 h-6 text-[#0058bc] shrink-0 mt-0.5" />
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-900 mb-1">
                Te notificaremos por correo
              </p>
              <p>
                Recibirás un email en{' '}
                <span className="font-medium text-slate-900">{user.email}</span>{' '}
                cuando el curso esté listo, incluyendo el cronograma,
                instrucciones de acceso y materiales preparatorios.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
              Qué incluirá tu curso
            </h2>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="text-emerald-600 shrink-0">✓</span>
                <span>Acceso completo a las clases en video bajo demanda</span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 shrink-0">✓</span>
                <span>
                  Material complementario: casos clínicos, lecturas y guías
                  prácticas
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 shrink-0">✓</span>
                <span>
                  Sesiones en vivo con los instructores y resolución de dudas
                </span>
              </li>
              <li className="flex gap-3">
                <span className="text-emerald-600 shrink-0">✓</span>
                <span>Certificado de aprobación al completar el programa</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
