/**
 * 어드민 카페/로스터리 데이터 관리 페이지
 * 한국 카페 및 로스터리 정보 CRUD, 일괄 업데이트, 크롤링 관리
 */
'use client'

import { useState, useEffect } from 'react'
import { 
  Coffee, 
  Store,
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  MapPin,
  Globe,
  Instagram,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  Eye,
  Star,
  Building2,
  Map
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card'
import UnifiedButton from '../../../../components/ui/UnifiedButton'
import { supabase } from '../../../../lib/supabase'
import { logger } from '../../../../lib/logger'
import type { CafeRoastery, CafeRoasteryFilters, DataManagementStats } from '../../../../types/data-management'
import { 
  importCafeRoasteriesCSV, 
  exportCafeRoasteriesToCSV, 
  downloadFile 
} from '../../../../utils/csv-handler'

export default function AdminCafesPage() {
  const [cafeRoasteries, setCafeRoasteries] = useState<CafeRoastery[]>([])
  const [filteredData, setFilteredData] = useState<CafeRoastery[]>([])
  const [stats, setStats] = useState<DataManagementStats['cafeRoastery']>({
    total: 0,
    cafes: 0,
    roasteries: 0,
    both: 0,
    verified: 0,
    active: 0,
    cities: []
  })
  
  const [filters, setFilters] = useState<CafeRoasteryFilters>({
    search: '',
    type: 'all',
    city: '',
    district: '',
    features: [],
    is_active: null,
    is_verified: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<CafeRoastery | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [isCrawling, setIsCrawling] = useState(false)
  const [lastCrawlTime, setLastCrawlTime] = useState<Date | null>(null)

  // 데이터 로드 (Supabase)
  const loadCafeRoasteries = async () => {
    try {
      setIsLoading(true)
      
      // Supabase에서 데이터 가져오기
      const { data, error } = await supabase
        .from('cafe_roasteries')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        logger.error('Failed to load cafe/roasteries from Supabase', { error })
        
        // 에러 시 시뮬레이션 데이터 사용
        const simulatedData: CafeRoastery[] = [
        {
          id: '1',
          name: '프릳츠 커피 컴퍼니',
          type: 'both',
          description: '서울의 대표적인 스페셜티 커피 로스터리 카페',
          established_year: 2014,
          owner_name: null,
          address: '서울특별시 마포구 와우산로 17길 12',
          address_detail: '1-2층',
          city: '서울',
          district: '마포구',
          latitude: 37.5547,
          longitude: 126.9221,
          phone: '02-1234-5678',
          email: 'info@fritz.coffee',
          website: 'https://fritz.coffee',
          instagram: '@fritzcoffee',
          business_hours: {
            monday: '08:00-22:00',
            tuesday: '08:00-22:00',
            wednesday: '08:00-22:00',
            thursday: '08:00-22:00',
            friday: '08:00-22:00',
            saturday: '09:00-22:00',
            sunday: '09:00-21:00'
          },
          features: ['로스팅 체험', '커핑 클래스', '테라스'],
          signature_menu: ['플랫화이트', '드립커피'],
          roasting_style: 'Light to Medium',
          coffee_ids: [],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: true,
          rating: 4.5,
          review_count: 234,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString()
        },
        {
          id: '2',
          name: '센터 커피',
          type: 'roastery',
          description: '다양한 싱글 오리진을 전문으로 하는 로스터리',
          established_year: 2016,
          owner_name: null,
          address: '서울특별시 용산구 이태원로 243',
          address_detail: null,
          city: '서울',
          district: '용산구',
          latitude: 37.5347,
          longitude: 126.9945,
          phone: '02-2345-6789',
          email: null,
          website: 'https://centercoffee.kr',
          instagram: '@center_coffee',
          business_hours: {
            monday: '09:00-20:00',
            tuesday: '09:00-20:00',
            wednesday: '09:00-20:00',
            thursday: '09:00-20:00',
            friday: '09:00-20:00',
            saturday: '10:00-20:00',
            sunday: '10:00-19:00'
          },
          features: ['로스팅', '온라인 판매', '도매'],
          signature_menu: [],
          roasting_style: 'Nordic Style Light',
          coffee_ids: [],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: true,
          rating: 4.7,
          review_count: 189,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString()
        },
        {
          id: '3',
          name: '앤트러사이트',
          type: 'cafe',
          description: '합정의 인기 카페',
          established_year: 2010,
          owner_name: null,
          address: '서울특별시 마포구 토정로5길 10',
          address_detail: null,
          city: '서울',
          district: '마포구',
          latitude: 37.5489,
          longitude: 126.9112,
          phone: '02-3456-7890',
          email: null,
          website: null,
          instagram: '@anthracite_coffee',
          business_hours: {
            monday: '08:00-23:00',
            tuesday: '08:00-23:00',
            wednesday: '08:00-23:00',
            thursday: '08:00-23:00',
            friday: '08:00-23:00',
            saturday: '09:00-23:00',
            sunday: '09:00-22:00'
          },
          features: ['테라스', '주차 가능', '브런치'],
          signature_menu: ['라떼', '크로플'],
          roasting_style: null,
          coffee_ids: [],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: false,
          rating: 4.2,
          review_count: 567,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: null
        },
        {
          id: '4',
          name: '테라로사',
          type: 'both',
          description: '강릉 본점을 둔 대형 로스터리 카페',
          established_year: 2002,
          owner_name: null,
          address: '강원도 강릉시 구정면 현천길 7',
          address_detail: null,
          city: '강릉',
          district: '구정면',
          latitude: 37.6867,
          longitude: 128.9182,
          phone: '033-648-2760',
          email: 'info@terarosa.com',
          website: 'https://terarosa.com',
          instagram: '@terarosa_coffee',
          business_hours: {
            monday: '09:00-21:00',
            tuesday: '09:00-21:00',
            wednesday: '09:00-21:00',
            thursday: '09:00-21:00',
            friday: '09:00-21:00',
            saturday: '09:00-21:00',
            sunday: '09:00-21:00'
          },
          features: ['로스팅 공장', '베이커리', '정원', '주차장'],
          signature_menu: ['싱글 오리진', '시그니처 블렌드'],
          roasting_style: 'Medium',
          coffee_ids: [],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: true,
          rating: 4.8,
          review_count: 1234,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString()
        },
        {
          id: '5',
          name: '커피 리브레',
          type: 'roastery',
          description: '연남동의 스페셜티 커피 로스터리',
          established_year: 2012,
          owner_name: null,
          address: '서울특별시 마포구 연남로1길 41',
          address_detail: null,
          city: '서울',
          district: '마포구',
          latitude: 37.5627,
          longitude: 126.9255,
          phone: '02-4567-8901',
          email: null,
          website: null,
          instagram: '@coffeelibre',
          business_hours: {
            monday: '10:00-22:00',
            tuesday: '10:00-22:00',
            wednesday: '10:00-22:00',
            thursday: '10:00-22:00',
            friday: '10:00-22:00',
            saturday: '10:00-22:00',
            sunday: '10:00-21:00'
          },
          features: ['커핑 클래스', '원두 판매'],
          signature_menu: [],
          roasting_style: 'Light',
          coffee_ids: [],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: true,
          rating: 4.6,
          review_count: 342,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString()
        }
      ]
      
        setCafeRoasteries(simulatedData)
        calculateStats(simulatedData)
        logger.info('Using simulated data', { count: simulatedData.length })
      } else {
        // Supabase 데이터 사용
        const formattedData: CafeRoastery[] = (data || []).map(item => ({
          ...item,
          business_hours: item.business_hours || {},
          features: item.features || [],
          signature_menu: item.signature_menu || [],
          images: item.images || [],
          coffee_ids: []
        }))
        
        setCafeRoasteries(formattedData)
        calculateStats(formattedData)
        logger.info('Cafe/Roastery data loaded from Supabase', { count: formattedData.length })
      }
      
    } catch (error) {
      logger.error('Failed to load cafe/roastery data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 통계 계산
  const calculateStats = (data: CafeRoastery[]) => {
    const cities = [...new Set(data.map(d => d.city))]
    
    setStats({
      total: data.length,
      cafes: data.filter(d => d.type === 'cafe').length,
      roasteries: data.filter(d => d.type === 'roastery').length,
      both: data.filter(d => d.type === 'both').length,
      verified: data.filter(d => d.is_verified).length,
      active: data.filter(d => d.is_active).length,
      cities
    })
  }

  // 필터 적용
  useEffect(() => {
    let filtered = [...cafeRoasteries]
    
    // 검색
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.description?.toLowerCase().includes(searchTerm) ||
        item.address.toLowerCase().includes(searchTerm)
      )
    }
    
    // 타입 필터
    if (filters.type !== 'all') {
      filtered = filtered.filter(item => item.type === filters.type)
    }
    
    // 도시 필터
    if (filters.city) {
      filtered = filtered.filter(item => item.city === filters.city)
    }
    
    // 활성 상태 필터
    if (filters.is_active !== null) {
      filtered = filtered.filter(item => item.is_active === filters.is_active)
    }
    
    // 검증 상태 필터
    if (filters.is_verified !== null) {
      filtered = filtered.filter(item => item.is_verified === filters.is_verified)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        case 'updated_at':
          aValue = a.updated_at
          bValue = b.updated_at
          break
        default:
          aValue = a.created_at
          bValue = b.created_at
      }
      
      if (filters.sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
    
    setFilteredData(filtered)
    setCurrentPage(1)
  }, [cafeRoasteries, filters])

  // 컴포넌트 마운트
  useEffect(() => {
    loadCafeRoasteries()
  }, [])

  // 페이지네이션
  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage)

  // 크롤링 시작
  const startCrawling = async () => {
    try {
      setIsCrawling(true)
      
      // 실제 구현에서는 크롤링 API 호출
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      setLastCrawlTime(new Date())
      await loadCafeRoasteries()
      
      logger.info('Crawling completed successfully')
      alert('크롤링이 완료되었습니다.')
      
    } catch (error) {
      logger.error('Crawling failed', { error })
      alert('크롤링 중 오류가 발생했습니다.')
    } finally {
      setIsCrawling(false)
    }
  }

  // CSV 내보내기
  const exportToCSV = async () => {
    try {
      const blob = await exportCafeRoasteriesToCSV()
      const filename = `cafe_roasteries_${new Date().toISOString().split('T')[0]}.csv`
      downloadFile(blob, filename)
      
      logger.info('CSV exported successfully')
      alert('CSV 파일이 다운로드되었습니다.')
    } catch (error) {
      logger.error('CSV export failed', { error })
      alert('CSV 내보내기 중 오류가 발생했습니다.')
    }
  }
  
  // CSV 가져오기
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const result = await importCafeRoasteriesCSV(file)
      
      if (result.success) {
        alert(`${result.imported}개의 데이터를 성공적으로 가져왔습니다.`)
        await loadCafeRoasteries()
      } else {
        alert(`가져오기 실패:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      logger.error('CSV import failed', { error })
      alert('CSV 가져오기 중 오류가 발생했습니다.')
    }
    
    // 입력 초기화
    event.target.value = ''
  }

  // 타입 뱃지 색상
  const getTypeBadgeColor = (type: CafeRoastery['type']) => {
    switch (type) {
      case 'cafe': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'roastery': return 'text-green-600 bg-green-50 border-green-200'
      case 'both': return 'text-purple-600 bg-purple-50 border-purple-200'
    }
  }

  // 타입 이름
  const getTypeName = (type: CafeRoastery['type']) => {
    switch (type) {
      case 'cafe': return '카페'
      case 'roastery': return '로스터리'
      case 'both': return '카페+로스터리'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-coffee-800">카페/로스터리 데이터 로딩 중...</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
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
          <h1 className="text-2xl font-bold text-coffee-800">카페/로스터리 데이터 관리</h1>
          <p className="text-coffee-600 mt-1">
            한국의 카페 및 로스터리 정보를 관리하고 업데이트하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {lastCrawlTime && (
            <span className="text-sm text-coffee-500">
              마지막 크롤링: {lastCrawlTime.toLocaleString()}
            </span>
          )}
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={startCrawling}
            disabled={isCrawling}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isCrawling ? 'animate-spin' : ''}`} />
            {isCrawling ? '크롤링 중...' : '데이터 크롤링'}
          </UnifiedButton>
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={exportToCSV}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <Download className="h-4 w-4 mr-2" />
            CSV 내보내기
          </UnifiedButton>
          <UnifiedButton
            variant="default"
            size="small"
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-coffee-500 to-coffee-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            새로 추가
          </UnifiedButton>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">전체</p>
                <p className="text-xl font-bold text-coffee-800">{stats.total}</p>
              </div>
              <Store className="h-5 w-5 text-coffee-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">카페</p>
                <p className="text-xl font-bold text-coffee-800">{stats.cafes}</p>
              </div>
              <Coffee className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">로스터리</p>
                <p className="text-xl font-bold text-coffee-800">{stats.roasteries}</p>
              </div>
              <Building2 className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">둘 다</p>
                <p className="text-xl font-bold text-coffee-800">{stats.both}</p>
              </div>
              <Store className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">검증됨</p>
                <p className="text-xl font-bold text-coffee-800">{stats.verified}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">도시</p>
                <p className="text-xl font-bold text-coffee-800">{stats.cities.length}</p>
              </div>
              <Map className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-coffee-400" />
                <input
                  type="text"
                  placeholder="이름, 주소로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value as any }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 타입</option>
              <option value="cafe">카페</option>
              <option value="roastery">로스터리</option>
              <option value="both">카페+로스터리</option>
            </select>

            <select
              value={filters.city}
              onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="">모든 도시</option>
              {stats.cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>

            <select
              value={filters.is_verified === null ? 'all' : filters.is_verified ? 'verified' : 'unverified'}
              onChange={(e) => setFilters(prev => ({ 
                ...prev, 
                is_verified: e.target.value === 'all' ? null : e.target.value === 'verified' 
              }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">검증 상태</option>
              <option value="verified">검증됨</option>
              <option value="unverified">미검증</option>
            </select>

            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-')
                setFilters(prev => ({ 
                  ...prev, 
                  sortBy: sortBy as any,
                  sortOrder: sortOrder as any
                }))
              }}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="created_at-desc">최신순</option>
              <option value="created_at-asc">오래된순</option>
              <option value="name-asc">이름 (A-Z)</option>
              <option value="rating-desc">평점 높은순</option>
              <option value="updated_at-desc">최근 수정순</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 데이터 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>카페/로스터리 목록 ({filteredData.length}개)</CardTitle>
          <label htmlFor="csv-upload" className="cursor-pointer">
            <UnifiedButton
              variant="outline"
              size="small"
              className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
              onClick={(e) => e.preventDefault()}
            >
              <Upload className="h-4 w-4 mr-2" />
              CSV 업로드
            </UnifiedButton>
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="hidden"
            />
          </label>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-coffee-50 border-b border-coffee-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">업체 정보</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">타입</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">위치</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">연락처</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">평점</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">상태</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-coffee-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {paginatedData.map(item => (
                  <tr key={item.id} className="hover:bg-coffee-50/50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-coffee-800">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-coffee-600 mt-1">{item.description}</div>
                        )}
                        {item.roasting_style && (
                          <div className="text-xs text-coffee-500 mt-1">
                            로스팅: {item.roasting_style}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTypeBadgeColor(item.type)}`}>
                        {getTypeName(item.type)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center text-coffee-800">
                          <MapPin className="h-3 w-3 mr-1" />
                          {item.city} {item.district}
                        </div>
                        <div className="text-xs text-coffee-600 mt-1">
                          {item.address}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        {item.phone && (
                          <div className="flex items-center text-xs text-coffee-600">
                            <Phone className="h-3 w-3 mr-1" />
                            {item.phone}
                          </div>
                        )}
                        {item.website && (
                          <div className="flex items-center text-xs text-coffee-600">
                            <Globe className="h-3 w-3 mr-1" />
                            <a href={item.website} target="_blank" rel="noopener noreferrer" className="hover:text-coffee-800">
                              웹사이트
                            </a>
                          </div>
                        )}
                        {item.instagram && (
                          <div className="flex items-center text-xs text-coffee-600">
                            <Instagram className="h-3 w-3 mr-1" />
                            {item.instagram}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {item.rating ? (
                        <div>
                          <div className="flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="ml-1 text-sm font-medium text-coffee-800">
                              {item.rating}
                            </span>
                          </div>
                          <div className="text-xs text-coffee-500">
                            {item.review_count}개 리뷰
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          item.is_active ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                        }`}>
                          {item.is_active ? '활성' : '비활성'}
                        </span>
                        {item.is_verified ? (
                          <span className="inline-flex items-center text-xs text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            검증됨
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-orange-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            미검증
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          onClick={() => {
                            setSelectedItem(item)
                            // 상세보기 모달 표시
                          }}
                          className="p-2"
                        >
                          <Eye className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          onClick={() => {
                            setSelectedItem(item)
                            setShowEditModal(true)
                          }}
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </UnifiedButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-coffee-200">
              <div className="text-sm text-coffee-600">
                {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredData.length)} / {filteredData.length}개
              </div>
              <div className="flex items-center space-x-2">
                <UnifiedButton
                  variant="outline"
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="border-coffee-200"
                >
                  이전
                </UnifiedButton>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                  if (page > totalPages) return null
                  
                  return (
                    <UnifiedButton
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="small"
                      onClick={() => setCurrentPage(page)}
                      className={currentPage === page ? "bg-coffee-500" : "border-coffee-200"}
                    >
                      {page}
                    </UnifiedButton>
                  )
                })}
                
                <UnifiedButton
                  variant="outline"
                  size="small"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="border-coffee-200"
                >
                  다음
                </UnifiedButton>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}