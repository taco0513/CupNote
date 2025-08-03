import { Metadata } from 'next'

import Navigation from '../../components/Navigation'
import PerformanceDashboard from '../../components/performance/PerformanceDashboard'
import PageLayout from '../../components/ui/PageLayout'

export const metadata: Metadata = {
  title: '성능 대시보드 - Real User Monitoring',
  description: 'CupNote 애플리케이션의 실시간 성능 지표, Web Vitals, 사용자 경험 분석을 확인하세요'
}

export default function PerformancePage() {
  return (
    <>
      <Navigation showBackButton currentPage="settings" />
      <PageLayout showHeader={false}>
        <PerformanceDashboard 
          enableRealTimeMonitoring={true}
          showAdvancedMetrics={true}
          showUserInteractions={true}
        />
      </PageLayout>
    </>
  )
}