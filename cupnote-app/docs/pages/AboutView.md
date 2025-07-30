# AboutView.vue

## 📋 개요

**목적**: CupNote 애플리케이션 소개 및 정보 제공 페이지  
**위치**: `/src/views/AboutView.vue`  
**라우터**: `/about`  
**작성일**: 2025-07-30

CupNote의 목적, 기능, 개발팀 정보 등을 제공하는 정적 정보 페이지입니다. 현재는 기본적인 Vue 템플릿 구조만 구현되어 있으며, 향후 확장 예정입니다.

---

## 🎯 주요 기능

### 1. **기본 정보 표시** ⭐ 핵심 기능 (예정)

- **앱 소개**: CupNote의 목적과 비전
- **주요 기능**: 테이스팅, 매칭, 통계 등 핵심 기능 소개
- **사용법 가이드**: 첫 사용자를 위한 간단한 가이드
- **버전 정보**: 현재 앱 버전 및 업데이트 히스토리

### 2. **개발팀 정보** (예정)

- **팀 소개**: CupNote 개발팀 소개
- **연락처**: 피드백 및 문의 채널
- **라이선스**: 오픈소스 라이선스 정보
- **크레딧**: 사용된 라이브러리 및 리소스

### 3. **법적 정보** (예정)

- **개인정보처리방침**: 사용자 데이터 처리 정책
- **이용약관**: 서비스 이용 규정
- **쿠키 정책**: 쿠키 사용에 대한 정보

### 4. **소셜 링크** (예정)

- **GitHub**: 오픈소스 저장소 링크
- **피드백**: 사용자 피드백 수집 채널
- **커뮤니티**: 사용자 커뮤니티 링크

---

## 🔧 기술 명세

### Props

```typescript
// Props 없음 - 정적 페이지
```

### Events

```typescript
// 이벤트 없음 - 정적 페이지
```

### Composables & Stores

```typescript
// 현재 사용되는 컴포저블이나 스토어 없음
// 향후 앱 정보를 위한 store 추가 예정
```

### 현재 구조

```vue
<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
{
  path: '/about',
  name: 'about',
  component: AboutView,
  meta: {
    title: '소개',
    requiresAuth: false  // 인증 불필요
  }
}
```

### 네비게이션 플로우

```
About 페이지 접근 경로
├── 네비게이션 메뉴 → /about
├── 푸터 링크 → /about
├── 설정 페이지 → /about
└── 직접 URL 접근 → /about

About 페이지에서 이동
├── 홈으로 → /
├── 로그인 → /auth (비로그인 사용자)
└── 피드백 → 외부 링크 (예정)
```

---

## 📱 UI/UX 구조 (예정)

### 계획된 레이아웃 구조

```vue
<template>
  <div class="about-view">
    <!-- 헤더 -->
    <header class="about-header">
      <div class="logo-section">
        <img src="/logo.png" alt="CupNote" class="app-logo" />
        <h1 class="app-title">CupNote</h1>
        <p class="app-subtitle">나만의 커피 테이스팅 노트</p>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <main class="about-main">
      <!-- 앱 소개 -->
      <section class="intro-section">
        <h2>CupNote란?</h2>
        <p class="intro-text">
          CupNote는 커피 애호가들을 위한 개인 맞춤형 테이스팅 노트 애플리케이션입니다. 체계적인 향미
          분석과 매칭 시스템을 통해 당신만의 커피 경험을 기록하고 성장시켜보세요.
        </p>
      </section>

      <!-- 주요 기능 -->
      <section class="features-section">
        <h2>주요 기능</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🍓</div>
            <h3>향미 분석</h3>
            <p>SCA 표준 플레이버 휠 기반 체계적인 향미 선택</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>매칭 시스템</h3>
            <p>개인 취향과 커피 특성을 분석한 매치 스코어</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>통계 대시보드</h3>
            <p>테이스팅 히스토리와 성장 트렌드 시각화</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>성취 시스템</h3>
            <p>레벨업과 배지 시스템으로 동기부여</p>
          </div>
        </div>
      </section>

      <!-- 사용법 가이드 -->
      <section class="guide-section">
        <h2>사용법</h2>
        <div class="steps-container">
          <div class="step-item">
            <div class="step-number">1</div>
            <div class="step-content">
              <h4>테이스팅 모드 선택</h4>
              <p>홈카페, 카페 방문, 랩 테이스팅 중 선택</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">2</div>
            <div class="step-content">
              <h4>커피 정보 입력</h4>
              <p>카페명, 커피명, 원산지 등 기본 정보</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">3</div>
            <div class="step-content">
              <h4>향미 선택</h4>
              <p>느껴지는 향미를 체계적으로 선택</p>
            </div>
          </div>
          <div class="step-item">
            <div class="step-number">4</div>
            <div class="step-content">
              <h4>결과 확인</h4>
              <p>매치 스코어와 개인화된 분석 결과</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 개발팀 정보 -->
      <section class="team-section">
        <h2>개발팀</h2>
        <div class="team-info">
          <p>CupNote는 커피를 사랑하는 개발자들이 만든 오픈소스 프로젝트입니다.</p>
          <div class="contact-links">
            <a href="https://github.com/cupnote/cupnote" class="contact-link">
              <span class="link-icon">🔗</span>
              GitHub
            </a>
            <a href="mailto:feedback@cupnote.app" class="contact-link">
              <span class="link-icon">📧</span>
              피드백
            </a>
          </div>
        </div>
      </section>

      <!-- 버전 정보 -->
      <section class="version-section">
        <h2>버전 정보</h2>
        <div class="version-info">
          <p><strong>현재 버전:</strong> v1.0.0</p>
          <p><strong>최근 업데이트:</strong> 2025년 7월 30일</p>
          <p><strong>라이선스:</strong> MIT License</p>
        </div>
      </section>
    </main>

    <!-- 푸터 -->
    <footer class="about-footer">
      <div class="footer-links">
        <router-link to="/privacy" class="footer-link">개인정보처리방침</router-link>
        <router-link to="/terms" class="footer-link">이용약관</router-link>
        <router-link to="/cookies" class="footer-link">쿠키 정책</router-link>
      </div>
      <p class="copyright">© 2025 CupNote. All rights reserved.</p>
    </footer>
  </div>
</template>
```

### 계획된 스타일링 특징

- **깔끔한 정보 레이아웃**: 읽기 쉬운 타이포그래피와 여백
- **카드 기반 구성**: 각 섹션을 카드로 구분하여 가독성 향상
- **프리미엄 디자인**: CupNote 디자인 시스템 일관성 유지
- **반응형 디자인**: 모바일과 데스크탑 모두 최적화

---

## 🔄 최근 변경사항

### 2025-07-30: 기본 구조 생성

```vue
<!-- Current: 기본 Vue 템플릿 -->
<template>
  <div class="about">
    <h1>This is an about page</h1>
  </div>
</template>

<!-- Planned: 완전한 About 페이지 -->
<template>
  <div class="about-view">
    <header class="about-header">...</header>
    <main class="about-main">...</main>
    <footer class="about-footer">...</footer>
  </div>
</template>
```

**변경 이유**: 현재는 기본 템플릿만 존재하며, 향후 완전한 소개 페이지로 확장 예정

### 예정된 주요 개선사항

- [ ] **콘텐츠 추가**: 앱 소개, 기능 설명, 사용법 가이드
- [ ] **디자인 완성**: CupNote 디자인 시스템 적용
- [ ] **인터랙티브 요소**: 기능 데모, 스크린샷 등
- [ ] **다국어 지원**: 영어/한국어 지원
- [ ] **SEO 최적화**: 메타 태그 및 구조화된 데이터

---

## 📊 데이터 구조 (예정)

### 앱 정보 스키마

```typescript
interface AppInfo {
  name: string
  version: string
  description: string
  features: Feature[]
  team: TeamMember[]
  contact: ContactInfo
  legal: LegalInfo
}

interface Feature {
  id: string
  title: string
  description: string
  icon: string
}

interface TeamMember {
  name: string
  role: string
  avatar?: string
  social?: SocialLinks
}

interface ContactInfo {
  email: string
  github: string
  feedback: string
}

interface LegalInfo {
  privacy: string
  terms: string
  license: string
}
```

---

## 🎨 디자인 토큰 (예정)

### 색상 팔레트

```css
/* About 페이지 전용 색상 */
--color-about-primary: #7c5842;
--color-about-secondary: #a0796a;
--color-about-background: #fff8f0;
--color-about-card: white;

/* 강조 색상 */
--color-accent-feature: #e8d5c4;
--color-accent-step: #d4b896;
--color-accent-link: #7c5842;
```

### 타이포그래피

```css
/* 헤더 */
.app-title {
  font-size: 3rem;
  font-weight: 900;
  color: #7c5842;
  text-align: center;
}

.app-subtitle {
  font-size: 1.2rem;
  color: #a0796a;
  text-align: center;
  font-weight: 300;
}

/* 섹션 제목 */
.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7c5842;
  margin-bottom: 1.5rem;
}

/* 본문 */
.body-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
}
```

### 카드 스타일

```css
.feature-card {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  border: 1px solid #f0e8dc;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(124, 88, 66, 0.15);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
```

---

## 🧪 테스트 시나리오

### 기본 기능 테스트

1. **페이지 로딩**: About 페이지 정상 로딩
2. **네비게이션**: 다른 페이지로 이동 확인
3. **반응형**: 다양한 화면 크기에서 레이아웃 확인
4. **접근성**: 스크린 리더 호환성 확인

### 콘텐츠 테스트 (향후)

1. **정보 정확성**: 앱 정보, 버전, 연락처 정확성
2. **링크 유효성**: 외부 링크 정상 작동
3. **이미지 최적화**: 로고, 스크린샷 최적화
4. **다국어**: 언어 전환 기능 (예정)

---

## 📋 TODO

### 🔥 High Priority

- [ ] **콘텐츠 작성**: 앱 소개, 기능 설명, 사용법 가이드
- [ ] **디자인 구현**: CupNote 디자인 시스템 적용
- [ ] **기본 정보**: 버전, 연락처, 법적 정보 추가

### 🟡 Medium Priority

- [ ] **인터랙티브 요소**: 기능 데모, 애니메이션 효과
- [ ] **스크린샷**: 앱 주요 기능 스크린샷 추가
- [ ] **팀 정보**: 개발팀 소개 및 연락처

### 🟢 Low Priority

- [ ] **다국어 지원**: 영어 버전 추가
- [ ] **SEO 최적화**: 메타 태그, 구조화된 데이터
- [ ] **소셜 공유**: 페이지 공유 기능
- [ ] **피드백 양식**: 인라인 피드백 수집 폼

---

## 🔗 관련 파일

### 의존성 (예정)

- `stores/app.ts` - 앱 정보 및 버전 관리
- `composables/useAppInfo.ts` - 앱 정보 관련 로직
- `assets/images/` - 로고, 스크린샷 등 이미지 파일

### 연관 페이지

- `HomeView.vue` - 홈 페이지 (로고 클릭 시 이동)
- `SettingsView.vue` - 설정 페이지 (About 링크)
- `AuthView.vue` - 로그인 페이지 (앱 소개 링크)

### 법적 페이지 (예정)

- `PrivacyView.vue` - 개인정보처리방침
- `TermsView.vue` - 이용약관
- `CookiesView.vue` - 쿠키 정책

---

## 📈 비즈니스 메트릭

### 사용자 참여도

- **페이지 방문율**: About 페이지 방문 비율
- **체류 시간**: About 페이지 평균 체류 시간
- **바운스율**: About 페이지에서 즉시 이탈하는 비율

### 콘텐츠 효과성

- **피드백 전환율**: About 페이지에서 피드백 제출 비율
- **가입 전환율**: About 페이지 방문 후 회원가입 비율
- **소셜 공유**: About 페이지 소셜 공유 횟수

### 정보 전달 효과

- **기능 이해도**: About 페이지 방문 후 주요 기능 사용률
- **가이드 효과**: 사용법 가이드 확인 후 완주율
- **브랜드 인지도**: CupNote 브랜드 검색량 변화

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 1.0_
