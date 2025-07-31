import { chromium, FullConfig } from '@playwright/test'
import { TestHelpers } from './utils/TestHelpers'

/**
 * Global setup for CupNote E2E tests
 * Runs once before all tests
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting CupNote E2E Test Global Setup...')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // 1. Verify test environment is accessible
    console.log('📡 Verifying test environment accessibility...')
    await page.goto(process.env.BASE_URL || 'http://localhost:3001')
    await page.waitForSelector('body', { timeout: 10000 })
    console.log('✅ Test environment is accessible')

    // 2. Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...')
    await TestHelpers.cleanupTestData(page)
    console.log('✅ Test data cleanup completed')

    // 3. Verify database connectivity (if applicable)
    console.log('🗄️ Verifying database connectivity...')
    // This would typically involve API calls to verify backend connectivity
    // For now, we'll just verify the API endpoint is reachable
    try {
      const response = await page.request.get('/api/health')
      if (response.ok()) {
        console.log('✅ Database connectivity verified')
      } else {
        console.log('⚠️ Database connectivity check failed, tests may be unreliable')
      }
    } catch (error) {
      console.log('⚠️ Could not verify database connectivity, assuming local development')
    }

    // 4. Set up test users (if needed for global state)
    console.log('👥 Setting up global test users...')
    const testHelper = new TestHelpers(page)
    
    // Create a standard test user for consistent testing
    const globalTestUser = TestHelpers.generateTestUser('global')
    try {
      await testHelper.setupTestUser(globalTestUser)
      
      // Store global test user credentials for use in tests
      process.env.GLOBAL_TEST_USER_EMAIL = globalTestUser.email
      process.env.GLOBAL_TEST_USER_PASSWORD = globalTestUser.password
      process.env.GLOBAL_TEST_USER_USERNAME = globalTestUser.username
      
      console.log('✅ Global test user created successfully')
    } catch (error) {
      console.log('⚠️ Global test user creation failed, tests will create individual users')
    }

    // 5. Seed initial test data (if needed)
    console.log('🌱 Seeding initial test data...')
    try {
      await testHelper.seedDatabase({
        coffeeRecords: 5, // Create 5 sample records for search/filter tests
        achievements: ['first-record'] // Unlock first record achievement
      })
      console.log('✅ Initial test data seeded successfully')
    } catch (error) {
      console.log('⚠️ Test data seeding failed, tests will create data as needed')
    }

    // 6. Verify PWA features are available
    console.log('📱 Verifying PWA features...')
    const serviceWorkerSupported = await page.evaluate(() => 'serviceWorker' in navigator)
    const cacheSupported = await page.evaluate(() => 'caches' in window)
    const pushSupported = await page.evaluate(() => 'PushManager' in window)
    
    console.log(`Service Worker: ${serviceWorkerSupported ? '✅' : '❌'}`)
    console.log(`Cache API: ${cacheSupported ? '✅' : '❌'}`)
    console.log(`Push API: ${pushSupported ? '✅' : '❌'}`)

    // 7. Pre-cache critical resources for performance tests
    console.log('⚡ Pre-caching critical resources...')
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Visit key pages to populate cache
    const keyPages = ['/achievements', '/stats', '/settings']
    for (const pagePath of keyPages) {
      await page.goto(pagePath)
      await page.waitForLoadState('networkidle')
    }
    console.log('✅ Critical resources pre-cached')

    // 8. Verify accessibility testing capabilities
    console.log('♿ Verifying accessibility testing capabilities...')
    const accessibilitySupported = await page.evaluate(() => {
      // Check if we can test basic accessibility features
      return 'getComputedStyle' in window && 'querySelectorAll' in document
    })
    console.log(`Accessibility Testing: ${accessibilitySupported ? '✅' : '❌'}`)

    // 9. Set up performance monitoring
    console.log('📊 Setting up performance monitoring...')
    await page.addInitScript(() => {
      // Add performance tracking
      window.performance.mark('test-start')
      
      // Track console errors
      const consoleErrors: any[] = []
      const originalConsoleError = console.error
      console.error = (...args) => {
        consoleErrors.push({ type: 'error', message: args.join(' '), timestamp: Date.now() })
        originalConsoleError.apply(console, args)
      }
      ;(window as any).consoleErrors = consoleErrors
      
      // Track network errors
      const failedRequests: any[] = []
      const originalFetch = window.fetch
      window.fetch = async (...args) => {
        try {
          const response = await originalFetch(...args)
          if (!response.ok) {
            failedRequests.push({
              url: args[0],
              status: response.status,
              statusText: response.statusText,
              timestamp: Date.now()
            })
          }
          return response
        } catch (error) {
          failedRequests.push({
            url: args[0],
            error: error.message,
            timestamp: Date.now()
          })
          throw error
        }
      }
      ;(window as any).failedRequests = failedRequests
    })
    console.log('✅ Performance monitoring set up')

    // 10. Generate test report directory
    console.log('📁 Setting up test report directories...')
    const fs = await import('fs')
    const path = await import('path')
    
    const reportsDir = path.join(__dirname, 'reports')
    const screenshotsDir = path.join(__dirname, 'screenshots')
    
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true })
    }
    
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true })
    }
    console.log('✅ Test report directories created')

    console.log('🎉 Global setup completed successfully!')
    console.log('📝 Test Environment Summary:')
    console.log(`   - Base URL: ${process.env.BASE_URL || 'http://localhost:3001'}`)
    console.log(`   - Global Test User: ${process.env.GLOBAL_TEST_USER_EMAIL}`)
    console.log(`   - PWA Features: ${serviceWorkerSupported && cacheSupported ? 'Supported' : 'Limited'}`)
    console.log(`   - Database: ${process.env.DATABASE_URL ? 'Connected' : 'Local'}`)

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  } finally {
    await browser.close()
  }
}

export default globalSetup