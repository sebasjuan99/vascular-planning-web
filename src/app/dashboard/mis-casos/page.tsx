import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import StatsRow from '@/components/dashboard/stats-row'
import CaseCard from '@/components/dashboard/case-card'

export default async function MisCasosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cases } = await supabase
    .from('cases')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const allCases = cases || []
  const evarCount = allCases.filter(c => c.type === 'evar').length
  const fevarCount = allCases.filter(c => c.type === 'fevar').length

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Casos</h1>
          <p className="text-sm text-slate-500 mt-1">{allCases.length} planificaciones guardadas</p>
        </div>
        <Link href="/dashboard/planificar"
          className="clinical-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">
          + Nueva planificación
        </Link>
      </div>

      <StatsRow total={allCases.length} evar={evarCount} fevar={fevarCount} />

      <div className="space-y-3">
        {allCases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-apple text-center py-16">
            <p className="text-slate-400 text-sm mb-3">
              No tienes casos guardados aún.
            </p>
            <Link href="/dashboard/planificar" className="text-[#0058bc] font-semibold text-sm hover:underline">
              Crear primera planificación
            </Link>
          </div>
        ) : (
          allCases.map(caso => <CaseCard key={caso.id} caso={caso} />)
        )}
      </div>
    </div>
  )
}
