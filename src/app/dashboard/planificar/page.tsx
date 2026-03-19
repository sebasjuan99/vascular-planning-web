import ToolCard from '@/components/dashboard/tool-card'

export default function PlanificarPage() {
  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-vp-dark">Planificar Cirugía</h1>
        <p className="text-xs text-vp-muted mt-1">Selecciona el tipo de procedimiento a planificar</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <ToolCard type="evar" href="/dashboard/planificar/evar" />
        <ToolCard type="fevar" href="/dashboard/planificar/fevar" />
      </div>

      <div className="bg-vp-surface border border-vp-border rounded-lg p-4 flex gap-3">
        <div className="w-5 h-5 rounded-full bg-vp-border flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs font-bold text-vp-muted">i</span>
        </div>
        <p className="text-xs text-vp-muted leading-relaxed">
          Los simuladores se abren en pantalla completa. Tu planificación se guarda automáticamente al hacer clic en
          <strong className="text-vp-dark"> &ldquo;Guardar caso&rdquo;</strong> y quedará disponible en <strong className="text-vp-dark">Mis Casos</strong>.
        </p>
      </div>
    </div>
  )
}
