import React, { useEffect, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info'
  duration?: number
  onClose?: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type = 'info', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (duration <= 0) return

    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const colors = {
    success: 'bg-green-50 text-green-900 border-green-200',
    error: 'bg-red-50 text-red-900 border-red-200',
    info: 'bg-blue-50 text-blue-900 border-blue-200'
  }

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ⓘ'
  }

  return (
    <div
      className={`fixed bottom-4 right-4 flex max-w-md items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${colors[type]}`}
      role="alert"
    >
      <span className="text-xl font-bold">{icons[type]}</span>
      <p className="flex-1 text-sm">{message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          onClose?.()
        }}
        className="opacity-70 hover:opacity-100"
        aria-label="Close toast"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
