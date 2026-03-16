import React from 'react'

interface State {
  hasError: boolean
  error: Error | null
  componentStack: string | null
}

interface Props {
  children: React.ReactNode
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    this.setState({ componentStack: info.componentStack ?? null })
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl border border-red-200 shadow-sm max-w-2xl w-full p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900">Application Error</h2>
                <p className="text-xs text-gray-500">Something went wrong during render</p>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-red-800 font-mono">
                {this.state.error?.name}: {this.state.error?.message}
              </p>
            </div>

            {this.state.componentStack && (
              <details className="mb-4">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Component stack trace
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                  {this.state.componentStack}
                </pre>
              </details>
            )}

            {this.state.error?.stack && (
              <details>
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                  Full stack trace
                </summary>
                <pre className="mt-2 text-xs text-gray-600 bg-gray-50 rounded p-3 overflow-auto max-h-48 whitespace-pre-wrap">
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <button
              onClick={() => this.setState({ hasError: false, error: null, componentStack: null })}
              className="mt-6 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
