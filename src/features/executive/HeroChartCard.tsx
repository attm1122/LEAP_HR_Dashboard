import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { VisualPlan, ChartDataPoint } from '@/presentation/types'

interface HeroChartCardProps {
  visual: VisualPlan
  /** Additional Tailwind classes for the card wrapper */
  className?: string
}

// ── Donut chart ───────────────────────────────────────────────────────────────

const DonutChart: React.FC<{ data: ChartDataPoint[] }> = ({ data }) => {
  const total = data.reduce((s, d) => s + d.value, 0)

  const renderLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent,
  }: {
    cx: number; cy: number; midAngle: number
    innerRadius: number; outerRadius: number; percent: number
  }) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.55
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={12} fontWeight="600">
        {`${Math.round(percent * 100)}%`}
      </text>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? '#6366F1'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value} (${total > 0 ? Math.round((value / total) * 100) : 0}%)`,
            name,
          ]}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ── Horizontal bar chart ──────────────────────────────────────────────────────

const HorizontalBarChart: React.FC<{ data: ChartDataPoint[]; maxValue?: number }> = ({
  data,
  maxValue,
}) => {
  const domain = maxValue ? [0, maxValue] : undefined

  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 36 + 40)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 40, left: 8, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
        <XAxis
          type="number"
          domain={domain}
          tickFormatter={(v) => String(v)}
          tick={{ fontSize: 11, fill: '#6B7280' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fontSize: 11, fill: '#374151' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          formatter={(value: number) => [value, '']}
          labelFormatter={(label: string) => {
            const item = data.find((d) => d.label === label)
            return item?.rawLabel ?? label
          }}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={24}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color ?? '#3B82F6'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

const HeroChartCard: React.FC<HeroChartCardProps> = ({ visual, className = '' }) => {
  const isEmpty = visual.data.length === 0

  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm ${className}`}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">{visual.title}</h3>
        {visual.subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{visual.subtitle}</p>
        )}
      </div>

      {/* Chart body */}
      {isEmpty ? (
        <div className="flex items-center justify-center h-40 rounded-lg bg-gray-50 border border-dashed border-gray-200">
          <p className="text-sm text-gray-400">{visual.emptyMessage ?? 'No data available'}</p>
        </div>
      ) : (
        <>
          {visual.chartType === 'donut' && <DonutChart data={visual.data} />}
          {(visual.chartType === 'horizontal-bar' || visual.chartType === 'bar') && (
            <HorizontalBarChart
              data={visual.data}
              maxValue={visual.chartType === 'horizontal-bar' ? undefined : undefined}
            />
          )}
          {visual.chartType === 'score-bar' && (
            <HorizontalBarChart data={visual.data} maxValue={5} />
          )}
        </>
      )}
    </div>
  )
}

export default HeroChartCard
