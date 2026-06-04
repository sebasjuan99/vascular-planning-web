import PublicLayout from '@/components/layout/public-layout'
import CursosHero from '@/components/cursos/cursos-hero'
import CursosCatalog from '@/components/cursos/cursos-catalog'
import CursosInside from '@/components/cursos/cursos-inside'
import Publications from '@/components/cursos/publications'
import CtaSection from '@/components/shared/cta-section'

// Catalog pricing/active flags live in Supabase, so the page must render
// dynamically on each request rather than at build time.
export const dynamic = 'force-dynamic'

export default function CursosPage() {
  return (
    <PublicLayout>
      <CursosHero />
      <CursosCatalog />
      <CursosInside />
      <Publications />
      <CtaSection />
    </PublicLayout>
  )
}
