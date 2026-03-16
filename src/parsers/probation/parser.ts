import { ProbationEmployee } from '@/domain/models/probation'
import { parseDate } from '@/lib/dates/parsing'
import { getCellOrNull, getCellAsNumber } from '@/parsers/core/workbook'

export function parseProbationData(rows: unknown[][]): ProbationEmployee[] {
  const employees: ProbationEmployee[] = []

  let i = 0
  while (i < rows.length) {
    const nameRow = rows[i]
    const dataRow = i + 1 < rows.length ? rows[i + 1] : null

    if (!nameRow || !dataRow) break

    const name = getCellOrNull(nameRow, 0)
    if (!name || name.trim().length === 0) {
      i += 2
      continue
    }

    const id = getCellOrNull(dataRow, 0) || ''
    const period = getCellOrNull(dataRow, 1) || ''
    const manager = getCellOrNull(dataRow, 2) || ''
    const selfAssess = getCellAsNumber(dataRow, 3)
    const selfDateRaw = getCellOrNull(dataRow, 4)
    const selfDate = selfDateRaw ? parseDate(selfDateRaw) : null
    const mgrAssess = getCellAsNumber(dataRow, 5)
    const mgrDateRaw = getCellOrNull(dataRow, 6)
    const mgrDate = mgrDateRaw ? parseDate(mgrDateRaw) : null
    const notes = getCellOrNull(dataRow, 7)

    employees.push({
      name,
      id,
      period,
      manager,
      selfAssess,
      selfDate,
      mgrAssess,
      mgrDate,
      notes
    })

    i += 2
  }

  return employees
}
