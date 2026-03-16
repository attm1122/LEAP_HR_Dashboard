import React, { useRef } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { readExcelFile } from '@/lib/excel/reader'
import { parseProbationData } from '@/parsers/probation/parser'
import { parseOnboardingData } from '@/parsers/onboarding/parser'
import { parseOffboardingData } from '@/parsers/offboarding/parser'
import { parseWorkbook } from '@/parsers/core/workbook'
import type { Module } from '@/types/common'

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
    clearUploadError
  } = useAppStore()

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(xlsx?|xls)$/i)) {
      setUploadError(module, 'Please upload an Excel file (.xlsx or .xls)')
      return
    }

    setUploadStatus(module, 'parsing')
    clearUploadError(module)

    try {
      const workbook = await readExcelFile(file)
      const workbookData = parseWorkbook(workbook)
      const sheets = Object.values(workbookData.sheets)

      if (sheets.length === 0) {
        throw new Error('No data found in Excel file')
      }

      const data = sheets[0]

      if (module === 'probation') {
        const employees = parseProbationData(data)
        if (employees.length === 0) {
          throw new Error('No valid probation records found')
        }
        setProbation(employees)
      } else if (module === 'onboarding') {
        const onboardingData = parseOnboardingData(data)
        if (onboardingData.questions.length === 0) {
          throw new Error('No valid onboarding questions found')
        }
        setOnboarding(onboardingData)
      } else if (module === 'offboarding') {
        const offboardingData = parseOffboardingData(data)
        if (offboardingData.length === 0) {
          throw new Error('No valid offboarding records found')
        }
        setOffboarding(offboardingData)
      }

      setUploadStatus(module, 'success')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to parse file'
      setUploadError(module, message)
      setUploadStatus(module, 'error')
    }
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

  return (
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
  )
}

export default UploadZone
