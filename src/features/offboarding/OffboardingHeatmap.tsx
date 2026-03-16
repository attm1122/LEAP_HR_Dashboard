import React, { useMemo } from 'react'
import { OffboardingResponse } from '@/domain/models/offboarding'
import HeatmapTable from '@/components/tables/HeatmapTable'

interface OffboardingHeatmapProps {
  data: OffboardingResponse[] | null
}

const OffboardingHeatmap: React.FC<OffboardingHeatmapProps> = ({ data }) => {
  const { tableData, columnLabels } = useMemo(() => {
    if (!data || data.length === 0) {
      return { tableData: [], columnLabels: [] }
    }

    const allRatingKeys = new Set<string>()
    data.forEach((resp) => {
      Object.keys(resp.ratings).forEach((k) => allRatingKeys.add(k))
    })

    const columnLabels = Array.from(allRatingKeys).sort()

    const tableData = data.slice(0, 20).map((resp) => {
      const cells = columnLabels.map((label) => {
        const raw = resp.ratings[label]
        return {
          label,
          // Normalise to 0-1 for the colour scale (Likert is 1-5)
          value: raw !== undefined ? raw / 5 : null,
          // Display the raw integer score, not a percentage
          displayValue: raw !== undefined ? String(Math.round(raw)) : undefined,
          isYesNo: false as const
        }
      })

      return {
        name: `${resp.id}${resp.driver ? ` (${resp.driver})` : ''}`,
        cells
      }
    })

    return { tableData, columnLabels }
  }, [data])

  if (!data || tableData.length === 0) {
    return <div className="py-8 text-center text-text-muted">No rating data available</div>
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <HeatmapTable
        rows={tableData}
        columnLabels={columnLabels}
        title="Response Ratings (First 20 Respondents)"
      />
    </div>
  )
}

export default OffboardingHeatmap
