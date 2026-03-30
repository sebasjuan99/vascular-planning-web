'use client'
import { useRef, useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { SaveCaseMessage, Case } from '@/lib/types'

interface SimulatorFrameProps {
  toolPath: '/tools/evar.html' | '/tools/fevar.html'
  caseType: 'evar' | 'fevar'
  existingCase?: Case | null
}

export default function SimulatorFrame({ toolPath, caseType, existingCase }: SimulatorFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [iframeReady, setIframeReady] = useState(false)

  // Send existing case data to iframe once it's loaded
  useEffect(() => {
    if (!iframeReady || !existingCase || !iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage({
      type: 'LOAD_CASE',
      payload: {
        patientRef: existingCase.patient_ref,
        notes: existingCase.notes || '',
        measurements: existingCase.measurements || {},
      }
    }, window.location.origin)
  }, [iframeReady, existingCase])

  const handleMessage = useCallback(async (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return

    // Iframe signals it's ready to receive data
    if (event.data?.type === 'SIMULATOR_READY') {
      setIframeReady(true)
      return
    }

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

      if (existingCase) {
        // Update existing case
        await supabase.from('cases').update({
          patient_ref: msg.payload.patientRef || 'Paciente',
          notes: msg.payload.notes || null,
          measurements: msg.payload.measurements || null,
          ...(pdf_url ? { pdf_url } : {}),
        }).eq('id', existingCase.id)
      } else {
        // Insert new case
        await supabase.from('cases').insert({
          user_id: user.id,
          type: caseType,
          patient_ref: msg.payload.patientRef || 'Paciente',
          notes: msg.payload.notes || null,
          measurements: msg.payload.measurements || null,
          pdf_url,
        })
      }

      setSaved(true)
      setTimeout(() => router.push('/dashboard/mis-casos'), 1500)
    } catch (err) {
      console.error('Error saving case:', err)
    } finally {
      setSaving(false)
    }
  }, [caseType, supabase, router, existingCase])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  function requestSave() {
    if (!iframeRef.current?.contentWindow) return
    iframeRef.current.contentWindow.postMessage(
      { type: 'REQUEST_SAVE' },
      window.location.origin
    )
  }

  return (
    <div className="fixed inset-0 flex flex-col bg-white">
      {/* Top bar */}
      <div className="h-12 bg-vp-dark flex items-center justify-between px-4 flex-shrink-0 z-50">
        <button onClick={() => router.back()}
          className="text-white/70 hover:text-white text-sm flex items-center gap-1.5 transition-colors">
          ← Volver
        </button>
        <span className="text-white/50 text-xs uppercase tracking-widest hidden sm:inline">
          {caseType === 'evar' ? 'EVAR — Simulador' : 'FEVAR — Simulador Fenestrado'}
          {existingCase && ' — Editando caso'}
        </span>
        <button
          onClick={requestSave}
          disabled={saving || saved}
          className={`text-sm font-bold px-5 py-1.5 rounded-lg transition-colors
            ${saved ? 'bg-green-500 text-white' : 'bg-vp-red text-white hover:bg-vp-red/80'}
            disabled:opacity-60`}
        >
          {saved ? '✓ Guardado' : saving ? 'Guardando...' : existingCase ? 'Actualizar caso' : 'Guardar caso'}
        </button>
      </div>

      <iframe
        ref={iframeRef}
        src={toolPath}
        className="flex-1 w-full border-none"
        sandbox="allow-scripts allow-same-origin allow-downloads"
        title={caseType === 'evar' ? 'Simulador EVAR' : 'Simulador FEVAR'}
        onLoad={() => setIframeReady(true)}
      />

      {/* Floating save button for mobile */}
      <button
        onClick={requestSave}
        disabled={saving || saved}
        className={`fixed bottom-6 right-6 z-50 px-6 py-3 rounded-full shadow-lg text-sm font-bold transition-all sm:hidden
          ${saved ? 'bg-green-500 text-white' : 'bg-vp-red text-white hover:bg-vp-red/80 animate-pulse'}
          disabled:opacity-60 disabled:animate-none`}
      >
        {saved ? '✓ Guardado' : saving ? 'Guardando...' : existingCase ? 'Actualizar' : 'Guardar caso'}
      </button>
    </div>
  )
}
