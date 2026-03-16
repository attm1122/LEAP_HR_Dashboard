import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SearchInput from '@/components/filters/SearchInput'
import SelectFilter from '@/components/filters/SelectFilter'
import ProbationKPIs from './ProbationKPIs'
import ProbationCharts from './ProbationCharts'
import ProbationTable from '@/components/tables/ProbationTable'
import { useProbationFilters } from './hooks/useProbationFilters'

const ProbationDashboard: React.FC = () => {
  const { probation, probationFilters, setProbationFilters, setIsUploadModalOpen } =
    useAppStore()
  const filteredData = useProbationFilters()

  const managers = useMemo(() => {
    if (!probation) return []
    return Array.from(new Set(probation.map((e) => e.manager).filter(Boolean))).sort()
  }, [probation])

  if (!probation) {
    return (
      <PageContainer>
        <EmptyState
          title="No Probation Data Loaded"
          description="Upload a probation assessment spreadsheet to get started"
          action={{
            label: 'Upload Data',
            onClick: () => setIsUploadModalOpen(true)
          }}
          icon="upload"
        />
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <ProbationKPIs data={probation} />

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
            options={[
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' }
            ]}
          />
          <SelectFilter
            label="Manager Assessment"
            value={probationFilters.mgrStatus}
            onChange={(mgrStatus) => setProbationFilters({ mgrStatus })}
            options={[
              { label: 'Completed', value: 'completed' },
              { label: 'Pending', value: 'pending' }
            ]}
          />
        </FilterBar>

        <ProbationCharts data={probation} />

        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="mb-6 font-semibold text-text-primary">
            Employee Assessments ({filteredData.length})
          </h3>
          <ProbationTable data={filteredData} />
        </div>
      </div>
    </PageContainer>
  )
}

export default ProbationDashboard
