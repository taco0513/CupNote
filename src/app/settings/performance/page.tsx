'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import { ChevronLeft, Zap, Database, Activity, Trash2 } from 'lucide-react'

import Navigation from '../../../components/Navigation'
import { getPerformanceReport } from '../../../hooks/usePerformanceMonitor'
import { CacheService } from '../../../lib/cache-service'

export default function PerformanceSettingsPage() {
  const router = useRouter()
  const [cacheStats, setCacheStats] = useState<any>(null)
  const [performanceReport, setPerformanceReport] = useState<any>(null)
  const [clearing, setClearing] = useState(false)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = () => {
    setCacheStats(CacheService.getStats())
    setPerformanceReport(getPerformanceReport())
  }

  const handleClearCache = async () => {
    setClearing(true)
    try {
      CacheService.clear()
      // Clear performance metrics
      sessionStorage.removeItem('cupnote_performance_metrics')
      loadStats()
      alert('캐시가 성공적으로 삭제되었습니다.')
    } catch (error) {
      console.error('Cache clear error:', error)
      alert('캐시 삭제 중 오류가 발생했습니다.')
    } finally {
      setClearing(false)
    }
  }

  return (
    <main className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
      <Navigation currentPage="settings" />

      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-coffee-800 flex items-center">
            <Zap className="h-6 w-6 mr-2 text-yellow-500" />
            성능 설정
          </h1>
        </div>

        {/* 캐시 통계 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-coffee-700 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            캐시 상태
          </h2>
          
          {cacheStats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">메모리 캐시</p>
                  <p className="text-2xl font-bold text-coffee-600">
                    {cacheStats.memoryEntries}개
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">로컬 저장소 캐시</p>
                  <p className="text-2xl font-bold text-coffee-600">
                    {cacheStats.storageEntries}개
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">캐시 크기</p>
                  <p className="text-2xl font-bold text-coffee-600">
                    {cacheStats.storageSizeKB} KB
                  </p>
                </div>
              </div>

              <button
                onClick={handleClearCache}
                disabled={clearing}
                className="mt-4 flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {clearing ? '삭제 중...' : '캐시 삭제'}
              </button>
            </div>
          )}
        </section>

        {/* 성능 리포트 */}
        <section>
          <h2 className="text-xl font-semibold text-coffee-700 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            컴포넌트 성능
          </h2>

          {performanceReport && Object.keys(performanceReport).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(performanceReport).map(([component, metrics]: [string, any]) => (
                <div key={component} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-medium text-coffee-800 mb-2">{component}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="text-gray-600">렌더 횟수:</span>
                      <span className="ml-1 font-medium">{metrics.count}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">평균:</span>
                      <span className={`ml-1 font-medium ${
                        metrics.average > 16 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {metrics.average.toFixed(2)}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">최대:</span>
                      <span className={`ml-1 font-medium ${
                        metrics.max > 50 ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {metrics.max.toFixed(2)}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">P95:</span>
                      <span className={`ml-1 font-medium ${
                        metrics.p95 > 30 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {metrics.p95.toFixed(2)}ms
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600">아직 수집된 성능 데이터가 없습니다.</p>
              <p className="text-sm text-gray-500 mt-2">
                앱을 사용하면서 성능 데이터가 자동으로 수집됩니다.
              </p>
            </div>
          )}
        </section>

        {/* 성능 팁 */}
        <section className="mt-8 bg-coffee-50 rounded-lg p-4">
          <h3 className="font-semibold text-coffee-800 mb-2">💡 성능 최적화 팁</h3>
          <ul className="space-y-2 text-sm text-coffee-700">
            <li>• 캐시를 정기적으로 삭제하면 앱 성능이 향상될 수 있습니다.</li>
            <li>• 이미지가 많은 기록은 로딩 시간이 길어질 수 있습니다.</li>
            <li>• 느린 네트워크 환경에서는 오프라인 모드를 활용해보세요.</li>
            <li>• 16ms 이하의 렌더링 시간이 최적의 성능입니다.</li>
          </ul>
        </section>
      </div>
    </main>
  )
}