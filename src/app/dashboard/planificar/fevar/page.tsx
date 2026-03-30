import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SimulatorFrame from '@/components/simulator/simulator-frame'

export default async function FevarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules: string[] = user?.user_metadata?.modules || []
  if (!modules.includes('fevar') && user?.user_metadata?.role !== 'admin') {
    redirect('/dashboard/planificar')
  }
  return <SimulatorFrame toolPath="/tools/fevar.html" caseType="fevar" />
}
