import React from 'react'
import type { ColumnProfile, SemanticField } from '@/pipeline/types'

interface ColumnCardProps {
  profile: ColumnProfile
  field: SemanticField
}

const ColumnCard: React.FC<ColumnCardProps> = ({ profile, field }) => {
  const statItems = [
    { label: 'Non-empty', value: `${Math.round((1 - profile.blankRatio) * 100)}%` },
    { label: 'Numeric', value: `${Math.round(profile.numericRatio * 100)}%` },
    { label: 'Status', value: `${Math.round(profile.statusLikeRatio * 100)}%` },
    { label: 'Unique', value: `${profile.uniqueCount}/${profile.nonEmptyRows}` }
  ]

  const confidenceColor =
    field.confidence >= 0.8
      ? 'bg-green-500'
      : field.confidence >= 0.6
        ? 'bg-yellow-500'
        : 'bg-red-500'

  return (
    <div
      className={`rounded-lg border ${field.isAmbiguous ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950' : 'border-border bg-surface-muted'} p-4`}
    >
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-text-primary">{field.header}</h4>
          <p className="mt-1 text-xs text-text-muted">{profile.normalizedHeader}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
            {field.semanticType}
          </span>
          {field.isAmbiguous && (
            <svg className="h-5 w-5 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </div>
      </div>

      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-medium text-text-muted">{Math.round(field.confidence * 100)}%</span>
        <div className="flex-1 rounded-full bg-surface h-2">
          <div className={`h-full rounded-full ${confidenceColor}`} style={{ width: `${field.confidence * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {statItems.map((item) => (
          <div key={item.label} className="rounded bg-surface p-2">
            <p className="text-xs text-text-muted">{item.label}</p>
            <p className="text-sm font-semibold text-text-primary">{item.value}</p>
          </div>
        ))}
      </div>

      {profile.sampleValues.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Sample Values</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {profile.sampleValues.slice(0, 3).map((val, i) => (
              <span key={i} className="rounded-full bg-surface px-2 py-1 text-xs text-text-secondary">
                {val.length > 30 ? val.slice(0, 30) + '…' : val}
              </span>
            ))}
          </div>
        </div>
      )}

      {field.warnings.length > 0 && (
        <div className="mt-3 rounded bg-yellow-50 p-2 dark:bg-yellow-950">
          <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Warnings</p>
          <ul className="mt-1 space-y-1">
            {field.warnings.map((warning, i) => (
              <li key={i} className="text-xs text-yellow-700 dark:text-yellow-300">
                • {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {field.alternativeTypes.length > 0 && (
        <div className="mt-3">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Could also be</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {field.alternativeTypes.map((type) => (
              <span key={type} className="rounded-full bg-surface px-2 py-1 text-xs text-text-muted">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ColumnCard
