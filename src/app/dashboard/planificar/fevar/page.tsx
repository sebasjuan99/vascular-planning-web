import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SimulatorFrame from '@/components/simulator/simulator-frame'
import type { Case } from '@/lib/types'
import { hasActiveModuleSubscription } from '@/lib/subscriptions'

export default async function FevarPage({ searchParams }: { searchParams: { caseId?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules: string[] = user?.user_metadata?.modules || []
  const isAdmin = user?.user_metadata?.role === 'admin'
  const inMeta = modules.includes('fevar')
  const hasSub = !isAdmin && !inMeta && user
    ? await hasActiveModuleSubscription(supabase, user, 'fevar')
    : false
  if (!isAdmin && !inMeta && !hasSub) {
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

  return <SimulatorFrame toolPath="/tools/fevar.html" caseType="fevar" existingCase={existingCase} />
}
