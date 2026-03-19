'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegistroPage() {
  const supabase = createClient()
  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '',
    especialidad: '', institucion: '', password: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function update(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.nombre} ${form.apellido}`,
          specialty: form.especialidad,
          institution: form.institucion,
          approved: false,
          approved_at: null,
        }
      }
    })

    if (error) { setError(error.message); setLoading(false); return }

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
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-xl">✓</span>
          </div>
          <h2 className="text-lg font-bold text-vp-dark mb-2">Solicitud enviada</h2>
          <p className="text-sm text-vp-muted">
            Recibirás un correo cuando tu acceso sea aprobado (24–48h).
          </p>
          <Link href="/login" className="block mt-4 text-xs text-vp-red font-semibold hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-vp-surface py-10">
      <div className="bg-white border border-vp-border rounded-xl p-8 w-full max-w-sm shadow-sm">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-vp-dark">Solicitar acceso</h1>
          <p className="text-xs text-vp-muted mt-1">Tu solicitud será revisada en 24–48h</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[['nombre', 'Nombre'], ['apellido', 'Apellido']].map(([field, label]) => (
              <div key={field}>
                <label className="text-xs font-semibold text-gray-700 block mb-1">{label}</label>
                <input required value={(form as any)[field]}
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
              <input type={type} required value={(form as any)[field]}
                onChange={e => update(field, e.target.value)}
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30"
              />
            </div>
          ))}
          {error && <p className="text-xs text-vp-red">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-vp-red text-white text-sm font-semibold py-2.5 rounded-md hover:bg-vp-red/90 disabled:opacity-50 mt-2">
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>

        <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-xs text-yellow-800 text-center">
            Tu acceso será aprobado por un administrador. Recibirás confirmación por correo.
          </p>
        </div>
      </div>
    </div>
  )
}
