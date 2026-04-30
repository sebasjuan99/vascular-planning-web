'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validSession, setValidSession] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    // When user lands on this page from email link, Supabase auto-creates a recovery session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValidSession(!!session)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/login'), 3000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vp-surface p-4">
      <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <p className="text-sm font-black text-vp-dark mb-1">
            Vascular<span className="text-vp-red">Planning</span>
          </p>
          <h1 className="text-xl font-bold text-vp-dark">Nueva contraseña</h1>
          <p className="text-xs text-vp-muted mt-1">Crea una contraseña segura</p>
        </div>

        {validSession === false && (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-800 mb-4">
            <p className="font-semibold mb-1">Enlace inválido o expirado</p>
            <p>El enlace de recuperación ya fue usado o expiró. Solicita uno nuevo.</p>
            <Link href="/login" className="text-vp-red font-semibold hover:underline mt-2 inline-block">
              Volver al login
            </Link>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 text-xs text-green-800 mb-4">
            <p className="font-semibold mb-1">✓ Contraseña actualizada</p>
            <p>Redirigiendo al login...</p>
          </div>
        )}

        {validSession && !success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Nueva contraseña
              </label>
              <input
                type="password" required value={password}
                onChange={e => setPassword(e.target.value)}
                minLength={6}
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Confirmar contraseña
              </label>
              <input
                type="password" required value={confirm}
                onChange={e => setConfirm(e.target.value)}
                minLength={6}
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
              />
            </div>
            {error && <p className="text-xs text-vp-red">{error}</p>}
            <button
              type="submit" disabled={loading}
              className="w-full bg-vp-dark text-white text-sm font-semibold py-2.5 rounded-md hover:bg-vp-dark/90 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Actualizar contraseña'}
            </button>
          </form>
        )}

        {validSession === null && (
          <p className="text-xs text-vp-muted text-center">Cargando...</p>
        )}
      </div>
    </div>
  )
}
