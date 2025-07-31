# Coffee Info Screen (Step1)

## 🎯 화면 개요

모든 모드의 첫 번째 단계로, 커피 기본 정보를 입력하는 화면입니다. 모드별로 필수/선택 필드가 다르게 구성됩니다.

### 화면 위치
- **라우팅**: `/record/step1?mode={cafe|homecafe|pro}`
- **진행률**: 25% (1/4)
- **이전 화면**: Mode Selection
- **다음 화면**: `/record/step2`

## 🏗️ 화면 구조 분석

### 7/29 체크포인트 기반 요구사항

#### 카페 모드 (CoffeeSetupView 문서 검토 완료)
```yaml
Required Fields:
  - 카페명: "atmosphere/vibe가 커피 경험의 일부"
  - 로스터리명: 필수
  - 커피명: 필수
  - 날짜: 기본값 오늘

Optional Fields:
  - 온도: HOT/ICED
  - 스페셜티 정보: "고급 옵션"으로 접기/펼치기
    - 품종 (Variety)
    - 가공방식 (Process)  
    - 고도 (Altitude)
```

#### 홈카페 모드
```yaml
Required Fields:
  - 로스터리명만 필수 (카페명 제거)
  - 커피명: 필수
  - 날짜: 기본값 오늘

Optional Fields:
  - 온도: HOT/ICED
  - 스페셜티 정보: 확장 가능
    - 원산지, 품종, 로스팅 레벨, 고도
```

#### 프로 모드
```yaml
Required Fields:
  - 로스터리명만 필수: 필수
  - 커피명: 필수
  - 농장명, 지역, 고도: 필수
  - 품종, 가공방식: 필수
  - 로스팅 날짜, 로스터 정보: 필수

Advanced Fields:
  - 로트 번호
  - 수확 날짜
  - 건조 방식
  - 스크린 사이즈
```

## 📊 데이터베이스 연동 설계

### 7/29 체크포인트 확정 사항

#### 카페/로스터리 DB 구조
```yaml
Separate Tables:
  - cafes: 카페 정보 테이블
  - roasteries: 로스터리 정보 테이블
  - cafe_roasteries: 카페-로스터리 관계 테이블

Auto-complete Features:
  - 카페 입력 시 자동완성
  - 카페 선택 시 → 해당 카페 취급 로스터리 필터링
  - 로스터리 선택 시 → 해당 로스터리 커피 리스트 필터링

User Contribution:
  - 새 카페/로스터리 추가 시 관리자 검증 플래그
  - 사용자 기여 데이터 품질 관리
```

#### 다국어 자동인식 시스템
```yaml
Bilingual Support:
  - 한글 입력: "이티오피아" → "Ethiopia" 매칭
  - 영문 입력: "Ethiopia" → 한글 표시 지원
  - 커피 이름 첫 두 글자부터 자동 필터링
  - DB 매칭 시 자동 정보 입력
```

## 🎨 UI/UX 설계

### Progressive Disclosure 적용

```yaml
Basic Level (항상 표시):
  - 커피 이름
  - 카페명/로스터리명 (모드별)
  - 날짜
  - 온도 선택

Advanced Level (접기/펼치기):
  - "더 자세한 정보" 토글 버튼
  - 원산지 정보
  - 품종 및 가공방식
  - 고도 및 추가 정보

Pro Level (Pro 모드만):
  - 전문가 정보 섹션
  - 농장 상세 정보
  - 로스팅 데이터
  - 품질 관리 정보
```

### 입력 필드 UX 패턴

#### 자동완성 입력 필드
```typescript
interface AutoCompleteField {
  type: 'cafe' | 'roastery' | 'coffee'
  placeholder: string
  required: boolean
  filterBy?: string // 상위 선택에 따른 필터링
  bilingualSupport: boolean
}

// 카페명 입력
<AutoCompleteInput
  type="cafe"
  placeholder="예: 블루보틀 청담점"
  required={mode === 'cafe' || mode === 'pro'}
  onSelect={(cafe) => {
    setSelectedCafe(cafe)
    // 해당 카페의 로스터리 리스트 로드
    loadRoasteriesByCafe(cafe.id)
  }}
  bilingualSupport={true}
/>

// 로스터리명 입력 (카페 선택 후 필터링됨)
<AutoCompleteInput
  type="roastery"
  placeholder="예: 커피리브레"
  required={true}
  filterBy={selectedCafe?.id}
  onSelect={(roastery) => {
    setSelectedRoastery(roastery)
    // 해당 로스터리의 커피 리스트 로드
    loadCoffeesByRoastery(roastery.id)
  }}
  bilingualSupport={true}
/>
```

#### 스페셜티 정보 확장 패널
```yaml
Collapsed State:
  - "더 자세한 정보 추가하기" 버튼
  - 현재 입력된 정보 요약 표시

Expanded State:
  - 원산지 (Origin) - 자동완성
  - 품종 (Variety) - 드롭다운 + 직접 입력
  - 가공방식 (Process) - 선택형 버튼
    - Washed, Natural, Honey, Anaerobic 등
  - 로스팅 레벨 (Roast Level) - 슬라이더
  - 고도 (Altitude) - 숫자 입력 + 단위 (m)
```

## 🔧 기술 구현

### Next.js 컴포넌트 구조

```typescript
// app/record/step1/page.tsx
export default function CoffeeInfoPage() {
  const searchParams = useSearchParams()
  const selectedMode = searchParams.get('mode') as CoffeeMode
  const { updateStep1 } = useCoffeeRecordStore()

  const [formData, setFormData] = useState<Step1Data>({
    coffee_name: '',
    cafe_name: '',
    roastery: '',
    date: new Date().toISOString().split('T')[0],
    temperature: 'hot',
    mode: selectedMode
  })

  const [expandedAdvanced, setExpandedAdvanced] = useState(false)
  const [cafeSuggestions, setCafeSuggestions] = useState<Cafe[]>([])
  const [roasterySuggestions, setRoasterySuggestions] = useState<Roastery[]>([])
  const [coffeeMatches, setCoffeeMatches] = useState<Coffee[]>([])

  // 카페 선택 시 로스터리 필터링
  const handleCafeSelect = async (cafe: Cafe) => {
    setFormData(prev => ({ ...prev, cafe_name: cafe.name }))
    const roasteries = await loadRoasteriesByCafe(cafe.id)
    setRoasterySuggestions(roasteries)
  }

  // 로스터리 선택 시 커피 필터링  
  const handleRoasterySelect = async (roastery: Roastery) => {
    setFormData(prev => ({ ...prev, roastery: roastery.name }))
    const coffees = await loadCoffeesByRoastery(roastery.id)
    setCoffeeMatches(coffees)
  }

  // 커피명 입력 시 자동 매칭
  const handleCoffeeNameChange = async (name: string) => {
    setFormData(prev => ({ ...prev, coffee_name: name }))
    
    if (name.length >= 2) {
      const matches = await searchCoffeeByName(name, {
        bilingualSupport: true,
        roasteryFilter: formData.roastery
      })
      setCoffeeMatches(matches)
    }
  }

  // 커피 매칭 시 자동 정보 입력
  const handleCoffeeMatch = (coffee: Coffee) => {
    setFormData(prev => ({
      ...prev,
      coffee_name: coffee.name,
      origin: coffee.origin,
      variety: coffee.variety,
      process: coffee.process,
      roast_level: coffee.roast_level,
      altitude: coffee.altitude
    }))
    setExpandedAdvanced(true) // 자동으로 확장하여 입력된 정보 표시
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}
    
    if (!formData.coffee_name.trim()) {
      errors.coffee_name = '커피 이름을 입력해주세요'
    }
    
    if (!formData.date) {
      errors.date = '날짜를 선택해주세요'
    }

    // 모드별 필수 검증
    if ((selectedMode === 'cafe' || selectedMode === 'pro') && !formData.cafe_name.trim()) {
      errors.cafe_name = '카페명을 입력해주세요'
    }

    if (selectedMode === 'pro') {
      if (!formData.farm_name?.trim()) {
        errors.farm_name = '농장명을 입력해주세요'
      }
      if (!formData.variety?.trim()) {
        errors.variety = '품종을 선택해주세요'
      }
      // ... 프로 모드 추가 검증
    }

    setErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleNext = () => {
    if (validateForm()) {
      updateStep1(formData)
      router.push('/record/step2')
    }
  }

  return (
    <ProtectedRoute>
      <div className="coffee-info-container">
        <StepHeader 
          step={1} 
          progress={25}
          mode={selectedMode}
          title="기본 정보"
          description="어떤 커피를 마셨는지 알려주세요"
        />

        <form className="coffee-info-form">
          {/* 기본 필드들 */}
          <BasicInfoSection
            mode={selectedMode}
            formData={formData}
            onCafeSelect={handleCafeSelect}
            onRoasterySelect={handleRoasterySelect}
            onCoffeeNameChange={handleCoffeeNameChange}
            cafeSuggestions={cafeSuggestions}
            roasterySuggestions={roasterySuggestions}
            coffeeMatches={coffeeMatches}
            onCoffeeMatch={handleCoffeeMatch}
          />

          {/* 고급 옵션 */}
          <AdvancedInfoSection
            mode={selectedMode}
            expanded={expandedAdvanced}
            onToggle={setExpandedAdvanced}
            formData={formData}
            onChange={setFormData}
          />

          {/* 안내 메시지 */}
          <HelpSection mode={selectedMode} />
        </form>

        <StepNavigation
          onPrevious={() => router.push('/mode-selection')}
          onNext={handleNext}
          canGoNext={validateForm()}
          nextLabel="다음 단계"
          nextPreview={getNextStepPreview(selectedMode)}
        />
      </div>
    </ProtectedRoute>
  )
}
```

### 자동완성 시스템 구현

```typescript
// hooks/useAutoComplete.ts
export function useAutoComplete(type: 'cafe' | 'roastery' | 'coffee') {
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  const search = useCallback(async (query: string, filters?: any) => {
    if (query.length < 2) {
      setSuggestions([])
      return
    }

    setLoading(true)
    try {
      const results = await supabaseClient
        .from(type === 'cafe' ? 'cafes' : type === 'roastery' ? 'roasteries' : 'coffees')
        .select('*')
        .or(`name.ilike.%${query}%,name_kr.ilike.%${query}%,name_en.ilike.%${query}%`)
        .limit(10)

      setSuggestions(results.data || [])
    } catch (error) {
      console.error('Auto-complete search error:', error)
    } finally {
      setLoading(false)
    }
  }, [type])

  return { suggestions, loading, search }
}

// utils/bilingualSearch.ts
export function createBilingualMatcher(query: string): string {
  // 한글 → 영문 매핑
  const koreanToEnglish: Record<string, string> = {
    '이티오피아': 'ethiopia',
    '케냐': 'kenya',
    '콜롬비아': 'colombia',
    '브라질': 'brazil',
    // ... 더 많은 매핑
  }

  // 영문 → 한글 매핑  
  const englishToKorean: Record<string, string> = {
    'ethiopia': '이티오피아',
    'kenya': '케냐',
    'colombia': '콜롬비아',
    'brazil': '브라질',
    // ... 더 많은 매핑
  }

  const lowerQuery = query.toLowerCase()
  
  // 한글 입력인 경우
  if (/[가-힣]/.test(query)) {
    const englishTerm = koreanToEnglish[lowerQuery]
    return englishTerm ? `${query}|${englishTerm}` : query
  }
  
  // 영문 입력인 경우
  const koreanTerm = englishToKorean[lowerQuery]
  return koreanTerm ? `${query}|${koreanTerm}` : query
}
```

## 📊 데이터 유효성 검증

### 실시간 검증 시스템

```typescript
// validation/coffeeInfoValidation.ts
export const coffeeInfoValidationRules: Record<CoffeeMode, ValidationRules> = {
  cafe: {
    required: ['coffee_name', 'cafe_name', 'roastery', 'date'],
    optional: ['temperature', 'origin', 'variety', 'process', 'altitude'],
    custom: [
      {
        field: 'cafe_name',
        rule: (value) => value.length >= 2,
        message: '카페명을 2글자 이상 입력해주세요'
      }
    ]
  },
  
  homecafe: {
    required: ['coffee_name', 'roastery', 'date'],
    optional: ['temperature', 'origin', 'variety', 'roast_level', 'altitude'],
    custom: []
  },
  
  pro: {
    required: [
      'coffee_name', 'cafe_name', 'roastery', 'date',
      'farm_name', 'region', 'altitude', 'variety', 'process', 'roast_date'
    ],
    optional: ['lot_number', 'harvest_date', 'drying_method', 'screen_size'],
    custom: [
      {
        field: 'altitude',
        rule: (value) => value >= 0 && value <= 3000,
        message: '고도는 0-3000m 사이여야 합니다'
      },
      {
        field: 'roast_date',
        rule: (value) => new Date(value) <= new Date(),
        message: '로스팅 날짜는 오늘보다 이전이어야 합니다'
      }
    ]
  }
}
```

## 📈 성과 지표

### UX 메트릭
- **입력 완료 시간**: 평균 2-3분 (모드별)
- **자동완성 사용률**: 70% 이상
- **고급 옵션 확장률**: Cafe 20%, HomeCafe 40%, Pro 90%
- **입력 오류율**: 5% 이하

### 데이터 품질
- **자동 매칭 정확도**: 85% 이상
- **중복 데이터 생성률**: 10% 이하  
- **사용자 기여 데이터**: 관리자 승인 대기

---

**📅 문서 생성**: 2025-07-31  
**체크포인트 기반**: 7/29 CoffeeSetupView 문서 검토 완료  
**구현 상태**: v1.0.0-rc ✅ **완료** - Progressive Disclosure, 모드별 필수 필드, 온도 선택 구현  
**최종 업데이트**: 2025-07-31 - 실제 구현 사항 반영