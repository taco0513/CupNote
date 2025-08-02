'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { List, BarChart3 } from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import OptimizedCoffeeList from '../../components/OptimizedCoffeeList'
import CoffeeAnalytics from '../../components/analytics/CoffeeAnalytics'

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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-6xl pb-20 md:pb-8">
          <Navigation showBackButton={false} currentPage="my-records" />

          {/* 헤더 */}
          <div className="mb-6 md:mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              내 기록
            </h1>
            <p className="text-base md:text-lg text-foreground-secondary mt-1">
              커피 기록을 확인하고 분석해보세요
            </p>
          </div>

          {/* 탭 네비게이션 */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-background-secondary rounded-lg p-1 max-w-md">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id as 'list' | 'stats')}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background'
                    }`}
                  >
                    <Icon className="h-4 w-4 mr-1.5" />
                    {tab.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 탭 컨텐츠 */}
          <div className="min-h-96">
            {activeTab === 'list' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">기록 목록</h2>
                  <a
                    href="/mode-selection"
                    className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                  >
                    새 기록 추가
                  </a>
                </div>
                <OptimizedCoffeeList />
              </div>
            )}

            {activeTab === 'stats' && (
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-6">통계 분석</h2>
                <CoffeeAnalytics />
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}