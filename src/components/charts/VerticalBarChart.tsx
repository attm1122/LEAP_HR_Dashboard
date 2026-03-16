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

interface VerticalBarChartProps {
  data: Array<{ name: string; [key: string]: string | number }>
  dataKeys: string[]
  colors?: string[]
  height?: number
}

const VerticalBarChart: React.FC<VerticalBarChartProps> = ({
  data,
  dataKeys,
  colors = ['#34C759', '#D92D20'],
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
        {dataKeys.map((key, idx) => (
          <Bar key={key} dataKey={key} fill={colors[idx % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}

export default VerticalBarChart
