import React, { useState } from 'react'
import { useAppStore } from '@/store/useAppStore'
import UploadZone from './UploadZone'
import FileStatus from './FileStatus'

const UploadModal: React.FC = () => {
  const { isUploadModalOpen, setIsUploadModalOpen } = useAppStore()
  const [activeTab, setActiveTab] = useState<'probation' | 'onboarding' | 'offboarding'>(
    'probation'
  )

  if (!isUploadModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-surface p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-text-primary">Upload HR Data</h2>
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="text-text-muted hover:text-text-primary"
            aria-label="Close modal"
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

        <div className="mb-6 flex gap-4 border-b border-border">
          {(['probation', 'onboarding', 'offboarding'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-4 py-3 font-medium capitalize transition-colors ${
                activeTab === tab
                  ? 'border-accent-red text-accent-red'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {activeTab === 'probation' && (
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Probation Assessment Data</h3>
              <UploadZone module="probation" />
              <FileStatus module="probation" />
            </div>
          )}

          {activeTab === 'onboarding' && (
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Onboarding Survey Data</h3>
              <UploadZone module="onboarding" />
              <FileStatus module="onboarding" />
            </div>
          )}

          {activeTab === 'offboarding' && (
            <div>
              <h3 className="mb-4 font-semibold text-text-primary">Offboarding Survey Data</h3>
              <UploadZone module="offboarding" />
              <FileStatus module="offboarding" />
            </div>
          )}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <button
            onClick={() => setIsUploadModalOpen(false)}
            className="rounded-lg border border-border px-6 py-2 font-medium text-text-secondary hover:bg-surface-muted"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadModal
