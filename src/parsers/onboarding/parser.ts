import {
  OnboardingDashboardData,
  OnboardingQuestion,
  OnboardingRating,
  OnboardingResponse
} from '@/domain/models/onboarding'
import { getCellOrNull } from '@/parsers/core/workbook'
import { isYes } from '@/parsers/core/detection'

export function parseOnboardingData(rows: unknown[][]): OnboardingDashboardData {
  const data: OnboardingDashboardData = {
    questions: [],
    dimensions: {},
    responses: [],
    visibleQuestions: []
  }

  if (rows.length < 4) {
    return data
  }

  let buRowIdx = -1
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    for (let j = 0; j < (row as unknown[]).length; j++) {
      const cell = getCellOrNull(row as unknown[], j)
      if (cell && /business.?unit/i.test(cell)) {
        buRowIdx = i
        break
      }
    }
    if (buRowIdx !== -1) break
  }

  if (buRowIdx === -1) {
    return data
  }

  const categoryRow = rows[buRowIdx]
  const subHeaderRow = buRowIdx + 1 < rows.length ? rows[buRowIdx + 1] : null
  const countRow = buRowIdx + 2 < rows.length ? rows[buRowIdx + 2] : null
  const questionsStart = buRowIdx + 3

  if (!categoryRow || !subHeaderRow || !countRow || questionsStart >= rows.length) {
    return data
  }

  const dimensionKeys: { [dimKey: string]: string } = {
    'business unit': 'bu',
    location: 'loc',
    tenure: 'ten'
  }

  const dimensions: { [key: string]: Set<string> } = {}
  const dimensionCounts: { [key: string]: { [value: string]: number } } = {}

  for (const key of Object.values(dimensionKeys)) {
    dimensions[key] = new Set<string>()
    dimensionCounts[key] = {}
  }

  for (let col = 0; col < (categoryRow as unknown[]).length; col++) {
    const catCell = getCellOrNull(categoryRow as unknown[], col)
    if (!catCell) continue

    const dimKey = Object.entries(dimensionKeys).find(
      ([k]) => catCell.toLowerCase().includes(k.toLowerCase())
    )?.[1]

    if (dimKey) {
      const subHeaderCell = getCellOrNull(subHeaderRow as unknown[], col)
      const countCell = getCellOrNull(countRow as unknown[], col)

      if (subHeaderCell && !/all/i.test(subHeaderCell)) {
        dimensions[dimKey].add(subHeaderCell)
        const count = parseInt(countCell || '0') || 0
        dimensionCounts[dimKey][subHeaderCell] = count
      }
    }
  }

  for (const [dimKey, values] of Object.entries(dimensions)) {
    data.dimensions[dimKey] = Array.from(values)
      .sort()
      .map((val) => ({
        value: val,
        count: dimensionCounts[dimKey][val] || 0
      }))
  }

  let questionColIdx = -1
  for (let col = 0; col < (categoryRow as unknown[]).length; col++) {
    const catCell = getCellOrNull(categoryRow as unknown[], col)
    if (!catCell || catCell === '') {
      let isDataCol = false
      for (let row = questionsStart; row < Math.min(questionsStart + 10, rows.length); row++) {
        const cell = getCellOrNull(rows[row] as unknown[], col)
        if (cell && (isYes(cell) || /\d+/.test(cell))) {
          isDataCol = true
          break
        }
      }
      if (isDataCol) {
        questionColIdx = col
        break
      }
    }
  }

  if (questionColIdx === -1) {
    questionColIdx = 0
  }

  const questions: OnboardingQuestion[] = []
  for (let row = questionsStart; row < rows.length; row++) {
    const questionText = getCellOrNull(rows[row] as unknown[], questionColIdx)
    if (questionText) {
      const id = `q_${row}`
      questions.push({ id, text: questionText })
    }
  }

  data.questions = questions

  const responses: OnboardingResponse[] = []
  const numQuestions = questions.length

  let allYes = 0
  let allNo = 0

  for (let row = questionsStart; row < questionsStart + numQuestions && row < rows.length; row++) {
    const qIdx = row - questionsStart
    const question = questions[qIdx]

    let yesCount = 0
    let noCount = 0
    const byDim: Record<string, OnboardingRating> = {}

    for (let col = 0; col < (categoryRow as unknown[]).length; col++) {
      const cellValue = getCellOrNull(rows[row] as unknown[], col)
      if (!cellValue) continue

      const catCell = getCellOrNull(categoryRow as unknown[], col)
      if (!catCell || catCell === '') continue

      let isDimCol = false
      for (const [dimKey] of Object.entries(data.dimensions)) {
        const dimValues = data.dimensions[dimKey].map((d) => d.value)
        if (dimValues.includes(catCell)) {
          if (!byDim[dimKey]) {
            byDim[dimKey] = { yes: 0, no: 0 }
          }
          if (isYes(cellValue)) {
            byDim[dimKey].yes++
            yesCount++
          } else if (!/yes/i.test(cellValue)) {
            byDim[dimKey].no++
            noCount++
          }
          isDimCol = true
          break
        }
      }

      if (!isDimCol && /all/i.test(catCell)) {
        if (isYes(cellValue)) {
          allYes++
        } else if (!/yes/i.test(cellValue)) {
          allNo++
        }
      }
    }

    responses.push({
      id: question.id,
      all: { yes: allYes, no: allNo },
      byDimension: byDim
    })
  }

  data.responses = responses

  const visibleQuestionIds = new Set(questions.map((q) => q.id))
  for (let col = 0; col < (categoryRow as unknown[]).length; col++) {
    const catCell = getCellOrNull(categoryRow as unknown[], col)
    if (!catCell || catCell === '') continue

    let hasData = false
    for (const response of responses) {
      const dimData = Object.values(response.byDimension).find(() => true)
      if (dimData && (dimData.yes > 0 || dimData.no > 0)) {
        hasData = true
        break
      }
    }

    if (!hasData) {
      visibleQuestionIds.delete(`q_${col}`)
    }
  }

  data.visibleQuestions = Array.from(visibleQuestionIds)

  return data
}
