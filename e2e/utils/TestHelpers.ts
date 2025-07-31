import { Page, BrowserContext } from '@playwright/test'

/**
 * Test utilities and helpers for CupNote E2E tests
 */
export class TestHelpers {
  constructor(private page: Page, private context?: BrowserContext) {}

  // Database cleanup utilities
  static async cleanupTestData(page: Page) {
    // Clean up test user data
    await page.evaluate(() => {
      // Clear localStorage
      localStorage.clear()
      
      // Clear sessionStorage
      sessionStorage.clear()
      
      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        indexedDB.databases().then(databases => {
          databases.forEach(db => {
            if (db.name?.includes('cupnote') || db.name?.includes('test')) {
              indexedDB.deleteDatabase(db.name)
            }
          })
        })
      }
    })

    // Clear service worker cache
    await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }
    })

    // Unregister service workers
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
      }
    })
  }

  // Test data generation
  static generateTestUser(suffix?: string) {
    const timestamp = Date.now()
    const uniqueSuffix = suffix || timestamp.toString()
    
    return {
      email: `test+${uniqueSuffix}@cupnote.com`,
      password: 'TestPassword123!',
      username: `TestUser${uniqueSuffix}`
    }
  }

  static generateTestCoffeeRecord(overrides?: Partial<any>) {
    const timestamp = Date.now()
    
    const defaults = {
      mode: 'cafe' as const,
      coffeeInfo: {
        name: `Test Coffee ${timestamp}`,
        roastery: `Test Roastery ${timestamp}`,
        origin: 'Ethiopia',
        roastLevel: 'Medium',
        brewMethod: 'V60',
        price: '25000'
      },
      roasterNote: `Test roaster note ${timestamp}. Fruity and bright with citrus undertones.`,
      personalTasting: {
        taste: `Test personal taste ${timestamp}. Sweet and complex.`,
        memo: `Test memo ${timestamp}. Will buy again.`,
        rating: 4,
        matchScore: 85
      }
    }

    return { ...defaults, ...overrides }
  }

  static generateMultipleTestRecords(count: number, baseData?: Partial<any>) {
    return Array.from({ length: count }, (_, index) => 
      this.generateTestCoffeeRecord({
        ...baseData,
        coffeeInfo: {
          ...baseData?.coffeeInfo,
          name: `Test Coffee ${Date.now()}_${index + 1}`
        }
      })
    )
  }

  // Authentication helpers
  async setupTestUser(userData?: ReturnType<typeof TestHelpers.generateTestUser>) {
    const user = userData || TestHelpers.generateTestUser()
    
    // Register test user via API or UI
    await this.page.goto('/auth/register')
    await this.page.fill('input[name="email"]', user.email)
    await this.page.fill('input[name="password"]', user.password)
    await this.page.fill('input[name="username"]', user.username)
    await this.page.click('button[type="submit"]')
    
    // Wait for registration success
    await this.page.waitForSelector('text=환영합니다', { timeout: 10000 })
    
    return user
  }

  async loginTestUser(userData: ReturnType<typeof TestHelpers.generateTestUser>) {
    await this.page.goto('/auth/login')
    await this.page.fill('input[name="email"]', userData.email)
    await this.page.fill('input[name="password"]', userData.password)
    await this.page.click('button[type="submit"]')
    
    // Wait for login success
    await this.page.waitForSelector('text=안녕하세요', { timeout: 10000 })
  }

  // Coffee record helpers
  async createTestRecord(recordData?: ReturnType<typeof TestHelpers.generateTestCoffeeRecord>) {
    const record = recordData || TestHelpers.generateTestCoffeeRecord()
    
    // Navigate to record creation
    await this.page.goto('/mode-selection')
    
    // Select mode
    await this.page.click(`text=${record.mode === 'cafe' ? '카페' : record.mode === 'homecafe' ? '홈카페' : '랩'}`)
    
    // Fill coffee info
    await this.page.fill('input[name="coffeeName"]', record.coffeeInfo.name)
    await this.page.fill('input[name="roastery"]', record.coffeeInfo.roastery)
    await this.page.fill('input[name="origin"]', record.coffeeInfo.origin)
    await this.page.selectOption('select[name="roastLevel"]', record.coffeeInfo.roastLevel)
    await this.page.selectOption('select[name="brewMethod"]', record.coffeeInfo.brewMethod)
    
    if (record.coffeeInfo.price) {
      await this.page.fill('input[name="price"]', record.coffeeInfo.price)
    }
    
    await this.page.click('text=다음')
    
    // Fill roaster notes
    await this.page.fill('textarea[name="roasterNote"]', record.roasterNote)
    await this.page.click('text=다음')
    
    // Fill personal tasting
    await this.page.fill('textarea[name="taste"]', record.personalTasting.taste)
    await this.page.fill('textarea[name="memo"]', record.personalTasting.memo)
    
    // Set rating
    await this.page.click(`[data-testid="rating-star"]:nth-child(${record.personalTasting.rating})`)
    
    await this.page.click('text=다음')
    
    // Review and save
    await this.page.click('text=저장')
    
    // Wait for save completion
    await this.page.waitForSelector('text=Match Score', { timeout: 10000 })
    
    return record
  }

  async createMultipleTestRecords(count: number, baseData?: Partial<any>) {
    const records = TestHelpers.generateMultipleTestRecords(count, baseData)
    const createdRecords = []
    
    for (const record of records) {
      const created = await this.createTestRecord(record)
      createdRecords.push(created)
      
      // Small delay between records
      await this.page.waitForTimeout(500)
    }
    
    return createdRecords
  }

  // Network simulation helpers
  async simulateSlowNetwork(delayMs = 2000) {
    if (!this.context) return
    
    await this.context.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, delayMs))
      await route.continue()
    })
  }

  async simulateNetworkError(urlPattern = '**/*', errorType: 'abort' | 'timeout' | '500' = 'abort') {
    if (!this.context) return
    
    await this.context.route(urlPattern, route => {
      if (errorType === 'abort') {
        route.abort()
      } else if (errorType === 'timeout') {
        // Don't respond, let it timeout
        // Route will timeout based on test timeout settings
      } else if (errorType === '500') {
        route.fulfill({
          status: 500,
          body: JSON.stringify({ error: 'Internal Server Error' })
        })
      }
    })
  }

  async simulateIntermittentNetwork(failureRate = 0.3) {
    if (!this.context) return
    
    await this.context.route('**/*', route => {
      if (Math.random() < failureRate) {
        route.abort()
      } else {
        route.continue()
      }
    })
  }

  // PWA testing helpers
  async simulateOffline() {
    if (!this.context) return
    await this.context.setOffline(true)
  }

  async simulateOnline() {
    if (!this.context) return
    await this.context.setOffline(false)
  }

  async clearServiceWorkerCache() {
    await this.page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map(name => caches.delete(name)))
      }
    })
  }

  async registerServiceWorker(swPath = '/sw.js') {
    await this.page.evaluate(async (path) => {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register(path)
      }
    }, swPath)
  }

  // Mobile testing helpers
  async setMobileDevice(device: 'iPhone' | 'Android' | 'iPad' = 'iPhone') {
    const devices = {
      iPhone: { width: 375, height: 667, userAgent: 'iPhone' },
      Android: { width: 360, height: 640, userAgent: 'Android' },
      iPad: { width: 768, height: 1024, userAgent: 'iPad' }
    }
    
    const deviceConfig = devices[device]
    await this.page.setViewportSize({ width: deviceConfig.width, height: deviceConfig.height })
    await this.page.setExtraHTTPHeaders({
      'User-Agent': `Mozilla/5.0 (${deviceConfig.userAgent}) AppleWebKit/537.36`
    })
  }

  async simulateTouchGesture(startX: number, startY: number, endX: number, endY: number) {
    await this.page.touchscreen.tap(startX, startY)
    await this.page.touchscreen.tap(endX, endY)
  }

  // Accessibility testing helpers
  async checkAccessibility() {
    // Basic accessibility checks
    const issues = await this.page.evaluate(() => {
      const issues: string[] = []
      
      // Check for missing alt text
      const images = document.querySelectorAll('img:not([alt])')
      if (images.length > 0) {
        issues.push(`${images.length} images missing alt text`)
      }
      
      // Check for missing form labels
      const inputs = document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])')
      inputs.forEach(input => {
        const label = document.querySelector(`label[for="${input.id}"]`)
        if (!label && input.type !== 'hidden') {
          issues.push(`Input missing label: ${input.outerHTML}`)
        }
      })
      
      // Check for proper heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      let previousLevel = 0
      headings.forEach(heading => {
        const currentLevel = parseInt(heading.tagName[1])
        if (currentLevel > previousLevel + 1) {
          issues.push(`Heading hierarchy skip: ${heading.tagName} after h${previousLevel}`)
        }
        previousLevel = currentLevel
      })
      
      return issues
    })
    
    return issues
  }

  async testKeyboardNavigation() {
    // Test tab navigation
    const focusableElements = await this.page.locator('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])').all()
    
    for (let i = 0; i < Math.min(focusableElements.length, 10); i++) {
      await this.page.keyboard.press('Tab')
      await this.page.waitForTimeout(100)
    }
    
    // Test enter/space activation
    await this.page.keyboard.press('Enter')
    await this.page.waitForTimeout(100)
    await this.page.keyboard.press('Space')
  }

  // Performance testing helpers
  async measurePageLoad() {
    const performanceMetrics = await this.page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0
      }
    })
    
    return performanceMetrics
  }

  async measureInteractionTime(selector: string) {
    const startTime = Date.now()
    await this.page.click(selector)
    await this.page.waitForSelector(selector) // Wait for any visual changes
    const endTime = Date.now()
    
    return endTime - startTime
  }

  // Visual regression helpers
  async takeFullPageScreenshot(name: string) {
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-full.png`,
      fullPage: true
    })
  }

  async takeElementScreenshot(selector: string, name: string) {
    const element = this.page.locator(selector)
    await element.screenshot({
      path: `e2e/screenshots/${name}-element.png`
    })
  }

  async compareScreenshots(name: string, threshold = 0.2) {
    // This would integrate with visual regression testing tools
    // like Percy, Chromatic, or custom image comparison
    await this.page.screenshot({
      path: `e2e/screenshots/${name}-current.png`
    })
    
    // Comparison logic would go here
    // Return boolean indicating if screenshots match within threshold
    return true
  }

  // Database seeding helpers (for tests that need pre-existing data)
  async seedDatabase(data: {
    users?: number
    coffeeRecords?: number
    achievements?: string[]
  }) {
    // This would call API endpoints or directly insert into test database
    // Implementation depends on your backend setup
    
    if (data.users) {
      for (let i = 0; i < data.users; i++) {
        const user = TestHelpers.generateTestUser(`seed${i}`)
        await this.setupTestUser(user)
      }
    }
    
    if (data.coffeeRecords) {
      await this.createMultipleTestRecords(data.coffeeRecords)
    }
    
    if (data.achievements) {
      // Simulate achievement unlocks
      await this.page.evaluate((achievementIds) => {
        const achievements = achievementIds.map(id => ({
          id,
          unlocked: true,
          unlockedAt: new Date().toISOString()
        }))
        localStorage.setItem('test-achievements', JSON.stringify(achievements))
      }, data.achievements)
    }
  }

  // Wait helpers
  async waitForStableNetwork(timeoutMs = 5000) {
    let networkStable = false
    const startTime = Date.now()
    
    while (!networkStable && (Date.now() - startTime) < timeoutMs) {
      networkStable = await this.page.evaluate(() => {
        // Check if there are pending network requests
        const pendingRequests = (window as any).pendingRequests || 0
        return pendingRequests === 0
      })
      
      if (!networkStable) {
        await this.page.waitForTimeout(100)
      }
    }
    
    return networkStable
  }

  async waitForAnimations() {
    await this.page.waitForFunction(() => {
      const animatingElements = document.querySelectorAll('*')
      return Array.from(animatingElements).every(el => {
        const computedStyle = getComputedStyle(el)
        return computedStyle.animationPlayState === 'paused' || 
               computedStyle.animationPlayState === 'finished' ||
               computedStyle.transitionDelay === '0s'
      })
    })
  }

  // Error handling helpers
  async expectNoConsoleErrors() {
    const messages = await this.page.evaluate(() => {
      return (window as any).consoleErrors || []
    })
    
    const errors = messages.filter((msg: any) => msg.type === 'error')
    if (errors.length > 0) {
      throw new Error(`Console errors found: ${JSON.stringify(errors)}`)
    }
  }

  async expectNoNetworkErrors() {
    const failedRequests = await this.page.evaluate(() => {
      return (window as any).failedRequests || []
    })
    
    if (failedRequests.length > 0) {
      throw new Error(`Network errors found: ${JSON.stringify(failedRequests)}`)
    }
  }

  // Cleanup helpers
  async cleanup() {
    // Cleanup network routes
    if (this.context) {
      await this.context.unroute('**/*')
    }
    
    // Clear test data
    await TestHelpers.cleanupTestData(this.page)
    
    // Reset viewport
    await this.page.setViewportSize({ width: 1280, height: 720 })
    
    // Clear any injected scripts
    await this.page.evaluate(() => {
      delete (window as any).testHelpers
      delete (window as any).consoleErrors
      delete (window as any).failedRequests
      delete (window as any).pendingRequests
    })
  }
}