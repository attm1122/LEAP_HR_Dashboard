import React from 'react'
import type { Dimension } from '@/types/common'

interface DimToggleProps {
  label: string
  value: Dimension
  onChange: (dim: Dimension) => void
  options: Array<{ label: string; value: Dimension }>
}

const DimToggle: React.FC<DimToggleProps> = ({ label, value, onChange, options }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              value === opt.value
                ? 'bg-accent text-white'
                : 'border border-border bg-surface text-text-secondary hover:bg-surface-muted'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default DimToggle
