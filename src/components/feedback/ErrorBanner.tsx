import React from 'react'

interface ErrorBannerProps {
  title: string
  message?: string
  onClose?: () => void
}

const ErrorBanner: React.FC<ErrorBannerProps> = ({ title, message, onClose }) => {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-900">
      <div className="flex items-start gap-4">
        <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
        <div className="flex-1">
          <h3 className="font-semibold">{title}</h3>
          {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-red-700 hover:text-red-900"
            aria-label="Close error"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default ErrorBanner
