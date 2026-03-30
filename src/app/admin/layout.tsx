import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Navbar from '@/components/layout/navbar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard')

  const fullName = user.user_metadata?.full_name || user.email || 'Admin'

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      <Navbar variant="dashboard" userName={fullName} />
      <main className="pt-24 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto">
        {children}
      </main>
    </div>
  )
}
