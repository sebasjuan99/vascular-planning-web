'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function PendientePage() {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vp-surface">
      <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
          <span className="text-yellow-600 text-xl">⏳</span>
        </div>
        <h2 className="text-lg font-bold text-vp-dark mb-2">Acceso pendiente</h2>
        <p className="text-sm text-vp-muted mb-4">
          Tu solicitud está siendo revisada. Recibirás un correo cuando sea aprobada.
        </p>
        <button onClick={handleSignOut}
          className="text-xs text-vp-red font-semibold hover:underline">
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}
