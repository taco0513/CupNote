/**
 * 커피 데이터베이스 - 한국 주요 로스터리 원두 정보
 * OCR 실패 시 자동완성/검색 제공
 */

export interface CoffeeData {
  id: string
  coffeeName: string
  roasterName: string
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  altitude?: string
  notes?: string
  keywords: string[] // 검색용 키워드
}

// 한국 주요 로스터리 커피 데이터
export const COFFEE_DATABASE: CoffeeData[] = [
  // 프릳츠
  {
    id: 'fritz-001',
    coffeeName: '에티오피아 예가체프',
    roasterName: '프릳츠',
    origin: '에티오피아',
    variety: 'Heirloom',
    processing: 'Washed',
    roastLevel: 'Light',
    altitude: '1,950-2,200m',
    notes: '플로럴, 시트러스, 베르가못',
    keywords: ['프릳츠', 'fritz', '예가체프', 'yirgacheffe', '에티오피아']
  },
  {
    id: 'fritz-002',
    coffeeName: '과테말라 안티구아',
    roasterName: '프릳츠',
    origin: '과테말라',
    variety: 'Bourbon, Caturra',
    processing: 'Washed',
    roastLevel: 'Medium',
    altitude: '1,500-1,700m',
    notes: '초콜릿, 오렌지, 브라운슈가',
    keywords: ['프릳츠', 'fritz', '안티구아', 'antigua', '과테말라']
  },
  
  // 테라로사
  {
    id: 'terarosa-001',
    coffeeName: '콜롬비아 게이샤',
    roasterName: '테라로사',
    origin: '콜롬비아',
    variety: 'Geisha',
    processing: 'Natural',
    roastLevel: 'Light',
    altitude: '1,900m',
    notes: '자스민, 복숭아, 와인',
    keywords: ['테라로사', 'terarosa', '게이샤', 'geisha', '콜롬비아']
  },
  {
    id: 'terarosa-002',
    coffeeName: '케냐 AA',
    roasterName: '테라로사',
    origin: '케냐',
    variety: 'SL28, SL34',
    processing: 'Washed',
    roastLevel: 'Light-Medium',
    altitude: '1,700-1,900m',
    notes: '블랙커런트, 와인, 토마토',
    keywords: ['테라로사', 'terarosa', '케냐', 'kenya', 'AA']
  },
  
  // 앤트러사이트
  {
    id: 'anthracite-001',
    coffeeName: '파나마 게이샤',
    roasterName: '앤트러사이트',
    origin: '파나마',
    variety: 'Geisha',
    processing: 'Natural',
    roastLevel: 'Light',
    altitude: '1,700m',
    notes: '자스민, 베르가못, 열대과일',
    keywords: ['앤트러사이트', 'anthracite', '파나마', 'panama', '게이샤']
  },
  
  // 센터커피
  {
    id: 'center-001',
    coffeeName: '브라질 옐로우 버번',
    roasterName: '센터커피',
    origin: '브라질',
    variety: 'Yellow Bourbon',
    processing: 'Pulped Natural',
    roastLevel: 'Medium',
    altitude: '1,100-1,200m',
    notes: '헤이즐넛, 초콜릿, 카라멜',
    keywords: ['센터커피', 'center', '브라질', 'brazil', '옐로우버번']
  },
  
  // 커피몽타주
  {
    id: 'montage-001',
    coffeeName: '코스타리카 타라주',
    roasterName: '커피몽타주',
    origin: '코스타리카',
    variety: 'Caturra, Catuai',
    processing: 'Honey',
    roastLevel: 'Medium',
    altitude: '1,500-1,900m',
    notes: '오렌지, 브라운슈가, 밀크초콜릿',
    keywords: ['커피몽타주', 'montage', '코스타리카', 'costarica', '타라주']
  },
  
  // 리프커피
  {
    id: 'leaf-001',
    coffeeName: '에티오피아 구지',
    roasterName: '리프커피',
    origin: '에티오피아',
    variety: 'Heirloom',
    processing: 'Natural',
    roastLevel: 'Light',
    altitude: '1,900-2,100m',
    notes: '블루베리, 와인, 다크초콜릿',
    keywords: ['리프커피', 'leaf', '구지', 'guji', '에티오피아']
  },
  
  // 나무사이로
  {
    id: 'namusairo-001',
    coffeeName: '르완다 스카이힐',
    roasterName: '나무사이로',
    origin: '르완다',
    variety: 'Red Bourbon',
    processing: 'Washed',
    roastLevel: 'Light-Medium',
    altitude: '1,700-2,000m',
    notes: '크랜베리, 브라운슈가, 시나몬',
    keywords: ['나무사이로', 'namusairo', '르완다', 'rwanda', '스카이힐']
  },
  
  // 커피리브레
  {
    id: 'libre-001',
    coffeeName: '인도네시아 만델링',
    roasterName: '커피리브레',
    origin: '인도네시아',
    variety: 'Typica, Caturra',
    processing: 'Semi-Washed',
    roastLevel: 'Medium-Dark',
    altitude: '1,100-1,600m',
    notes: '허브, 다크초콜릿, 흙내음',
    keywords: ['커피리브레', 'libre', '만델링', 'mandheling', '인도네시아']
  }
]

/**
 * 커피 검색 서비스
 */
export class CoffeeSearchService {
  /**
   * 키워드로 커피 검색
   */
  static search(query: string): CoffeeData[] {
    const normalizedQuery = query.toLowerCase().trim()
    
    if (!normalizedQuery) return []
    
    return COFFEE_DATABASE.filter(coffee => {
      // 커피 이름 매칭
      if (coffee.coffeeName.toLowerCase().includes(normalizedQuery)) return true
      
      // 로스터리 이름 매칭
      if (coffee.roasterName.toLowerCase().includes(normalizedQuery)) return true
      
      // 원산지 매칭
      if (coffee.origin?.toLowerCase().includes(normalizedQuery)) return true
      
      // 키워드 매칭
      return coffee.keywords.some(keyword => 
        keyword.toLowerCase().includes(normalizedQuery)
      )
    })
  }
  
  /**
   * 자동완성 제안
   */
  static getSuggestions(partial: string): string[] {
    const results = this.search(partial)
    
    // 커피 이름과 로스터리 조합으로 제안
    return results.map(coffee => 
      `${coffee.coffeeName} - ${coffee.roasterName}`
    ).slice(0, 5) // 최대 5개 제안
  }
  
  /**
   * ID로 커피 정보 가져오기
   */
  static getById(id: string): CoffeeData | undefined {
    return COFFEE_DATABASE.find(coffee => coffee.id === id)
  }
  
  /**
   * 로스터리별 커피 목록
   */
  static getByRoaster(roasterName: string): CoffeeData[] {
    return COFFEE_DATABASE.filter(coffee => 
      coffee.roasterName === roasterName
    )
  }
  
  /**
   * OCR 결과와 매칭
   */
  static matchFromOCR(ocrText: string): CoffeeData | null {
    const lines = ocrText.toLowerCase().split('\n')
    
    // 각 라인에서 매칭 시도
    for (const line of lines) {
      const matches = this.search(line)
      if (matches.length > 0) {
        return matches[0] // 가장 관련성 높은 결과 반환
      }
    }
    
    return null
  }
}