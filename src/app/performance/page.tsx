import { Metadata } from 'next'

import PerformanceDashboard from '../../components/performance/PerformanceDashboard'
import Navigation from '../../components/Navigation'
import PageLayout from '../../components/ui/PageLayout'

export const metadata: Metadata = {
  title: '성능 대시보드',
  description: 'CupNote 애플리케이션의 성능 지표와 Web Vitals를 확인하세요'
}

export default function PerformancePage() {
  return (
    <>
      <Navigation showBackButton currentPage="settings" />
      <PageLayout showHeader={false}>
        <PerformanceDashboard />
      </PageLayout>
    </>
  )
}