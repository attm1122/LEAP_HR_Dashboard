import React, { useState } from 'react'
import type { PipelineResult, SemanticFieldType } from '@/pipeline/types'

interface MappingOverrideProps {
  result: PipelineResult
  onConfirm: (overrides: Record<number, SemanticFieldType>) => void
  onCancel: () => void
}

const SEMANTIC_TYPE_LABELS: Record<SemanticFieldType, string> = {
  'identifier': 'Identifier',
  'person-name': 'Person Name',
  'manager-name': 'Manager Name',
  'business-unit': 'Business Unit',
  'location': 'Location',
  'tenure-band': 'Tenure Band',
  'probation-period': 'Probation Period',
  'assessment-status': 'Assessment Status',
  'assessment-score': 'Assessment Score',
  'survey-score': 'Survey Score',
  'survey-question-text': 'Survey Question',
  'respondent-count': 'Respondent Count',
  'date': 'Date',
  'yes-no': 'Yes/No',
  'exit-reason': 'Exit Reason',
  'comment-text': 'Comment Text',
  'category': 'Category',
  'metric': 'Metric',
  'unknown': 'Unknown'
}

const SEMANTIC_TYPES: SemanticFieldType[] = [
  'identifier',
  'person-name',
  'manager-name',
  'business-unit',
  'location',
  'tenure-band',
  'probation-period',
  'assessment-status',
  'assessment-score',
  'survey-score',
  'survey-question-text',
  'respondent-count',
  'date',
  'yes-no',
  'exit-reason',
  'comment-text',
  'category',
  'metric',
  'unknown'
]

const MappingOverride: React.FC<MappingOverrideProps> = ({ result, onConfirm, onCancel }) => {
  const [overrides, setOverrides] = useState<Record<number, SemanticFieldType>>({})

  const ambiguousFields = result.detectionResult.fields.filter(
    (f) => f.isAmbiguous || f.confidence < 0.8
  )

  const handleTypeChange = (columnIndex: number, newType: SemanticFieldType) => {
    setOverrides({
      ...overrides,
      [columnIndex]: newType
    })
  }

  const handleConfirm = () => {
    onConfirm(overrides)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface shadow-xl">
        {/* Header */}
        <div className="border-b border-border bg-gradient-to-r from-surface-dark to-surface p-6">
          <h2 className="text-2xl font-bold text-text-primary">Review Column Mappings</h2>
          <p className="mt-2 text-sm text-text-muted">
            {ambiguousFields.length} column{ambiguousFields.length !== 1 ? 's' : ''} need review.
            Please confirm or correct the detected column types.
          </p>
        </div>

        <div className="p-6 space-y-4">
          {ambiguousFields.map((field) => {
            const currentOverride = overrides[field.columnIndex]
            const displayType = currentOverride ?? field.semanticType

            return (
              <div key={field.columnIndex} className="rounded-lg border border-border bg-surface-muted p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary">{field.header}</h3>
                    <p className="mt-1 text-xs text-text-muted">
                      Confidence: {Math.round(field.confidence * 100)}%
                    </p>
                  </div>
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

                <div className="mb-3">
                  <label className="block text-sm font-medium text-text-secondary">Column Type</label>
                  <select
                    value={displayType}
                    onChange={(e) => handleTypeChange(field.columnIndex, e.target.value as SemanticFieldType)}
                    className="mt-2 w-full rounded-lg border border-border bg-surface px-3 py-2 text-text-primary focus:border-accent focus:outline-none"
                  >
                    {SEMANTIC_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {SEMANTIC_TYPE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </div>

                {field.alternativeTypes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-text-muted uppercase tracking-wide">Other Options</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {field.alternativeTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => handleTypeChange(field.columnIndex, type)}
                          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                            displayType === type
                              ? 'bg-accent text-white'
                              : 'bg-surface hover:bg-border text-text-secondary'
                          }`}
                        >
                          {SEMANTIC_TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {field.warnings.length > 0 && (
                  <div className="mt-3 rounded bg-yellow-50 p-2 dark:bg-yellow-950">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-200">Notes</p>
                    <ul className="mt-1 space-y-1">
                      {field.warnings.map((warning, i) => (
                        <li key={i} className="text-xs text-yellow-700 dark:text-yellow-300">
                          • {warning}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface-muted p-4 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border px-6 py-2 font-medium text-text-secondary hover:bg-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 rounded-lg bg-accent px-6 py-2 font-medium text-white hover:bg-opacity-90 transition-colors"
          >
            Confirm Mappings
          </button>
        </div>
      </div>
    </div>
  )
}

export default MappingOverride
