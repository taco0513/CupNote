import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Achievement System functionality
 */
export class AchievementPage extends BasePage {
  // Navigation locators
  private readonly achievementsTab: Locator
  private readonly statsTab: Locator

  // Achievement display locators
  private readonly achievementList: Locator
  private readonly achievementCards: Locator
  private readonly unlockedAchievements: Locator
  private readonly lockedAchievements: Locator
  private readonly achievementModal: Locator
  private readonly achievementDetail: Locator

  // Progress locators
  private readonly progressBars: Locator
  private readonly progressText: Locator
  private readonly levelDisplay: Locator
  private readonly pointsDisplay: Locator
  private readonly levelProgressBar: Locator

  // Category filter locators
  private readonly categoryFilter: Locator
  private readonly milestoneCategory: Locator
  private readonly explorationCategory: Locator
  private readonly qualityCategory: Locator
  private readonly consistencyCategory: Locator
  private readonly specialCategory: Locator

  // Notification locators
  private readonly achievementNotification: Locator
  private readonly notificationClose: Locator
  private readonly notificationList: Locator

  // Stats locators
  private readonly totalRecordsCount: Locator
  private readonly totalPointsCount: Locator
  private readonly currentLevel: Locator
  private readonly achievementCount: Locator
  private readonly streakCount: Locator

  constructor(page: Page) {
    super(page)

    // Navigation
    this.achievementsTab = page.getByText('성취')
    this.statsTab = page.getByText('통계')

    // Achievement display
    this.achievementList = page.locator('[data-testid="achievement-list"]')
    this.achievementCards = page.locator('[data-testid="achievement-card"]')
    this.unlockedAchievements = page.locator('[data-testid="achievement-card"].unlocked')
    this.lockedAchievements = page.locator('[data-testid="achievement-card"].locked')
    this.achievementModal = page.locator('[data-testid="achievement-modal"]')
    this.achievementDetail = page.locator('[data-testid="achievement-detail"]')

    // Progress
    this.progressBars = page.locator('[data-testid="progress-bar"]')
    this.progressText = page.locator('[data-testid="progress-text"]')
    this.levelDisplay = page.locator('[data-testid="user-level"]')
    this.pointsDisplay = page.locator('[data-testid="user-points"]')
    this.levelProgressBar = page.locator('[data-testid="level-progress"]')

    // Category filters
    this.categoryFilter = page.locator('[data-testid="category-filter"]')
    this.milestoneCategory = page.locator('button:has-text("마일스톤")')
    this.explorationCategory = page.locator('button:has-text("탐험")')
    this.qualityCategory = page.locator('button:has-text("품질")')
    this.consistencyCategory = page.locator('button:has-text("일관성")')
    this.specialCategory = page.locator('button:has-text("특별")')

    // Notifications
    this.achievementNotification = page.locator('[data-testid="achievement-notification"]')
    this.notificationClose = page.locator('[data-testid="notification-close"]')
    this.notificationList = page.locator('[data-testid="notification-list"]')

    // Stats
    this.totalRecordsCount = page.locator('[data-testid="total-records"]')
    this.totalPointsCount = page.locator('[data-testid="total-points"]')
    this.currentLevel = page.locator('[data-testid="current-level"]')
    this.achievementCount = page.locator('[data-testid="achievement-count"]')
    this.streakCount = page.locator('[data-testid="streak-count"]')
  }

  // Navigation methods
  async navigateToAchievements() {
    await this.goto('/achievements')
    await this.waitForElement('[data-testid="achievement-list"]')
  }

  async navigateToStats() {
    await this.goto('/stats')
    await this.waitForElement('[data-testid="stats-dashboard"]')
  }

  // Achievement display methods
  async viewAllAchievements() {
    await this.navigateToAchievements()
    await this.expectElementVisible('[data-testid="achievement-list"]')
  }

  async filterByCategory(category: 'milestone' | 'exploration' | 'quality' | 'consistency' | 'special') {
    const categoryButtons = {
      milestone: this.milestoneCategory,
      exploration: this.explorationCategory,
      quality: this.qualityCategory,
      consistency: this.consistencyCategory,
      special: this.specialCategory
    }

    await categoryButtons[category].click()
    await this.waitForElement('[data-testid="filtered-achievements"]')
  }

  async viewAchievementDetail(achievementId: string) {
    await this.page.locator(`[data-testid="achievement-${achievementId}"]`).click()
    await this.achievementModal.waitFor({ state: 'visible' })
  }

  async closeAchievementModal() {
    await this.page.locator('[data-testid="modal-close"]').click()
    await this.achievementModal.waitFor({ state: 'hidden' })
  }

  // Achievement verification methods
  async expectAchievementUnlocked(achievementId: string) {
    const achievement = this.page.locator(`[data-testid="achievement-${achievementId}"]`)
    await expect(achievement).toHaveAttribute('class', /.*unlocked.*/)
    await expect(achievement.locator('[data-testid="achievement-icon"]')).toBeVisible()
  }

  async expectAchievementLocked(achievementId: string) {
    const achievement = this.page.locator(`[data-testid="achievement-${achievementId}"]`)
    await expect(achievement).toHaveAttribute('class', /.*locked.*/)
    await expect(achievement.locator('[data-testid="achievement-progress"]')).toBeVisible()
  }

  async expectAchievementProgress(achievementId: string, expectedProgress: number) {
    const progressElement = this.page.locator(`[data-testid="achievement-${achievementId}"] [data-testid="progress-text"]`)
    await expect(progressElement).toContainText(`${expectedProgress}`)
  }

  // Notification methods
  async expectAchievementNotification(achievementTitle: string) {
    await this.achievementNotification.waitFor({ state: 'visible' })
    await expect(this.achievementNotification).toContainText(achievementTitle)
  }

  async dismissNotification() {
    await this.notificationClose.click()
    await this.achievementNotification.waitFor({ state: 'hidden' })
  }

  async expectMultipleNotifications(count: number) {
    const notifications = await this.notificationList.locator('[data-testid="notification-item"]').count()
    expect(notifications).toBe(count)
  }

  // Level and points methods
  async expectUserLevel(expectedLevel: number) {
    await expect(this.levelDisplay).toContainText(`Level ${expectedLevel}`)
  }

  async expectUserPoints(expectedPoints: number) {
    await expect(this.pointsDisplay).toContainText(`${expectedPoints}`)
  }

  async expectLevelProgress(expectedProgress: number) {
    const progressBar = this.levelProgressBar
    const actualProgress = await progressBar.getAttribute('value')
    expect(parseInt(actualProgress || '0')).toBe(expectedProgress)
  }

  // Achievement unlock flow testing
  async testFirstRecordAchievement() {
    // Navigate to record creation and complete first record
    await this.goto('/mode-selection')
    
    // This assumes we're testing with a fresh user
    const recordPage = new (await import('./CoffeeRecordPage')).CoffeeRecordPage(this.page)
    
    await recordPage.completeFullRecord({
      mode: 'cafe',
      coffeeInfo: {
        name: 'First Coffee',
        roastery: 'Test Roastery',
        origin: 'Ethiopia'
      },
      roasterNote: 'First roaster note',
      personalTasting: {
        taste: 'First taste note',
        memo: 'First memo',
        rating: 4
      }
    })

    // Expect first record achievement notification
    await this.expectAchievementNotification('첫 기록')
    
    // Verify achievement is unlocked
    await this.navigateToAchievements()
    await this.expectAchievementUnlocked('first-record')
  }

  async testMilestoneAchievements() {
    // Test progression through milestone achievements
    const milestones = [
      { id: 'coffee-lover', recordCount: 10, title: '커피 애호가' },
      { id: 'coffee-expert', recordCount: 50, title: '커피 전문가' },
      { id: 'coffee-master', recordCount: 100, title: '커피 마스터' }
    ]

    for (const milestone of milestones) {
      // Check progress before threshold
      await this.navigateToAchievements()
      await this.expectAchievementLocked(milestone.id)

      // Simulate reaching threshold (this would require test data setup)
      // In a real test, you'd create the required number of records
      
      // Verify achievement unlocks at threshold
      await this.expectAchievementNotification(milestone.title)
      await this.expectAchievementUnlocked(milestone.id)
    }
  }

  async testExplorationAchievements() {
    await this.navigateToAchievements()
    await this.filterByCategory('exploration')

    // Test world explorer achievement (10+ origins)
    await this.expectAchievementLocked('world-explorer')
    
    // Test roastery hopper achievement (5+ roasteries)  
    await this.expectAchievementLocked('roastery-hopper')
  }

  async testQualityAchievements() {
    await this.navigateToAchievements()
    await this.filterByCategory('quality')

    // Test perfectionist achievement (10x 5-star ratings)
    await this.expectAchievementLocked('perfectionist')
    
    // Test quality seeker achievement (4+ average rating)
    await this.expectAchievementLocked('quality-seeker')
  }

  async testConsistencyAchievements() {
    await this.navigateToAchievements()
    await this.filterByCategory('consistency')

    // Test daily ritual achievement (7-day streak)
    await this.expectAchievementLocked('daily-ritual')
    
    // Test dedication achievement (30-day streak)
    await this.expectAchievementLocked('dedication')
  }

  async testSpecialAchievements() {
    await this.navigateToAchievements()
    await this.filterByCategory('special')

    // Test lab scientist achievement (10x lab mode)
    await this.expectAchievementLocked('lab-scientist')
    
    // Test home barista achievement (20x homecafe mode)
    await this.expectAchievementLocked('home-barista')
  }

  // Progress tracking methods
  async testProgressTracking() {
    await this.navigateToAchievements()

    // Test that progress is accurately displayed
    const achievementCards = await this.achievementCards.all()
    
    for (const card of achievementCards) {
      const isLocked = await card.locator('.locked').isVisible()
      
      if (isLocked) {
        // Verify progress bar is shown for locked achievements
        await expect(card.locator('[data-testid="progress-bar"]')).toBeVisible()
        await expect(card.locator('[data-testid="progress-text"]')).toBeVisible()
      } else {
        // Verify completion indicator for unlocked achievements
        await expect(card.locator('[data-testid="achievement-complete"]')).toBeVisible()
      }
    }
  }

  // Level system testing
  async testLevelProgression() {
    await this.navigateToStats()

    // Check initial level (should be 1 for new user)
    await this.expectUserLevel(1)
    await this.expectUserPoints(0)

    // Test level progression logic
    // This would require creating enough records/achievements to level up
    // For now, we'll test the display elements exist
    await this.expectElementVisible('[data-testid="level-progress"]')
    await this.expectElementVisible('[data-testid="next-level-info"]')
  }

  // Visual regression testing
  async testAchievementBadgeDisplay() {
    await this.navigateToAchievements()

    // Test that achievement badges are properly displayed
    const unlockedAchievements = await this.unlockedAchievements.all()
    
    for (const achievement of unlockedAchievements) {
      // Each unlocked achievement should have visible icon
      await expect(achievement.locator('[data-testid="achievement-icon"]')).toBeVisible()
      
      // Should have proper styling
      await expect(achievement).toHaveAttribute('class', /.*achievement-unlocked.*/)
    }
  }

  // Mobile-specific testing
  async testMobileAchievementView() {
    await this.setMobileViewport()
    await this.navigateToAchievements()

    // Test mobile-friendly achievement grid
    await this.expectElementVisible('[data-testid="achievement-grid"]')
    
    // Test mobile category filter
    await this.categoryFilter.click()
    await this.expectElementVisible('[data-testid="mobile-category-menu"]')
  }

  // Performance testing
  async testAchievementLoadTime() {
    const startTime = Date.now()
    await this.navigateToAchievements()
    const endTime = Date.now()

    const loadTime = endTime - startTime
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  }

  // Edge case testing
  async testEmptyAchievementState() {
    // Test display when user has no achievements (fresh account)
    await this.navigateToAchievements()
    
    // Should show all achievements as locked
    const lockedCount = await this.lockedAchievements.count()
    expect(lockedCount).toBeGreaterThan(0)
    
    // Should show 0 progress on user stats
    await this.expectUserPoints(0)
    await this.expectUserLevel(1)
  }

  async testMaxLevelUser() {
    // Test display for max level user (would require test data setup)
    // This tests that the UI handles max level correctly
    await this.navigateToStats()
    
    // Max level users should see "MAX" instead of progress bar
    const isMaxLevel = await this.page.locator('text=MAX').isVisible()
    if (isMaxLevel) {
      await this.expectElementHidden('[data-testid="level-progress"]')
      await this.expectElementVisible('text=최고 레벨 달성!')
    }
  }

  // Accessibility testing
  async testAchievementAccessibility() {
    await this.navigateToAchievements()

    // Test keyboard navigation
    await this.page.keyboard.press('Tab')
    await this.expectFocused('[data-testid="achievement-card"]')

    // Test screen reader support
    await this.expectAriaLabel('[data-testid="achievement-card"]', '성취')
    
    // Test high contrast mode
    const firstAchievement = this.achievementCards.first()
    await expect(firstAchievement).toHaveCSS('border', /solid/)
  }
}