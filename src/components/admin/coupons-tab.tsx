'use client'
import { useEffect, useState } from 'react'
import { Plus, Trash2, Pencil, X, Loader2 } from 'lucide-react'

interface CouponRow {
  id: string
  code: string
  description: string | null
  discount_type: 'percent' | 'fixed'
  discount_value: number | string
  product_ids: string[] | null
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_until: string | null
  active: boolean
  created_at: string
}

interface ProductOption {
  id: string
  title: string
}

const ALL_PRODUCT_OPTIONS: ProductOption[] = [
  { id: 'acceso-calculadoras', title: 'Calculadoras EVAR + FEVAR' },
  { id: 'curso-evar', title: 'EVAR - Cirugía de Aorta' },
  { id: 'curso-fevar', title: 'FEVAR - Cirugía de Aorta' },
  { id: 'curso-tevar', title: 'TEVAR - Cirugía de Aorta' },
  { id: 'curso-angiografia', title: 'Angiografía Básica' },
  { id: 'curso-ultrasonido', title: 'Ultrasonido en Cirugía Vascular (VR)' },
  { id: 'curso-accesos', title: 'Accesos Vasculares Guiados con Ultrasonido (VR)' },
]

export default function CouponsTab() {
  const [coupons, setCoupons] = useState<CouponRow[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<CouponRow | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<CouponRow | null>(null)

  async function load() {
    const res = await fetch('/api/admin/coupons', { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      setCoupons(data.coupons || [])
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }
  function openEdit(c: CouponRow) {
    setEditing(c)
    setModalOpen(true)
  }
  async function deleteCoupon(c: CouponRow) {
    await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE' })
    setConfirmDelete(null)
    await load()
  }
  async function toggleActive(c: CouponRow) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !c.active }),
    })
    await load()
  }

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center text-sm text-slate-400">Cargando cupones...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-xs text-slate-500">
          Crea códigos de descuento para promociones, regalos o convenios.
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" /> Crear cupón
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Código</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Descuento</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Productos</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Usos</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Vigencia</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500">Activo</th>
                <th className="text-right px-4 py-3 font-medium text-slate-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="font-mono font-semibold text-slate-900">{c.code}</div>
                    {c.description && <div className="text-xs text-slate-400">{c.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {c.discount_type === 'percent'
                      ? `${Number(c.discount_value)}%`
                      : `-${Math.round(Number(c.discount_value)).toLocaleString('es-CL')} CLP`}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {c.product_ids === null ? 'Todos' : c.product_ids.length === 0 ? 'Todos' : c.product_ids.join(', ')}
                  </td>
                  <td className="px-4 py-3 text-slate-700 text-sm">
                    {c.uses_count}{c.max_uses != null && ` / ${c.max_uses}`}
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs">
                    {c.valid_until ? new Date(c.valid_until).toLocaleDateString('es-CL') : 'Sin vencimiento'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleActive(c)}
                      className={`w-10 h-6 rounded-full relative transition-colors ${c.active ? 'bg-emerald-600' : 'bg-slate-300'}`}
                    >
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${c.active ? 'left-[18px]' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-blue-600" title="Editar">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setConfirmDelete(c)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-500 hover:text-red-600" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                    Aún no hay cupones. Click en &quot;Crear cupón&quot; para empezar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <CouponModal
          coupon={editing}
          onClose={() => setModalOpen(false)}
          onSaved={async () => { setModalOpen(false); await load() }}
          productOptions={ALL_PRODUCT_OPTIONS}
        />
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Eliminar cupón</h3>
            <p className="text-sm text-slate-500 mb-6">¿Eliminar el cupón <strong>{confirmDelete.code}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={() => deleteCoupon(confirmDelete)} className="px-4 py-2 text-sm bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CouponModal({
  coupon, onClose, onSaved, productOptions,
}: {
  coupon: CouponRow | null
  onClose: () => void
  onSaved: () => void
  productOptions: ProductOption[]
}) {
  const [code, setCode] = useState(coupon?.code || '')
  const [description, setDescription] = useState(coupon?.description || '')
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>(coupon?.discount_type || 'percent')
  const [discountValue, setDiscountValue] = useState(coupon ? String(coupon.discount_value) : '10')
  const [productIds, setProductIds] = useState<string[]>(coupon?.product_ids ?? [])
  const [allProducts, setAllProducts] = useState(coupon?.product_ids === null || coupon?.product_ids?.length === 0)
  const [maxUses, setMaxUses] = useState(coupon?.max_uses != null ? String(coupon.max_uses) : '')
  const [validUntil, setValidUntil] = useState(coupon?.valid_until ? new Date(coupon.valid_until).toISOString().slice(0, 10) : '')
  const [active, setActive] = useState(coupon?.active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const body: Record<string, unknown> = {
      code: code.trim().toUpperCase(),
      description: description.trim() || null,
      discount_type: discountType,
      discount_value: Number(discountValue),
      product_ids: allProducts ? null : productIds,
      max_uses: maxUses ? Number(maxUses) : null,
      valid_until: validUntil ? new Date(validUntil).toISOString() : null,
      active,
    }

    const url = coupon ? `/api/admin/coupons/${coupon.id}` : '/api/admin/coupons'
    const method = coupon ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setSaving(false)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      setError(err.error || 'Error al guardar')
      return
    }
    onSaved()
  }

  function toggleProduct(id: string) {
    setProductIds((p) => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm overflow-y-auto p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-slate-900">{coupon ? 'Editar cupón' : 'Crear cupón'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Código</label>
            <input value={code} onChange={e => setCode(e.target.value)} required
              placeholder="MEDICO50"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono uppercase" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción (opcional)</label>
            <input value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Descuento para médicos"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label>
              <select value={discountType} onChange={e => setDiscountType(e.target.value as 'percent' | 'fixed')}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="percent">Porcentaje (%)</option>
                <option value="fixed">Monto fijo (CLP)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor</label>
              <input value={discountValue} onChange={e => setDiscountValue(e.target.value.replace(/[^0-9.]/g, ''))} required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Productos elegibles</label>
            <label className="flex items-center gap-2 mb-2 text-sm">
              <input type="checkbox" checked={allProducts} onChange={e => setAllProducts(e.target.checked)} />
              Aplicar a todos los productos
            </label>
            {!allProducts && (
              <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-200 rounded p-2">
                {productOptions.map(p => (
                  <label key={p.id} className="flex items-center gap-2 text-sm text-slate-700">
                    <input type="checkbox" checked={productIds.includes(p.id)} onChange={() => toggleProduct(p.id)} />
                    {p.title}
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Usos máx. (opcional)</label>
              <input value={maxUses} onChange={e => setMaxUses(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="Sin límite"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Vence el (opcional)</label>
              <input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} />
            Activo
          </label>
          <button type="submit" disabled={saving}
            className="w-full py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {coupon ? 'Guardar cambios' : 'Crear cupón'}
          </button>
        </form>
      </div>
    </div>
  )
}
