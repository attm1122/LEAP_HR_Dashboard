import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import DimToggle from '@/components/filters/DimToggle'
import FilterBar from '@/components/filters/FilterBar'
import OnboardingHeatmap from './OnboardingHeatmap'
import type { Dimension } from '@/types/common'
import ExecutiveDashboardLayout from '@/features/executive/ExecutiveDashboardLayout'
import { planOnboarding } from '@/presentation/presentation-planner'

const OnboardingDashboard: React.FC = () => {
  const {
    onboarding,
    activeDimension,
    setActiveDimension,
    setIsUploadModalOpen,
    pipelineState,
  } = useAppStore()

  const plan = useMemo(
    () => (onboarding ? planOnboarding(onboarding) : null),
    [onboarding]
  )

  const detection = pipelineState.result?.detectionResult
  const fileName = pipelineState.result?.workbook.fileName

  if (!onboarding || !plan) {
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
      <ExecutiveDashboardLayout plan={plan} detection={detection} fileName={fileName}>
        <div className="p-6 space-y-6">
          <FilterBar title="Filters">
            <DimToggle
              label="View By"
              value={activeDimension}
              onChange={setActiveDimension}
              options={dimensions}
            />
          </FilterBar>

          <OnboardingHeatmap data={onboarding} activeDimension={activeDimension} />
        </div>
      </ExecutiveDashboardLayout>
    </PageContainer>
  )
}

export default OnboardingDashboard
