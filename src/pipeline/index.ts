import * as XLSX from 'xlsx'
import type {
  PipelineResult,
  RawWorkbook,
  NormalizedCell,
  SemanticFieldType
} from './types'
import { normalizeCell } from './cell-normalizer'
import { profileColumns } from './column-profiler'
import { classifyFields } from './semantic-classifier'
import { detectDataset } from './dataset-detector'
import { mapToSchema } from './schema-mapper'
import { readExcelFile, getSheetNames } from '@/lib/excel/reader'

async function readWorkbook(file: File): Promise<RawWorkbook> {
  const workbook = await readExcelFile(file)
  const sheetNames = getSheetNames(workbook)

  const sheets: Record<string, unknown[][]> = {}
  for (const sheetName of sheetNames) {
    const sheet = workbook.Sheets[sheetName]
    const arr = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' })
    sheets[sheetName] = arr as unknown[][]
  }

  return {
    fileName: file.name,
    sheetNames,
    sheets
  }
}

export async function runPipeline(
  file: File,
  fieldOverrides?: Record<number, SemanticFieldType>
): Promise<PipelineResult> {
  const result: PipelineResult = {
    workbook: {
      fileName: '',
      sheetNames: [],
      sheets: {}
    },
    selectedSheet: '',
    columnProfiles: [],
    detectionResult: {
      type: 'unknown',
      confidence: 0,
      reasoning: [],
      fields: [],
      warnings: [],
      requiresMappingReview: false
    },
    normalizedData: { type: 'unknown', data: null },
    warnings: [],
    errors: []
  }

  try {
    // Stage 1: Reading
    let workbook: RawWorkbook
    try {
      workbook = await readWorkbook(file)
      result.workbook = workbook
    } catch (err) {
      result.errors.push({
        stage: 'reading',
        message: 'Failed to read Excel file',
        detail: err instanceof Error ? err.message : String(err)
      })
      return result
    }

    // Select the most useful sheet.
    // The onboarding file has a "Transform" sheet with clean respondent rows;
    // the probation file uses "Assessment Progress"; offboarding uses "Sheet1".
    const PREFERRED_SHEETS = ['Transform', 'Raw Data', 'Assessment Progress', 'Sheet1']
    const sheetName =
      PREFERRED_SHEETS.find((n) => workbook.sheetNames.includes(n)) ??
      workbook.sheetNames[0]
    if (!sheetName) {
      result.errors.push({
        stage: 'reading',
        message: 'No sheets found in workbook'
      })
      return result
    }

    result.selectedSheet = sheetName
    const rawRows = workbook.sheets[sheetName]

    if (!rawRows || rawRows.length === 0) {
      result.errors.push({
        stage: 'reading',
        message: 'Sheet is empty'
      })
      return result
    }

    // Stage 2: Normalization
    let normalizedRows: NormalizedCell[][]
    let headers: string[]
    try {
      const headerRow = rawRows[0] as unknown[]
      headers = headerRow.map((h) => String(h ?? ''))

      normalizedRows = rawRows.slice(1).map((row) => {
        const rawRow = row as unknown[]
        return headers.map((_, idx) => normalizeCell(rawRow[idx]))
      })
    } catch (err) {
      result.errors.push({
        stage: 'normalizing',
        message: 'Failed to normalize cells',
        detail: err instanceof Error ? err.message : String(err)
      })
      return result
    }

    // Stage 3: Profiling
    let columnProfiles
    try {
      columnProfiles = profileColumns(headers, normalizedRows)
      result.columnProfiles = columnProfiles
    } catch (err) {
      result.errors.push({
        stage: 'profiling',
        message: 'Failed to profile columns',
        detail: err instanceof Error ? err.message : String(err)
      })
      return result
    }

    // Stage 4: Classification
    let fields = classifyFields(columnProfiles)

    // Apply field overrides
    if (fieldOverrides) {
      for (const [colIdx, semanticType] of Object.entries(fieldOverrides)) {
        const idx = Number(colIdx)
        if (fields[idx]) {
          fields[idx] = {
            ...fields[idx],
            semanticType: semanticType as SemanticFieldType,
            isAmbiguous: false
          }
        }
      }
    }

    // Stage 5: Detection
    let detectionResult
    try {
      detectionResult = detectDataset(fields, columnProfiles)
      result.detectionResult = detectionResult
    } catch (err) {
      result.errors.push({
        stage: 'detecting',
        message: 'Failed to detect dataset type',
        detail: err instanceof Error ? err.message : String(err)
      })
      return result
    }

    // Stage 6: Mapping
    try {
      const normalizedData = mapToSchema(detectionResult, normalizedRows, rawRows)
      result.normalizedData = normalizedData
    } catch (err) {
      result.errors.push({
        stage: 'mapping',
        message: 'Failed to map schema',
        detail: err instanceof Error ? err.message : String(err)
      })
      return result
    }

    // Collect warnings
    result.warnings = [
      ...result.detectionResult.warnings.map((w) => ({
        message: w
      })),
      ...result.detectionResult.fields.flatMap((f) =>
        f.warnings.map((w) => ({
          columnIndex: f.columnIndex,
          header: f.header,
          message: w
        }))
      )
    ]
  } catch (err) {
    result.errors.push({
      stage: 'error',
      message: 'Unexpected pipeline error',
      detail: err instanceof Error ? err.message : String(err)
    })
  }

  return result
}

export function runPipelineOnSheet(
  workbook: RawWorkbook,
  sheetName: string,
  fieldOverrides?: Record<number, SemanticFieldType>
): PipelineResult {
  const result: PipelineResult = {
    workbook,
    selectedSheet: sheetName,
    columnProfiles: [],
    detectionResult: {
      type: 'unknown',
      confidence: 0,
      reasoning: [],
      fields: [],
      warnings: [],
      requiresMappingReview: false
    },
    normalizedData: { type: 'unknown', data: null },
    warnings: [],
    errors: []
  }

  try {
    const rawRows = workbook.sheets[sheetName]
    if (!rawRows || rawRows.length === 0) {
      result.errors.push({
        stage: 'reading',
        message: 'Sheet is empty'
      })
      return result
    }

    // Normalization
    const headerRow = rawRows[0] as unknown[]
    const headers = headerRow.map((h) => String(h ?? ''))

    const normalizedRows = rawRows.slice(1).map((row) => {
      const rawRow = row as unknown[]
      return headers.map((_, idx) => normalizeCell(rawRow[idx]))
    })

    // Profiling
    const columnProfiles = profileColumns(headers, normalizedRows)
    result.columnProfiles = columnProfiles

    // Classification
    let fields = classifyFields(columnProfiles)

    // Apply overrides
    if (fieldOverrides) {
      for (const [colIdx, semanticType] of Object.entries(fieldOverrides)) {
        const idx = Number(colIdx)
        if (fields[idx]) {
          fields[idx] = {
            ...fields[idx],
            semanticType: semanticType as SemanticFieldType,
            isAmbiguous: false
          }
        }
      }
    }

    // Detection
    const detectionResult = detectDataset(fields, columnProfiles)
    result.detectionResult = detectionResult

    // Mapping
    const normalizedData = mapToSchema(detectionResult, normalizedRows, rawRows)
    result.normalizedData = normalizedData

    // Warnings
    result.warnings = [
      ...detectionResult.warnings.map((w) => ({
        message: w
      })),
      ...detectionResult.fields.flatMap((f) =>
        f.warnings.map((w) => ({
          columnIndex: f.columnIndex,
          header: f.header,
          message: w
        }))
      )
    ]
  } catch (err) {
    result.errors.push({
      stage: 'error',
      message: 'Pipeline error',
      detail: err instanceof Error ? err.message : String(err)
    })
  }

  return result
}
