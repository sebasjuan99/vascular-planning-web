import { Clock, ShieldCheck, Eye, Package } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Eficiencia Temporal',
    description: 'Reduzca los tiempos de planificación quirúrgica con análisis automatizado e informes inmediatos.',
  },
  {
    icon: ShieldCheck,
    title: 'Seguridad Quirúrgica',
    description: 'Minimice riesgos intraoperatorios con simulaciones previas y estrategias validadas.',
  },
  {
    icon: Eye,
    title: 'Claridad Visual',
    description: 'Reconstrucciones 3D de alta fidelidad que facilitan la comunicación con el equipo quirúrgico.',
  },
  {
    icon: Package,
    title: 'Optimización de Stock',
    description: 'Identifique con precisión los dispositivos necesarios antes de ingresar al quirófano.',
  },
]

export default function PlanningBenefits() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-sm uppercase tracking-[0.2em] text-clinical-blue font-medium mb-3">
          Valor Clínico
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-vp-dark mb-12">
          Beneficios de la planificación digital
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="p-8 rounded-2xl bg-gray-50 border border-vp-border hover:shadow-lg transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-clinical-light flex items-center justify-center mb-5">
                <benefit.icon className="w-6 h-6 text-clinical-blue" />
              </div>
              <h3 className="font-semibold text-vp-dark mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
