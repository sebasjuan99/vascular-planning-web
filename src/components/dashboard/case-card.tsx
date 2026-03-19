import type { Case } from '@/lib/types'

interface CaseCardProps {
  caso: Case
}

export default function CaseCard({ caso }: CaseCardProps) {
  const isEvar = caso.type === 'evar'
  const date = new Date(caso.created_at).toLocaleDateString('es-CO', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

  return (
    <div className="bg-white border border-vp-border rounded-lg px-4 py-3 flex items-center gap-3">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isEvar ? 'bg-red-50' : 'bg-blue-50'}`}>
        <span className={`text-xs font-black ${isEvar ? 'text-vp-red' : 'text-vp-blue'}`}>
          {caso.type.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-vp-dark truncate">{caso.patient_ref}</p>
        <p className="text-xs text-vp-muted mt-0.5">{date}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <span className="border border-vp-border text-gray-600 text-xs px-3 py-1.5 rounded-md">Ver</span>
        {caso.pdf_url && (
          <a href={`/api/cases/pdf-url?id=${caso.id}`}
            className="bg-vp-dark text-white text-xs px-3 py-1.5 rounded-md hover:bg-vp-dark/90 transition-colors">
            PDF
          </a>
        )}
      </div>
    </div>
  )
}
