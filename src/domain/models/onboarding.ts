export interface OnboardingQuestion {
  id: string
  text: string
}

export interface OnboardingDimension {
  value: string
  count: number
}

/**
 * Per-question response data.
 * allScore: the overall average (from the "All" summary column).
 * scores: map from dimension sub-header value (e.g. "Commercial") → avg score (1-5).
 */
export interface OnboardingResponse {
  id: string
  allScore: number | null
  scores: Record<string, number | null>
}

export interface OnboardingDashboardData {
  questions: OnboardingQuestion[]
  /** dimKey ('bu' | 'loc' | 'ten') → array of dimension values with respondent counts */
  dimensions: Record<string, OnboardingDimension[]>
  responses: OnboardingResponse[]
  totalRespondents: number
  visibleQuestions: string[]
}

export function createEmptyOnboardingData(): OnboardingDashboardData {
  return {
    questions: [],
    dimensions: {},
    responses: [],
    totalRespondents: 0,
    visibleQuestions: []
  }
}
