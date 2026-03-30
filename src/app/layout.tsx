import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ScrollToTop from '@/components/layout/scroll-to-top'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vascular Planning | Planificación Quirúrgica Aórtica',
  description: 'Plataforma clínica para planificación de cirugía vascular endovascular. Herramientas EVAR y FEVAR, impresión 3D, realidad virtual y consultoría experta.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'Vascular Planning | Planificación Quirúrgica Aórtica',
    description: 'Planifica tu cirugía aórtica con precisión digital. Herramientas EVAR, FEVAR, impresión 3D y realidad virtual.',
    url: 'https://vascularplanning.com',
    siteName: 'Vascular Planning',
    images: [
      {
        url: 'https://vascularplanning.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vascular Planning',
      },
    ],
    locale: 'es_CO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vascular Planning | Planificación Quirúrgica Aórtica',
    description: 'Planifica tu cirugía aórtica con precisión digital.',
    images: ['https://vascularplanning.com/og-image.png'],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-vp-dark antialiased`}>
        {children}
        <ScrollToTop />
      </body>
    </html>
  )
}
