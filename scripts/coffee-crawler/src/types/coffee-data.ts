/**
 * Coffee Data Types for Web Crawling and OCR Training
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

export interface CoffeeProductData {
  // 기본 식별 정보
  id?: string                  // UUID (Supabase 생성)
  coffeeName: string          // "El Diviso - Ombligon Decaf"
  roastery: string            // "Blue Bottle Coffee"
  roasteryUrl: string         // "bluebottlecoffee.com"
  
  // 원산지 정보
  origin: string              // "Colombia" (필수)
  region?: string             // "Bruselas, Pitalito-Huila"
  farm?: string               // "Granja Paraiso 92"
  producer?: string           // "Fernando Imbachi"
  
  // 커피 특성
  variety?: string            // "Red Bourbon", "Geisha"
  processing?: string         // "Double anaerobic + Thermal shock"
  roastLevel?: string         // "Light", "Medium", "Dark"
  altitude?: number           // 1950 (미터)
  harvestYear?: number        // 2024
  
  // 테이스팅 정보
  tastingNotes: string[]      // ["히비스커스 차", "리치", "딸기"]
  roasterNotes?: string       // 로스터의 추가 설명
  cuppingScore?: number       // 85.5 (SCA 점수)
  
  // 상품 정보
  price?: number              // 28000 (원화 기준)
  currency?: string           // "KRW", "USD"
  packageSize?: string        // "200g", "12oz"
  availability?: 'available' | 'sold_out' | 'limited'
  
  // 이미지 정보 (OCR 학습용)
  productUrl: string          // 원본 페이지 URL
  imageUrls: string[]         // 모든 제품 이미지
  labelImageUrl?: string      // 라벨 이미지 (OCR 대상)
  packageImageUrls?: string[] // 패키지 이미지들
  
  // 메타데이터
  crawledAt: Date
  updatedAt?: Date
  source: DataSource
  verified: boolean           // 데이터 검증 완료 여부
  qualityScore: number        // 0-100 (데이터 품질 점수)
}

export type DataSource = 'web_crawled' | 'user_feedback' | 'manual_entry'

export interface RoasteryConfig {
  id: string                  // "unspecialty"
  name: string               // "언스페셜티"
  url: string                // "unspecialty.com"
  country: string            // "KR", "US"
  type: RoasteryType
  
  // 크롤링 설정
  crawlingConfig: {
    baseUrl: string          // "https://unspecialty.com"
    productListPath: string  // "/products"
    productUrlPattern: RegExp // 제품 URL 패턴
    requestDelay: number     // 요청 간격 (ms)
    maxRetries: number       // 최대 재시도
  }
  
  // 선택자 설정
  selectors: {
    productLinks: string     // 제품 링크 선택자
    coffeeName: string       // 커피명 선택자
    origin: string           // 원산지 선택자
    price: string            // 가격 선택자
    tastingNotes: string     // 테이스팅 노트 선택자
    images: string           // 이미지 선택자
    labelImage?: string      // 라벨 이미지 특별 선택자
  }
  
  // 파싱 규칙
  parsingRules: {
    priceExtractor: RegExp   // 가격 추출 정규식
    originExtractor: RegExp  // 원산지 추출 정규식
    notesParser: 'comma_separated' | 'line_separated' | 'custom'
  }
  
  // 메타 정보
  isActive: boolean
  lastCrawled?: Date
  totalProducts?: number
  successRate?: number       // 크롤링 성공률 (0-1)
}

export type RoasteryType = 'single_roaster' | 'marketplace' | 'subscription'

export interface CrawlingResult {
  roasteryId: string
  success: boolean
  totalProducts: number
  successfulProducts: number
  failedProducts: number
  errors: CrawlingError[]
  duration: number           // 실행 시간 (ms)
  timestamp: Date
}

export interface CrawlingError {
  url: string
  error: string
  retries: number
  timestamp: Date
}

export interface OCRTrainingData {
  id: string
  imageUrl: string
  groundTruth: {
    coffeeName: string
    origin: string
    roastery: string
    tastingNotes?: string
    processing?: string
    variety?: string
    roastLevel?: string
  }
  imageMetadata: {
    width: number
    height: number
    format: string
    fileSize: number
  }
  source: DataSource
  verified: boolean
  createdAt: Date
}

export interface DataQualityMetrics {
  totalRecords: number
  verifiedRecords: number
  withLabelImages: number
  withTastingNotes: number
  duplicates: number
  averageQualityScore: number
  lastUpdated: Date
}

// 유틸리티 타입들
export interface CrawlerStatus {
  isRunning: boolean
  currentRoastery?: string
  progress: {
    current: number
    total: number
    percentage: number
  }
  startedAt?: Date
  estimatedCompletion?: Date
}

export interface DatabaseConfig {
  supabaseUrl: string
  supabaseKey: string
  tables: {
    coffeeProducts: string    // 'coffee_products'
    roasteries: string        // 'roasteries'
    crawlingLogs: string      // 'crawling_logs'
    ocrTrainingData: string   // 'ocr_training_data'
  }
}