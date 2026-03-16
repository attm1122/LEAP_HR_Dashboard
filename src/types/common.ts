export type Module = 'probation' | 'onboarding' | 'offboarding'
export type Dimension = 'bu' | 'loc' | 'ten'

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

export interface OnboardingQuestion {
  id: string
  text: string
}

export interface OnboardingDimension {
  value: string
  count: number
}

export interface OnboardingRating {
  yes: number
  no: number
}

export interface OnboardingResponse {
  id: string
  all: OnboardingRating
  byDimension: Record<string, OnboardingRating>
}

export interface OnboardingDashboardData {
  questions: OnboardingQuestion[]
  dimensions: Record<string, OnboardingDimension[]>
  responses: OnboardingResponse[]
  visibleQuestions: string[]
}

export interface OffboardingResponse {
  id: string
  ratingValue: number | null
  bu: string | null
  tenure: string | null
  driver: string | null
  ratings: Record<string, number>
}

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
  reset: () => void
}
