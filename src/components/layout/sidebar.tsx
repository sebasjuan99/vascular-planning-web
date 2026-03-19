'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/dashboard/mis-casos',    label: 'Mis Casos' },
  { href: '/dashboard/planificar',   label: 'Planificar Cirugía' },
  { href: '/dashboard/cursos',       label: 'Cursos' },
  { href: '/dashboard/consultoria',  label: 'Consultoría' },
]

interface SidebarProps {
  userName: string
}

export default function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <aside className="w-60 min-h-screen bg-vp-dark flex flex-col">
      <div className="p-4 border-b border-white/10">
        <Image src="/logo.png" alt="Vascular Planning" width={120} height={36}
          className="h-8 w-auto object-contain brightness-0 invert" />
      </div>

      <nav className="flex-1 py-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors
                ${isActive
                  ? 'bg-white/10 border-l-2 border-vp-red text-white font-semibold'
                  : 'text-white/50 hover:text-white/80 border-l-2 border-transparent'
                }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-vp-red' : 'bg-white/20'}`} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <button onClick={handleSignOut} className="flex items-center gap-2.5 w-full">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-vp-red to-vp-blue flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="text-left min-w-0">
            <p className="text-white text-xs font-semibold truncate">{userName}</p>
            <p className="text-white/40 text-xs">Cerrar sesión</p>
          </div>
        </button>
      </div>
    </aside>
  )
}
