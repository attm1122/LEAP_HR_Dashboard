import React, { useRef, useCallback } from 'react'
import type { PresentationPlan } from '@/presentation/types'
import type { DatasetDetectionResult } from '@/pipeline/types'
import ExecutiveKPIGrid from './ExecutiveKPIGrid'
import HeroChartCard from './HeroChartCard'
import SupportingChartGrid from './SupportingChartGrid'
import ExecutiveInsightBanner from './ExecutiveInsightBanner'
import DatasetSummaryCard from './DatasetSummaryCard'

interface ExecutiveDashboardLayoutProps {
  plan: PresentationPlan
  detection?: DatasetDetectionResult
  fileName?: string
  /** If provided, renders children below the charts (e.g. existing table component) */
  children?: React.ReactNode
}

// ── Export helpers ────────────────────────────────────────────────────────────

function downloadCSV(plan: PresentationPlan): void {
  const rows: string[][] = [
    ['Metric', 'Value', 'Unit'],
    ...plan.kpis.map((k) => [k.label, String(k.value), k.unit ?? '']),
  ]
  const csv = rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${plan.module}-executive-summary-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function triggerPrint(): void {
  window.print()
}

// ── Module colour accent ──────────────────────────────────────────────────────

const MODULE_ACCENT: Record<string, string> = {
  probation: 'from-blue-600 to-indigo-600',
  onboarding: 'from-purple-600 to-violet-600',
  offboarding: 'from-rose-600 to-pink-600',
}

// ── Main layout ───────────────────────────────────────────────────────────────

const ExecutiveDashboardLayout: React.FC<ExecutiveDashboardLayoutProps> = ({
  plan,
  detection,
  fileName,
  children,
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const accent = MODULE_ACCENT[plan.module] ?? 'from-gray-600 to-gray-700'

  const heroVisual = plan.visuals.find((v) => v.priority === 'hero')

  const handleExportCSV = useCallback(() => downloadCSV(plan), [plan])

  return (
    <div className="space-y-5 print:space-y-4" ref={printRef}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className={`rounded-xl bg-gradient-to-r ${accent} p-6 text-white`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">{plan.title}</h1>
            <p className="text-sm text-white/75 mt-0.5">{plan.subtitle}</p>
          </div>

          {/* Export actions — hidden when printing */}
          <div className="flex items-center gap-2 print:hidden shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
              title="Export KPI summary as CSV"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              CSV
            </button>

            <button
              onClick={triggerPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-medium transition-colors"
              title="Print or save as PDF"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.056 48.056 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
              </svg>
              Print
            </button>
          </div>
        </div>
      </div>

      {/* ── Dataset summary ──────────────────────────────────────────────── */}
      <DatasetSummaryCard plan={plan} detection={detection} fileName={fileName} />

      {/* ── Executive insight banner ─────────────────────────────────────── */}
      <ExecutiveInsightBanner
        narrativeSummary={plan.narrativeSummary}
        narrativePoints={plan.narrativePoints}
        dataQuality={plan.dataQuality}
        generatedAt={plan.generatedAt}
      />

      {/* ── KPI + Hero chart ─────────────────────────────────────────────── */}
      {plan.totalRecords > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* KPI column */}
          <div className="lg:col-span-2">
            <ExecutiveKPIGrid kpis={plan.kpis} showHero />
          </div>

          {/* Hero chart */}
          {heroVisual && (
            <div className="lg:col-span-3">
              <HeroChartCard visual={heroVisual} className="h-full" />
            </div>
          )}

          {/* Fallback: full-width KPIs when no hero chart */}
          {!heroVisual && (
            <div className="lg:col-span-3">
              <ExecutiveKPIGrid kpis={plan.kpis} showHero={false} />
            </div>
          )}
        </div>
      )}

      {/* ── Supporting charts ────────────────────────────────────────────── */}
      {plan.totalRecords > 0 && (
        <SupportingChartGrid visuals={plan.visuals} />
      )}

      {/* ── Detail view (slot for existing table / heatmap components) ──── */}
      {children && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900">Detail View</h3>
            <span className="text-xs text-gray-400">{plan.totalRecords} records</span>
          </div>
          <div className="p-0">{children}</div>
        </div>
      )}
    </div>
  )
}

export default ExecutiveDashboardLayout
