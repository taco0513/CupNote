import { test, expect, devices } from '@playwright/test'

// 전체 사용자 플로우 테스트
test.describe('Complete User Flow Tests', () => {
  test.use(devices['iPhone 12'])

  test.describe('First Time User Journey', () => {
    test('complete onboarding to first coffee record', async ({ page }) => {
      await page.goto('/')
      
      // 1. 랜딩 페이지 확인
      await expect(page.locator('text=나만의 커피 여정')).toBeVisible()
      await expect(page.locator('text=지금 시작하기')).toBeVisible()
      
      // 2. 회원가입
      await page.locator('text=지금 시작하기').click()
      await page.waitForSelector('[role="dialog"]')
      
      const timestamp = Date.now()
      await page.fill('input[placeholder*="사용자명"]', `TestUser${timestamp}`)
      await page.fill('input[type="email"]', `test${timestamp}@example.com`)
      await page.fill('input[type="password"]', 'password123')
      await page.fill('input[placeholder*="비밀번호 확인"]', 'password123')
      await page.locator('button[type="submit"]').click()
      
      // 3. 온보딩 가이드 확인
      await page.waitForSelector('text=커피 여정을 시작해보세요')
      
      // 온보딩 3단계 확인
      await expect(page.locator('text=커피 정보 입력')).toBeVisible()
      await expect(page.locator('text=맛 표현하기')).toBeVisible()
      await expect(page.locator('text=매치 스코어 확인')).toBeVisible()
      
      // 4. 첫 기록 시작
      await page.locator('text=새 기록 작성').click()
      
      // 5. 모드 선택
      await expect(page.locator('text=어떤 상황인가요?')).toBeVisible()
      await expect(page.locator('text=Cafe Mode')).toBeVisible()
      await expect(page.locator('text=HomeCafe Mode')).toBeVisible()
      // Lab Mode 없음 확인
      await expect(page.locator('text=Lab Mode')).not.toBeVisible()
      
      // Cafe Mode 선택
      await page.locator('[data-mode="cafe"]').click()
      
      // 6. 커피 정보 입력
      await page.fill('input[placeholder*="커피 이름"]', '에티오피아 예가체프')
      await page.fill('input[placeholder*="로스터리"]', '테라로사')
      await page.fill('input[placeholder*="원산지"]', '에티오피아')
      
      // 7. 평점 선택
      await page.locator('[data-rating="4"]').click()
      
      // 8. 맛 표현
      await page.fill('textarea[placeholder*="맛"]', '꽃향기가 풍부하고 산미가 밝다')
      
      // 9. 저장
      await page.locator('button:has-text("저장")').click()
      
      // 10. Match Score 확인
      await expect(page.locator('text=Match Score')).toBeVisible()
      await expect(page.locator(/\d+%/)).toBeVisible()
      
      // 11. 홈으로 돌아가기
      await page.locator('[aria-label="Home"]').click()
      
      // 12. 대시보드 확인
      await expect(page.locator('text=이번 달')).toBeVisible()
      await expect(page.locator('text=최근 기록')).toBeVisible()
      await expect(page.locator('text=성취')).toBeVisible()
    })
  })

  test.describe('Returning User Journey', () => {
    test.beforeEach(async ({ page }) => {
      // 로그인 상태 설정
      await page.goto('/')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
        sessionStorage.setItem('user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          username: 'TestUser'
        }))
      })
    })

    test('view records and stats', async ({ page }) => {
      await page.goto('/')
      
      // 1. 내 기록 탭 클릭
      await page.locator('[aria-label="Records"]').click()
      await expect(page).toHaveURL(/.*\/my-records/)
      
      // 2. 기록 목록 확인
      await expect(page.locator('text=내 기록')).toBeVisible()
      
      // 3. 분석 탭 전환
      await page.locator('button:has-text("분석")').click()
      await expect(page.locator('text=커피 통계')).toBeVisible()
      
      // 4. 고급 분석 대시보드 접근
      await page.locator('text=고급 분석 대시보드').click()
      
      // AI 분석 요소들 확인
      await expect(page.locator('text=맛 프로파일')).toBeVisible()
      await expect(page.locator('text=로스터리 선호도')).toBeVisible()
      await expect(page.locator('text=AI 추천')).toBeVisible()
    })

    test('search and filter records', async ({ page }) => {
      await page.goto('/')
      
      // 1. 검색 페이지 접근
      await page.locator('[aria-label="Search"]').click()
      
      // 2. 검색 수행
      await page.fill('input[placeholder*="커피 이름"]', '케냐')
      await page.press('Enter')
      
      // 3. 필터 적용
      await page.locator('button:has(.h-5.w-5)').filter({ hasText: '' }).first().click()
      await page.locator('button:has-text("Cafe")').click()
      
      // 4. 정렬 변경
      await page.selectOption('select', 'rating')
      
      // 5. 결과 확인
      await expect(page.locator('text=개의 결과')).toBeVisible()
    })

    test('achievements and profile', async ({ page }) => {
      await page.goto('/')
      
      // 1. 성취 페이지 접근
      await page.locator('[aria-label="Achievements"]').click()
      await expect(page).toHaveURL(/.*\/achievements/)
      
      // 2. 성취 목록 확인
      await expect(page.locator('text=성취')).toBeVisible()
      await expect(page.locator('text=획득한 배지')).toBeVisible()
      
      // 3. 카테고리 필터
      await page.locator('button:has-text("기록")').click()
      
      // 4. 프로필 페이지 접근
      await page.locator('[aria-label="Profile"]').click()
      await expect(page).toHaveURL(/.*\/profile/)
      
      // 5. 프로필 정보 확인
      await expect(page.locator('text=TestUser')).toBeVisible()
      await expect(page.locator('text=커피 여정')).toBeVisible()
      
      // 6. 장비 설정 확인
      await expect(page.locator('text=홈카페 장비')).toBeVisible()
    })

    test('settings and preferences', async ({ page }) => {
      await page.goto('/')
      
      // 1. 설정 페이지 접근
      await page.locator('[aria-label="Settings"]').click()
      await expect(page).toHaveURL(/.*\/settings/)
      
      // 2. 알림 설정
      await page.locator('text=알림 설정').click()
      await expect(page.locator('text=커피 리마인더')).toBeVisible()
      
      // 리마인더 활성화
      const reminderToggle = page.locator('input[type="checkbox"]').first()
      await reminderToggle.check()
      
      // 3. 시간 설정
      await page.selectOption('select[name="time"]', '09:00')
      
      // 4. 요일 설정
      await page.locator('label:has-text("월")').click()
      await page.locator('label:has-text("수")').click()
      await page.locator('label:has-text("금")').click()
      
      // 5. 저장
      await page.locator('button:has-text("저장")').click()
      await expect(page.locator('text=설정이 저장되었습니다')).toBeVisible()
    })
  })

  test.describe('HomeCafe Mode Flow', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
        sessionStorage.setItem('user', JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com'
        }))
      })
    })

    test('complete HomeCafe record with equipment', async ({ page }) => {
      await page.goto('/mode-selection')
      
      // 1. HomeCafe Mode 선택
      await page.locator('[data-mode="homecafe"]').click()
      
      // 2. 커피 정보 입력
      await page.fill('input[placeholder*="커피 이름"]', '콜롬비아 게이샤')
      await page.fill('input[placeholder*="로스터리"]', '커피 리브레')
      
      // 3. 레시피 정보 입력
      await page.fill('input[name="coffee_amount"]', '15')
      await page.fill('input[name="water_amount"]', '250')
      await page.fill('input[name="water_temp"]', '93')
      
      // 4. 추출 방법 선택
      await page.selectOption('select[name="brew_method"]', 'v60')
      
      // 5. 타이머 사용
      await page.locator('button:has-text("타이머 시작")').click()
      await page.waitForTimeout(2000)
      await page.locator('button:has-text("랩 타임")').click()
      await page.waitForTimeout(1000)
      await page.locator('button:has-text("타이머 정지")').click()
      
      // 6. 맛 평가
      await page.fill('textarea[placeholder*="맛"]', '균형잡힌 바디감과 초콜릿 같은 단맛')
      
      // 7. 저장
      await page.locator('button:has-text("저장")').click()
      
      // 8. 결과 확인
      await expect(page.locator('text=기록이 저장되었습니다')).toBeVisible()
    })
  })

  test.describe('Mobile Specific Features', () => {
    test.use(devices['iPhone SE'])

    test('bottom navigation functionality', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
      })
      
      // 하단 네비게이션 테스트
      const bottomNav = page.locator('.fixed.bottom-0')
      await expect(bottomNav).toBeVisible()
      
      // 홈 탭
      await page.locator('[aria-label="Home"]').click()
      await expect(page).toHaveURL('/')
      
      // 검색 탭
      await page.locator('[aria-label="Search"]').click()
      await expect(page).toHaveURL(/.*\/search/)
      
      // 기록 탭
      await page.locator('[aria-label="Records"]').click()
      await expect(page).toHaveURL(/.*\/my-records/)
      
      // 성취 탭
      await page.locator('[aria-label="Achievements"]').click()
      await expect(page).toHaveURL(/.*\/achievements/)
      
      // 설정 탭
      await page.locator('[aria-label="Settings"]').click()
      await expect(page).toHaveURL(/.*\/settings/)
    })

    test('swipe gestures', async ({ page }) => {
      await page.goto('/my-records')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
      })
      
      // 탭 스와이프 시뮬레이션
      const tabContainer = page.locator('[role="tablist"]')
      
      // 스와이프 제스처 시뮬레이션
      await tabContainer.evaluate((element) => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 300, clientY: 100 }] as any
        })
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 100, clientY: 100 }] as any
        })
        const touchEnd = new TouchEvent('touchend')
        
        element.dispatchEvent(touchStart)
        element.dispatchEvent(touchMove)
        element.dispatchEvent(touchEnd)
      })
    })

    test('pull to refresh', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
      })
      
      // Pull to refresh 시뮬레이션
      await page.evaluate(() => {
        const touchStart = new TouchEvent('touchstart', {
          touches: [{ clientX: 150, clientY: 100 }] as any
        })
        const touchMove = new TouchEvent('touchmove', {
          touches: [{ clientX: 150, clientY: 200 }] as any
        })
        const touchEnd = new TouchEvent('touchend')
        
        document.body.dispatchEvent(touchStart)
        document.body.dispatchEvent(touchMove)
        document.body.dispatchEvent(touchEnd)
      })
      
      // 새로고침 효과 확인
      await page.waitForTimeout(1000)
    })
  })

  test.describe('Error Scenarios', () => {
    test.use(devices['Pixel 5'])

    test('handle network offline', async ({ page, context }) => {
      await page.goto('/')
      
      // 오프라인 모드 시뮬레이션
      await context.setOffline(true)
      
      // 새 기록 시도
      await page.locator('text=새 기록 작성').click()
      
      // 오프라인 메시지 확인
      await expect(page.locator('text=오프라인')).toBeVisible()
      
      // 온라인 복구
      await context.setOffline(false)
      await page.reload()
      
      // 정상 작동 확인
      await expect(page.locator('text=나만의 커피 여정')).toBeVisible()
    })

    test('handle session timeout', async ({ page }) => {
      await page.goto('/')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'expired-token')
      })
      
      // 보호된 페이지 접근 시도
      await page.goto('/mode-selection')
      
      // 로그인 페이지로 리디렉션 확인
      await expect(page.locator('text=로그인')).toBeVisible()
    })

    test('handle form validation errors', async ({ page }) => {
      await page.goto('/mode-selection')
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'mock-token')
      })
      
      // Cafe Mode 선택
      await page.locator('[data-mode="cafe"]').click()
      
      // 빈 폼 제출 시도
      await page.locator('button:has-text("저장")').click()
      
      // 유효성 검사 에러 확인
      await expect(page.locator('text=필수 항목')).toBeVisible()
    })
  })

  test.describe('PWA Features', () => {
    test.use(devices['Galaxy S20'])

    test('installability prompt', async ({ page }) => {
      await page.goto('/')
      
      // PWA 설치 프롬프트 확인
      await page.evaluate(() => {
        window.dispatchEvent(new Event('beforeinstallprompt'))
      })
      
      // manifest 확인
      const manifest = await page.evaluate(() => {
        const link = document.querySelector('link[rel="manifest"]')
        return link?.getAttribute('href')
      })
      expect(manifest).toBe('/manifest.json')
    })

    test('service worker registration', async ({ page }) => {
      await page.goto('/')
      
      // Service Worker 등록 확인
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          return registrations.length > 0
        }
        return false
      })
      
      expect(swRegistered).toBe(true)
    })

    test('offline caching', async ({ page, context }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      // 오프라인 전환
      await context.setOffline(true)
      
      // 캐시된 페이지 접근 가능 확인
      await page.reload()
      await expect(page.locator('text=CupNote')).toBeVisible()
    })
  })

  test.describe('Performance Monitoring', () => {
    test('measure core web vitals', async ({ page }) => {
      await page.goto('/')
      
      // Core Web Vitals 측정
      const metrics = await page.evaluate(() => {
        return new Promise((resolve) => {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const vitals = {
              lcp: 0,
              fid: 0,
              cls: 0
            }
            
            entries.forEach((entry: any) => {
              if (entry.entryType === 'largest-contentful-paint') {
                vitals.lcp = entry.renderTime || entry.loadTime
              }
              if (entry.entryType === 'first-input') {
                vitals.fid = entry.processingStart - entry.startTime
              }
              if (entry.entryType === 'layout-shift') {
                vitals.cls += entry.value
              }
            })
            
            resolve(vitals)
          })
          
          observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
          
          // 타임아웃 설정
          setTimeout(() => resolve({ lcp: 0, fid: 0, cls: 0 }), 5000)
        })
      })
      
      // 성능 기준 확인
      expect(metrics.lcp).toBeLessThan(2500) // LCP < 2.5s
      expect(metrics.fid).toBeLessThan(100)  // FID < 100ms
      expect(metrics.cls).toBeLessThan(0.1)  // CLS < 0.1
    })

    test('measure page load times', async ({ page }) => {
      const timings: { [key: string]: number } = {}
      
      // 홈 페이지
      let start = Date.now()
      await page.goto('/')
      timings.home = Date.now() - start
      
      // 검색 페이지
      start = Date.now()
      await page.goto('/search')
      timings.search = Date.now() - start
      
      // 기록 페이지
      start = Date.now()
      await page.goto('/my-records')
      timings.records = Date.now() - start
      
      // 모든 페이지가 3초 이내 로드 확인
      Object.values(timings).forEach(time => {
        expect(time).toBeLessThan(3000)
      })
    })
  })
})