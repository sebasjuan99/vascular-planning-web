export default function CursosHero() {
  return (
    <section className="relative h-[70vh] flex items-center justify-center overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      >
        <source src="/videos/cursos-hero.mp4" type="video/mp4" />
      </video>
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
