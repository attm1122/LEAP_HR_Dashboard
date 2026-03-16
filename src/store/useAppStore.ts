import { create } from 'zustand'
import type {
  AppState,
  ProbationEmployee,
  OnboardingDashboardData,
  OffboardingResponse,
  Module,
  Dimension
} from '@/types/common'
import type { PipelineResult, PipelineStage, PipelineError, SemanticFieldType } from '@/pipeline/types'

const initialState = {
  probation: null as ProbationEmployee[] | null,
  onboarding: null as OnboardingDashboardData | null,
  offboarding: null as OffboardingResponse[] | null,
  activeModule: 'probation' as Module,
  activeDimension: 'bu' as Dimension,
  uploadStatus: {} as Record<string, 'idle' | 'parsing' | 'success' | 'error'>,
  uploadErrors: {} as Record<string, string>,
  probationFilters: { manager: '', selfStatus: '', mgrStatus: '', search: '' },
  offboardingFilters: { bu: '', tenure: '', driver: '' },
  isUploadModalOpen: false,
  pipelineState: {
    stage: 'idle' as PipelineStage,
    currentFile: null as string | null,
    result: null as PipelineResult | null,
    errors: [] as PipelineError[],
    warnings: [] as any[],
    isRunning: false,
    showDiagnostics: false,
    showMappingOverride: false,
    fieldOverrides: {} as Record<string, Record<number, SemanticFieldType>>
  }
}

export const useAppStore = create<AppState>((set) => ({
  ...initialState,

  setActiveModule: (module: Module) => set({ activeModule: module }),
  setActiveDimension: (dim: Dimension) => set({ activeDimension: dim }),
  setProbation: (data: ProbationEmployee[] | null) => set({ probation: data }),
  setOnboarding: (data: OnboardingDashboardData | null) => set({ onboarding: data }),
  setOffboarding: (data: OffboardingResponse[] | null) => set({ offboarding: data }),

  setUploadStatus: (module: string, status: 'idle' | 'parsing' | 'success' | 'error') =>
    set((state) => ({ uploadStatus: { ...state.uploadStatus, [module]: status } })),

  setUploadError: (module: string, error: string) =>
    set((state) => ({ uploadErrors: { ...state.uploadErrors, [module]: error } })),

  clearUploadError: (module: string) =>
    set((state) => {
      const errors = { ...state.uploadErrors }
      delete errors[module]
      return { uploadErrors: errors }
    }),

  setProbationFilters: (filters) =>
    set((state) => ({ probationFilters: { ...state.probationFilters, ...filters } })),

  setOffboardingFilters: (filters) =>
    set((state) => ({ offboardingFilters: { ...state.offboardingFilters, ...filters } })),

  setIsUploadModalOpen: (open: boolean) => set({ isUploadModalOpen: open }),

  setPipelineStage: (stage: PipelineStage) =>
    set((state) => ({ pipelineState: { ...state.pipelineState, stage } })),

  setPipelineResult: (result: PipelineResult | null) =>
    set((state) => ({ pipelineState: { ...state.pipelineState, result } })),

  setPipelineErrors: (errors: PipelineError[]) =>
    set((state) => ({ pipelineState: { ...state.pipelineState, errors } })),

  togglePipelineDiagnostics: () =>
    set((s) => ({ pipelineState: { ...s.pipelineState, showDiagnostics: !s.pipelineState.showDiagnostics } })),

  togglePipelineMappingOverride: () =>
    set((s) => ({ pipelineState: { ...s.pipelineState, showMappingOverride: !s.pipelineState.showMappingOverride } })),

  setFieldOverrides: (module: string, overrides: Record<number, SemanticFieldType>) =>
    set((s) => ({
      pipelineState: {
        ...s.pipelineState,
        fieldOverrides: { ...s.pipelineState.fieldOverrides, [module]: overrides }
      }
    })),

  resetPipeline: () => set(() => ({ pipelineState: { ...initialState.pipelineState } })),

  reset: () => set(initialState)
}))
