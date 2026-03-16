import React from 'react'
import Header from './Header'
import TabNav from './TabNav'

interface AppShellProps {
  children: React.ReactNode
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="flex h-screen flex-col bg-surface-muted">
      <Header />
      <TabNav />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}

export default AppShell
