import { BookOpen, ExternalLink } from 'lucide-react'

const publications = [
  {
    title: 'Mixed reality-assisted physician-modified endograft fenestration for urgent repair of a complex infrarenal abdominal aortic aneurysm: First-in-the-world case',
    authors: 'Diego Ardiles, MD; Jeison Peñuela, MD; Carlos Timaran, MD; Marcelo Lagos, MD; Sebastián Alba, MD, MBA; Manuel Espíndola, MD',
    doi: 'https://www.jvscit.org/article/S2468-4287(25)00283-7/fulltext',
    journal: 'Journal of Vascular Surgery Cases, Innovations and Techniques',
    volume: 'Volume 12, Issue 1102001, February 2026',
  },
  {
    title: 'Tratamiento endovascular de fístula aortobronquial mediante endoprótesis modificada por el médico y guiada por un modelo 3D',
    authors: 'Diego Ardiles López, Jeison Peñuela Arredondo, Marcelo Lagos Ferrada, Sebastián Alba Ospina, Manuel Espíndola Silva',
    doi: 'http://dx.doi.org/10.20960/angiologia.00838',
    journal: 'Revista Angiología — Sociedad Española de Angiología y Cirugía Vascular',
    volume: '',
  },
]

export default function Publications() {
  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-[#0058bc] mb-4">
            Investigación
          </h2>
          <p className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Nuestras Publicaciones
          </p>
          <p className="text-slate-500 mt-4 max-w-2xl mx-auto">
            Contribuciones científicas de nuestro equipo médico e investigador en revistas indexadas internacionales.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {publications.map((pub, idx) => (
            <article
              key={idx}
              className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#0058bc]/10 flex items-center justify-center shrink-0 mt-1">
                  <BookOpen className="w-5 h-5 text-[#0058bc]" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {pub.title}
                </h3>
              </div>

              <div className="ml-14 flex flex-col gap-3 flex-1">
                <p className="text-sm text-slate-600 leading-relaxed">
                  <span className="font-semibold text-slate-700">Autores: </span>
                  {pub.authors}
                </p>

                <a
                  href={pub.doi}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#0058bc] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>DOI: {pub.doi}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <div className="mt-auto pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500 font-medium">
                    {pub.journal}
                  </p>
                  {pub.volume && (
                    <p className="text-xs text-slate-400 mt-1">{pub.volume}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
