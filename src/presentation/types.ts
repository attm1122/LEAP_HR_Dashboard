import type { Module } from '@/types/common'

// ── Chart primitives ─────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
  rawLabel?: string // original untruncated label for tooltip
}

export type ChartType =
  | 'donut'
  | 'bar'
  | 'horizontal-bar'
  | 'score-bar'
  | 'heatmap-grid'

// ── Plan building blocks ──────────────────────────────────────────────────────

export type KPIPriority = 'hero' | 'primary' | 'secondary'
export type KPIColor = 'default' | 'success' | 'warning' | 'danger'
export type KPITrend = 'up' | 'down' | 'neutral'

export interface KPIPlan {
  id: string
  label: string
  value: string | number
  rawValue: number | null        // numeric form for threshold logic
  unit?: string                  // '%', '/5', '/10', etc.
  color: KPIColor
  trend?: KPITrend
  subtitle?: string
  priority: KPIPriority
}

export interface VisualPlan {
  id: string
  chartType: ChartType
  title: string
  subtitle?: string
  data: ChartDataPoint[]
  priority: 'hero' | 'supporting'
  colorScheme: 'semantic' | 'categorical'
  emptyMessage?: string
}

export interface FilterPlan {
  dimension: string  // 'manager' | 'bu' | 'tenure' | 'driver' | etc.
  value: string
  label: string      // human-readable  e.g. "Business Unit: Engineering"
}

export interface DetailPlan {
  visible: boolean
  sortBy?: string
  sortDir?: 'asc' | 'desc'
}

export type DataQuality = 'complete' | 'partial' | 'incomplete'

// ── Top-level plan ────────────────────────────────────────────────────────────

export interface PresentationPlan {
  module: Module
  title: string
  subtitle: string
  generatedAt: string            // ISO timestamp
  kpis: KPIPlan[]
  visuals: VisualPlan[]
  filters: FilterPlan[]
  detail: DetailPlan
  narrativeSummary: string       // 1–3 sentence executive insight
  narrativePoints: string[]      // bullet-level supporting insights
  dataQuality: DataQuality
  totalRecords: number
}
