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
    <div className="bg-white rounded-xl shadow-apple px-5 py-4 flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${isEvar ? 'bg-[#0058bc]/10' : 'bg-blue-50'}`}>
        <span className={`text-xs font-black ${isEvar ? 'text-[#0058bc]' : 'text-blue-600'}`}>
          {caso.type.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-slate-900 truncate">{caso.patient_ref}</p>
        <p className="text-xs text-slate-400 mt-0.5">{date}</p>
      </div>
      <div className="flex gap-2 flex-shrink-0">
        <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer">
          Ver
        </span>
        {caso.pdf_url && (
          <a href={`/api/cases/pdf-url?id=${caso.id}`}
            className="text-xs font-medium px-3 py-1.5 rounded-full bg-[#0058bc] text-white hover:bg-[#0058bc]/90 transition-colors">
            PDF
          </a>
        )}
      </div>
    </div>
  )
}
