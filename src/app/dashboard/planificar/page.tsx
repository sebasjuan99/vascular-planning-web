import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/dashboard/tool-card'
import { Info } from 'lucide-react'

export default async function PlanificarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const modules: string[] = user?.user_metadata?.modules || []
  const isAdmin = user?.user_metadata?.role === 'admin'

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Planificar Cirugía</h1>
        <p className="text-sm text-slate-500 mt-1">Selecciona el tipo de procedimiento a planificar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ToolCard type="evar" href="/dashboard/planificar/evar" hasAccess={isAdmin || modules.includes('evar')} />
        <ToolCard type="fevar" href="/dashboard/planificar/fevar" hasAccess={isAdmin || modules.includes('fevar')} />
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
