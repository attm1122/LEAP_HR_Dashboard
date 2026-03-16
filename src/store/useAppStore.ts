import { create } from 'zustand'
import type {
  AppState,
  ProbationEmployee,
  OnboardingDashboardData,
  OffboardingResponse,
  Module,
  Dimension
} from '@/types/common'

const initialState = {
  probation: null as ProbationEmployee[] | null,
  onboarding: null as OnboardingDashboardData | null,
  offboarding: null as OffboardingResponse[] | null,
  activeModule: 'probation' as Module,
  activeDimension: 'bu' as Dimension,
  uploadStatus: {} as Record<string, 'idle' | 'parsing' | 'success' | 'error'>,
  uploadErrors: {} as Record<string, string>,
  probationFilters: {
    manager: '',
    selfStatus: '',
    mgrStatus: '',
    search: ''
  },
  offboardingFilters: {
    bu: '',
    tenure: '',
    driver: ''
  },
  isUploadModalOpen: false
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setActiveModule: (module: Module) => set({ activeModule: module }),

  setActiveDimension: (dim: Dimension) => set({ activeDimension: dim }),

  setProbation: (data: ProbationEmployee[] | null) => set({ probation: data }),

  setOnboarding: (data: OnboardingDashboardData | null) => set({ onboarding: data }),

  setOffboarding: (data: OffboardingResponse[] | null) => set({ offboarding: data }),

  setUploadStatus: (module: string, status: 'idle' | 'parsing' | 'success' | 'error') =>
    set((state) => ({
      uploadStatus: { ...state.uploadStatus, [module]: status }
    })),

  setUploadError: (module: string, error: string) =>
    set((state) => ({
      uploadErrors: { ...state.uploadErrors, [module]: error }
    })),

  clearUploadError: (module: string) =>
    set((state) => {
      const errors = { ...state.uploadErrors }
      delete errors[module]
      return { uploadErrors: errors }
    }),

  setProbationFilters: (filters) =>
    set((state) => ({
      probationFilters: { ...state.probationFilters, ...filters }
    })),

  setOffboardingFilters: (filters) =>
    set((state) => ({
      offboardingFilters: { ...state.offboardingFilters, ...filters }
    })),

  setIsUploadModalOpen: (open: boolean) => set({ isUploadModalOpen: open }),

  reset: () => set(initialState)
}))
