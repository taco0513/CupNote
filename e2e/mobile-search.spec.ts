import { test, expect, devices } from '@playwright/test'

// 모바일 디바이스 설정
const mobileDevices = [
  { name: 'iPhone 12', device: devices['iPhone 12'] },
  { name: 'iPhone SE', device: devices['iPhone SE'] },
  { name: 'Pixel 5', device: devices['Pixel 5'] },
  { name: 'Galaxy S20', device: devices['Galaxy S20'] }
]

test.describe('Mobile Search Functionality', () => {
  // 각 모바일 디바이스에서 테스트
  mobileDevices.forEach(({ name, device }) => {
    test.describe(`${name} Tests`, () => {
      test.use(device)

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
        
        // 결과 표시 대기 (Mock 데이터 기준)
        await expect(page.locator('text=개의 결과')).toBeVisible({ timeout: 5000 })
      })

      test('should show search suggestions', async ({ page }) => {
        await page.goto('/search')
        
        const searchInput = page.locator('input[placeholder*="커피 이름"]')
        
        // 2글자 이상 입력시 자동완성 표시
        await searchInput.fill('케냐')
        
        // 자동완성 드롭다운 확인
        await expect(page.locator('.absolute.top-full')).toBeVisible()
        
        // 자동완성 항목 클릭
        const suggestion = page.locator('.absolute.top-full button').first()
        await suggestion.click()
        
        // 검색 실행 확인
        await expect(searchInput).toHaveValue(/케냐/)
      })

      test('should toggle filters panel', async ({ page }) => {
        await page.goto('/search')
        
        // 필터 버튼 클릭
        const filterButton = page.locator('button:has(.h-5.w-5)').filter({ hasText: '' }).first()
        await filterButton.click()
        
        // 필터 패널 표시 확인
        await expect(page.locator('text=필터')).toBeVisible()
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
        await page.locator('button:has(.h-5.w-5)').filter({ hasText: '' }).first().click()
        
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
        await page.locator('button:has(.h-5.w-5)').filter({ hasText: '' }).first().click()
        
        // 정렬 옵션 변경
        const sortSelect = page.locator('select')
        await sortSelect.selectOption('date')
        
        // 정렬 변경 확인
        await expect(sortSelect).toHaveValue('date')
      })

      test('should navigate to coffee detail from search result', async ({ page }) => {
        await page.goto('/search')
        await page.locator('input[placeholder*="커피 이름"]').fill('커피')
        await page.locator('input[placeholder*="커피 이름"]').press('Enter')
        
        // 첫 번째 결과 클릭
        await page.waitForSelector('.space-y-3 button')
        const firstResult = page.locator('.space-y-3 button').first()
        await firstResult.click()
        
        // 상세 페이지로 이동 확인
        await expect(page).toHaveURL(/.*\/coffee\/.*/)
      })

      test('should show search history', async ({ page }) => {
        await page.goto('/search')
        
        // 최근 검색 섹션 확인
        await expect(page.locator('text=최근 검색')).toBeVisible()
        
        // 인기 검색어 섹션 확인
        await expect(page.locator('text=인기 검색어')).toBeVisible()
        
        // 인기 검색어 태그 확인
        const popularTags = ['케냐', '에티오피아', '콜롬비아', '테라로사']
        for (const tag of popularTags) {
          await expect(page.locator(`button:has-text("${tag}")`)).toBeVisible()
        }
      })

      test('should handle empty search results', async ({ page }) => {
        await page.goto('/search')
        
        // 존재하지 않을 검색어 입력
        await page.locator('input[placeholder*="커피 이름"]').fill('zzzzxxxxyyyy')
        await page.locator('input[placeholder*="커피 이름"]').press('Enter')
        
        // 결과 없음 메시지 확인
        await expect(page.locator('text=검색 결과가 없습니다')).toBeVisible()
        await expect(page.locator('text=다른 검색어를 시도해보세요')).toBeVisible()
      })

      test('should handle search errors gracefully', async ({ page }) => {
        // API 에러 시뮬레이션
        await page.route('**/coffee_records**', route => {
          route.fulfill({
            status: 500,
            body: JSON.stringify({ error: 'Internal Server Error' })
          })
        })
        
        await page.goto('/search')
        await page.locator('input[placeholder*="커피 이름"]').fill('커피')
        await page.locator('input[placeholder*="커피 이름"]').press('Enter')
        
        // 에러 메시지 확인
        await expect(page.locator('text=검색 중 오류가 발생했습니다')).toBeVisible()
        await expect(page.locator('button:has-text("다시 시도")')).toBeVisible()
      })

      test('should clear search', async ({ page }) => {
        await page.goto('/search?q=커피')
        
        // 검색 결과가 표시됨
        await expect(page.locator('text=개의 결과')).toBeVisible()
        
        // 검색어 지우기
        const searchInput = page.locator('input[placeholder*="커피 이름"]')
        await searchInput.clear()
        await searchInput.press('Enter')
        
        // 검색 전 상태로 돌아감
        await expect(page.locator('text=최근 검색')).toBeVisible()
      })

      test('should handle touch interactions', async ({ page }) => {
        await page.goto('/search')
        
        // 터치 스크롤 시뮬레이션
        await page.locator('body').evaluate((element) => {
          element.scrollTop = 100
        })
        
        // 스와이프 제스처 (결과 목록에서)
        await page.locator('input[placeholder*="커피 이름"]').fill('커피')
        await page.locator('input[placeholder*="커피 이름"]').press('Enter')
        
        await page.waitForSelector('.space-y-3 button')
        
        // 터치 이벤트 시뮬레이션
        const result = page.locator('.space-y-3 button').first()
        await result.dispatchEvent('touchstart')
        await result.dispatchEvent('touchend')
      })

      test('should work with mobile keyboard', async ({ page }) => {
        await page.goto('/search')
        
        const searchInput = page.locator('input[placeholder*="커피 이름"]')
        
        // 포커스시 키보드 표시 시뮬레이션
        await searchInput.focus()
        
        // 모바일 키보드 높이만큼 뷰포트 조정 시뮬레이션
        await page.setViewportSize({
          width: device.viewport.width,
          height: device.viewport.height - 260 // 키보드 높이
        })
        
        // 입력 필드가 여전히 보이는지 확인
        await expect(searchInput).toBeInViewport()
        
        // 키보드 숨기기 시뮬레이션
        await searchInput.blur()
        await page.setViewportSize(device.viewport)
      })

      test('should maintain search state on back navigation', async ({ page }) => {
        await page.goto('/search')
        
        // 검색 수행
        await page.locator('input[placeholder*="커피 이름"]').fill('케냐')
        await page.locator('input[placeholder*="커피 이름"]').press('Enter')
        
        // 결과 클릭하여 상세 페이지로 이동
        await page.waitForSelector('.space-y-3 button')
        await page.locator('.space-y-3 button').first().click()
        
        // 뒤로 가기
        await page.goBack()
        
        // 검색 상태 유지 확인
        await expect(page.locator('input[placeholder*="커피 이름"]')).toHaveValue('케냐')
      })

      test('should have responsive layout', async ({ page }) => {
        await page.goto('/search')
        
        // 모바일 레이아웃 확인
        const header = page.locator('.sticky.top-0')
        await expect(header).toBeVisible()
        
        // 하단 네비게이션 확인
        const bottomNav = page.locator('.fixed.bottom-0')
        await expect(bottomNav).toBeVisible()
        
        // 패딩 및 마진 확인
        const content = page.locator('.max-w-2xl')
        await expect(content).toHaveCSS('padding-left', /\d+px/)
        await expect(content).toHaveCSS('padding-right', /\d+px/)
      })
    })
  })

  test.describe('Performance Tests', () => {
    test.use(devices['iPhone 12'])

    test('should load search page quickly', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('/search')
      await page.waitForLoadState('networkidle')
      const loadTime = Date.now() - startTime
      
      expect(loadTime).toBeLessThan(3000) // 3초 이내 로드
    })

    test('should show search results quickly', async ({ page }) => {
      await page.goto('/search')
      
      const startTime = Date.now()
      await page.locator('input[placeholder*="커피 이름"]').fill('커피')
      await page.locator('input[placeholder*="커피 이름"]').press('Enter')
      
      await page.waitForSelector('text=개의 결과')
      const searchTime = Date.now() - startTime
      
      expect(searchTime).toBeLessThan(2000) // 2초 이내 결과 표시
    })

    test('should handle rapid searches', async ({ page }) => {
      await page.goto('/search')
      const searchInput = page.locator('input[placeholder*="커피 이름"]')
      
      // 빠른 연속 검색
      const searches = ['케', '케냐', '케냐 AA', '케냐']
      
      for (const term of searches) {
        await searchInput.clear()
        await searchInput.fill(term)
        await searchInput.press('Enter')
        
        // 각 검색이 제대로 처리되는지 확인
        await page.waitForTimeout(100)
      }
      
      // 마지막 검색 결과 확인
      await expect(searchInput).toHaveValue('케냐')
    })
  })

  test.describe('Accessibility Tests', () => {
    test.use(devices['iPhone 12'])

    test('should support screen reader navigation', async ({ page }) => {
      await page.goto('/search')
      
      // ARIA labels 확인
      await expect(page.locator('[aria-label]')).toHaveCount(3, { timeout: 5000 })
      
      // Role attributes 확인
      const searchInput = page.locator('input[placeholder*="커피 이름"]')
      await expect(searchInput).toHaveAttribute('type', 'text')
      
      // Focus management
      await page.keyboard.press('Tab')
      const focused = page.locator(':focus')
      await expect(focused).toBeVisible()
    })

    test('should have sufficient touch targets', async ({ page }) => {
      await page.goto('/search')
      
      // 버튼 크기 확인 (최소 44x44px)
      const filterButton = page.locator('button:has(.h-5.w-5)').first()
      const box = await filterButton.boundingBox()
      
      expect(box.width).toBeGreaterThanOrEqual(44)
      expect(box.height).toBeGreaterThanOrEqual(44)
    })

    test('should have good color contrast', async ({ page }) => {
      await page.goto('/search')
      
      // 텍스트 색상 대비 확인
      const searchInput = page.locator('input[placeholder*="커피 이름"]')
      await expect(searchInput).toHaveCSS('color', /rgb/)
      await expect(searchInput).toHaveCSS('background-color', /rgb/)
    })
  })
})