import React from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface ScoreBarChartProps {
  data: Array<{ name: string; [key: string]: string | number }>
  dataKey: string
  label?: string
  height?: number
}

const ScoreBarChart: React.FC<ScoreBarChartProps> = ({
  data,
  dataKey,
  label = 'Score',
  height = 400
}) => {
  if (!data || data.length === 0) {
    return <div className="flex h-96 items-center justify-center text-text-muted">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: 'var(--color-surface)',
            border: `1px solid var(--color-border)`
          }}
        />
        <Legend />
        <Bar dataKey={dataKey} fill="#1e293b" name={label} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default ScoreBarChart
