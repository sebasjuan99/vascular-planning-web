'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { COURSES } from '@/lib/courses'

// MercadoPago redirects here after a successful payment with query params:
//   payment_id, status, external_reference, payment_type, etc.
//
// The webhook usually fires before this redirect, but not always. We poll
// /api/payments/my-courses until the newly purchased course shows up, then
// redirect to /dashboard/cursos/[courseId].

const MAX_POLLS = 15
const POLL_MS = 2000

export default function PagoSuccessPage() {
  return (
    <Suspense fallback={<Shell><p className="text-sm text-slate-500">Cargando...</p></Shell>}>
      <PagoSuccessInner />
    </Suspense>
  )
}

function PagoSuccessInner() {
  const router = useRouter()
  const search = useSearchParams()
  const [polls, setPolls] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [targetCourseId, setTargetCourseId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | null = null

    // 1. First, try active verification using the payment_id from MP redirect.
    // This doesn't depend on the webhook firing — we ask MP directly and
    // update the DB ourselves. Falls back to polling on any failure.
    async function verifyDirect(): Promise<string | null> {
      const paymentId =
        search.get('payment_id') ||
        search.get('collection_id') ||
        ''
      if (!paymentId) return null

      try {
        const res = await fetch('/api/payments/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentId }),
          cache: 'no-store',
        })
        if (res.status === 401) {
          router.push('/login?redirect=/dashboard/cursos')
          return null
        }
        const data = await res.json()
        if (data?.status === 'approved' && data?.courseId) {
          return String(data.courseId)
        }
      } catch {
        // Ignore, fall back to polling
      }
      return null
    }

    async function poll(attempt: number) {
      if (cancelled) return
      setPolls(attempt)

      try {
        const res = await fetch('/api/payments/my-courses', { cache: 'no-store' })
        if (res.status === 401) {
          router.push('/login?redirect=/dashboard/cursos')
          return
        }
        const data = await res.json()
        const ownedIds = new Set<string>(
          Array.isArray(data?.courses)
            ? data.courses.map((c: { courseId: string }) => c.courseId)
            : []
        )

        // Find the first owned courseId — for new buyers, that IS the one
        // they just paid for.
        const owned = Array.from(ownedIds)
        if (owned.length > 0) {
          const target = owned.length === 1 ? owned[0] : null
          if (target && COURSES.some((c) => c.id === target)) {
            setTargetCourseId(target)
            setTimeout(() => router.push(`/dashboard/cursos/${target}`), 800)
          } else {
            setTimeout(() => router.push('/dashboard/cursos'), 800)
          }
          return
        }

        if (attempt >= MAX_POLLS) {
          setError(
            'El pago está siendo procesado. Aparecerá en tu lista de cursos en unos minutos.'
          )
          return
        }

        timer = setTimeout(() => poll(attempt + 1), POLL_MS)
      } catch {
        if (attempt >= MAX_POLLS) {
          setError('No pudimos confirmar el pago. Revisa "Cursos" en tu dashboard.')
          return
        }
        timer = setTimeout(() => poll(attempt + 1), POLL_MS)
      }
    }

    async function run() {
      const direct = await verifyDirect()
      if (cancelled) return
      if (direct) {
        setTargetCourseId(direct)
        setTimeout(() => router.push(`/dashboard/cursos/${direct}`), 800)
        return
      }
      // Fallback to polling my-courses (in case the webhook eventually fires)
      poll(1)
    }

    run()
    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [router, search])

  return (
    <Shell>
      {error ? (
        <>
          <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-9 h-9 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Pago recibido</h1>
          <p className="text-sm text-slate-500 mb-6">{error}</p>
          <Link
            href="/dashboard/cursos"
            className="inline-block bg-[#0058bc] hover:bg-[#004493] text-white text-sm font-semibold px-6 py-2.5 rounded-lg"
          >
            Ir a mis cursos
          </Link>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-6">
            {targetCourseId ? (
              <CheckCircle2 className="w-9 h-9 text-emerald-600" />
            ) : (
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            )}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {targetCourseId ? '¡Pago confirmado!' : 'Confirmando tu pago...'}
          </h1>
          <p className="text-sm text-slate-500 mb-2">
            {targetCourseId
              ? 'Redirigiendo a tu curso...'
              : `Esto puede tardar unos segundos.${polls > 4 ? ` (intento ${polls}/${MAX_POLLS})` : ''}`}
          </p>
        </>
      )}
    </Shell>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
        {children}
      </div>
    </div>
  )
}
