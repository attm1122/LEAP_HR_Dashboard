import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { OffboardingResponse } from '@/domain/models/offboarding'

export function useOffboardingFilters(): OffboardingResponse[] {
  const { offboarding, offboardingFilters } = useAppStore()
  const { bu, tenure, driver } = offboardingFilters

  return useMemo(() => {
    if (!offboarding) return []

    return offboarding.filter((resp) => {
      if (bu && resp.bu !== bu) return false
      if (tenure && resp.tenure !== tenure) return false
      if (driver && resp.driver !== driver) return false
      return true
    })
  }, [offboarding, bu, tenure, driver])
}
