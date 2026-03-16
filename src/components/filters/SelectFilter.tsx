import React from 'react'

interface SelectFilterProps {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
  placeholder?: string
}

const SelectFilter: React.FC<SelectFilterProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'All'
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:ring-2 focus:ring-accent"
      >
        <option value="">{placeholder}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SelectFilter
