import React from 'react'
import { useAppStore } from '@/store/useAppStore'

const Header: React.FC = () => {
  const { setIsUploadModalOpen } = useAppStore()

  return (
    <header className="border-b border-border bg-surface px-8 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">LEAP HR Analytics</h1>
          <p className="text-sm text-text-muted">Employee Lifecycle Analytics Dashboard</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="rounded-lg bg-accent px-6 py-2 font-medium text-white transition-colors hover:bg-opacity-90"
          aria-label="Upload data"
        >
          Upload Data
        </button>
      </div>
    </header>
  )
}

export default Header
