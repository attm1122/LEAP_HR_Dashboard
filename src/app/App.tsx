import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import AppShell from '@/components/layout/AppShell'
import UploadModal from '@/components/upload/UploadModal'
import ProbationDashboard from '@/features/probation/ProbationDashboard'
import OnboardingDashboard from '@/features/onboarding/OnboardingDashboard'
import OffboardingDashboard from '@/features/offboarding/OffboardingDashboard'

const App: React.FC = () => {
  const { activeModule } = useAppStore()

  return (
    <AppShell>
      {activeModule === 'probation' && <ProbationDashboard />}
      {activeModule === 'onboarding' && <OnboardingDashboard />}
      {activeModule === 'offboarding' && <OffboardingDashboard />}
      <UploadModal />
    </AppShell>
  )
}

export default App
