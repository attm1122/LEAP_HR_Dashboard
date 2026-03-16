import { OnboardingDashboardData, OnboardingResponse } from '@/domain/models/onboarding'
import { getCellOrNull } from '@/parsers/core/workbook'

/**
 * SurveyMonkey-style onboarding survey export format:
 *
 *   Row buRowIdx  : Category labels  → "Business Unit" | "Location" | "Tenure" | (blank = question col)
 *   Row buRowIdx+1: Sub-header values → "Commercial" | "Conveyancing" | "All" | "Sydney" | …
 *   Row buRowIdx+2: Respondent counts → n=15 | n=8 | n=23 | n=12 | …
 *   Row buRowIdx+3…: Question rows   → "How was your onboarding?" | 4.2 | 3.8 | 4.0 | …
 *
 * The question-text column is the leftmost column whose category-row cell is blank
 * AND whose question rows contain long text strings (not numbers).
 */
export function parseOnboardingData(rows: unknown[][]): OnboardingDashboardData {
  const empty: OnboardingDashboardData = {
    questions: [],
    dimensions: {},
    responses: [],
    totalRespondents: 0,
    visibleQuestions: []
  }

  if (rows.length < 4) return empty

  // ── Step 1: Find the "Business Unit" category row ──────────────────────────
  let buRowIdx = -1
  for (let ri = 0; ri < rows.length; ri++) {
    for (let ci = 0; ci < (rows[ri] as unknown[]).length; ci++) {
      const v = getCellOrNull(rows[ri] as unknown[], ci)
      if (v && /business.?unit/i.test(v)) {
        buRowIdx = ri
        break
      }
    }
    if (buRowIdx !== -1) break
  }
  if (buRowIdx === -1) return empty

  const categoryRow = rows[buRowIdx] as unknown[]
  const subHeaderRow = rows[buRowIdx + 1] as unknown[]
  const countRow = buRowIdx + 2 < rows.length ? (rows[buRowIdx + 2] as unknown[]) : null
  const questionsStart = buRowIdx + 3
  if (!subHeaderRow || questionsStart >= rows.length) return empty

  // ── Step 2: Find the question text column ──────────────────────────────────
  // It's the leftmost column where:
  //   (a) The category-row cell is blank / not a dimension label, AND
  //   (b) Question rows contain long text strings, not numbers.
  let questionColIdx = 0
  let bestTextCount = 0
  for (let col = 0; col < Math.min(categoryRow.length, 8); col++) {
    const catCell = getCellOrNull(categoryRow, col)
    if (catCell && catCell.trim() !== '') continue // skip labeled dimension columns

    let textCount = 0
    let numCount = 0
    for (let r = questionsStart; r < Math.min(questionsStart + 10, rows.length); r++) {
      const v = getCellOrNull(rows[r] as unknown[], col)
      if (!v || v.trim() === '') continue
      if (!isNaN(parseFloat(v))) {
        numCount++
      } else if (v.length > 5) {
        textCount++
      }
    }
    // Prefer column with text content and zero numeric values
    if (textCount >= 2 && numCount === 0 && textCount > bestTextCount) {
      bestTextCount = textCount
      questionColIdx = col
    }
  }

  // ── Step 3: Build dimension map ─────────────────────────────────────────────
  // Map: dimKey → list of {value, count, colIdx}
  const DIM_LABEL_MAP: Record<string, string> = {
    'business unit': 'bu',
    'business': 'bu',
    location: 'loc',
    tenure: 'ten'
  }

  // colToDim[col] = { dimKey, dimValue }
  const colToDim: Record<number, { dimKey: string; dimValue: string; isAll: boolean }> = {}
  const dimValueCounts: Record<string, Record<string, number>> = {}
  let totalRespondents = 0

  for (let col = 0; col < categoryRow.length; col++) {
    if (col === questionColIdx) continue
    const catCell = getCellOrNull(categoryRow, col)
    if (!catCell || catCell.trim() === '') continue

    const dimKey = Object.entries(DIM_LABEL_MAP).find(([k]) =>
      catCell.toLowerCase().includes(k)
    )?.[1]
    if (!dimKey) continue

    const subHeader = getCellOrNull(subHeaderRow, col) || ''
    const isAll = /^all$/i.test(subHeader.trim())

    const countStr = countRow ? getCellOrNull(countRow, col) : null
    const count = countStr ? parseInt(countStr.replace(/[^0-9]/g, ''), 10) || 0 : 0

    colToDim[col] = { dimKey, dimValue: subHeader, isAll }

    if (isAll) {
      // Use the first "All" column's count as total respondents (largest dimension coverage)
      if (totalRespondents === 0 && count > 0) totalRespondents = count
    } else {
      if (!dimValueCounts[dimKey]) dimValueCounts[dimKey] = {}
      dimValueCounts[dimKey][subHeader] = count
    }
  }

  // Build dimensions record (excluding "All" entries)
  const dimensions: Record<string, Array<{ value: string; count: number }>> = {}
  for (const [dimKey, values] of Object.entries(dimValueCounts)) {
    dimensions[dimKey] = Object.entries(values)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => a.value.localeCompare(b.value))
  }

  // ── Step 4: Parse question rows ─────────────────────────────────────────────
  const questions: Array<{ id: string; text: string }> = []
  const responses: OnboardingResponse[] = []

  for (let row = questionsStart; row < rows.length; row++) {
    const questionText = getCellOrNull(rows[row] as unknown[], questionColIdx)
    if (!questionText || questionText.trim() === '') continue

    const id = `q_${row - questionsStart}`
    questions.push({ id, text: questionText })

    let allScore: number | null = null
    const scores: Record<string, number | null> = {}

    for (const [colStr, dimInfo] of Object.entries(colToDim)) {
      const col = Number(colStr)
      const rawVal = getCellOrNull(rows[row] as unknown[], col)
      const score = rawVal !== null ? parseFloat(rawVal) : NaN
      const parsed = !isNaN(score) && score >= 0 && score <= 10 ? score : null

      if (dimInfo.isAll) {
        if (allScore === null && parsed !== null) allScore = parsed
      } else {
        scores[dimInfo.dimValue] = parsed
      }
    }

    responses.push({ id, allScore, scores })
  }

  // ── Step 5: Determine visible questions (those with at least one score) ─────
  const visibleQuestions = questions
    .filter((q) => {
      const resp = responses.find((r) => r.id === q.id)
      if (!resp) return false
      return (
        resp.allScore !== null || Object.values(resp.scores).some((s) => s !== null)
      )
    })
    .map((q) => q.id)

  return {
    questions,
    dimensions,
    responses,
    totalRespondents,
    visibleQuestions
  }
}
