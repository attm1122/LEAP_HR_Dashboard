// Cell value classification
export type CellValueKind =
  | 'empty'
  | 'number'
  | 'numeric-string'
  | 'string'
  | 'boolean'
  | 'boolean-string'
  | 'date'
  | 'date-string'
  | 'percentage-string'
  | 'currency-string'
  | 'status-string'
  | 'mixed'

export interface NormalizedCell {
  raw: unknown
  text: string
  trimmed: string
  kind: CellValueKind
  parsedNumber?: number
  parsedDate?: string
  parsedBoolean?: boolean
  normalizedStatus?: string
  isEmptyLike: boolean
}

export interface ColumnProfile {
  index: number
  header: string
  normalizedHeader: string
  sampleValues: string[]
  totalRows: number
  nonEmptyRows: number
  blankRatio: number
  numericRatio: number
  numericLikeRatio: number
  booleanLikeRatio: number
  dateLikeRatio: number
  statusLikeRatio: number
  freeTextRatio: number
  uniqueCount: number
  uniqueRatio: number
  commonValues: string[]
  avgTextLength: number
  maxTextLength: number
  dominantKind: CellValueKind
  cells: NormalizedCell[]
}

export type SemanticFieldType =
  | 'identifier'
  | 'person-name'
  | 'manager-name'
  | 'business-unit'
  | 'location'
  | 'tenure-band'
  | 'probation-period'
  | 'assessment-status'
  | 'assessment-score'
  | 'survey-score'
  | 'survey-question-text'
  | 'respondent-count'
  | 'date'
  | 'yes-no'
  | 'exit-reason'
  | 'comment-text'
  | 'category'
  | 'metric'
  | 'unknown'

export interface SemanticField {
  columnIndex: number
  header: string
  semanticType: SemanticFieldType
  confidence: number
  primitiveKind: CellValueKind
  isAmbiguous: boolean
  alternativeTypes: SemanticFieldType[]
  warnings: string[]
}

export type DatasetType =
  | 'probation-review'
  | 'onboarding-survey'
  | 'offboarding-survey'
  | 'generic-hr'
  | 'unknown'

export interface DatasetDetectionResult {
  type: DatasetType
  confidence: number
  reasoning: string[]
  fields: SemanticField[]
  warnings: string[]
  requiresMappingReview: boolean
}

export type PipelineStage =
  | 'idle'
  | 'reading'
  | 'normalizing'
  | 'profiling'
  | 'classifying'
  | 'detecting'
  | 'mapping'
  | 'complete'
  | 'error'

export interface PipelineError {
  stage: PipelineStage
  message: string
  detail?: string
}

export interface PipelineWarning {
  columnIndex?: number
  header?: string
  message: string
}

export interface RawWorkbook {
  fileName: string
  sheetNames: string[]
  sheets: Record<string, unknown[][]>
}

export interface PipelineResult {
  workbook: RawWorkbook
  selectedSheet: string
  columnProfiles: ColumnProfile[]
  detectionResult: DatasetDetectionResult
  normalizedData: NormalizedDataset
  warnings: PipelineWarning[]
  errors: PipelineError[]
}

export type NormalizedDataset =
  | { type: 'probation-review'; data: import('@/domain/models/probation').ProbationEmployee[] }
  | { type: 'onboarding-survey'; data: import('@/domain/models/onboarding').OnboardingDashboardData }
  | { type: 'offboarding-survey'; data: import('@/domain/models/offboarding').OffboardingResponse[] }
  | { type: 'generic-hr'; data: GenericHRDataset }
  | { type: 'unknown'; data: null }

export interface GenericHRDataset {
  fields: SemanticField[]
  rows: Record<string, string | number | null>[]
}
