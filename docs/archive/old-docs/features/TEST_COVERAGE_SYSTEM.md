# 테스트 커버리지 시스템

> Vitest + React Testing Library + Playwright를 활용한 완전한 테스트 환경

## 📋 개요

CupNote의 테스트 시스템은 3계층 테스트 피라미드를 구현하여 코드 품질과 안정성을 보장합니다:
- **단위 테스트**: 개별 함수와 서비스 로직 검증
- **컴포넌트 테스트**: React 컴포넌트 렌더링 및 상호작용 테스트
- **E2E 테스트**: 전체 사용자 플로우 검증

## 🏗️ 테스트 아키텍처

### 1. 테스트 환경 구성

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
})
```

### 2. 테스트 설정 파일

```typescript
// src/test/setup.ts
import { vi } from 'vitest'
import '@testing-library/jest-dom'
import React from 'react'

// Next.js 모킹
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
  }),
}))

// Supabase 모킹
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: { getUser: vi.fn() },
    from: vi.fn(),
  },
}))
```

### 3. Playwright E2E 구성

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
})
```

## 🧪 테스트 범위

### 1. 단위 테스트 (Unit Tests)

#### 캐시 시스템 테스트
```typescript
// src/lib/__tests__/cache.test.ts
describe('CacheService', () => {
  it('should store and retrieve cached data', () => {
    const cache = new CacheService()
    const testData = { id: 1, name: 'Test Coffee' }
    
    cache.set('test-key', testData, 5000)
    const result = cache.get('test-key')
    
    expect(result).toEqual(testData)
  })

  it('should expire cached data after TTL', async () => {
    const cache = new CacheService()
    cache.set('expire-key', 'test-data', 100)
    
    await new Promise(resolve => setTimeout(resolve, 150))
    
    expect(cache.get('expire-key')).toBeNull()
  })
})
```

#### 쿼리 최적화 테스트
```typescript
// src/lib/__tests__/queryOptimizer.test.ts
describe('QueryOptimizer', () => {
  it('should batch multiple requests', async () => {
    const optimizer = new QueryOptimizer()
    const spy = vi.spyOn(supabase, 'from')
    
    const promises = [
      optimizer.getCoffeeRecord('1'),
      optimizer.getCoffeeRecord('2'),
      optimizer.getCoffeeRecord('3'),
    ]
    
    await Promise.all(promises)
    
    // 개별 요청 대신 배치 요청 1회만 호출되어야 함
    expect(spy).toHaveBeenCalledTimes(1)
  })
})
```

#### 오프라인 동기화 테스트
```typescript
// src/lib/__tests__/offlineSync.test.ts
describe('OfflineSync', () => {
  it('should queue operations when offline', () => {
    const sync = new OfflineSync()
    
    // 오프라인 상태 시뮬레이션
    Object.defineProperty(navigator, 'onLine', { value: false })
    
    sync.createRecord({ name: 'Offline Coffee' })
    
    expect(sync.getQueuedOperations()).toHaveLength(1)
  })

  it('should sync queued operations when back online', async () => {
    const sync = new OfflineSync()
    const mockCreate = vi.spyOn(supabase.from('coffee_records'), 'insert')
    
    // 오프라인에서 작업 큐잉
    Object.defineProperty(navigator, 'onLine', { value: false })
    sync.createRecord({ name: 'Queued Coffee' })
    
    // 온라인 복구 시뮬레이션
    Object.defineProperty(navigator, 'onLine', { value: true })
    await sync.processQueue()
    
    expect(mockCreate).toHaveBeenCalledWith({ name: 'Queued Coffee' })
  })
})
```

### 2. 컴포넌트 테스트 (Component Tests)

#### LazyImage 컴포넌트 테스트
```typescript
// src/components/__tests__/LazyImage.test.tsx
describe('LazyImage', () => {
  it('renders loading skeleton initially', () => {
    render(<LazyImage src="/test-image.jpg" alt="Test" />)
    
    expect(screen.getByTestId('image-skeleton')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('loads image when in viewport', async () => {
    const mockIntersectionObserver = vi.fn()
    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    })
    window.IntersectionObserver = mockIntersectionObserver

    render(<LazyImage src="/test-image.jpg" alt="Test" />)
    
    // Intersection Observer 콜백 시뮬레이션
    const callback = mockIntersectionObserver.mock.calls[0][0]
    callback([{ isIntersecting: true }])

    await waitFor(() => {
      expect(screen.getByRole('img')).toBeInTheDocument()
    })
  })
})
```

#### MultiTagSearch 컴포넌트 테스트
```typescript
// src/components/__tests__/MultiTagSearch.test.tsx
describe('MultiTagSearch', () => {
  it('adds tag when Enter is pressed', async () => {
    const onTagsChange = vi.fn()
    render(<MultiTagSearch tags={[]} onTagsChange={onTagsChange} />)
    
    const input = screen.getByPlaceholderText('태그 입력...')
    
    await user.type(input, 'fruity')
    await user.keyboard('{Enter}')
    
    expect(onTagsChange).toHaveBeenCalledWith(['fruity'])
  })

  it('shows autocomplete suggestions', async () => {
    render(
      <MultiTagSearch 
        tags={[]} 
        onTagsChange={vi.fn()} 
        suggestions={['fruity', 'floral', 'nutty']}
      />
    )
    
    const input = screen.getByPlaceholderText('태그 입력...')
    await user.type(input, 'fr')
    
    expect(screen.getByText('fruity')).toBeInTheDocument()
    expect(screen.queryByText('nutty')).not.toBeInTheDocument()
  })
})
```

### 3. E2E 테스트 (End-to-End Tests)

#### 전체 커피 기록 플로우 테스트
```typescript
// e2e/coffee-record-flow.spec.ts
test('complete coffee recording flow', async ({ page }) => {
  await page.goto('/')
  
  // 로그인
  await page.click('[data-testid="login-button"]')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'testpass123')
  await page.click('[type="submit"]')
  
  // 새 기록 생성
  await page.click('[data-testid="new-record-button"]')
  
  // 모드 선택
  await page.click('[data-testid="cafe-mode"]')
  
  // Step 1: 기본 정보
  await page.fill('[name="coffeeName"]', 'Ethiopia Yirgacheffe')
  await page.fill('[name="cafeName"]', 'Blue Bottle')
  await page.selectOption('[name="origin"]', 'Ethiopia')
  await page.click('[data-testid="next-step"]')
  
  // Step 2: 상세 정보
  await page.fill('[name="price"]', '4500')
  await page.selectOption('[name="servingSize"]', 'Small')
  await page.click('[data-testid="next-step"]')
  
  // Step 3: 맛 평가
  await page.click('[data-testid="simple-mode"]')
  await page.fill('[name="personalNotes"]', '상큼하고 산미가 좋음')
  await page.click('[data-rating="4"]')
  await page.click('[data-testid="next-step"]')
  
  // Step 4: 최종 검토 및 저장
  await page.click('[data-testid="save-record"]')
  
  // 결과 페이지 확인
  await expect(page.locator('[data-testid="match-score"]')).toBeVisible()
  await expect(page.locator('text=Ethiopia Yirgacheffe')).toBeVisible()
})
```

#### 검색 및 필터링 테스트
```typescript
// e2e/search-and-filter.spec.ts
test('search and filter functionality', async ({ page }) => {
  await page.goto('/')
  
  // 검색 테스트
  await page.fill('[data-testid="search-input"]', 'Ethiopia')
  await page.waitForSelector('[data-testid="coffee-card"]')
  
  const searchResults = await page.locator('[data-testid="coffee-card"]').count()
  expect(searchResults).toBeGreaterThan(0)
  
  // 필터 테스트
  await page.click('[data-testid="filter-toggle"]')
  await page.selectOption('[name="mode"]', 'Cafe')
  await page.click('[data-testid="apply-filters"]')
  
  // 필터 적용 결과 확인
  const filteredResults = await page.locator('[data-testid="coffee-card"]').count()
  expect(filteredResults).toBeLessThanOrEqual(searchResults)
})
```

## 📊 커버리지 목표

### 현재 커버리지
- **단위 테스트**: 15개 테스트 케이스
- **컴포넌트 테스트**: 8개 주요 컴포넌트
- **E2E 테스트**: 5개 핵심 플로우

### 목표 커버리지
- **단위 테스트**: 80% 이상
- **통합 테스트**: 70% 이상
- **E2E 테스트**: 주요 사용자 플로우 100%

## 🚀 테스트 실행 명령어

```bash
# 단위 테스트 (대화형)
npm run test

# 단위 테스트 (한 번 실행)
npm run test:run

# 커버리지 리포트 생성
npm run test:coverage

# E2E 테스트 실행
npm run e2e

# E2E 테스트 UI 모드
npm run e2e:ui

# 모든 테스트 실행
npm run test:all
```

## 🔧 CI/CD 통합

### GitHub Actions 워크플로우
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:run
      
      - name: Run E2E tests
        run: npm run e2e
```

### 배포 전 검증
- 모든 테스트 통과 시에만 배포 진행
- 커버리지 임계값 미달 시 빌드 실패
- 크로스 브라우저 호환성 자동 검증

## 🎯 품질 보증 효과

### 1. 버그 조기 발견
- 개발 단계에서 로직 오류 사전 차단
- 리팩토링 시 회귀 버그 방지
- API 변경 사항 영향도 분석

### 2. 안정적인 배포
- 프로덕션 환경 배포 전 품질 검증
- 사용자 플로우 기능 보장
- 성능 회귀 모니터링

### 3. 코드 품질 향상
- 테스트 작성을 통한 설계 개선
- 의존성 분리 및 모듈화 촉진
- 문서화 역할 수행

---

**구현 완료일**: 2025-01-31  
**버전**: v0.9.3  
**테스트 프레임워크**: Vitest, React Testing Library, Playwright