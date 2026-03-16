import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Module } from '@/types/common'

const TabNav: React.FC = () => {
  const { activeModule, setActiveModule } = useAppStore()

  const tabs: { label: string; value: Module }[] = [
    { label: 'Probation', value: 'probation' },
    { label: 'Onboarding', value: 'onboarding' },
    { label: 'Offboarding', value: 'offboarding' }
  ]

  return (
    <nav className="border-b border-border bg-surface">
      <div className="flex px-8">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveModule(tab.value)}
            className={`border-b-2 px-6 py-4 font-medium transition-colors ${
              activeModule === tab.value
                ? 'border-accent-red text-accent-red'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
            aria-current={activeModule === tab.value ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

export default TabNav
