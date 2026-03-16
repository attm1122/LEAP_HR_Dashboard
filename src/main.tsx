import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/App'
import './styles/index.css'

function showFatalError(msg: string) {
  const root = document.getElementById('root')
  if (root) {
    root.innerHTML = `<div style="font-family:monospace;background:#fff0f0;color:#900;padding:32px;margin:32px;border:2px solid #f00;border-radius:8px;white-space:pre-wrap;word-break:break-all"><strong>FATAL LOAD ERROR</strong>\n\n${msg}</div>`
  }
}

window.onerror = (_msg, _src, _line, _col, err) => {
  showFatalError(err ? (err.stack ?? String(err)) : String(_msg))
  return true
}

window.addEventListener('unhandledrejection', (e) => {
  showFatalError('Unhandled Promise rejection:\n' + String(e.reason?.stack ?? e.reason))
})

try {
  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('Root element #root not found in DOM')

  ReactDOM.createRoot(rootEl).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (err) {
  showFatalError(err instanceof Error ? (err.stack ?? err.message) : String(err))
}
