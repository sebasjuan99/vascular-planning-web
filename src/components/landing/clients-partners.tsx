import Image from "next/image";

const partners = [
  { name: "Aurora Pixel Studio", logo: "/logos-clientes/Logo Aurora Pixel Studio (1).png", size: "h-20 md:h-24" },
  { name: "Revive", logo: "/logos-clientes/Revive cuadrado.png", size: "h-20 md:h-24" },
  { name: "Terumo", logo: "/logos-clientes/Terumo.svg.png", size: "h-12 md:h-16" },
  { name: "Abbott", logo: "/logos-clientes/abbott.png", size: "h-12 md:h-16" },
];

export default function ClientsPartners() {
  return (
    <section className="py-24 px-8 bg-slate-800">
      <div className="max-w-screen-2xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-blue-400 mb-4">
            Clientes & Partners
          </h2>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Empresas que confían en nosotros
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-12 md:gap-20">
          {partners.map((partner) => (
            <div
              key={partner.name}
              className="group flex items-center justify-center p-6 rounded-2xl hover:bg-slate-700/50 transition-all duration-300"
            >
              <Image
                src={partner.logo}
                alt={partner.name}
                width={200}
                height={100}
                className={`object-contain ${partner.size} w-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
