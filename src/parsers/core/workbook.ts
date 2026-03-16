import * as XLSX from 'xlsx'
import { sheetToArray } from '@/lib/excel/reader'

export interface WorkbookData {
  sheets: {
    [key: string]: string[][]
  }
}

export function parseWorkbook(workbook: XLSX.WorkBook): WorkbookData {
  const sheets: WorkbookData['sheets'] = {}

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) continue
    const array = sheetToArray(sheet)
    sheets[sheetName] = array as string[][]
  }

  return { sheets }
}

export function findSheetByPattern(workbook: XLSX.WorkBook, pattern: RegExp): string | null {
  for (const sheetName of workbook.SheetNames) {
    if (pattern.test(sheetName)) {
      return sheetName
    }
  }
  return null
}

export function getCellOrNull(row: unknown[] | undefined, col: number): string | null {
  if (!row || col < 0 || col >= row.length) return null
  const val = row[col]
  if (val === null || val === undefined || val === '') return null
  return String(val).trim()
}

export function getCellAsNumber(row: unknown[] | undefined, col: number): number | null {
  const str = getCellOrNull(row, col)
  if (!str) return null
  const num = parseFloat(str)
  return isNaN(num) ? null : num
}

export function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return String(text).trim().toLowerCase()
}
