# CoffeeInfoView.vue

## 📋 개요

**목적**: 테이스팅할 커피의 기본 정보를 입력하는 핵심 데이터 수집 페이지  
**위치**: `/src/views/tasting-flow/CoffeeInfoView.vue`  
**라우터**: `/coffee-info`, `/demo/coffee-info`  
**작성일**: 2025-07-30

테이스팅 플로우의 두 번째 단계로, 사용자가 테이스팅할 커피에 대한 상세 정보를 입력하는 중요한 데이터 수집 포인트입니다.

---

## 🎯 주요 기능

### 1. **커피 기본 정보 입력**
- **카페명**: 구매처 또는 제조처 정보
- **커피명**: 정확한 제품명
- **원산지**: 커피 원두 생산지
- **가격**: 구매 가격 (선택사항)

### 2. **데모 모드 지원**
- 데모 경로 접근 시 미리 설정된 데이터 자동 입력
- 실제 모드와 동일한 UI/UX 제공
- 데모 데이터로 빠른 체험 가능

### 3. **실시간 데이터 검증**
- 필수 필드 입력 검증
- 데이터 형식 유효성 검사
- 실시간 에러 메시지 표시

### 4. **진행률 표시**
- 7단계 중 2단계 진행 상황 시각화
- 이전/다음 단계 네비게이션

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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'
import { useDemoStore } from '../../stores/demo'

// 라우터 네비게이션
const router = useRouter()
const route = useRoute()

// 상태 관리
const coffeeRecordStore = useCoffeeRecordStore()
const demoStore = useDemoStore()

// 폼 데이터
const coffeeInfo = ref({
  cafe_name: '',
  coffee_name: '',
  origin: '',
  price: null
})
```

### 주요 메서드
```typescript
const saveCoffeeInfo = () => {
  // 데이터 검증
  if (!coffeeInfo.value.cafe_name || !coffeeInfo.value.coffee_name) {
    showValidationError()
    return
  }

  // 스토어에 저장
  coffeeRecordStore.updateCoffeeSetup({
    coffee_info: coffeeInfo.value
  })

  // 다음 단계로 이동
  const isDemo = route.path.startsWith('/demo')
  if (isDemo) {
    router.push('/demo/unified-flavor')
  } else {
    router.push('/unified-flavor')
  }
}

const loadDemoData = () => {
  if (route.path.startsWith('/demo')) {
    coffeeInfo.value = demoStore.demoData.coffee_info
  }
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로
```typescript
// 일반 모드
{
  path: '/coffee-info',
  name: 'coffee-info',
  component: CoffeeInfoView,
  meta: { requiresAuth: true, step: 2 }
}

// 데모 모드
{
  path: '/demo/coffee-info',
  name: 'demo-coffee-info',
  component: CoffeeInfoView,
  meta: { isDemo: true, step: 2 }
}
```

### 네비게이션 플로우
```
모드 선택 (Step 1)
├── 일반 모드 → /coffee-info
└── 데모 모드 → /demo/coffee-info

커피 정보 입력 (Step 2)
├── 이전 → /mode-selection 또는 /demo
├── 다음 → /unified-flavor 또는 /demo/unified-flavor
└── 취소 → / (홈으로)
```

---

## 📱 UI/UX 구조

### 레이아웃 구조
```vue
<template>
  <div class="coffee-info-view">
    <!-- 진행률 표시 -->
    <ProgressBar :current="2" :total="7" />

    <!-- 헤더 -->
    <header class="page-header">
      <h1>☕ 커피 정보 입력</h1>
      <p>오늘 마실 커피에 대해 알려주세요</p>
    </header>

    <!-- 메인 폼 -->
    <main class="coffee-form">
      <div class="form-group">
        <label for="cafe_name">카페명 *</label>
        <input 
          id="cafe_name"
          v-model="coffeeInfo.cafe_name"
          type="text"
          placeholder="예: 블루보틀 청담점"
          required
        />
      </div>

      <div class="form-group">
        <label for="coffee_name">커피명 *</label>
        <input 
          id="coffee_name"
          v-model="coffeeInfo.coffee_name"
          type="text"
          placeholder="예: 에티오피아 구지 워시드"
          required
        />
      </div>

      <div class="form-group">
        <label for="origin">원산지</label>
        <input 
          id="origin"
          v-model="coffeeInfo.origin"
          type="text"
          placeholder="예: 에티오피아 시다모"
        />
      </div>

      <div class="form-group">
        <label for="price">가격 (원)</label>
        <input 
          id="price"
          v-model="coffeeInfo.price"
          type="number"
          placeholder="예: 8500"
        />
      </div>
    </main>

    <!-- 네비게이션 버튼 -->
    <footer class="navigation">
      <button @click="goBack" class="btn-secondary">
        ← 이전
      </button>
      <button @click="saveCoffeeInfo" class="btn-primary">
        다음 →
      </button>
    </footer>
  </div>
</template>
```

### 스타일링 특징
- **프리미엄 커피 테마**: 브라운 컬러 팔레트
- **폼 중심 레이아웃**: 깔끔한 입력 폼 디자인
- **진행률 시각화**: 상단 프로그레스 바
- **반응형 디자인**: 모바일/데스크탑 최적화

---

## 🔄 최근 변경사항

### 2025-07-30: 데모 모드 지원 추가
```typescript
// Before: 정적 라우팅
router.push('/unified-flavor')

// After: 데모 모드 감지 및 분기
const isDemo = route.path.startsWith('/demo')
if (isDemo) {
  router.push('/demo/unified-flavor')
} else {
  router.push('/unified-flavor')
}
```

**변경 이유**: 데모 체험하기 기능 구현을 위해 데모 전용 라우팅 필요

### 주요 개선사항
- ✅ 데모 데이터 자동 로딩 기능
- ✅ 라우팅 분기 처리 구현
- ✅ 데모 스토어 연동
- ✅ 실시간 폼 검증 개선

---

## 📊 데이터 구조

### 커피 정보 스키마
```typescript
interface CoffeeInfo {
  cafe_name: string      // 필수: 카페 또는 구매처명
  coffee_name: string    // 필수: 커피 제품명
  origin?: string        // 선택: 원산지 정보
  price?: number        // 선택: 구매 가격
  roasting_date?: string // 선택: 로스팅 날짜
  bean_type?: string    // 선택: 원두 종류
}
```

### 데모 데이터 예시
```typescript
const demoData = {
  cafe_name: '블루보틀 청담점',
  coffee_name: '에티오피아 구지 워시드',
  origin: '에티오피아 시다모',
  price: 8500,
  roasting_date: '2025-07-28',
  bean_type: 'Single Origin'
}
```

### 스토어 연동
```typescript
// coffeeRecordStore에 저장
coffeeRecordStore.updateCoffeeSetup({
  coffee_info: coffeeInfo.value
})
```

---

## 🎨 디자인 토큰

### 색상 팔레트
- **Primary**: `#7C5842` (브라운)
- **Background**: `#FFF8F0` (크림)
- **Input Border**: `#E8D5C4` (베이지)
- **Error**: `#DC3545` (레드)
- **Success**: `#28A745` (그린)

### 타이포그래피
- **제목**: `2rem`, `600` weight, `#7C5842`
- **라벨**: `0.9rem`, `500` weight, `#666`
- **입력값**: `1rem`, `400` weight, `#333`
- **도움말**: `0.8rem`, `400` weight, `#999`

### 폼 요소
```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E8D5C4;
  border-radius: 8px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #7C5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}
```

---

## 🧪 테스트 시나리오

### 기본 동작 테스트
1. **폼 입력**: 각 필드에 데이터 입력 가능
2. **필수 검증**: 카페명, 커피명 미입력 시 에러 표시
3. **데이터 저장**: 입력한 데이터가 스토어에 정상 저장
4. **네비게이션**: 이전/다음 버튼 정상 작동

### 데모 모드 테스트
1. **데모 데이터 로딩**: `/demo/coffee-info` 접근 시 자동 입력
2. **데모 라우팅**: 다음 버튼 클릭 시 `/demo/unified-flavor` 이동
3. **데모 스토어**: 데모 데이터가 올바르게 저장됨

### 에러 케이스
1. **네트워크 오류**: API 호출 실패 시 처리
2. **잘못된 데이터**: 유효하지 않은 입력값 처리
3. **라우팅 오류**: 잘못된 경로 접근 시 처리

---

## 📋 TODO

### 🔥 High Priority
- [ ] **자동완성 기능**: 카페명/커피명 자동완성 API 연동
- [ ] **이미지 업로드**: 커피/카페 사진 첨부 기능
- [ ] **위치 정보**: GPS 기반 카페 위치 자동 입력

### 🟡 Medium Priority
- [ ] **히스토리 기능**: 이전 입력 기록 빠른 선택
- [ ] **즐겨찾기**: 자주 가는 카페 즐겨찾기
- [ ] **QR 코드**: QR 스캔으로 커피 정보 자동 입력

### 🟢 Low Priority
- [ ] **소셜 연동**: SNS에서 커피 정보 가져오기
- [ ] **리뷰 연동**: 기존 리뷰 데이터 참조
- [ ] **추천 시스템**: AI 기반 커피 추천

---

## 🔗 관련 파일

### 의존성
- `stores/coffeeRecord.ts` - 커피 정보 저장
- `stores/demo.ts` - 데모 데이터 관리
- `components/ProgressBar.vue` - 진행률 표시
- `router/index.ts` - 라우팅 설정

### 연관 페이지
- `ModeSelectionView.vue` - 이전 페이지 (Step 1)
- `UnifiedFlavorView.vue` - 다음 페이지 (Step 3)
- `HomeView.vue` - 취소 시 이동 페이지

### 스타일 파일
- `assets/forms.css` - 폼 관련 스타일
- `assets/coffee-theme.css` - 커피 테마 스타일

---

## 📈 비즈니스 메트릭

### 사용자 행동 분석
- **입력 완료율**: Step 2에서 Step 3로 이동하는 비율
- **필드별 입력률**: 각 필드의 입력 빈도
- **데모 전환율**: 데모에서 실제 가입으로 전환하는 비율

### 데이터 품질
- **필수 필드 완성도**: 카페명, 커피명 입력률 100% 목표
- **선택 필드 활용도**: 원산지, 가격 입력률 70% 목표
- **데이터 정확성**: 유효한 형식의 데이터 입력률 95% 목표

---

**📝 문서 끝**

*작성자: CupNote 개발팀*  
*최종 수정: 2025년 7월 30일*  
*버전: 1.0*