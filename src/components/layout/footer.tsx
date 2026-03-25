import Image from 'next/image'
import Link from 'next/link'

const footerLinks = [
  { label: 'Privacidad', href: '/privacidad' },
  { label: 'Términos', href: '/terminos' },
  { label: 'Contacto', href: '/contacto' },
  { label: 'Soporte Técnico', href: '/soporte' },
]

export default function Footer() {
  return (
    <footer className="border-t border-outline-variant/30 py-6 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Logo + tagline */}
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Vascular Planning"
            width={80}
            height={24}
            className="h-5 w-auto object-contain grayscale opacity-60"
          />
          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-slate-400">
            Precisión Clínica
          </span>
        </div>

        {/* Center: Links */}
        <div className="flex items-center gap-4">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-slate-500 text-[11px] hover:text-slate-700 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right: Copyright */}
        <p className="text-[11px] text-slate-400">
          &copy; 2024 Vascular Planning
        </p>
      </div>
    </footer>
  )
}
