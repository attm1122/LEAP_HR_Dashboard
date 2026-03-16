import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SelectFilter from '@/components/filters/SelectFilter'
import OffboardingHeatmap from './OffboardingHeatmap'
import DonutChart from '@/components/charts/DonutChart'
import { useOffboardingFilters } from './hooks/useOffboardingFilters'

const STAT_CARD = 'rounded-lg border border-gray-200 bg-white p-5'

const OffboardingDashboard: React.FC = () => {
  const { offboarding, offboardingFilters, setOffboardingFilters, setIsUploadModalOpen } = useAppStore()
  const filteredData = useOffboardingFilters()

  const filterOptions = useMemo(() => {
    if (!offboarding) return { bu: [], tenure: [], driver: [] }
    const opt = (arr: (string | null)[]) =>
      Array.from(new Set(arr.filter(Boolean))).sort().map((v) => ({ label: v!, value: v! }))
    return {
      bu: opt(offboarding.map((r) => r.bu)),
      tenure: opt(offboarding.map((r) => r.tenure)),
      driver: opt(offboarding.map((r) => r.driver))
    }
  }, [offboarding])

  const stats = useMemo(() => {
    if (!offboarding) return null
    const total = offboarding.length
    const ratings = offboarding.map((r) => r.ratingValue).filter((v): v is number => v !== null)
    const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : null
    const satPct = ratings.length > 0
      ? Math.round((ratings.filter((r) => r >= 4).length / ratings.length) * 100)
      : null
    const driverCounts: Record<string, number> = {}
    offboarding.forEach((r) => { if (r.driver) driverCounts[r.driver] = (driverCounts[r.driver] ?? 0) + 1 })
    const topDriver = Object.entries(driverCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
    return { total, avg, satPct, topDriver, driverCounts }
  }, [offboarding])

  const driverDonut = useMemo(() => {
    if (!stats) return []
    return Object.entries(stats.driverCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }))
  }, [stats])

  if (!offboarding || !stats) {
    return (
      <PageContainer>
        <EmptyState
          title="No Offboarding Data Loaded"
          description="Upload an offboarding survey spreadsheet to get started"
          action={{ label: 'Upload Data', onClick: () => setIsUploadModalOpen(true) }}
          icon="upload"
        />
      </PageContainer>
    )
  }

  const avgColor = stats.avg === null ? 'text-gray-900' : stats.avg >= 4.0 ? 'text-green-800' : stats.avg >= 3.0 ? 'text-amber-800' : 'text-red-800'
  const avgBorder = stats.avg === null ? '' : stats.avg >= 4.0 ? 'border-green-200 bg-green-50' : stats.avg >= 3.0 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'

  return (
    <PageContainer>
      <div className="space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className={STAT_CARD}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Respondents</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className={`${STAT_CARD} ${avgBorder}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Avg Exit Rating</p>
            <p className={`mt-2 text-3xl font-bold ${avgColor}`}>
              {stats.avg !== null ? stats.avg.toFixed(1) : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-500">out of 5.0</p>
          </div>
          <div className={`${STAT_CARD} ${stats.satPct !== null && stats.satPct >= 80 ? 'border-green-200 bg-green-50' : stats.satPct !== null && stats.satPct >= 50 ? 'border-amber-200 bg-amber-50' : ''}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Satisfaction Rate</p>
            <p className={`mt-2 text-3xl font-bold ${stats.satPct !== null && stats.satPct >= 80 ? 'text-green-800' : stats.satPct !== null && stats.satPct >= 50 ? 'text-amber-800' : 'text-gray-900'}`}>
              {stats.satPct !== null ? `${stats.satPct}%` : '—'}
            </p>
            <p className="mt-1 text-xs text-gray-500">rating ≥ 4</p>
          </div>
          <div className={STAT_CARD}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Top Exit Driver</p>
            <p className="mt-2 text-sm font-bold text-gray-900 leading-tight">
              {stats.topDriver ?? '—'}
            </p>
          </div>
        </div>

        {/* Driver donut */}
        {driverDonut.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Exit Drivers</h3>
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="w-full md:w-64 shrink-0">
                <DonutChart data={driverDonut} height={220} colors={['#3B82F6','#8B5CF6','#EC4899','#F59E0B','#10B981','#EF4444']} />
              </div>
              <div className="flex-1 space-y-1 pt-2">
                {driverDonut.map((d) => (
                  <div key={d.name} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{d.name}</span>
                    <span className="font-semibold text-gray-900">
                      {d.value} ({stats.total > 0 ? Math.round((d.value / stats.total) * 100) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <FilterBar title="Filters">
          <SelectFilter label="Business Unit" value={offboardingFilters.bu} onChange={(bu) => setOffboardingFilters({ bu })} options={filterOptions.bu} />
          <SelectFilter label="Tenure" value={offboardingFilters.tenure} onChange={(tenure) => setOffboardingFilters({ tenure })} options={filterOptions.tenure} />
          <SelectFilter label="Exit Driver" value={offboardingFilters.driver} onChange={(driver) => setOffboardingFilters({ driver })} options={filterOptions.driver} />
        </FilterBar>

        {/* Heatmap */}
        <OffboardingHeatmap data={filteredData} />
      </div>
    </PageContainer>
  )
}

export default OffboardingDashboard
