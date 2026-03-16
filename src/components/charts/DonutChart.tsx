import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

interface DonutChartProps {
  data: Array<{ name: string; value: number }>
  colors?: string[]
  height?: number
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  colors = ['#34C759', '#D92D20'],
  height = 300
}) => {
  if (!data || data.length === 0) {
    return <div className="flex h-80 items-center justify-center text-text-muted">No data</div>
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((_, idx) => (
            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

export default DonutChart
