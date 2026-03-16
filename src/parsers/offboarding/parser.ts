import { OffboardingResponse } from '@/domain/models/offboarding'
import { parseLikertValue } from '@/domain/models/offboarding'
import { getCellOrNull } from '@/parsers/core/workbook'

export function parseOffboardingData(rows: unknown[][]): OffboardingResponse[] {
  const responses: OffboardingResponse[] = []

  if (rows.length < 2) {
    return responses
  }

  const headerRow = rows[0]
  if (!headerRow) {
    return responses
  }

  const headers = (headerRow as unknown[]).map((h) => getCellOrNull([h], 0) || '')

  let idColIdx = -1
  let buColIdx = -1
  let tenureColIdx = -1
  let driverColIdx = -1
  const ratingColIndices: number[] = []

  const ratingPattern = /^(i |my |people |our |client |day-to-day|it.?s clear)/i

  for (let col = 0; col < headers.length; col++) {
    const header = headers[col]
    if (!header) continue

    if (/^id$|employee.?id|respondent/i.test(header)) {
      idColIdx = col
    } else if (/business.?unit/i.test(header)) {
      buColIdx = col
    } else if (/tenure|length.?service|years/i.test(header)) {
      tenureColIdx = col
    } else if (/reason|driver|leaving|why/i.test(header)) {
      driverColIdx = col
    } else if (ratingPattern.test(header)) {
      ratingColIndices.push(col)
    }
  }

  if (idColIdx === -1) {
    idColIdx = 0
  }

  for (let row = 1; row < rows.length; row++) {
    const rowData = rows[row]
    if (!rowData) continue

    const id = getCellOrNull(rowData as unknown[], idColIdx) || `respondent_${row}`
    const bu = buColIdx !== -1 ? getCellOrNull(rowData as unknown[], buColIdx) : null
    const tenure = tenureColIdx !== -1 ? getCellOrNull(rowData as unknown[], tenureColIdx) : null
    const driver = driverColIdx !== -1 ? getCellOrNull(rowData as unknown[], driverColIdx) : null

    const ratings: Record<string, number> = {}
    let allRatings: number[] = []

    for (const colIdx of ratingColIndices) {
      const cellValue = getCellOrNull(rowData as unknown[], colIdx)
      const parsed = parseLikertValue(cellValue)
      if (parsed !== null) {
        const label = headers[colIdx] || `rating_${colIdx}`
        ratings[label] = parsed
        allRatings.push(parsed)
      }
    }

    let ratingValue: number | null = null
    if (allRatings.length > 0) {
      ratingValue = Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    }

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
