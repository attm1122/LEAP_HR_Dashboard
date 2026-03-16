export function normalizeForComparison(text: string | null | undefined): string {
  if (!text) return ''
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s]/g, '')
}

export function textMatches(text: string | null | undefined, target: string): boolean {
  return normalizeForComparison(text) === normalizeForComparison(target)
}

export function textContains(
  text: string | null | undefined,
  substring: string,
  caseSensitive: boolean = false
): boolean {
  if (!text) return false
  const haystack = caseSensitive ? String(text) : String(text).toLowerCase()
  const needle = caseSensitive ? substring : substring.toLowerCase()
  return haystack.includes(needle)
}

export function textMatchesRegex(text: string | null | undefined, pattern: RegExp): boolean {
  if (!text) return false
  return pattern.test(String(text))
}

export function isYesNo(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const str = String(value).trim().toLowerCase()
  return str === 'yes' || str === 'no' || str === 'y' || str === 'n'
}

export function isYes(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const str = String(value).trim().toLowerCase()
  return str === 'yes' || str === 'y'
}

export function isLikert(value: unknown): boolean {
  if (value === null || value === undefined) return false
  const str = String(value).trim().toLowerCase()
  return (
    str === 'strongly agree' ||
    str === 'agree' ||
    str === 'neutral' ||
    str === 'disagree' ||
    str === 'strongly disagree'
  )
}

export function isNumeric(value: unknown): boolean {
  if (value === null || value === undefined || value === '') return false
  const num = parseFloat(String(value))
  return !isNaN(num) && isFinite(num)
}
