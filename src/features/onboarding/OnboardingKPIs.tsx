import React, { useMemo } from 'react'
import KPIGrid from '@/components/kpi/KPIGrid'
import { OnboardingDashboardData } from '@/domain/models/onboarding'
import { formatPercent } from '@/lib/formatting/numbers'

interface OnboardingKPIsProps {
  data: OnboardingDashboardData | null
}

const OnboardingKPIs: React.FC<OnboardingKPIsProps> = ({ data }) => {
  const kpis = useMemo(() => {
    if (!data || data.responses.length === 0) {
      return []
    }

    const totalResponses = data.responses.length
    const totalQuestions = data.questions.length

    let totalYes = 0
    let totalNo = 0

    data.responses.forEach((resp) => {
      totalYes += resp.all.yes
      totalNo += resp.all.no
    })

    const totalAnswers = totalYes + totalNo
    const yesRate = totalAnswers > 0 ? totalYes / totalAnswers : 0

    return [
      {
        label: 'Total Respondents',
        value: totalResponses,
        color: 'default' as const
      },
      {
        label: 'Questions Surveyed',
        value: totalQuestions,
        color: 'default' as const
      },
      {
        label: 'Total Responses',
        value: totalAnswers,
        subtitle: `Avg ${(totalAnswers / totalQuestions).toFixed(0)} per question`,
        color: 'default' as const
      },
      {
        label: 'Satisfaction Rate',
        value: formatPercent(yesRate),
        subtitle: `${totalYes} Yes, ${totalNo} No`,
        color: yesRate >= 0.7 ? ('success' as const) : yesRate >= 0.5 ? ('warning' as const) : ('danger' as const)
      }
    ]
  }, [data])

  return <KPIGrid items={kpis} columns={3} />
}

export default OnboardingKPIs
