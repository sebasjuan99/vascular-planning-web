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
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-vp-dark">Mis Casos</h1>
          <p className="text-xs text-vp-muted mt-1">{allCases.length} planificaciones guardadas</p>
        </div>
        <Link href="/dashboard/planificar"
          className="bg-vp-red text-white text-xs font-bold px-4 py-2 rounded-md hover:bg-vp-red/90 transition-colors">
          + Nueva planificación
        </Link>
      </div>

      <StatsRow total={allCases.length} evar={evarCount} fevar={fevarCount} />

      <div className="space-y-2">
        {allCases.length === 0 ? (
          <div className="text-center py-12 text-vp-muted text-sm">
            No tienes casos guardados aún.{' '}
            <Link href="/dashboard/planificar" className="text-vp-red font-semibold hover:underline">
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
