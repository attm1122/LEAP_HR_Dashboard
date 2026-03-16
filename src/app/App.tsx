import React from 'react'
import { useAppStore } from '@/store/useAppStore'
import AppShell from '@/components/layout/AppShell'
import UploadModal from '@/components/upload/UploadModal'
import ProbationDashboard from '@/features/probation/ProbationDashboard'
import OnboardingDashboard from '@/features/onboarding/OnboardingDashboard'
import OffboardingDashboard from '@/features/offboarding/OffboardingDashboard'
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary'

const App: React.FC = () => {
  const { activeModule } = useAppStore()

  return (
    <ErrorBoundary>
      <AppShell>
        {activeModule === 'probation' && <ProbationDashboard />}
        {activeModule === 'onboarding' && <OnboardingDashboard />}
        {activeModule === 'offboarding' && <OffboardingDashboard />}
        <UploadModal />
      </AppShell>
    </ErrorBoundary>
  )
}

export default App
