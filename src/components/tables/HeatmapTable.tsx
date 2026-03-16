import React from 'react'
import { scoreColor } from '@/lib/colour/score'
import { formatPercent } from '@/lib/formatting/numbers'

interface HeatmapCell {
  label: string
  value: number | null
  isYesNo?: boolean
}

interface HeatmapRow {
  name: string
  cells: HeatmapCell[]
}

interface HeatmapTableProps {
  rows: HeatmapRow[]
  columnLabels: string[]
  title?: string
}

const HeatmapTable: React.FC<HeatmapTableProps> = ({ rows, columnLabels, title }) => {
  if (!rows || rows.length === 0) {
    return <div className="py-8 text-center text-text-muted">No data to display</div>
  }

  return (
    <div className="overflow-x-auto">
      {title && <h3 className="mb-4 font-semibold text-text-primary">{title}</h3>}
      <table className="w-full border-collapse bg-surface">
        <thead>
          <tr className="border-b-2 border-border">
            <th className="sticky left-0 min-w-[320px] bg-accent px-4 py-3 text-left font-bold text-white">
              Question
            </th>
            {columnLabels.map((label, idx) => (
              <th
                key={idx}
                className="border-l border-border bg-accent px-3 py-3 text-center font-bold text-white"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ridx) => (
            <tr
              key={ridx}
              className="border-b border-border hover:brightness-95"
              style={{ filter: 'brightness(1)' }}
            >
              <td className="sticky left-0 bg-surface px-4 py-3 font-medium text-text-primary">
                {row.name}
              </td>
              {row.cells.map((cell, cidx) => {
                const { bg, fg } = scoreColor(cell.value, cell.isYesNo)
                const displayValue = cell.value !== null ? formatPercent(cell.value) : '—'

                return (
                  <td
                    key={cidx}
                    className="heatmap-cell border-l border-border text-center"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    {displayValue}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default HeatmapTable
