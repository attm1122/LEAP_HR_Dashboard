export interface OffboardingResponse {
  id: string
  ratingValue: number | null
  bu: string | null
  tenure: string | null
  driver: string | null
  ratings: Record<string, number>
}

export const LIKERT_VALUES: Record<string, number> = {
  'Strongly Agree': 5,
  Agree: 4,
  Neutral: 3,
  Disagree: 2,
  'Strongly Disagree': 1,
  // Common alternative labels
  'Very Satisfied': 5,
  Satisfied: 4,
  Unsatisfied: 2,
  'Very Unsatisfied': 1,
  'Strongly satisfied': 5,
  'Not satisfied': 2
}

export function parseLikertValue(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null

  // Already a number
  if (typeof value === 'number') {
    if (value >= 1 && value <= 5) return Math.round(value)
    return null
  }

  const normalized = String(value).trim()
  if (normalized === '') return null

  // Numeric string (e.g. "4", "3.0", "4.5")
  const numVal = parseFloat(normalized)
  if (!isNaN(numVal)) {
    if (numVal >= 1 && numVal <= 5) return Math.round(numVal)
    return null
  }

  // Likert text mapping (case-insensitive)
  const lower = normalized.toLowerCase()
  for (const [key, num] of Object.entries(LIKERT_VALUES)) {
    if (key.toLowerCase() === lower) return num
  }

  return null
}

export function calculateRatingAverage(ratings: Record<string, number>): number | null {
  const values = Object.values(ratings).filter((v) => v !== null && !isNaN(v))
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}
