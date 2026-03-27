import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div>
          <h1 className="text-[3.5rem] leading-[1.1] font-bold tracking-tight text-slate-900 mb-6">
            PLANIFICA TU CIRUGÍA AORTICA
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            Herramientas avanzadas de simulación EVAR y FEVAR para cirujanos vasculares. Planifique, visualice y optimice cada procedimiento con precisión milimétrica.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/registro"
              className="clinical-gradient text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:shadow-lg transition-all"
            >
              Comenzar Planificación
            </Link>
            <Link
              href="/login"
              className="bg-slate-100 text-slate-700 text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-slate-200 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Right: Logo */}
        <div className="relative flex items-center justify-center">
          <Image
            src="/images/logo-vascular-planning-hero.png"
            alt="Vascular Planning Logo"
            width={800}
            height={600}
            className="w-full max-w-md object-contain"
            priority
          />
        </div>
      </div>
    </section>
  )
}
