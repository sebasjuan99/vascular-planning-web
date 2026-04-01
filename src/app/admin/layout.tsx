import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { Shield } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'admin') redirect('/dashboard')

  const fullName = user.user_metadata?.full_name || user.email || 'Admin'

  return (
    <div className="min-h-screen bg-[#f9f9fb]">
      {/* Admin-specific navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900 border-b border-slate-700">
        <div className="max-w-[1440px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image src="/images/logo-vascular-planning.png" alt="Vascular Planning" width={200} height={50} className="h-10 w-auto object-contain invert" />
            </Link>
            <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1 rounded-full">
              <Shield className="w-3.5 h-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
              Dashboard Usuario
            </Link>
            <span className="text-sm text-white font-medium">{fullName}</span>
            <form action="/api/auth/signout" method="POST">
              <button type="submit" className="text-sm text-red-400 hover:text-red-300 transition-colors">
                Salir
              </button>
            </form>
          </div>
        </div>
      </nav>
      <main className="pt-20 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto">
        {children}
      </main>
    </div>
  )
}
