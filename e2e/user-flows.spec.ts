/**
 * CupNote 전체 사용자 플로우 E2E 테스트
 * Playwright를 사용한 종합적인 기능 테스트
 */

import { test, expect, Page } from '@playwright/test'

// 테스트 설정
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'
const TEST_TIMEOUT = 60000 // 60초

// 테스트용 계정 정보
const TEST_USER = {
  email: 'test@cupnote.com',
  password: 'Test1234!@'
}

// Helper 함수들
async function login(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`)
  await page.waitForLoadState('networkidle')
  // Wait for form to be ready
  await page.waitForSelector('[data-testid="email-input"]', { timeout: 15000 })
  await page.fill('[data-testid="email-input"]', TEST_USER.email)
  await page.fill('[data-testid="password-input"]', TEST_USER.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 })
  // 로그인 후 홈페이지로 이동 확인
  await expect(page.locator('text="나의 커피 여정"')).toBeVisible({ timeout: 10000 })
}

async function logout(page: Page) {
  await page.goto(`${BASE_URL}/settings`)
  await page.click('text="로그아웃"')
  await page.waitForURL(`${BASE_URL}/`)
}

// 테스트 그룹 1: 인증 플로우
test.describe('인증 플로우', () => {
  test('로그인 폼 UI 동작 테스트', async ({ page }) => {
    // 1. 로그인 페이지로 직접 이동
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')
    
    // 2. 로그인 폼 요소들이 표시되는지 확인
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // 3. 잘못된 이메일 형식으로 테스트
    await page.fill('[data-testid="email-input"]', 'invalid-email')
    await page.fill('[data-testid="password-input"]', 'somepassword')
    
    // 4. 폼 제출 버튼이 정상 동작하는지 확인 (실제로는 존재하지 않는 계정)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    
    // 5. 에러 메시지나 로그인 페이지에 머무르는 것 확인 (정상 동작)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/auth/login')
  })
})

// 테스트 그룹 2: Cafe Mode 전체 플로우
test.describe('Cafe Mode 기록 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('Cafe Mode - 전체 기록 프로세스', async ({ page }) => {
    // 1. 모드 선택 페이지로 이동
    await page.goto(`${BASE_URL}/mode-selection`)
    
    // 2. Cafe Mode 선택
    await page.click('text="카페 모드"')
    await page.waitForURL('**/tasting-flow/cafe/coffee-info')
    
    // 3. 커피 정보 입력
    await page.fill('input[placeholder*="카페명"]', '테스트 카페')
    await page.fill('input[placeholder*="로스터리"]', '테스트 로스터리')
    await page.fill('input[placeholder*="커피명"]', '테스트 블렌드')
    
    // 온도 선택
    await page.click('button:has-text("HOT")')
    
    // 다음 단계로
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/cafe/flavor-selection')
    
    // 4. 플레이버 선택
    await page.click('text="초콜릿"')
    await page.click('text="카라멜"')
    await page.click('text="견과류"')
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/cafe/sensory-expression')
    
    // 5. 감각 표현 입력
    // 산미
    await page.click('[data-testid="acidity-3"]')
    // 단맛
    await page.click('[data-testid="sweetness-4"]')
    // 쓴맛
    await page.click('[data-testid="bitterness-2"]')
    // 바디감
    await page.click('[data-testid="body-3"]')
    
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/cafe/sensory-mouthfeel')
    
    // 6. 마우스필 평가
    await page.click('text="부드러운"')
    await page.click('text="깔끔한"')
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/cafe/personal-notes')
    
    // 7. 개인 노트 작성
    await page.fill('textarea[placeholder*="맛"]', '균형잡힌 맛이 좋았습니다.')
    await page.fill('textarea[placeholder*="추가"]', '다음에 또 마시고 싶은 커피입니다.')
    
    // 전체 평점
    await page.click('[data-testid="rating-4"]')
    
    // 기록 완료
    await page.click('button:has-text("기록 완료")')
    await page.waitForURL('**/tasting-flow/cafe/result')
    
    // 8. 결과 페이지 확인
    await expect(page.locator('text="기록이 완료되었습니다"')).toBeVisible()
    await expect(page.locator('text="테스트 블렌드"')).toBeVisible()
    
    // 9. 내 기록으로 이동
    await page.click('button:has-text("내 기록 보기")')
    await page.waitForURL('**/my-records')
    
    // 10. 기록 확인
    await expect(page.locator('text="테스트 블렌드"').first()).toBeVisible()
  })
})

// 테스트 그룹 3: HomeCafe Mode 전체 플로우
test.describe('HomeCafe Mode 기록 플로우', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('HomeCafe Mode - 전체 기록 프로세스', async ({ page }) => {
    // 1. 모드 선택 페이지로 이동
    await page.goto(`${BASE_URL}/mode-selection`)
    
    // 2. HomeCafe Mode 선택
    await page.click('text="홈카페 모드"')
    await page.waitForURL('**/tasting-flow/homecafe/coffee-info')
    
    // 3. 커피 정보 입력
    await page.fill('input[placeholder*="로스터리"]', '홈카페 로스터리')
    await page.fill('input[placeholder*="커피명"]', '에티오피아 예가체프')
    
    // 온도 선택
    await page.click('button:has-text("HOT")')
    
    // 다음 단계로
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/homecafe/brew-setup')
    
    // 4. 브루잉 설정
    // 추출 방법 선택
    await page.click('text="V60"')
    
    // 레시피 입력
    await page.fill('input[placeholder*="원두량"]', '15')
    await page.fill('input[placeholder*="물의 양"]', '250')
    await page.fill('input[placeholder*="물 온도"]', '93')
    await page.fill('input[placeholder*="분쇄도"]', '중간')
    
    // 추출 시간 입력
    await page.fill('input[placeholder*="뜸들이기"]', '30')
    await page.fill('input[placeholder*="총 추출"]', '150')
    
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/homecafe/flavor-selection')
    
    // 5. 플레이버 선택
    await page.click('text="꽃"')
    await page.click('text="레몬"')
    await page.click('text="홍차"')
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/homecafe/sensory-expression')
    
    // 6. 감각 표현 입력
    // 산미
    await page.click('[data-testid="acidity-4"]')
    // 단맛
    await page.click('[data-testid="sweetness-4"]')
    // 쓴맛
    await page.click('[data-testid="bitterness-1"]')
    // 바디감
    await page.click('[data-testid="body-2"]')
    
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/homecafe/sensory-mouthfeel')
    
    // 7. 마우스필 평가
    await page.click('text="실키한"')
    await page.click('text="깨끗한"')
    await page.click('button:has-text("다음")')
    await page.waitForURL('**/tasting-flow/homecafe/personal-notes')
    
    // 8. 개인 노트 작성
    await page.fill('textarea[placeholder*="맛"]', '밝고 화사한 산미가 인상적입니다.')
    await page.fill('textarea[placeholder*="레시피"]', '다음엔 온도를 1도 낮춰보기')
    
    // 전체 평점
    await page.click('[data-testid="rating-5"]')
    
    // 기록 완료
    await page.click('button:has-text("기록 완료")')
    await page.waitForURL('**/tasting-flow/homecafe/result')
    
    // 9. 결과 페이지 확인
    await expect(page.locator('text="기록이 완료되었습니다"')).toBeVisible()
    await expect(page.locator('text="에티오피아 예가체프"')).toBeVisible()
  })
})

// 테스트 그룹 4: 내 기록 및 통계
test.describe('내 기록 및 통계 기능', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('내 기록 목록 및 필터링', async ({ page }) => {
    // 1. 내 기록 페이지로 이동
    await page.goto(`${BASE_URL}/my-records`)
    
    // 2. 기록 목록 표시 확인
    await expect(page.locator('[data-testid="record-list"]')).toBeVisible()
    
    // 3. 필터 테스트 - 모드별
    await page.click('button:has-text("Cafe")')
    await page.waitForTimeout(500)
    
    await page.click('button:has-text("HomeCafe")')
    await page.waitForTimeout(500)
    
    // 4. 정렬 테스트
    await page.selectOption('select[data-testid="sort-select"]', 'rating-desc')
    await page.waitForTimeout(500)
    
    // 5. 검색 테스트
    await page.fill('input[placeholder*="검색"]', '에티오피아')
    await page.waitForTimeout(500)
    
    // 6. 통계 탭으로 이동
    await page.click('text="분석"')
    
    // 7. 통계 차트 확인
    await expect(page.locator('[data-testid="monthly-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="rating-distribution"]')).toBeVisible()
    await expect(page.locator('[data-testid="favorite-flavors"]')).toBeVisible()
  })
})

// 테스트 그룹 5: 성취 시스템
test.describe('성취 시스템', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('성취 페이지 및 배지 확인', async ({ page }) => {
    // 1. 성취 페이지로 이동
    await page.goto(`${BASE_URL}/achievements`)
    
    // 2. 성취 카테고리 확인
    await expect(page.locator('text="테이스팅"')).toBeVisible()
    await expect(page.locator('text="전문성"')).toBeVisible()
    await expect(page.locator('text="탐험"')).toBeVisible()
    await expect(page.locator('text="꾸준함"')).toBeVisible()
    
    // 3. 카테고리 필터링
    await page.click('button:has-text("테이스팅")')
    await page.waitForTimeout(500)
    
    // 4. 성취 상세 정보 확인
    const achievementCard = page.locator('[data-testid="achievement-card"]').first()
    await achievementCard.click()
    
    // 5. 프로그레스 바 확인
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible()
  })
})

// 테스트 그룹 6: 설정 기능
test.describe('설정 기능', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('설정 페이지 기능 테스트', async ({ page }) => {
    // 1. 설정 페이지로 이동
    await page.goto(`${BASE_URL}/settings`)
    
    // 2. 앱 설정 토글
    await page.click('text="자동 저장 활성화"')
    await page.click('text="목록에서 평점 표시"')
    
    // 3. 알림 설정
    await page.click('text="알림 설정"')
    await page.waitForTimeout(500)
    
    // 4. 데이터 내보내기 테스트
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('button:has-text("데이터 내보내기")')
    ])
    expect(download).toBeTruthy()
    
    // 5. 캐시 초기화
    await page.click('button:has-text("캐시 초기화")')
    await expect(page.locator('text="캐시가 초기화되었습니다"')).toBeVisible()
  })
})

// 테스트 그룹 7: 프로필 기능
test.describe('프로필 기능', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
  })

  test('프로필 편집 및 확인', async ({ page }) => {
    // 1. 프로필 페이지로 이동
    await page.goto(`${BASE_URL}/profile`)
    
    // 2. 프로필 정보 확인
    await expect(page.locator('[data-testid="user-level"]')).toBeVisible()
    await expect(page.locator('[data-testid="total-records"]')).toBeVisible()
    await expect(page.locator('[data-testid="join-date"]')).toBeVisible()
    
    // 3. 프로필 편집
    await page.click('button:has-text("프로필 편집")')
    await page.fill('input[name="nickname"]', 'UpdatedNickname')
    await page.fill('textarea[name="bio"]', '커피를 사랑하는 홈바리스타입니다.')
    
    // 4. 선호 설정
    await page.selectOption('select[name="preferred-roast"]', 'light')
    await page.selectOption('select[name="preferred-origin"]', 'ethiopia')
    
    // 5. 저장
    await page.click('button:has-text("저장")')
    await expect(page.locator('text="프로필이 업데이트되었습니다"')).toBeVisible()
  })
})

// 테스트 그룹 8: 모바일 반응형 테스트
test.describe('모바일 반응형', () => {
  test.use({ viewport: { width: 375, height: 812 } }) // iPhone X 크기

  test('모바일에서 주요 기능 동작 확인', async ({ page }) => {
    await login(page)
    
    // 1. 하단 네비게이션 확인
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible()
    
    // 2. 홈 → 작성 → 내 기록 → 성취 → 설정 네비게이션
    await page.click('[data-testid="nav-home"]')
    await page.waitForURL(`${BASE_URL}/`)
    
    await page.click('[data-testid="nav-create"]')
    await page.waitForURL(`${BASE_URL}/mode-selection`)
    
    await page.click('[data-testid="nav-records"]')
    await page.waitForURL(`${BASE_URL}/my-records`)
    
    await page.click('[data-testid="nav-achievements"]')
    await page.waitForURL(`${BASE_URL}/achievements`)
    
    await page.click('[data-testid="nav-settings"]')
    await page.waitForURL(`${BASE_URL}/settings`)
    
    // 3. 스와이프 제스처 시뮬레이션 (기록 삭제)
    await page.goto(`${BASE_URL}/my-records`)
    const recordItem = page.locator('[data-testid="record-item"]').first()
    
    // 스와이프 시뮬레이션
    await recordItem.dragTo(recordItem, {
      sourcePosition: { x: 300, y: 50 },
      targetPosition: { x: 50, y: 50 }
    })
    
    // 삭제 버튼 표시 확인
    await expect(page.locator('button:has-text("삭제")')).toBeVisible()
  })
})

// 테스트 그룹 9: 오류 처리 및 엣지 케이스
test.describe('오류 처리', () => {
  test('네트워크 오류 처리', async ({ page }) => {
    // 네트워크 차단
    await page.route('**/api/**', route => route.abort())
    
    await page.goto(`${BASE_URL}/auth/login`)
    await page.fill('input[name="email"]', TEST_USER.email)
    await page.fill('input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    
    // 오류 메시지 확인
    await expect(page.locator('text="네트워크 오류가 발생했습니다"')).toBeVisible()
  })

  test('잘못된 URL 접근시 404 페이지', async ({ page }) => {
    await page.goto(`${BASE_URL}/invalid-page-url`)
    await expect(page.locator('text="404"')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text="페이지를 찾을 수 없습니다"')).toBeVisible({ timeout: 10000 })
    
    // 홈으로 돌아가기
    await page.click('text="홈으로 돌아가기"')
    await page.waitForURL(`${BASE_URL}/`)
  })

  test('세션 만료 처리', async ({ page }) => {
    await login(page)
    
    // 세션 삭제 시뮬레이션
    await page.evaluate(() => {
      localStorage.clear()
      sessionStorage.clear()
    })
    
    // 보호된 페이지 접근 시도
    await page.goto(`${BASE_URL}/mode-selection`)
    
    // 로그인 페이지로 리다이렉트 확인
    await page.waitForURL('**/auth/login')
    await expect(page.locator('text="로그인이 필요합니다"')).toBeVisible()
  })
})

// 테스트 그룹 10: 성능 테스트
test.describe('성능 테스트', () => {
  test('페이지 로딩 시간 측정', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    // 3초 이내 로딩 확인
    expect(loadTime).toBeLessThan(3000)
    
    // Core Web Vitals 측정
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries()
          const fcp = entries.find(e => e.name === 'first-contentful-paint')
          const lcp = entries.find(e => e.entryType === 'largest-contentful-paint')
          
          resolve({
            FCP: fcp?.startTime,
            LCP: lcp?.startTime
          })
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      })
    })
    
    console.log('Performance Metrics:', metrics)
  })
})

// 실행 전 설정
test.beforeAll(async () => {
  console.log('🚀 CupNote E2E 테스트 시작')
  console.log(`📍 테스트 URL: ${BASE_URL}`)
})

// 실행 후 정리
test.afterAll(async () => {
  console.log('✅ CupNote E2E 테스트 완료')
})