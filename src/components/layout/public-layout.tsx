import Navbar from '@/components/layout/navbar'
import Footer from '@/components/layout/footer'
import VascularCursor from '@/components/layout/vascular-cursor'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VascularCursor />
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </>
  )
}
