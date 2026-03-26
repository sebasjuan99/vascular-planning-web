import PublicLayout from '@/components/layout/public-layout'
import Hero from '@/components/landing/hero'
import FeaturesGrid from '@/components/landing/features-grid'
import InnovationLab from '@/components/landing/innovation-lab'
import ClientsPartners from '@/components/landing/clients-partners'
import CtaSection from '@/components/shared/cta-section'

export default function Home() {
  return (
    <PublicLayout>
      <Hero />
      <FeaturesGrid />
      <InnovationLab />
      <ClientsPartners />
      <CtaSection />
    </PublicLayout>
  )
}
