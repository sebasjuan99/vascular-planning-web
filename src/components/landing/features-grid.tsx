import Image from 'next/image'
import Link from 'next/link'
import { Microscope, Droplets, History } from 'lucide-react'

export default function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-8 bg-[#f3f3f5]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-[#0058bc] mb-3">
            Capacidades Críticas
          </p>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Diseñado para la Excelencia Quirúrgica.
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Large card - 3D Reconstruction */}
          <div className="md:col-span-2 bg-white rounded-[2rem] p-12 shadow-apple flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#0058bc]/10 flex items-center justify-center">
                <Microscope className="w-5 h-5 text-[#0058bc]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Reconstrucción 3D Dinámica</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6 max-w-md">
              Visualización tridimensional de la anatomía vascular a partir de imágenes DICOM.
              Rote, mida y analice cada estructura con precisión sub-milimétrica.
            </p>
            <div className="mt-auto rounded-2xl overflow-hidden bg-[#e2e2e4]">
              <Image
                src="/images/bento-3d-heart.jpg"
                alt="Reconstrucción 3D del corazón"
                width={800}
                height={400}
                className="w-full h-56 object-cover"
              />
            </div>
          </div>

          {/* Small card - Flow Simulation */}
          <div className="bg-white rounded-[2rem] p-10 shadow-apple flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Simulación de Flujo</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Modelos hemodinámicos computacionales para predecir el comportamiento del flujo sanguíneo post-intervención.
            </p>
            <div className="mt-auto rounded-2xl overflow-hidden bg-[#e2e2e4]">
              <Image
                src="/images/bento-flow-simulation.jpg"
                alt="Simulación de flujo sanguíneo"
                width={400}
                height={300}
                className="w-full h-40 object-cover"
              />
            </div>
          </div>

          {/* Small card - Historical Record */}
          <div className="bg-white rounded-[2rem] p-10 shadow-apple flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <History className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registro Histórico</h3>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed mb-6">
              Almacene y compare planificaciones previas. Seguimiento longitudinal de cada paciente y caso clínico.
            </p>
            <div className="mt-auto rounded-2xl overflow-hidden bg-[#e2e2e4]">
              <Image
                src="/images/bento-data-dashboard.jpg"
                alt="Dashboard de datos clínicos"
                width={400}
                height={300}
                className="w-full h-40 object-cover"
              />
            </div>
          </div>

          {/* Wide dark card - OR Integration */}
          <div className="md:col-span-2 bg-slate-900 text-white rounded-[2rem] p-12 shadow-apple flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-3">Integración con Quirófano</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Exporte su planificación directamente al monitor del quirófano.
                Compatibilidad con los principales sistemas de visualización intraoperatoria.
              </p>
              <Link
                href="/servicios"
                className="inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-blue-300 transition-colors"
              >
                Saber más
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>
            <div className="flex-1 rounded-2xl overflow-hidden bg-slate-800">
              <Image
                src="/images/bento-surgical-monitor.jpg"
                alt="Monitor quirúrgico integrado"
                width={500}
                height={300}
                className="w-full h-48 object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
