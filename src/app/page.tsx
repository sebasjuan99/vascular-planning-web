import PublicLayout from '@/components/layout/public-layout'
import Hero from '@/components/landing/hero'
import FeaturesGrid from '@/components/landing/features-grid'
import InnovationLab from '@/components/landing/innovation-lab'
import CtaSection from '@/components/shared/cta-section'

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <FeaturesGrid />
      <InnovationLab />
      <CtaSection
        title="Eleve su práctica quirúrgica hoy mismo."
        subtitle="Únase a los centros cardiovasculares líderes que ya están transformando la planificación quirúrgica."
      />
    </PublicLayout>
  )
}
