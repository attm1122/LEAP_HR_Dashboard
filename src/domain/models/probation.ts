export interface ProbationEmployee {
  name: string
  id: string
  period: string
  manager: string
  selfAssess: number | null
  selfDate: string | null
  mgrAssess: number | null
  mgrDate: string | null
  notes: string | null
}

export type ProbationStatus = 'Completed' | 'In Progress' | 'Not Started' | 'Skipped'

export function getStatusKey(status: string | null | undefined): ProbationStatus {
  if (!status || typeof status !== 'string') return 'Not Started'
  const normalized = status.trim().toLowerCase()
  if (normalized === 'completed') return 'Completed'
  if (normalized === 'in progress') return 'In Progress'
  if (normalized === 'skipped') return 'Skipped'
  return 'Not Started'
}

export function assessmentIsComplete(assessment: number | null, date: string | null): boolean {
  return assessment !== null && assessment >= 0 && date !== null && date.trim().length > 0
}
