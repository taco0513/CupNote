import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Coffee Recording Flow (4-step process)
 */
export class CoffeeRecordPage extends BasePage {
  // Navigation locators
  private readonly recordTab: Locator
  private readonly nextButton: Locator
  private readonly prevButton: Locator
  private readonly saveButton: Locator

  // Mode selection locators
  private readonly cafeMode: Locator
  private readonly homecafeMode: Locator
  private readonly labMode: Locator

  // Step 1: Coffee Info locators
  private readonly coffeeNameInput: Locator
  private readonly roasteryInput: Locator
  private readonly originInput: Locator
  private readonly roastLevelSelect: Locator
  private readonly brewMethodSelect: Locator
  private readonly priceInput: Locator
  private readonly imageUpload: Locator

  // Step 2: Roaster Notes locators
  private readonly roasterNoteTextarea: Locator
  private readonly flavorTagsContainer: Locator

  // Step 3: Personal Tasting locators
  private readonly tasteTextarea: Locator
  private readonly memoTextarea: Locator
  private readonly ratingStars: Locator
  private readonly matchScoreSlider: Locator

  // Step 4: Review locators
  private readonly reviewSummary: Locator
  private readonly editButtons: Locator

  // Result page locators
  private readonly matchScoreDisplay: Locator
  private readonly achievementNotification: Locator

  constructor(page: Page) {
    super(page)
    
    // Navigation
    this.recordTab = page.getByText('기록')
    this.nextButton = page.getByText('다음')
    this.prevButton = page.getByText('이전')
    this.saveButton = page.getByText('저장')

    // Mode selection
    this.cafeMode = page.getByText('카페')
    this.homecafeMode = page.getByText('홈카페')
    this.labMode = page.getByText('랩')

    // Step 1: Coffee Info
    this.coffeeNameInput = page.locator('input[name="coffeeName"]')
    this.roasteryInput = page.locator('input[name="roastery"]')
    this.originInput = page.locator('input[name="origin"]')
    this.roastLevelSelect = page.locator('select[name="roastLevel"]')
    this.brewMethodSelect = page.locator('select[name="brewMethod"]')
    this.priceInput = page.locator('input[name="price"]')
    this.imageUpload = page.locator('input[type="file"]')

    // Step 2: Roaster Notes
    this.roasterNoteTextarea = page.locator('textarea[name="roasterNote"]')
    this.flavorTagsContainer = page.locator('[data-testid="flavor-tags"]')

    // Step 3: Personal Tasting
    this.tasteTextarea = page.locator('textarea[name="taste"]')
    this.memoTextarea = page.locator('textarea[name="memo"]')
    this.ratingStars = page.locator('[data-testid="rating-star"]')
    this.matchScoreSlider = page.locator('input[type="range"]')

    // Step 4: Review
    this.reviewSummary = page.locator('[data-testid="review-summary"]')
    this.editButtons = page.locator('[data-testid="edit-step"]')

    // Result page
    this.matchScoreDisplay = page.locator('[data-testid="match-score"]')
    this.achievementNotification = page.locator('[data-testid="achievement-notification"]')
  }

  // Navigation methods
  async startRecording() {
    await this.recordTab.click()
    await this.waitForText('모드를 선택해주세요')
  }

  async selectMode(mode: 'cafe' | 'homecafe' | 'lab') {
    const modeButtons = {
      cafe: this.cafeMode,
      homecafe: this.homecafeMode,
      lab: this.labMode
    }
    
    await modeButtons[mode].click()
    await this.waitForText('커피 정보')
  }

  async goToNextStep() {
    await this.nextButton.click()
    await this.page.waitForTimeout(500) // Wait for transition
  }

  async goToPreviousStep() {
    await this.prevButton.click()
    await this.page.waitForTimeout(500) // Wait for transition
  }

  async saveRecord() {
    await this.saveButton.click()
    await this.waitForText('Match Score')
  }

  // Step 1: Coffee Info methods
  async fillCoffeeInfo(data: {
    name: string
    roastery: string
    origin: string
    roastLevel?: string
    brewMethod?: string
    price?: string
  }) {
    await this.coffeeNameInput.fill(data.name)
    await this.roasteryInput.fill(data.roastery)
    await this.originInput.fill(data.origin)
    
    if (data.roastLevel) {
      await this.roastLevelSelect.selectOption(data.roastLevel)
    }
    
    if (data.brewMethod) {
      await this.brewMethodSelect.selectOption(data.brewMethod)
    }
    
    if (data.price) {
      await this.priceInput.fill(data.price)
    }
  }

  async uploadImage(imagePath: string) {
    await this.imageUpload.setInputFiles(imagePath)
    await this.waitForElement('[data-testid="uploaded-image"]')
  }

  // Step 2: Roaster Notes methods
  async fillRoasterNotes(note: string) {
    await this.roasterNoteTextarea.fill(note)
  }

  async selectFlavorTags(tags: string[]) {
    for (const tag of tags) {
      await this.page.getByText(tag).click()
    }
  }

  // Step 3: Personal Tasting methods
  async fillPersonalTasting(data: {
    taste: string
    memo: string
    rating: number
    matchScore?: number
  }) {
    await this.tasteTextarea.fill(data.taste)
    await this.memoTextarea.fill(data.memo)
    
    // Set rating (click on star)
    await this.ratingStars.nth(data.rating - 1).click()
    
    if (data.matchScore) {
      await this.matchScoreSlider.fill(data.matchScore.toString())
    }
  }

  // Complete recording flow
  async completeFullRecord(data: {
    mode: 'cafe' | 'homecafe' | 'lab'
    coffeeInfo: {
      name: string
      roastery: string
      origin: string
      roastLevel?: string
      brewMethod?: string
      price?: string
    }
    roasterNote: string
    personalTasting: {
      taste: string
      memo: string
      rating: number
      matchScore?: number
    }
    imagePath?: string
  }) {
    // Start recording
    await this.startRecording()
    await this.selectMode(data.mode)

    // Step 1: Coffee Info
    await this.fillCoffeeInfo(data.coffeeInfo)
    if (data.imagePath) {
      await this.uploadImage(data.imagePath)
    }
    await this.goToNextStep()

    // Step 2: Roaster Notes
    await this.expectText('h2', '로스터 노트')
    await this.fillRoasterNotes(data.roasterNote)
    await this.goToNextStep()

    // Step 3: Personal Tasting
    await this.expectText('h2', '개인 테이스팅')
    await this.fillPersonalTasting(data.personalTasting)
    await this.goToNextStep()

    // Step 4: Review and Save
    await this.expectText('h2', '기록 검토')
    await this.saveRecord()

    // Verify result page
    await this.expectElementVisible('[data-testid="match-score"]')
  }

  // Validation methods
  async expectValidationErrors() {
    await this.goToNextStep()
    await this.expectElementVisible('.text-red-500')
  }

  async expectStepCompleted(stepNumber: number) {
    await this.expectElementVisible(`[data-testid="step-${stepNumber}-completed"]`)
  }

  // Data persistence testing
  async testDataPersistence() {
    // Fill some data
    await this.fillCoffeeInfo({
      name: 'Test Coffee',
      roastery: 'Test Roastery',
      origin: 'Ethiopia'
    })
    
    // Go to next step and back
    await this.goToNextStep()
    await this.goToPreviousStep()
    
    // Verify data is preserved
    await this.expectValue('input[name="coffeeName"]', 'Test Coffee')
    await this.expectValue('input[name="roastery"]', 'Test Roastery')
    await this.expectValue('input[name="origin"]', 'Ethiopia')
  }

  // Mobile-specific methods
  async testMobileFlow() {
    await this.setMobileViewport()
    
    // Test mobile navigation
    await this.startRecording()
    await this.selectMode('cafe')
    
    // Test mobile form interaction
    await this.fillCoffeeInfo({
      name: 'Mobile Test',
      roastery: 'Mobile Roastery',
      origin: 'Colombia'
    })
    
    // Test mobile button accessibility
    await this.expectElementVisible('button')
    await this.goToNextStep()
  }

  // Achievement testing methods
  async expectFirstRecordAchievement() {
    await this.expectElementVisible('[data-testid="achievement-notification"]')
    await this.expectText('[data-testid="achievement-title"]', '첫 기록')
  }

  async expectMatchScoreCalculation() {
    await this.expectElementVisible('[data-testid="match-score"]')
    
    // Verify match score is displayed as percentage
    const matchScore = await this.matchScoreDisplay.textContent()
    expect(matchScore).toMatch(/\d+%/)
  }

  // Different mode testing
  async testCafeMode() {
    await this.startRecording()
    await this.selectMode('cafe')
    
    // Cafe mode should show simplified form
    await this.expectElementVisible('input[name="coffeeName"]')
    await this.expectElementVisible('input[name="roastery"]')
    await this.expectElementHidden('input[name="grindSize"]') // Not available in cafe mode
  }

  async testHomecafeMode() {
    await this.startRecording()
    await this.selectMode('homecafe')
    
    // Homecafe mode should show additional brewing parameters
    await this.expectElementVisible('input[name="coffeeName"]')
    await this.expectElementVisible('input[name="brewTime"]')
    await this.expectElementVisible('input[name="waterTemp"]')
  }

  async testLabMode() {
    await this.startRecording()
    await this.selectMode('lab')
    
    // Lab mode should show all scientific parameters
    await this.expectElementVisible('input[name="coffeeName"]')
    await this.expectElementVisible('input[name="grindSize"]')
    await this.expectElementVisible('input[name="extractionTime"]')
    await this.expectElementVisible('input[name="tds"]')
  }

  // Error handling
  async testNetworkError() {
    // Simulate network failure during save
    await this.page.route('**/api/records', route => route.abort())
    
    await this.completeFullRecord({
      mode: 'cafe',
      coffeeInfo: {
        name: 'Network Test',
        roastery: 'Test Roastery',
        origin: 'Brazil'
      },
      roasterNote: 'Network test note',
      personalTasting: {
        taste: 'Network test taste',
        memo: 'Network test memo',
        rating: 4
      }
    })
    
    // Should show error message
    await this.expectElementVisible('[data-testid="error-message"]')
  }
}