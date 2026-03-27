import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Activity, ArrowRight, ChevronRight, Clock, Wrench, BookOpen, GraduationCap } from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const fullName = user.user_metadata?.full_name || user.email || 'Doctor'

  // Fetch user's cases
  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const allCases = cases || []
  const totalCases = allCases.length
  const evarCases = allCases.filter(c => c.type === 'evar').length

  return (
    <div>
      {/* Welcome Header */}
      <div className="mb-10">
        <p className="text-sm text-slate-500 mb-1">Bienvenido de nuevo, {fullName}</p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Resumen Clínico</h1>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="md:col-span-4 space-y-6">
          {/* Planning Tools Card */}
          <div className="bg-white rounded-xl shadow-apple p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#0058bc]/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-[#0058bc]" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Herramientas</h2>
            </div>
            <div className="space-y-3">
              <Link
                href="/dashboard/planificar/evar"
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#0058bc]/5 to-transparent border border-[#0058bc]/10 hover:border-[#0058bc]/30 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900">Aorta (EVAR)</p>
                  <p className="text-xs text-slate-500 mt-0.5">Reparación Endovascular</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#0058bc] transition-colors" />
              </Link>
              <Link
                href="/dashboard/planificar/fevar"
                className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/5 to-transparent border border-blue-500/10 hover:border-blue-500/30 transition-colors group"
              >
                <div>
                  <p className="font-semibold text-sm text-slate-900">Periférico (FEVAR)</p>
                  <p className="text-xs text-slate-500 mt-0.5">EVAR Fenestrada</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-xl shadow-apple p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Estadísticas</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Casos totales</span>
                <span className="text-2xl font-bold text-slate-900">{totalCases}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Casos EVAR</span>
                <span className="text-lg font-bold text-[#0058bc]">{evarCases}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Casos FEVAR</span>
                <span className="text-lg font-bold text-blue-600">{totalCases - evarCases}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Tasa de éxito</span>
                <span className="text-lg font-bold text-emerald-600">98%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-8 space-y-6">
          {/* Active Cases List */}
          <div className="bg-white rounded-xl shadow-apple p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Casos Recientes</h2>
              </div>
              <Link
                href="/dashboard/mis-casos"
                className="text-sm font-semibold text-[#0058bc] hover:text-[#0058bc]/80 flex items-center gap-1 transition-colors"
              >
                Ver todos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {allCases.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 text-sm mb-3">No tienes casos guardados aún.</p>
                <Link
                  href="/dashboard/planificar"
                  className="clinical-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all inline-block"
                >
                  Crear primera planificación
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {allCases.map((caso) => {
                  const isEvar = caso.type === 'evar'
                  const date = new Date(caso.created_at).toLocaleDateString('es-CO', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                  return (
                    <div
                      key={caso.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-all"
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isEvar ? 'bg-[#0058bc]/10' : 'bg-blue-50'
                        }`}
                      >
                        <span
                          className={`text-xs font-black ${
                            isEvar ? 'text-[#0058bc]' : 'text-blue-600'
                          }`}
                        >
                          {caso.type.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-900 truncate">
                          {caso.patient_ref}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{date}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600">
                          Ver
                        </span>
                        {caso.pdf_url && (
                          <a
                            href={`/api/cases/pdf-url?id=${caso.id}`}
                            className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0058bc] text-white hover:bg-[#0058bc]/90 transition-colors"
                          >
                            PDF
                          </a>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Education Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-apple p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Planificación EVAR</h3>
                  <p className="text-xs text-slate-400">Dr. Carlos Mejía</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Anatomía y medidas para reparación endovascular de aneurisma aórtico abdominal.
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Progreso</span>
                  <span className="font-semibold text-slate-600">65%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '65%' }} />
                </div>
              </div>
              <Link
                href="/dashboard/cursos"
                className="text-xs font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                Continuar curso →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-apple p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">FEVAR: Casos Complejos</h3>
                  <p className="text-xs text-slate-400">Dr. Andrés Vargas</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                Fenestraciones y casos de alta complejidad en cirugía endovascular avanzada.
              </p>
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Progreso</span>
                  <span className="font-semibold text-slate-600">0%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <Link
                href="/dashboard/cursos"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Comenzar curso →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
