import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import type { Dimension } from '@/types/common'

export function useOnboardingFilters(dimension: Dimension) {
  const { onboarding } = useAppStore()

  const dimensionMap: Record<Dimension, string> = {
    bu: 'bu',
    loc: 'loc',
    ten: 'ten'
  }

  const dimKey = dimensionMap[dimension]

  return useMemo(() => {
    if (!onboarding) return []
    return onboarding.dimensions[dimKey] || []
  }, [onboarding, dimKey])
}
