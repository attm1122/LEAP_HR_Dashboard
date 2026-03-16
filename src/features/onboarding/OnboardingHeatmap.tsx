import React, { useMemo } from 'react'
import { OnboardingDashboardData } from '@/domain/models/onboarding'
import HeatmapTable from '@/components/tables/HeatmapTable'
import type { Dimension } from '@/types/common'

interface OnboardingHeatmapProps {
  data: OnboardingDashboardData | null
  activeDimension: Dimension
}

const OnboardingHeatmap: React.FC<OnboardingHeatmapProps> = ({ data, activeDimension }) => {
  const dimensionMap: Record<Dimension, string> = {
    bu: 'bu',
    loc: 'loc',
    ten: 'ten'
  }

  const { tableData, columnLabels } = useMemo(() => {
    if (!data) {
      return { tableData: [], columnLabels: [] }
    }

    const dimKey = dimensionMap[activeDimension]
    const dimensions = data.dimensions[dimKey] || []

    const columnLabels = dimensions.map((d) => d.value)

    const tableData = data.questions.map((question) => {
      const response = data.responses.find((r) => r.id === question.id)

      const cells = columnLabels.map((dimValue) => {
        if (!response) {
          return { label: dimValue, value: null, isYesNo: true }
        }

        const dimData = response.byDimension[dimValue]
        if (!dimData) {
          return { label: dimValue, value: null, isYesNo: true }
        }

        const total = dimData.yes + dimData.no
        const rate = total > 0 ? dimData.yes / total : 0

        return { label: dimValue, value: rate, isYesNo: true }
      })

      return {
        name: question.text,
        cells
      }
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
        title="Response Rate by Dimension"
      />
    </div>
  )
}

export default OnboardingHeatmap
