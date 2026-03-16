import React from 'react'
import HeroChartCard from './HeroChartCard'
import type { VisualPlan } from '@/presentation/types'

interface SupportingChartGridProps {
  visuals: VisualPlan[]
}

/**
 * Renders the supporting (non-hero) chart cards in a responsive grid.
 * 1 supporting chart → full width
 * 2+ → 2-column grid
 */
const SupportingChartGrid: React.FC<SupportingChartGridProps> = ({ visuals }) => {
  const supporting = visuals.filter((v) => v.priority === 'supporting')

  if (supporting.length === 0) return null

  return (
    <div
      className={`grid gap-4 ${
        supporting.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
      }`}
    >
      {supporting.map((visual) => (
        <HeroChartCard key={visual.id} visual={visual} />
      ))}
    </div>
  )
}

export default SupportingChartGrid
