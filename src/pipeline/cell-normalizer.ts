import type { NormalizedCell, CellValueKind } from './types'

// ── Likert scale map (Strongly Agree…Strongly Disagree → 1–5) ───────────────
// Parsed BEFORE status so these values get a parsedNumber rather than a
// normalizedStatus, making them detectable as survey-score by the profiler.
const LIKERT_SCORES: Record<string, number> = {
  'strongly agree':    5,
  'strongly agrees':   5,
  'agree':             4,
  'agrees':            4,
  'somewhat agree':    4,
  'neutral':           3,
  'neither agree nor disagree': 3,
  'disagree':          2,
  'disagrees':         2,
  'somewhat disagree': 2,
  'strongly disagree': 1,
  'strongly disagrees':1,
}

function tryParseLikert(trimmed: string): number | null {
  return LIKERT_SCORES[trimmed.toLowerCase()] ?? null
}

// ── Canonical status map ─────────────────────────────────────────────────────
const STATUS_NORMALIZATION: Record<string, string> = {
  completed: 'Completed',
  complete: 'Completed',
  done: 'Completed',
  'not started': 'Not Started',
  'not-started': 'Not Started',
  'not complete': 'Not Started',
  'in progress': 'In Progress',
  'in-progress': 'In Progress',
  'inprogress': 'In Progress',
  pending: 'Pending',
  skipped: 'Skipped',
  overdue: 'Overdue',
}

const EMPTY_LIKE_SET = new Set(['-', 'n/a', 'na', 'n.a.', 'nil', 'none', '--', '—', 'null', 'undefined'])

// ── Helper predicates ────────────────────────────────────────────────────────

function isEmptyLikeStr(trimmed: string): boolean {
  return EMPTY_LIKE_SET.has(trimmed.toLowerCase())
}

function tryParseBoolean(trimmed: string): boolean | null {
  const lower = trimmed.toLowerCase()
  if (['yes', 'y', 'true'].includes(lower)) return true
  if (['no', 'n', 'false'].includes(lower)) return false
  return null
}

function tryParseStatus(trimmed: string): string | null {
  return STATUS_NORMALIZATION[trimmed.toLowerCase()] ?? null
}

function tryParsePercentage(trimmed: string): number | null {
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)%$/)
  if (!match) return null
  return parseFloat(match[1]) / 100
}

/**
 * Currency strings MUST have a recognised currency symbol or code prefix,
 * OR contain at least one comma-separated thousands group (e.g. "120,000").
 * This prevents plain numbers like "4" or date-ish strings from being
 * mistakenly classified as currency.
 */
function tryParseCurrency(trimmed: string): number | null {
  const hasCurrencySymbol = /^[$£€]/.test(trimmed)
  const hasCurrencyCode = /^(AUD|USD|GBP|EUR|NZD|CAD|SGD)\s/i.test(trimmed)
  // comma-thousands: digit(s), comma, exactly 3 digits (repeated)
  const hasThousandsComma = /^\d{1,3}(,\d{3})+(\.\d+)?$/.test(trimmed)

  if (!hasCurrencySymbol && !hasCurrencyCode && !hasThousandsComma) return null

  // Strip symbol/code prefix, then parse digits with optional commas
  const stripped = trimmed.replace(/^[$£€]/, '').replace(/^(AUD|USD|GBP|EUR|NZD|CAD|SGD)\s*/i, '').trim()
  const numStr = stripped.replace(/,/g, '')
  const num = parseFloat(numStr)
  return isNaN(num) ? null : num
}

/**
 * Strict numeric: the ENTIRE trimmed string must be a valid number.
 * Uses a tight regex so "2026-03-16" or "4abc" are rejected.
 */
function tryParseNumeric(trimmed: string): number | null {
  // Allow: optional leading minus, digits, optional decimal point + digits
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return null
  const num = parseFloat(trimmed)
  return isNaN(num) ? null : num
}

/**
 * Date detection — checked BEFORE numeric to ensure ISO dates aren't
 * swallowed by the numeric parser.
 */
function tryParseDate(trimmed: string): string | null {
  // ISO date: YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed + 'T00:00:00Z')
    if (!isNaN(d.getTime())) return trimmed
  }

  // ISO datetime (keep date part)
  const isoFull = trimmed.match(/^(\d{4}-\d{2}-\d{2})T/)
  if (isoFull) return isoFull[1]

  // DD/MM/YYYY  (prefer this interpretation for HR data in AU)
  const dmyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    const dt = new Date(iso + 'T00:00:00Z')
    if (!isNaN(dt.getTime())) return iso
  }

  // DD-MM-YYYY
  const dmyDash = trimmed.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/)
  if (dmyDash) {
    const [, d, m, y] = dmyDash
    const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    const dt = new Date(iso + 'T00:00:00Z')
    if (!isNaN(dt.getTime())) return iso
  }

  // Month Year: "March 2026" | "Mar 2026"
  const monthYearMatch = trimmed.match(/^([A-Za-z]+)\s+(\d{4})$/)
  if (monthYearMatch) {
    const [, monthName, year] = monthYearMatch
    const months: Record<string, number> = {
      january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
      july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
      jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8,
      sep: 9, oct: 10, nov: 11, dec: 12,
    }
    const month = months[monthName.toLowerCase()]
    if (month) {
      const yr = parseInt(year, 10)
      if (yr >= 1900 && yr <= 2100) {
        return `${year}-${String(month).padStart(2, '0')}-01`
      }
    }
  }

  return null
}

// ── Main export ──────────────────────────────────────────────────────────────

/**
 * Normalizes a raw spreadsheet cell value into a typed, structured
 * NormalizedCell. Detection order is deliberate — date before numeric
 * to prevent ISO date strings being mis-classified as numbers.
 */
export function normalizeCell(raw: unknown): NormalizedCell {
  const text = raw == null ? '' : String(raw)
  const trimmed = text.trim()

  // 1. Null / undefined / empty string
  if (raw === null || raw === undefined || trimmed === '') {
    return { raw, text, trimmed, kind: 'empty', isEmptyLike: true }
  }

  // 2. Empty-like strings ("-", "N/A", etc.)
  if (typeof raw === 'string' && isEmptyLikeStr(trimmed)) {
    return { raw, text, trimmed, kind: 'string', isEmptyLike: true }
  }

  // 3. Native JS number
  if (typeof raw === 'number') {
    return { raw, text, trimmed, kind: 'number', parsedNumber: raw, isEmptyLike: false }
  }

  // 4. Native JS boolean
  if (typeof raw === 'boolean') {
    return { raw, text, trimmed, kind: 'boolean', parsedBoolean: raw, isEmptyLike: false }
  }

  // 5. JS Date (from SheetJS cellDates:true)
  if (raw instanceof Date) {
    return {
      raw, text, trimmed, kind: 'date',
      parsedDate: raw.toISOString().split('T')[0],
      isEmptyLike: false,
    }
  }

  // String processing — order matters
  if (typeof raw === 'string') {
    // 6. Boolean-like strings ("Yes", "No", "TRUE", "FALSE", "Y", "N")
    const boolVal = tryParseBoolean(trimmed)
    if (boolVal !== null) {
      return { raw, text, trimmed, kind: 'boolean-string', parsedBoolean: boolVal, isEmptyLike: false }
    }

    // 6.5 Likert scale strings — parsed BEFORE status so they get a parsedNumber
    const likertVal = tryParseLikert(trimmed)
    if (likertVal !== null) {
      return { raw, text, trimmed, kind: 'numeric-string', parsedNumber: likertVal, isEmptyLike: false }
    }

    // 7. Status strings ("Completed", "In Progress", etc.)
    const statusVal = tryParseStatus(trimmed)
    if (statusVal !== null) {
      return { raw, text, trimmed, kind: 'status-string', normalizedStatus: statusVal, isEmptyLike: false }
    }

    // 8. Date-like strings — BEFORE numeric so "2026-03-16" isn't misclassified
    const dateVal = tryParseDate(trimmed)
    if (dateVal !== null) {
      return { raw, text, trimmed, kind: 'date-string', parsedDate: dateVal, isEmptyLike: false }
    }

    // 9. Percentage strings ("85%", "85.5%")
    const percentVal = tryParsePercentage(trimmed)
    if (percentVal !== null) {
      return { raw, text, trimmed, kind: 'percentage-string', parsedNumber: percentVal, isEmptyLike: false }
    }

    // 10. Currency strings (requires symbol or thousands-comma — not plain digits)
    const currencyVal = tryParseCurrency(trimmed)
    if (currencyVal !== null) {
      return { raw, text, trimmed, kind: 'currency-string', parsedNumber: currencyVal, isEmptyLike: false }
    }

    // 11. Strict numeric strings ("4", "4.75", "-3.2")
    const numVal = tryParseNumeric(trimmed)
    if (numVal !== null) {
      return { raw, text, trimmed, kind: 'numeric-string', parsedNumber: numVal, isEmptyLike: false }
    }

    // 12. Everything else is a plain string
    return { raw, text, trimmed, kind: 'string', isEmptyLike: false }
  }

  // Fallback for unexpected types
  return { raw, text, trimmed, kind: 'string', isEmptyLike: false }
}

// ── Convenience predicates ───────────────────────────────────────────────────

export function isNumericLike(kind: CellValueKind): boolean {
  return kind === 'number' || kind === 'numeric-string'
}

export function isDateLike(kind: CellValueKind): boolean {
  return kind === 'date' || kind === 'date-string'
}

export function isStatusLike(kind: CellValueKind): boolean {
  return kind === 'status-string'
}

export function isBooleanLike(kind: CellValueKind): boolean {
  return kind === 'boolean' || kind === 'boolean-string'
}
