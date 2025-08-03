/**
 * 어드민 커피(원두) 데이터 관리 페이지
 * 커피 원두 정보 CRUD, 일괄 업데이트, 로스터리별 필터링
 */
'use client'

import { useState, useEffect } from 'react'
import { 
  Coffee as CoffeeIcon, 
  Search, 
  Filter,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Globe,
  Calendar,
  DollarSign,
  Award,
  Star,
  Package,
  Tag,
  AlertTriangle,
  CheckCircle,
  Eye,
  TrendingUp,
  MapPin,
  Droplets,
  Sun,
  Hash
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card'
import UnifiedButton from '../../../../components/ui/UnifiedButton'
import { supabase } from '../../../../lib/supabase'
import { logger } from '../../../../lib/logger'
import type { Coffee, CoffeeFilters, DataManagementStats, CafeRoastery } from '../../../../types/data-management'
import { 
  importCoffeesCSV, 
  exportCoffeesToCSV, 
  downloadFile 
} from '../../../../utils/csv-handler'
import { batchSyncCoffeeInfoFromRecords } from '../../../../utils/coffee-info-sync'

export default function AdminCoffeesPage() {
  const [coffees, setCoffees] = useState<Coffee[]>([])
  const [filteredData, setFilteredData] = useState<Coffee[]>([])
  const [cafeRoasteries, setCafeRoasteries] = useState<CafeRoastery[]>([])
  const [stats, setStats] = useState<DataManagementStats['coffee']>({
    total: 0,
    singleOrigin: 0,
    blends: 0,
    decaf: 0,
    inStock: 0,
    featured: 0,
    averageSCAScore: 0,
    countries: [],
    processings: []
  })
  
  const [filters, setFilters] = useState<CoffeeFilters>({
    search: '',
    roastery_id: null,
    origin_country: '',
    processing: '',
    roast_level: '',
    category: 'all',
    availability: '',
    min_sca_score: null,
    max_price: null,
    tags: [],
    is_featured: null,
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedCoffee, setSelectedCoffee] = useState<Coffee | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [isCrawling, setIsCrawling] = useState(false)
  const [lastCrawlTime, setLastCrawlTime] = useState<Date | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

  // 카페/로스터리 데이터 로드 (필터용)
  const loadCafeRoasteries = async () => {
    try {
      // 실제 구현에서는 Supabase에서 데이터를 가져옴
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
          business_hours: {},
          features: ['로스팅 체험', '커핑 클래스'],
          signature_menu: ['플랫화이트', '드립커피'],
          roasting_style: 'Light to Medium',
          coffee_ids: ['1', '2', '3'],
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
          business_hours: {},
          features: ['로스팅', '온라인 판매'],
          signature_menu: [],
          roasting_style: 'Nordic Style Light',
          coffee_ids: ['4', '5'],
          logo_url: null,
          images: [],
          is_active: true,
          is_verified: true,
          rating: 4.7,
          review_count: 189,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_verified_at: new Date().toISOString()
        }
      ]
      
      setCafeRoasteries(simulatedData)
    } catch (error) {
      logger.error('Failed to load cafe/roastery data', { error })
    }
  }

  // 커피 데이터 로드
  const loadCoffees = async () => {
    try {
      setIsLoading(true)
      
      // Supabase에서 데이터 가져오기
      const { data, error } = await supabase
        .from('coffees')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        logger.error('Failed to load coffees from Supabase', { error })
        
        // 에러 시 시뮬레이션 데이터 사용
        const simulatedData: Coffee[] = [
        {
          id: '1',
          name: '콜롬비아 핀카 엘 파라이소',
          name_en: 'Colombia Finca El Paraiso',
          roastery_id: '1',
          roastery_name: '프릳츠 커피 컴퍼니',
          origin: {
            country: 'Colombia',
            region: 'Huila',
            farm: 'Finca El Paraiso',
            altitude: '1,800-2,000m'
          },
          variety: ['Caturra', 'Castillo'],
          processing: 'Double Anaerobic',
          roast_level: 'Light',
          roasted_date: '2025-01-28',
          flavor_notes: ['Tropical Fruit', 'Wine', 'Dark Chocolate'],
          aroma: ['Sweet', 'Fruity', 'Complex'],
          acidity: 4,
          body: 3,
          sweetness: 5,
          bitterness: 2,
          roaster_notes: {
            description: '혁신적인 더블 애너로빅 프로세싱으로 독특한 과일 향미',
            brewing_method: ['Pour Over', 'Espresso'],
            brewing_recipe: 'V60: 15g / 250ml / 92°C / 2:30',
            tasting_notes: '열대과일의 강렬한 향미와 와인같은 바디감, 다크 초콜릿의 긴 여운'
          },
          sca_score: 88.5,
          price: {
            retail_price: 28000,
            price_per_kg: 112000,
            currency: 'KRW'
          },
          availability: 'in_stock',
          harvest_year: 2024,
          best_before: '2025-07-28',
          package_image_url: null,
          bean_image_url: null,
          tags: ['Single Origin', 'Experimental Process', 'Competition Grade'],
          category: 'single_origin',
          is_active: true,
          is_featured: true,
          popularity_score: 92,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data_source: 'manual'
        },
        {
          id: '2',
          name: '에티오피아 예가체프 코체레',
          name_en: 'Ethiopia Yirgacheffe Kochere',
          roastery_id: '1',
          roastery_name: '프릳츠 커피 컴퍼니',
          origin: {
            country: 'Ethiopia',
            region: 'Yirgacheffe',
            farm: 'Kochere Washing Station',
            altitude: '1,950-2,200m'
          },
          variety: ['Heirloom'],
          processing: 'Washed',
          roast_level: 'Light',
          roasted_date: '2025-01-27',
          flavor_notes: ['Lemon', 'Floral', 'Black Tea'],
          aroma: ['Citrus', 'Floral', 'Bright'],
          acidity: 5,
          body: 2,
          sweetness: 4,
          bitterness: 1,
          roaster_notes: {
            description: '클래식한 예가체프의 밝고 깨끗한 플로럴 노트',
            brewing_method: ['Pour Over', 'Aeropress'],
            brewing_recipe: 'V60: 15g / 250ml / 90°C / 2:15',
            tasting_notes: '레몬의 산미와 재스민 같은 플로럴, 홍차의 깔끔한 피니시'
          },
          sca_score: 87,
          price: {
            retail_price: 24000,
            price_per_kg: 96000,
            currency: 'KRW'
          },
          availability: 'in_stock',
          harvest_year: 2024,
          best_before: '2025-07-27',
          package_image_url: null,
          bean_image_url: null,
          tags: ['Single Origin', 'Classic', 'Bright'],
          category: 'single_origin',
          is_active: true,
          is_featured: true,
          popularity_score: 88,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data_source: 'manual'
        },
        {
          id: '3',
          name: '프릳츠 하우스 블렌드',
          name_en: 'Fritz House Blend',
          roastery_id: '1',
          roastery_name: '프릳츠 커피 컴퍼니',
          origin: {
            country: 'Blend',
            region: 'Colombia, Brazil, Ethiopia',
            farm: null,
            altitude: null
          },
          variety: ['Various'],
          processing: 'Mixed',
          roast_level: 'Medium',
          roasted_date: '2025-01-29',
          flavor_notes: ['Chocolate', 'Caramel', 'Nuts'],
          aroma: ['Sweet', 'Nutty', 'Balanced'],
          acidity: 3,
          body: 4,
          sweetness: 4,
          bitterness: 3,
          roaster_notes: {
            description: '매일 마시기 좋은 균형잡힌 블렌드',
            brewing_method: ['Espresso', 'French Press', 'Pour Over'],
            brewing_recipe: 'Espresso: 18g / 36ml / 93°C / 28s',
            tasting_notes: '초콜릿과 캐러멜의 단맛, 고소한 견과류, 부드러운 바디'
          },
          sca_score: 84,
          price: {
            retail_price: 18000,
            price_per_kg: 72000,
            currency: 'KRW'
          },
          availability: 'in_stock',
          harvest_year: 2024,
          best_before: '2025-07-29',
          package_image_url: null,
          bean_image_url: null,
          tags: ['Blend', 'Daily Coffee', 'Balanced'],
          category: 'blend',
          is_active: true,
          is_featured: false,
          popularity_score: 95,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data_source: 'manual'
        },
        {
          id: '4',
          name: '케냐 키리냐가 AA',
          name_en: 'Kenya Kirinyaga AA',
          roastery_id: '2',
          roastery_name: '센터 커피',
          origin: {
            country: 'Kenya',
            region: 'Kirinyaga',
            farm: 'Gikanda Farmers Cooperative',
            altitude: '1,600-1,800m'
          },
          variety: ['SL28', 'SL34'],
          processing: 'Double Washed',
          roast_level: 'Light',
          roasted_date: '2025-01-26',
          flavor_notes: ['Black Currant', 'Tomato', 'Brown Sugar'],
          aroma: ['Fruity', 'Savory', 'Complex'],
          acidity: 5,
          body: 4,
          sweetness: 3,
          bitterness: 2,
          roaster_notes: {
            description: '케냐 특유의 블랙커런트와 토마토의 복합적인 향미',
            brewing_method: ['Pour Over', 'Siphon'],
            brewing_recipe: 'V60: 15g / 250ml / 93°C / 2:45',
            tasting_notes: '진한 블랙커런트, 토마토의 감칠맛, 브라운 슈거의 단맛'
          },
          sca_score: 89,
          price: {
            retail_price: 32000,
            price_per_kg: 128000,
            currency: 'KRW'
          },
          availability: 'limited',
          harvest_year: 2024,
          best_before: '2025-07-26',
          package_image_url: null,
          bean_image_url: null,
          tags: ['Single Origin', 'Premium', 'Complex'],
          category: 'single_origin',
          is_active: true,
          is_featured: true,
          popularity_score: 85,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data_source: 'crawled'
        },
        {
          id: '5',
          name: '코스타리카 타라주 디카페인',
          name_en: 'Costa Rica Tarrazu Decaf',
          roastery_id: '2',
          roastery_name: '센터 커피',
          origin: {
            country: 'Costa Rica',
            region: 'Tarrazu',
            farm: 'Cooperativa de Tarrazu',
            altitude: '1,400-1,700m'
          },
          variety: ['Caturra', 'Catuai'],
          processing: 'Swiss Water Process',
          roast_level: 'Medium',
          roasted_date: '2025-01-25',
          flavor_notes: ['Milk Chocolate', 'Orange', 'Honey'],
          aroma: ['Sweet', 'Citrus', 'Smooth'],
          acidity: 3,
          body: 3,
          sweetness: 4,
          bitterness: 2,
          roaster_notes: {
            description: '스위스 워터 프로세스로 카페인만 제거한 프리미엄 디카페인',
            brewing_method: ['Pour Over', 'Espresso', 'Cold Brew'],
            brewing_recipe: 'Pour Over: 16g / 250ml / 91°C / 2:30',
            tasting_notes: '밀크 초콜릿의 부드러움, 오렌지의 산미, 꿀의 단맛'
          },
          sca_score: 83,
          price: {
            retail_price: 22000,
            price_per_kg: 88000,
            currency: 'KRW'
          },
          availability: 'in_stock',
          harvest_year: 2024,
          best_before: '2025-07-25',
          package_image_url: null,
          bean_image_url: null,
          tags: ['Decaf', 'Swiss Water', 'Smooth'],
          category: 'decaf',
          is_active: true,
          is_featured: false,
          popularity_score: 75,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          data_source: 'crawled'
        }
      ]
      
        setCoffees(simulatedData)
        calculateStats(simulatedData)
        logger.info('Using simulated coffee data', { count: simulatedData.length })
      } else {
        // Supabase 데이터 사용
        const formattedData: Coffee[] = (data || []).map(item => ({
          ...item,
          origin: {
            country: item.origin_country,
            region: item.origin_region || null,
            farm: item.origin_farm || null,
            altitude: item.origin_altitude || null
          },
          variety: item.variety || [],
          flavor_notes: item.flavor_notes || [],
          aroma: item.aroma || [],
          roaster_notes: item.roaster_notes || {},
          price: {
            retail_price: item.price_retail || null,
            price_per_kg: item.price_per_kg || null,
            currency: item.price_currency || 'KRW'
          },
          tags: item.tags || []
        }))
        
        setCoffees(formattedData)
        calculateStats(formattedData)
        logger.info('Coffee data loaded from Supabase', { count: formattedData.length })
      }
      
    } catch (error) {
      logger.error('Failed to load coffee data', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 통계 계산
  const calculateStats = (data: Coffee[]) => {
    const countries = [...new Set(data.map(d => d.origin.country))]
    const processings = [...new Set(data.map(d => d.processing))]
    const scaScores = data.filter(d => d.sca_score).map(d => d.sca_score as number)
    const averageSCA = scaScores.length > 0 
      ? Math.round(scaScores.reduce((a, b) => a + b, 0) / scaScores.length * 10) / 10
      : 0
    
    setStats({
      total: data.length,
      singleOrigin: data.filter(d => d.category === 'single_origin').length,
      blends: data.filter(d => d.category === 'blend').length,
      decaf: data.filter(d => d.category === 'decaf').length,
      inStock: data.filter(d => d.availability === 'in_stock').length,
      featured: data.filter(d => d.is_featured).length,
      averageSCAScore: averageSCA,
      countries,
      processings
    })
  }

  // 필터 적용
  useEffect(() => {
    let filtered = [...coffees]
    
    // 검색
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(searchTerm) ||
        item.name_en?.toLowerCase().includes(searchTerm) ||
        item.roastery_name.toLowerCase().includes(searchTerm) ||
        item.origin.country.toLowerCase().includes(searchTerm) ||
        item.origin.region?.toLowerCase().includes(searchTerm) ||
        item.flavor_notes.some(note => note.toLowerCase().includes(searchTerm))
      )
    }
    
    // 로스터리 필터
    if (filters.roastery_id) {
      filtered = filtered.filter(item => item.roastery_id === filters.roastery_id)
    }
    
    // 원산지 필터
    if (filters.origin_country) {
      filtered = filtered.filter(item => item.origin.country === filters.origin_country)
    }
    
    // 가공 방식 필터
    if (filters.processing) {
      filtered = filtered.filter(item => item.processing === filters.processing)
    }
    
    // 로스팅 레벨 필터
    if (filters.roast_level) {
      filtered = filtered.filter(item => item.roast_level === filters.roast_level)
    }
    
    // 카테고리 필터
    if (filters.category !== 'all') {
      filtered = filtered.filter(item => item.category === filters.category)
    }
    
    // 재고 상태 필터
    if (filters.availability) {
      filtered = filtered.filter(item => item.availability === filters.availability)
    }
    
    // SCA 점수 필터
    if (filters.min_sca_score) {
      filtered = filtered.filter(item => 
        item.sca_score && item.sca_score >= filters.min_sca_score!
      )
    }
    
    // 추천 여부 필터
    if (filters.is_featured !== null) {
      filtered = filtered.filter(item => item.is_featured === filters.is_featured)
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (filters.sortBy) {
        case 'name':
          aValue = a.name
          bValue = b.name
          break
        case 'sca_score':
          aValue = a.sca_score || 0
          bValue = b.sca_score || 0
          break
        case 'price':
          aValue = a.price.retail_price || 0
          bValue = b.price.retail_price || 0
          break
        case 'popularity_score':
          aValue = a.popularity_score
          bValue = b.popularity_score
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
  }, [coffees, filters])

  // 컴포넌트 마운트
  useEffect(() => {
    loadCafeRoasteries()
    loadCoffees()
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
      await loadCoffees()
      
      logger.info('Coffee crawling completed successfully')
      alert('커피 데이터 크롤링이 완료되었습니다.')
      
    } catch (error) {
      logger.error('Coffee crawling failed', { error })
      alert('크롤링 중 오류가 발생했습니다.')
    } finally {
      setIsCrawling(false)
    }
  }
  
  // 사용자 기록에서 커피 정보 동기화
  const syncFromUserRecords = async () => {
    try {
      setIsSyncing(true)
      
      const result = await batchSyncCoffeeInfoFromRecords()
      
      if (result.synced > 0) {
        alert(`사용자 기록에서 ${result.synced}개의 새로운 커피 정보를 추가했습니다.\n오류: ${result.errors}개`)
        await loadCoffees()
      } else {
        alert('동기화할 새로운 커피 정보가 없습니다.')
      }
      
      logger.info('User records sync completed', result)
      
    } catch (error) {
      logger.error('User records sync failed', { error })
      alert('동기화 중 오류가 발생했습니다.')
    } finally {
      setIsSyncing(false)
    }
  }

  // CSV 내보내기
  const exportToCSV = async () => {
    try {
      const blob = await exportCoffeesToCSV()
      const filename = `coffees_${new Date().toISOString().split('T')[0]}.csv`
      downloadFile(blob, filename)
      
      logger.info('Coffee CSV exported successfully')
      alert('커피 데이터 CSV 파일이 다운로드되었습니다.')
    } catch (error) {
      logger.error('Coffee CSV export failed', { error })
      alert('CSV 내보내기 중 오류가 발생했습니다.')
    }
  }
  
  // CSV 가져오기
  const handleCSVUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    try {
      const result = await importCoffeesCSV(file)
      
      if (result.success) {
        alert(`${result.imported}개의 커피 데이터를 성공적으로 가져왔습니다.`)
        await loadCoffees()
      } else {
        alert(`가져오기 실패:\n${result.errors.join('\n')}`)
      }
    } catch (error) {
      logger.error('Coffee CSV import failed', { error })
      alert('CSV 가져오기 중 오류가 발생했습니다.')
    }
    
    // 입력 초기화
    event.target.value = ''
  }

  // 로스팅 레벨 색상
  const getRoastLevelColor = (level: Coffee['roast_level']) => {
    switch (level) {
      case 'Light': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'Light-Medium': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'Medium': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'Medium-Dark': return 'text-brown-600 bg-brown-50 border-brown-200'
      case 'Dark': return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  // 재고 상태 색상
  const getAvailabilityColor = (availability: Coffee['availability']) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600'
      case 'out_of_stock': return 'text-red-600'
      case 'seasonal': return 'text-blue-600'
      case 'limited': return 'text-purple-600'
    }
  }

  // 재고 상태 텍스트
  const getAvailabilityText = (availability: Coffee['availability']) => {
    switch (availability) {
      case 'in_stock': return '재고 있음'
      case 'out_of_stock': return '품절'
      case 'seasonal': return '시즌 한정'
      case 'limited': return '소량 입고'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-coffee-800">커피 데이터 로딩 중...</h1>
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
          <h1 className="text-2xl font-bold text-coffee-800">커피(원두) 데이터 관리</h1>
          <p className="text-coffee-600 mt-1">
            커피 원두 정보를 관리하고 로스터리별로 분류하세요
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
            onClick={syncFromUserRecords}
            disabled={isSyncing}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? '동기화 중...' : '사용자 기록 동기화'}
          </UnifiedButton>
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
            새 원두 추가
          </UnifiedButton>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">전체</p>
                <p className="text-xl font-bold text-coffee-800">{stats.total}</p>
              </div>
              <CoffeeIcon className="h-5 w-5 text-coffee-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">싱글오리진</p>
                <p className="text-xl font-bold text-coffee-800">{stats.singleOrigin}</p>
              </div>
              <Globe className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">블렌드</p>
                <p className="text-xl font-bold text-coffee-800">{stats.blends}</p>
              </div>
              <Package className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">디카페인</p>
                <p className="text-xl font-bold text-coffee-800">{stats.decaf}</p>
              </div>
              <CoffeeIcon className="h-5 w-5 text-gray-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">재고있음</p>
                <p className="text-xl font-bold text-coffee-800">{stats.inStock}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">추천</p>
                <p className="text-xl font-bold text-coffee-800">{stats.featured}</p>
              </div>
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/90 backdrop-blur-sm border border-coffee-200/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-coffee-600">평균 SCA</p>
                <p className="text-xl font-bold text-coffee-800">{stats.averageSCAScore}</p>
              </div>
              <Award className="h-5 w-5 text-purple-500" />
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
                  placeholder="이름, 원산지, 맛 노트로 검색..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                />
              </div>
            </div>

            <select
              value={filters.roastery_id || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, roastery_id: e.target.value || null }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="">모든 로스터리</option>
              {cafeRoasteries
                .filter(cr => cr.type === 'roastery' || cr.type === 'both')
                .map(cr => (
                  <option key={cr.id} value={cr.id}>{cr.name}</option>
                ))}
            </select>

            <select
              value={filters.origin_country}
              onChange={(e) => setFilters(prev => ({ ...prev, origin_country: e.target.value }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="">모든 원산지</option>
              {stats.countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>

            <select
              value={filters.processing}
              onChange={(e) => setFilters(prev => ({ ...prev, processing: e.target.value }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="">모든 가공방식</option>
              {stats.processings.map(processing => (
                <option key={processing} value={processing}>{processing}</option>
              ))}
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
              className="px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
            >
              <option value="all">모든 카테고리</option>
              <option value="single_origin">싱글 오리진</option>
              <option value="blend">블렌드</option>
              <option value="decaf">디카페인</option>
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
              <option value="name-asc">이름 (A-Z)</option>
              <option value="sca_score-desc">SCA 점수 높은순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="popularity_score-desc">인기도순</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 커피 목록 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>커피 원두 목록 ({filteredData.length}개)</CardTitle>
          <label htmlFor="coffee-csv-upload" className="cursor-pointer">
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
              id="coffee-csv-upload"
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
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">커피 정보</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">로스터리</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">원산지</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">특성</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">가격/재고</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-coffee-700">평가</th>
                  <th className="text-center py-3 px-6 text-sm font-medium text-coffee-700">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-coffee-100">
                {paginatedData.map(coffee => (
                  <tr key={coffee.id} className="hover:bg-coffee-50/50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-coffee-800 flex items-center">
                          {coffee.name}
                          {coffee.is_featured && (
                            <Star className="h-4 w-4 ml-2 text-yellow-500 fill-current" />
                          )}
                        </div>
                        {coffee.name_en && (
                          <div className="text-sm text-coffee-600 italic">{coffee.name_en}</div>
                        )}
                        <div className="text-xs text-coffee-500 mt-1">
                          {coffee.flavor_notes.slice(0, 3).join(' · ')}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-coffee-700">{coffee.roastery_name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center text-coffee-800">
                          <MapPin className="h-3 w-3 mr-1" />
                          {coffee.origin.country}
                        </div>
                        {coffee.origin.region && (
                          <div className="text-xs text-coffee-600">{coffee.origin.region}</div>
                        )}
                        {coffee.origin.farm && (
                          <div className="text-xs text-coffee-500">{coffee.origin.farm}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getRoastLevelColor(coffee.roast_level)}`}>
                          {coffee.roast_level}
                        </span>
                        <div className="flex items-center text-xs text-coffee-600">
                          <Droplets className="h-3 w-3 mr-1" />
                          {coffee.processing}
                        </div>
                        {coffee.variety.length > 0 && (
                          <div className="text-xs text-coffee-500">
                            {coffee.variety.join(', ')}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="flex items-center text-sm font-medium text-coffee-800">
                          <DollarSign className="h-3 w-3" />
                          {coffee.price.retail_price?.toLocaleString()}원
                        </div>
                        <div className={`text-xs mt-1 ${getAvailabilityColor(coffee.availability)}`}>
                          {getAvailabilityText(coffee.availability)}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {coffee.sca_score ? (
                        <div>
                          <div className="flex items-center">
                            <Award className="h-4 w-4 text-purple-500 mr-1" />
                            <span className="text-sm font-medium text-coffee-800">
                              {coffee.sca_score}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-coffee-500 mt-1">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            인기 {coffee.popularity_score}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          onClick={() => {
                            setSelectedCoffee(coffee)
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
                            setSelectedCoffee(coffee)
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