export interface ProbationEmployee {
  name: string
  id: string
  period: string
  manager: string
  selfStatus: string | null   // text: Completed / Not Started / In Progress / Skipped
  selfScore: number | null    // numeric score 0–10 if present in the sheet
  selfDate: string | null
  mgrStatus: string | null
  mgrScore: number | null
  mgrDate: string | null
  notes: string | null
}

export type ProbationStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Skipped'

export function getStatusKey(status: string | null | undefined): ProbationStatus {
  if (!status || typeof status !== 'string') return 'Not Started'
  const n = status.trim().toLowerCase()
  if (n === 'completed' || n === 'complete') return 'Completed'
  if (n === 'in progress' || n === 'in-progress') return 'In Progress'
  if (n === 'skipped') return 'Skipped'
  return 'Not Started'
}

export function assessmentIsComplete(status: string | null | undefined): boolean {
  return getStatusKey(status) === 'Completed'
}

export const STATUS_COLORS: Record<ProbationStatus, { bg: string; fg: string }> = {
  Completed: { bg: '#15803D', fg: '#ffffff' },
  'In Progress': { bg: '#F59E0B', fg: '#1a2433' },
  'Not Started': { bg: '#f3f4f6', fg: '#6b7280' },
  Skipped: { bg: '#6b7280', fg: '#ffffff' }
}
