import React, { useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { runPipeline } from '@/pipeline'
import type { Module } from '@/types/common'
import type { SemanticFieldType } from '@/pipeline/types'
import ParseProgress from './ParseProgress'
import DiagnosticsPanel from '@/features/diagnostics/DiagnosticsPanel'
import MappingOverride from '@/features/mapping/MappingOverride'

interface UploadZoneProps {
  module: Module
}

const UploadZone: React.FC<UploadZoneProps> = ({ module }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const {
    setProbation,
    setOnboarding,
    setOffboarding,
    setUploadStatus,
    setUploadError,
    clearUploadError,
    pipelineState,
    setPipelineResult,
    setPipelineStage,
    togglePipelineDiagnostics,
    togglePipelineMappingOverride,
    setFieldOverrides
  } = useAppStore()

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx?|xls)$/i)) {
      setUploadError(module, 'Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setUploadStatus(module, 'parsing')
    clearUploadError(module)

    try {
      setPipelineStage('reading')

      // Run the pipeline
      const result = await runPipeline(file)

      if (result.errors.length > 0) {
        const errorMsg = result.errors[0].message
        setUploadError(module, errorMsg)
        setUploadStatus(module, 'error')
        setPipelineResult(result)
        setPipelineStage('error')
        return
      }

      setPipelineResult(result)
      setPipelineStage('complete')

      // Check if mapping review is needed
      if (result.detectionResult.requiresMappingReview) {
        togglePipelineMappingOverride()
        return
      }

      // Commit data based on module type
      commitPipelineData(result)
      setUploadStatus(module, 'success')

      // Show diagnostics briefly
      togglePipelineDiagnostics()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse file'
      setUploadError(module, message)
      setUploadStatus(module, 'error')
      setPipelineStage('error')
    }
  }

  const commitPipelineData = (result: any) => {
    const { normalizedData } = result

    switch (normalizedData.type) {
      case 'probation-review':
        if (normalizedData.data && normalizedData.data.length > 0) {
          setProbation(normalizedData.data)
        }
        break
      case 'onboarding-survey':
        if (normalizedData.data && normalizedData.data.questions.length > 0) {
          setOnboarding(normalizedData.data)
        }
        break
      case 'offboarding-survey':
        if (normalizedData.data && normalizedData.data.length > 0) {
          setOffboarding(normalizedData.data)
        }
        break
      default:
        throw new Error('Could not determine data module type')
    }
  }

  const handleMappingConfirm = async (overrides: Record<number, SemanticFieldType>) => {
    if (!pipelineState.result) return

    togglePipelineMappingOverride()
    setFieldOverrides(module, overrides)

    try {
      // Re-map with overrides
      const result = pipelineState.result

      // Update the field overrides in detection result
      const updatedFields = result.detectionResult.fields.map((field) => {
        const override = overrides[field.columnIndex]
        if (override) {
          return {
            ...field,
            semanticType: override,
            isAmbiguous: false
          }
        }
        return field
      })

      // Re-map schema
      const { mapToSchema } = await import('@/pipeline/schema-mapper')
      const updatedData = mapToSchema(
        { ...result.detectionResult, fields: updatedFields },
        result.columnProfiles.map((p) => p.cells),
        Array.from(result.workbook.sheets[result.selectedSheet] || [])
      )

      result.normalizedData = updatedData

      commitPipelineData(result)
      setUploadStatus(module, 'success')
      togglePipelineDiagnostics()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to map data'
      setUploadError(module, message)
      setUploadStatus(module, 'error')
    }
  }

  const handleMappingCancel = () => {
    togglePipelineMappingOverride()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files.length > 0) {
      handleFile(files[0])
    }
  }

  // Show progress if pipeline is running
  if (pipelineState.stage !== 'idle') {
    return (
      <div className="space-y-4">
        <ParseProgress stage={pipelineState.stage} fileName={pipelineState.result?.workbook.fileName} />

        {pipelineState.showMappingOverride && pipelineState.result && (
          <MappingOverride
            result={pipelineState.result}
            onConfirm={handleMappingConfirm}
            onCancel={handleMappingCancel}
          />
        )}

        {pipelineState.showDiagnostics && pipelineState.result && (
          <DiagnosticsPanel
            result={pipelineState.result}
            onClose={togglePipelineDiagnostics}
          />
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="rounded-lg border-2 border-dashed border-border bg-surface-muted p-12 text-center transition-colors hover:border-accent"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
          className="hidden"
          aria-label={`Upload ${module} data`}
        />

        <svg className="mx-auto mb-4 h-12 w-12 text-text-muted" fill="none" viewBox="0 0 24 24">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 16.5V9m0 0l-3 3m3-3l3 3M2 12a10 10 0 1020 0 10 10 0 00-20 0z"
          />
        </svg>

        <p className="mb-2 text-lg font-medium text-text-primary">
          Drag and drop your Excel file here
        </p>
        <p className="mb-4 text-sm text-text-muted">or</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition-colors hover:bg-opacity-90"
        >
          Select File
        </button>
        <p className="mt-4 text-xs text-text-muted">Supported formats: .xlsx, .xls, .csv</p>
      </div>

      {pipelineState.showMappingOverride && pipelineState.result && (
        <MappingOverride
          result={pipelineState.result}
          onConfirm={handleMappingConfirm}
          onCancel={handleMappingCancel}
        />
      )}

      {pipelineState.showDiagnostics && pipelineState.result && (
        <DiagnosticsPanel
          result={pipelineState.result}
          onClose={togglePipelineDiagnostics}
        />
      )}
    </div>
  )
}

export default UploadZone
