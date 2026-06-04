import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Repeat, Calendar, XCircle, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCLP, COURSES } from '@/lib/courses'
import CancelSubscriptionButton from '@/components/dashboard/cancel-subscription-button'

interface SubscriptionRow {
  id: string
  product_id: string
  status: string
  amount: number | string
  currency: string
  frequency_value: number
  frequency_type: string
  start_date: string | null
  current_period_end: string | null
  cancelled_at: string | null
  created_at: string
}

export default async function MisSuscripcionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/dashboard/suscripciones')

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const subs = (data ?? []) as SubscriptionRow[]
  const active = subs.filter((s) => s.status === 'authorized')
  const others = subs.filter((s) => s.status !== 'authorized')

  return (
    <div className="max-w-4xl">
      <Link
        href="/dashboard/cursos"
        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a cursos
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-1">Mis suscripciones</h1>
      <p className="text-sm text-slate-500 mb-8">
        Gestiona tus suscripciones activas y revisa el historial de pagos.
      </p>

      {subs.length === 0 && (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-8 text-center">
          <p className="text-sm text-slate-500 mb-4">No tienes suscripciones aún.</p>
          <Link href="/dashboard/cursos"
            className="inline-block bg-[#0058bc] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#004493]">
            Ver opciones
          </Link>
        </div>
      )}

      {active.length > 0 && (
        <section className="mb-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Activas
          </h2>
          <div className="space-y-4">
            {active.map((s) => (
              <SubCard key={s.id} sub={s} status="active" />
            ))}
          </div>
        </section>
      )}

      {others.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
            Historial
          </h2>
          <div className="space-y-3">
            {others.map((s) => (
              <SubCard key={s.id} sub={s} status="inactive" />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function SubCard({
  sub, status,
}: { sub: SubscriptionRow; status: 'active' | 'inactive' }) {
  const course = COURSES.find((c) => c.id === sub.product_id)
  const title = course?.title ?? sub.product_id
  const freqLabel = sub.frequency_type === 'months' ? '/mes' : sub.frequency_type === 'years' ? '/año' : '/día'

  const statusColors: Record<string, string> = {
    authorized: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    paused: 'bg-slate-50 text-slate-700 border-slate-200',
    cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
    expired: 'bg-slate-50 text-slate-500 border-slate-200',
  }
  const statusLabels: Record<string, string> = {
    authorized: 'Activa',
    pending: 'Pendiente de autorización',
    paused: 'Pausada',
    cancelled: 'Cancelada',
    expired: 'Expirada',
  }

  return (
    <div className={`bg-white rounded-xl border ${status === 'active' ? 'border-emerald-200 shadow-sm' : 'border-slate-100'} p-5`}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500 mt-0.5">ID: <span className="font-mono">{sub.id.slice(0, 8)}</span></p>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusColors[sub.status] ?? 'bg-slate-50 text-slate-600 border-slate-200'}`}>
          {statusLabels[sub.status] ?? sub.status}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Precio</p>
          <p className="font-semibold text-slate-900">{formatCLP(Number(sub.amount))}{freqLabel}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 mb-0.5">Inicio</p>
          <p className="text-slate-700">{sub.start_date ? new Date(sub.start_date).toLocaleDateString('es-CL') : '—'}</p>
        </div>
        {sub.current_period_end && (
          <div>
            <p className="text-xs text-slate-400 mb-0.5">Próximo cobro</p>
            <p className="text-slate-700 inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {new Date(sub.current_period_end).toLocaleDateString('es-CL')}
            </p>
          </div>
        )}
      </div>

      {status === 'active' && (
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            Renovación automática
          </span>
          <CancelSubscriptionButton subscriptionId={sub.id} productTitle={title} />
        </div>
      )}

      {sub.status === 'cancelled' && sub.cancelled_at && (
        <p className="text-xs text-slate-400 inline-flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
          <XCircle className="w-3 h-3" />
          Cancelada el {new Date(sub.cancelled_at).toLocaleDateString('es-CL')}
        </p>
      )}
      {sub.status === 'pending' && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded px-3 py-2 mt-3 inline-flex items-center gap-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Esperando que autorices el cobro en MercadoPago.
        </p>
      )}
    </div>
  )
}
