import React from 'react'

interface KPICardProps {
  label: string
  value: string | number
  subtitle?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: 'default' | 'success' | 'warning' | 'danger'
}

const KPICard: React.FC<KPICardProps> = ({
  label,
  value,
  subtitle,
  trend,
  color = 'default'
}) => {
  const colorClasses = {
    default: 'bg-surface border-border',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    danger: 'bg-red-50 border-red-200'
  }

  return (
    <div className={`rounded-lg border p-6 ${colorClasses[color]}`}>
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className="mt-2 text-3xl font-bold text-text-primary">{value}</p>
      {subtitle && <p className="mt-1 text-xs text-text-muted">{subtitle}</p>}
      {trend && (
        <div className="mt-3 flex items-center gap-2">
          {trend === 'up' && <span className="text-green-600">↑</span>}
          {trend === 'down' && <span className="text-red-600">↓</span>}
          {trend === 'neutral' && <span className="text-text-muted">→</span>}
        </div>
      )}
    </div>
  )
}

export default KPICard
