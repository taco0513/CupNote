import { test, expect } from '@playwright/test'
import { CoffeeRecordPage } from './pages/CoffeeRecordPage'
import { AuthPage } from './pages/AuthPage'

test.describe('Coffee Recording Flow', () => {
  let coffeeRecordPage: CoffeeRecordPage
  let authPage: AuthPage

  test.beforeEach(async ({ page }) => {
    coffeeRecordPage = new CoffeeRecordPage(page)
    authPage = new AuthPage(page)
    
    // Login before each test
    await authPage.goto('/')
    await authPage.login('test@example.com', 'password123')
    await authPage.expectAuthSuccess()
  })

  test.describe('Mode Selection', () => {
    test('should display all available modes', async () => {
      await coffeeRecordPage.startRecording()
      
      // Should show mode selection screen
      await coffeeRecordPage.expectText('h1', '모드를 선택해주세요')
      await coffeeRecordPage.expectElementVisible('text=카페')
      await coffeeRecordPage.expectElementVisible('text=홈카페')
      await coffeeRecordPage.expectElementVisible('text=랩')
    })

    test('should navigate to step 1 after mode selection', async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Should navigate to coffee info step
      await coffeeRecordPage.expectText('h2', '커피 정보')
      await coffeeRecordPage.expectElementVisible('input[name="coffeeName"]')
    })

    test('should show different forms for different modes', async () => {
      // Test Cafe mode
      await coffeeRecordPage.testCafeMode()
      
      // Go back and test HomeCafe mode
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.testHomecafeMode()
      
      // Go back and test Lab mode
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.testLabMode()
    })
  })

  test.describe('Step 1: Coffee Information', () => {
    test.beforeEach(async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
    })

    test('should validate required fields', async () => {
      // Try to proceed without filling required fields
      await coffeeRecordPage.expectValidationErrors()
    })

    test('should fill and validate coffee information', async () => {
      const coffeeInfo = {
        name: 'Ethiopian Yirgacheffe',
        roastery: 'Blue Bottle Coffee',
        origin: 'Ethiopia',
        roastLevel: 'Light',
        brewMethod: 'V60'
      }

      await coffeeRecordPage.fillCoffeeInfo(coffeeInfo)
      
      // Verify data is entered correctly
      await coffeeRecordPage.expectValue('input[name="coffeeName"]', coffeeInfo.name)
      await coffeeRecordPage.expectValue('input[name="roastery"]', coffeeInfo.roastery)
      await coffeeRecordPage.expectValue('input[name="origin"]', coffeeInfo.origin)
      
      // Should be able to proceed to next step
      await coffeeRecordPage.goToNextStep()
      await coffeeRecordPage.expectText('h2', '로스터 노트')
    })

    test('should handle image upload', async () => {
      const imagePath = './e2e/fixtures/coffee-image.jpg'
      
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Test Coffee',
        roastery: 'Test Roastery',
        origin: 'Brazil'
      })
      
      await coffeeRecordPage.uploadImage(imagePath)
      
      // Should show uploaded image preview
      await coffeeRecordPage.expectElementVisible('[data-testid="uploaded-image"]')
    })

    test('should persist data when navigating back and forth', async () => {
      await coffeeRecordPage.testDataPersistence()
    })

    test('should show different fields for HomeCafe mode', async () => {
      // Go back to mode selection
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.selectMode('homecafe')
      
      // HomeCafe mode should show additional fields
      await coffeeRecordPage.expectElementVisible('input[name="brewTime"]')
      await coffeeRecordPage.expectElementVisible('input[name="waterTemp"]')
      await coffeeRecordPage.expectElementVisible('input[name="grindSize"]')
    })

    test('should show advanced fields for Lab mode', async () => {
      // Go back to mode selection
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.selectMode('lab')
      
      // Lab mode should show scientific parameters
      await coffeeRecordPage.expectElementVisible('input[name="tds"]')
      await coffeeRecordPage.expectElementVisible('input[name="extractionTime"]')
      await coffeeRecordPage.expectElementVisible('input[name="extractionYield"]')
    })
  })

  test.describe('Step 2: Roaster Notes', () => {
    test.beforeEach(async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Complete step 1
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Test Coffee',
        roastery: 'Test Roastery',
        origin: 'Colombia'
      })
      await coffeeRecordPage.goToNextStep()
    })

    test('should display roaster notes form', async () => {
      await coffeeRecordPage.expectText('h2', '로스터 노트')
      await coffeeRecordPage.expectElementVisible('textarea[name="roasterNote"]')
      await coffeeRecordPage.expectElementVisible('[data-testid="flavor-tags"]')
    })

    test('should allow filling roaster notes', async () => {
      const roasterNote = 'Bright citrus with chocolate undertones'
      
      await coffeeRecordPage.fillRoasterNotes(roasterNote)
      await coffeeRecordPage.expectValue('textarea[name="roasterNote"]', roasterNote)
    })

    test('should allow selecting flavor tags', async () => {
      const flavorTags = ['Citrus', 'Chocolate', 'Floral']
      
      await coffeeRecordPage.selectFlavorTags(flavorTags)
      
      // Verify tags are selected
      for (const tag of flavorTags) {
        await coffeeRecordPage.expectElementVisible(`[data-testid="selected-tag"]:has-text("${tag}")`)
      }
    })

    test('should proceed to next step', async () => {
      await coffeeRecordPage.fillRoasterNotes('Test roaster note')
      await coffeeRecordPage.goToNextStep()
      
      await coffeeRecordPage.expectText('h2', '개인 테이스팅')
    })

    test('should allow going back to previous step', async () => {
      await coffeeRecordPage.goToPreviousStep()
      await coffeeRecordPage.expectText('h2', '커피 정보')
    })
  })

  test.describe('Step 3: Personal Tasting', () => {
    test.beforeEach(async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Complete steps 1 and 2
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Test Coffee',
        roastery: 'Test Roastery',
        origin: 'Colombia'
      })
      await coffeeRecordPage.goToNextStep()
      
      await coffeeRecordPage.fillRoasterNotes('Test roaster note')
      await coffeeRecordPage.goToNextStep()
    })

    test('should display personal tasting form', async () => {
      await coffeeRecordPage.expectText('h2', '개인 테이스팅')
      await coffeeRecordPage.expectElementVisible('textarea[name="taste"]')
      await coffeeRecordPage.expectElementVisible('textarea[name="memo"]')
      await coffeeRecordPage.expectElementVisible('[data-testid="rating-star"]')
    })

    test('should allow filling personal tasting notes', async () => {
      const tastingData = {
        taste: 'Sweet and bright with lemon notes',
        memo: 'Perfect morning coffee',
        rating: 4,
        matchScore: 85
      }

      await coffeeRecordPage.fillPersonalTasting(tastingData)
      
      // Verify data is entered
      await coffeeRecordPage.expectValue('textarea[name="taste"]', tastingData.taste)
      await coffeeRecordPage.expectValue('textarea[name="memo"]', tastingData.memo)
    })

    test('should handle star rating interaction', async () => {
      // Click on 4th star
      await coffeeRecordPage.page.locator('[data-testid="rating-star"]').nth(3).click()
      
      // First 4 stars should be filled
      for (let i = 0; i < 4; i++) {
        await expect(coffeeRecordPage.page.locator('[data-testid="rating-star"]').nth(i)).toHaveClass(/filled/)
      }
      
      // 5th star should not be filled
      await expect(coffeeRecordPage.page.locator('[data-testid="rating-star"]').nth(4)).not.toHaveClass(/filled/)
    })

    test('should validate required fields', async () => {
      // Try to proceed without filling required fields
      await coffeeRecordPage.goToNextStep()
      await coffeeRecordPage.expectElementVisible('.text-red-500')
    })

    test('should proceed to review step', async () => {
      await coffeeRecordPage.fillPersonalTasting({
        taste: 'Test taste',
        memo: 'Test memo',
        rating: 4
      })
      
      await coffeeRecordPage.goToNextStep()
      await coffeeRecordPage.expectText('h2', '기록 검토')
    })
  })

  test.describe('Step 4: Review and Save', () => {
    const testRecord = {
      mode: 'cafe' as const,
      coffeeInfo: {
        name: 'Review Test Coffee',
        roastery: 'Review Roastery',
        origin: 'Kenya'
      },
      roasterNote: 'Review roaster note',
      personalTasting: {
        taste: 'Review taste note',
        memo: 'Review memo',
        rating: 5
      }
    }

    test.beforeEach(async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode(testRecord.mode)
      
      // Complete all previous steps
      await coffeeRecordPage.fillCoffeeInfo(testRecord.coffeeInfo)
      await coffeeRecordPage.goToNextStep()
      
      await coffeeRecordPage.fillRoasterNotes(testRecord.roasterNote)
      await coffeeRecordPage.goToNextStep()
      
      await coffeeRecordPage.fillPersonalTasting(testRecord.personalTasting)
      await coffeeRecordPage.goToNextStep()
    })

    test('should display review summary', async () => {
      await coffeeRecordPage.expectText('h2', '기록 검토')
      
      // Should show all entered data
      await coffeeRecordPage.expectText('[data-testid="review-summary"]', testRecord.coffeeInfo.name)
      await coffeeRecordPage.expectText('[data-testid="review-summary"]', testRecord.coffeeInfo.roastery)
      await coffeeRecordPage.expectText('[data-testid="review-summary"]', testRecord.roasterNote)
      await coffeeRecordPage.expectText('[data-testid="review-summary"]', testRecord.personalTasting.taste)
    })

    test('should allow editing from review screen', async () => {
      // Click edit button for step 1
      await coffeeRecordPage.page.locator('[data-testid="edit-step-1"]').click()
      
      // Should go back to step 1
      await coffeeRecordPage.expectText('h2', '커피 정보')
      
      // Data should be preserved
      await coffeeRecordPage.expectValue('input[name="coffeeName"]', testRecord.coffeeInfo.name)
    })

    test('should save record successfully', async () => {
      await coffeeRecordPage.saveRecord()
      
      // Should navigate to result page
      await coffeeRecordPage.expectElementVisible('[data-testid="match-score"]')
      await coffeeRecordPage.expectText('h1', '기록 완료!')
    })

    test('should display match score calculation', async () => {
      await coffeeRecordPage.saveRecord()
      
      await coffeeRecordPage.expectMatchScoreCalculation()
    })

    test('should handle save errors gracefully', async () => {
      // Simulate network error
      await coffeeRecordPage.page.route('**/api/records', route => route.abort())
      
      await coffeeRecordPage.saveRecord()
      
      // Should show error message
      await coffeeRecordPage.expectElementVisible('[data-testid="error-message"]')
      await coffeeRecordPage.expectText('[data-testid="error-message"]', '저장 중 오류가 발생했습니다')
    })
  })

  test.describe('Complete Flow Integration', () => {
    test('should complete full cafe mode recording', async () => {
      const testData = {
        mode: 'cafe' as const,
        coffeeInfo: {
          name: 'Integration Test Coffee',
          roastery: 'Integration Roastery',
          origin: 'Guatemala'
        },
        roasterNote: 'Integration test roaster note',
        personalTasting: {
          taste: 'Integration test taste',
          memo: 'Integration test memo',
          rating: 4
        }
      }

      await coffeeRecordPage.completeFullRecord(testData)
      
      // Should show result page with match score
      await coffeeRecordPage.expectElementVisible('[data-testid="match-score"]')
    })

    test('should complete full homecafe mode recording', async () => {
      const testData = {
        mode: 'homecafe' as const,
        coffeeInfo: {
          name: 'HomeCafe Test Coffee',
          roastery: 'HomeCafe Roastery',
          origin: 'Brazil'
        },
        roasterNote: 'HomeCafe test note',
        personalTasting: {
          taste: 'HomeCafe taste',
          memo: 'HomeCafe memo',
          rating: 5
        }
      }

      await coffeeRecordPage.completeFullRecord(testData)
      await coffeeRecordPage.expectElementVisible('[data-testid="match-score"]')
    })

    test('should complete full lab mode recording', async () => {
      const testData = {
        mode: 'lab' as const,
        coffeeInfo: {
          name: 'Lab Test Coffee',
          roastery: 'Lab Roastery',
          origin: 'Ethiopia'
        },
        roasterNote: 'Lab test note with detailed analysis',
        personalTasting: {
          taste: 'Lab taste with scientific notes',
          memo: 'Lab memo with measurements',
          rating: 4
        }
      }

      await coffeeRecordPage.completeFullRecord(testData)
      await coffeeRecordPage.expectElementVisible('[data-testid="match-score"]')
    })

    test('should trigger first record achievement', async () => {
      // This test assumes a fresh user account
      const testData = {
        mode: 'cafe' as const,
        coffeeInfo: {
          name: 'First Record Coffee',
          roastery: 'First Roastery',
          origin: 'Colombia'
        },
        roasterNote: 'My first coffee record',
        personalTasting: {
          taste: 'First taste note',
          memo: 'First memo',
          rating: 4
        }
      }

      await coffeeRecordPage.completeFullRecord(testData)
      
      // Should show achievement notification
      await coffeeRecordPage.expectFirstRecordAchievement()
    })
  })

  test.describe('Mobile Experience', () => {
    test('should work properly on mobile devices', async () => {
      await coffeeRecordPage.testMobileFlow()
    })

    test('should handle mobile form interactions', async () => {
      await coffeeRecordPage.setMobileViewport()
      
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Test mobile-specific interactions
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Mobile Coffee',
        roastery: 'Mobile Roastery',
        origin: 'Mobile Origin'
      })
      
      // Mobile navigation should work
      await coffeeRecordPage.goToNextStep()
      await coffeeRecordPage.expectText('h2', '로스터 노트')
    })

    test('should handle mobile image upload', async () => {
      await coffeeRecordPage.setMobileViewport()
      
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Mobile image upload
      const imagePath = './e2e/fixtures/mobile-coffee-image.jpg'
      await coffeeRecordPage.uploadImage(imagePath)
      
      await coffeeRecordPage.expectElementVisible('[data-testid="uploaded-image"]')
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Test tab navigation through form
      await page.keyboard.press('Tab')
      await coffeeRecordPage.expectFocused('input[name="coffeeName"]')
      
      await page.keyboard.press('Tab')
      await coffeeRecordPage.expectFocused('input[name="roastery"]')
    })

    test('should have proper form labels', async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Check for proper labels
      await coffeeRecordPage.expectAriaLabel('input[name="coffeeName"]', '커피명')
      await coffeeRecordPage.expectAriaLabel('input[name="roastery"]', '로스터리')
    })

    test('should announce step changes to screen readers', async ({ page }) => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Should have aria-live region for step announcements
      await coffeeRecordPage.expectElementVisible('[aria-live="polite"]')
    })
  })

  test.describe('Error Handling', () => {
    test('should handle network errors during save', async () => {
      await coffeeRecordPage.testNetworkError()
    })

    test('should handle validation errors appropriately', async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Submit without required data
      await coffeeRecordPage.goToNextStep()
      
      // Should highlight missing fields
      await coffeeRecordPage.expectElementVisible('.border-red-500')
      await coffeeRecordPage.expectElementVisible('.text-red-500')
    })

    test('should handle image upload errors', async ({ page }) => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      // Simulate image upload error
      await page.route('**/upload', route => route.abort())
      
      const imagePath = './e2e/fixtures/coffee-image.jpg'
      await coffeeRecordPage.uploadImage(imagePath)
      
      // Should show upload error
      await coffeeRecordPage.expectElementVisible('[data-testid="upload-error"]')
    })
  })

  test.describe('Data Persistence', () => {
    test('should preserve data across page refreshes', async ({ page }) => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Persistence Test',
        roastery: 'Persistence Roastery',
        origin: 'Peru'
      })
      
      // Refresh page
      await page.reload()
      
      // Data should be preserved (assuming local storage implementation)
      await coffeeRecordPage.expectValue('input[name="coffeeName"]', 'Persistence Test')
    })

    test('should handle browser back/forward navigation', async ({ page }) => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Navigation Test',
        roastery: 'Navigation Roastery',
        origin: 'Mexico'
      })
      
      await coffeeRecordPage.goToNextStep()
      
      // Use browser back button
      await page.goBack()
      
      // Should return to step 1 with data preserved
      await coffeeRecordPage.expectText('h2', '커피 정보')
      await coffeeRecordPage.expectValue('input[name="coffeeName"]', 'Navigation Test')
    })
  })

  test.describe('Performance', () => {
    test('should load steps quickly', async () => {
      await coffeeRecordPage.startRecording()
      
      const startTime = Date.now()
      await coffeeRecordPage.selectMode('cafe')
      const endTime = Date.now()
      
      const loadTime = endTime - startTime
      expect(loadTime).toBeLessThan(2000) // Should load within 2 seconds
    })

    test('should handle large image uploads efficiently', async () => {
      await coffeeRecordPage.startRecording()
      await coffeeRecordPage.selectMode('cafe')
      
      await coffeeRecordPage.fillCoffeeInfo({
        name: 'Large Image Test',
        roastery: 'Test Roastery',
        origin: 'Costa Rica'
      })
      
      const startTime = Date.now()
      const largImagePath = './e2e/fixtures/large-coffee-image.jpg'
      await coffeeRecordPage.uploadImage(largImagePath)
      const endTime = Date.now()
      
      const uploadTime = endTime - startTime
      expect(uploadTime).toBeLessThan(5000) // Should upload within 5 seconds
    })
  })
})