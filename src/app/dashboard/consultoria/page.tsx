'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Case } from '@/lib/types'

export default function ConsultoriaPage() {
  const supabase = useMemo(() => createClient(), [])
  const [cases, setCases] = useState<Case[]>([])
  const [form, setForm] = useState({ caseId: '', description: '', urgency: 'electiva' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase.from('cases').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setCases(data || []))
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    await supabase.from('consultations').insert({
      user_id: user.id,
      case_id: form.caseId || null,
      description: form.description,
      urgency: form.urgency,
    })

    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-vp-dark">Consultoría de Casos</h1>
        <p className="text-xs text-vp-muted mt-1">Asesoría experta en planificación compleja</p>
      </div>

      <div className="bg-gradient-to-br from-vp-dark to-vp-blue rounded-xl p-6 mb-6 text-white">
        <h2 className="font-bold text-base mb-2">¿Tienes un caso complejo?</h2>
        <p className="text-sm text-white/70 leading-relaxed mb-4">
          Nuestros expertos revisan tu planificación y te orientan antes de la cirugía.
        </p>
        <button onClick={() => setShowForm(true)}
          className="bg-vp-red text-white text-sm font-bold px-5 py-2 rounded-md hover:bg-vp-red/90 transition-colors">
          Solicitar consulta →
        </button>
      </div>

      {showForm && !submitted && (
        <div className="bg-white border border-vp-border rounded-xl p-5">
          <h3 className="font-bold text-sm text-vp-dark mb-4">Nueva solicitud de consultoría</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Caso a consultar (opcional)</label>
              <select value={form.caseId} onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30">
                <option value="">Sin caso específico</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type.toUpperCase()} — {c.patient_ref}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Descripción del caso</label>
              <textarea required value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4} placeholder="Describe la complejidad anatómica y tu consulta..."
                className="w-full border border-vp-border rounded-md px-3 py-2 text-sm bg-vp-surface focus:outline-none focus:ring-2 focus:ring-vp-red/30 resize-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-2">Urgencia</label>
              <div className="flex gap-2">
                {['electiva', 'urgente'].map(u => (
                  <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                    className={`text-sm px-4 py-1.5 rounded-md border transition-colors capitalize
                      ${form.urgency === u
                        ? u === 'urgente' ? 'bg-red-50 border-red-200 text-vp-red font-semibold' : 'bg-vp-dark text-white border-vp-dark'
                        : 'border-vp-border text-vp-muted'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-vp-dark text-white text-sm font-bold py-2.5 rounded-md hover:bg-vp-dark/90 disabled:opacity-50 transition-colors">
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
          <p className="text-green-700 font-semibold text-sm mb-1">✓ Solicitud enviada</p>
          <p className="text-green-600 text-xs">Te contactaremos a la brevedad.</p>
        </div>
      )}
    </div>
  )
}
