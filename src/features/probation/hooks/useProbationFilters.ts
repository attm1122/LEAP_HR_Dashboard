import { useMemo } from 'react'
import { useAppStore } from '@/store/useAppStore'
import { ProbationEmployee, assessmentIsComplete } from '@/domain/models/probation'

export function useProbationFilters(): ProbationEmployee[] {
  const { probation, probationFilters } = useAppStore()
  const { manager, selfStatus, mgrStatus, search } = probationFilters

  return useMemo(() => {
    if (!probation) return []

    return probation.filter((emp) => {
      if (manager && emp.manager !== manager) return false

      if (selfStatus === 'completed' && !assessmentIsComplete(emp.selfAssess, emp.selfDate))
        return false
      if (selfStatus === 'pending' && assessmentIsComplete(emp.selfAssess, emp.selfDate))
        return false

      if (mgrStatus === 'completed' && !assessmentIsComplete(emp.mgrAssess, emp.mgrDate))
        return false
      if (mgrStatus === 'pending' && assessmentIsComplete(emp.mgrAssess, emp.mgrDate))
        return false

      if (search) {
        const searchLower = search.toLowerCase()
        if (
          !emp.name.toLowerCase().includes(searchLower) &&
          !emp.id.toLowerCase().includes(searchLower)
        ) {
          return false
        }
      }

      return true
    })
  }, [probation, manager, selfStatus, mgrStatus, search])
}
