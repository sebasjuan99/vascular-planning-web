import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SimulatorFrame from '@/components/simulator/simulator-frame'
import type { Case } from '@/lib/types'

export default async function EvarPage({ searchParams }: { searchParams: { caseId?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules: string[] = user?.user_metadata?.modules || []
  if (!modules.includes('evar') && user?.user_metadata?.role !== 'admin') {
    redirect('/dashboard/planificar')
  }

  let existingCase: Case | null = null
  if (searchParams.caseId) {
    const { data } = await supabase
      .from('cases')
      .select('*')
      .eq('id', searchParams.caseId)
      .eq('user_id', user!.id)
      .single()
    existingCase = data
  }

  return <SimulatorFrame toolPath="/tools/evar.html" caseType="evar" existingCase={existingCase} />
}
