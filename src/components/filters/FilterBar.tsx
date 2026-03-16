import React from 'react'

interface FilterBarProps {
  children: React.ReactNode
  title?: string
}

const FilterBar: React.FC<FilterBarProps> = ({ children, title }) => {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      {title && <h3 className="mb-4 font-semibold text-text-primary">{title}</h3>}
      <div className="flex flex-wrap gap-4">{children}</div>
    </div>
  )
}

export default FilterBar
