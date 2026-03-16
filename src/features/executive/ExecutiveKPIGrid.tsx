import React from 'react'
import type { KPIPlan } from '@/presentation/types'

interface ExecutiveKPIGridProps {
  kpis: KPIPlan[]
  /** If true, renders the hero KPI full-width above the grid */
  showHero?: boolean
}

const COLOR_CLASSES: Record<KPIPlan['color'], { card: string; value: string; badge: string }> = {
  default: {
    card: 'bg-white border-gray-200',
    value: 'text-gray-900',
    badge: 'bg-gray-100 text-gray-600',
  },
  success: {
    card: 'bg-emerald-50 border-emerald-200',
    value: 'text-emerald-800',
    badge: 'bg-emerald-100 text-emerald-700',
  },
  warning: {
    card: 'bg-amber-50 border-amber-200',
    value: 'text-amber-800',
    badge: 'bg-amber-100 text-amber-700',
  },
  danger: {
    card: 'bg-red-50 border-red-200',
    value: 'text-red-800',
    badge: 'bg-red-100 text-red-700',
  },
}

interface KPICardProps {
  kpi: KPIPlan
  hero?: boolean
}

const KPICardItem: React.FC<KPICardProps> = ({ kpi, hero = false }) => {
  const cls = COLOR_CLASSES[kpi.color]

  return (
    <div
      className={`rounded-xl border p-6 flex flex-col gap-1 transition-shadow hover:shadow-md ${cls.card}`}
    >
      <p className="text-sm font-medium text-gray-500 tracking-wide uppercase truncate">
        {kpi.label}
      </p>

      <div className="flex items-baseline gap-1 mt-1">
        <span className={`font-extrabold leading-none ${hero ? 'text-5xl' : 'text-3xl'} ${cls.value}`}>
          {kpi.value}
        </span>
        {kpi.unit && (
          <span className={`text-sm font-medium ${cls.value} opacity-70`}>{kpi.unit}</span>
        )}
      </div>

      {kpi.subtitle && (
        <p className="text-xs text-gray-500 mt-1 truncate">{kpi.subtitle}</p>
      )}

      {kpi.trend && (
        <div className="mt-2 flex items-center gap-1">
          {kpi.trend === 'up' && (
            <span className="text-emerald-600 text-xs font-semibold">▲ Trending up</span>
          )}
          {kpi.trend === 'down' && (
            <span className="text-red-600 text-xs font-semibold">▼ Trending down</span>
          )}
          {kpi.trend === 'neutral' && (
            <span className="text-gray-500 text-xs font-semibold">→ Stable</span>
          )}
        </div>
      )}
    </div>
  )
}

const ExecutiveKPIGrid: React.FC<ExecutiveKPIGridProps> = ({ kpis, showHero = true }) => {
  const heroKPI = showHero ? kpis.find((k) => k.priority === 'hero') : undefined
  const primaryKPIs = kpis.filter((k) => k.priority === 'primary')
  const secondaryKPIs = kpis.filter((k) => k.priority === 'secondary')

  return (
    <div className="space-y-4">
      {/* Hero KPI */}
      {heroKPI && (
        <KPICardItem kpi={heroKPI} hero />
      )}

      {/* Primary KPIs — 2 or 3 column grid */}
      {primaryKPIs.length > 0 && (
        <div
          className={`grid gap-4 ${
            primaryKPIs.length === 2
              ? 'grid-cols-2'
              : primaryKPIs.length === 3
              ? 'grid-cols-3'
              : 'grid-cols-2'
          }`}
        >
          {primaryKPIs.map((kpi) => (
            <KPICardItem key={kpi.id} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Secondary KPIs — compact row */}
      {secondaryKPIs.length > 0 && (
        <div className="grid gap-3 grid-cols-2">
          {secondaryKPIs.map((kpi) => (
            <div
              key={kpi.id}
              className="rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 flex items-center justify-between"
            >
              <span className="text-xs font-medium text-gray-500 truncate">{kpi.label}</span>
              <span className="ml-2 text-sm font-bold text-gray-800 shrink-0">
                {kpi.value}
                {kpi.unit && <span className="text-xs font-normal text-gray-500 ml-0.5">{kpi.unit}</span>}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ExecutiveKPIGrid
