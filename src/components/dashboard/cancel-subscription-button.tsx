'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, X, AlertTriangle } from 'lucide-react'

export default function CancelSubscriptionButton({
  subscriptionId, productTitle,
}: { subscriptionId: string; productTitle: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  async function confirm() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId, immediate: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || data?.message || 'Error al cancelar')
      setOpen(false)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-rose-600 hover:text-rose-700 px-3 py-1.5 hover:bg-rose-50 rounded-lg transition-colors inline-flex items-center gap-1"
      >
        <X className="w-3.5 h-3.5" />
        Cancelar suscripción
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">¿Cancelar suscripción?</h3>
                <p className="text-sm text-slate-500">
                  Al confirmar, perderás el acceso a <strong className="text-slate-700">{productTitle}</strong> inmediatamente. No se generarán más cobros automáticos.
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Mantener suscripción
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={loading}
                className="px-4 py-2 text-sm font-semibold bg-rose-600 text-white rounded-lg hover:bg-rose-700 disabled:opacity-60 inline-flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sí, cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
