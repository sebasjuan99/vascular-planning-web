import PublicLayout from '@/components/layout/public-layout'
import ServiciosHero from '@/components/servicios/servicios-hero'
import ServiciosDescription from '@/components/servicios/servicios-description'
import ServiciosDeliverables from '@/components/servicios/servicios-deliverables'
import ServiciosHowItWorks from '@/components/servicios/servicios-how-it-works'
import ServiciosGallery from '@/components/servicios/servicios-gallery'
import CtaSection from '@/components/shared/cta-section'

export default function ServiciosPage() {
  return (
    <PublicLayout>
      <ServiciosHero />
      <ServiciosDescription />
      <ServiciosDeliverables />
      <ServiciosHowItWorks />
      <ServiciosGallery />
      <CtaSection />
    </PublicLayout>
  )
}
