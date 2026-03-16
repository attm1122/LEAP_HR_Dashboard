import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import DimToggle from '@/components/filters/DimToggle'
import FilterBar from '@/components/filters/FilterBar'
import OnboardingKPIs from './OnboardingKPIs'
import OnboardingCharts from './OnboardingCharts'
import OnboardingHeatmap from './OnboardingHeatmap'
import type { Dimension } from '@/types/common'

const OnboardingDashboard: React.FC = () => {
  const { onboarding, activeDimension, setActiveDimension, setIsUploadModalOpen } =
    useAppStore()

  if (!onboarding) {
    return (
      <PageContainer>
        <EmptyState
          title="No Onboarding Data Loaded"
          description="Upload an onboarding survey spreadsheet to get started"
          action={{
            label: 'Upload Data',
            onClick: () => setIsUploadModalOpen(true)
          }}
          icon="upload"
        />
      </PageContainer>
    )
  }

  const dimensions: Array<{ label: string; value: Dimension }> = [
    { label: 'Business Unit', value: 'bu' },
    { label: 'Location', value: 'loc' },
    { label: 'Tenure', value: 'ten' }
  ]

  return (
    <PageContainer>
      <div className="space-y-8">
        <OnboardingKPIs data={onboarding} />

        <FilterBar title="Filters">
          <DimToggle
            label="View By"
            value={activeDimension}
            onChange={setActiveDimension}
            options={dimensions}
          />
        </FilterBar>

        <OnboardingCharts data={onboarding} activeDimension={activeDimension} />

        <OnboardingHeatmap data={onboarding} activeDimension={activeDimension} />
      </div>
    </PageContainer>
  )
}

export default OnboardingDashboard
