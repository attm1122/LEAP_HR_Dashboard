import React from 'react'
import type { DataQuality } from '@/presentation/types'

interface ExecutiveInsightBannerProps {
  narrativeSummary: string
  narrativePoints: string[]
  dataQuality: DataQuality
  generatedAt: string
}

const QUALITY_STYLES: Record<DataQuality, { bar: string; badge: string; label: string }> = {
  complete: {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    label: 'Data complete',
  },
  partial: {
    bar: 'bg-amber-400',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
    label: 'Partial data',
  },
  incomplete: {
    bar: 'bg-red-400',
    badge: 'bg-red-50 text-red-700 border-red-200',
    label: 'Incomplete data',
  },
}

const ExecutiveInsightBanner: React.FC<ExecutiveInsightBannerProps> = ({
  narrativeSummary,
  narrativePoints,
  dataQuality,
  generatedAt,
}) => {
  const q = QUALITY_STYLES[dataQuality]
  const formattedTime = new Date(generatedAt).toLocaleString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Coloured top bar */}
      <div className={`h-1 w-full ${q.bar}`} />

      <div className="p-6">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            {/* Insight icon */}
            <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.347.347A3.75 3.75 0 0113.5 21h-3a3.75 3.75 0 01-2.647-1.097l-.347-.347z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Executive Summary</h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded border ${q.badge}`}>
              {q.label}
            </span>
            <span className="text-xs text-gray-400">{formattedTime}</span>
          </div>
        </div>

        {/* Narrative summary */}
        <p className="text-sm text-gray-700 leading-relaxed font-medium">
          {narrativeSummary}
        </p>

        {/* Supporting bullet points */}
        {narrativePoints.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {narrativePoints.map((point, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default ExecutiveInsightBanner
