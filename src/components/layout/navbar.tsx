import Image from 'next/image'
import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur border-b border-vp-border">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="Vascular Planning" width={120} height={36}
            className="h-9 w-auto object-contain" />
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm text-gray-600 font-medium">
          <Link href="/" className="hover:text-vp-dark transition-colors">Inicio</Link>
          <Link href="/dashboard/planificar" className="hover:text-vp-dark transition-colors">Planificar Cirugía</Link>
          <Link href="/dashboard/cursos" className="hover:text-vp-dark transition-colors">Cursos</Link>
          <Link href="/dashboard/consultoria" className="hover:text-vp-dark transition-colors">Consultoría</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-vp-dark transition-colors">
            Ingresar
          </Link>
          <Link href="/registro"
            className="bg-vp-dark text-white text-sm font-semibold px-4 py-2 rounded-md hover:bg-vp-dark/90 transition-colors">
            Registrarse →
          </Link>
        </div>
      </div>
    </nav>
  )
}
