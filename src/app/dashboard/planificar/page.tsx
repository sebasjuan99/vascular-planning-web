export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/dashboard/tool-card'
import { Info } from 'lucide-react'
import { formatCLP } from '@/lib/courses'
import { getProductRow } from '@/lib/products'
import { hasActiveModuleSubscription } from '@/lib/subscriptions'

export default async function PlanificarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules: string[] = user?.user_metadata?.modules || []
  const isAdmin = user?.user_metadata?.role === 'admin'

  // Access can come from: admin role, admin-granted module, or active subscription
  const hasEvar =
    isAdmin ||
    modules.includes('evar') ||
    (user ? await hasActiveModuleSubscription(supabase, user, 'evar') : false)
  const hasFevar =
    isAdmin ||
    modules.includes('fevar') ||
    (user ? await hasActiveModuleSubscription(supabase, user, 'fevar') : false)

  // Cheapest active subscription option for the "from $X/mes" hint
  const monthlyRow = await getProductRow('suscripcion-calculadoras-mensual')
  const subscribeLabel = monthlyRow?.active
    ? `desde ${formatCLP(monthlyRow.price)} CLP/mes`
    : undefined

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Planificar Cirugía</h1>
        <p className="text-sm text-slate-500 mt-1">Selecciona el tipo de procedimiento a planificar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ToolCard
          type="evar"
          href="/dashboard/planificar/evar"
          hasAccess={hasEvar}
          productId="suscripcion-calculadoras-mensual"
          subscribeFromLabel={subscribeLabel}
        />
        <ToolCard
          type="fevar"
          href="/dashboard/planificar/fevar"
          hasAccess={hasFevar}
          productId="suscripcion-calculadoras-mensual"
          subscribeFromLabel={subscribeLabel}
        />
      </div>

      <div className="bg-white rounded-xl shadow-apple p-5 flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#0058bc]/10 flex items-center justify-center flex-shrink-0">
          <Info className="w-4 h-4 text-[#0058bc]" />
        </div>
        <p className="text-sm text-slate-500 leading-relaxed">
          Los simuladores se abren en pantalla completa. Tu planificación se guarda automáticamente al hacer clic en
          <strong className="text-slate-900"> &ldquo;Guardar caso&rdquo;</strong> y quedará disponible en <strong className="text-slate-900">Mis Casos</strong>.
        </p>
      </div>
    </div>
  )
}
