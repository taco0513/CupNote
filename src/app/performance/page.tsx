import { Metadata } from 'next'

import PerformanceDashboard from '../../components/performance/PerformanceDashboard'

export const metadata: Metadata = {
  title: '성능 대시보드',
  description: 'CupNote 애플리케이션의 성능 지표와 Web Vitals를 확인하세요'
}

export default function PerformancePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl">
        <PerformanceDashboard />
      </div>
    </div>
  )
}