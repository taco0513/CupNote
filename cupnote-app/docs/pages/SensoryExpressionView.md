# SensoryExpressionView.vue

## 📋 개요

**목적**: 테이스팅 중 느껴지는 감각적 표현을 선택하는 선택적 입력 페이지  
**위치**: `/src/views/tasting-flow/SensoryExpressionView.vue`  
**라우터**: `/sensory-expression`, `/demo/sensory-expression`  
**작성일**: 2025-07-30

테이스팅 플로우의 4단계로, 산미, 단맛, 바디, 여운 등 커피의 감각적 특성을 전문적인 용어로 표현할 수 있는 선택적 입력 페이지입니다. 사용자가 확실히 느낀 감각만 선택하도록 유도합니다.

---

## 🎯 주요 기능

### 1. **4가지 감각 카테고리** ⭐ 핵심 기능

- **산미 (Acidity)**: 밝고 상큼한, 부드럽고 은은한, 톡 쏘는, 와인 같은
- **단맛 (Sweetness)**: 캐러멜 같은, 꿀 같은, 초콜릿 같은, 과일 같은
- **바디 (Body)**: 가볍고 깔끔한, 적당히 묵직한, 진하고 무거운, 부드럽고 실키한
- **여운 (Aftertaste)**: 깔끔하게 마무리, 오래 남는, 달콤한 마무리, 복합적인

### 2. **선택적 입력 시스템**

- **카테고리별 단일 선택**: 각 카테고리에서 하나씩만 선택 가능
- **선택 해제 가능**: 확실하지 않은 경우 선택 해제
- **진행률 표시**: 선택 완료된 카테고리 비율 시각화
- **도움말 제공**: 각 카테고리별 상세 설명

### 3. **사용자 친화적 인터페이스**

- **카드 기반 레이아웃**: 각 카테고리별 독립적인 카드
- **선택 상태 시각화**: 선택된 표현은 그라데이션 강조
- **실시간 요약**: 선택한 표현들의 실시간 요약 표시
- **반응형 디자인**: 모바일에서 세로 레이아웃으로 최적화

### 4. **모드별 네비게이션**

- **홈카페 모드**: 다음 단계로 개인 코멘트 입력 (`/personal-comment`)
- **랩 모드**: 다음 단계로 감각 슬라이더 (`/sensory-slider`)
- **데모 모드**: 각 모드에 맞는 데모 경로로 이동

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
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

// 라우터 및 상태
const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// 선택된 표현들 (카테고리별 단일 선택)
const selectedExpressions = ref({})

// 진행률 계산
const totalCategories = computed(() => sensoryCategories.value.length)
const completedCategories = computed(() => Object.keys(selectedExpressions.value).length)
const progressPercentage = computed(() => (completedCategories.value / totalCategories.value) * 100)
```

### 주요 메서드

```typescript
const selectExpression = (categoryId, expression) => {
  // 같은 표현 클릭 시 선택 해제
  if (selectedExpressions.value[categoryId]?.id === expression.id) {
    delete selectedExpressions.value[categoryId]
  } else {
    // 새로운 표현 선택 (카테고리당 하나만)
    selectedExpressions.value[categoryId] = expression
  }
}

const clearSelection = (categoryId) => {
  delete selectedExpressions.value[categoryId]
}

const handleNext = () => {
  // 선택된 표현들을 배열로 변환
  const sensoryArray = []

  Object.entries(selectedExpressions.value).forEach(([categoryId, expression]) => {
    sensoryArray.push({
      id: expression.id,
      category: getCategoryName(categoryId),
      text: expression.text,
    })
  })

  // 스토어에 저장
  coffeeRecordStore.updateSensoryExpression(sensoryArray)

  // 모드에 따른 네비게이션
  const currentMode = coffeeRecordStore.currentSession.mode || 'homecafe'

  if (currentMode === 'lab') {
    router.push('/sensory-slider')
  } else {
    router.push('/personal-comment')
  }
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
// 일반 모드
{
  path: '/sensory-expression',
  name: 'sensory-expression',
  component: SensoryExpressionView,
  meta: { requiresAuth: true, step: 4 }
}

// 데모 모드
{
  path: '/demo/sensory-expression',
  name: 'demo-sensory-expression',
  component: SensoryExpressionView,
  meta: { isDemo: true, step: 4 }
}
```

### 네비게이션 플로우

```
향미 선택 (Step 3)
├── 일반 모드 → /sensory-expression
└── 데모 모드 → /demo/sensory-expression

감각 표현 선택 (Step 4)
├── 홈카페 모드 → /personal-comment
├── 랩 모드 → /sensory-slider
├── 데모 모드 → 각 모드에 맞는 데모 경로
└── 이전 → 향미 선택 페이지로
```

---

## 📱 UI/UX 구조

### 레이아웃 구조

```vue
<template>
  <div class="sensory-expression-view">
    <!-- 헤더 -->
    <header class="sensory-header">
      <h1>👅 감각으로 표현해주세요</h1>
      <p>입 안에서 느껴지는 감각을 선택해주세요 (선택사항)</p>
    </header>

    <!-- 진행률 표시 -->
    <div class="progress-section">
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progressPercentage}%` }"></div>
      </div>
      <p class="progress-text">{{ completedCategories }}/{{ totalCategories }} 완료</p>
    </div>

    <!-- 감각 카테고리들 -->
    <section class="categories-section">
      <div class="sensory-categories">
        <div v-for="category in sensoryCategories" class="sensory-category">
          <!-- 카테고리 헤더 -->
          <div class="category-header">
            <div class="category-info">
              <span class="category-icon">{{ category.icon }}</span>
              <h3 class="category-title">{{ category.name }}</h3>
              <span class="category-description">{{ category.description }}</span>
            </div>
            <div class="category-status">
              <span v-if="selectedExpressions[category.id]" class="selected-indicator">✓</span>
            </div>
          </div>

          <!-- 표현 선택 그리드 -->
          <div class="expressions-grid">
            <button
              v-for="expression in category.expressions"
              :class="[
                'expression-btn',
                {
                  selected: selectedExpressions[category.id]?.id === expression.id,
                  'has-selection': selectedExpressions[category.id],
                },
              ]"
              @click="selectExpression(category.id, expression)"
            >
              <span class="expression-text">{{ expression.text }}</span>
              <span class="expression-description">{{ expression.description }}</span>
            </button>
          </div>

          <!-- 선택 해제 버튼 -->
          <div v-if="selectedExpressions[category.id]" class="clear-section">
            <button @click="clearSelection(category.id)" class="clear-selection-btn">
              선택 해제
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 선택 요약 -->
    <section class="summary-section">
      <div class="summary-card">
        <h3>선택한 감각 표현</h3>
        <div class="selected-expressions">
          <div
            v-for="(expression, categoryId) in selectedExpressions"
            class="selected-expression-item"
          >
            <span class="selected-category">{{ getCategoryName(categoryId) }}</span>
            <span class="selected-text">{{ expression.text }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 도움말 -->
    <section class="help-section">
      <div class="help-card">
        <h4>💡 감각 표현 가이드</h4>
        <ul>
          <li><strong>산미</strong>: 입 안에서 느끼는 신맛의 정도와 특성</li>
          <li><strong>단맛</strong>: 혀끝에서 느끼는 달콤함의 종류</li>
          <li><strong>바디</strong>: 입 안에서 느끼는 무게감과 질감</li>
          <li><strong>여운</strong>: 삼킨 후 입 안에 남는 뒷맛</li>
        </ul>
        <p class="help-note">
          모든 카테고리를 선택할 필요는 없어요. 확실히 느껴지는 것만 선택해주세요.
        </p>
      </div>
    </section>

    <!-- 네비게이션 버튼 -->
    <div class="action-buttons">
      <button class="btn-secondary" @click="$router.go(-1)">이전</button>
      <button class="btn-primary" @click="handleNext">다음 단계</button>
    </div>
  </div>
</template>
```

### 스타일링 특징

- **카드 기반 레이아웃**: 각 감각 카테고리를 독립적인 카드로 구성
- **선택 상태 표시**: 선택된 표현은 그라데이션 배경으로 강조
- **진행률 시각화**: 상단 프로그레스 바로 완료도 표시
- **반응형 그리드**: 표현 버튼들을 그리드로 배치, 모바일에서는 단일 컬럼

---

## 🔄 최근 변경사항

### 2025-07-30: 감각 표현 시스템 완성

```typescript
// Before: 간단한 텍스트 입력
<input v-model="sensoryNotes" placeholder="감각적 특징을 입력하세요" />

// After: 구조화된 카테고리별 선택 시스템
const sensoryCategories = [
  {
    id: 'acidity',
    name: '산미',
    icon: '🍋',
    expressions: [
      { id: 'bright', text: '밝고 상큼한', description: '레몬이나 라임 같은 밝은 산미' },
      // ... 전문적인 표현들
    ]
  }
  // ... 4개 카테고리 전체
]
```

**변경 이유**: 전문적이고 체계적인 감각 표현 시스템 구축

### 주요 개선사항

- ✅ 4개 감각 카테고리 체계적 분류
- ✅ 카테고리별 단일 선택 시스템
- ✅ 선택적 입력 (모든 카테고리 선택 불필요)
- ✅ 실시간 진행률 표시
- ✅ 모드별 네비게이션 분기

---

## 📊 데이터 구조

### 감각 카테고리 스키마

```typescript
interface SensoryCategory {
  id: string
  name: string
  icon: string
  description: string
  expressions: SensoryExpression[]
}

interface SensoryExpression {
  id: string
  text: string
  description: string
}
```

### 선택된 표현 데이터

```typescript
interface SelectedExpression {
  id: string
  category: string
  text: string
}

// 저장 형태 (배열)
const sensoryArray: SelectedExpression[] = [
  { id: 'bright', category: '산미', text: '밝고 상큼한' },
  { id: 'caramel', category: '단맛', text: '캐러멜 같은' },
]
```

### 4가지 감각 카테고리 데이터

```typescript
const sensoryCategories = [
  {
    id: 'acidity',
    name: '산미',
    icon: '🍋',
    description: '신맛의 정도와 특성',
    expressions: [
      { id: 'bright', text: '밝고 상큼한', description: '레몬이나 라임 같은 밝은 산미' },
      { id: 'mild', text: '부드럽고 은은한', description: '사과나 배 같은 온화한 산미' },
      { id: 'sharp', text: '톡 쏘는', description: '시트러스 같은 강한 산미' },
      { id: 'wine-like', text: '와인 같은', description: '발효된 과일 같은 복합적 산미' },
    ],
  },
  {
    id: 'sweetness',
    name: '단맛',
    icon: '🍯',
    description: '달콤함의 종류와 정도',
    expressions: [
      { id: 'caramel', text: '캐러멜 같은', description: '구운 설탕의 진한 단맛' },
      { id: 'honey', text: '꿀 같은', description: '부드럽고 자연스러운 단맛' },
      { id: 'chocolate', text: '초콜릿 같은', description: '진하고 달콤한 카카오 단맛' },
      { id: 'fruity-sweet', text: '과일 같은', description: '신선한 과일의 상큼한 단맛' },
    ],
  },
  {
    id: 'body',
    name: '바디',
    icon: '💪',
    description: '무게감과 질감',
    expressions: [
      { id: 'light', text: '가볍고 깔끔한', description: '물처럼 가벼운 질감' },
      { id: 'medium', text: '적당히 묵직한', description: '우유처럼 부드러운 질감' },
      { id: 'full', text: '진하고 무거운', description: '크림처럼 진한 질감' },
      { id: 'silky', text: '부드럽고 실키한', description: '실크처럼 부드러운 질감' },
    ],
  },
  {
    id: 'aftertaste',
    name: '여운',
    icon: '✨',
    description: '삼킨 후 남는 뒷맛',
    expressions: [
      { id: 'clean', text: '깔끔하게 마무리', description: '뒷맛이 깔끔하고 상쾌함' },
      { id: 'lingering', text: '오래 남는', description: '좋은 맛이 오랫동안 지속됨' },
      { id: 'sweet-finish', text: '달콤한 마무리', description: '단맛으로 마무리되는 여운' },
      { id: 'complex', text: '복합적인', description: '여러 맛이 복합적으로 나타남' },
    ],
  },
]
```

---

## 🎨 디자인 토큰

### 색상 팔레트

```css
/* 카테고리별 색상 */
--color-acidity: #ffe135; /* 산미 - 레몬색 */
--color-sweetness: #ffd93d; /* 단맛 - 꿀색 */
--color-body: #8b4513; /* 바디 - 갈색 */
--color-aftertaste: #dda0dd; /* 여운 - 자주색 */

/* 선택 상태 색상 */
--color-selected: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
--color-unselected: white;
--color-disabled: rgba(0, 0, 0, 0.6);

/* 진행률 바 */
--color-progress-bg: #e8d5c4;
--color-progress-fill: linear-gradient(90deg, #7c5842 0%, #a0796a 100%);
```

### 표현 버튼 스타일

```css
.expression-btn {
  background: white;
  border: 2px solid #e8d5c4;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.expression-btn:hover {
  border-color: #d4b896;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(124, 88, 66, 0.15);
}

.expression-btn.selected {
  border-color: #7c5842;
  background: linear-gradient(135deg, #7c5842 0%, #a0796a 100%);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(124, 88, 66, 0.3);
}

.expression-btn.has-selection:not(.selected) {
  opacity: 0.6;
}
```

### 카테고리 카드 스타일

```css
.sensory-category {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f8f4f0;
}

.selected-indicator {
  background: #7c5842;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}
```

---

## 🧪 테스트 시나리오

### 기본 기능 테스트

1. **카테고리별 선택**: 각 카테고리에서 하나의 표현만 선택 가능
2. **선택 해제**: 선택된 표현 다시 클릭 시 해제
3. **진행률 업데이트**: 선택할 때마다 진행률 바 업데이트
4. **요약 표시**: 선택한 표현들이 하단 요약에 실시간 표시

### 네비게이션 테스트

1. **모드별 분기**: 홈카페/랩 모드에 따른 다음 페이지 이동
2. **이전 버튼**: 향미 선택 페이지로 정상 이동
3. **데모 모드**: 데모 경로에서 정상 작동

### 사용성 테스트

1. **선택 안함**: 아무것도 선택하지 않고 다음 단계 진행 가능
2. **일부만 선택**: 일부 카테고리만 선택하고 진행 가능
3. **도움말**: 각 카테고리 설명이 사용자 이해에 도움

---

## 📋 TODO

### 🔥 High Priority

- [ ] **개인화**: 사용자 히스토리 기반 자주 선택하는 표현 추천
- [ ] **표현 확장**: 더 다양한 전문 용어 추가
- [ ] **시각적 개선**: 각 표현에 맞는 아이콘 또는 색상

### 🟡 Medium Priority

- [ ] **커스텀 표현**: 사용자가 직접 표현 추가 기능
- [ ] **비교 기능**: 이전 테이스팅과 감각 표현 비교
- [ ] **통계 연동**: 자주 선택하는 표현 패턴 분석

### 🟢 Low Priority

- [ ] **AI 분석**: 선택한 표현 기반 커피 추천
- [ ] **교육 모드**: 각 표현의 실제 커피 예시 제공
- [ ] **전문가 모드**: 더 세부적인 감각 분석 옵션

---

## 🔗 관련 파일

### 의존성

- `stores/coffeeRecord.ts` - 감각 표현 데이터 저장
- `router/index.ts` - 모드별 네비게이션 처리

### 연관 페이지

- `UnifiedFlavorView.vue` - 이전 페이지 (Step 3)
- `PersonalCommentView.vue` - 다음 페이지 (홈카페 모드)
- `SensorySliderView.vue` - 다음 페이지 (랩 모드)
- `ResultView.vue` - 최종 결과에서 감각 표현 표시

### 데이터 파일

- `constants/sensoryExpressions.js` - 감각 표현 마스터 데이터 (향후 분리 예정)

---

## 📈 비즈니스 메트릭

### 사용률 분석

- **페이지 완료율**: 감각 표현 페이지에서 다음 단계로 진행하는 비율
- **카테고리별 선택률**: 각 감각 카테고리별 선택 빈도
- **평균 선택 개수**: 사용자당 평균 선택하는 표현 개수

### 사용자 행동 분석

- **선택 패턴**: 가장 많이 선택되는 표현 조합
- **건너뛰기율**: 아무것도 선택하지 않고 넘어가는 비율
- **수정 빈도**: 선택 후 다시 수정하는 빈도

### 품질 지표

- **표현 정확도**: 선택한 표현과 실제 매치 스코어 상관관계
- **전문성 향상**: 시간에 따른 사용자의 표현 다양성 증가
- **만족도**: 감각 표현 선택에 대한 사용자 만족도

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 1.0_
