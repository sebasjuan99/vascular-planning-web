import Image from 'next/image'

export default function CursosHero() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      <Image
        src="/images/cursos-hero-bg.jpg"
        alt="Formación en cirugía vascular"
        fill
        className="object-cover opacity-50"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/70" />
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
          VASCULAR PLANNING
        </h1>
        <p className="text-xl md:text-2xl text-white/80 font-light">
          Cursos Clínicos
        </p>
      </div>
    </section>
  )
}
