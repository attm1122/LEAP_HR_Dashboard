export const SCORE_BG = {
  problem: '#D92D20',
  caution: '#F59E0B',
  good: '#34C759',
  excellent: '#15803D'
} as const

export function autoText(hexBg: string): string {
  const hex = hexBg.replace('#', '')
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)

  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5 ? '#1a2433' : '#ffffff'
}

export function scoreColor(
  v: number | null,
  isYn: boolean = false
): { bg: string; fg: string } {
  if (v === null || v === undefined) {
    return { bg: '#f3f4f6', fg: '#9ca3af' }
  }

  if (isYn) {
    return v > 0.5 ? { bg: SCORE_BG.good, fg: autoText(SCORE_BG.good) } : { bg: '#f3f4f6', fg: '#9ca3af' }
  }

  if (v < 4) return { bg: SCORE_BG.problem, fg: autoText(SCORE_BG.problem) }
  if (v < 6) return { bg: SCORE_BG.caution, fg: autoText(SCORE_BG.caution) }
  if (v < 8) return { bg: SCORE_BG.good, fg: autoText(SCORE_BG.good) }
  return { bg: SCORE_BG.excellent, fg: autoText(SCORE_BG.excellent) }
}

export function obRatingColor(v: number | null): { bg: string; fg: string } {
  if (v === null || v === undefined) {
    return { bg: '#f3f4f6', fg: '#9ca3af' }
  }

  if (v < 0.3) return { bg: SCORE_BG.problem, fg: autoText(SCORE_BG.problem) }
  if (v < 0.6) return { bg: SCORE_BG.caution, fg: autoText(SCORE_BG.caution) }
  if (v < 0.8) return { bg: SCORE_BG.good, fg: autoText(SCORE_BG.good) }
  return { bg: SCORE_BG.excellent, fg: autoText(SCORE_BG.excellent) }
}

export function npsColor(n: number | null): { bg: string; fg: string } {
  if (n === null || n === undefined) {
    return { bg: '#f3f4f6', fg: '#9ca3af' }
  }

  if (n < 0) return { bg: SCORE_BG.problem, fg: autoText(SCORE_BG.problem) }
  if (n < 25) return { bg: SCORE_BG.caution, fg: autoText(SCORE_BG.caution) }
  if (n < 50) return { bg: SCORE_BG.good, fg: autoText(SCORE_BG.good) }
  return { bg: SCORE_BG.excellent, fg: autoText(SCORE_BG.excellent) }
}
