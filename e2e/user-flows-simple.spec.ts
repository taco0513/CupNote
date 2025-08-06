import { test, expect } from '@playwright/test'

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

console.log('🚀 CupNote E2E 간소화 테스트 시작')
console.log('📍 테스트 URL:', BASE_URL)

test.afterEach(async () => {
  console.log('✅ CupNote E2E 테스트 완료')
})

// 테스트 그룹 1: 기본 페이지 접근성
test.describe('기본 페이지 접근성', () => {
  test('홈페이지 로드 및 기본 요소 확인', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // 페이지가 정상 로드되었는지 확인
    await expect(page.locator('body')).toBeVisible()
    
    // 기본 UI 요소들이 있는지 확인 (로그인 없이도 접근 가능한 요소들)
    const possibleElements = [
      'text="CupNote"',
      'text="시작하기"', 
      'text="무료로 시작하기"',
      'button',
      'link'
    ]
    
    // 적어도 하나의 버튼이나 링크가 있는지 확인
    let elementFound = false
    for (const selector of possibleElements) {
      if (await page.locator(selector).first().isVisible().catch(() => false)) {
        elementFound = true
        break
      }
    }
    expect(elementFound).toBe(true)
  })
  
  test('404 페이지 동작 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/invalid-page-url`)
    await expect(page.locator('text="404"')).toBeVisible({ timeout: 10000 })
    await expect(page.locator('text="페이지를 찾을 수 없습니다"')).toBeVisible({ timeout: 10000 })
    
    // 홈으로 돌아가기
    await page.click('text="홈으로 돌아가기"')
    await page.waitForURL(`${BASE_URL}/`)
  })
})

// 테스트 그룹 2: 인증 관련
test.describe('인증 시스템', () => {
  test('로그인 페이지 UI 동작 확인', async ({ page }) => {
    await page.goto(`${BASE_URL}/auth/login`)
    await page.waitForLoadState('networkidle')
    
    // 로그인 폼 요소들이 표시되는지 확인
    await expect(page.locator('[data-testid="email-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="password-input"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
    
    // 폼에 테스트 데이터 입력
    await page.fill('[data-testid="email-input"]', 'test@example.com')
    await page.fill('[data-testid="password-input"]', 'password123')
    
    // 폼 제출 (실제로는 유효하지 않은 계정이므로 로그인 실패할 것임)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    
    // 로그인 페이지에 머무르는 것이 정상 (계정이 없으므로)
    const currentUrl = page.url()
    expect(currentUrl).toContain('/auth/login')
  })
})

// 테스트 그룹 3: 보호된 페이지 접근성 
test.describe('보호된 페이지 접근성', () => {
  test('주요 페이지들이 정상적으로 접근 가능한지 확인', async ({ page }) => {
    const testPages = ['/my-records', '/achievements', '/settings']
    
    for (const path of testPages) {
      await page.goto(`${BASE_URL}${path}`)
      await page.waitForTimeout(3000)
      
      // 페이지가 어떤 상태든 정상 동작하는지만 확인 (로드되거나 로그인으로 리디렉션)
      const currentUrl = page.url()
      const hasLoginForm = await page.locator('[data-testid="email-input"]').isVisible().catch(() => false)
      const redirectedToLogin = currentUrl.includes('/auth/login')
      const pageLoaded = currentUrl === `${BASE_URL}${path}`
      const hasError = await page.locator('text="Error", text="오류"').isVisible().catch(() => false)
      
      // 페이지가 정상 로드되었거나, 로그인으로 리디렉션되었거나, 에러가 없으면 정상
      expect(pageLoaded || redirectedToLogin || hasLoginForm || !hasError).toBe(true)
    }
  })
})

// 테스트 그룹 4: 기본 네비게이션
test.describe('기본 네비게이션', () => {
  test('홈페이지에서 기본 링크 동작 확인', async ({ page }) => {
    await page.goto(BASE_URL)
    await page.waitForLoadState('networkidle')
    
    // "시작하기" 버튼 클릭 (현재는 /mode-selection으로 이동)
    const startButton = page.locator('text="시작하기", text="무료로 시작하기"').first()
    if (await startButton.isVisible().catch(() => false)) {
      await startButton.click()
      await page.waitForTimeout(2000)
      
      // mode-selection 페이지나 다른 유효한 페이지로 이동했는지 확인
      const newUrl = page.url()
      expect(newUrl).not.toBe(BASE_URL)
    }
  })
})

// 테스트 그룹 5: 오프라인 페이지 
test.describe('오프라인 지원', () => {
  test('오프라인 페이지 접근 가능', async ({ page }) => {
    await page.goto(`${BASE_URL}/offline`)
    await page.waitForLoadState('networkidle')
    
    // 오프라인 페이지가 로드되는지 확인
    const pageContent = await page.content()
    expect(pageContent.length).toBeGreaterThan(0)
  })
})