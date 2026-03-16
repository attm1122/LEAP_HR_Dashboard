export function formatPercent(value: number | null, decimals: number = 0): string {
  if (value === null || isNaN(value)) return '-'
  const percent = value * 100
  return `${percent.toFixed(decimals)}%`
}

export function formatCount(value: number | null): string {
  if (value === null) return '0'
  return String(Math.round(value))
}

export function formatScore(value: number | null, decimals: number = 1): string {
  if (value === null || isNaN(value)) return '-'
  return value.toFixed(decimals)
}

export function formatRatio(numerator: number, denominator: number): string {
  if (denominator === 0) return '0%'
  return formatPercent(numerator / denominator, 1)
}
