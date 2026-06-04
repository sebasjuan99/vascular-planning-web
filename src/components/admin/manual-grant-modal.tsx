'use client'
import { useState } from 'react'
import { X, Loader2, Gift } from 'lucide-react'

const PRODUCT_OPTIONS = [
  { id: 'acceso-calculadoras', label: 'Calculadoras EVAR + FEVAR' },
  { id: 'curso-evar', label: 'EVAR - Cirugía de Aorta' },
  { id: 'curso-fevar', label: 'FEVAR - Cirugía de Aorta' },
  { id: 'curso-tevar', label: 'TEVAR - Cirugía de Aorta' },
  { id: 'curso-angiografia', label: 'Angiografía Básica' },
  { id: 'curso-ultrasonido', label: 'Uso de Ultrasonido en Cirugía Vascular (VR)' },
  { id: 'curso-accesos', label: 'Accesos Vasculares Guiados con Ultrasonido (VR)' },
]

interface Props {
  userId: string
  userName: string
  userEmail: string
  onClose: () => void
  onGranted: () => void
}

export default function ManualGrantModal({
  userId, userName, userEmail, onClose, onGranted,
}: Props) {
  const [courseId, setCourseId] = useState(PRODUCT_OPTIONS[0].id)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const res = await fetch('/api/admin/manual-grant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, courseId, notes: notes.trim() || null }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.message || err.error || 'Error al otorgar acceso')
      return
    }
    onGranted()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-slate-900">Otorgar acceso manual</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="mb-5 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-500 mb-1">Otorgando a</p>
          <p className="text-sm font-semibold text-slate-900">{userName || userEmail}</p>
          <p className="text-xs text-slate-500">{userEmail}</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Producto</label>
            <select value={courseId} onChange={(e) => setCourseId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
              {PRODUCT_OPTIONS.map((p) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Ej: Pago por transferencia bancaria del 2026-06-04, comprobante #1234"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Esta nota queda registrada en la base de datos para auditoría.
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
            <p className="font-semibold mb-1">Esto hará:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Crear una compra aprobada para este usuario</li>
              <li>Otorgar acceso al producto inmediatamente</li>
              <li>Si el producto desbloquea EVAR/FEVAR, también se activan</li>
            </ul>
          </div>

          <div className="flex gap-3 justify-end">
            <button type="button" onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-2">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Otorgar acceso
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
