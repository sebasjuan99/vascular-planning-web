'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    router.push('/dashboard/mis-casos')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vp-surface">
      <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <p className="text-sm font-black text-vp-dark mb-1">
            Vascular<span className="text-vp-red">Planning</span>
          </p>
          <h1 className="text-xl font-bold text-vp-dark">Bienvenido de vuelta</h1>
          <p className="text-xs text-vp-muted mt-1">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Correo electrónico
            </label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
              placeholder="doctor@hospital.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Contraseña
            </label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
            />
          </div>
          {error && <p className="text-xs text-vp-red">{error}</p>}
          <div className="text-right">
            <button
              type="button"
              onClick={() => supabase.auth.resetPasswordForEmail(email)}
              className="text-xs text-vp-red hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          <button
            type="submit" disabled={loading}
            className="w-full bg-vp-dark text-white text-sm font-semibold py-2.5 rounded-md hover:bg-vp-dark/90 disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="text-center text-xs text-vp-muted mt-4">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="text-vp-red font-semibold hover:underline">
            Solicitar acceso
          </Link>
        </p>
      </div>
    </div>
  )
}
