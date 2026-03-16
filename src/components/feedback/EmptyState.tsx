import React from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  icon?: 'upload' | 'chart' | 'inbox'
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon = 'inbox' }) => {
  const iconMap = {
    upload: (
      <svg className="mx-auto mb-6 h-16 w-16 text-text-muted" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M12 16.5V9m0 0l-3 3m3-3l3 3M2 12a10 10 0 1020 0 10 10 0 00-20 0z"
        />
      </svg>
    ),
    chart: (
      <svg className="mx-auto mb-6 h-16 w-16 text-text-muted" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M3 13a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 9M3 13V3m18 0v10m0-10l-2.74 2.74a9 9 0 00-13.02 0"
        />
      </svg>
    ),
    inbox: (
      <svg className="mx-auto mb-6 h-16 w-16 text-text-muted" fill="none" viewBox="0 0 24 24">
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-12 text-center">
      {iconMap[icon]}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      {description && <p className="mt-2 text-text-muted">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-6 rounded-lg bg-accent px-6 py-2 font-medium text-white transition-colors hover:bg-opacity-90"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
