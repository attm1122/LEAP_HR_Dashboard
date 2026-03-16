import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SearchInput from '@/components/filters/SearchInput'
import SelectFilter from '@/components/filters/SelectFilter'
import ProbationTable from '@/components/tables/ProbationTable'
import { useProbationFilters } from './hooks/useProbationFilters'
import ExecutiveDashboardLayout from '@/features/executive/ExecutiveDashboardLayout'
import { planProbation } from '@/presentation/presentation-planner'

const ProbationDashboard: React.FC = () => {
  const {
    probation,
    probationFilters,
    setProbationFilters,
    setIsUploadModalOpen,
    pipelineState,
  } = useAppStore()

  const filteredData = useProbationFilters()

  const managers = useMemo(() => {
    if (!probation) return []
    return Array.from(new Set(probation.map((e) => e.manager).filter(Boolean))).sort()
  }, [probation])

  // Derive presentation plan from the full (unfiltered) dataset
  const plan = useMemo(
    () => (probation ? planProbation(probation) : null),
    [probation]
  )

  const detection = pipelineState.result?.detectionResult
  const fileName = pipelineState.result?.workbook.fileName

  if (!probation || !plan) {
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
      <ExecutiveDashboardLayout plan={plan} detection={detection} fileName={fileName}>
        {/* Filters + detail table injected as children into the layout's detail slot */}
        <div className="p-6 space-y-6">
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

          <div>
            <p className="text-xs text-gray-500 mb-3">
              {filteredData.length} employee{filteredData.length !== 1 ? 's' : ''} shown
            </p>
            <ProbationTable data={filteredData} />
          </div>
        </div>
      </ExecutiveDashboardLayout>
    </PageContainer>
  )
}

export default ProbationDashboard
