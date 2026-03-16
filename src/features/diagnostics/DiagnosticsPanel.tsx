import React, { useState } from 'react'
import type { PipelineResult } from '@/pipeline/types'
import ColumnCard from './ColumnCard'

interface DiagnosticsPanelProps {
  result: PipelineResult | null
  onClose: () => void
}

const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ result, onClose }) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['detection', 'structure'])
  )

  if (!result) return null

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const { detectionResult, columnProfiles, warnings, errors } = result

  const confidencePercentage = Math.round(detectionResult.confidence * 100)
  const typeLabel = detectionResult.type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-surface shadow-xl">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-surface-dark to-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Parser Diagnostics</h2>
              <p className="mt-1 text-sm text-text-muted">
                {result.workbook.fileName} → {result.selectedSheet}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-muted hover:text-text-primary"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Detection Result */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">Module Detection</h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-text-secondary">{typeLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-text-muted">{confidencePercentage}%</span>
                  <div className="h-2 w-32 rounded-full bg-surface-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        detectionResult.confidence >= 0.8
                          ? 'bg-green-500'
                          : detectionResult.confidence >= 0.6
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${confidencePercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {detectionResult.requiresMappingReview && (
              <div className="rounded-lg border border-yellow-500 bg-yellow-50 p-3 text-sm text-yellow-800 dark:border-yellow-600 dark:bg-yellow-950 dark:text-yellow-200">
                <strong>Manual Review Recommended:</strong> Some columns have ambiguous semantic
                types or low confidence. Please review the mapping below.
              </div>
            )}

            {detectionResult.reasoning.length > 0 && (
              <div className="mt-3 rounded-lg bg-surface-muted p-3">
                <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Reasoning</p>
                <ul className="mt-2 space-y-1">
                  {detectionResult.reasoning.map((reason, i) => (
                    <li key={i} className="text-sm text-text-secondary">
                      • {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-500 bg-red-50 p-4 dark:border-red-600 dark:bg-red-950">
              <h4 className="font-semibold text-red-900 dark:text-red-200">Errors</h4>
              <ul className="mt-2 space-y-1">
                {errors.map((error, i) => (
                  <li key={i} className="text-sm text-red-800 dark:text-red-300">
                    <strong>{error.stage}:</strong> {error.message}
                    {error.detail && <span className="block text-xs opacity-75">{error.detail}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="rounded-lg border border-orange-500 bg-orange-50 p-4 dark:border-orange-600 dark:bg-orange-950">
              <h4 className="font-semibold text-orange-900 dark:text-orange-200">Warnings</h4>
              <ul className="mt-2 space-y-1">
                {warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-orange-800 dark:text-orange-300">
                    {warning.header && <strong>{warning.header}:</strong>} {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected Structure */}
          <div>
            <button
              onClick={() => toggleSection('structure')}
              className="flex w-full items-center justify-between rounded-lg bg-surface-muted p-4 hover:bg-surface-muted/80 transition-colors"
            >
              <h3 className="text-lg font-semibold text-text-primary">Detected Structure</h3>
              <svg
                className={`h-5 w-5 transition-transform ${expandedSections.has('structure') ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {expandedSections.has('structure') && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-2 text-left font-semibold text-text-primary">Column</th>
                      <th className="px-4 py-2 text-left font-semibold text-text-primary">Type</th>
                      <th className="px-4 py-2 text-left font-semibold text-text-primary">Confidence</th>
                      <th className="px-4 py-2 text-left font-semibold text-text-primary">Primitive</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detectionResult.fields.map((field) => (
                      <tr
                        key={field.columnIndex}
                        className={`border-b border-border ${field.isAmbiguous ? 'bg-yellow-50 dark:bg-yellow-950' : ''}`}
                      >
                        <td className="px-4 py-2 font-medium text-text-primary">{field.header}</td>
                        <td className="px-4 py-2">
                          <span className="inline-block rounded-full bg-accent/10 px-2 py-1 text-xs font-medium text-accent">
                            {field.semanticType}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-text-secondary">
                          {Math.round(field.confidence * 100)}%
                        </td>
                        <td className="px-4 py-2 text-xs text-text-muted">{field.primitiveKind}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Column Details */}
          <div>
            <button
              onClick={() => toggleSection('columns')}
              className="flex w-full items-center justify-between rounded-lg bg-surface-muted p-4 hover:bg-surface-muted/80 transition-colors"
            >
              <h3 className="text-lg font-semibold text-text-primary">
                Column Details ({columnProfiles.length})
              </h3>
              <svg
                className={`h-5 w-5 transition-transform ${expandedSections.has('columns') ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>

            {expandedSections.has('columns') && (
              <div className="mt-3 grid gap-3">
                {columnProfiles.map((profile) => {
                  const field = detectionResult.fields[profile.index]
                  return <ColumnCard key={profile.index} profile={profile} field={field} />
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface-muted p-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-accent px-6 py-2 font-medium text-white hover:bg-opacity-90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default DiagnosticsPanel
