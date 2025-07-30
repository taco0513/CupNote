# AuthView.vue

## 📋 개요

**목적**: 사용자 인증 통합 페이지 - 로그인, 회원가입, 소셜 로그인 제공  
**위치**: `/src/views/auth/AuthView.vue`  
**라우터**: `/auth`, `/auth?view=signup`  
**작성일**: 2025-07-30

CupNote 서비스의 메인 인증 게이트웨이로, 로그인과 회원가입을 하나의 페이지에서 통합 제공하며, Supabase 인증 시스템과 완전 연동된 사용자 인증 허브입니다.

---

## 🎯 주요 기능

### 1. **통합 인증 UI** ⭐ 핵심 기능

- **탭 전환**: 로그인 ↔ 회원가입 간편 전환
- **이메일 인증**: 기본 이메일/비밀번호 인증
- **소셜 로그인**: Google, GitHub 등 OAuth 제공
- **데모 계정**: 빠른 체험을 위한 데모 로그인

### 2. **Supabase 인증 연동**

- **실시간 인증**: Supabase Auth 완전 통합
- **세션 관리**: 자동 로그인 상태 유지
- **보안 강화**: 이메일 확인, 비밀번호 정책
- **에러 처리**: 친화적인 에러 메시지 표시

### 3. **사용자 경험 최적화**

- **자동 리다이렉트**: 로그인 후 의도한 페이지로 이동
- **입력 검증**: 실시간 폼 유효성 검사
- **로딩 상태**: 인증 진행 중 시각적 피드백
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

### 4. **프리미엄 디자인**

- **커피 테마**: 일관된 브라운 톤 디자인
- **그라데이션**: 고급스러운 배경 효과
- **반응형**: 모바일/데스크탑 최적화
- **애니메이션**: 부드러운 전환 효과

---

## 🔧 기술 명세

### Props

```typescript
// Props 없음 - URL 쿼리 파라미터로 상태 관리
```

### Events

```typescript
// 내부 이벤트만 사용, 부모 컴포넌트로 emit 없음
```

### Composables & Stores

```typescript
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationStore } from '../../stores/notification'

// 라우터 및 상태
const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

// 폼 상태
const activeTab = ref('login') // 'login' | 'signup'
const isLoading = ref(false)
const loginForm = ref({
  email: '',
  password: '',
})
const signupForm = ref({
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
})
```

### 주요 메서드

```typescript
const handleLogin = async () => {
  try {
    isLoading.value = true

    // 입력 검증
    if (!validateLoginForm()) return

    // Supabase 로그인
    const { data, error } = await authStore.signIn(loginForm.value.email, loginForm.value.password)

    if (error) throw error

    // 성공 알림
    notificationStore.showSuccess('로그인되었습니다!', '🎉 환영합니다')

    // 리다이렉트
    const redirectTo = route.query.redirect || '/mode-selection'
    router.push(redirectTo)
  } catch (error) {
    notificationStore.showError(error.message || '로그인에 실패했습니다.', '❌ 로그인 실패')
  } finally {
    isLoading.value = false
  }
}

const handleSignup = async () => {
  try {
    isLoading.value = true

    // 입력 검증
    if (!validateSignupForm()) return

    // Supabase 회원가입
    const { data, error } = await authStore.signUp(
      signupForm.value.email,
      signupForm.value.password,
      {
        full_name: signupForm.value.name,
      },
    )

    if (error) throw error

    // 이메일 확인 안내
    notificationStore.showSuccess('가입 완료! 이메일을 확인해주세요.', '📧 이메일 확인')
  } catch (error) {
    notificationStore.showError(error.message || '회원가입에 실패했습니다.', '❌ 가입 실패')
  } finally {
    isLoading.value = false
  }
}

const handleSocialLogin = async (provider) => {
  try {
    isLoading.value = true

    const { data, error } = await authStore.signInWithOAuth(provider)

    if (error) throw error

    // OAuth는 자동 리다이렉트됨
  } catch (error) {
    notificationStore.showError(`${provider} 로그인에 실패했습니다.`, '❌ 소셜 로그인 실패')
  } finally {
    isLoading.value = false
  }
}

const handleDemoLogin = async () => {
  try {
    isLoading.value = true

    // 데모 계정으로 로그인
    await authStore.signIn('demo@cupnote.app', 'demo123!')

    notificationStore.showSuccess('데모 계정으로 로그인되었습니다!', '🎭 데모 모드')

    router.push('/mode-selection')
  } catch (error) {
    notificationStore.showError('데모 로그인에 실패했습니다.', '❌ 데모 실패')
  } finally {
    isLoading.value = false
  }
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로

```typescript
{
  path: '/auth',
  name: 'auth',
  component: AuthView,
  meta: {
    requiresAuth: false,
    title: '로그인'
  }
}
```

### 쿼리 파라미터

- `?view=signup`: 회원가입 탭으로 직접 이동
- `?redirect=/target`: 로그인 후 리다이렉트 경로
- `?error=message`: 에러 메시지 표시

### 네비게이션 플로우

```
인증 페이지 접근 경로
├── 홈페이지 "무료로 시작하기" → /auth
├── 홈페이지 "회원가입" → /auth?view=signup
├── 네비게이션 가드 → /auth?redirect=/target
└── 직접 URL 접근 → /auth

로그인 성공 후 이동
├── 리다이렉트 경로가 있는 경우 → redirect 경로
├── 일반 로그인 → /mode-selection
└── 데모 로그인 → /mode-selection (데모 모드)
```

---

## 📱 UI/UX 구조

### 레이아웃 구조

```vue
<template>
  <div class="auth-view">
    <!-- 배경 그라데이션 -->
    <div class="auth-background"></div>

    <!-- 메인 컨테이너 -->
    <div class="auth-container">
      <!-- 로고 및 헤더 -->
      <header class="auth-header">
        <h1 class="auth-logo">☕ CupNote</h1>
        <p class="auth-subtitle">커피 테이스팅의 새로운 경험</p>
      </header>

      <!-- 탭 네비게이션 -->
      <nav class="auth-tabs">
        <button
          @click="activeTab = 'login'"
          :class="{ active: activeTab === 'login' }"
          class="tab-button"
        >
          로그인
        </button>
        <button
          @click="activeTab = 'signup'"
          :class="{ active: activeTab === 'signup' }"
          class="tab-button"
        >
          회원가입
        </button>
      </nav>

      <!-- 로그인 폼 -->
      <form
        v-if="activeTab === 'login'"
        @submit.prevent="handleLogin"
        class="auth-form"
      >
        <div class="form-group">
          <label for="login-email">이메일</label>
          <input
            id="login-email"
            v-model="loginForm.email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">비밀번호</label>
          <input
            id="login-password"
            v-model="loginForm.password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary btn-full"
        >
          <span v-if="isLoading">로그인 중...</span>
          <span v-else>🚀 로그인</span>
        </button>
      </form>

      <!-- 회원가입 폼 -->
      <form
        v-if="activeTab === 'signup'"
        @submit.prevent="handleSignup"
        class="auth-form"
      >
        <div class="form-group">
          <label for="signup-name">이름</label>
          <input
            id="signup-name"
            v-model="signupForm.name"
            type="text"
            placeholder="홍길동"
            required
          />
        </div>

        <div class="form-group">
          <label for="signup-email">이메일</label>
          <input
            id="signup-email"
            v-model="signupForm.email"
            type="email"
            placeholder="your@email.com"
            required
          />
        </div>

        <div class="form-group">
          <label for="signup-password">비밀번호</label>
          <input
            id="signup-password"
            v-model="signupForm.password"
            type="password"
            placeholder="8자 이상 입력하세요"
            required
          />
        </div>

        <div class="form-group">
          <label for="signup-confirm">비밀번호 확인</label>
          <input
            id="signup-confirm"
            v-model="signupForm.confirmPassword"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            required
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="btn-primary btn-full"
        >
          <span v-if="isLoading">가입 중...</span>
          <span v-else">📝 가입하기</span>
        </button>
      </form>

      <!-- 소셜 로그인 -->
      <div class="social-login">
        <div class="divider">또는</div>

        <button
          @click="handleSocialLogin('google')"
          :disabled="isLoading"
          class="btn-social btn-google"
        >
          🌐 Google로 계속하기
        </button>

        <button
          @click="handleSocialLogin('github')"
          :disabled="isLoading"
          class="btn-social btn-github"
        >
          🐙 GitHub로 계속하기
        </button>
      </div>

      <!-- 데모 로그인 -->
      <div class="demo-section">
        <p class="demo-text">빠른 체험을 원하시나요?</p>
        <button
          @click="handleDemoLogin"
          :disabled="isLoading"
          class="btn-demo"
        >
          🎭 데모 계정으로 체험하기
        </button>
      </div>

      <!-- 하단 링크 -->
      <footer class="auth-footer">
        <router-link to="/" class="footer-link">
          ← 홈으로 돌아가기
        </router-link>
        <router-link to="/about" class="footer-link">
          서비스 소개
        </router-link>
      </footer>
    </div>
  </div>
</template>
```

### 스타일링 특징

- **프리미엄 테마**: 브라운 컬러 팔레트와 그라데이션
- **카드 레이아웃**: 중앙 집중식 폼 카드
- **탭 인터페이스**: 로그인/회원가입 간편 전환
- **소셜 버튼**: 브랜드 컬러를 활용한 소셜 로그인 버튼

---

## 🔄 최근 변경사항

### 2025-07-30: 데모 계정 로그인 추가

```typescript
// Before: 소셜 로그인만 제공
const socialProviders = ['google', 'github']

// After: 데모 계정 추가
const handleDemoLogin = async () => {
  await authStore.signIn('demo@cupnote.app', 'demo123!')
  // 데모 모드로 빠른 체험 제공
}
```

**변경 이유**: 사용자가 회원가입 없이 서비스를 빠르게 체험할 수 있도록 개선

### 주요 개선사항

- ✅ 데모 계정 로그인 기능 추가
- ✅ 쿼리 파라미터 기반 탭 전환
- ✅ 자동 리다이렉트 기능 구현
- ✅ 실시간 폼 검증 개선
- ✅ 로딩 상태 및 에러 처리 강화

---

## 📊 데이터 구조

### 로그인 폼 스키마

```typescript
interface LoginForm {
  email: string // 이메일 주소 (필수)
  password: string // 비밀번호 (필수)
}
```

### 회원가입 폼 스키마

```typescript
interface SignupForm {
  name: string // 사용자 이름 (필수)
  email: string // 이메일 주소 (필수)
  password: string // 비밀번호 (필수, 8자 이상)
  confirmPassword: string // 비밀번호 확인 (필수)
}
```

### Supabase 사용자 메타데이터

```typescript
interface UserMetadata {
  full_name: string
  avatar_url?: string
  email_verified: boolean
  provider?: string
  created_at: string
}
```

### 폼 검증 규칙

```typescript
const validationRules = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '올바른 이메일 형식을 입력해주세요.',
  },
  password: {
    required: true,
    minLength: 8,
    message: '비밀번호는 8자 이상이어야 합니다.',
  },
  confirmPassword: {
    required: true,
    match: 'password',
    message: '비밀번호가 일치하지 않습니다.',
  },
  name: {
    required: true,
    minLength: 2,
    message: '이름은 2자 이상이어야 합니다.',
  },
}
```

---

## 🎨 디자인 토큰

### 색상 팔레트

```css
/* 메인 컬러 */
--color-primary: #7c5842; /* 브라운 */
--color-primary-light: #a0796a; /* 라이트 브라운 */
--color-secondary: #d4b896; /* 베이지 */

/* 배경 그라데이션 */
--gradient-auth: linear-gradient(135deg, #fff8f0 0%, #f5f0e8 50%, #e8d5c4 100%);

/* 폼 요소 */
--color-input-border: #e8d5c4;
--color-input-focus: #7c5842;
--color-input-error: #dc3545;

/* 소셜 로그인 */
--color-google: #4285f4;
--color-github: #333333;
--color-demo: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### 타이포그래피

```css
/* 로고 */
.auth-logo {
  font-size: 3rem;
  font-weight: 900;
  color: #7c5842;
  text-align: center;
  margin-bottom: 0.5rem;
}

/* 부제목 */
.auth-subtitle {
  font-size: 1rem;
  color: #666;
  text-align: center;
  margin-bottom: 2rem;
}

/* 탭 버튼 */
.tab-button {
  font-size: 1rem;
  font-weight: 600;
  padding: 1rem 2rem;
  border: none;
  background: transparent;
  color: #666;
  border-bottom: 3px solid transparent;
  transition: all 0.3s ease;
}

.tab-button.active {
  color: #7c5842;
  border-bottom-color: #7c5842;
}
```

### 폼 스타일

```css
.auth-form {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}

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
  padding: 0.75rem 1rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #7c5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.form-group input.error {
  border-color: #dc3545;
}
```

### 버튼 스타일

```css
/* 기본 버튼 */
.btn-primary {
  width: 100%;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #7c5842, #a0796a);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(124, 88, 66, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 소셜 로그인 버튼 */
.btn-social {
  width: 100%;
  padding: 0.75rem 1rem;
  margin-bottom: 0.75rem;
  border: 2px solid #e8d5c4;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-google:hover {
  border-color: #4285f4;
  color: #4285f4;
}

.btn-github:hover {
  border-color: #333333;
  color: #333333;
}

/* 데모 버튼 */
.btn-demo {
  width: 100%;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
}
```

---

## 🧪 테스트 시나리오

### 기본 인증 테스트

1. **로그인**: 유효한 계정으로 로그인 성공
2. **회원가입**: 새 계정 생성 및 이메일 확인
3. **탭 전환**: 로그인 ↔ 회원가입 탭 전환
4. **자동 리다이렉트**: 로그인 후 올바른 페이지 이동

### 소셜 로그인 테스트

1. **Google OAuth**: Google 계정으로 로그인
2. **GitHub OAuth**: GitHub 계정으로 로그인
3. **콜백 처리**: OAuth 콜백 URL 정상 처리

### 폼 검증 테스트

1. **이메일 검증**: 잘못된 이메일 형식 입력 시 에러
2. **비밀번호 검증**: 8자 미만 입력 시 에러
3. **비밀번호 확인**: 불일치 시 에러 표시
4. **필수 필드**: 빈 필드 제출 시 에러

### 에러 케이스

1. **잘못된 로그인**: 존재하지 않는 계정
2. **중복 가입**: 이미 존재하는 이메일로 가입 시도
3. **네트워크 오류**: Supabase 연결 실패
4. **OAuth 실패**: 소셜 로그인 취소 또는 실패

---

## 📋 TODO

### 🔥 High Priority

- [ ] **비밀번호 재설정**: 이메일 기반 비밀번호 찾기
- [ ] **이메일 확인**: 가입 후 이메일 인증 플로우
- [ ] **로그인 기억**: "로그인 상태 유지" 체크박스

### 🟡 Medium Priority

- [ ] **2FA 인증**: 2단계 인증 시스템
- [ ] **더 많은 소셜**: 카카오, 네이버 로그인 추가
- [ ] **프로필 사진**: 가입 시 프로필 이미지 업로드

### 🟢 Low Priority

- [ ] **기업 계정**: 기업용 대량 가입 시스템
- [ ] **SSO 연동**: 기업 SSO 시스템 연동
- [ ] **다국어**: 인증 페이지 다국어 지원

---

## 🔗 관련 파일

### 의존성

- `stores/auth.ts` - 인증 상태 관리
- `stores/notification.ts` - 알림 시스템
- `lib/supabase.ts` - Supabase 클라이언트
- `router/index.ts` - 인증 가드 설정

### 연관 페이지

- `HomeView.vue` - 인증 페이지로 유도
- `CallbackView.vue` - OAuth 콜백 처리
- `ModeSelectionView.vue` - 로그인 후 이동
- `ProfileView.vue` - 프로필 관리

### 컴포넌트

- `LoadingSpinner.vue` - 로딩 표시
- `ValidationMessage.vue` - 폼 검증 메시지
- `SocialButton.vue` - 소셜 로그인 버튼

---

## 📈 비즈니스 메트릭

### 전환율 지표

- **가입 전환율**: 방문자 중 회원가입 비율 (목표: 15%)
- **로그인 성공률**: 로그인 시도 중 성공 비율 (목표: 95%)
- **소셜 로그인 비율**: 전체 로그인 중 소셜 로그인 비율

### 사용자 행동

- **데모 사용률**: 데모 계정 로그인 비율
- **재로그인률**: 로그아웃 후 재로그인 비율
- **이탈률**: 인증 페이지에서 이탈하는 비율

### 기술적 지표

- **인증 속도**: 로그인 완료까지 평균 시간
- **에러율**: 인증 실패 비율 및 원인
- **OAuth 성공률**: 소셜 로그인 성공 비율

---

**📝 문서 끝**

_작성자: CupNote 개발팀_  
_최종 수정: 2025년 7월 30일_  
_버전: 1.0_
