import React, { useMemo } from 'react'
import { OffboardingResponse } from '@/domain/models/offboarding'

interface OffboardingCardsProps {
  data: OffboardingResponse[] | null
}

const OffboardingCards: React.FC<OffboardingCardsProps> = ({ data }) => {
  const groupedData = useMemo(() => {
    if (!data) return { bu: new Set(), tenure: new Set(), driver: new Set() }

    const bu = new Set<string>()
    const tenure = new Set<string>()
    const driver = new Set<string>()

    data.forEach((resp) => {
      if (resp.bu) bu.add(resp.bu)
      if (resp.tenure) tenure.add(resp.tenure)
      if (resp.driver) driver.add(resp.driver)
    })

    return { bu, tenure, driver }
  }, [data])

  return (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text-primary">Business Units</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(groupedData.bu).map((unit) => (
            <span
              key={String(unit)}
              className="inline-block rounded-full bg-accent-red/10 px-3 py-1 text-sm text-accent-red"
            >
              {String(unit)}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text-primary">Tenure Groups</h3>
        <div className="flex flex-wrap gap-2">
          {Array.from(groupedData.tenure).map((ten) => (
            <span
              key={String(ten)}
              className="inline-block rounded-full bg-accent/10 px-3 py-1 text-sm text-accent"
            >
              {String(ten)}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-4 font-semibold text-text-primary">Top Exit Drivers</h3>
        <div className="space-y-2">
          {Array.from(groupedData.driver)
            .slice(0, 5)
            .map((d) => (
              <div key={String(d)} className="truncate text-sm text-text-secondary">
                • {String(d)}
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default OffboardingCards
