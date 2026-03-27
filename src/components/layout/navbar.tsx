'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, Search, Bell, User } from 'lucide-react'

interface NavbarProps {
  variant?: 'public' | 'dashboard'
  userName?: string
}

const publicLinks = [
  { label: 'Inicio', href: '/' },
  { label: 'Planificación Quirúrgica', href: '/planificacion' },
  { label: 'Cursos', href: '/cursos' },
  { label: 'Servicios de Planificación', href: '/servicios' },
]

const dashboardLinks = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Mis Casos', href: '/dashboard/mis-casos' },
  { label: 'Mis Cursos', href: '/dashboard/cursos' },
  { label: 'Herramienta Quirúrgica', href: '/dashboard/planificar' },
]

export default function Navbar({ variant = 'public', userName }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const links = variant === 'dashboard' ? dashboardLinks : publicLinks

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-outline-variant/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href={variant === 'dashboard' ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
          <Image src="/logo.png" alt="Vascular Planning" width={360} height={96} className="h-24 w-auto object-contain" />
        </Link>

        {/* Center: Navigation links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={
                variant === 'dashboard'
                  ? 'px-3 py-2 text-sm font-semibold text-slate-600 hover:text-blue-700 transition-colors rounded-lg hover:bg-clinical-light/40'
                  : 'px-3 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-100/60'
              }
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {variant === 'dashboard' ? (
            <>
              <div className="hidden lg:flex items-center gap-2 bg-surface-container-low rounded-full px-3 py-1.5">
                <Search className="w-4 h-4 text-on-surface-variant" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-transparent text-sm outline-none w-32 placeholder:text-on-surface-variant/60"
                />
              </div>
              <button className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
                <Bell className="w-5 h-5 text-on-surface-variant" />
              </button>
              <button className="flex items-center gap-2 p-1.5 rounded-full hover:bg-surface-container-high transition-colors">
                <User className="w-5 h-5 text-on-surface-variant" />
                {userName && (
                  <span className="text-sm font-medium text-on-surface hidden sm:inline">{userName}</span>
                )}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:inline-block"
              >
                Ingresar
              </Link>
              <Link
                href="/registro"
                className="clinical-gradient text-white text-sm font-semibold px-5 py-2 rounded-full hover:shadow-lg transition-all"
              >
                Solicitar Demo
              </Link>
              {/* Mobile hamburger */}
              <button
                className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile menu (public variant only) */}
      {variant === 'public' && mobileOpen && (
        <div className="md:hidden glass-nav border-t border-outline-variant/40 px-6 py-4 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-3 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 rounded-lg transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-outline-variant/40 flex flex-col gap-2">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2"
              onClick={() => setMobileOpen(false)}
            >
              Ingresar
            </Link>
            <Link
              href="/registro"
              className="clinical-gradient text-white text-sm font-semibold px-5 py-2.5 rounded-full text-center"
              onClick={() => setMobileOpen(false)}
            >
              Solicitar Demo
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
