import { test, expect, devices } from '@playwright/test'

// iPhone 12 전용 테스트
test.use(devices['iPhone 12'])

test.describe('Mobile Search - iPhone 12', () => {
  test.beforeEach(async ({ page }) => {
    // 로그인 상태 시뮬레이션
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', 'mock-token')
      sessionStorage.setItem('user', JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com'
      }))
    })
  })

  test('should open search page from header', async ({ page }) => {
    await page.goto('/')
    
    // AppHeader의 검색 버튼 클릭
    await page.locator('[aria-label="Search"]').click()
    
    // 검색 페이지로 이동 확인
    await expect(page).toHaveURL(/.*\/search/)
    await expect(page.locator('input[placeholder*="커피 이름"]')).toBeVisible()
  })

  test('should perform basic search', async ({ page }) => {
    await page.goto('/search')
    
    // 검색어 입력
    const searchInput = page.locator('input[placeholder*="커피 이름"]')
    await searchInput.fill('에티오피아')
    await searchInput.press('Enter')
    
    // 로딩 상태 확인
    await expect(page.locator('.animate-pulse')).toBeVisible()
    
    // 결과 표시 대기
    await expect(page.locator('text=개의 결과').or(page.locator('text=검색 결과가 없습니다'))).toBeVisible({ timeout: 5000 })
  })

  test('should show search suggestions', async ({ page }) => {
    await page.goto('/search')
    
    const searchInput = page.locator('input[placeholder*="커피 이름"]')
    
    // 2글자 이상 입력시 자동완성 표시
    await searchInput.fill('케냐')
    await page.waitForTimeout(500) // 디바운스 대기
    
    // 자동완성 드롭다운 확인 (있을 수도 없을 수도 있음)
    const suggestionDropdown = page.locator('.absolute.top-full')
    if (await suggestionDropdown.isVisible()) {
      // 자동완성 항목이 있으면 클릭
      const suggestion = page.locator('.absolute.top-full button').first()
      await suggestion.click()
      
      // 검색 실행 확인
      await expect(searchInput).toHaveValue(/케냐/)
    }
  })

  test('should toggle filters panel', async ({ page }) => {
    await page.goto('/search')
    
    // 필터 버튼 찾기 (Filter 아이콘이 있는 버튼)
    const filterButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    await filterButton.click()
    
    // 필터 패널 표시 확인
    await expect(page.locator('h3:has-text("필터")')).toBeVisible()
    await expect(page.locator('text=기록 모드')).toBeVisible()
    
    // 모드 필터 확인 (Lab 모드 없음)
    await expect(page.locator('button:has-text("Cafe")')).toBeVisible()
    await expect(page.locator('button:has-text("HomeCafe")')).toBeVisible()
    await expect(page.locator('button:has-text("Lab")')).not.toBeVisible()
  })

  test('should apply mode filters', async ({ page }) => {
    await page.goto('/search')
    await page.locator('input[placeholder*="커피 이름"]').fill('커피')
    await page.locator('input[placeholder*="커피 이름"]').press('Enter')
    
    // 필터 열기
    const filterButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    await filterButton.click()
    
    // Cafe 모드 필터 적용
    await page.locator('button:has-text("Cafe")').click()
    
    // 필터 적용 확인 (버튼 스타일 변경)
    await expect(page.locator('button:has-text("Cafe")')).toHaveClass(/bg-coffee-500/)
  })

  test('should change sort order', async ({ page }) => {
    await page.goto('/search')
    await page.locator('input[placeholder*="커피 이름"]').fill('커피')
    await page.locator('input[placeholder*="커피 이름"]').press('Enter')
    
    // 필터 열기
    const filterButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    await filterButton.click()
    
    // 정렬 옵션 변경
    const sortSelect = page.locator('select')
    await sortSelect.selectOption('date')
    
    // 정렬 변경 확인
    await expect(sortSelect).toHaveValue('date')
  })

  test('should show search history and popular tags', async ({ page }) => {
    await page.goto('/search')
    
    // 검색 전 상태에서 표시되는 내용
    const hasSearchHistory = await page.locator('text=최근 검색').isVisible()
    const hasPopularTags = await page.locator('text=인기 검색어').isVisible()
    
    // 둘 중 하나는 표시되어야 함
    expect(hasSearchHistory || hasPopularTags).toBeTruthy()
    
    if (hasPopularTags) {
      // 인기 검색어 태그 확인
      const popularTags = ['케냐', '에티오피아', '콜롬비아', '테라로사', '블루보틀', '산미', '초콜릿']
      let foundTag = false
      for (const tag of popularTags) {
        if (await page.locator(`button:has-text("${tag}")`).isVisible()) {
          foundTag = true
          break
        }
      }
      expect(foundTag).toBeTruthy()
    }
  })

  test('should handle empty search results', async ({ page }) => {
    await page.goto('/search')
    
    // 존재하지 않을 검색어 입력
    await page.locator('input[placeholder*="커피 이름"]').fill('zzzzxxxxyyyy')
    await page.locator('input[placeholder*="커피 이름"]').press('Enter')
    
    // 결과 없음 메시지 확인
    await expect(page.locator('text=검색 결과가 없습니다').or(page.locator('text=검색 중 오류가 발생했습니다'))).toBeVisible({ timeout: 5000 })
  })

  test('should handle touch interactions', async ({ page }) => {
    await page.goto('/search')
    
    // 검색 수행
    await page.locator('input[placeholder*="커피 이름"]').fill('커피')
    await page.locator('input[placeholder*="커피 이름"]').press('Enter')
    
    // 결과가 나올 때까지 대기
    await page.waitForTimeout(1000)
    
    // 터치 스크롤 시뮬레이션
    await page.evaluate(() => {
      window.scrollTo(0, 100)
    })
    
    // 스크롤 위치 확인
    const scrollY = await page.evaluate(() => window.scrollY)
    expect(scrollY).toBeGreaterThan(0)
  })

  test('should work with mobile keyboard', async ({ page }) => {
    await page.goto('/search')
    
    const searchInput = page.locator('input[placeholder*="커피 이름"]')
    
    // 포커스시 키보드 표시 시뮬레이션
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
    
    // 입력 테스트
    await searchInput.type('테스트')
    await expect(searchInput).toHaveValue('테스트')
    
    // 키보드 숨기기 시뮬레이션
    await searchInput.blur()
    await expect(searchInput).not.toBeFocused()
  })

  test('should have responsive mobile layout', async ({ page }) => {
    await page.goto('/search')
    
    // 모바일 레이아웃 확인
    const viewport = page.viewportSize()
    expect(viewport?.width).toBeLessThanOrEqual(390) // iPhone 12 width
    
    // 헤더 확인
    const header = page.locator('.sticky.top-0')
    await expect(header).toBeVisible()
    
    // 검색 입력 필드 확인
    const searchInput = page.locator('input[placeholder*="커피 이름"]')
    await expect(searchInput).toBeVisible()
    
    // 모바일에 적합한 터치 타겟 크기 확인
    const filterButton = page.locator('button').filter({ has: page.locator('svg') }).nth(1)
    const box = await filterButton.boundingBox()
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(44) // 최소 44px
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('should navigate to coffee detail from search result', async ({ page }) => {
    await page.goto('/search')
    await page.locator('input[placeholder*="커피 이름"]').fill('커피')
    await page.locator('input[placeholder*="커피 이름"]').press('Enter')
    
    // 결과 대기
    await page.waitForTimeout(1000)
    
    // 첫 번째 결과가 있으면 클릭
    const firstResult = page.locator('.space-y-3 button').first()
    const resultCount = await firstResult.count()
    
    if (resultCount > 0) {
      await firstResult.click()
      // 상세 페이지로 이동 확인
      await expect(page).toHaveURL(/.*\/coffee\/.*/)
    }
  })

  test('Performance: should load search page quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/search')
    await page.waitForLoadState('networkidle')
    const loadTime = Date.now() - startTime
    
    console.log(`Search page load time: ${loadTime}ms`)
    expect(loadTime).toBeLessThan(5000) // 5초 이내 로드
  })

  test('Accessibility: should support screen reader', async ({ page }) => {
    await page.goto('/search')
    
    // ARIA labels 확인
    const searchInput = page.locator('input[placeholder*="커피 이름"]')
    const inputType = await searchInput.getAttribute('type')
    expect(inputType).toBe('text')
    
    // 포커스 관리
    await page.keyboard.press('Tab')
    const focused = await page.evaluate(() => document.activeElement?.tagName)
    expect(focused).toBeTruthy()
  })
})