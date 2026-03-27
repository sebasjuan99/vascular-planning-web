'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Case } from '@/lib/types'
import { MessageSquare, CheckCircle } from 'lucide-react'

export default function ConsultoriaPage() {
  const supabase = useMemo(() => createClient(), [])
  const [cases, setCases] = useState<Case[]>([])
  const [form, setForm] = useState({ caseId: '', description: '', urgency: 'electiva' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase.from('cases').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
        .then(({ data }) => setCases(data || []))
    })
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
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Consultoría de Casos</h1>
        <p className="text-sm text-slate-500 mt-1">Asesoría experta en planificación compleja</p>
      </div>

      <div className="bg-gradient-to-br from-slate-900 to-[#0058bc] rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg mb-2">¿Tienes un caso complejo?</h2>
            <p className="text-sm text-white/70 leading-relaxed mb-5">
              Nuestros expertos revisan tu planificación y te orientan antes de la cirugía.
            </p>
            <button onClick={() => setShowForm(true)}
              className="clinical-gradient text-white text-sm font-semibold px-6 py-2.5 rounded-full hover:shadow-lg transition-all">
              Solicitar consulta →
            </button>
          </div>
        </div>
      </div>

      {showForm && !submitted && (
        <div className="bg-white rounded-xl shadow-apple p-6">
          <h3 className="font-bold text-base text-slate-900 mb-5">Nueva solicitud de consultoría</h3>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Caso a consultar (opcional)</label>
              <select value={form.caseId} onChange={e => setForm(f => ({ ...f, caseId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-[#f9f9fb] focus:outline-none focus:ring-2 focus:ring-[#0058bc]/20 focus:border-[#0058bc]/40 transition-all">
                <option value="">Sin caso específico</option>
                {cases.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.type.toUpperCase()} — {c.patient_ref}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">Descripción del caso</label>
              <textarea required value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                rows={4} placeholder="Describe la complejidad anatómica y tu consulta..."
                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm bg-[#f9f9fb] focus:outline-none focus:ring-2 focus:ring-[#0058bc]/20 focus:border-[#0058bc]/40 resize-none transition-all"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-2">Urgencia</label>
              <div className="flex gap-3">
                {['electiva', 'urgente'].map(u => (
                  <button key={u} type="button" onClick={() => setForm(f => ({ ...f, urgency: u }))}
                    className={`text-sm px-5 py-2 rounded-full border transition-all capitalize font-medium
                      ${form.urgency === u
                        ? u === 'urgente'
                          ? 'bg-red-50 border-red-200 text-red-600 shadow-sm'
                          : 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full clinical-gradient text-white text-sm font-semibold py-3 rounded-full hover:shadow-lg disabled:opacity-50 transition-all">
              {loading ? 'Enviando...' : 'Enviar solicitud'}
            </button>
          </form>
        </div>
      )}

      {submitted && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
          <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <p className="text-emerald-700 font-semibold text-sm mb-1">Solicitud enviada exitosamente</p>
          <p className="text-emerald-600 text-xs">Te contactaremos a la brevedad.</p>
        </div>
      )}
    </div>
  )
}
