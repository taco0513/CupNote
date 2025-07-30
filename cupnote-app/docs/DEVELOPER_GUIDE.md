# 🛠️ CupNote 개발자 가이드

CupNote 프로젝트의 개발 환경 설정부터 배포까지 개발자가 알아야 할 모든 것을 담은 종합 가이드입니다.

## 📋 목차

1. [개발 환경 설정](#개발-환경-설정)
2. [프로젝트 아키텍처](#프로젝트-아키텍처)
3. [개발 워크플로우](#개발-워크플로우)
4. [코딩 컨벤션](#코딩-컨벤션)
5. [테스팅 가이드](#테스팅-가이드)
6. [디버깅 가이드](#디버깅-가이드)
7. [성능 최적화](#성능-최적화)
8. [트러블슈팅](#트러블슈팅)

## 🚀 개발 환경 설정

### 필수 도구 설치

```bash
# Node.js 18+ 설치 (권장: 20+)
# https://nodejs.org에서 다운로드

# Bun 설치 (권장 패키지 매니저)
curl -fsSL https://bun.sh/install | bash

# Git 설치
# https://git-scm.com에서 다운로드

# VS Code 설치 (권장 IDE)
# https://code.visualstudio.com에서 다운로드
```

### VS Code 확장 프로그램

```json
// .vscode/extensions.json
{
  \"recommendations\": [
    \"Vue.volar\",           // Vue 3 지원
    \"esbenp.prettier-vscode\",    // 코드 포매팅
    \"dbaeumer.vscode-eslint\",    // ESLint
    \"ms-playwright.playwright\",  // E2E 테스트
    \"ms-vscode.vscode-typescript-next\" // TypeScript
  ]
}
```

### 프로젝트 설정

```bash
# 1. 저장소 클론
git clone https://github.com/taco0513/CupNote.git
cd CupNote/cupnote-app

# 2. 의존성 설치 (Bun 권장)
bun install
# 또는 npm install

# 3. 환경 변수 설정
cp .env.example .env.local

# 4. Supabase 설정 입력
# .env.local 파일 편집
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase 로컬 개발 설정

```bash
# Supabase CLI 설치
npm install -g @supabase/cli

# 로컬 Supabase 시작
supabase start

# 마이그레이션 실행
supabase db push

# 시드 데이터 로드 (선택사항)
supabase db seed
```

## 🏗️ 프로젝트 아키텍처

### 폴더 구조 및 역할

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── charts/         # 데이터 시각화 컴포넌트
│   │   ├── BarChart.vue
│   │   ├── DoughnutChart.vue
│   │   └── LineChart.vue
│   ├── pro/           # Pro 모드 전용 컴포넌트
│   │   ├── ProBrewingChart.vue
│   │   ├── ProQcChart.vue
│   │   └── ProSensorySlider.vue
│   ├── ErrorBoundary.vue      # 전역 에러 처리
│   ├── LoadingSpinner.vue     # 로딩 상태
│   └── SkeletonLoader.vue     # 스켈레톤 로딩
├── views/              # 페이지 컴포넌트
│   ├── tasting-flow/   # 테이스팅 플로우 (11개 단계)
│   ├── HomeView.vue    # 메인 대시보드
│   ├── StatsView.vue   # 통계 페이지
│   └── RecordsListView.vue    # 기록 목록
├── stores/             # Pinia 상태 관리
│   ├── tastingSession.ts      # 테이스팅 세션
│   ├── notification.ts        # 알림 시스템
│   └── auth.js        # 사용자 인증
├── composables/        # Vue 컴포저블
│   ├── useErrorHandler.ts     # 에러 처리
│   └── useFlowNavigation.ts   # 플로우 네비게이션
├── lib/               # 유틸리티
│   └── supabase.ts    # Supabase 클라이언트
├── router/            # 라우팅
│   └── index.ts       # 라우트 정의 및 가드
└── assets/            # 정적 리소스
    ├── images/        # 이미지 파일
    └── styles/        # 전역 스타일
```

### 아키텍처 패턴

#### 1. **컴포넌트 아키텍처**
- **Atomic Design**: 작은 컴포넌트부터 페이지까지 계층적 구조
- **Composition API**: Vue 3의 최신 패턴 사용
- **Props & Emits**: 명확한 컴포넌트 인터페이스

#### 2. **상태 관리 패턴**
- **Pinia**: Vue 3에 최적화된 상태 관리
- **Store 분리**: 도메인별 스토어 분리 (session, auth, notification)
- **Reactive**: 반응형 데이터로 UI 자동 업데이트

#### 3. **라우팅 패턴**
- **Route Guards**: 인증 및 세션 검증
- **Lazy Loading**: 페이지별 코드 스플리팅
- **Meta Fields**: 라우트별 메타데이터 관리

## ⚡ 개발 워크플로우

### 1. 기능 개발 프로세스

```bash
# 1. 새 기능 브랜치 생성
git checkout -b feature/new-feature-name

# 2. 개발 서버 시작
bun dev

# 3. 개발 진행
# - 컴포넌트 작성
# - 스토어 로직 구현
# - 테스트 작성

# 4. 코드 품질 검사
bun run lint          # ESLint 검사
bun run type-check    # TypeScript 검사
bun test              # 단위 테스트

# 5. 빌드 테스트
bun run build         # 프로덕션 빌드

# 6. 커밋 및 푸시
git add .
git commit -m \"feat: add new feature\"
git push origin feature/new-feature-name

# 7. Pull Request 생성
```

### 2. 일일 개발 루틴

```bash
# 아침 루틴
git pull origin main           # 최신 코드 동기화
bun install                    # 의존성 업데이트 확인
bun dev                        # 개발 서버 시작

# 개발 중
bun run lint --fix            # 코드 자동 수정
bun test                      # 테스트 실행
bun run type-check            # 타입 검사

# 종료 전
git status                    # 변경사항 확인
git add . && git commit       # 작업 내용 커밋
```

### 3. 코드 리뷰 체크리스트

- [ ] **기능**: 요구사항에 맞게 구현되었는가?
- [ ] **타입 안정성**: TypeScript 에러가 없는가?  
- [ ] **테스트**: 적절한 테스트가 작성되었는가?
- [ ] **성능**: 불필요한 렌더링이나 메모리 누수가 없는가?
- [ ] **접근성**: 웹 접근성 가이드라인을 준수하는가?
- [ ] **반응형**: 모바일/태블릿/데스크톱에서 정상 작동하는가?

## 📝 코딩 컨벤션

### 1. Vue 컴포넌트 패턴

```vue
<!-- 권장 컴포넌트 구조 -->
<template>
  <div class=\"component-name\">
    <!-- 템플릿 내용 -->
  </div>
</template>

<script setup lang=\"ts\">
import { ref, computed, onMounted } from 'vue'
import type { ComponentProps } from './types'

// Props 정의
const props = defineProps<ComponentProps>()

// Emits 정의  
const emit = defineEmits<{
  update: [value: string]
  submit: [data: FormData]
}>()

// 상태 관리
const state = ref('')
const computed = computed(() => state.value.toUpperCase())

// 메서드
const handleSubmit = () => {
  emit('submit', formData)
}

// 생명주기
onMounted(() => {
  // 초기화 로직
})
</script>

<style scoped>
.component-name {
  /* 컴포넌트 스타일 */
}
</style>
```

### 2. 네이밍 컨벤션

```typescript
// 파일명: PascalCase
// Components: MyComponent.vue
// Views: HomeView.vue
// Stores: tastingSession.ts

// 함수: camelCase
const getUserData = () => {}
const handleButtonClick = () => {}

// 상수: SCREAMING_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com'
const MAX_RETRY_COUNT = 3

// 인터페이스: PascalCase with 'I' prefix (선택사항)
interface TastingRecord {
  id: string
  name: string
}

// 타입: PascalCase
type UserRole = 'admin' | 'user' | 'guest'
```

### 3. 커밋 메시지 규칙

```bash
# 형식: type(scope): description

# 타입 목록
feat:     # 새로운 기능
fix:      # 버그 수정  
docs:     # 문서 수정
style:    # 코드 포매팅
refactor: # 코드 리팩토링
test:     # 테스트 추가/수정
chore:    # 빌드 설정 등

# 예시
feat(auth): add login functionality
fix(chart): resolve data loading issue
docs(readme): update installation guide
```

## 🧪 테스팅 가이드

### 1. 단위 테스트 (Vitest)

```typescript
// tests/components/LoadingSpinner.test.ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import LoadingSpinner from '@/components/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    const wrapper = mount(LoadingSpinner)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('displays custom message', () => {
    const message = 'Loading data...'
    const wrapper = mount(LoadingSpinner, {
      props: { message }
    })
    expect(wrapper.text()).toContain(message)
  })
})
```

### 2. E2E 테스트 (Playwright)

```typescript
// tests/e2e/tasting-flow.spec.ts
import { test, expect } from '@playwright/test'

test('cafe mode tasting flow', async ({ page }) => {
  await page.goto('/mode-selection')
  
  // 모드 선택
  await page.click('[data-testid=\"cafe-mode\"]')
  await expect(page).toHaveURL('/coffee-info')
  
  // 커피 정보 입력
  await page.fill('[data-testid=\"coffee-name\"]', 'Test Coffee')
  await page.fill('[data-testid=\"cafe-name\"]', 'Test Cafe')
  await page.click('[data-testid=\"next-button\"]')
  
  // 결과 확인
  await expect(page).toHaveURL('/flavor-selection')
})
```

### 3. 테스트 실행

```bash
# 단위 테스트
bun test                    # 전체 테스트
bun test --watch           # 변경사항 감지하여 자동 실행
bun test LoadingSpinner    # 특정 테스트

# E2E 테스트  
bun test:e2e              # Playwright 테스트
bun test:e2e --headed     # 브라우저 창으로 실행
bun test:e2e --debug      # 디버그 모드

# 커버리지
bun test --coverage       # 테스트 커버리지 확인
```

## 🐛 디버깅 가이드

### 1. Vue DevTools 활용

```bash
# Vue DevTools 설치
# Chrome: https://chrome.google.com/webstore/detail/vuejs-devtools
# Firefox: https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/
```

### 2. 디버깅 도구들

```typescript
// 1. Console 디버깅
console.log('Debug info:', { state, props })
console.table(arrayData)  // 배열 데이터를 테이블로 출력

// 2. Vue 컴포넌트 디버깅
import { getCurrentInstance } from 'vue'

const instance = getCurrentInstance()
console.log('Component instance:', instance)

// 3. Pinia 스토어 디버깅
const store = useTastingSessionStore()
console.log('Store state:', store.$state)

// 4. Performance 측정
console.time('operation')
// ... 코드 실행
console.timeEnd('operation')
```

### 3. 일반적인 문제 해결

```typescript
// 1. 반응성 문제
// 잘못된 방법
const data = { items: [] }
data.items.push(newItem)  // 반응성 X

// 올바른 방법
const data = ref({ items: [] })
data.value.items.push(newItem)  // 반응성 O

// 2. 비동기 처리
// async/await 사용
const fetchData = async () => {
  try {
    const response = await api.getData()
    return response.data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

// 3. 메모리 누수 방지
onUnmounted(() => {
  // 이벤트 리스너 제거
  window.removeEventListener('resize', handleResize)
  
  // 타이머 정리
  clearInterval(intervalId)
})
```

## ⚡ 성능 최적화

### 1. 번들 크기 최적화

```typescript
// 1. 동적 임포트 사용
const Chart = defineAsyncComponent(() => import('./Chart.vue'))

// 2. Tree Shaking 활용
import { ref, computed } from 'vue'  // 필요한 것만 import
// import * as Vue from 'vue'  // 지양

// 3. 라이브러리 최적화
import debounce from 'lodash/debounce'  // 개별 함수만
// import _ from 'lodash'  // 전체 라이브러리 지양
```

### 2. 렌더링 최적화

```vue
<template>
  <!-- 1. v-show vs v-if 적절히 사용 -->
  <div v-show=\"isVisible\">자주 토글되는 요소</div>
  <div v-if=\"shouldRender\">조건부 렌더링</div>
  
  <!-- 2. key 사용으로 효율적인 리스트 렌더링 -->
  <li v-for=\"item in items\" :key=\"item.id\">
    {{ item.name }}
  </li>
  
  <!-- 3. 큰 리스트는 가상화 고려 -->
  <VirtualList :items=\"manyItems\" />
</template>

<script setup>
// 4. computed vs watch 적절히 사용
const expensiveValue = computed(() => {
  return heavyCalculation(props.data)
})

// 5. 메모이제이션 활용
const memoizedComponent = defineAsyncComponent(() => 
  import('./ExpensiveComponent.vue')
)
</script>
```

### 3. 네트워크 최적화

```typescript
// 1. API 요청 최적화
const cache = new Map()

const fetchWithCache = async (url: string) => {
  if (cache.has(url)) {
    return cache.get(url)
  }
  
  const data = await fetch(url).then(r => r.json())
  cache.set(url, data)
  return data
}

// 2. 디바운싱으로 API 호출 최적화
import { debounce } from 'lodash'

const debouncedSearch = debounce(async (query: string) => {
  const results = await searchAPI(query)
  searchResults.value = results
}, 300)

// 3. 프리로딩
const preloadRoute = (routeName: string) => {
  router.resolve({ name: routeName }).href
}
```

## 🔧 트러블슈팅

### 1. 개발 환경 문제

```bash
# Node.js 버전 문제
node --version  # 18+ 확인
nvm use 20      # nvm 사용시 버전 변경

# 의존성 문제  
rm -rf node_modules bun.lockb
bun install

# 포트 충돌
lsof -ti:5173 | xargs kill -9  # 5173 포트 프로세스 종료
bun dev --port 3000             # 다른 포트 사용

# Supabase 연결 문제
echo $VITE_SUPABASE_URL        # 환경변수 확인
supabase status                # 로컬 Supabase 상태 확인
```

### 2. 빌드 문제

```bash
# TypeScript 에러
bun run type-check             # 타입 에러 확인
tsc --noEmit --skipLibCheck    # 더 상세한 타입 검사

# 빌드 메모리 부족
export NODE_OPTIONS=\"--max-old-space-size=4096\"
bun run build

# 환경변수 문제  
cat .env.local                 # 환경변수 파일 확인
printenv | grep VITE          # 런타임 환경변수 확인
```

### 3. 런타임 문제

```typescript
// 1. 에러 경계 활용
// ErrorBoundary.vue로 예상치 못한 에러 처리

// 2. 전역 에러 핸들러
import { useErrorHandler } from '@/composables/useErrorHandler'

const { handleError } = useErrorHandler()

try {
  await riskyOperation()
} catch (error) {
  handleError(error, { context: 'ComponentName' })
}

// 3. 네트워크 에러 처리
const retryFetch = async (url: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fetch(url)
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * i))
    }
  }
}
```

### 4. 일반적인 Vue 문제

```typescript
// 1. 반응성 손실
// 문제: 객체 구조분해시 반응성 손실
const { name } = toRefs(props)  // 올바른 방법
// const { name } = props       // 반응성 손실

// 2. 무한 루프
// 문제: computed에서 상태 변경
const badComputed = computed(() => {
  someState.value = 'new value'  // 무한 루프!
  return someValue
})

// 해결: watch 사용
watch(someValue, (newVal) => {
  someState.value = transform(newVal)
})

// 3. 메모리 누수
onUnmounted(() => {
  // 정리 작업 수행
  clearTimeout(timerId)
  eventBus.off('event', handler)
})
```

## 📚 추가 리소스

- **Vue 3 공식 문서**: https://vuejs.org/
- **Pinia 가이드**: https://pinia.vuejs.org/
- **Vite 문서**: https://vitejs.dev/
- **Supabase 문서**: https://supabase.com/docs
- **TypeScript 핸드북**: https://www.typescriptlang.org/docs/

---

이 가이드는 CupNote 프로젝트의 효율적인 개발을 위한 핵심 정보를 담고 있습니다. 궁금한 점이 있으면 이슈를 생성하거나 팀에 문의해 주세요!