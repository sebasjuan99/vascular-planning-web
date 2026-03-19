import Image from 'next/image'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative h-[560px] flex items-center justify-center overflow-hidden">
      <Image
        src="/cirugia-hero.png"
        alt="Cirugía vascular"
        fill
        className="object-cover object-center"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(8,12,24,0.7)] to-[rgba(8,12,24,0.82)]" />
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-tight mb-4"
          style={{ textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}>
          Vascular Planning
        </h1>
        <p className="text-base text-white/70 max-w-md mx-auto mb-8 leading-relaxed">
          Herramientas clínicas EVAR y FEVAR para planificación endovascular de alta complejidad.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/registro"
            className="bg-vp-red text-white font-bold px-6 py-3 rounded-md hover:bg-vp-red/90 transition-colors text-sm">
            Comenzar ahora
          </Link>
          <Link href="#features"
            className="bg-white/10 border border-white/25 text-white font-medium px-5 py-3 rounded-md hover:bg-white/20 transition-colors text-sm">
            Ver cómo funciona
          </Link>
        </div>
      </div>
    </section>
  )
}
