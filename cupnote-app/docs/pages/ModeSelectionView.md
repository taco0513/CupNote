# ModeSelectionView.vue

## 📋 개요

**목적**: 사용자가 테이스팅 모드를 선택하는 시작점 페이지  
**위치**: `/src/views/tasting-flow/ModeSelectionView.vue`  
**라우터**: `/mode-selection`, `/demo`  
**작성일**: 2025-07-30

테이스팅 세션의 첫 번째 단계로, 사용자의 상황과 경험 수준에 맞는 모드를 선택할 수 있게 해주는 핵심 페이지입니다.

---

## 🎯 주요 기능

### 1. **3가지 테이스팅 모드 제공**
- **☕ Cafe Mode**: 카페에서 마시는 커피 (3-5분 소요)
- **🏠 HomeCafe Mode**: 집에서 내려 마시는 커피 (5-8분 소요)  
- **🎯 Pro Mode**: SCA 표준 전문 품질 평가 (8-12분 소요)

### 2. **데모 모드 지원**
- 데모 경로(`/demo`)에서 접근 시 자동 감지
- 데모/일반 모드에 따른 라우팅 분기 처리
- 로그인 없이 체험 가능한 데모 플로우

### 3. **직관적인 UI/UX**
- 카드 기반 모드 선택 인터페이스
- 각 모드별 아이콘, 설명, 예상 소요시간 표시
- 취소 버튼으로 홈으로 복귀 가능

---

## 🔧 기술 명세

### Props
```typescript
// Props 없음 - 자체적으로 상태 관리
```

### Events
```typescript
// 내부 이벤트만 사용, 부모 컴포넌트로 emit 없음
```

### Composables & Stores
```typescript
import { useRouter, useRoute } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

// 라우터 네비게이션
const router = useRouter()
const route = useRoute()

// 선택된 모드 저장
const coffeeRecordStore = useCoffeeRecordStore()
```

### 주요 메서드
```typescript
const selectMode = (mode: string) => {
  // 모드 저장
  coffeeRecordStore.updateCoffeeSetup({ mode })
  
  // 데모 모드 감지
  const isDemo = route.path.startsWith('/demo')
  
  // 라우팅 분기
  if (isDemo) {
    router.push('/demo/coffee-info')
  } else {
    router.push('/coffee-info')
  }
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로
```typescript
// 일반 모드
{
  path: '/mode-selection',
  name: 'mode-selection',
  component: ModeSelectionView,
  meta: { requiresAuth: true }
}

// 데모 모드  
{
  path: '/demo',
  name: 'demo-start',
  component: ModeSelectionView,
  meta: { isDemo: true }
}
```

### 네비게이션 플로우
```
홈페이지
├── 무료로 시작하기 → /mode-selection (인증 후)
└── 데모 체험하기 → /demo (인증 없이)

모드 선택
├── Cafe Mode → /coffee-info 또는 /demo/coffee-info
├── HomeCafe Mode → /homecafe
├── Pro Mode → /pro-brewing
└── 취소 → / (홈으로)
```

### 네비게이션 가드
- 일반 모드: `requiresAuth: true` (로그인 필요)
- 데모 모드: `isDemo: true` (인증 우회)

---

## 📱 UI/UX 구조

### 레이아웃 구조
```vue
<template>
  <div class="mode-selection-view">
    <!-- 헤더 -->
    <header class="header">
      <h1>☕ CupNote</h1>
      <p>오늘의 커피를 기록해보세요</p>
    </header>

    <!-- 모드 선택 카드들 -->
    <main class="mode-cards">
      <button v-for="mode in modes" 
              @click="selectMode(mode.value)"
              class="mode-card">
        <div class="mode-icon">{{ mode.icon }}</div>
        <h2>{{ mode.label }}</h2>
        <p>{{ mode.description }}</p>
        <p>{{ mode.time }}</p>
      </button>
    </main>

    <!-- 취소 버튼 -->
    <footer class="actions">
      <button @click="$router.push('/')" class="btn-secondary">
        취소
      </button>
    </footer>
  </div>
</template>
```

### 스타일링 특징
- **그라데이션 배경**: 프리미엄 커피 테마
- **카드 기반 디자인**: 각 모드를 시각적으로 구분
- **호버 효과**: 카드 선택 시 시각적 피드백
- **반응형 디자인**: 모바일/데스크탑 대응

---

## 🔄 최근 변경사항

### 2025-07-30: 데모 모드 지원 추가
```typescript
// Before: 항상 /coffee-info로 이동
router.push('/coffee-info')

// After: 데모 모드 감지 및 분기
const isDemo = route.path.startsWith('/demo')
if (isDemo) {
  router.push('/demo/coffee-info')
} else {
  router.push('/coffee-info')
}
```

**변경 이유**: 데모 체험하기 기능 구현을 위해 데모 전용 라우팅 필요

### 주요 개선사항
- ✅ 데모 모드 자동 감지 로직 추가
- ✅ useRoute 컴포저블 추가
- ✅ 라우팅 분기 처리 구현
- ✅ 에러 처리 개선 (route 미정의 문제 해결)

---

## 📊 데이터 구조

### 모드 옵션 배열
```typescript
const modes = [
  {
    value: 'cafe',
    label: 'Cafe Mode',
    icon: '☕',
    description: '카페에서 마시는 커피',
    time: '3-5분'
  },
  {
    value: 'homecafe', 
    label: 'HomeCafe Mode',
    icon: '🏠',
    description: '집에서 내려 마시는 커피',
    time: '5-8분'
  },
  {
    value: 'pro',
    label: 'Pro Mode', 
    icon: '🎯',
    description: 'SCA 표준 전문 품질 평가',
    time: '8-12분'
  }
]
```

### 스토어 연동
```typescript
// 선택된 모드는 coffeeRecordStore에 저장
coffeeRecordStore.updateCoffeeSetup({
  mode: 'cafe' | 'homecafe' | 'pro'
})
```

---

## 🎨 디자인 토큰

### 색상 팔레트
- **Primary**: `#7C5842` (브라운)
- **Background**: `linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%)`
- **Card**: `white` with `rgba(124, 88, 66, 0.1)` shadow
- **Hover**: `rgba(124, 88, 66, 0.15)` shadow

### 타이포그래피
- **제목**: `2.5rem`, `700` weight, `#7C5842`
- **설명**: `1rem`, `400` weight, `#666`
- **시간**: `0.9rem`, `500` weight, `#A0796A`

---

## 🧪 테스트 시나리오

### 기본 동작 테스트
1. **모드 선택**: 각 모드 클릭 시 올바른 페이지로 이동
2. **데모 모드**: `/demo` 접근 시 데모 라우팅 작동
3. **취소 기능**: 취소 버튼 클릭 시 홈으로 복귀
4. **상태 저장**: 선택한 모드가 스토어에 저장됨

### 에러 케이스
1. **라우팅 실패**: 잘못된 경로 처리
2. **스토어 연동 실패**: 모드 저장 실패 시 처리
3. **컴포넌트 마운트 오류**: 초기화 실패 처리

---

## 📋 TODO

### 🔥 High Priority
- [ ] **진행률 표시**: 7단계 중 1단계임을 표시
- [ ] **모드별 상세 설명**: 툴팁 또는 모달로 자세한 설명
- [ ] **데모 모드 표시**: 데모 진행 중임을 시각적으로 표시

### 🟡 Medium Priority  
- [ ] **최근 선택 모드**: 이전에 선택한 모드 하이라이트
- [ ] **소요시간 예측**: 사용자별 맞춤 시간 예측
- [ ] **접근성 개선**: 키보드 네비게이션, ARIA 속성

### 🟢 Low Priority
- [ ] **애니메이션**: 카드 선택 시 부드러운 전환 효과
- [ ] **사운드 피드백**: 선택 시 소리 효과 (옵션)
- [ ] **개인화**: 사용자 취향 기반 모드 추천

---

## 🔗 관련 파일

### 의존성
- `stores/coffeeRecord.ts` - 선택된 모드 저장
- `stores/demo.ts` - 데모 모드 상태 관리
- `router/index.ts` - 라우팅 설정

### 연관 페이지
- `HomeView.vue` - 이전 페이지 (시작점)
- `CoffeeInfoView.vue` - 다음 페이지 (Cafe Mode)
- `HomeCafeView.vue` - 다음 페이지 (HomeCafe Mode)  
- `ProBrewingView.vue` - 다음 페이지 (Pro Mode)

---

**📝 문서 끝**

*작성자: CupNote 개발팀*  
*최종 수정: 2025년 7월 30일*  
*버전: 1.0*