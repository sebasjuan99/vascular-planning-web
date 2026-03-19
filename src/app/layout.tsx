import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Vascular Planning',
  description: 'Plataforma clínica para planificación de cirugía vascular endovascular',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-white text-vp-dark antialiased`}>
        {children}
      </body>
    </html>
  )
}
