'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile'
import { createClient } from '@/lib/supabase/client'

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

export default function RegistroPage() {
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '',
    especialidad: '', institucion: '', password: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<TurnstileInstance>(null)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (TURNSTILE_SITE_KEY && !captchaToken) {
      setError('Por favor completa la verificación de seguridad')
      return
    }

    setLoading(true)
    setError('')
    const supabase = createClient()

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        ...(captchaToken ? { captchaToken } : {}),
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        data: {
          full_name: `${form.nombre} ${form.apellido}`,
          specialty: form.especialidad,
          institution: form.institucion,
          approved: true,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      turnstileRef.current?.reset()
      setCaptchaToken(null)
      return
    }

    if (data.user) {
      await fetch('/api/admin/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: data.user.id,
          userName: `${form.nombre} ${form.apellido}`,
          userEmail: form.email,
          specialty: form.especialidad,
          institution: form.institucion,
        })
      })
    }

    setSubmitted(true)
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-vp-surface">
        <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-[#0058bc] text-xl">✉</span>
          </div>
          <h2 className="text-lg font-bold text-vp-dark mb-2">Revisa tu correo</h2>
          <p className="text-sm text-vp-muted">
            Te enviamos un link de confirmación a <strong>{form.email}</strong>. Haz clic en él para activar tu cuenta y acceder a las herramientas.
          </p>
          <p className="text-xs text-vp-muted mt-3">
            Si no lo ves, revisa la carpeta de spam.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vp-surface py-10">
      <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-vp-dark">Crear cuenta</h1>
          <p className="text-xs text-vp-muted mt-1">Accede a las calculadoras FEVAR y EVAR</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['nombre', 'Nombre'], ['apellido', 'Apellido']].map(([field, label]) => (
              <div key={field}>
                <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>
                <input required value={form[field as keyof typeof form]}
                  onChange={e => update(field, e.target.value)}
                  className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
                />
              </div>
            ))}
          </div>
          {[
            ['email', 'Correo institucional', 'email'],
            ['especialidad', 'Especialidad', 'text'],
            ['institucion', 'Institución / Hospital', 'text'],
            ['password', 'Contraseña', 'password'],
          ].map(([field, label, type]) => (
            <div key={field}>
              <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>
              <input type={type} required value={form[field as keyof typeof form]}
                onChange={e => update(field, e.target.value)}
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
              />
            </div>
          ))}
          {error && <p className="text-xs text-vp-red">{error}</p>}
          {TURNSTILE_SITE_KEY && (
            <div className="flex justify-center">
              <Turnstile
                ref={turnstileRef}
                siteKey={TURNSTILE_SITE_KEY}
                onSuccess={setCaptchaToken}
                onError={() => setCaptchaToken(null)}
                onExpire={() => setCaptchaToken(null)}
                options={{ theme: 'light', size: 'flexible' }}
              />
            </div>
          )}
          <button type="submit" disabled={loading}
            className="w-full bg-[#0058bc] text-white text-sm font-semibold py-2.5 rounded-md hover:bg-[#004493] disabled:opacity-50 mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-xs text-vp-muted mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link href="/login" className="text-vp-red font-semibold hover:underline">
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  )
}
