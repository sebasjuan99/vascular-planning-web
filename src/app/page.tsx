import Navbar from '@/components/layout/navbar'
import Hero from '@/components/landing/hero'
import StatsBar from '@/components/landing/stats-bar'
import FeaturesGrid from '@/components/landing/features-grid'
import Footer from '@/components/layout/footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-16">
        <Hero />
        <StatsBar />
        <FeaturesGrid />
      </main>
      <Footer />
    </>
  )
}
