import React, { useMemo } from 'react'
import { OnboardingDashboardData } from '@/domain/models/onboarding'
import HeatmapTable from '@/components/tables/HeatmapTable'
import type { Dimension } from '@/types/common'

interface OnboardingHeatmapProps {
  data: OnboardingDashboardData | null
  activeDimension: Dimension
}

const OnboardingHeatmap: React.FC<OnboardingHeatmapProps> = ({ data, activeDimension }) => {
  const { tableData, columnLabels } = useMemo(() => {
    if (!data || data.questions.length === 0) {
      return { tableData: [], columnLabels: [] }
    }

    const dimKey = activeDimension
    const dimensions = data.dimensions[dimKey] || []
    const columnLabels = dimensions.map((d) => d.value)

    const tableData = data.questions.map((question) => {
      const response = data.responses.find((r) => r.id === question.id)

      const cells = columnLabels.map((dimValue) => {
        const score = response?.scores[dimValue] ?? null
        return {
          label: dimValue,
          // Normalise to 0-1 for the colour scale (scores are 1-5)
          value: score !== null ? score / 5 : null,
          // Show the raw score (e.g. "4.2") not a percentage
          displayValue: score !== null ? score.toFixed(2) : undefined,
          isYesNo: false as const
        }
      })

      return { name: question.text, cells }
    })

    return { tableData, columnLabels }
  }, [data, activeDimension])

  if (!data || tableData.length === 0) {
    return <div className="py-8 text-center text-text-muted">No heatmap data available</div>
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <HeatmapTable
        rows={tableData}
        columnLabels={columnLabels}
        title={`Average Score by ${activeDimension === 'bu' ? 'Business Unit' : activeDimension === 'loc' ? 'Location' : 'Tenure'}`}
      />
    </div>
  )
}

export default OnboardingHeatmap
