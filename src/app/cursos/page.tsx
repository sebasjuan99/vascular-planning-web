import PublicLayout from '@/components/layout/public-layout'
import CursosHero from '@/components/cursos/cursos-hero'
import CursosCatalog from '@/components/cursos/cursos-catalog'
import CursosInside from '@/components/cursos/cursos-inside'
import CtaSection from '@/components/shared/cta-section'

export default function CursosPage() {
  return (
    <PublicLayout>
      <CursosHero />
      <CursosCatalog />
      <CursosInside />
      <CtaSection />
    </PublicLayout>
  )
}
