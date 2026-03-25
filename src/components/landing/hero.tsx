import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Content */}
        <div>
          <span className="inline-block px-3 py-1 bg-[#0058bc]/10 text-[#0058bc] rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
            Framework 2.0
          </span>
          <h1 className="text-[3.5rem] leading-[1.1] font-bold tracking-tight text-slate-900 mb-6">
            Planificación Vascular con Precisión Digital.
          </h1>
          <p className="text-lg text-slate-500 leading-relaxed mb-8 max-w-lg">
            Herramientas avanzadas de simulación EVAR y FEVAR para cirujanos vasculares.
            Planifique, visualice y optimice cada procedimiento con precisión milimétrica.
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

        {/* Right: Image */}
        <div className="relative">
          {/* Rotated blur background */}
          <div className="absolute -inset-4 bg-gradient-to-br from-[#0058bc]/20 to-[#0058bc]/5 rounded-[2rem] rotate-3 blur-sm" />
          <div className="relative rounded-3xl overflow-hidden shadow-apple">
            <Image
              src="/images/hero-home-vascular.jpg"
              alt="Planificación vascular digital"
              width={800}
              height={600}
              className="w-full aspect-[4/3] object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  )
}
