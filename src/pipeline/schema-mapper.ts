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
  const nameIdx = fields.findIndex((f) => f.semanticType === 'person-name')
  const idIdx = fields.findIndex((f) => f.semanticType === 'identifier')
  const periodIdx = fields.findIndex((f) => f.semanticType === 'probation-period')
  const managerIdx = fields.findIndex((f) => f.semanticType === 'manager-name')

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

  // Process rows (skip header)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]

    // Check if row is empty or is a name-only row (probation alternate row pattern)
    const hasNameOnly = nameIdx >= 0 && !row[nameIdx]?.isEmptyLike && allOtherEmpty(row, nameIdx)
    if (hasNameOnly && i + 1 < rows.length) {
      // This is a name row, next row is data
      const dataRow = rows[i + 1]
      const name = row[nameIdx]?.trimmed || ''

      const emp: ProbationEmployee = {
        name,
        id: dataRow[idIdx]?.trimmed || '',
        period: dataRow[periodIdx]?.trimmed || '',
        manager: dataRow[managerIdx]?.trimmed || '',
        selfStatus: dataRow[selfStatusIdx]?.normalizedStatus || null,
        selfScore: dataRow[selfScoreIdx]?.parsedNumber ?? null,
        selfDate: dataRow[selfDateIdx]?.parsedDate ?? null,
        mgrStatus: dataRow[mgrStatusIdx]?.normalizedStatus || null,
        mgrScore: dataRow[mgrScoreIdx]?.parsedNumber ?? null,
        mgrDate: dataRow[mgrDateIdx]?.parsedDate ?? null,
        notes: dataRow[Math.max(selfDateIdx, mgrDateIdx) + 1]?.trimmed || null
      }

      employees.push(emp)
      i++ // Skip the data row since we just processed it
      continue
    }

    // Flat row pattern
    if (nameIdx >= 0 && !row[nameIdx]?.isEmptyLike) {
      const emp: ProbationEmployee = {
        name: row[nameIdx]?.trimmed || '',
        id: row[idIdx]?.trimmed || '',
        period: row[periodIdx]?.trimmed || '',
        manager: row[managerIdx]?.trimmed || '',
        selfStatus: row[selfStatusIdx]?.normalizedStatus || null,
        selfScore: row[selfScoreIdx]?.parsedNumber ?? null,
        selfDate: row[selfDateIdx]?.parsedDate ?? null,
        mgrStatus: row[mgrStatusIdx]?.normalizedStatus || null,
        mgrScore: row[mgrScoreIdx]?.parsedNumber ?? null,
        mgrDate: row[mgrDateIdx]?.parsedDate ?? null,
        notes: row[Math.max(selfDateIdx, mgrDateIdx) + 1]?.trimmed || null
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
  // Find question text column
  const questionColIdx = fields.findIndex((f) => f.semanticType === 'survey-question-text')
  if (questionColIdx < 0) {
    return {
      questions: [],
      dimensions: {},
      responses: [],
      totalRespondents: 0,
      visibleQuestions: []
    }
  }

  // Find score columns
  const scoreColIndices = fields
    .map((f, idx) => (f.semanticType === 'survey-score' ? idx : -1))
    .filter((idx) => idx >= 0)

  // Find dimension columns
  const buColIdx = fields.findIndex((f) => f.semanticType === 'business-unit')
  const locColIdx = fields.findIndex((f) => f.semanticType === 'location')
  const tenColIdx = fields.findIndex((f) => f.semanticType === 'tenure-band')

  // Build dimensions from first row (assuming categorical headers)
  const dimensions: Record<string, OnboardingDimension[]> = {}
  const buValues = new Set<string>()
  const locValues = new Set<string>()
  const tenValues = new Set<string>()

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    if (buColIdx >= 0 && row[buColIdx] && !row[buColIdx].isEmptyLike) {
      buValues.add(row[buColIdx].trimmed)
    }
    if (locColIdx >= 0 && row[locColIdx] && !row[locColIdx].isEmptyLike) {
      locValues.add(row[locColIdx].trimmed)
    }
    if (tenColIdx >= 0 && row[tenColIdx] && !row[tenColIdx].isEmptyLike) {
      tenValues.add(row[tenColIdx].trimmed)
    }
  }

  if (buValues.size > 0) {
    dimensions['bu'] = Array.from(buValues).map((v) => ({ value: v, count: 0 }))
  }
  if (locValues.size > 0) {
    dimensions['loc'] = Array.from(locValues).map((v) => ({ value: v, count: 0 }))
  }
  if (tenValues.size > 0) {
    dimensions['ten'] = Array.from(tenValues).map((v) => ({ value: v, count: 0 }))
  }

  // Parse questions and responses
  const questions: OnboardingQuestion[] = []
  const responses: OnboardingResponse[] = []
  let totalRespondents = 0

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i]
    const questionText = row[questionColIdx]?.trimmed

    if (!questionText) continue

    const qId = `q_${i - 1}`
    questions.push({ id: qId, text: questionText })

    let allScore: number | null = null
    const scores: Record<string, number | null> = {}

    for (const scoreIdx of scoreColIndices) {
      const field = fields[scoreIdx]
      const scoreVal = row[scoreIdx]?.parsedNumber ?? null

      if (field.header.toLowerCase().includes('all')) {
        allScore = scoreVal
        if (allScore !== null && allScore > totalRespondents) {
          totalRespondents = Math.ceil(allScore)
        }
      } else {
        const dimValue = field.header
        scores[dimValue] = scoreVal
      }
    }

    responses.push({ id: qId, allScore, scores })
  }

  return {
    questions,
    dimensions,
    responses,
    totalRespondents: Math.max(totalRespondents, 1),
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
      const rawVal = row[scoreIdx]?.trimmed
      const parsed = rawVal ? parseLikertValue(rawVal) : null

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
