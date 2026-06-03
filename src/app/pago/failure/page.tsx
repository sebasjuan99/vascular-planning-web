import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PagoFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-9 h-9 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          No pudimos procesar el pago
        </h1>
        <p className="text-sm text-slate-500 mb-2 leading-relaxed">
          El pago no se completó. Esto puede deberse a fondos insuficientes,
          datos incorrectos o cancelación. Tu tarjeta no fue cargada.
        </p>
        <p className="text-xs text-slate-400 mb-8">
          Puedes intentar nuevamente con otro medio de pago.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard/cursos"
            className="bg-[#0058bc] hover:bg-[#004493] text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
          >
            Reintentar
          </Link>
          <Link
            href="/dashboard/mis-casos"
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-6 py-2.5 rounded-lg"
          >
            Volver al dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
