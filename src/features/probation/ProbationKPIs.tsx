import React, { useMemo } from 'react'
import KPIGrid from '@/components/kpi/KPIGrid'
import { ProbationEmployee, assessmentIsComplete } from '@/domain/models/probation'
import { formatPercent } from '@/lib/formatting/numbers'

interface ProbationKPIsProps {
  data: ProbationEmployee[] | null
}

const ProbationKPIs: React.FC<ProbationKPIsProps> = ({ data }) => {
  const kpis = useMemo(() => {
    if (!data || data.length === 0) {
      return []
    }

    const totalEmployees = data.length
    const selfCompleted = data.filter((e) => assessmentIsComplete(e.selfAssess, e.selfDate)).length
    const mgrCompleted = data.filter((e) => assessmentIsComplete(e.mgrAssess, e.mgrDate)).length

    const selfAssessments = data
      .filter((e) => e.selfAssess !== null)
      .map((e) => e.selfAssess as number)
    const avgSelfAssess =
      selfAssessments.length > 0
        ? selfAssessments.reduce((a, b) => a + b, 0) / selfAssessments.length
        : 0

    const mgrAssessments = data
      .filter((e) => e.mgrAssess !== null)
      .map((e) => e.mgrAssess as number)
    const avgMgrAssess =
      mgrAssessments.length > 0
        ? mgrAssessments.reduce((a, b) => a + b, 0) / mgrAssessments.length
        : 0

    return [
      {
        label: 'Total Employees',
        value: totalEmployees,
        color: 'default' as const
      },
      {
        label: 'Self Assessments Complete',
        value: `${selfCompleted}/${totalEmployees}`,
        subtitle: formatPercent(selfCompleted / totalEmployees),
        color: selfCompleted === totalEmployees ? ('success' as const) : ('warning' as const)
      },
      {
        label: 'Manager Assessments Complete',
        value: `${mgrCompleted}/${totalEmployees}`,
        subtitle: formatPercent(mgrCompleted / totalEmployees),
        color: mgrCompleted === totalEmployees ? ('success' as const) : ('warning' as const)
      },
      {
        label: 'Avg Self Assessment Score',
        value: avgSelfAssess.toFixed(1),
        subtitle: 'out of 10',
        color: avgSelfAssess >= 7 ? ('success' as const) : avgSelfAssess >= 5 ? ('warning' as const) : ('danger' as const)
      },
      {
        label: 'Avg Manager Assessment Score',
        value: avgMgrAssess.toFixed(1),
        subtitle: 'out of 10',
        color: avgMgrAssess >= 7 ? ('success' as const) : avgMgrAssess >= 5 ? ('warning' as const) : ('danger' as const)
      }
    ]
  }, [data])

  return <KPIGrid items={kpis} columns={3} />
}

export default ProbationKPIs
