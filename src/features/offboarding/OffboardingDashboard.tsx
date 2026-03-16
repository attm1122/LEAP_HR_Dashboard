import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SelectFilter from '@/components/filters/SelectFilter'
import OffboardingHeatmap from './OffboardingHeatmap'
import { useOffboardingFilters } from './hooks/useOffboardingFilters'
import ExecutiveDashboardLayout from '@/features/executive/ExecutiveDashboardLayout'
import { planOffboarding } from '@/presentation/presentation-planner'

const OffboardingDashboard: React.FC = () => {
  const {
    offboarding,
    offboardingFilters,
    setOffboardingFilters,
    setIsUploadModalOpen,
    pipelineState,
  } = useAppStore()

  const filteredData = useOffboardingFilters()

  const filterOptions = useMemo(() => {
    if (!offboarding) {
      return { bu: [], tenure: [], driver: [] }
    }

    const bu = Array.from(new Set(offboarding.map((r) => r.bu).filter(Boolean)))
      .sort()
      .map((v) => ({ label: v || '', value: v || '' }))

    const tenure = Array.from(new Set(offboarding.map((r) => r.tenure).filter(Boolean)))
      .sort()
      .map((v) => ({ label: v || '', value: v || '' }))

    const driver = Array.from(new Set(offboarding.map((r) => r.driver).filter(Boolean)))
      .sort()
      .map((v) => ({ label: v || '', value: v || '' }))

    return { bu, tenure, driver }
  }, [offboarding])

  // Plan is derived from the FULL dataset so KPIs reflect the whole picture
  const plan = useMemo(
    () => (offboarding ? planOffboarding(offboarding) : null),
    [offboarding]
  )

  const detection = pipelineState.result?.detectionResult
  const fileName = pipelineState.result?.workbook.fileName

  if (!offboarding || !plan) {
    return (
      <PageContainer>
        <EmptyState
          title="No Offboarding Data Loaded"
          description="Upload an offboarding survey spreadsheet to get started"
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
        <div className="p-6 space-y-6">
          <FilterBar title="Filters">
            <SelectFilter
              label="Business Unit"
              value={offboardingFilters.bu}
              onChange={(bu) => setOffboardingFilters({ bu })}
              options={filterOptions.bu}
            />
            <SelectFilter
              label="Tenure"
              value={offboardingFilters.tenure}
              onChange={(tenure) => setOffboardingFilters({ tenure })}
              options={filterOptions.tenure}
            />
            <SelectFilter
              label="Exit Driver"
              value={offboardingFilters.driver}
              onChange={(driver) => setOffboardingFilters({ driver })}
              options={filterOptions.driver}
            />
          </FilterBar>

          <OffboardingHeatmap data={filteredData} />
        </div>
      </ExecutiveDashboardLayout>
    </PageContainer>
  )
}

export default OffboardingDashboard
