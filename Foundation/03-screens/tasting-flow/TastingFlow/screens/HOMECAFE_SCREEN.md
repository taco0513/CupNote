# HomeCafeScreen - 홈카페 설정 화면

> HomeCafe 모드 전용 추출 레시피와 장비 설정을 기록하는 핵심 화면

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/HomeCafeScreen`  
**역할**: 홈카페 추출 레시피, 드리퍼, 타이머 등 상세 설정 기록
**소요시간**: 2-3분
**진행률**: 43% (HomeCafe 모드 전용)

## 🎯 기능 정의

### 기술적 목표

- HomeCafe 모드 전용 추출 레시피 관리 시스템
- 정밀한 추출 변수 기록 및 추적 기능
- 대화형 UI를 통한 직관적 레시피 설정

### 핵심 기능

- **다이얼 제어 시스템**: ±1g 단위 정밀 원두량 조정
- **비율 프리셋 버튼**: 1:15~1:18 범위 7개 빠른 선택 옵션
- **실시간 자동 계산**: 원두량 변경 시 비율 유지 물량 자동 계산
- **개인 레시피 시스템**: AsyncStorage 기반 레시피 저장/로드

## 🏗️ UI/UX 구조 (2025-07-27 혁신)

### 화면 레이아웃

```
Header: ProgressBar (43%) + "홈카페 설정"
├── 드리퍼 선택 섹션
│   └── 10개 드리퍼 그리드 (V60, Kalita, Origami 등)
├── 레시피 설정 섹션 (5-Field 간소화)
│   ├── 1️⃣ 다이얼 제어 시스템
│   │   ├── 원두량: [- 20g +] 다이얼
│   │   └── 물량: 320ml (자동 계산)
│   ├── 2️⃣ 비율 프리셋 버튼
│   │   └── [1:15] [1:15.5] [1:16] [1:16.5] [1:17] [1:17.5] [1:18]
│   ├── 3️⃣ 물 온도: 입력 필드 (°C)
│   ├── 4️⃣ 추출 타이머
│   │   ├── 총 시간: 시작/정지 버튼
│   │   └── 랩타임: 5단계 기록
│   └── 5️⃣ 간단 노트: 한 줄 메모
├── 개인 레시피 관리
│   ├── "나의 커피" 저장 버튼
│   └── 저장된 레시피 불러오기
└── Footer: "다음" Button
```

### 🎛️ 핵심 UI 혁신

#### 1. 다이얼 제어 시스템

- **정밀 조정**: ±1g 단위로 바리스타급 원두량 제어
- **시각적 피드백**: 다이얼 회전 애니메이션
- **터치 최적화**: 큰 터치 영역과 햅틱 피드백

#### 2. 비율 중심 접근

- **명확한 표시**: "1:15", "1:16.5" 등 직관적 비율 표시
- **즉시 적용**: 버튼 터치 시 실시간 물량 계산
- **시각적 하이라이트**: 선택된 비율 강조 표시

#### 3. 실시간 자동 계산

```typescript
// 원두량 변경 시 자동 물량 계산
const calculateWaterAmount = (coffeeAmount: number, ratio: number) => {
  return Math.round(coffeeAmount * ratio)
}
```

## 💾 데이터 처리

### 입력 데이터

```typescript
interface CoffeeInfo {
  // 이전 화면에서 전달
  cafe_name: string
  coffee_name: string
  temperature: 'hot' | 'iced'
  // ... 기타 기본 정보
}
```

### 출력 데이터

```typescript
interface HomeCafeData {
  // 장비 설정
  dripper: PouroverDripper // 선택된 드리퍼

  // 레시피 (간소화된 5-Field)
  recipe: {
    coffee_amount: number // 원두량(g) - 다이얼 제어
    water_amount: number // 물량(ml) - 자동 계산
    ratio: number // 비율 (15-18)
    water_temp?: number // 물 온도(°C)
    brew_time?: number // 총 추출 시간(초)
    lap_times?: number[] // 5단계 랩타임
  }

  // 메모
  quick_note?: string // 한 줄 간단 메모

  // 개인 레시피 저장
  saved_recipe?: {
    name: '나의 커피'
    coffee_amount: number
    water_amount: number
    ratio: number
  }
}
```

### 영구 저장 (AsyncStorage)

```typescript
const SAVED_RECIPE_KEY = 'homecafe_my_coffee_recipe'

// 레시피 저장
await AsyncStorage.setItem(
  SAVED_RECIPE_KEY,
  JSON.stringify({
    name: '나의 커피',
    coffee_amount: currentRecipe.coffee_amount,
    water_amount: currentRecipe.water_amount,
    ratio: currentRecipe.ratio,
    saved_at: new Date().toISOString(),
  })
)
```

## 🔄 사용자 인터랙션

### 주요 액션

1. **드리퍼 선택**: 10개 옵션 중 하나 선택
2. **다이얼 조정**: ± 버튼으로 원두량 정밀 조정
3. **비율 선택**: 프리셋 버튼으로 즉시 비율 적용
4. **타이머 사용**: 실시간 추출 시간 기록
5. **레시피 저장**: "나의 커피"로 개인 레시피 저장

### 인터랙션 플로우

```
드리퍼 선택 → 원두량 조정 → 비율 선택 → 타이머 시작 → 메모 작성 → 저장/다음
```

### 스마트 기본값

- **원두량**: 20g (표준 1인분)
- **비율**: 1:16 (가장 인기있는 비율)
- **물 온도**: 92°C (일반적인 추출 온도)

## 📊 드리퍼 시스템

### 지원되는 드리퍼 (10종)

```typescript
enum PouroverDripper {
  V60 = 'V60',
  KALITA_WAVE = 'Kalita Wave',
  ORIGAMI = 'Origami',
  CHEMEX = 'Chemex',
  FELLOW_STAGG = 'Fellow Stagg',
  APRIL = 'April',
  OREA = 'Orea',
  FLOWER_DRIPPER = 'Flower Dripper',
  BLUE_BOTTLE = 'Blue Bottle',
  TIMEMORE_CRYSTAL_EYE = 'Timemore Crystal Eye',
}
```

### 드리퍼별 특성

- **시각적 구분**: 각 드리퍼 고유 아이콘
- **추천 레시피**: 드리퍼별 최적 비율 제안
- **통계 연동**: 드리퍼별 사용 통계 제공

## 🎨 UI 컴포넌트

### 핵심 컴포넌트

- **DripperGrid**: 10개 드리퍼 선택 그리드
- **DialControl**: 원두량 다이얼 제어 컴포넌트
- **RatioPresetButtons**: 7개 비율 프리셋 버튼
- **BrewTimer**: 추출 타이머와 랩타임 기록
- **RecipeSaver**: 개인 레시피 저장/불러오기

### Tamagui 스타일링

```typescript
const DialContainer = styled(XStack, {
  alignItems: 'center',
  justifyContent: 'center',
  padding: '$md',
  backgroundColor: '$gray1',
  borderRadius: '$3',
})

const RatioButton = styled(Button, {
  size: '$3',
  backgroundColor: '$gray3',
  color: '$gray12',
  pressStyle: {
    backgroundColor: '$cupBlue',
    color: 'white',
  },
})
```

## 📱 반응형 고려사항

### 화면 최적화

- **세로 모드**: 5-Field 세로 배치
- **가로 모드**: 2열 배치로 공간 효율성
- **작은 화면**: 드리퍼 그리드 3x4 배치

### 터치 최적화

- **다이얼 영역**: 최소 44px 터치 영역
- **버튼 간격**: 8px 최소 간격 유지
- **햅틱 피드백**: 중요한 액션에 진동 피드백

## 🔗 네비게이션

### 이전 화면

- **CoffeeInfoScreen**: 커피 기본 정보 입력 완료

### 다음 화면

- **UnifiedFlavorScreen**: 향미 선택 화면

### 조건부 네비게이션

- HomeCafe 모드에서만 접근 가능
- 다른 모드에서는 건너뛰기

## 📈 성능 최적화

### 실시간 계산 최적화

```typescript
// Debounced 계산으로 성능 향상
const debouncedCalculation = useMemo(
  () =>
    debounce((coffee: number, ratio: number) => {
      setWaterAmount(Math.round(coffee * ratio))
    }, 100),
  []
)
```

### 메모리 관리

- **타이머 정리**: 컴포넌트 언마운트 시 타이머 정리
- **상태 최적화**: 불필요한 리렌더링 방지

## 🧪 테스트 시나리오

### 기능 테스트

1. **다이얼 조정**: 원두량 변경 시 물량 자동 계산
2. **비율 선택**: 프리셋 버튼 선택 시 즉시 적용
3. **레시피 저장**: 저장/불러오기 정상 동작
4. **타이머**: 정확한 시간 측정 및 랩타임 기록

### 사용성 테스트

1. **홈카페 초보**: 기본값으로도 충분한 기록 가능
2. **고급 사용자**: 정밀 조정을 통한 실험 지원
3. **반복 사용자**: 저장된 레시피로 빠른 재현

## 🚀 확장 가능성

### Phase 2 개선사항

- **그라인드 설정**: 분쇄도, 그라인더 정보 추가
- **추출 곡선**: 시간별 추출량 그래프
- **레시피 공유**: 다른 사용자와 레시피 공유

### Phase 3 고급 기능

- **스마트 추천**: AI 기반 최적 레시피 제안
- **장비 DB**: 사용자 장비 등록 및 관리
- **실험 노트**: 상세한 실험 기록 시스템

## 🎯 비즈니스 가치

### 차별화 요소

- **국내 유일**: 한국어 홈카페 전용 UI
- **바리스타급 도구**: 다이얼 제어 등 전문 기능
- **개인화**: "나의 커피" 브랜딩으로 소유감 증대

### 시장 확장성

- **홈카페족 20만+ 시장** 직접 타겟
- **프리미엄 구독** 수익 모델 기반
- **장비 파트너십** 확장 가능성

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: COFFEE_INFO_SCREEN.md, UNIFIED_FLAVOR_SCREEN.md  
**구현 상태**: ✅ 완료 (2025-07-27 UI 혁신 적용)
