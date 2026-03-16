import React, { useMemo } from 'react'
import { OffboardingResponse } from '@/domain/models/offboarding'
import VerticalBarChart from '@/components/charts/VerticalBarChart'
import ScoreBarChart from '@/components/charts/ScoreBarChart'

interface OffboardingChartsProps {
  data: OffboardingResponse[] | null
}

const OffboardingCharts: React.FC<OffboardingChartsProps> = ({ data }) => {
  const ratingDistribution = useMemo(() => {
    if (!data) return []

    const bins = ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars']
    const counts = [0, 0, 0, 0, 0]

    data.forEach((resp) => {
      if (resp.ratingValue !== null && resp.ratingValue >= 1 && resp.ratingValue <= 5) {
        counts[Math.floor(resp.ratingValue) - 1]++
      }
    })

    return bins.map((bin, idx) => ({
      name: bin,
      count: counts[idx]
    }))
  }, [data])

  const driverFrequency = useMemo(() => {
    if (!data) return []

    const drivers: Record<string, number> = {}
    data.forEach((resp) => {
      if (resp.driver && resp.driver.trim()) {
        drivers[resp.driver] = (drivers[resp.driver] || 0) + 1
      }
    })

    return Object.entries(drivers)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([driver, count]) => ({
        name: driver,
        Frequency: count
      }))
  }, [data])

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-6 font-semibold text-text-primary">Rating Distribution</h3>
        <ScoreBarChart data={ratingDistribution} dataKey="count" label="Responses" height={300} />
      </div>

      {driverFrequency.length > 0 && (
        <div className="rounded-lg border border-border bg-surface p-6">
          <h3 className="mb-6 font-semibold text-text-primary">Top Exit Drivers</h3>
          <VerticalBarChart
            data={driverFrequency}
            dataKeys={['Frequency']}
            colors={['#D92D20']}
            height={300}
          />
        </div>
      )}
    </div>
  )
}

export default OffboardingCharts
