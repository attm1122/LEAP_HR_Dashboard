import type { PipelineResult, PipelineStage, PipelineError, SemanticFieldType } from '@/pipeline/types'

export type Module = 'probation' | 'onboarding' | 'offboarding'
export type Dimension = 'bu' | 'loc' | 'ten'

// ── Probation ──────────────────────────────────────────────────────────────────
export interface ProbationEmployee {
  name: string
  id: string
  period: string
  manager: string
  selfStatus: string | null
  selfScore: number | null
  selfDate: string | null
  mgrStatus: string | null
  mgrScore: number | null
  mgrDate: string | null
  notes: string | null
}

// ── Onboarding ─────────────────────────────────────────────────────────────────
export interface OnboardingQuestion {
  id: string
  text: string
}

export interface OnboardingDimension {
  value: string
  count: number
}

export interface OnboardingResponse {
  id: string
  allScore: number | null
  scores: Record<string, number | null>
}

export interface OnboardingDashboardData {
  questions: OnboardingQuestion[]
  dimensions: Record<string, OnboardingDimension[]>
  responses: OnboardingResponse[]
  totalRespondents: number
  visibleQuestions: string[]
}

// ── Offboarding ────────────────────────────────────────────────────────────────
export interface OffboardingResponse {
  id: string
  ratingValue: number | null
  bu: string | null
  tenure: string | null
  driver: string | null
  ratings: Record<string, number>
}

// ── Pipeline State ─────────────────────────────────────────────────────────────
export interface PipelineState {
  stage: PipelineStage
  currentFile: string | null
  result: PipelineResult | null
  errors: PipelineError[]
  warnings: any[]
  isRunning: boolean
  showDiagnostics: boolean
  showMappingOverride: boolean
  fieldOverrides: Record<string, Record<number, SemanticFieldType>>
}

// ── App State ──────────────────────────────────────────────────────────────────
export interface AppState {
  probation: ProbationEmployee[] | null
  onboarding: OnboardingDashboardData | null
  offboarding: OffboardingResponse[] | null
  activeModule: Module
  activeDimension: Dimension
  uploadStatus: Record<string, 'idle' | 'parsing' | 'success' | 'error'>
  uploadErrors: Record<string, string>
  probationFilters: {
    manager: string
    selfStatus: string
    mgrStatus: string
    search: string
  }
  offboardingFilters: {
    bu: string
    tenure: string
    driver: string
  }
  isUploadModalOpen: boolean
  pipelineState: PipelineState
  setActiveModule: (module: Module) => void
  setActiveDimension: (dim: Dimension) => void
  setProbation: (data: ProbationEmployee[] | null) => void
  setOnboarding: (data: OnboardingDashboardData | null) => void
  setOffboarding: (data: OffboardingResponse[] | null) => void
  setUploadStatus: (module: string, status: 'idle' | 'parsing' | 'success' | 'error') => void
  setUploadError: (module: string, error: string) => void
  clearUploadError: (module: string) => void
  setProbationFilters: (filters: Partial<AppState['probationFilters']>) => void
  setOffboardingFilters: (filters: Partial<AppState['offboardingFilters']>) => void
  setIsUploadModalOpen: (open: boolean) => void
  setPipelineStage: (stage: PipelineStage) => void
  setPipelineResult: (result: PipelineResult | null) => void
  setPipelineErrors: (errors: PipelineError[]) => void
  togglePipelineDiagnostics: () => void
  togglePipelineMappingOverride: () => void
  setFieldOverrides: (module: string, overrides: Record<number, SemanticFieldType>) => void
  resetPipeline: () => void
  reset: () => void
}
