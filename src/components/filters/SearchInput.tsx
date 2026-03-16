import React from 'react'

interface SearchInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const SearchInput: React.FC<SearchInputProps> = ({
  label,
  value,
  onChange,
  placeholder = 'Search...'
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-text-primary">{label}</label>
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:ring-2 focus:ring-accent"
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  )
}

export default SearchInput
