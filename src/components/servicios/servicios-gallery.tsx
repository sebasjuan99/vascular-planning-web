import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const images = [
  { src: '/images/gallery-bone-model.jpg', alt: 'Modelo óseo impreso en 3D' },
  { src: '/images/gallery-surgical-sim.jpg', alt: 'Simulación quirúrgica' },
  { src: '/images/gallery-3d-print.jpg', alt: 'Impresión 3D vascular' },
  { src: '/images/gallery-vascular-lab.jpg', alt: 'Laboratorio vascular' },
]

export default function ServiciosGallery() {
  return (
    <section className="py-24 bg-surface-container-low">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-vp-dark">
            Galería
          </h2>
          <Link
            href="#"
            className="flex items-center gap-2 text-sm font-semibold text-clinical-blue hover:text-clinical-container transition-colors"
          >
            Ver Galería Completa
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.src}
              className="relative aspect-square rounded-2xl overflow-hidden group cursor-pointer"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
