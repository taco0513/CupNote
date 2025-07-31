# HomeCafe Mode Workflow - 홈카페 모드 워크플로우

> 홈카페에서 레시피 실험과 상세 기록을 위한 8단계 워크플로우

## 📱 워크플로우 개요

**목적**: 홈카페에서 드리퍼, 레시피, 추출 변수를 정밀하게 기록  
**대상**: 홈카페 애호가, 커피 추출 실험자  
**소요시간**: 5-8분  
**특징**: 레시피 중심, 다이얼 제어, 개인화된 추출 시스템

## 🔄 8단계 워크플로우

### 1단계: ModeSelectionScreen

```
진입 → HomeCafe Mode 선택 → 다음
```

- **입력**: 모드 선택 (HomeCafe)
- **소요시간**: 5초
- **다음 화면**: CoffeeInfoScreen

### 2단계: CoffeeInfoScreen

```
커피정보 → 원두 상세정보 → 온도선택 → 다음
```

- **필수 입력**: 커피명, 원산지, 로스팅 레벨, 온도(Hot 기본)
- **선택 입력**: 로스터, 품종, 가공방식, 로스팅 날짜
- **특징**: 홈카페는 원두 정보가 더 상세함
- **소요시간**: 60-90초
- **다음 화면**: HomeCafeScreen

### 3단계: HomeCafeScreen ⭐ **핵심 화면**

```
드리퍼 선택 → 다이얼 제어로 원두량 조정 → 비율 프리셋 선택 → 레시피 설정 → 다음
```

- **드리퍼 선택**: V60, Kalita Wave, Chemex 등 10가지
- **다이얼 제어**: ±1g 정밀 원두량 조정 (15-30g)
- **비율 프리셋**: 1:15, 1:15.5, 1:16, 1:16.5, 1:17, 1:17.5, 1:18 (7개 버튼)
- **실시간 계산**: 원두량 변경시 물량 자동 계산
- **개인화**: "나의 커피" 레시피 저장/불러오기
- **소요시간**: 90-120초
- **다음 화면**: UnifiedFlavorScreen

### 4단계: UnifiedFlavorScreen

```
카테고리 탐색 → 향미 선택 (최대 5개) → 다음
```

- **입력**: 향미 선택 (최대 5개)
- **카테고리**: Fruity, Nutty, Chocolate, Spicy, Floral, Other
- **HomeCafe 특징**: 원두별 기대 향미 힌트 제공
- **소요시간**: 60-90초
- **다음 화면**: SensoryExpressionScreen

### 5단계: SensoryExpressionScreen

```
카테고리별 감각 표현 선택 (최대 3개/카테고리) → 다음
```

- **입력**: 한국어 감각 표현 (6개 카테고리, 44개 표현)
- **제한**: 카테고리당 최대 3개
- **HomeCafe 특징**: 추출 변수와 연관된 표현 강조
- **소요시간**: 60-120초
- **다음 화면**: PersonalCommentScreen

### 6단계: PersonalCommentScreen

```
개인 코멘트 → 실험 노트 (HomeCafe 전용) → 다음
```

- **입력**: 자유 텍스트 (최대 200자)
- **HomeCafe 전용**: 실험 노트 섹션 추가
  - 추출 시간 기록
  - 물온도 실측값
  - 특이사항 메모
- **소요시간**: 60-90초
- **다음 화면**: RoasterNotesScreen

### 7단계: RoasterNotesScreen

```
로스터 노트 입력 → Match Score 계산 → 완료
```

- **입력**: 로스터/원두 포장지 테이스팅 노트
- **처리**: 실시간 Match Score 계산
- **HomeCafe 특징**: 원두 포장 정보 OCR 지원 (Phase 2)
- **소요시간**: 30-60초
- **다음 화면**: ResultScreen

### 8단계: ResultScreen

```
결과 확인 → 레시피 저장 → 홈으로
```

- **표시**: 커피 정보, 레시피 요약, 향미/표현, Match Score
- **HomeCafe 특징**: 레시피 성공도 평가 및 "나의 커피" 저장 제안
- **액션**: 레시피 저장, 공유, 즐겨찾기, 홈 복귀
- **소요시간**: 60-90초

## 🚫 제외되는 화면들

### ExperimentalDataScreen - 건너뛰기

- **이유**: HomeCafe에서는 TDS 측정 등 실험실 수준 데이터 불필요
- **대신**: HomeCafeScreen에서 실용적인 레시피 정보에 집중

### SensorySliderScreen - 건너뛰기

- **이유**: 홈카페는 감각적 평가보다 레시피 최적화 중심
- **대신**: UnifiedFlavorScreen에서 바로 SensoryExpressionScreen으로

## 💾 데이터 수집 명세

### 필수 데이터

```typescript
interface HomeCafeModeData {
  // 기본 정보
  mode: 'homecafe'
  coffee_name: string
  origin: string
  roast_level: string
  temperature: 'hot' | 'iced'

  // HomeCafe 핵심 데이터
  dripper: PouroverDripper // V60, Kalita, Chemex 등
  coffee_amount: number // 원두량 (g)
  water_amount: number // 물량 (ml)
  ratio: number // 추출 비율 (1:15 - 1:18)

  // 향미 & 감각
  selected_flavors: FlavorNote[] // 최대 5개
  sensory_expressions: SensoryExpressions // 6개 카테고리

  // 코멘트 & 실험 노트
  personal_comment?: string // 일반 코멘트
  experiment_notes: ExperimentNotes // HomeCafe 전용
  roaster_notes?: string // Match Score 계산용

  // 계산 결과
  match_score?: MatchScore // 로스터 노트 있는 경우
}

interface ExperimentNotes {
  brew_time?: number // 실제 추출 시간 (초)
  water_temp?: number // 실측 물온도 (°C)
  grind_size?: string // 분쇄도 (coarse/medium/fine)
  pour_technique?: PourTechnique // 푸어링 기법
  bloom_time?: number // 블룸 시간 (초)
  special_notes?: string // 특이사항 메모
}

enum PouroverDripper {
  V60 = 'v60',
  KALITA_WAVE = 'kalita_wave',
  CHEMEX = 'chemex',
  ORIGAMI = 'origami',
  CLEVER = 'clever',
  AEROPRESS = 'aeropress',
  FRENCH_PRESS = 'french_press',
  SYPHON = 'syphon',
  COLD_BREW = 'cold_brew',
  ESPRESSO = 'espresso',
}

enum PourTechnique {
  CENTER_POUR = 'center_pour',
  SPIRAL_POUR = 'spiral_pour',
  PULSE_POUR = 'pulse_pour',
  CONTINUOUS_POUR = 'continuous_pour',
  BYPASS_POUR = 'bypass_pour',
}
```

### 개인화 레시피 데이터

```typescript
interface PersonalRecipe {
  recipe_name: string // "나의 아침 커피"
  dripper: PouroverDripper
  coffee_amount: number
  water_amount: number
  ratio: number
  grind_size?: string
  water_temp?: number
  brew_time?: number
  pour_technique?: PourTechnique

  // 메타데이터
  created_at: Date
  last_used: Date
  usage_count: number
  success_rate: number // 만족도 기반
  tags: string[] // ["morning", "light roast"]
}
```

## 🔄 네비게이션 로직

### 조건부 네비게이션

```typescript
const navigateFromCoffeeInfo = () => {
  const { mode } = tastingStore

  if (mode === 'homecafe') {
    // HomeCafe 전용 화면으로 이동
    navigation.navigate('HomeCafe')
  }
}

const navigateFromHomeCafe = () => {
  // ExperimentalData 건너뛰고 UnifiedFlavor로
  navigation.navigate('UnifiedFlavor')
}

const navigateFromUnifiedFlavor = () => {
  const { mode } = tastingStore

  if (mode === 'homecafe') {
    // SensorySlider 건너뛰고 SensoryExpression으로
    navigation.navigate('SensoryExpression')
  }
}
```

### 진행률 계산

```typescript
const getHomeCafeModeProgress = (currentScreen: string): number => {
  const screens = [
    'ModeSelection', // 12.5%
    'CoffeeInfo', // 25%
    'HomeCafe', // 37.5%
    'UnifiedFlavor', // 50%
    'SensoryExpression', // 62.5%
    'PersonalComment', // 75%
    'RoasterNotes', // 87.5%
    'Result', // 100%
  ]

  const currentIndex = screens.indexOf(currentScreen)
  return Math.round(((currentIndex + 1) / screens.length) * 100)
}
```

## 🎛️ HomeCafe 다이얼 제어 시스템

### 다이얼 제어 UI

```typescript
interface DialControlProps {
  value: number;                        // 현재 원두량
  min: number;                          // 최소값 (15g)
  max: number;                          // 최대값 (30g)
  step: number;                         // 증감 단위 (1g)
  onChange: (value: number) => void;
  label: string;                        // "원두량"
  unit: string;                         // "g"
}

const DialControl = ({ value, min, max, step, onChange, label, unit }) => {
  const handleIncrease = () => {
    if (value < max) {
      onChange(value + step);
    }
  };

  const handleDecrease = () => {
    if (value > min) {
      onChange(value - step);
    }
  };

  return (
    <YStack alignItems="center" space="$2">
      <Text fontSize="$3" color="$gray11">{label}</Text>
      <XStack alignItems="center" space="$3">
        <Button
          size="$3"
          circular
          backgroundColor="$gray5"
          onPress={handleDecrease}
          disabled={value <= min}
        >
          <Text fontSize="$4">−</Text>
        </Button>
        <Text fontSize="$6" fontWeight="bold" minWidth={80} textAlign="center">
          {value}{unit}
        </Text>
        <Button
          size="$3"
          circular
          backgroundColor="$cupBlue"
          onPress={handleIncrease}
          disabled={value >= max}
        >
          <Text fontSize="$4" color="white">+</Text>
        </Button>
      </XStack>
    </YStack>
  );
};
```

### 비율 프리셋 시스템

```typescript
const RATIO_PRESETS = [
  { ratio: 1.15, label: '1:15', description: '진한 맛' },
  { ratio: 1.155, label: '1:15.5', description: '' },
  { ratio: 1.16, label: '1:16', description: '균형' },
  { ratio: 1.165, label: '1:16.5', description: '' },
  { ratio: 1.17, label: '1:17', description: '순한 맛' },
  { ratio: 1.175, label: '1:17.5', description: '' },
  { ratio: 1.18, label: '1:18', description: '가벼운 맛' }
];

const RatioPresetButtons = ({ coffeeAmount, onRatioSelect, selectedRatio }) => {
  return (
    <YStack space="$2">
      <Text fontSize="$3" color="$gray11">비율 프리셋</Text>
      <XStack flexWrap="wrap" gap="$2">
        {RATIO_PRESETS.map((preset) => (
          <Button
            key={preset.ratio}
            size="$2"
            backgroundColor={selectedRatio === preset.ratio * 10 ? '$cupBlue' : '$gray3'}
            color={selectedRatio === preset.ratio * 10 ? 'white' : '$gray12'}
            onPress={() => {
              const waterAmount = Math.round(coffeeAmount * preset.ratio * 10);
              onRatioSelect(preset.ratio * 10, waterAmount);
            }}
          >
            <Text fontSize="$2">{preset.label}</Text>
          </Button>
        ))}
      </XStack>
    </YStack>
  );
};
```

### 실시간 비율 계산

```typescript
const useRatioCalculation = (coffeeAmount: number) => {
  const [ratio, setRatio] = useState(16) // 1:16 기본값
  const [waterAmount, setWaterAmount] = useState(coffeeAmount * 16)

  // 원두량 변경시 물량 자동 계산
  useEffect(() => {
    const newWaterAmount = Math.round(coffeeAmount * ratio)
    setWaterAmount(newWaterAmount)
  }, [coffeeAmount, ratio])

  // 물량 직접 변경시 비율 계산
  const handleWaterAmountChange = (newWaterAmount: number) => {
    setWaterAmount(newWaterAmount)
    const newRatio = Number((newWaterAmount / coffeeAmount).toFixed(1))
    setRatio(newRatio)
  }

  // 비율 프리셋 선택시
  const handleRatioPresetSelect = (newRatio: number, calculatedWater: number) => {
    setRatio(newRatio)
    setWaterAmount(calculatedWater)
  }

  return {
    ratio,
    waterAmount,
    handleWaterAmountChange,
    handleRatioPresetSelect,
    ratioDisplay: ratio / 10, // 1.6 → "1:16" 표시용
  }
}
```

## ⚡ 성능 최적화

### HomeCafe 전용 최적화

- **레시피 템플릿**: 자주 사용하는 드리퍼별 기본 설정
- **스마트 기본값**: 사용자 히스토리 기반 원두량/비율 추천
- **빠른 저장**: "나의 커피" 원터치 저장
- **오프라인 지원**: 모든 레시피 데이터 로컬 저장

### 개인화 시스템

- **레시피 추천**: 성공률 높은 조합 우선 제안
- **드리퍼별 통계**: 드리퍼별 선호 비율과 성공률
- **시간대별 선호**: 아침/오후별 다른 레시피 제안
- **계절별 적응**: 날씨와 온도에 따른 추출 가이드

## 🧪 테스트 시나리오

### 기본 시나리오 - V60 레시피 실험

1. HomeCafe Mode 선택
2. 커피정보: "에티오피아 예가체프" + 원산지/로스팅 정보
3. HomeCafe 설정:
   - 드리퍼: V60 선택
   - 다이얼로 원두량 20g 설정
   - 비율 프리셋 1:16 선택 (물량 320ml 자동 계산)
4. 향미: Berry, Floral, Citrus 선택
5. 감각 표현: 각 카테고리에서 2개씩 선택
6. 개인 코멘트 + 실험 노트:
   - 코멘트: "밝고 상큼한 맛"
   - 추출시간: 3분 30초
   - 물온도: 92°C
   - 분쇄도: medium
7. 로스터 노트: "베리, 꽃향기, 밝은산미" 입력
8. 결과: Match Score 88%, 레시피 저장 제안

**예상 소요시간**: 6-7분

### 개인화 시나리오 - "나의 커피" 활용

1. HomeCafe Mode 선택
2. 커피정보: 새로운 원두
3. HomeCafe 설정:
   - "나의 아침 커피" 레시피 불러오기
   - 자동으로 V60 + 18g + 1:17 설정
   - 원두 특성에 맞게 물량만 조정
4. 나머지 단계 진행
5. 결과: 기존 레시피와 비교 분석 제공

**예상 소요시간**: 4-5분 (설정 시간 단축)

### 실험 모드 시나리오 - 비율 비교

1. 동일한 원두로 1:15, 1:16, 1:17 세 번 연속 테이스팅
2. 각각 다른 비율로 추출 변수만 변경
3. 결과 화면에서 세 가지 비율 비교 차트 제공
4. 최적 비율 추천 및 개인 선호도 업데이트

## 🎯 사용자 경험 목표

### 전문성

- **정밀 제어**: 1g 단위 정밀 조정으로 전문가급 레시피 관리
- **데이터 추적**: 추출 변수와 결과의 상관관계 학습
- **실험 지원**: 체계적인 레시피 실험과 비교 분석

### 편의성

- **스마트 기본값**: 사용자 히스토리 기반 추천
- **원터치 설정**: 자주 쓰는 레시피 즉시 불러오기
- **자동 계산**: 비율 변경시 자동으로 다른 값들 계산

### 성장감

- **레시피 아카이브**: 성공한 레시피들의 개인 컬렉션
- **실력 향상**: Match Score 상승을 통한 실력 증명
- **전문 지식**: 드리퍼별, 원두별 최적 추출법 학습

## 🔧 기술적 제약사항

### 데이터 일관성

- **비율 정확성**: 소수점 계산 오차 방지
- **단위 통일**: g, ml, °C 등 일관된 단위 사용
- **검증 로직**: 물리적으로 불가능한 값 입력 방지

### 성능 고려사항

- **실시간 계산**: 다이얼 조작시 지연 없는 반응
- **데이터 영속성**: 개인 레시피의 안전한 저장과 백업
- **오프라인 지원**: 네트워크 없이도 모든 기능 사용 가능

### 확장성

- **새로운 드리퍼**: 드리퍼 추가시 설정 템플릿 확장
- **고급 변수**: Phase 2에서 더 많은 추출 변수 지원
- **AI 추천**: 축적된 데이터 기반 개인화 추천 시스템

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: MODE_SELECTION_SCREEN.md, HOMECAFE_SCREEN.md, CAFE_MODE_WORKFLOW.md  
**구현 상태**: ✅ 완료 (다이얼 제어 + 비율 프리셋 혁신 포함)
