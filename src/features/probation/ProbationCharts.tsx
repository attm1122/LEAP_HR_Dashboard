import React, { useMemo } from 'react'
import { ProbationEmployee } from '@/domain/models/probation'
import ScoreBarChart from '@/components/charts/ScoreBarChart'

interface ProbationChartsProps {
  data: ProbationEmployee[] | null
}

const ProbationCharts: React.FC<ProbationChartsProps> = ({ data }) => {
  const scoreDistribution = useMemo(() => {
    if (!data) return []

    const selfScores = data.filter((e) => e.selfAssess !== null).map((e) => e.selfAssess as number)
    const mgrScores = data.filter((e) => e.mgrAssess !== null).map((e) => e.mgrAssess as number)

    const bins = [
      '0-2',
      '2-4',
      '4-6',
      '6-8',
      '8-10'
    ]
    const selfCounts = [0, 0, 0, 0, 0]
    const mgrCounts = [0, 0, 0, 0, 0]

    selfScores.forEach((score) => {
      const binIdx = Math.min(Math.floor(score / 2), 4)
      selfCounts[binIdx]++
    })

    mgrScores.forEach((score) => {
      const binIdx = Math.min(Math.floor(score / 2), 4)
      mgrCounts[binIdx]++
    })

    return bins.map((bin, idx) => ({
      name: bin,
      'Self Assessments': selfCounts[idx],
      'Manager Assessments': mgrCounts[idx]
    }))
  }, [data])

  return (
    <div className="grid gap-8">
      <div className="rounded-lg border border-border bg-surface p-6">
        <h3 className="mb-6 font-semibold text-text-primary">Score Distribution</h3>
        <ScoreBarChart
          data={scoreDistribution}
          dataKey="Self Assessments"
          label="Assessment Count"
          height={300}
        />
      </div>
    </div>
  )
}

export default ProbationCharts
