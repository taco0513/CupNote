'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { List, BarChart3 } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import OptimizedCoffeeList from '../../components/OptimizedCoffeeList'
import CoffeeAnalytics from '../../components/analytics/CoffeeAnalytics'
import PageLayout from '../../components/ui/PageLayout'
import Tabs from '../../components/ui/Tabs'
import UnifiedButton from '../../components/ui/UnifiedButton'

export default function MyRecordsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'list' | 'stats'>('list')

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'stats') {
      setActiveTab('stats')
    } else {
      setActiveTab('list')
    }
  }, [searchParams])

  const handleTabChange = (newTab: 'list' | 'stats') => {
    setActiveTab(newTab)
    const url = new URL(window.location.href)
    if (newTab === 'stats') {
      url.searchParams.set('tab', 'stats')
    } else {
      url.searchParams.delete('tab')
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }

  const tabs = [
    { id: 'list', name: '목록', icon: List },
    { id: 'stats', name: '분석', icon: BarChart3 },
  ]

  const tabContents = [
    {
      id: 'list',
      label: '목록',
      icon: <List className="h-4 w-4" />,
      content: (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-coffee-800">기록 목록</h2>
            <UnifiedButton
              variant="primary"
              size="medium"
              onClick={() => router.push('/mode-selection')}
              className="bg-coffee-500 hover:bg-coffee-600 shadow-md hover:shadow-lg transition-all duration-200"
            >
              새 기록 추가
            </UnifiedButton>
          </div>
          <OptimizedCoffeeList />
        </div>
      )
    },
    {
      id: 'stats',
      label: '분석',
      icon: <BarChart3 className="h-4 w-4" />,
      content: (
        <div>
          <h2 className="text-xl font-semibold text-coffee-800 mb-6">통계 분석</h2>
          <CoffeeAnalytics />
        </div>
      )
    }
  ]

  return (
    <ProtectedRoute>
      <Navigation showBackButton currentPage="my-records" />
      <PageLayout
        showHeader={false}
      >
        
        <Tabs
          tabs={tabContents}
          defaultTab={activeTab}
          variant="pills"
          className="mt-6"
        />
      </PageLayout>
    </ProtectedRoute>
  )
}