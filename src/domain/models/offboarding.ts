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
  'Agree': 4,
  'Neutral': 3,
  'Disagree': 2,
  'Strongly Disagree': 1
}

export function parseLikertValue(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    if (value >= 1 && value <= 5) return value
    return null
  }
  const normalized = String(value).trim()
  if (normalized === '') return null
  for (const [key, num] of Object.entries(LIKERT_VALUES)) {
    if (key.toLowerCase() === normalized.toLowerCase()) {
      return num
    }
  }
  return null
}

export function calculateRatingAverage(ratings: Record<string, number>): number | null {
  const values = Object.values(ratings).filter((v) => v !== null && !isNaN(v))
  if (values.length === 0) return null
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
}
