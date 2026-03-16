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

export function createEmptyOnboardingData(): OnboardingDashboardData {
  return {
    questions: [],
    dimensions: {},
    responses: [],
    visibleQuestions: []
  }
}
