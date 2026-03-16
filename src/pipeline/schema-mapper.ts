import type {
  DatasetDetectionResult,
  NormalizedCell,
  NormalizedDataset,
  SemanticField
} from './types'
import type { ProbationEmployee } from '@/domain/models/probation'
import type {
  OnboardingDashboardData,
  OnboardingQuestion,
  OnboardingResponse,
  OnboardingDimension
} from '@/domain/models/onboarding'
import type { OffboardingResponse } from '@/domain/models/offboarding'
import { parseLikertValue, calculateRatingAverage } from '@/domain/models/offboarding'

export function mapToSchema(
  detectionResult: DatasetDetectionResult,
  rows: NormalizedCell[][],
  rawRows: unknown[][]
): NormalizedDataset {
  const { type, fields } = detectionResult

  switch (type) {
    case 'probation-review':
      return {
        type: 'probation-review',
        data: mapToProbation(fields, rows, rawRows)
      }

    case 'onboarding-survey':
      return {
        type: 'onboarding-survey',
        data: mapToOnboarding(fields, rows, rawRows)
      }

    case 'offboarding-survey':
      return {
        type: 'offboarding-survey',
        data: mapToOffboarding(fields, rows, rawRows)
      }

    case 'generic-hr':
      return {
        type: 'generic-hr',
        data: {
          fields,
          rows: rows.map((row) =>
            row.reduce(
              (acc, cell, idx) => {
                const field = fields[idx]
                if (field) {
                  acc[field.header] =
                    cell.parsedNumber ?? (cell.isEmptyLike ? null : cell.trimmed)
                }
                return acc
              },
              {} as Record<string, string | number | null>
            )
          )
        }
      }

    default:
      return { type: 'unknown', data: null }
  }
}

function mapToProbation(
  fields: SemanticField[],
  rows: NormalizedCell[][],
  _rawRows: unknown[][]
): ProbationEmployee[] {
  const employees: ProbationEmployee[] = []

  // Find field indices
  const nameIdx    = fields.findIndex((f) => f.semanticType === 'person-name')
  const idIdx      = fields.findIndex((f) => f.semanticType === 'identifier')
  const periodIdx  = fields.findIndex((f) => f.semanticType === 'probation-period')
  const managerIdx = fields.findIndex((f) => f.semanticType === 'manager-name')

  // LEAP's probation file has names in the "Employee Number" column (col 0)
  // on alternating name rows.  Fall back to idIdx (col 0) when no person-name
  // column exists.
  const effectiveNameIdx = nameIdx >= 0 ? nameIdx : idIdx

  // Find assessment fields (self and manager)
  const selfStatusIdx = fields.findIndex(
    (f) => f.semanticType === 'assessment-status' && f.header.toLowerCase().includes('self')
  )
  const mgrStatusIdx = fields.findIndex(
    (f) => f.semanticType === 'assessment-status' && f.header.toLowerCase().includes('manager')
  )

  // Find score fields
  const selfScoreIdx = fields.findIndex(
    (f) => f.semanticType === 'assessment-score' && f.header.toLowerCase().includes('self')
  )
  const mgrScoreIdx = fields.findIndex(
    (f) => f.semanticType === 'assessment-score' && f.header.toLowerCase().includes('manager')
  )

  // Find date fields
  const selfDateIdx = fields.findIndex(
    (f) => f.semanticType === 'date' && f.header.toLowerCase().includes('self')
  )
  const mgrDateIdx = fields.findIndex(
    (f) => f.semanticType === 'date' && f.header.toLowerCase().includes('manager')
  )

  // Notes index: column after the last date field (or last field)
  const notesIdx = (() => {
    const notesField = fields.findIndex((f) => f.semanticType === 'comment-text')
    if (notesField >= 0) return notesField
    const lastDate = Math.max(selfDateIdx, mgrDateIdx)
    return lastDate >= 0 ? lastDate + 1 : -1
  })()

  // Process rows (skip header row 0 — rows array already starts from row index 1
  // of the sheet, so we iterate from index 0 here which is sheet row 1).
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]

    // Skip completely empty rows
    if (row.every((c) => c.isEmptyLike)) continue

    // Detect name-only row: effectiveNameIdx cell is non-empty, all others empty.
    // This handles LEAP's alternating-row format where employee names appear on
    // their own row and data follows on the next row.
    const isNameRow =
      effectiveNameIdx >= 0 &&
      !row[effectiveNameIdx]?.isEmptyLike &&
      allOtherEmpty(row, effectiveNameIdx)

    if (isNameRow && i + 1 < rows.length) {
      const dataRow = rows[i + 1]
      const name    = row[effectiveNameIdx]?.trimmed || ''

      // In the data row col 0 may be the employee ID (or empty if not assigned)
      const id = nameIdx >= 0 ? (dataRow[idIdx]?.trimmed || '') : (dataRow[idIdx]?.trimmed || '')

      const emp: ProbationEmployee = {
        name,
        id,
        period:     dataRow[periodIdx]?.trimmed  || '',
        manager:    dataRow[managerIdx]?.trimmed  || '',
        selfStatus: dataRow[selfStatusIdx]?.normalizedStatus || null,
        selfScore:  dataRow[selfScoreIdx]?.parsedNumber  ?? null,
        selfDate:   dataRow[selfDateIdx]?.parsedDate    ?? null,
        mgrStatus:  dataRow[mgrStatusIdx]?.normalizedStatus  || null,
        mgrScore:   dataRow[mgrScoreIdx]?.parsedNumber   ?? null,
        mgrDate:    dataRow[mgrDateIdx]?.parsedDate     ?? null,
        notes:      notesIdx >= 0 ? (dataRow[notesIdx]?.trimmed || null) : null
      }

      employees.push(emp)
      i++ // skip the data row
      continue
    }

    // Flat row pattern (single row per employee, person-name column present)
    if (nameIdx >= 0 && !row[nameIdx]?.isEmptyLike) {
      const emp: ProbationEmployee = {
        name:       row[nameIdx]?.trimmed  || '',
        id:         row[idIdx]?.trimmed    || '',
        period:     row[periodIdx]?.trimmed  || '',
        manager:    row[managerIdx]?.trimmed  || '',
        selfStatus: row[selfStatusIdx]?.normalizedStatus || null,
        selfScore:  row[selfScoreIdx]?.parsedNumber  ?? null,
        selfDate:   row[selfDateIdx]?.parsedDate    ?? null,
        mgrStatus:  row[mgrStatusIdx]?.normalizedStatus  || null,
        mgrScore:   row[mgrScoreIdx]?.parsedNumber   ?? null,
        mgrDate:    row[mgrDateIdx]?.parsedDate     ?? null,
        notes:      notesIdx >= 0 ? (row[notesIdx]?.trimmed || null) : null
      }
      employees.push(emp)
    }
  }

  return employees
}

function mapToOnboarding(
  fields: SemanticField[],
  rows: NormalizedCell[][],
  _rawRows: unknown[][]
): OnboardingDashboardData {
  // ── Respondent-per-row format (LEAP Transform sheet) ──────────────────────
  // Score columns end with "_Score" (camelCase-split → "... score" by the
  // profiler), have numeric 1-5 values, and are classified as survey-score.
  // One response per QUESTION is built by aggregating across respondents,
  // grouped by dimension value so the heatmap can colour each cell.

  const buColIdx  = fields.findIndex((f) => f.semanticType === 'business-unit')
  const locColIdx = fields.findIndex((f) => f.semanticType === 'location')
  const tenColIdx = fields.findIndex((f) => f.semanticType === 'tenure-band')

  // Collect score column indices (survey-score type)
  const scoreColIndices = fields
    .map((f, idx) => (f.semanticType === 'survey-score' ? idx : -1))
    .filter((idx) => idx >= 0)

  const empty: OnboardingDashboardData = {
    questions: [], dimensions: {}, responses: [], totalRespondents: 0, visibleQuestions: []
  }
  if (scoreColIndices.length === 0) return empty

  // Non-empty data rows only
  const dataRows = rows.filter((row) => !row.every((c) => c.isEmptyLike))

  // Build dimension value sets
  const buValues  = new Set<string>()
  const locValues = new Set<string>()
  const tenValues = new Set<string>()
  dataRows.forEach((row) => {
    if (buColIdx  >= 0) { const v = row[buColIdx]?.trimmed;  if (v) buValues.add(v)  }
    if (locColIdx >= 0) { const v = row[locColIdx]?.trimmed; if (v) locValues.add(v) }
    if (tenColIdx >= 0) { const v = row[tenColIdx]?.trimmed; if (v) tenValues.add(v) }
  })

  const dimensions: Record<string, OnboardingDimension[]> = {}
  if (buValues.size  > 0) dimensions['bu']  = Array.from(buValues).map((v)  => ({ value: v, count: 0 }))
  if (locValues.size > 0) dimensions['loc'] = Array.from(locValues).map((v) => ({ value: v, count: 0 }))
  if (tenValues.size > 0) dimensions['ten'] = Array.from(tenValues).map((v) => ({ value: v, count: 0 }))

  // Build one Question + one aggregated Response per score column
  const questions: OnboardingQuestion[] = scoreColIndices.map((idx, qi) => ({
    id:   `q_${qi}`,
    // Strip trailing "_Score" / "Score" suffix that the column profiler added
    text: fields[idx].header
      .replace(/\s*score\s*$/i, '')
      .replace(/\._?$/,         '')
      .trim()
  }))

  const responses: OnboardingResponse[] = scoreColIndices.map((scoreIdx, qi) => {
    const qId = `q_${qi}`

    // Overall average across all respondents
    const allNums = dataRows
      .map((row) => row[scoreIdx]?.parsedNumber ?? null)
      .filter((n): n is number => n !== null)
    const allScore = allNums.length > 0
      ? allNums.reduce((a, b) => a + b, 0) / allNums.length
      : null

    // Average per dimension value (used by the heatmap)
    const scores: Record<string, number | null> = {}

    const addDimAvg = (values: Set<string>, colIdx: number) => {
      values.forEach((dimVal) => {
        const nums = dataRows
          .filter((row) => row[colIdx]?.trimmed === dimVal)
          .map((row)  => row[scoreIdx]?.parsedNumber ?? null)
          .filter((n): n is number => n !== null)
        scores[dimVal] = nums.length > 0
          ? nums.reduce((a, b) => a + b, 0) / nums.length
          : null
      })
    }

    if (buColIdx  >= 0) addDimAvg(buValues,  buColIdx)
    if (locColIdx >= 0) addDimAvg(locValues, locColIdx)
    if (tenColIdx >= 0) addDimAvg(tenValues, tenColIdx)

    return { id: qId, allScore, scores }
  })

  return {
    questions,
    dimensions,
    responses,
    totalRespondents: dataRows.length,
    visibleQuestions: questions.map((q) => q.id)
  }
}

function mapToOffboarding(
  fields: SemanticField[],
  rows: NormalizedCell[][],
  _rawRows: unknown[][]
): OffboardingResponse[] {
  const responses: OffboardingResponse[] = []

  // Find field indices
  const idIdx = fields.findIndex((f) => f.semanticType === 'identifier')
  const buIdx = fields.findIndex((f) => f.semanticType === 'business-unit')
  const tenureIdx = fields.findIndex((f) => f.semanticType === 'tenure-band')
  const driverIdx = fields.findIndex((f) => f.semanticType === 'exit-reason')

  // Find survey score columns
  const scoreIndices = fields
    .map((f, idx) => (f.semanticType === 'survey-score' ? idx : -1))
    .filter((idx) => idx >= 0)

  // Process rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Skip empty rows
    if (row.every((c) => c.isEmptyLike)) continue

    const id = row[idIdx]?.trimmed || `respondent_${i}`
    const bu = row[buIdx]?.trimmed || null
    const tenure = row[tenureIdx]?.trimmed || null
    const driver = row[driverIdx]?.trimmed || null

    const ratings: Record<string, number> = {}
    let ratingValue: number | null = null

    for (const scoreIdx of scoreIndices) {
      const field = fields[scoreIdx]
      const cell = row[scoreIdx]
      // parsedNumber is set by either the Likert parser (1-5) or the numeric
      // parser; fall back to parseLikertValue on the raw text for safety.
      const parsed =
        cell?.parsedNumber ??
        (cell?.trimmed ? parseLikertValue(cell.trimmed) : null)

      if (parsed !== null) {
        ratings[field.header] = parsed
      }
    }

    ratingValue = calculateRatingAverage(ratings)

    responses.push({
      id,
      ratingValue,
      bu,
      tenure,
      driver,
      ratings
    })
  }

  return responses
}

function allOtherEmpty(row: NormalizedCell[], exceptIdx: number): boolean {
  for (let i = 0; i < row.length; i++) {
    if (i !== exceptIdx && row[i] && !row[i].isEmptyLike) {
      return false
    }
  }
  return true
}
