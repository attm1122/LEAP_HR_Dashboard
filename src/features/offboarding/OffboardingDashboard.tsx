import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import FilterBar from '@/components/filters/FilterBar'
import SelectFilter from '@/components/filters/SelectFilter'
import OffboardingKPIs from './OffboardingKPIs'
import OffboardingCharts from './OffboardingCharts'
import OffboardingHeatmap from './OffboardingHeatmap'
import OffboardingCards from './OffboardingCards'
import { useOffboardingFilters } from './hooks/useOffboardingFilters'

const OffboardingDashboard: React.FC = () => {
  const { offboarding, offboardingFilters, setOffboardingFilters, setIsUploadModalOpen } =
    useAppStore()
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

  if (!offboarding) {
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
      <div className="space-y-8">
        <OffboardingKPIs data={offboarding} />

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

        <OffboardingCards data={offboarding} />

        <OffboardingCharts data={filteredData} />

        <OffboardingHeatmap data={filteredData} />
      </div>
    </PageContainer>
  )
}

export default OffboardingDashboard
