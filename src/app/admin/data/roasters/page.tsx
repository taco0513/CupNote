/**
 * 로스터리 데이터 관리 페이지
 * 로스터리 정보 조회, 추가, 수정, 삭제 관리
 */
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye,
  Star,
  Globe,
  MapPin,
  ChevronLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Award,
  Calendar
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card'
import UnifiedButton from '../../../../components/ui/UnifiedButton'
import { supabase } from '../../../../lib/supabase'
import { logger } from '../../../../lib/logger'

interface Roaster {
  id: string
  name: string
  location: string
  website?: string
  description?: string
  rating: number
  coffee_count: number
  image_url?: string
  status: 'active' | 'pending' | 'inactive'
  featured: boolean
  founded_year?: number
  specialties: string[]
  created_at: string
  updated_at: string
}

interface RoasterStats {
  total: number
  active: number
  pending: number
  featured: number
  avgRating: number
}

export default function RoasterManagementPage() {
  const [roasters, setRoasters] = useState<Roaster[]>([])
  const [stats, setStats] = useState<RoasterStats>({
    total: 0,
    active: 0,
    pending: 0,
    featured: 0,
    avgRating: 0
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [featuredFilter, setFeaturedFilter] = useState<string>('all')
  const [selectedRoaster, setSelectedRoaster] = useState<Roaster | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // 로스터리 데이터 로드
  const loadRoasters = async () => {
    try {
      setIsLoading(true)
      
      // 실제 구현에서는 roasters 테이블에서 데이터를 가져옴
      // 현재는 임시 데이터로 시뮬레이션
      const mockRoasters: Roaster[] = [
        {
          id: '1',
          name: '블루보틀 커피',
          location: '캘리포니아, 오클랜드',
          website: 'https://bluebottlecoffee.com',
          description: '스페셜티 커피의 새로운 표준을 제시하는 로스터리',
          rating: 4.6,
          coffee_count: 45,
          image_url: '/images/roasters/bluebottle.jpg',
          status: 'active',
          featured: true,
          founded_year: 2002,
          specialties: ['Single Origin', 'Espresso Blend', 'Filter Coffee'],
          created_at: '2024-01-10T09:00:00Z',
          updated_at: '2024-12-01T15:30:00Z'
        },
        {
          id: '2',
          name: '테라로사',
          location: '강릉, 대한민국',
          website: 'https://terarosa.com',
          description: '한국 최초의 스페셜티 커피 로스터리',
          rating: 4.5,
          coffee_count: 38,
          status: 'active',
          featured: true,
          founded_year: 1999,
          specialties: ['Single Origin', 'Direct Trade', 'Local Sourcing'],
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-11-30T14:20:00Z'
        },
        {
          id: '3',
          name: '로컬 로스터리',
          location: '서울, 대한민국',
          description: '동네에서 직접 볶는 소규모 로스터리',
          rating: 4.2,
          coffee_count: 12,
          status: 'pending',
          featured: false,
          founded_year: 2023,
          specialties: ['Single Origin', 'Local Roasting'],
          created_at: '2024-12-01T14:00:00Z',
          updated_at: '2024-12-01T14:00:00Z'
        },
        {
          id: '4',
          name: '카운터컬처 커피',
          location: '노스캐롤라이나, 더럼',
          website: 'https://counterculturecoffee.com',
          description: '지속가능한 커피 문화를 추구하는 로스터리',
          rating: 4.7,
          coffee_count: 52,
          status: 'active',
          featured: false,
          founded_year: 1995,
          specialties: ['Direct Trade', 'Sustainability', 'Education'],
          created_at: '2024-02-01T11:00:00Z',
          updated_at: '2024-11-25T16:45:00Z'
        }
      ]
      
      setRoasters(mockRoasters)
      
      // 통계 계산
      const stats = {
        total: mockRoasters.length,
        active: mockRoasters.filter(r => r.status === 'active').length,
        pending: mockRoasters.filter(r => r.status === 'pending').length,
        featured: mockRoasters.filter(r => r.featured).length,
        avgRating: Math.round((mockRoasters.reduce((sum, r) => sum + r.rating, 0) / mockRoasters.length) * 10) / 10
      }
      
      setStats(stats)
      logger.info('Roaster data loaded', { count: mockRoasters.length })
      
    } catch (error) {
      logger.error('Failed to load roaster data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRoasters()
  }, [])

  // 필터링된 로스터리 목록
  const filteredRoasters = roasters.filter(roaster => {
    const matchesSearch = roaster.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         roaster.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || roaster.status === statusFilter
    const matchesFeatured = featuredFilter === 'all' || 
                           (featuredFilter === 'featured' && roaster.featured) ||
                           (featuredFilter === 'not_featured' && !roaster.featured)
    return matchesSearch && matchesStatus && matchesFeatured
  })

  const getStatusColor = (status: Roaster['status']) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-50'
      case 'pending': return 'text-yellow-600 bg-yellow-50'
      case 'inactive': return 'text-gray-600 bg-gray-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusIcon = (status: Roaster['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'pending': return <AlertTriangle className="h-4 w-4" />
      case 'inactive': return <XCircle className="h-4 w-4" />
    }
  }

  const handleRoasterAction = (action: string, roaster: Roaster) => {
    setSelectedRoaster(roaster)
    switch (action) {
      case 'edit':
        setShowEditModal(true)
        break
      case 'delete':
        setShowDeleteModal(true)
        break
      case 'view':
        // 로스터리 상세 보기 (별도 모달 또는 페이지)
        break
      case 'toggle_featured':
        // 피처드 상태 토글
        console.log('Toggle featured:', roaster.id)
        break
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/admin/data" className="text-coffee-600 hover:text-coffee-800">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-coffee-800">로스터리 데이터 로딩 중...</h1>
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
        <div className="flex items-center space-x-4">
          <Link href="/admin/data" className="text-coffee-600 hover:text-coffee-800">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-coffee-800">로스터리 데이터 관리</h1>
            <p className="text-coffee-600 mt-1">
              등록된 로스터리 정보를 관리하고 새로운 로스터리를 추가합니다
            </p>
          </div>
        </div>
        <UnifiedButton
          variant="primary"
          onClick={() => console.log('새 로스터리 추가')}
          className="bg-coffee-600 hover:bg-coffee-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          로스터리 추가
        </UnifiedButton>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-coffee-800">{stats.total}</div>
            <div className="text-sm text-coffee-600">총 로스터리</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-coffee-600">활성</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-coffee-600">승인 대기</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.featured}</div>
            <div className="text-sm text-coffee-600">피처드</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.avgRating}</div>
            <div className="text-sm text-coffee-600">평균 평점</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-coffee-400 h-4 w-4" />
              <input
                type="text"
                placeholder="로스터리명 또는 지역으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-coffee-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="all">모든 상태</option>
                <option value="active">활성</option>
                <option value="pending">승인 대기</option>
                <option value="inactive">비활성</option>
              </select>
              
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value)}
                className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="featured">피처드</option>
                <option value="not_featured">일반</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로스터리 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRoasters.map(roaster => (
          <Card key={roaster.id} className="bg-white/90 backdrop-blur-sm border border-coffee-200/50 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-coffee-800">{roaster.name}</h3>
                    {roaster.featured && (
                      <Award className="h-4 w-4 text-purple-600" title="피처드 로스터리" />
                    )}
                  </div>
                  <div className="flex items-center text-sm text-coffee-600 mb-2">
                    <MapPin className="h-3 w-3 mr-1" />
                    <span className="truncate">{roaster.location}</span>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(roaster.status)} flex items-center space-x-1`}>
                  {getStatusIcon(roaster.status)}
                  <span>{roaster.status}</span>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {roaster.website && (
                  <div className="flex items-center text-coffee-600">
                    <Globe className="h-3 w-3 mr-2" />
                    <span className="truncate">{roaster.website}</span>
                  </div>
                )}
                
                {roaster.founded_year && (
                  <div className="flex items-center text-coffee-600">
                    <Calendar className="h-3 w-3 mr-2" />
                    <span>설립 {roaster.founded_year}년</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="font-medium">{roaster.rating}</span>
                    <span className="text-coffee-500">({roaster.coffee_count} 원두)</span>
                  </div>
                </div>

                {roaster.specialties.length > 0 && (
                  <div className="pt-2">
                    <div className="text-xs text-coffee-500 mb-1">전문 분야</div>
                    <div className="flex flex-wrap gap-1">
                      {roaster.specialties.slice(0, 3).map((specialty, index) => (
                        <span key={index} className="px-2 py-1 bg-coffee-100 text-coffee-700 text-xs rounded">
                          {specialty}
                        </span>
                      ))}
                      {roaster.specialties.length > 3 && (
                        <span className="px-2 py-1 bg-coffee-100 text-coffee-500 text-xs rounded">
                          +{roaster.specialties.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-coffee-100">
                <div className="text-xs text-coffee-500">
                  {new Date(roaster.created_at).toLocaleDateString()}
                </div>
                
                <div className="flex items-center space-x-2">
                  <UnifiedButton
                    variant="ghost"
                    size="small"
                    onClick={() => handleRoasterAction('view', roaster)}
                    className="text-coffee-600 hover:bg-coffee-50"
                  >
                    <Eye className="h-3 w-3" />
                  </UnifiedButton>
                  
                  <UnifiedButton
                    variant="ghost"
                    size="small"
                    onClick={() => handleRoasterAction('toggle_featured', roaster)}
                    className={`${roaster.featured ? 'text-purple-600 hover:bg-purple-50' : 'text-gray-600 hover:bg-gray-50'}`}
                    title={roaster.featured ? '피처드 해제' : '피처드 설정'}
                  >
                    <Award className="h-3 w-3" />
                  </UnifiedButton>
                  
                  <UnifiedButton
                    variant="ghost"
                    size="small"
                    onClick={() => handleRoasterAction('edit', roaster)}
                    className="text-blue-600 hover:bg-blue-50"
                  >
                    <Edit3 className="h-3 w-3" />
                  </UnifiedButton>
                  
                  <UnifiedButton
                    variant="ghost"
                    size="small"
                    onClick={() => handleRoasterAction('delete', roaster)}
                    className="text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </UnifiedButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRoasters.length === 0 && !isLoading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building2 className="h-12 w-12 text-coffee-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-coffee-600 mb-2">로스터리를 찾을 수 없습니다</h3>
            <p className="text-coffee-500 mb-4">검색 조건을 변경하거나 새 로스터리를 추가해보세요.</p>
            <UnifiedButton
              variant="primary"
              onClick={() => console.log('새 로스터리 추가')}
            >
              <Plus className="h-4 w-4 mr-2" />
              첫 번째 로스터리 추가
            </UnifiedButton>
          </CardContent>
        </Card>
      )}

      {/* 편집 모달 (추후 구현) */}
      {showEditModal && selectedRoaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">로스터리 정보 수정</h3>
            <p className="text-coffee-600 mb-4">{selectedRoaster.name} 정보를 수정합니다.</p>
            <div className="flex justify-end space-x-2">
              <UnifiedButton
                variant="ghost"
                onClick={() => setShowEditModal(false)}
              >
                취소
              </UnifiedButton>
              <UnifiedButton
                variant="primary"
                onClick={() => {
                  console.log('로스터리 수정:', selectedRoaster.id)
                  setShowEditModal(false)
                }}
              >
                수정
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 모달 (추후 구현) */}
      {showDeleteModal && selectedRoaster && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4 text-red-600">로스터리 삭제</h3>
            <p className="text-coffee-600 mb-4">
              <strong>{selectedRoaster.name}</strong>을(를) 정말 삭제하시겠습니까? 
              이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <UnifiedButton
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </UnifiedButton>
              <UnifiedButton
                variant="primary"
                onClick={() => {
                  console.log('로스터리 삭제:', selectedRoaster.id)
                  setShowDeleteModal(false)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                삭제
              </UnifiedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}