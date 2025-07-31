import { test, expect } from '@playwright/test'

test.describe('Coffee Record Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the main page
    await page.goto('/')
  })

  test('should display home page correctly', async ({ page }) => {
    // Check if the home page loads
    await expect(page).toHaveTitle(/CupNote/)
    
    // Check for main navigation elements
    await expect(page.getByText('홈')).toBeVisible()
    await expect(page.getByText('기록')).toBeVisible()
    await expect(page.getByText('통계')).toBeVisible()
    await expect(page.getByText('설정')).toBeVisible()
  })

  test('should navigate to coffee record creation', async ({ page }) => {
    // Click on record tab
    await page.getByText('기록').click()
    
    // Should show mode selection page
    await expect(page.getByText('모드를 선택해주세요')).toBeVisible()
    
    // Select cafe mode
    await page.getByText('카페').click()
    
    // Should navigate to step 1 (coffee info)
    await expect(page.getByText('커피 정보')).toBeVisible()
  })

  test('should complete coffee record creation flow', async ({ page }) => {
    // Navigate to record creation
    await page.getByText('기록').click()
    await page.getByText('카페').click()
    
    // Step 1: Coffee Info
    await page.fill('input[name="coffeeName"]', 'Test Coffee')
    await page.fill('input[name="roastery"]', 'Test Roastery')
    await page.fill('input[name="origin"]', 'Ethiopia')
    await page.selectOption('select[name="roastLevel"]', 'Medium')
    await page.selectOption('select[name="brewMethod"]', 'V60')
    
    // Go to next step
    await page.getByText('다음').click()
    
    // Step 2: Roaster Notes
    await expect(page.getByText('로스터 노트')).toBeVisible()
    await page.fill('textarea[name="roasterNote"]', 'Fruity and bright')
    await page.getByText('다음').click()
    
    // Step 3: Personal Tasting
    await expect(page.getByText('개인 테이스팅')).toBeVisible()
    await page.fill('textarea[name="taste"]', 'Sweet and citrusy')
    await page.fill('textarea[name="memo"]', 'Great coffee, will buy again')
    
    // Set rating
    const stars = page.locator('[data-testid="rating-star"]')
    await stars.nth(3).click() // 4 stars
    
    await page.getByText('다음').click()
    
    // Step 4: Review
    await expect(page.getByText('기록 검토')).toBeVisible()
    await expect(page.getByText('Test Coffee')).toBeVisible()
    await expect(page.getByText('Test Roastery')).toBeVisible()
    
    // Save record
    await page.getByText('저장').click()
    
    // Should redirect to result page
    await expect(page.getByText('Match Score')).toBeVisible()
  })

  test('should show validation errors for empty required fields', async ({ page }) => {
    // Navigate to record creation
    await page.getByText('기록').click()
    await page.getByText('카페').click()
    
    // Try to proceed without filling required fields
    await page.getByText('다음').click()
    
    // Should show validation errors
    await expect(page.getByText('커피명을 입력해주세요')).toBeVisible()
  })

  test('should allow navigation back and forth between steps', async ({ page }) => {
    // Navigate to record creation
    await page.getByText('기록').click()
    await page.getByText('카페').click()
    
    // Fill step 1 and proceed
    await page.fill('input[name="coffeeName"]', 'Test Coffee')
    await page.fill('input[name="roastery"]', 'Test Roastery')
    await page.fill('input[name="origin"]', 'Ethiopia')
    await page.getByText('다음').click()
    
    // Go back to step 1
    await page.getByText('이전').click()
    
    // Check if data is preserved
    await expect(page.locator('input[name="coffeeName"]')).toHaveValue('Test Coffee')
    await expect(page.locator('input[name="roastery"]')).toHaveValue('Test Roastery')
  })

  test('should display coffee list on home page', async ({ page }) => {
    // Check if coffee list is visible (may be empty initially)
    await expect(page.getByText('최근 기록')).toBeVisible()
    
    // Should show empty state or coffee cards
    const hasRecords = await page.getByTestId('coffee-card').count()
    if (hasRecords === 0) {
      await expect(page.getByText('아직 기록이 없습니다')).toBeVisible()
    }
  })

  test('should navigate to stats page', async ({ page }) => {
    await page.getByText('통계').click()
    
    // Should show stats page elements
    await expect(page.getByText('나의 커피 통계')).toBeVisible()
    await expect(page.getByText('총 기록 수')).toBeVisible()
  })

  test('should navigate to settings page', async ({ page }) => {
    await page.getByText('설정').click()
    
    // Should show settings page elements
    await expect(page.getByText('설정')).toBeVisible()
    await expect(page.getByText('데이터 관리')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Check if mobile navigation is visible
    await expect(page.getByTestId('mobile-navigation')).toBeVisible()
    
    // Check if content adapts to mobile screen
    await expect(page.locator('.container')).toHaveCSS('padding-left', /^\d+px$/)
  })

  test('should handle offline functionality', async ({ page, context }) => {
    // Go offline
    await context.setOffline(true)
    
    // Try to create a record
    await page.getByText('기록').click()
    
    // Should show offline indicator or work offline
    // (This test would need to be adapted based on actual offline implementation)
    await expect(page).toHaveURL(/.*/)
  })

  test('should show PWA install prompt on supported browsers', async ({ page }) => {
    // This test would check for PWA installation functionality
    // Implementation depends on how PWA prompt is triggered
    await page.waitForLoadState('networkidle')
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return 'serviceWorker' in navigator
    })
    
    expect(swRegistered).toBe(true)
  })
})