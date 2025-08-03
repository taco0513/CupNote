/**
 * 데이터 관리 타입 정의
 * 카페, 로스터리, 커피 원두 정보 관리를 위한 인터페이스
 */

// ============= 카페/로스터리 관련 =============

export interface CafeRoastery {
  id: string
  name: string
  type: 'cafe' | 'roastery' | 'both' // 카페, 로스터리, 또는 둘 다
  
  // 기본 정보
  description: string | null
  established_year: number | null
  owner_name: string | null
  
  // 위치 정보
  address: string
  address_detail: string | null
  city: string
  district: string | null
  latitude: number | null
  longitude: number | null
  
  // 연락처
  phone: string | null
  email: string | null
  website: string | null
  instagram: string | null
  
  // 영업 정보
  business_hours: {
    monday?: string
    tuesday?: string
    wednesday?: string
    thursday?: string
    friday?: string
    saturday?: string
    sunday?: string
    holidays?: string
  }
  
  // 특징
  features: string[] // ['로스팅 체험', '커핑 클래스', '드립백 제작', '테라스']
  signature_menu: string[] // ['플랫화이트', '드립커피', '에스프레소']
  roasting_style: string | null // 'Light', 'Medium', 'Dark', 'Nordic Style' 등
  
  // 취급 원두 (Coffee와 연결)
  coffee_ids: string[] // 취급하는 커피 원두 ID 목록
  
  // 이미지
  logo_url: string | null
  images: string[]
  
  // 상태 및 메타데이터
  is_active: boolean
  is_verified: boolean // 검증된 정보인지
  rating: number | null // 평균 평점
  review_count: number
  
  created_at: string
  updated_at: string
  last_verified_at: string | null // 마지막 정보 검증 날짜
}

// ============= 커피 원두 관련 =============

export interface Coffee {
  id: string
  name: string // 원두 이름
  name_en: string | null // 영문명
  
  // 로스터리 정보
  roastery_id: string | null // 로스터리 ID (CafeRoastery 연결)
  roastery_name: string // 로스터리 이름 (캐시용)
  
  // 원산지 정보
  origin: {
    country: string // 국가 (Colombia, Ethiopia, Kenya 등)
    region: string | null // 지역 (Yirgacheffe, Huila 등)
    farm: string | null // 농장명
    altitude: string | null // 고도 (1,800-2,000m 등)
  }
  
  // 품종 및 가공
  variety: string[] // ['Bourbon', 'Typica', 'Caturra']
  processing: string // 'Washed', 'Natural', 'Honey', 'Anaerobic'
  
  // 로스팅 정보
  roast_level: 'Light' | 'Light-Medium' | 'Medium' | 'Medium-Dark' | 'Dark'
  roasted_date: string | null // 로스팅 날짜
  
  // 맛 프로파일
  flavor_notes: string[] // ['Chocolate', 'Berry', 'Citrus', 'Floral']
  aroma: string[] // ['Sweet', 'Fruity', 'Nutty']
  acidity: number // 1-5
  body: number // 1-5
  sweetness: number // 1-5
  bitterness: number // 1-5
  
  // 로스터 노트
  roaster_notes: {
    description: string | null // 로스터의 설명
    brewing_method: string[] // 추천 추출 방법 ['Pour Over', 'Espresso', 'French Press']
    brewing_recipe: string | null // 추천 레시피
    tasting_notes: string | null // 상세 테이스팅 노트
  }
  
  // SCA 점수
  sca_score: number | null // 80-100
  
  // 가격 정보
  price: {
    retail_price: number | null // 소매가
    price_per_kg: number | null // kg당 가격
    currency: 'KRW' | 'USD'
  }
  
  // 재고 및 판매 정보
  availability: 'in_stock' | 'out_of_stock' | 'seasonal' | 'limited'
  harvest_year: number | null
  best_before: string | null // 추천 소비 기한
  
  // 이미지
  package_image_url: string | null
  bean_image_url: string | null
  
  // 태그 및 카테고리
  tags: string[] // ['Single Origin', 'Organic', 'Fair Trade', 'Direct Trade']
  category: 'single_origin' | 'blend' | 'decaf'
  
  // 상태 및 메타데이터
  is_active: boolean
  is_featured: boolean // 추천 원두
  popularity_score: number // 인기도 점수
  
  created_at: string
  updated_at: string
  data_source: 'manual' | 'crawled' | 'api' // 데이터 출처
}

// ============= 관계 데이터 =============

export interface CafeRoasteryCoffee {
  id: string
  cafe_roastery_id: string
  coffee_id: string
  is_signature: boolean // 시그니처 메뉴인지
  is_seasonal: boolean // 시즌 한정인지
  notes: string | null // 특별 사항
  created_at: string
}

// ============= 데이터 업데이트 로그 =============

export interface DataUpdateLog {
  id: string
  entity_type: 'cafe_roastery' | 'coffee'
  entity_id: string
  action: 'create' | 'update' | 'delete' | 'import' | 'crawl'
  changes: Record<string, any> // 변경 사항
  user_id: string | null // 수정한 관리자
  source: 'manual' | 'crawl' | 'api' | 'csv'
  created_at: string
}

// ============= 필터 및 검색 =============

export interface CafeRoasteryFilters {
  search: string
  type: 'all' | 'cafe' | 'roastery' | 'both'
  city: string
  district: string
  features: string[]
  is_active: boolean | null
  is_verified: boolean | null
  sortBy: 'name' | 'rating' | 'created_at' | 'updated_at'
  sortOrder: 'asc' | 'desc'
}

export interface CoffeeFilters {
  search: string
  roastery_id: string | null
  origin_country: string
  processing: string
  roast_level: string
  category: 'all' | 'single_origin' | 'blend' | 'decaf'
  availability: string
  min_sca_score: number | null
  max_price: number | null
  tags: string[]
  is_featured: boolean | null
  sortBy: 'name' | 'sca_score' | 'price' | 'popularity_score' | 'created_at'
  sortOrder: 'asc' | 'desc'
}

// ============= 통계 =============

export interface DataManagementStats {
  cafeRoastery: {
    total: number
    cafes: number
    roasteries: number
    both: number
    verified: number
    active: number
    cities: string[]
  }
  coffee: {
    total: number
    singleOrigin: number
    blends: number
    decaf: number
    inStock: number
    featured: number
    averageSCAScore: number
    countries: string[]
    processings: string[]
  }
  lastUpdate: {
    cafeRoastery: string | null
    coffee: string | null
    source: 'manual' | 'crawl' | 'api' | 'csv'
  }
}