import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Sidebar from '@/components/layout/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const userName = user.user_metadata?.full_name || user.email || 'Doctor'

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={userName} />
      <main className="flex-1 bg-vp-surface overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
