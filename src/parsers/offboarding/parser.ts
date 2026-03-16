import { OffboardingResponse } from '@/domain/models/offboarding'
import { parseLikertValue } from '@/domain/models/offboarding'
import { getCellOrNull } from '@/parsers/core/workbook'

export function parseOffboardingData(rows: unknown[][]): OffboardingResponse[] {
  const responses: OffboardingResponse[] = []

  if (rows.length < 2) return responses

  const headerRow = rows[0]
  if (!headerRow) return responses

  const headers = (headerRow as unknown[]).map((h) => getCellOrNull([h], 0) || '')

  let idColIdx = -1
  let buColIdx = -1
  let tenureColIdx = -1
  let driverColIdx = -1
  const metadataCols = new Set<number>()

  for (let col = 0; col < headers.length; col++) {
    const header = headers[col]
    if (!header) continue

    if (/^id$|employee.?id|respondent/i.test(header)) {
      idColIdx = col
      metadataCols.add(col)
    } else if (/business.?unit/i.test(header)) {
      buColIdx = col
      metadataCols.add(col)
    } else if (/tenure|length.?service|years/i.test(header)) {
      tenureColIdx = col
      metadataCols.add(col)
    } else if (/reason|driver|leaving|why|departure/i.test(header)) {
      driverColIdx = col
      metadataCols.add(col)
    }
  }

  if (idColIdx === -1) {
    idColIdx = 0
    metadataCols.add(0)
  }

  // Identify rating columns: any non-metadata column that has Likert-like values
  // in the first few data rows.
  const ratingColIndices: number[] = []
  for (let col = 0; col < headers.length; col++) {
    if (metadataCols.has(col)) continue
    const header = headers[col]
    if (!header || header.trim() === '') continue

    // Check if this column has parseable Likert values in at least one of the first 5 rows
    let hasLikert = false
    for (let row = 1; row < Math.min(rows.length, 6); row++) {
      const val = getCellOrNull(rows[row] as unknown[], col)
      if (val !== null && parseLikertValue(val) !== null) {
        hasLikert = true
        break
      }
    }
    if (hasLikert) {
      ratingColIndices.push(col)
    }
  }

  for (let row = 1; row < rows.length; row++) {
    const rowData = rows[row]
    if (!rowData) continue

    const id = getCellOrNull(rowData as unknown[], idColIdx) || `respondent_${row}`
    const bu = buColIdx !== -1 ? getCellOrNull(rowData as unknown[], buColIdx) : null
    const tenure = tenureColIdx !== -1 ? getCellOrNull(rowData as unknown[], tenureColIdx) : null
    const driver = driverColIdx !== -1 ? getCellOrNull(rowData as unknown[], driverColIdx) : null

    const ratings: Record<string, number> = {}
    const allRatings: number[] = []

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
      ratingValue =
        Math.round((allRatings.reduce((a, b) => a + b, 0) / allRatings.length) * 10) / 10
    }

    responses.push({ id, ratingValue, bu, tenure, driver, ratings })
  }

  return responses
}
