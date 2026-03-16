import { format, parse, isValid } from 'date-fns'

export function parseDate(value: unknown): string | null {
  if (!value) return null

  if (value instanceof Date) {
    if (!isValid(value)) return null
    return format(value, 'yyyy-MM-dd')
  }

  const str = String(value).trim()
  if (!str) return null

  const formats = [
    'yyyy-MM-dd',
    'dd/MM/yyyy',
    'MM/dd/yyyy',
    'yyyy/MM/dd',
    'd/M/yyyy',
    'dd-MM-yyyy',
    'MM-dd-yyyy'
  ]

  for (const fmt of formats) {
    const parsed = parse(str, fmt, new Date())
    if (isValid(parsed)) {
      return format(parsed, 'yyyy-MM-dd')
    }
  }

  return null
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  try {
    const date = parse(dateStr, 'yyyy-MM-dd', new Date())
    return format(date, 'd MMM yyyy')
  } catch {
    return dateStr
  }
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') {
    return isNaN(value) ? null : value
  }
  const num = parseFloat(String(value))
  return isNaN(num) ? null : num
}
