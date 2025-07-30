# HomeView.vue

## 📋 개요

**목적**: CupNote 애플리케이션의 메인 랜딩 페이지  
**위치**: `/src/views/HomeView.vue`  
**라우터**: `/` (루트 경로)  
**작성일**: 2025-07-30

사용자가 CupNote에 처음 접속했을 때 보게 되는 메인 페이지로, 서비스 소개와 핵심 기능 안내, 그리고 데모 체험 및 가입 유도를 담당하는 핵심 랜딩 페이지입니다.

---

## 🎯 주요 기능

### 1. **프리미엄 커피 테마 디자인**

- 고급스러운 브라운 톤 색상 팔레트
- 그라데이션 배경과 플로팅 애니메이션
- 커피 이모지와 시각적 요소로 브랜딩 강화

### 2. **데모 체험하기 기능** ⭐ 핵심 기능

- 실제 카페모드 테이스팅 플로우 체험 가능
- 로그인 없이 `/demo` 경로로 이동
- 알림 중복 방지 시스템으로 안정적인 UX

### 3. **CTA (Call-to-Action) 버튼들**

- 🚀 무료로 시작하기 → `/auth` (회원가입/로그인)
- 📝 회원가입 → `/auth?view=signup`
- ✨ 데모 체험하기 → `/demo` (실제 플로우)

### 4. **서비스 소개 섹션**

- 3가지 핵심 가치 제안 카드
- 4단계 사용법 안내
- 최종 가입 유도 섹션

---

## 🔧 기술 명세

### Props

```typescript
// Props 없음 - 독립적인 랜딩 페이지
```

### Composables & Stores

```typescript
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useNotificationStore } from '../stores/notification'
import { useAuthStore } from '../stores/auth'
import { useDemoStore } from '../stores/demo'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const demoStore = useDemoStore()

// 인증 상태에 따른 조건부 렌더링
const isAuthenticated = computed(() => authStore.isAuthenticated)
```

### 주요 메서드

```typescript
const showDemo = () => {
  // 성공 알림 표시
  notificationStore.showSuccess(
    '카페모드 데모를 시작합니다! 실제 테이스팅 과정을 체험해보세요 ☕',
    '🎉 데모 시작',
    { duration: 3000 },
  )

  // 데모 스토어 초기화
  demoStore.startDemo()

  // 데모 페이지로 이동
  setTimeout(() => {
    window.location.href = '/demo'
  }, 1000)
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
{
  path: '/',
  name: 'home',
  component: HomeView,
  // 인증 불필요 - 누구나 접근 가능
}
```

### 네비게이션 플로우

```
HomeView (/)
├── 무료로 시작하기 → /auth (회원가입/로그인)
├── 회원가입 → /auth?view=signup
├── 데모 체험하기 → /demo (모드 선택)
└── 내비게이션 링크들
    ├── 홈 → /
    ├── 소개 → /about
    └── 로그인 → /auth/login
```

---

## 📱 UI/UX 구조

### 레이아웃 구조

```vue
<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="title-main">CupNote</span>
          <span class="title-sub">커피 테이스팅 노트</span>
        </h1>
        <p class="hero-description">
          당신의 커피 감각을 기록하고<br />
          로스터의 의도와 비교해보세요
        </p>
        <div class="hero-actions">
          <!-- 인증 상태에 따른 조건부 버튼 -->
          <RouterLink v-if="isAuthenticated" to="/mode-selection">
            ☕ 커피 기록 시작하기
          </RouterLink>
          <RouterLink v-else to="/auth"> 🚀 무료로 시작하기 </RouterLink>

          <RouterLink to="/auth?view=signup"> 📝 회원가입 </RouterLink>

          <button @click="showDemo" class="btn-demo">✨ 데모 체험하기</button>
        </div>
      </div>
      <div class="hero-image">
        <div class="coffee-cup">☕</div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <h2>이런 분들께 추천해요</h2>
      <div class="features-grid">
        <!-- 3개 특징 카드 -->
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="how-it-works-section">
      <h2>간단한 사용법</h2>
      <div class="steps-container">
        <!-- 4단계 사용법 -->
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <h2>지금 시작해보세요!</h2>
      <!-- 최종 가입 유도 -->
    </section>
  </div>
</template>
```

### 주요 섹션 설명

#### 1. Hero Section

- **큰 제목**: CupNote + 부제목
- **설명 텍스트**: 핵심 가치 제안
- **CTA 버튼들**: 3개 주요 액션
- **시각적 요소**: 플로팅 커피 이모지

#### 2. Features Section

- **정확한 감각 평가** 🎯
- **성장하는 커피 감각** 📈
- **재미있는 도전** 🏆

#### 3. How It Works Section

- **4단계 사용법** 시각적 표현
- 단계별 아이콘과 설명
- 화살표로 플로우 표시

#### 4. CTA Section

- **최종 가입 유도** 섹션
- 다크 브라운 배경으로 강조
- 큰 버튼으로 액션 유도

---

## 🔄 최근 변경사항

### 2025-07-30: 데모 체험하기 기능 완전 개편

```typescript
// Before: 알림창만 표시하는 가짜 데모
const showDemo = () => {
  const demoSequence = [
    /* 6개 알림 시퀀스 */
  ]
  // 알림만 순차적으로 표시...
}

// After: 실제 테이스팅 플로우로 이동
const showDemo = () => {
  notificationStore.showSuccess(/* 시작 알림 */)
  demoStore.startDemo()
  window.location.href = '/demo'
}
```

**변경 이유**:

- 기존 알림창 방식은 실제 체험이 불가능했음
- 사용자가 실제 테이스팅 플로우를 체험할 수 있도록 개선
- 데모 모드 인프라 구축으로 완전한 기능 체험 제공

### 알림 중복 문제 해결

- ✅ 데모 실행 상태 관리 제거 (더 이상 필요 없음)
- ✅ 타이머 관리 시스템 제거 (단순한 페이지 이동으로 변경)
- ✅ 사용자 경험 대폭 개선

### 디자인 시스템 개편

- ✅ 프리미엄 커피 테마 전면 적용
- ✅ 그라데이션 배경과 시각적 효과
- ✅ 반응형 디자인 완성

---

## 🎨 디자인 토큰

### 색상 팔레트

```css
/* Primary Colors */
--color-primary: #7c5842; /* 브라운 */
--color-primary-light: #a0796a; /* 라이트 브라운 */
--color-secondary: #d4b896; /* 베이지 */

/* Background */
--gradient-subtle: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 100%);
--color-background: #fff8f0; /* 크림 */

/* Text */
--color-text-primary: #7c5842; /* 다크 브라운 */
--color-text-secondary: #666; /* 그레이 */
--color-text-light: rgba(255, 255, 255, 0.9);
```

### 타이포그래피

```css
/* Hero Title */
.title-main {
  font-size: 4rem;
  font-weight: 900;
  letter-spacing: -2px;
}

/* Sections */
.section-title {
  font-size: 2.5rem;
  font-weight: 700;
}

/* Body Text */
.hero-description {
  font-size: 1.25rem;
  line-height: 1.8;
}
```

### 버튼 스타일

```css
/* Primary Button */
.btn-primary {
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

/* Demo Button */
.btn-demo {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Secondary Button */
.btn-secondary {
  background: white;
  color: #7c5842;
  border: 2px solid #e8d5c4;
}
```

---

## 📊 성능 최적화

### 이미지 최적화

- **커피 이모지**: 텍스트 기반으로 로딩 속도 향상
- **아이콘들**: 유니코드 이모지 사용으로 HTTP 요청 최소화

### 애니메이션 최적화

```css
/* Float Animation */
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.coffee-cup {
  animation: float 3s ease-in-out infinite;
}
```

### 반응형 설계

- **Breakpoint**: 768px
- **Mobile First**: 모바일 우선 설계
- **Flexible Grid**: CSS Grid와 Flexbox 활용

---

## 🧪 테스트 시나리오

### 기본 동작 테스트

1. **페이지 로딩**: 모든 섹션 정상 렌더링
2. **CTA 버튼**: 각 버튼 클릭 시 올바른 페이지 이동
3. **데모 체험**: 데모 버튼 클릭 시 `/demo` 이동 및 알림 표시
4. **반응형**: 다양한 화면 크기에서 레이아웃 확인

### 인증 상태별 테스트

1. **비로그인 상태**: "무료로 시작하기" 버튼 표시
2. **로그인 상태**: "커피 기록 시작하기" 버튼 표시

### 데모 기능 테스트

1. **데모 시작**: 알림 표시 → 1초 후 `/demo` 이동
2. **데모 스토어**: `demoStore.startDemo()` 호출 확인
3. **연속 클릭**: 중복 클릭 시에도 정상 동작

---

## 📋 TODO

### 🔥 High Priority

- [ ] **로딩 성능**: 초기 로딩 속도 최적화 (현재 만족스럽지만 더 개선 가능)
- [ ] **SEO 개선**: meta 태그, structured data 추가
- [ ] **접근성**: ARIA 속성, 키보드 네비게이션 개선

### 🟡 Medium Priority

- [ ] **A/B 테스트**: CTA 버튼 위치/색상/텍스트 최적화
- [ ] **애니메이션**: 스크롤 기반 애니메이션 추가
- [ ] **개인화**: 재방문 사용자 맞춤 콘텐츠

### 🟢 Low Priority

- [ ] **다국어**: 영어 버전 지원
- [ ] **다크 모드**: 다크 테마 옵션
- [ ] **소셜 증명**: 사용자 리뷰, 통계 표시

---

## 🔗 관련 파일

### 의존성

- `stores/notification.ts` - 알림 시스템
- `stores/auth.ts` - 인증 상태 관리
- `stores/demo.ts` - 데모 모드 관리
- `router/index.ts` - 라우팅 설정

### 연관 페이지

- `AuthView.vue` - 회원가입/로그인 페이지
- `ModeSelectionView.vue` - 데모 또는 실제 테이스팅 시작
- `AboutView.vue` - 서비스 소개 상세

### 스타일 파일

- `assets/main.css` - 전역 스타일
- `assets/design-tokens.css` - 디자인 토큰 정의

---

## 📈 비즈니스 메트릭

### 전환율 목표

- **데모 체험률**: 방문자의 15% 이상
- **회원가입 전환율**: 데모 체험자의 25% 이상
- **재방문율**: 가입자의 60% 이상

### 사용자 행동 분석

- **평균 체류 시간**: 2분 이상 목표
- **스크롤 깊이**: 80% 이상 사용자 비율
- **CTA 클릭률**: 주요 버튼별 클릭률 추적

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 2.0_
