import React, { useMemo } from 'react'
import KPIGrid from '@/components/kpi/KPIGrid'
import { OffboardingResponse } from '@/domain/models/offboarding'
import { formatPercent } from '@/lib/formatting/numbers'

interface OffboardingKPIsProps {
  data: OffboardingResponse[] | null
}

const OffboardingKPIs: React.FC<OffboardingKPIsProps> = ({ data }) => {
  const kpis = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    const totalResponses = data.length
    const ratedResponses = data.filter((r) => r.ratingValue !== null)
    const avgRating =
      ratedResponses.length > 0
        ? ratedResponses.reduce((sum, r) => sum + (r.ratingValue || 0), 0) / ratedResponses.length
        : 0

    const nps = Math.round(
      ((data.filter((r) => (r.ratingValue || 0) >= 4).length / totalResponses) * 100 -
        (data.filter((r) => (r.ratingValue || 0) <= 2).length / totalResponses) * 100) /
        2
    )

    const withDriver = data.filter((r) => r.driver && r.driver.trim().length > 0).length

    return [
      {
        label: 'Total Offboardings',
        value: totalResponses,
        color: 'default' as const
      },
      {
        label: 'Average Rating',
        value: avgRating.toFixed(1),
        subtitle: 'out of 5',
        color: avgRating >= 4 ? ('success' as const) : avgRating >= 3 ? ('warning' as const) : ('danger' as const)
      },
      {
        label: 'Exit Drivers Documented',
        value: withDriver,
        subtitle: formatPercent(withDriver / totalResponses),
        color: withDriver === totalResponses ? ('success' as const) : ('warning' as const)
      },
      {
        label: 'NPS Score',
        value: nps,
        subtitle: 'Net Promoter Score',
        color: nps >= 50 ? ('success' as const) : nps >= 0 ? ('warning' as const) : ('danger' as const)
      }
    ]
  }, [data])

  return <KPIGrid items={kpis} columns={3} />
}

export default OffboardingKPIs
