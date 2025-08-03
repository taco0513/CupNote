/**
 * 데이터 관리 메인 페이지
 * 카페, 로스터리, 커피 원두 데이터 관리 허브
 */
'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { 
  Coffee, 
  MapPin, 
  Building2, 
  Database,
  TrendingUp,
  Upload,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Plus
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { supabase } from '../../../lib/supabase'
import { logger } from '../../../lib/logger'

interface DataStats {
  cafes: {
    total: number
    verified: number
    pending: number
  }
  roasters: {
    total: number
    featured: number
    active: number
  }
  coffees: {
    total: number
    available: number
    popular: number
  }
}

interface DataQualityMetric {
  category: string
  completeness: number
  accuracy: number
  issues: number
  lastUpdated: string
}

export default function DataManagementPage() {
  const [stats, setStats] = useState<DataStats>({
    cafes: { total: 0, verified: 0, pending: 0 },
    roasters: { total: 0, featured: 0, active: 0 },
    coffees: { total: 0, available: 0, popular: 0 }
  })
  
  const [qualityMetrics, setQualityMetrics] = useState<DataQualityMetric[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // 데이터 통계 로드
  const loadDataStats = async () => {
    try {
      setIsLoading(true)
      
      // 실제 구현에서는 각각의 테이블에서 데이터를 가져옴
      // 현재는 임시 데이터로 시뮬레이션
      
      setStats({
        cafes: {
          total: 245,
          verified: 189,
          pending: 12
        },
        roasters: {
          total: 89,
          featured: 23,
          active: 76
        },
        coffees: {
          total: 1456,
          available: 1203,
          popular: 89
        }
      })
      
      // 데이터 품질 메트릭 생성
      setQualityMetrics([
        {
          category: 'Cafes',
          completeness: 87,
          accuracy: 94,
          issues: 8,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Roasters',
          completeness: 92,
          accuracy: 96,
          issues: 3,
          lastUpdated: new Date().toISOString()
        },
        {
          category: 'Coffees',
          completeness: 78,
          accuracy: 89,
          issues: 23,
          lastUpdated: new Date().toISOString()
        }
      ])
      
      setLastUpdated(new Date())
      logger.info('Data management stats loaded')
      
    } catch (error) {
      logger.error('Failed to load data stats', { error })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadDataStats()
  }, [])

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 75) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  const getQualityIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4" />
    return <AlertTriangle className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">데이터 관리 로딩 중...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-coffee-200 rounded mb-2"></div>
                <div className="h-8 bg-coffee-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-800">데이터 관리</h1>
          <p className="text-coffee-600 mt-1">
            카페, 로스터리, 커피 원두 기초 데이터를 관리합니다
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-coffee-500">
            마지막 업데이트: {lastUpdated.toLocaleTimeString()}
          </div>
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={loadDataStats}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
        </div>
      </div>

      {/* 데이터 통계 개요 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 카페 데이터 */}
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <Link
                href="/admin/data/cafes"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                관리하기 →
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">카페 데이터</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">총 카페</span>
                  <span className="font-medium">{stats.cafes.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">검증됨</span>
                  <span className="font-medium text-green-600">{stats.cafes.verified}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">승인 대기</span>
                  <span className="font-medium text-yellow-600">{stats.cafes.pending}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 로스터리 데이터 */}
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-coffee-500 to-coffee-600 rounded-xl flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <Link
                href="/admin/data/roasters"
                className="text-coffee-600 hover:text-coffee-800 text-sm font-medium"
              >
                관리하기 →
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">로스터리 데이터</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">총 로스터리</span>
                  <span className="font-medium">{stats.roasters.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">피처드</span>
                  <span className="font-medium text-purple-600">{stats.roasters.featured}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">활성</span>
                  <span className="font-medium text-green-600">{stats.roasters.active}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 커피 원두 데이터 */}
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Coffee className="h-6 w-6 text-white" />
              </div>
              <Link
                href="/admin/data/coffees"
                className="text-amber-600 hover:text-amber-800 text-sm font-medium"
              >
                관리하기 →
              </Link>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">커피 원두 데이터</h3>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">총 원두</span>
                  <span className="font-medium">{stats.coffees.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">판매 중</span>
                  <span className="font-medium text-green-600">{stats.coffees.available}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-coffee-600">인기 원두</span>
                  <span className="font-medium text-orange-600">{stats.coffees.popular}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 데이터 품질 모니터링 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-coffee-600" />
            <span>데이터 품질 모니터링</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="p-4 bg-coffee-50/50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-coffee-800">{metric.category}</h3>
                  <div className="text-xs text-coffee-500">
                    업데이트: {new Date(metric.lastUpdated).toLocaleString()}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`p-2 rounded-lg ${getQualityColor(metric.completeness)} flex items-center justify-center space-x-1`}>
                      {getQualityIcon(metric.completeness)}
                      <span className="font-medium">{metric.completeness}%</span>
                    </div>
                    <div className="text-xs text-coffee-600 mt-1">완성도</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`p-2 rounded-lg ${getQualityColor(metric.accuracy)} flex items-center justify-center space-x-1`}>
                      {getQualityIcon(metric.accuracy)}
                      <span className="font-medium">{metric.accuracy}%</span>
                    </div>
                    <div className="text-xs text-coffee-600 mt-1">정확도</div>
                  </div>
                  
                  <div className="text-center">
                    <div className={`p-2 rounded-lg ${metric.issues > 10 ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'} flex items-center justify-center space-x-1`}>
                      {metric.issues > 10 ? <AlertTriangle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                      <span className="font-medium">{metric.issues}</span>
                    </div>
                    <div className="text-xs text-coffee-600 mt-1">이슈</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 빠른 작업 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-coffee-600" />
            <span>빠른 작업</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <UnifiedButton
              variant="outline"
              className="h-20 flex-col border-coffee-200 hover:bg-coffee-50"
              onClick={() => window.location.href = '/admin/data/cafes'}
            >
              <Plus className="h-5 w-5 mb-2 text-coffee-600" />
              <span className="text-sm">카페 추가</span>
            </UnifiedButton>
            
            <UnifiedButton
              variant="outline"
              className="h-20 flex-col border-coffee-200 hover:bg-coffee-50"
              onClick={() => window.location.href = '/admin/data/roasters'}
            >
              <Plus className="h-5 w-5 mb-2 text-coffee-600" />
              <span className="text-sm">로스터리 추가</span>
            </UnifiedButton>
            
            <UnifiedButton
              variant="outline"
              className="h-20 flex-col border-coffee-200 hover:bg-coffee-50"
              onClick={() => console.log('데이터 가져오기')}
            >
              <Upload className="h-5 w-5 mb-2 text-coffee-600" />
              <span className="text-sm">데이터 가져오기</span>
            </UnifiedButton>
            
            <UnifiedButton
              variant="outline"
              className="h-20 flex-col border-coffee-200 hover:bg-coffee-50"
              onClick={() => console.log('데이터 내보내기')}
            >
              <Download className="h-5 w-5 mb-2 text-coffee-600" />
              <span className="text-sm">데이터 내보내기</span>
            </UnifiedButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}