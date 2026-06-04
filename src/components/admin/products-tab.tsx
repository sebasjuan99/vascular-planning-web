'use client'
import { useEffect, useState } from 'react'
import { Save, Check, Loader2 } from 'lucide-react'
import { formatCLP } from '@/lib/courses'

interface AdminProduct {
  id: string
  title: string
  shortTitle: string
  category: string
  price: number
  currency: 'CLP'
  active: boolean
  updated_at: string | null
  hasDbRow: boolean
}

export default function ProductsTab() {
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [drafts, setDrafts] = useState<Record<string, { price?: string; active?: boolean }>>({})
  const [saving, setSaving] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/products', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setProducts(data.products)
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function setDraft(id: string, patch: { price?: string; active?: boolean }) {
    setDrafts((d) => ({ ...d, [id]: { ...d[id], ...patch } }))
  }

  function getEffective(p: AdminProduct): { price: number; active: boolean; dirty: boolean } {
    const draft = drafts[p.id] || {}
    const priceStr = draft.price ?? p.price.toString()
    const priceNum = Number(priceStr.replace(/[^0-9.]/g, ''))
    const price = Number.isFinite(priceNum) ? priceNum : p.price
    const active = draft.active ?? p.active
    const dirty = price !== p.price || active !== p.active
    return { price, active, dirty }
  }

  async function save(p: AdminProduct) {
    const eff = getEffective(p)
    if (!eff.dirty) return
    if (eff.price < 0) {
      alert('El precio no puede ser negativo')
      return
    }
    setSaving(p.id)
    const res = await fetch(`/api/admin/products/${p.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: eff.price, active: eff.active }),
    })
    setSaving(null)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      alert(err.error || 'Error al guardar')
      return
    }
    setDrafts((d) => {
      const next = { ...d }
      delete next[p.id]
      return next
    })
    setSavedAt((s) => ({ ...s, [p.id]: Date.now() }))
    setTimeout(() => setSavedAt((s) => { const n = {...s}; delete n[p.id]; return n }), 2000)
    await load()
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-sm text-slate-400">
        Cargando productos...
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 text-xs font-medium text-slate-500">
        Edita el precio y la disponibilidad. Los cambios aplican inmediatamente al catálogo público y al checkout.
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-slate-500 min-w-[260px]">Producto</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Precio (CLP)</th>
              <th className="text-left px-4 py-3 font-medium text-slate-500">Activo</th>
              <th className="text-right px-4 py-3 font-medium text-slate-500">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => {
              const eff = getEffective(p)
              const justSaved = !!savedAt[p.id]
              return (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{p.title}</div>
                    <div className="text-xs text-slate-400 font-mono">{p.id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.category}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        value={drafts[p.id]?.price ?? p.price.toString()}
                        onChange={(e) => setDraft(p.id, { price: e.target.value.replace(/[^0-9]/g, '') })}
                        className="w-32 px-2 py-1.5 border border-slate-300 rounded-md text-sm font-mono text-right"
                      />
                      <span className="text-xs text-slate-400">{formatCLP(eff.price)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDraft(p.id, { active: !eff.active })}
                      className={`w-10 h-6 rounded-full relative transition-colors ${eff.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                      aria-label={`${eff.active ? 'Desactivar' : 'Activar'} ${p.title}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${eff.active ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => save(p)}
                      disabled={!eff.dirty || saving === p.id}
                      className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        eff.dirty
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-slate-100 text-slate-400'
                      } disabled:opacity-60`}
                    >
                      {saving === p.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : justSaved ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      {saving === p.id ? 'Guardando' : justSaved ? 'Guardado' : 'Guardar'}
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
