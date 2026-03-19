'use client'
import { useRef, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SaveCaseMessage } from '@/lib/types'

interface SimulatorFrameProps {
  toolPath: '/tools/evar.html' | '/tools/fevar.html'
  caseType: 'evar' | 'fevar'
}

export default function SimulatorFrame({ toolPath, caseType }: SimulatorFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()
  const supabase = createClient()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = useCallback(async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return
    const msg = event.data as SaveCaseMessage
    if (msg?.type !== 'SAVE_CASE') return

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let pdf_url: string | null = null

      if (msg.payload.pdfBase64) {
        const base64Data = msg.payload.pdfBase64.split(',')[1]
        const pdfBlob = await fetch(`data:application/pdf;base64,${base64Data}`).then(r => r.blob())
        const fileName = `${user.id}/${caseType}-${Date.now()}.pdf`
        const { error: uploadError } = await supabase.storage
          .from('case-pdfs').upload(fileName, pdfBlob, { contentType: 'application/pdf' })
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('case-pdfs').getPublicUrl(fileName)
          pdf_url = publicUrl
        }
      }

      await supabase.from('cases').insert({
        user_id: user.id,
        type: caseType,
        patient_ref: msg.payload.patientRef || 'Paciente',
        notes: msg.payload.notes || null,
        pdf_url,
      })

      setSaved(true)
      setTimeout(() => router.push('/dashboard/mis-casos'), 1500)
    } catch (err) {
      console.error('Error saving case:', err)
    } finally {
      setSaving(false)
    }
  }, [caseType, supabase, router])

  useEffect(() => {
    window.addEventListener('message', handleSave)
    return () => window.removeEventListener('message', handleSave)
  }, [handleSave])

  function requestSave() {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      { type: 'REQUEST_SAVE' },
      window.location.origin
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      <div className="h-10 bg-vp-dark flex items-center justify-between px-4 flex-shrink-0 z-50">
        <button onClick={() => router.back()}
          className="text-white/70 hover:text-white text-xs flex items-center gap-1.5 transition-colors">
          ← Volver
        </button>
        <span className="text-white/50 text-xs uppercase tracking-widest">
          {caseType === 'evar' ? 'EVAR — Simulador' : 'FEVAR — Simulador Fenestrado'}
        </span>
        <button
          onClick={requestSave}
          disabled={saving || saved}
          className={`text-xs font-bold px-4 py-1 rounded transition-colors
            ${saved ? 'bg-green-500 text-white' : 'bg-vp-red text-white hover:bg-vp-red/80'}
            disabled:opacity-60`}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : 'Guardar caso'}
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={toolPath}
        className="flex-1 w-full border-none"
        sandbox="allow-scripts allow-same-origin allow-downloads"
        title={caseType === 'evar' ? 'Simulador EVAR' : 'Simulador FEVAR'}
      />
    </div>
  )
}
