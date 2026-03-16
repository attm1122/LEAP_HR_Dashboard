import React, { useMemo } from 'react'
import { OnboardingDashboardData } from '@/domain/models/onboarding'
import DonutChart from '@/components/charts/DonutChart'
import VerticalBarChart from '@/components/charts/VerticalBarChart'
import type { Dimension } from '@/types/common'

interface OnboardingChartsProps {
  data: OnboardingDashboardData | null
  activeDimension: Dimension
}

const OnboardingCharts: React.FC<OnboardingChartsProps> = ({ data, activeDimension }) => {
  const dimensionMap: Record<Dimension, string> = {
    bu: 'bu',
    loc: 'loc',
    ten: 'ten'
  }

  const donutData = useMemo(() => {
    if (!data || data.responses.length === 0) return []

    let totalYes = 0
    let totalNo = 0

    data.responses.forEach((resp) => {
      totalYes += resp.all.yes
      totalNo += resp.all.no
    })

    return [
      { name: 'Yes', value: totalYes },
      { name: 'No', value: totalNo }
    ]
  }, [data])

  const dimensionChartData = useMemo(() => {
    if (!data || data.responses.length === 0) return []

    const dimKey = dimensionMap[activeDimension]
    const dimensions = data.dimensions[dimKey] || []

    return dimensions.map((dim) => {
      let dimYes = 0
      let dimNo = 0

      data.responses.forEach((resp) => {
        const dimData = resp.byDimension[dimKey]
        if (dimData && resp.byDimension[dim.value]) {
          dimYes += resp.byDimension[dim.value]?.yes || 0
          dimNo += resp.byDimension[dim.value]?.no || 0
        }
      })

      return {
        name: dim.value,
        'Yes': dimYes,
        'No': dimNo
      }
    })
  }, [data, activeDimension])

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-6 font-semibold text-text-primary">Overall Sentiment</h3>
        <DonutChart data={donutData} height={300} />
      </div>

      {dimensionChartData.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="mb-6 font-semibold text-text-primary">By {activeDimension.toUpperCase()}</h3>
          <VerticalBarChart data={dimensionChartData} dataKeys={['Yes', 'No']} height={300} />
        </div>
      )}
    </div>
  )
}

export default OnboardingCharts
