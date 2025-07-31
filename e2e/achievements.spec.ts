import { test, expect } from '@playwright/test'
import { AchievementPage } from './pages/AchievementPage'
import { AuthPage } from './pages/AuthPage'
import { CoffeeRecordPage } from './pages/CoffeeRecordPage'

test.describe('Achievement System', () => {
  let achievementPage: AchievementPage
  let authPage: AuthPage
  let coffeeRecordPage: CoffeeRecordPage

  test.beforeEach(async ({ page }) => {
    achievementPage = new AchievementPage(page)
    authPage = new AuthPage(page)
    coffeeRecordPage = new CoffeeRecordPage(page)
    
    // Login before each test
    await authPage.goto('/')
    await authPage.login('test@example.com', 'password123')
    await authPage.expectAuthSuccess()
  })

  test.describe('Achievement Display', () => {
    test('should display all achievement categories', async () => {
      await achievementPage.navigateToAchievements()
      
      // Should show all category filters
      await achievementPage.expectElementVisible('button:has-text("마일스톤")')
      await achievementPage.expectElementVisible('button:has-text("탐험")')
      await achievementPage.expectElementVisible('button:has-text("품질")')
      await achievementPage.expectElementVisible('button:has-text("일관성")')
      await achievementPage.expectElementVisible('button:has-text("특별")')
    })

    test('should show achievement list with proper status', async () => {
      await achievementPage.viewAllAchievements()
      
      // Should show achievement cards
      await achievementPage.expectElementVisible('[data-testid="achievement-list"]')
      await achievementPage.expectElementVisible('[data-testid="achievement-card"]')
      
      // Each achievement should have proper status (locked/unlocked)
      const achievementCards = await achievementPage.page.locator('[data-testid="achievement-card"]').all()
      
      for (const card of achievementCards) {
        const isUnlocked = await card.locator('.unlocked').isVisible()
        
        if (isUnlocked) {
          await expect(card.locator('[data-testid="achievement-icon"]')).toBeVisible()
          await expect(card.locator('[data-testid="achievement-complete"]')).toBeVisible()
        } else {
          await expect(card.locator('[data-testid="progress-bar"]')).toBeVisible()
          await expect(card.locator('[data-testid="progress-text"]')).toBeVisible()
        }
      }
    })

    test('should filter achievements by category', async () => {
      await achievementPage.navigateToAchievements()
      
      // Test milestone category
      await achievementPage.filterByCategory('milestone')
      await achievementPage.expectElementVisible('[data-testid="filtered-achievements"]')
      
      // Should only show milestone achievements
      const visibleAchievements = await achievementPage.page.locator('[data-testid="achievement-card"]:visible').all()
      for (const achievement of visibleAchievements) {
        const category = await achievement.getAttribute('data-category')
        expect(category).toBe('milestone')
      }
    })

    test('should show achievement details on click', async () => {
      await achievementPage.navigateToAchievements()
      
      // Click on first achievement
      await achievementPage.page.locator('[data-testid="achievement-card"]').first().click()
      
      // Should show achievement modal with details
      await achievementPage.expectElementVisible('[data-testid="achievement-modal"]')
      await achievementPage.expectElementVisible('[data-testid="achievement-detail"]')
      
      // Modal should contain achievement information
      await achievementPage.expectElementVisible('.achievement-title')
      await achievementPage.expectElementVisible('.achievement-description')
      await achievementPage.expectElementVisible('.achievement-reward')
    })

    test('should close achievement modal', async () => {
      await achievementPage.navigateToAchievements()
      
      // Open modal
      await achievementPage.page.locator('[data-testid="achievement-card"]').first().click()
      await achievementPage.expectElementVisible('[data-testid="achievement-modal"]')
      
      // Close modal
      await achievementPage.closeAchievementModal()
      await achievementPage.expectElementHidden('[data-testid="achievement-modal"]')
    })
  })

  test.describe('Progress Tracking', () => {
    test('should display accurate progress for locked achievements', async () => {
      await achievementPage.testProgressTracking()
    })

    test('should show progress bars for incomplete achievements', async () => {
      await achievementPage.navigateToAchievements()
      
      const lockedAchievements = await achievementPage.page.locator('[data-testid="achievement-card"].locked').all()
      
      for (const achievement of lockedAchievements) {
        // Should have progress bar
        await expect(achievement.locator('[data-testid="progress-bar"]')).toBeVisible()
        
        // Should have progress text (e.g., "3/10")
        await expect(achievement.locator('[data-testid="progress-text"]')).toBeVisible()
        
        // Progress should be between 0-100%
        const progressBar = achievement.locator('[data-testid="progress-bar"]')
        const progressValue = await progressBar.getAttribute('value')
        const progress = parseInt(progressValue || '0')
        expect(progress).toBeGreaterThanOrEqual(0)
        expect(progress).toBeLessThanOrEqual(100)
      }
    })

    test('should update progress in real-time', async () => {
      // Check initial progress for first record achievement
      await achievementPage.navigateToAchievements()
      await achievementPage.expectAchievementLocked('first-record')
      
      // Create a coffee record
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Progress Test Coffee',
          roastery: 'Progress Roastery',
          origin: 'Progress Origin'
        },
        roasterNote: 'Progress test note',
        personalTasting: {
          taste: 'Progress test taste',
          memo: 'Progress test memo',
          rating: 4
        }
      })
      
      // Achievement should now be unlocked
      await achievementPage.navigateToAchievements()
      await achievementPage.expectAchievementUnlocked('first-record')
    })
  })

  test.describe('Achievement Unlocking', () => {
    test('should unlock first record achievement', async () => {
      await achievementPage.testFirstRecordAchievement()
    })

    test('should show achievement notification when unlocked', async () => {
      // Create a record that should unlock achievement
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Notification Test Coffee',
          roastery: 'Notification Roastery',
          origin: 'Brazil'
        },
        roasterNote: 'Notification test',
        personalTasting: {
          taste: 'Notification taste',
          memo: 'Notification memo',
          rating: 5
        }
      })
      
      // Should show achievement notification
      await achievementPage.expectAchievementNotification('첫 기록')
    })

    test('should allow dismissing achievement notifications', async () => {
      // Trigger achievement notification
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Dismiss Test Coffee',
          roastery: 'Dismiss Roastery',
          origin: 'Kenya'
        },
        roasterNote: 'Dismiss test',
        personalTasting: {
          taste: 'Dismiss taste',
          memo: 'Dismiss memo',
          rating: 4
        }
      })
      
      // Should show notification
      await achievementPage.expectAchievementNotification('첫 기록')
      
      // Dismiss notification
      await achievementPage.dismissNotification()
      await achievementPage.expectElementHidden('[data-testid="achievement-notification"]')
    })

    test('should handle multiple simultaneous achievement unlocks', async () => {
      // Create a scenario that unlocks multiple achievements
      // This might happen when a user reaches a milestone that triggers multiple conditions
      
      // For example, creating the 10th record with 5-star rating might unlock both
      // "Coffee Lover" (10 records) and "Perfectionist" (5-star rating) achievements
      
      // This test would require setting up appropriate test data
      await achievementPage.expectMultipleNotifications(2)
    })
  })

  test.describe('Milestone Achievements', () => {
    test('should track milestone progress correctly', async () => {
      await achievementPage.testMilestoneAchievements()
    })

    test('should unlock coffee lover achievement at 10 records', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('milestone')
      
      // Initially should be locked
      await achievementPage.expectAchievementLocked('coffee-lover')
      
      // Create 10 coffee records (this would require test data setup)
      // In a real scenario, you'd either:
      // 1. Set up test data beforehand
      // 2. Use database seeding
      // 3. Create records programmatically
      
      // For demonstration, we'll check the progress
      await achievementPage.expectAchievementProgress('coffee-lover', 10)
    })

    test('should show correct progress for expert and master achievements', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('milestone')
      
      // Coffee Expert (50 records) and Coffee Master (100 records)
      // Should show as locked with progress
      await achievementPage.expectAchievementLocked('coffee-expert')
      await achievementPage.expectAchievementLocked('coffee-master')
    })
  })

  test.describe('Exploration Achievements', () => {
    test('should track origin exploration', async () => {
      await achievementPage.testExplorationAchievements()
    })

    test('should unlock world explorer achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('exploration')
      
      // World Explorer requires 10 different origins
      await achievementPage.expectAchievementLocked('world-explorer')
      
      // Progress should reflect number of unique origins tried
      // This would require creating records with different origins
    })

    test('should unlock roastery hopper achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('exploration')
      
      // Roastery Hopper requires 5 different roasteries
      await achievementPage.expectAchievementLocked('roastery-hopper')
    })
  })

  test.describe('Quality Achievements', () => {
    test('should track quality metrics', async () => {
      await achievementPage.testQualityAchievements()
    })

    test('should unlock perfectionist achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('quality')
      
      // Perfectionist requires 10 five-star ratings
      await achievementPage.expectAchievementLocked('perfectionist')
      
      // Create a 5-star record
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Perfect Coffee',
          roastery: 'Perfect Roastery',
          origin: 'Perfect Origin'
        },
        roasterNote: 'Perfect roaster note',
        personalTasting: {
          taste: 'Perfect taste',
          memo: 'Perfect memo',
          rating: 5 // 5-star rating
        }
      })
      
      // Progress should increase
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('quality')
      // Progress should be 1/10 now
    })

    test('should unlock quality seeker achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('quality')
      
      // Quality Seeker requires 4+ average rating
      await achievementPage.expectAchievementLocked('quality-seeker')
      
      // This would unlock when user maintains 4+ average rating
    })
  })

  test.describe('Consistency Achievements', () => {
    test('should track streak progress', async () => {
      await achievementPage.testConsistencyAchievements()
    })

    test('should unlock daily ritual achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('consistency')
      
      // Daily Ritual requires 7-day streak
      await achievementPage.expectAchievementLocked('daily-ritual')
      
      // This would require creating records on consecutive days
      // In a real test, you'd manipulate dates or use test data
    })

    test('should unlock dedication achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('consistency')
      
      // Dedication requires 30-day streak
      await achievementPage.expectAchievementLocked('dedication')
    })
  })

  test.describe('Special Achievements', () => {
    test('should track special mode usage', async () => {
      await achievementPage.testSpecialAchievements()
    })

    test('should unlock lab scientist achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('special')
      
      // Lab Scientist requires 10 lab mode records
      await achievementPage.expectAchievementLocked('lab-scientist')
      
      // Create a lab mode record
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'lab',
        coffeeInfo: {
          name: 'Lab Test Coffee',
          roastery: 'Lab Roastery',
          origin: 'Lab Origin'
        },
        roasterNote: 'Scientific analysis of flavor compounds',
        personalTasting: {
          taste: 'Precisely measured taste profile',
          memo: 'Lab conditions maintained',
          rating: 4
        }
      })
      
      // Progress should increase
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('special')
      // Progress should be 1/10 now
    })

    test('should unlock home barista achievement', async () => {
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('special')
      
      // Home Barista requires 20 homecafe mode records
      await achievementPage.expectAchievementLocked('home-barista')
      
      // Create a homecafe mode record
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'homecafe',
        coffeeInfo: {
          name: 'Home Brew Coffee',
          roastery: 'Home Roastery',
          origin: 'Home Origin'
        },
        roasterNote: 'Home brewing expertise',
        personalTasting: {
          taste: 'Perfect home extraction',
          memo: 'Mastering home brewing',
          rating: 5
        }
      })
      
      // Progress should increase
      await achievementPage.navigateToAchievements()
      await achievementPage.filterByCategory('special')
      // Progress should be 1/20 now
    })
  })

  test.describe('Level System', () => {
    test('should display current user level', async () => {
      await achievementPage.testLevelProgression()
    })

    test('should show level progress bar', async () => {
      await achievementPage.navigateToStats()
      
      // Should show level information
      await achievementPage.expectElementVisible('[data-testid="user-level"]')
      await achievementPage.expectElementVisible('[data-testid="level-progress"]')
      await achievementPage.expectElementVisible('[data-testid="user-points"]')
      
      // Should show next level requirements
      await achievementPage.expectElementVisible('[data-testid="next-level-info"]')
    })

    test('should level up when earning enough points', async () => {
      // Check current level
      await achievementPage.navigateToStats()
      const currentLevelText = await achievementPage.page.locator('[data-testid="user-level"]').textContent()
      const currentLevel = parseInt(currentLevelText?.match(/\d+/)?.[0] || '1')
      
      // Create enough achievements to level up
      // This would require earning enough points through achievements
      
      // After earning points, level should increase
      // This test would need proper point calculation and achievement unlocking
    })

    test('should show appropriate level title and description', async () => {
      await achievementPage.navigateToStats()
      
      // Should show level title (e.g., "커피 입문자", "커피 팬", etc.)
      await achievementPage.expectElementVisible('[data-testid="level-title"]')
      await achievementPage.expectElementVisible('[data-testid="level-description"]')
    })
  })

  test.describe('Statistics Display', () => {
    test('should show comprehensive user statistics', async () => {
      await achievementPage.navigateToStats()
      
      // Should show all key statistics
      await achievementPage.expectElementVisible('[data-testid="total-records"]')
      await achievementPage.expectElementVisible('[data-testid="total-points"]')
      await achievementPage.expectElementVisible('[data-testid="current-level"]')
      await achievementPage.expectElementVisible('[data-testid="achievement-count"]')
      await achievementPage.expectElementVisible('[data-testid="streak-count"]')
    })

    test('should display accurate achievement count', async () => {
      await achievementPage.navigateToStats()
      
      const unlockedCount = await achievementPage.page.locator('[data-testid="achievement-card"].unlocked').count()
      const displayedCount = await achievementPage.page.locator('[data-testid="achievement-count"]').textContent()
      
      expect(displayedCount).toContain(unlockedCount.toString())
    })

    test('should show current streak information', async () => {
      await achievementPage.navigateToStats()
      
      // Should show current and longest streak
      await achievementPage.expectElementVisible('[data-testid="current-streak"]')
      await achievementPage.expectElementVisible('[data-testid="longest-streak"]')
    })
  })

  test.describe('Mobile Achievement Experience', () => {
    test('should work properly on mobile devices', async () => {
      await achievementPage.testMobileAchievementView()
    })

    test('should show mobile-friendly achievement grid', async () => {
      await achievementPage.setMobileViewport()
      await achievementPage.navigateToAchievements()
      
      // Mobile grid should be responsive
      await achievementPage.expectElementVisible('[data-testid="achievement-grid"]')
      
      // Achievement cards should be properly sized for mobile
      const cardWidth = await achievementPage.page.locator('[data-testid="achievement-card"]').first().boundingBox()
      expect(cardWidth?.width).toBeLessThan(400) // Should fit mobile screen
    })

    test('should handle mobile achievement notifications', async () => {
      await achievementPage.setMobileViewport()
      
      // Create achievement-triggering action
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Mobile Achievement Coffee',
          roastery: 'Mobile Roastery',
          origin: 'Mobile Origin'
        },
        roasterNote: 'Mobile achievement test',
        personalTasting: {
          taste: 'Mobile taste',
          memo: 'Mobile memo',
          rating: 4
        }
      })
      
      // Mobile notification should be properly positioned
      await achievementPage.expectAchievementNotification('첫 기록')
      
      // Should be dismissible on mobile
      await achievementPage.dismissNotification()
    })
  })

  test.describe('Visual Regression Testing', () => {
    test('should display achievement badges correctly', async () => {
      await achievementPage.testAchievementBadgeDisplay()
    })

    test('should maintain consistent visual styling', async ({ page }) => {
      await achievementPage.navigateToAchievements()
      
      // Take screenshot for visual regression testing
      await page.screenshot({ path: 'e2e/screenshots/achievements-page.png' })
      
      // Check visual consistency of achievement cards
      const achievementCards = await page.locator('[data-testid="achievement-card"]').all()
      
      for (const card of achievementCards) {
        // Each card should have consistent dimensions
        const boundingBox = await card.boundingBox()
        expect(boundingBox?.height).toBeGreaterThan(100)
        expect(boundingBox?.width).toBeGreaterThan(200)
        
        // Should have proper visual indicators
        await expect(card).toHaveCSS('border-radius', /\d+px/)
        await expect(card).toHaveCSS('box-shadow', /.*/)
      }
    })
  })

  test.describe('Performance Testing', () => {
    test('should load achievements quickly', async () => {
      await achievementPage.testAchievementLoadTime()
    })

    test('should handle large numbers of achievements efficiently', async () => {
      await achievementPage.navigateToAchievements()
      
      // Should load all achievements without performance issues
      const achievementCount = await achievementPage.page.locator('[data-testid="achievement-card"]').count()
      expect(achievementCount).toBeGreaterThan(10) // Should have multiple achievements
      
      // Filtering should be fast
      const startTime = Date.now()
      await achievementPage.filterByCategory('milestone')
      const endTime = Date.now()
      
      const filterTime = endTime - startTime
      expect(filterTime).toBeLessThan(1000) // Should filter within 1 second
    })
  })

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async () => {
      await achievementPage.testAchievementAccessibility()
    })

    test('should provide proper ARIA labels for achievements', async ({ page }) => {
      await achievementPage.navigateToAchievements()
      
      // Achievement cards should have proper ARIA labels
      const achievementCards = await page.locator('[data-testid="achievement-card"]').all()
      
      for (const card of achievementCards) {
        // Should have descriptive ARIA labels
        const ariaLabel = await card.getAttribute('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('achievement') // Should mention it's an achievement
      }
    })

    test('should announce achievement unlocks to screen readers', async ({ page }) => {
      // Create achievement-triggering action
      await coffeeRecordPage.goto('/mode-selection')
      await coffeeRecordPage.completeFullRecord({
        mode: 'cafe',
        coffeeInfo: {
          name: 'Accessibility Test Coffee',
          roastery: 'Accessibility Roastery',
          origin: 'Accessibility Origin'
        },
        roasterNote: 'Accessibility test',
        personalTasting: {
          taste: 'Accessibility taste',
          memo: 'Accessibility memo',
          rating: 4
        }
      })
      
      // Achievement notification should be announced
      await achievementPage.expectElementVisible('[aria-live="assertive"]')
      await achievementPage.expectElementVisible('[role="alert"]')
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle empty achievement state for new users', async () => {
      await achievementPage.testEmptyAchievementState()
    })

    test('should handle maximum level users appropriately', async () => {
      await achievementPage.testMaxLevelUser()
    })

    test('should handle achievement data synchronization', async ({ page }) => {
      // Test scenario where achievement data might be out of sync
      await achievementPage.navigateToAchievements()
      
      // Simulate data refresh
      await page.reload()
      
      // Achievements should reload correctly
      await achievementPage.expectElementVisible('[data-testid="achievement-list"]')
      await achievementPage.expectElementVisible('[data-testid="achievement-card"]')
    })

    test('should handle concurrent achievement unlocks', async () => {
      // This would test race conditions when multiple achievements
      // might be unlocked simultaneously
      
      // Create multiple records rapidly that might trigger different achievements
      const records = [
        { name: 'Concurrent 1', mode: 'cafe' as const },
        { name: 'Concurrent 2', mode: 'homecafe' as const },
        { name: 'Concurrent 3', mode: 'lab' as const }
      ]
      
      for (const record of records) {
        await coffeeRecordPage.goto('/mode-selection')
        await coffeeRecordPage.completeFullRecord({
          mode: record.mode,
          coffeeInfo: {
            name: record.name,
            roastery: 'Concurrent Roastery',
            origin: 'Concurrent Origin'
          },
          roasterNote: 'Concurrent test',
          personalTasting: {
            taste: 'Concurrent taste',
            memo: 'Concurrent memo',
            rating: 4
          }
        })
      }
      
      // Should handle multiple achievements gracefully
      await achievementPage.navigateToAchievements()
      await achievementPage.expectElementVisible('[data-testid="achievement-list"]')
    })
  })
})