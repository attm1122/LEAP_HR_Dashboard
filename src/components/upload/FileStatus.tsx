import React, { useEffect, useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Module } from '@/types/common'

interface FileStatusProps {
  module: Module
}

const FileStatus: React.FC<FileStatusProps> = ({ module }) => {
  const { uploadStatus, uploadErrors } = useAppStore()
  const [showSuccess, setShowSuccess] = useState(false)

  const status = uploadStatus[module] || 'idle'
  const error = uploadErrors[module]

  useEffect(() => {
    if (status === 'success') {
      setShowSuccess(true)
      const timer = setTimeout(() => setShowSuccess(false), 3000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [status])

  if (status === 'idle') {
    return null
  }

  if (status === 'parsing') {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-blue-50 px-4 py-3 text-blue-900">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-900" />
        <p className="text-sm font-medium">Parsing file...</p>
      </div>
    )
  }

  if (status === 'success' && showSuccess) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 text-green-900">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium">File uploaded successfully!</p>
      </div>
    )
  }

  if (status === 'error' && error) {
    return (
      <div className="mt-4 flex items-center gap-3 rounded-lg bg-red-50 px-4 py-3 text-red-900">
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="text-sm">
          <p className="font-medium">Upload failed</p>
          <p className="text-xs opacity-90">{error}</p>
        </div>
      </div>
    )
  }

  return <div className="mt-4 hidden" />
}

export default FileStatus
