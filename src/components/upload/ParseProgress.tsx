import React from 'react'
import type { PipelineStage } from '@/pipeline/types'

interface ParseProgressProps {
  stage: PipelineStage
  fileName?: string
}

const stages: PipelineStage[] = [
  'reading',
  'normalizing',
  'profiling',
  'classifying',
  'detecting',
  'mapping',
  'complete'
]

const stageLabels: Record<PipelineStage, string> = {
  'idle': 'Ready',
  'reading': 'Reading',
  'normalizing': 'Normalizing',
  'profiling': 'Profiling',
  'classifying': 'Classifying',
  'detecting': 'Detecting',
  'mapping': 'Mapping',
  'complete': 'Complete',
  'error': 'Error'
}

const ParseProgress: React.FC<ParseProgressProps> = ({ stage, fileName }) => {
  const currentStageIndex = stages.indexOf(stage as any)
  const isError = stage === 'error'
  const isComplete = stage === 'complete'

  return (
    <div className="w-full">
      {fileName && (
        <p className="mb-4 text-sm text-text-muted">Processing: {fileName}</p>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          {stages.map((s, index) => (
            <React.Fragment key={s}>
              {index > 0 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded transition-colors ${
                    index <= currentStageIndex && !isError
                      ? 'bg-accent'
                      : 'bg-border'
                  }`}
                />
              )}

              <div
                className={`flex flex-col items-center transition-all ${
                  index === currentStageIndex && !isError && !isComplete
                    ? 'scale-110'
                    : 'scale-100'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center font-medium transition-colors ${
                    index < currentStageIndex && !isError
                      ? 'bg-green-500 text-white'
                      : index === currentStageIndex && !isError
                        ? 'bg-accent text-white'
                        : 'bg-surface-muted text-text-muted'
                  }`}
                >
                  {index < currentStageIndex && !isError ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <label className="mt-2 text-xs font-medium text-text-muted text-center w-16">
                  {stageLabels[s]}
                </label>
              </div>
            </React.Fragment>
          ))}
        </div>

        {isError && (
          <div className="rounded-lg border border-red-500 bg-red-50 p-3 text-sm text-red-800 dark:border-red-600 dark:bg-red-950 dark:text-red-200">
            <strong>Error:</strong> An error occurred during file processing. Please check the details above.
          </div>
        )}

        {isComplete && (
          <div className="rounded-lg border border-green-500 bg-green-50 p-3 text-sm text-green-800 dark:border-green-600 dark:bg-green-950 dark:text-green-200">
            <strong>Complete!</strong> File processed successfully.
          </div>
        )}
      </div>
    </div>
  )
}

export default ParseProgress
