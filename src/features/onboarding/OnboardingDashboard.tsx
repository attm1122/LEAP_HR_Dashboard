import React, { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import PageContainer from '@/components/layout/PageContainer'
import EmptyState from '@/components/feedback/EmptyState'
import DimToggle from '@/components/filters/DimToggle'
import FilterBar from '@/components/filters/FilterBar'
import OnboardingHeatmap from './OnboardingHeatmap'
import type { Dimension } from '@/types/common'

const STAT_CARD = 'rounded-lg border border-gray-200 bg-white p-5'

const OnboardingDashboard: React.FC = () => {
  const { onboarding, activeDimension, setActiveDimension, setIsUploadModalOpen } = useAppStore()

  const stats = useMemo(() => {
    if (!onboarding) return null
    const total = onboarding.totalRespondents
    const allScores = onboarding.responses.map((r) => r.allScore).filter((s): s is number => s !== null)
    const avg = allScores.length > 0 ? allScores.reduce((a, b) => a + b, 0) / allScores.length : null
    const satPct = allScores.length > 0
      ? Math.round((allScores.filter((s) => s >= 4.0).length / allScores.length) * 100)
      : null
    const questions = onboarding.visibleQuestions.length
    return { total, avg, satPct, questions }
  }, [onboarding])

  if (!onboarding || !stats) {
    return (
      <PageContainer>
        <EmptyState
          title="No Onboarding Data Loaded"
          description="Upload an onboarding survey spreadsheet to get started"
          action={{ label: 'Upload Data', onClick: () => setIsUploadModalOpen(true) }}
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
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Avg Score</p>
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
            <p className="mt-1 text-xs text-gray-500">score ≥ 4.0</p>
          </div>
          <div className={STAT_CARD}>
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Questions</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.questions}</p>
          </div>
        </div>

        {/* Dimension filter */}
        <FilterBar title="View By">
          <DimToggle label="Dimension" value={activeDimension} onChange={setActiveDimension} options={dimensions} />
        </FilterBar>

        {/* Heatmap */}
        <OnboardingHeatmap data={onboarding} activeDimension={activeDimension} />
      </div>
    </PageContainer>
  )
}

export default OnboardingDashboard
