import React from 'react'
import type { PresentationPlan } from '@/presentation/types'
import type { DatasetDetectionResult } from '@/pipeline/types'

interface DatasetSummaryCardProps {
  plan: PresentationPlan
  detection?: DatasetDetectionResult
  fileName?: string
}

const MODULE_ICONS: Record<string, React.ReactElement> = {
  probation: (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" />
    </svg>
  ),
  onboarding: (
    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3M13.5 4.5 12 3m0 0L10.5 4.5M12 3v7.5m-6 0A6 6 0 0012 21a6 6 0 006-6H6z" />
    </svg>
  ),
  offboarding: (
    <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
    </svg>
  ),
}

const MODULE_BG: Record<string, string> = {
  probation: 'bg-blue-50 border-blue-100',
  onboarding: 'bg-purple-50 border-purple-100',
  offboarding: 'bg-rose-50 border-rose-100',
}

const DatasetSummaryCard: React.FC<DatasetSummaryCardProps> = ({
  plan,
  detection,
  fileName,
}) => {
  const icon = MODULE_ICONS[plan.module]
  const bg = MODULE_BG[plan.module] ?? 'bg-gray-50 border-gray-100'

  const confidenceLabel =
    detection
      ? detection.confidence >= 0.85
        ? 'High confidence'
        : detection.confidence >= 0.6
        ? 'Moderate confidence'
        : 'Low confidence'
      : null

  const confidenceColor =
    detection
      ? detection.confidence >= 0.85
        ? 'text-emerald-700'
        : detection.confidence >= 0.6
        ? 'text-amber-700'
        : 'text-red-700'
      : ''

  return (
    <div className={`rounded-xl border p-4 ${bg}`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="w-9 h-9 rounded-lg bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
          {icon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-900 capitalize">
              {plan.module.replace('-', ' ')} Review
            </p>
            {confidenceLabel && (
              <span className={`text-xs font-medium ${confidenceColor}`}>
                · {confidenceLabel}
              </span>
            )}
          </div>

          {fileName && (
            <p className="text-xs text-gray-500 mt-0.5 truncate" title={fileName}>
              {fileName}
            </p>
          )}

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{plan.totalRecords}</span> records
            </span>
            <span className="text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{plan.kpis.length}</span> KPIs
            </span>
            <span className="text-xs text-gray-600">
              <span className="font-semibold text-gray-800">{plan.visuals.length}</span> charts
            </span>
          </div>

          {/* Detection reasoning pills */}
          {detection && detection.reasoning.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {detection.reasoning.slice(0, 3).map((r, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full bg-white border border-gray-200 text-gray-600"
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DatasetSummaryCard
