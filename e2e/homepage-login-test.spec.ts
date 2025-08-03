import { test, expect } from '@playwright/test'

test.describe('홈페이지 로그인 이슈 테스트', () => {
  test('비로그인 사용자도 홈페이지에 접근할 수 있어야 함', async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/')
    
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('networkidle')
    
    // 로그인 페이지로 리다이렉트되지 않았는지 확인
    expect(page.url()).toBe('http://localhost:5173/')
    
    // CupNote 로고가 표시되는지 확인 (더 구체적인 셀렉터 사용)
    await expect(page.getByTestId('navbar-logo')).toBeVisible()
    
    // 홈페이지 주요 요소들이 표시되는지 확인
    await expect(page.getByTestId('homepage-hero-title')).toBeVisible()
    await expect(page.getByTestId('homepage-start-button')).toBeVisible()
    
    // 데모 버튼이 있는지 확인 (비로그인 사용자용)
    await expect(page.getByTestId('homepage-demo-button')).toBeVisible()
    
    console.log('✅ 홈페이지가 정상적으로 표시됨')
  })

  test('로그인 페이지로 직접 이동 테스트', async ({ page }) => {
    // 로그인 페이지로 직접 이동
    await page.goto('/auth')
    
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('networkidle')
    
    // 로그인 페이지 URL이 맞는지 확인
    expect(page.url()).toBe('http://localhost:5173/auth')
    
    // 로그인 폼이 표시되는지 확인 (테스트 ID 사용)
    await expect(page.getByTestId('email-input')).toBeVisible()
    await expect(page.getByTestId('password-input')).toBeVisible()
    await expect(page.getByTestId('auth-submit-button')).toBeVisible()
    
    console.log('✅ 로그인 페이지가 정상적으로 표시됨')
  })

  test('네비게이션 링크 테스트', async ({ page }) => {
    // 홈페이지로 이동
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 데스크탑 네비게이션에서 기록하기 버튼 확인
    const recordButton = page.locator('text=기록하기').first()
    await expect(recordButton).toBeVisible()
    
    // 모바일에서는 하단 네비게이션 확인
    const viewport = page.viewportSize()
    if (viewport && viewport.width < 768) {
      await expect(page.locator('[data-testid="mobile-nav"]')).toBeVisible()
    }
    
    console.log('✅ 네비게이션이 정상적으로 표시됨')
  })

  test('관리자 페이지 접근 테스트 (비로그인)', async ({ page }) => {
    // 관리자 페이지로 직접 접근 시도
    await page.goto('/admin')
    
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('networkidle')
    
    // 로그인 페이지로 리다이렉트되었는지 확인
    expect(page.url()).toBe('http://localhost:5173/auth/login')
    
    console.log('✅ 관리자 페이지는 정상적으로 보호됨')
  })

  test('데모 페이지 접근 테스트', async ({ page }) => {
    // 데모 페이지로 이동
    await page.goto('/demo')
    
    // 페이지가 로드될 때까지 기다림
    await page.waitForLoadState('networkidle')
    
    // 데모 페이지 URL이 맞는지 확인
    expect(page.url()).toBe('http://localhost:5173/demo')
    
    // 데모 페이지 주요 요소들이 표시되는지 확인
    await expect(page.getByTestId('demo-page-title')).toBeVisible()
    await expect(page.getByTestId('demo-signup-button')).toBeVisible()
    await expect(page.getByTestId('demo-record-button')).toBeVisible()
    
    console.log('✅ 데모 페이지가 정상적으로 표시됨')
  })

  test('홈페이지에서 데모 페이지로 이동 테스트', async ({ page }) => {
    // 데스크탑 뷰포트 설정 (데모 버튼이 데스크탑에서만 표시됨)
    await page.setViewportSize({ width: 1280, height: 720 })
    
    // 홈페이지로 이동
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // 데모 버튼이 표시될 때까지 대기
    await expect(page.getByTestId('homepage-demo-button')).toBeVisible()
    
    // 데모 버튼 클릭
    await page.getByTestId('homepage-demo-button').click()
    await page.waitForLoadState('networkidle')
    
    // 데모 페이지로 이동했는지 확인
    expect(page.url()).toBe('http://localhost:5173/demo')
    await expect(page.getByTestId('demo-page-title')).toBeVisible()
    
    console.log('✅ 홈페이지에서 데모 페이지로 정상 이동됨')
  })
})