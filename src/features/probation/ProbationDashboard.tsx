import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SearchInput from '@/components/filters/SearchInput'
import SelectFilter from '@/components/filters/SelectFilter'
import ProbationTable from '@/components/tables/ProbationTable'
import DonutChart from '@/components/charts/DonutChart'
import VerticalBarChart from '@/components/charts/VerticalBarChart'
import { useProbationFilters } from './hooks/useProbationFilters'
import { assessmentIsComplete, getStatusKey } from '@/domain/models/probation'

const STAT_CARD = 'rounded-lg border border-gray-200 bg-white p-5'

const ProbationDashboard: React.FC = () => {
  const { probation, probationFilters, setProbationFilters, setIsUploadModalOpen } = useAppStore()
  const filteredData = useProbationFilters()

  const managers = useMemo(() => {
    if (!probation) return []
    return Array.from(new Set(probation.map((e) => e.manager).filter(Boolean))).sort()
  }, [probation])

  const stats = useMemo(() => {
    if (!probation) return null
    const total = probation.length
    const selfDone = probation.filter((e) => assessmentIsComplete(e.selfStatus)).length
    const mgrDone = probation.filter((e) => assessmentIsComplete(e.mgrStatus)).length
    const bothDone = probation.filter(
      (e) => assessmentIsComplete(e.selfStatus) && assessmentIsComplete(e.mgrStatus)
    ).length
    const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0)
    return { total, selfDone, mgrDone, bothDone, selfPct: pct(selfDone), mgrPct: pct(mgrDone), bothPct: pct(bothDone) }
  }, [probation])

  const selfDonut = useMemo(() => {
    if (!probation) return []
    const counts: Record<string, number> = {}
    probation.forEach((e) => {
      const k = getStatusKey(e.selfStatus)
      counts[k] = (counts[k] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [probation])

  const mgrDonut = useMemo(() => {
    if (!probation) return []
    const counts: Record<string, number> = {}
    probation.forEach((e) => {
      const k = getStatusKey(e.mgrStatus)
      counts[k] = (counts[k] ?? 0) + 1
    })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [probation])

  const managerBar = useMemo(() => {
    if (!probation) return []
    const map: Record<string, { total: number; done: number }> = {}
    probation.forEach((e) => {
      if (!e.manager) return
      if (!map[e.manager]) map[e.manager] = { total: 0, done: 0 }
      map[e.manager].total++
      if (assessmentIsComplete(e.selfStatus) && assessmentIsComplete(e.mgrStatus)) map[e.manager].done++
    })
    return Object.entries(map)
      .map(([name, { total, done }]) => ({
        name: name.length > 18 ? name.slice(0, 16) + '…' : name,
        'Completion %': total > 0 ? Math.round((done / total) * 100) : 0
      }))
      .sort((a, b) => b['Completion %'] - a['Completion %'])
      .slice(0, 8)
  }, [probation])

  if (!probation || !stats) {
    return (
      <PageContainer>
        <EmptyState
          title="No Probation Data Loaded"
          description="Upload a probation assessment spreadsheet to get started"
          action={{ label: 'Upload Data', onClick: () => setIsUploadModalOpen(true) }}
          icon="upload"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-8">

        {/* KPI row */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className={STAT_CARD}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Total Employees</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className={`${STAT_CARD} ${stats.bothPct >= 80 ? 'border-green-200 bg-green-50' : stats.bothPct >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Both Complete</p>
            <p className={`mt-2 text-3xl font-bold ${stats.bothPct >= 80 ? 'text-green-800' : stats.bothPct >= 50 ? 'text-amber-800' : 'text-red-800'}`}>{stats.bothPct}%</p>
            <p className="mt-1 text-xs text-gray-500">{stats.bothDone} of {stats.total}</p>
          </div>
          <div className={`${STAT_CARD} ${stats.selfPct >= 80 ? 'border-green-200 bg-green-50' : stats.selfPct >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Self-Assessment</p>
            <p className={`mt-2 text-3xl font-bold ${stats.selfPct >= 80 ? 'text-green-800' : stats.selfPct >= 50 ? 'text-amber-800' : 'text-red-800'}`}>{stats.selfPct}%</p>
            <p className="mt-1 text-xs text-gray-500">{stats.selfDone} complete</p>
          </div>
          <div className={`${STAT_CARD} ${stats.mgrPct >= 80 ? 'border-green-200 bg-green-50' : stats.mgrPct >= 50 ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50'}`}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Manager Review</p>
            <p className={`mt-2 text-3xl font-bold ${stats.mgrPct >= 80 ? 'text-green-800' : stats.mgrPct >= 50 ? 'text-amber-800' : 'text-red-800'}`}>{stats.mgrPct}%</p>
            <p className="mt-1 text-xs text-gray-500">{stats.mgrDone} complete</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Self-Assessment Status</h3>
            <DonutChart data={selfDonut} colors={['#15803D', '#F59E0B', '#D1D5DB', '#9CA3AF']} height={220} />
            <div className="mt-2 space-y-1">
              {selfDonut.map((d) => (
                <div key={d.name} className="flex justify-between text-xs text-gray-600">
                  <span>{d.name}</span><span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Manager Review Status</h3>
            <DonutChart data={mgrDonut} colors={['#15803D', '#F59E0B', '#D1D5DB', '#9CA3AF']} height={220} />
            <div className="mt-2 space-y-1">
              {mgrDonut.map((d) => (
                <div key={d.name} className="flex justify-between text-xs text-gray-600">
                  <span>{d.name}</span><span className="font-medium">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-sm font-semibold text-gray-700">Completion % by Manager</h3>
            <VerticalBarChart data={managerBar} dataKeys={['Completion %']} colors={['#1e293b']} height={260} />
          </div>
        </div>

        {/* Filters + table */}
        <FilterBar title="Filters">
          <SearchInput
            label="Search Employee"
            value={probationFilters.search}
            onChange={(search) => setProbationFilters({ search })}
            placeholder="By name or ID..."
          />
          <SelectFilter
            label="Manager"
            value={probationFilters.manager}
            onChange={(manager) => setProbationFilters({ manager })}
            options={managers.map((m) => ({ label: m, value: m }))}
          />
          <SelectFilter
            label="Self Assessment"
            value={probationFilters.selfStatus}
            onChange={(selfStatus) => setProbationFilters({ selfStatus })}
            options={[{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }]}
          />
          <SelectFilter
            label="Manager Assessment"
            value={probationFilters.mgrStatus}
            onChange={(mgrStatus) => setProbationFilters({ mgrStatus })}
            options={[{ label: 'Completed', value: 'completed' }, { label: 'Pending', value: 'pending' }]}
          />
        </FilterBar>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-sm font-semibold text-gray-700">
            Employee Assessments ({filteredData.length})
          </h3>
          <ProbationTable data={filteredData} />
        </div>
      </div>
    </PageContainer>
  )
}

export default ProbationDashboard
