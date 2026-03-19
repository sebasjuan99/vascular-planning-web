import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="border-t border-vp-border py-5 px-6">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Image src="/logo.png" alt="Vascular Planning" width={100} height={30}
          className="h-7 w-auto object-contain" />
        <p className="text-xs text-vp-muted">© 2026 · Para uso clínico profesional</p>
      </div>
    </footer>
  )
}
