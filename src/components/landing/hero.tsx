import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
      {/* Background image */}
      <Image
        src="/images/dr-jeison-y-dr-espindola.jpeg"
        alt="Dr. Jeison Peñuela y Dr. Manuel Espíndola"
        fill
        className="object-cover opacity-40"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-2 gap-12 items-center py-32">
        {/* Left: Content */}
        <div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1] mb-6">
            PLANIFICA TU CIRUGÍA AORTICA
          </h1>
          <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-lg">
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
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-semibold px-8 py-3.5 rounded-full hover:bg-white/20 transition-colors"
            >
              Iniciar Sesión
            </Link>
          </div>
        </div>

        {/* Right: Logo PNG */}
        <div className="relative flex items-center justify-center">
          <Image
            src="/images/logo-vascular-planning.png"
            alt="Vascular Planning Logo"
            width={500}
            height={500}
            className="w-full max-w-sm object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </section>
  )
}
