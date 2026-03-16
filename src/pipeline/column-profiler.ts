import type { ColumnProfile, NormalizedCell, CellValueKind } from './types'

export function profileColumns(
  headers: string[],
  rows: NormalizedCell[][]
): ColumnProfile[] {
  return headers.map((header, colIndex) => {
    const columnCells = rows.map((row) => row[colIndex]).filter(Boolean)

    const totalRows = rows.length
    const nonEmptyRows = columnCells.filter((c) => !c.isEmptyLike).length

    // Count by kind
    const kindCounts: Record<CellValueKind, number> = {
      empty: 0,
      number: 0,
      'numeric-string': 0,
      string: 0,
      boolean: 0,
      'boolean-string': 0,
      date: 0,
      'date-string': 0,
      'percentage-string': 0,
      'currency-string': 0,
      'status-string': 0,
      mixed: 0
    }

    const lengths: number[] = []
    const uniqueValues = new Set<string>()

    columnCells.forEach((cell) => {
      kindCounts[cell.kind]++
      if (!cell.isEmptyLike) {
        lengths.push(cell.trimmed.length)
        uniqueValues.add(cell.trimmed)
      }
    })

    // Ratios
    const blankRatio = totalRows > 0 ? (totalRows - nonEmptyRows) / totalRows : 0
    const numericRatio = nonEmptyRows > 0 ? kindCounts.number / nonEmptyRows : 0
    const numericLikeRatio =
      nonEmptyRows > 0 ? (kindCounts.number + kindCounts['numeric-string']) / nonEmptyRows : 0
    const booleanLikeRatio =
      nonEmptyRows > 0 ? (kindCounts.boolean + kindCounts['boolean-string']) / nonEmptyRows : 0
    const dateLikeRatio =
      nonEmptyRows > 0 ? (kindCounts.date + kindCounts['date-string']) / nonEmptyRows : 0
    const statusLikeRatio = nonEmptyRows > 0 ? kindCounts['status-string'] / nonEmptyRows : 0
    const freeTextRatio =
      nonEmptyRows > 0 ? kindCounts.string / nonEmptyRows : 0

    // Text length stats
    const avgTextLength = lengths.length > 0 ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0
    const maxTextLength = lengths.length > 0 ? Math.max(...lengths) : 0

    // Dominant kind
    const dominantKind = (Object.entries(kindCounts).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      'empty') as CellValueKind

    // Sample and common values
    const sampleValues = columnCells
      .filter((c) => !c.isEmptyLike)
      .slice(0, 5)
      .map((c) => c.trimmed)

    const valueFreq = new Map<string, number>()
    columnCells.forEach((c) => {
      if (!c.isEmptyLike) {
        const count = valueFreq.get(c.trimmed) ?? 0
        valueFreq.set(c.trimmed, count + 1)
      }
    })

    const commonValues = Array.from(valueFreq.entries())
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([val]) => val)

    const normalizedHeader = header
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')

    return {
      index: colIndex,
      header,
      normalizedHeader,
      sampleValues,
      totalRows,
      nonEmptyRows,
      blankRatio,
      numericRatio,
      numericLikeRatio,
      booleanLikeRatio,
      dateLikeRatio,
      statusLikeRatio,
      freeTextRatio,
      uniqueCount: uniqueValues.size,
      uniqueRatio: nonEmptyRows > 0 ? uniqueValues.size / nonEmptyRows : 0,
      commonValues,
      avgTextLength,
      maxTextLength,
      dominantKind,
      cells: columnCells
    }
  })
}
