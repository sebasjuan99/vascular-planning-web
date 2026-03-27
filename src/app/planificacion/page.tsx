import PublicLayout from '@/components/layout/public-layout'
import PlanningHero from '@/components/planificacion/planning-hero'
import PlanningWhatIs from '@/components/planificacion/planning-what-is'
import PlanningProcess from '@/components/planificacion/planning-process'
import PlanningBenefits from '@/components/planificacion/planning-benefits'

export default function PlanificacionPage() {
  return (
    <PublicLayout>
      <PlanningHero />
      <PlanningWhatIs />
      <PlanningProcess />
      <PlanningBenefits />
    </PublicLayout>
  )
}
