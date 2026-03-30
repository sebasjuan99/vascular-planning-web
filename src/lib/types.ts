export type CaseType = 'evar' | 'fevar'

export interface Case {
  id: string
  user_id: string
  type: CaseType
  patient_ref: string
  notes: string | null
  pdf_url: string | null
  measurements: Record<string, number> | null
  created_at: string
}

export interface Consultation {
  id: string
  user_id: string
  case_id: string | null
  description: string
  urgency: 'electiva' | 'urgente'
  status: 'pending' | 'in_review' | 'resolved'
  created_at: string
}

export interface SaveCaseMessage {
  type: 'SAVE_CASE'
  payload: {
    patientRef: string
    notes: string
    measurements: Record<string, number>
    pdfBase64: string | null
  }
}
