import * as XLSX from 'xlsx'

export async function readExcelFile(file: File): Promise<XLSX.WorkBook> {
  const arrayBuffer = await file.arrayBuffer()
  const uint8Array = new Uint8Array(arrayBuffer)
  const workbook = XLSX.read(uint8Array, { type: 'array', cellDates: true })
  return workbook
}

export function getSheetNames(workbook: XLSX.WorkBook): string[] {
  return workbook.SheetNames
}

export function getSheet(workbook: XLSX.WorkBook, sheetName: string): XLSX.WorkSheet {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`Sheet "${sheetName}" not found`)
  }
  return sheet
}

export function sheetToArray(
  sheet: XLSX.WorkSheet
): unknown[][] {
  const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
  return arr as unknown[][]
}

export function getCellValue(
  sheet: XLSX.WorkSheet,
  cell: string
): string | number | Date | null {
  const cellObj = sheet[cell]
  if (!cellObj || !cellObj.v) return null
  return cellObj.v
}

export function getAllCells(sheet: XLSX.WorkSheet): Map<string, unknown> {
  const cells = new Map<string, unknown>()
  for (const key in sheet) {
    if (key.startsWith('!')) continue
    const cellObj = sheet[key] as XLSX.CellObject
    if (cellObj && cellObj.v !== undefined) {
      cells.set(key, cellObj.v)
    }
  }
  return cells
}

export function findCellsByPattern(
  sheet: XLSX.WorkSheet,
  pattern: RegExp
): Array<{ cell: string; value: unknown; row: number; col: number }> {
  const results: Array<{ cell: string; value: unknown; row: number; col: number }> = []
  const cells = getAllCells(sheet)
  for (const [cell, value] of cells) {
    const strValue = String(value ?? '')
    if (pattern.test(strValue)) {
      const match = cell.match(/^([A-Z]+)(\d+)$/)
      if (match) {
        const col = XLSX.utils.decode_col(match[1])
        const row = parseInt(match[2]) - 1
        results.push({ cell, value, row, col })
      }
    }
  }
  return results
}

export function getCellAddress(row: number, col: number): string {
  return XLSX.utils.encode_cell({ r: row, c: col })
}

export function parseCellAddress(address: string): { row: number; col: number } | null {
  const match = address.match(/^([A-Z]+)(\d+)$/)
  if (!match) return null
  return {
    col: XLSX.utils.decode_col(match[1]),
    row: parseInt(match[2]) - 1
  }
}
