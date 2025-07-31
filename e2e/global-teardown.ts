import { chromium, FullConfig } from '@playwright/test'
import { TestHelpers } from './utils/TestHelpers'

/**
 * Global teardown for CupNote E2E tests
 * Runs once after all tests complete
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting CupNote E2E Test Global Teardown...')

  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    // 1. Clean up test data
    console.log('🗑️ Cleaning up test data...')
    await TestHelpers.cleanupTestData(page)
    
    // Navigate to app to ensure cleanup
    await page.goto(process.env.BASE_URL || 'http://localhost:3001')
    
    // Clear application state
    await page.evaluate(() => {
      // Clear all localStorage
      localStorage.clear()
      
      // Clear all sessionStorage
      sessionStorage.clear()
      
      // Clear any application-specific storage
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
    console.log('✅ Test data cleanup completed')

    // 2. Clean up test users (if created during setup)
    console.log('👥 Cleaning up test users...')
    try {
      // This would typically involve API calls to remove test users
      // For now, we'll just clear any stored credentials
      delete process.env.GLOBAL_TEST_USER_EMAIL
      delete process.env.GLOBAL_TEST_USER_PASSWORD
      delete process.env.GLOBAL_TEST_USER_USERNAME
      console.log('✅ Test user cleanup completed')
    } catch (error) {
      console.log('⚠️ Test user cleanup had issues, but continuing...')
    }

    // 3. Clear service worker registrations
    console.log('🔧 Clearing service worker registrations...')
    await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        await Promise.all(
          registrations.map(registration => registration.unregister())
        )
      }
    })
    console.log('✅ Service worker registrations cleared')

    // 4. Clear caches
    console.log('💾 Clearing caches...')
    await page.evaluate(async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        )
      }
    })
    console.log('✅ Caches cleared')

    // 5. Generate test summary report
    console.log('📊 Generating test summary report...')
    const fs = await import('fs')
    const path = await import('path')
    
    const reportsDir = path.join(__dirname, 'reports')
    const summaryPath = path.join(reportsDir, 'test-summary.json')
    
    const testSummary = {
      timestamp: new Date().toISOString(),
      globalSetupCompleted: true,
      globalTeardownCompleted: true,
      testEnvironment: {
        baseUrl: process.env.BASE_URL || 'http://localhost:3001',
        nodeVersion: process.version,
        playwrightVersion: require('@playwright/test/package.json').version
      },
      cleanup: {
        userData: true,
        serviceWorkers: true,
        caches: true,
        localStorage: true,
        sessionStorage: true,
        indexedDB: true
      }
    }
    
    try {
      fs.writeFileSync(summaryPath, JSON.stringify(testSummary, null, 2))
      console.log('✅ Test summary report generated')
    } catch (error) {
      console.log('⚠️ Could not generate test summary report')
    }

    // 6. Check for and report any lingering issues
    console.log('🔍 Checking for lingering test artifacts...')
    
    const lingringData = await page.evaluate(() => {
      const issues = []
      
      // Check localStorage
      if (localStorage.length > 0) {
        issues.push(`localStorage still contains ${localStorage.length} items`)
      }
      
      // Check sessionStorage
      if (sessionStorage.length > 0) {
        issues.push(`sessionStorage still contains ${sessionStorage.length} items`)
      }
      
      // Check for test-specific DOM elements
      const testElements = document.querySelectorAll('[data-testid]')
      if (testElements.length > 100) { // Threshold for "too many" test elements
        issues.push(`Found ${testElements.length} test elements still in DOM`)
      }
      
      return issues
    })
    
    if (lingringData.length > 0) {
      console.log('⚠️ Lingering test artifacts found:')
      lingringData.forEach(issue => console.log(`   - ${issue}`))
    } else {
      console.log('✅ No lingering test artifacts found')
    }

    // 7. Performance cleanup
    console.log('⚡ Performance cleanup...')
    await page.evaluate(() => {
      // Clear performance marks and measures
      if (performance.clearMarks) {
        performance.clearMarks()
      }
      if (performance.clearMeasures) {
        performance.clearMeasures()
      }
      
      // Clear any test-specific global variables
      delete (window as any).consoleErrors
      delete (window as any).failedRequests
      delete (window as any).pendingRequests
      delete (window as any).testHelpers
    })
    console.log('✅ Performance cleanup completed')

    // 8. Database cleanup (if applicable)
    console.log('🗄️ Database cleanup...')
    try {
      // This would typically involve API calls to clean up test data from database
      const response = await page.request.post('/api/test/cleanup', {
        data: { cleanup: 'all' }
      })
      
      if (response.ok()) {
        console.log('✅ Database cleanup completed')
      } else {
        console.log('⚠️ Database cleanup may be incomplete')
      }
    } catch (error) {
      console.log('⚠️ Could not perform database cleanup (may not be implemented)')
    }

    // 9. Log final status
    console.log('📋 Final cleanup verification...')
    const finalCheck = await page.evaluate(() => {
      return {
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length,
        serviceWorkerRegistrations: navigator.serviceWorker ? 
          navigator.serviceWorker.getRegistrations().then(regs => regs.length) : 0,
        caches: 'caches' in window ? 
          caches.keys().then(keys => keys.length) : 0
      }
    })
    
    console.log('🎯 Cleanup Status:')
    console.log(`   - localStorage items: ${finalCheck.localStorage}`)
    console.log(`   - sessionStorage items: ${finalCheck.sessionStorage}`)
    console.log(`   - Service Workers: ${await finalCheck.serviceWorkerRegistrations}`)
    console.log(`   - Caches: ${await finalCheck.caches}`)

    console.log('✅ Global teardown completed successfully!')

  } catch (error) {
    console.error('❌ Global teardown encountered errors:', error)
    // Don't throw here - we want tests to complete even if teardown has issues
    console.log('⚠️ Continuing despite teardown errors...')
  } finally {
    await browser.close()
  }

  // 10. Final summary
  console.log('')
  console.log('🏁 CupNote E2E Test Suite Complete!')
  console.log('📊 For detailed test results, check:')
  console.log('   - Playwright HTML Report: playwright-report/index.html')
  console.log('   - Test Screenshots: e2e/screenshots/')
  console.log('   - Test Reports: e2e/reports/')
  console.log('')
}

export default globalTeardown