import React from 'react'
import KPICard from './KPICard'

interface KPIItem {
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'success' | 'warning' | 'danger'
}

interface KPIGridProps {
  items: KPIItem[]
  columns?: 2 | 3 | 4
}

const KPIGrid: React.FC<KPIGridProps> = ({ items, columns = 4 }) => {
  const colClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  }

  return (
    <div className={`grid gap-6 ${colClasses[columns]}`}>
      {items.map((item, idx) => (
        <KPICard
          key={`${item.label}_${idx}`}
          label={item.label}
          value={item.value}
          subtitle={item.subtitle}
          trend={item.trend}
          color={item.color}
        />
      ))}
    </div>
  )
}

export default KPIGrid
