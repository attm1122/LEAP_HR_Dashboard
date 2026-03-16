import React from 'react'
import { obRatingColor, scoreColor } from '@/lib/colour/score'
import { formatPercent } from '@/lib/formatting/numbers'

export interface HeatmapCell {
  label: string
  /** Normalised value in the range 0-1 used to drive the colour scale. */
  value: number | null
  /**
   * Optional override for what is displayed in the cell.
   * If omitted, falls back to formatPercent(value).
   */
  displayValue?: string
  /** When true, the cell is coloured as a yes/no rate (green if > 50%, grey otherwise). */
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
            <th className="sticky left-0 min-w-[280px] bg-accent px-4 py-3 text-left font-bold text-white">
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
            <tr key={ridx} className="border-b border-border hover:brightness-95">
              <td className="sticky left-0 bg-surface px-4 py-3 font-medium text-text-primary">
                {row.name}
              </td>
              {row.cells.map((cell, cidx) => {
                // Pick the right colour function based on value range and mode
                let bg: string
                let fg: string

                if (cell.value === null) {
                  bg = '#f3f4f6'
                  fg = '#9ca3af'
                } else if (cell.isYesNo) {
                  // Yes/No rate: value is already 0-1
                  ;({ bg, fg } = scoreColor(cell.value, true))
                } else {
                  // Numeric score: value is normalised 0-1 — use the 0-1 colour scale
                  ;({ bg, fg } = obRatingColor(cell.value))
                }

                const displayText =
                  cell.displayValue !== undefined
                    ? cell.displayValue
                    : cell.value !== null
                    ? formatPercent(cell.value)
                    : '—'

                return (
                  <td
                    key={cidx}
                    className="heatmap-cell border-l border-border px-3 py-3 text-center text-sm font-semibold"
                    style={{ backgroundColor: bg, color: fg }}
                  >
                    {displayText}
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
