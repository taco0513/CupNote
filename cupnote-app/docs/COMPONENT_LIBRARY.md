# 📦 CupNote 컴포넌트 라이브러리

CupNote에서 사용되는 모든 재사용 가능한 컴포넌트들의 API 문서와 사용 예제입니다.

## 📋 목차

1. [유틸리티 컴포넌트](#유틸리티-컴포넌트)
2. [차트 컴포넌트](#차트-컴포넌트)  
3. [Pro 모드 컴포넌트](#pro-모드-컴포넌트)
4. [폼 컴포넌트](#폼-컴포넌트)
5. [사용 가이드라인](#사용-가이드라인)

## 🛠️ 유틸리티 컴포넌트

### ErrorBoundary.vue

전역 에러 처리를 위한 에러 경계 컴포넌트입니다.

**Props**
- `fallback` (string, optional): 에러 발생시 표시할 대체 메시지

**Events**
- `error`: 에러 발생시 발생하는 이벤트 `(error: Error) => void`

**사용 예제**
```vue
<template>
  <ErrorBoundary @error="handleError">
    <YourComponent />
  </ErrorBoundary>
</template>

<script setup>
import ErrorBoundary from '@/components/ErrorBoundary.vue'

const handleError = (error) => {
  console.error('Component error:', error)
  // 에러 로깅 또는 알림 처리
}
</script>
```

**특징**
- Vue 3의 `onErrorCaptured` 훅 활용
- 하위 컴포넌트에서 발생한 모든 에러 캐치
- 사용자 친화적인 에러 메시지 표시
- 에러 복구 옵션 제공

---

### LoadingSpinner.vue

로딩 상태를 표시하는 커피콩 애니메이션 스피너입니다.

**Props**
```typescript
interface Props {
  size: 'small' | 'medium' | 'large'  // 기본값: 'medium'
  message: string                      // 기본값: ''
}
```

**사용 예제**
```vue
<template>
  <!-- 기본 사용 -->
  <LoadingSpinner />
  
  <!-- 크기와 메시지 지정 -->
  <LoadingSpinner size="large" message="데이터를 불러오는 중..." />
  
  <!-- 작은 인라인 스피너 -->
  <LoadingSpinner size="small" />
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
</script>
```

**크기별 스펙**
- `small`: 30x30px (인라인 사용)
- `medium`: 60x60px (일반 로딩)  
- `large`: 100x100px (페이지 로딩)

**특징**
- 커피콩 모양 애니메이션으로 브랜딩 일치
- 3개 콩이 순차적으로 회전하는 애니메이션
- 다크모드 지원
- 접근성 고려 (aria-label 자동 설정)

---

### SkeletonLoader.vue

로딩 중 컨텐츠 구조를 보여주는 스켈레톤 UI 컴포넌트입니다.

**Props**
```typescript
interface Props {
  type: 'card' | 'list' | 'text' | 'image' | 'chart' | 'custom'  // 기본값: 'text'
  count: number                    // 기본값: 3 (list, text 타입용)
  animation: 'pulse' | 'wave' | 'none'  // 기본값: 'pulse'
  width: string                    // 기본값: '100%'
  height: string                   // 기본값: 'auto'
  aspectRatio: string              // 기본값: '16/9' (image 타입용)
}
```

**사용 예제**
```vue
<template>
  <!-- 카드 스켈레톤 -->
  <SkeletonLoader type="card" />
  
  <!-- 리스트 스켈레톤 (5개 항목) -->
  <SkeletonLoader type="list" :count="5" />
  
  <!-- 텍스트 스켈레톤 -->
  <SkeletonLoader type="text" :count="3" animation="wave" />
  
  <!-- 이미지 스켈레톤 -->
  <SkeletonLoader 
    type="image" 
    width="300px" 
    height="200px" 
  />
  
  <!-- 차트 스켈레톤 -->
  <SkeletonLoader type="chart" />
  
  <!-- 커스텀 스켈레톤 -->
  <SkeletonLoader type="custom">
    <div class="custom-skeleton-content">
      <!-- 커스텀 스켈레톤 구조 -->
    </div>
  </SkeletonLoader>
</template>
```

**타입별 특징**
- `card`: 아바타 + 제목 + 설명 구조
- `list`: 반복되는 리스트 아이템
- `text`: 다양한 길이의 텍스트 라인
- `image`: 이미지 플레이스홀더 (아이콘 포함)
- `chart`: 차트 형태 (막대 + 라벨)
- `custom`: 사용자 정의 구조

**애니메이션 타입**
- `pulse`: 투명도 변화 애니메이션
- `wave`: 좌우 흐르는 웨이브 효과
- `none`: 정적 표시

---

## 📊 차트 컴포넌트

### BarChart.vue

Chart.js 기반 막대 차트 컴포넌트입니다.

**Props**
```typescript
interface Props {
  data: {
    labels: string[]
    values: number[]
  }
  title?: string
  color?: string      // 기본값: CupNote 테마 컬러
  height?: number     // 기본값: 300
}
```

**사용 예제**
```vue
<template>
  <BarChart 
    :data="chartData"
    title="월별 테이스팅 기록"
    color="#7C5842"
    :height="400"
  />
</template>

<script setup>
import BarChart from '@/components/charts/BarChart.vue'

const chartData = {
  labels: ['1월', '2월', '3월', '4월', '5월'],
  values: [12, 19, 3, 5, 2]
}
</script>
```

**특징**
- 반응형 차트 (화면 크기에 맞춰 조정)
- CupNote 테마 컬러 적용
- 호버 효과 및 툴팁 제공
- 접근성 지원 (alt 텍스트, 키보드 네비게이션)

---

### DoughnutChart.vue

도넛 차트 컴포넌트입니다.

**Props**
```typescript
interface Props {
  data: {
    labels: string[]
    values: number[]
    colors?: string[]  // 각 섹션별 색상
  }
  title?: string
  size?: 'small' | 'medium' | 'large'  // 기본값: 'medium'
  showLegend?: boolean                  // 기본값: true
}
```

**사용 예제**
```vue
<template>
  <DoughnutChart 
    :data="flavorData"
    title="선호 향미 분포"
    size="large"
    :showLegend="true"
  />
</template>

<script setup>
import DoughnutChart from '@/components/charts/DoughnutChart.vue'

const flavorData = {
  labels: ['과일향', '꽃향', '초콜릿', '견과류'],
  values: [30, 25, 25, 20],
  colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
}
</script>
```

---

### LineChart.vue

시간 경과에 따른 데이터 변화를 보여주는 라인 차트입니다.

**Props**
```typescript
interface Props {
  data: {
    labels: string[]
    datasets: Array<{
      label: string
      values: number[]
      color?: string
    }>
  }
  title?: string
  height?: number
  showGrid?: boolean    // 기본값: true
}
```

**사용 예제**
```vue
<template>
  <LineChart 
    :data="progressData"
    title="테이스팅 실력 향상도"
    :height="350"
    :showGrid="true"
  />
</template>

<script setup>
import LineChart from '@/components/charts/LineChart.vue'

const progressData = {
  labels: ['1주차', '2주차', '3주차', '4주차'],
  datasets: [
    {
      label: '매칭 점수',
      values: [65, 72, 78, 85],
      color: '#7C5842'
    },
    {
      label: '향미 인식',
      values: [60, 68, 75, 82],
      color: '#A0796A'
    }
  ]
}
</script>
```

---

## 🎯 Pro 모드 컴포넌트

### ProBrewingChart.vue

SCA Golden Cup 추출 범위를 시각화하는 차트입니다.

**Props**
```typescript
interface Props {
  tds?: number          // TDS 값 (0.8 - 1.8%)
  extractionYield?: number  // 추출율 값 (16 - 24%)
  brewTime?: number     // 추출 시간 (초, 기본값: 240)
  lapTimes?: number[]   // 랩타임 배열
  coffeeAmount?: number // 커피 양 (g, 기본값: 20)
  waterAmount?: number  // 물 양 (ml, 기본값: 340)
  waterTemp?: number    // 물 온도 (°C, 기본값: 93)
}
```

**사용 예제**
```vue
<template>
  <ProBrewingChart 
    :tds="1.25"
    :extractionYield="20"
    :brewTime="240"
    :lapTimes="[30, 90, 150]"
    :coffeeAmount="20"
    :waterAmount="340"
    :waterTemp="92"
  />
</template>

<script setup>
import ProBrewingChart from '@/components/pro/ProBrewingChart.vue'
</script>
```

**특징**
- SCA Golden Cup 표준 범위 표시
- 현재 값의 위치를 점으로 표시
- 품질 등급 시각화 (Ideal, Good, Acceptable)
- 실시간 값 업데이트

---

### ProDataVisualizer.vue

Pro 모드에서 데이터를 시각화하는 컴포넌트입니다.

**Props**
```typescript
interface Props {
  scores: {
    fragrance: number    // 향 (0-10)
    flavor: number       // 맛 (0-10)  
    acidity: number      // 산미 (0-10)
    body: number         // 바디 (0-10)
    balance: number      // 균형 (0-10)
    overall: number      // 전체 (0-10)
  }
  maxScore?: number      // 기본값: 10
}
```

**사용 예제**
```vue
<template>
  <ProDataVisualizer :scores="qcScores" />
</template>

<script setup>
import ProDataVisualizer from '@/components/pro/ProDataVisualizer.vue'

const qcScores = {
  fragrance: 8.5,
  flavor: 8.0,
  acidity: 7.5,
  body: 8.5,
  balance: 8.0,
  overall: 8.2
}
</script>
```

---

### ProModeStepper.vue

Pro 모드 테이스팅 플로우를 위한 단계별 진행 표시 컴포넌트입니다.

**Props**
```typescript
interface Props {
  currentStep: number      // 현재 단계 (1-12)
  totalSteps: number       // 전체 단계 수 (기본값: 12)
  stepLabels?: string[]    // 단계별 라벨
  mode: 'cafe' | 'homecafe' | 'pro'
}
```

**Events**
- `step-click`: 단계 클릭시 발생 `(stepNumber: number) => void`

**사용 예제**
```vue
<template>
  <ProModeStepper 
    :currentStep="5"
    :totalSteps="12"
    mode="pro"
    @step-click="handleStepClick"
  />
</template>

<script setup>
import ProModeStepper from '@/components/pro/ProModeStepper.vue'

const handleStepClick = (stepNumber: number) => {
  console.log(`Step ${stepNumber} clicked`)
}
</script>
```

**특징**
- 모드별 단계 수 자동 조정
- 진행 상황 시각화
- 클릭 가능한 단계 네비게이션
- 반응형 디자인

---

### NotificationToast.vue

알림 메시지를 표시하는 토스트 컴포넌트입니다.

**Props**
```typescript
interface Props {
  type: 'success' | 'error' | 'warning' | 'info'  // 기본값: 'info'
  title: string
  message?: string
  duration?: number    // 기본값: 3000ms
  closable?: boolean   // 기본값: true
}
```

**Events**
- `close`: 토스트 닫힐 때 발생하는 이벤트

**사용 예제**
```vue
<template>
  <NotificationToast
    type="success"
    title="저장 완료"
    message="테이스팅 기록이 성공적으로 저장되었습니다."
    :duration="3000"
    @close="handleClose"
  />
</template>

<script setup>
import NotificationToast from '@/components/NotificationToast.vue'

const handleClose = () => {
  console.log('Toast closed')
}
</script>
```

**특징**
- 4가지 타입별 색상 및 아이콘
- 자동 사라짐 또는 수동 닫기
- 접근성 지원 (ARIA 속성)
- 반응형 애니메이션

---

## 📝 폼 컴포넌트

### BaseButton.vue

기본 버튼 컴포넌트입니다.

**Props**
```typescript
interface Props {
  variant: 'primary' | 'secondary' | 'outline' | 'text'  // 기본값: 'primary'
  size: 'small' | 'medium' | 'large'                     // 기본값: 'medium'
  disabled?: boolean                                      // 기본값: false
  loading?: boolean                                       // 기본값: false
  icon?: string                                           // 아이콘 이름
  iconPosition?: 'left' | 'right'                        // 기본값: 'left'
}
```

**Events**
- `click`: 클릭시 발생하는 이벤트

**사용 예제**
```vue
<template>
  <!-- 기본 버튼 -->
  <BaseButton @click="handleClick">
    저장하기
  </BaseButton>
  
  <!-- 로딩 상태 버튼 -->
  <BaseButton 
    variant="primary" 
    :loading="isLoading"
    @click="submit"
  >
    제출하기
  </BaseButton>
  
  <!-- 아이콘 버튼 -->
  <BaseButton 
    variant="outline"
    icon="plus"
    size="small"
  >
    추가
  </BaseButton>
</template>
```

---

### BaseCard.vue

기본 카드 컨테이너 컴포넌트입니다.

**Props**
```typescript
interface Props {
  padding?: 'none' | 'small' | 'medium' | 'large'  // 기본값: 'medium'
  shadow?: 'none' | 'small' | 'medium' | 'large'   // 기본값: 'small'
  border?: boolean                                  // 기본값: true
  hoverable?: boolean                               // 기본값: false
}
```

**Slots**
- `default`: 카드 내용
- `header`: 카드 헤더 (선택사항)
- `footer`: 카드 푸터 (선택사항)

**사용 예제**
```vue
<template>
  <BaseCard 
    shadow="medium" 
    :hoverable="true"
  >
    <template #header>
      <h3>카드 제목</h3>
    </template>
    
    <p>카드 내용입니다.</p>
    
    <template #footer>
      <BaseButton size="small">액션</BaseButton>
    </template>
  </BaseCard>
</template>
```

---

## 📐 사용 가이드라인

### 1. 컴포넌트 선택 가이드

**로딩 상태 표시**
- 빠른 작업 (< 2초): `LoadingSpinner` 사용
- 데이터 로딩: `SkeletonLoader` 사용 (사용자가 구조 예측 가능)
- 페이지 전체 로딩: `LoadingSpinner size="large"` 사용

**에러 처리**
- 컴포넌트 레벨: `ErrorBoundary`로 감싸기
- 비동기 작업: `useErrorHandler` composable 활용
- 폼 검증: 인라인 에러 메시지 표시

**차트 선택**
- 카테고리별 비교: `BarChart`  
- 비율/구성 표시: `DoughnutChart`
- 시간 변화 추이: `LineChart`
- 다차원 평가: `ProDataVisualizer` (레이더)

### 2. 반응형 고려사항

```vue
<template>
  <!-- 모바일에서는 작은 크기 사용 -->
  <LoadingSpinner 
    :size="isMobile ? 'small' : 'medium'" 
  />
  
  <!-- 차트 높이 반응형 조정 -->
  <BarChart 
    :height="isMobile ? 250 : 400"
    :data="chartData"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const isMobile = computed(() => width.value < 768)
</script>
```

### 3. 접근성 (a11y) 고려사항

```vue
<template>
  <!-- 적절한 aria-label 제공 -->
  <LoadingSpinner 
    aria-label="데이터를 불러오는 중입니다"
  />
  
  <!-- 버튼에 명확한 텍스트 또는 aria-label -->
  <BaseButton 
    icon="close"
    aria-label="모달 닫기"
  />
  
  <!-- 차트에 대한 대체 텍스트 -->
  <BarChart 
    :data="data" 
    alt="월별 테이스팅 기록을 보여주는 막대 차트"
  />
</template>
```

### 4. 성능 최적화

```vue
<script setup>
// 큰 컴포넌트는 지연 로딩
const Chart = defineAsyncComponent(() => 
  import('@/components/charts/BarChart.vue')
)

// Props 검증으로 런타임 오류 방지
const props = defineProps<{
  data: ChartData
}>()

// 메모이제이션으로 불필요한 재계산 방지
const processedData = computed(() => {
  return expensiveDataProcessing(props.data)
})
</script>
```

---

## 🎨 테마 및 스타일링

### CSS 변수 활용

```css
/* 컴포넌트 스타일에서 테마 변수 사용 */
.component {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

/* 반응형 텍스트 크기 */
.title {
  font-size: var(--text-lg);
}

@media (max-width: 768px) {
  .title {
    font-size: var(--text-base);
  }
}
```

### 컴포넌트 커스터마이징

```vue
<template>
  <!-- CSS 변수로 컴포넌트 스타일 오버라이드 -->
  <LoadingSpinner 
    class="custom-spinner"
    style="--spinner-color: #custom-color"
  />
</template>

<style scoped>
.custom-spinner {
  /* 커스텀 스타일 적용 */
}
</style>
```

---

이 컴포넌트 라이브러리는 CupNote의 일관된 UI/UX를 제공하며, 재사용성과 확장성을 고려하여 설계되었습니다. 새로운 컴포넌트를 추가하거나 기존 컴포넌트를 수정할 때는 이 가이드라인을 참조해 주세요.