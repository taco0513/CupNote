# Taste Evaluation Screen (Step2)

## 🎯 화면 개요

모드별로 완전히 다른 화면 구성을 가지는 핵심 단계입니다. 각 모드의 특성에 맞는 맛 평가와 설정을 진행합니다.

### 화면 위치
- **라우팅**: `/record/step2`
- **진행률**: 50% (2/4)
- **이전 화면**: Coffee Info (Step1)
- **다음 화면**: Taste & Sensory (Step3)

## 🎨 모드별 화면 구성

### ☕ Cafe Mode: 간단한 맛 기록

#### 7/29 체크포인트 반영사항
> "간단한 맛 기록, 복잡하지 않은 기본 평가"

```yaml
Screen Focus:
  - 빠른 입력 (3분 목표)
  - 직관적 평가
  - 최소한의 선택

Content Structure:
  전체 만족도:
    - 별점 시스템 (1-5점)
    - 큰 터치 타겟
    - 즉시 시각적 피드백
  
  빠른 향미 태그:
    - 최대 5개 선택
    - 카테고리별 그룹핑
    - 원터치 선택/해제
  
  온도 선택:
    - HOT/ICED 토글
    - 감각 인지에 미치는 영향 반영
```

#### UI/UX 상세 설계

```typescript
interface CafeModeStep2 {
  overall_rating: number        // 1-5 별점
  quick_flavor_tags: string[]   // 최대 5개
  temperature: 'hot' | 'iced'
  drinking_context?: string     // 선택적: 언제, 어디서
}

// 빠른 향미 태그 카테고리
const QUICK_FLAVOR_CATEGORIES = {
  fruity: {
    label: '과일',
    icon: '🍎',
    tags: ['사과', '오렌지', '베리', '석류', '체리', '레몬']
  },
  nutty: {
    label: '견과',
    icon: '🥜', 
    tags: ['아몬드', '헤이즐넛', '호두', '피칸']
  },
  sweet: {
    label: '단과',
    icon: '🍫',
    tags: ['초콜릿', '캐러멜', '바닐라', '꿀', '메이플']
  },
  spicy: {
    label: '향신료',
    icon: '🌶️',
    tags: ['계피', '정향', '생강', '후추']
  }
}
```

### 🏠 HomeCafe Mode: 추출 레시피 설정

#### 7/29 체크포인트 확정사항 
> "드리퍼 선택: V60, Kalita Wave, Origami, April (4개로 축소)"  
> "원두량 입력: 직접 입력(키패드 방식), 기본값 20g"

```yaml
Screen Focus:
  - 레시피와 맛의 연결
  - 정확한 측정값 입력
  - 재현 가능한 데이터

Dripper Selection:
  - 4개 핵심 드리퍼만
  - V60 ⭕, Kalita Wave 〰️, Origami 🌸, April 🌙
  - 그리드 레이아웃, 터치 최적화

Recipe Settings:
  - 원두량: 다이얼 방식 (10-50g, 기본 20g)
  - 비율 프리셋: 1:15, 1:15.5, 1:16, 1:16.5, 1:17, 1:17.5, 1:18
  - 물량: 자동 계산 및 실시간 표시
  - 물온도: 직접 입력 (80-100°C, 기본 92°C)

Timer System:
  - 시작/정지/리셋 기능
  - 랩타임 기록 (1차, 2차, 3차 붓기)
  - 총 추출 시간 자동 저장

Personal Recipe:
  - "나의 커피" 저장/불러오기
  - localStorage 기반 개인 설정
```

#### HomeCafe 컴포넌트 구조

```typescript
interface HomeCafeModeStep2 {
  dripper: 'v60' | 'kalita' | 'origami' | 'april'
  recipe: {
    coffee_amount: number     // g
    water_amount: number      // ml (자동 계산)
    ratio: number            // 15, 15.5, 16, 16.5, 17, 17.5, 18
    water_temp: number       // °C
    brew_time?: number       // 초 (타이머 사용 시)
    lap_times?: number[]     // 랩타임 배열
  }
  equipment_notes?: string   // 장비 특이사항
  quick_recipe_notes?: string // 간단한 추출 메모
}

// 드리퍼 옵션 (Vue.js에서 4개로 축소)
const DRIPPERS = [
  { 
    id: 'v60', 
    name: 'V60', 
    icon: '⭕',
    description: '밝고 깔끔한 맛',
    tips: '원형 모션으로 천천히'
  },
  { 
    id: 'kalita', 
    name: 'Kalita Wave', 
    icon: '〰️',
    description: '균형잡힌 바디감',
    tips: '중앙부터 바깥쪽으로'
  },
  { 
    id: 'origami', 
    name: 'Origami', 
    icon: '🌸',
    description: '복합적인 향미',
    tips: '필터 종류에 따라 달라짐'
  },
  { 
    id: 'april', 
    name: 'April', 
    icon: '🌙',
    description: '부드럽고 깊은 맛',
    tips: '긴 추출 시간 권장'
  }
]

// 비율 프리셋 (7/29 체크포인트: 7개 유지)
const RATIO_PRESETS = [
  { value: 15, label: '1:15', description: '진한 맛', color: 'red' },
  { value: 15.5, label: '1:15.5', description: '진함', color: 'orange' },
  { value: 16, label: '1:16', description: '균형', color: 'yellow' },
  { value: 16.5, label: '1:16.5', description: '균형', color: 'green' },
  { value: 17, label: '1:17', description: '밝은 맛', color: 'blue' },
  { value: 17.5, label: '1:17.5', description: '밝음', color: 'indigo' },
  { value: 18, label: '1:18', description: '가벼운 맛', color: 'purple' }
]
```

### 🔬 Pro Mode: SCA 표준 측정

#### 7/29 이후 구현된 SCA 표준 필드

```yaml
Screen Focus:
  - SCA 표준 준수
  - 정밀한 측정값
  - 전문가 수준 평가

SCA Quality Measurement:
  - TDS 측정값 입력 (%)
  - 추출수율 자동 계산
  - SCA 기준 상태 표시
    - 미추출 (<18%): 빨강색
    - 적정 (18-22%): 초록색  
    - 과추출 (>22%): 주황색

Professional Brewing Protocol:
  - 추출 방법: Pour Over, Immersion, Pressure, Cold Brew
  - 분쇄도: 1-10 스케일
  - 블루밍 시간, 총 추출 시간
  - 물 품질: TDS ppm, pH 수치
  - 장비 정보 및 특별 설정

Real-time Calculation:
  - TDS ↔ 추출수율 상호 계산
  - SCA 기준 대비 실시간 상태 표시
  - 품질 등급 자동 판정
```

#### Pro Mode 컴포넌트 구조

```typescript
interface ProModeStep2 {
  // SCA 표준 측정
  tds_measurement?: {
    tds_value: number              // %
    extraction_yield: number       // % (자동 계산)
    yield_status: 'under' | 'optimal' | 'over'
  }
  
  // 전문 추출 프로토콜
  brewing_protocol: {
    extraction_method: 'pourover' | 'immersion' | 'pressure' | 'cold_brew'
    grind_size: number            // 1-10
    bloom_time: number            // 초
    total_brew_time: string       // "2:30" 형식
    flow_rate?: number            // g/s
    temperature_drop?: number     // °C
  }
  
  // 물 품질
  water_quality: {
    tds_ppm: number
    ph: number
  }
  
  // 장비 및 설정
  equipment_setup: {
    grinder_model?: string
    filter_type?: string
    special_notes?: string
  }
}

// 추출수율 계산 로직 (실제 구현됨)
const calculateExtractionYield = (tds: number, waterAmount: number, coffeeAmount: number): number => {
  return (tds * waterAmount) / coffeeAmount
}

// SCA 기준 상태 판정
const getYieldStatus = (yield: number): 'under' | 'optimal' | 'over' => {
  if (yield < 18) return 'under'
  if (yield > 22) return 'over'
  return 'optimal'
}
```

## 🔧 기술 구현

### React 컴포넌트 분기 처리

```typescript
// app/record/step2/page.tsx
export default function Step2Page() {
  const { currentSession } = useCoffeeRecordStore()
  const mode = currentSession.mode

  // 모드별 컴포넌트 렌더링
  const renderModeSpecificContent = () => {
    switch (mode) {
      case 'cafe':
        return <CafeModeStep2 />
      case 'homecafe':
        return <HomeCafeModeStep2 />
      case 'pro':
        return <ProModeStep2 />
      default:
        return <div>알 수 없는 모드입니다.</div>
    }
  }

  return (
    <ProtectedRoute>
      <div className="step2-container">
        <StepHeader 
          step={2} 
          progress={50}
          mode={mode}
          title={getStepTitle(mode)}
          description={getStepDescription(mode)}
        />
        
        <div className="step2-content">
          {renderModeSpecificContent()}
        </div>
        
        <StepNavigation
          onPrevious={() => router.push('/record/step1')}
          onNext={() => router.push('/record/step3')}
          canGoNext={validateCurrentStep()}
          nextPreview={getNextStepPreview(mode)}
        />
      </div>
    </ProtectedRoute>
  )
}

const getStepTitle = (mode: CoffeeMode): string => {
  switch (mode) {
    case 'cafe': return '간단한 맛 기록'
    case 'homecafe': return '추출 레시피 설정'
    case 'pro': return 'SCA 표준 측정'
    default: return '맛 평가'
  }
}
```

### HomeCafe 타이머 시스템

```typescript
// components/HomeCafeTimer.tsx
export function HomeCafeTimer() {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [lapTimes, setLapTimes] = useState<number[]>([])
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const startTimer = () => {
    setIsRunning(true)
    const startTime = Date.now() - elapsedTime * 1000
    
    intervalRef.current = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000))
    }, 100)
  }

  const stopTimer = () => {
    setIsRunning(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    // 랩타임 기록
    if (elapsedTime > 0) {
      setLapTimes(prev => [...prev, elapsedTime])
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setElapsedTime(0)
    setLapTimes([])
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="timer-container">
      <div className="timer-display">
        <span className="timer-time">{formatTime(elapsedTime)}</span>
      </div>
      
      <div className="timer-controls">
        {!isRunning ? (
          <button onClick={startTimer} className="timer-btn start">
            시작
          </button>
        ) : (
          <button onClick={stopTimer} className="timer-btn stop">
            정지
          </button>
        )}
        
        {elapsedTime > 0 && (
          <button onClick={resetTimer} className="timer-btn reset">
            리셋
          </button>
        )}
      </div>

      {lapTimes.length > 0 && (
        <div className="lap-times">
          {lapTimes.map((lap, index) => (
            <div key={index} className="lap-time">
              <span>Lap {index + 1}:</span>
              <span>{formatTime(lap)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Pro Mode TDS 계산기

```typescript
// components/TDSCalculator.tsx
export function TDSCalculator() {
  const { currentSession, updateStep2 } = useCoffeeRecordStore()
  const [tdsValue, setTdsValue] = useState<number>(0)
  const [extractionYield, setExtractionYield] = useState<number>(0)

  const coffeeAmount = 20 // 기본값, 실제로는 Step1에서 가져옴
  const waterAmount = 320 // 기본값, 실제로는 비율 계산값

  // TDS 값 변경 시 추출수율 자동 계산
  useEffect(() => {
    if (tdsValue > 0) {
      const yield = (tdsValue * waterAmount) / coffeeAmount
      setExtractionYield(Math.round(yield * 100) / 100)
    }
  }, [tdsValue, waterAmount, coffeeAmount])

  // 추출수율 상태 판정
  const getYieldStatus = (): 'under' | 'optimal' | 'over' => {
    if (extractionYield < 18) return 'under'
    if (extractionYield > 22) return 'over'
    return 'optimal'
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'under': return 'text-red-600 bg-red-50'
      case 'optimal': return 'text-green-600 bg-green-50'
      case 'over': return 'text-orange-600 bg-orange-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getStatusMessage = (status: string): string => {
    switch (status) {
      case 'under': return '미추출 - 분쇄도를 더 곱게 하거나 시간을 늘려보세요'
      case 'optimal': return 'SCA 권장 범위 - 좋은 추출입니다!'
      case 'over': return '과추출 - 분쇄도를 굵게 하거나 시간을 줄여보세요'
      default: return ''
    }
  }

  const yieldStatus = getYieldStatus()

  const handleSave = () => {
    updateStep2({
      pro_data: {
        ...currentSession.pro_data,
        tds: tdsValue,
        extraction_yield: extractionYield,
        yield_status: yieldStatus
      }
    })
  }

  return (
    <div className="tds-calculator">
      <h3 className="text-lg font-medium mb-4">SCA 표준 품질 측정</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            TDS 측정값 (%)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={tdsValue}
            onChange={(e) => setTdsValue(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="1.35"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            추출수율 (자동 계산)
          </label>
          <div className="px-3 py-2 bg-gray-50 border rounded-lg text-right">
            {extractionYield.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 상태 표시 */}
      {extractionYield > 0 && (
        <div className={`p-4 rounded-lg ${getStatusColor(yieldStatus)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">
              추출 상태: {yieldStatus === 'under' ? '미추출' : yieldStatus === 'optimal' ? '적정' : '과추출'}
            </span>
            <span className="text-sm">
              SCA 권장: 18-22%
            </span>
          </div>
          <p className="text-sm">
            {getStatusMessage(yieldStatus)}
          </p>
        </div>
      )}

      <button
        onClick={handleSave}
        className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
      >
        측정값 저장
      </button>
    </div>
  )
}
```

## 📊 성과 지표

### 모드별 완료 시간 목표
- **Cafe Mode**: 평균 2분 이내
- **HomeCafe Mode**: 평균 5-8분 (타이머 사용 시 추출 시간 포함)
- **Pro Mode**: 평균 6-10분 (측정 시간 포함)

### 기능 사용률
- **HomeCafe 타이머 사용률**: 60% 이상
- **Pro Mode TDS 입력률**: 40% 이상 (선택사항)
- **레시피 저장률**: 50% 이상

---

**📅 문서 생성**: 2025-07-31  
**체크포인트 기반**: 7/29 드리퍼 4개 축소, SCA 표준 필드 구현  
**구현 상태**: v1.0.0-rc, 모드별 차별화 완료