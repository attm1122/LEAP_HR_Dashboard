import { ProbationEmployee } from '@/domain/models/probation'
import { parseDate } from '@/lib/dates/parsing'
import { getCellOrNull, getCellAsNumber } from '@/parsers/core/workbook'

/**
 * Probation Excel layout (alternating rows):
 *   Row i   (odd)  — employee name in col 0
 *   Row i+1 (even) — data fields:
 *     col 0: ID / department
 *     col 1: probation period (e.g. "3 Month")
 *     col 2: manager name
 *     col 3: self-assessment status text (Completed / Not Started / In Progress / Skipped)
 *            OR numeric score if the sheet records a score rather than a status
 *     col 4: self-assessment date
 *     col 5: manager assessment status (same logic as col 3)
 *     col 6: manager assessment date
 *     col 7: notes
 *
 * The parser reads BOTH text (status) and numeric values so it handles
 * either format gracefully.
 */
export function parseProbationData(rows: unknown[][]): ProbationEmployee[] {
  const employees: ProbationEmployee[] = []

  let i = 0
  while (i < rows.length) {
    const nameRow = rows[i]
    const dataRow = i + 1 < rows.length ? rows[i + 1] : null

    if (!nameRow || !dataRow) break

    const name = getCellOrNull(nameRow as unknown[], 0)
    if (!name || name.trim().length === 0) {
      i += 2
      continue
    }

    const id = getCellOrNull(dataRow as unknown[], 0) || ''
    const period = getCellOrNull(dataRow as unknown[], 1) || ''
    const manager = getCellOrNull(dataRow as unknown[], 2) || ''

    // Self-assessment: col 3 = status text OR numeric score, col 4 = date
    const selfRaw = getCellOrNull(dataRow as unknown[], 3)
    const selfNum = getCellAsNumber(dataRow as unknown[], 3)
    // If the string is purely numeric → it's a score; otherwise it's a status label
    const selfStatus = selfRaw && isNaN(Number(selfRaw)) ? selfRaw : null
    const selfScore = selfNum !== null ? selfNum : null
    const selfDateRaw = getCellOrNull(dataRow as unknown[], 4)
    const selfDate = selfDateRaw ? parseDate(selfDateRaw) : null

    // Manager assessment: col 5 = status text OR numeric score, col 6 = date
    const mgrRaw = getCellOrNull(dataRow as unknown[], 5)
    const mgrNum = getCellAsNumber(dataRow as unknown[], 5)
    const mgrStatus = mgrRaw && isNaN(Number(mgrRaw)) ? mgrRaw : null
    const mgrScore = mgrNum !== null ? mgrNum : null
    const mgrDateRaw = getCellOrNull(dataRow as unknown[], 6)
    const mgrDate = mgrDateRaw ? parseDate(mgrDateRaw) : null

    const notes = getCellOrNull(dataRow as unknown[], 7)

    employees.push({
      name,
      id,
      period,
      manager,
      selfStatus,
      selfScore,
      selfDate,
      mgrStatus,
      mgrScore,
      mgrDate,
      notes
    })

    i += 2
  }

  return employees
}
