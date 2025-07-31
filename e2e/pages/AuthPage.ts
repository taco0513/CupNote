import { Page, Locator } from '@playwright/test'
import { BasePage } from './BasePage'

/**
 * Page Object for Authentication Modal and related functionality
 */
export class AuthPage extends BasePage {
  // Locators
  private readonly loginButton: Locator
  private readonly signupButton: Locator
  private readonly authModal: Locator
  private readonly modalCloseButton: Locator
  private readonly emailInput: Locator
  private readonly passwordInput: Locator
  private readonly usernameInput: Locator
  private readonly confirmPasswordInput: Locator
  private readonly showPasswordButton: Locator
  private readonly showConfirmPasswordButton: Locator
  private readonly submitButton: Locator
  private readonly toggleModeButton: Locator
  private readonly errorMessage: Locator
  private readonly loadingSpinner: Locator

  constructor(page: Page) {
    super(page)
    this.loginButton = page.getByText('로그인')
    this.signupButton = page.getByText('지금 시작하기')
    this.authModal = page.locator('[role="dialog"], .fixed.inset-0')
    this.modalCloseButton = page.locator('button[aria-label="Close"], button:has(svg)')
    this.emailInput = page.locator('input[type="email"]')
    this.passwordInput = page.locator('input[type="password"]').first()
    this.usernameInput = page.locator('input[type="text"]')
    this.confirmPasswordInput = page.locator('input[type="password"]').last()
    this.showPasswordButton = page.locator('button:has-text("show"), button:has-text("hide")')
    this.showConfirmPasswordButton = page.locator('button:has-text("show"), button:has-text("hide")').last()
    this.submitButton = page.locator('button[type="submit"]')
    this.toggleModeButton = page.getByText('회원가입').or(page.getByText('로그인')).last()
    this.errorMessage = page.locator('.text-red-600, .bg-red-50')
    this.loadingSpinner = page.locator('.animate-spin')
  }

  // Navigation methods
  async openLoginModal() {
    await this.loginButton.click()
    await this.waitForModalOpen()
  }

  async openSignupModal() {
    await this.signupButton.click()
    await this.waitForModalOpen()
  }

  async waitForModalOpen() {
    await this.authModal.waitFor({ state: 'visible' })
  }

  async closeModal() {
    await this.modalCloseButton.first().click()
    await this.authModal.waitFor({ state: 'hidden' })
  }

  // Form interaction methods
  async fillEmail(email: string) {
    await this.emailInput.fill(email)
  }

  async fillPassword(password: string) {
    await this.passwordInput.fill(password)
  }

  async fillUsername(username: string) {
    await this.usernameInput.fill(username)
  }

  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password)
  }

  async togglePasswordVisibility() {
    await this.showPasswordButton.first().click()
  }

  async toggleConfirmPasswordVisibility() {
    await this.showConfirmPasswordButton.click()
  }

  async submitForm() {
    await this.submitButton.click()
  }

  async toggleAuthMode() {
    await this.toggleModeButton.click()
  }

  // Complete authentication flows
  async login(email: string, password: string) {
    await this.openLoginModal()
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submitForm()
    await this.waitForAuthSuccess()
  }

  async signup(email: string, password: string, username: string) {
    await this.openSignupModal()
    await this.fillUsername(username)
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.fillConfirmPassword(password)
    await this.submitForm()
    await this.waitForAuthSuccess()
  }

  async logout() {
    // Assuming logout is accessible from user profile or settings
    await this.page.getByText('설정').click()
    await this.page.getByText('로그아웃').click()
    await this.waitForLogout()
  }

  // Wait methods
  async waitForAuthSuccess() {
    // Wait for modal to close and page to refresh or redirect
    await Promise.race([
      this.authModal.waitFor({ state: 'hidden' }),
      this.page.waitForURL('**/', { timeout: 10000 }),
      this.page.waitForSelector('text=안녕하세요', { timeout: 10000 })
    ])
  }

  async waitForLogout() {
    await Promise.race([
      this.page.waitForSelector('text=로그인', { timeout: 5000 }),
      this.page.waitForSelector('text=지금 시작하기', { timeout: 5000 })
    ])
  }

  // Assertion helpers
  async expectModalVisible() {
    await this.expectElementVisible('.fixed.inset-0')
  }

  async expectModalHidden() {
    await this.expectElementHidden('.fixed.inset-0')
  }

  async expectLoginMode() {
    await this.expectText('h2', '로그인')
  }

  async expectSignupMode() {
    await this.expectText('h2', '회원가입')
  }

  async expectErrorMessage(message: string) {
    await this.expectText('.text-red-600', message)
  }

  async expectLoadingState() {
    await this.expectElementVisible('.animate-spin')
  }

  async expectAuthSuccess() {
    // Check for successful authentication indicators
    await Promise.race([
      this.expectText('text=안녕하세요', ''),
      this.expectElementVisible('[data-testid="user-profile"]'),
      this.expectElementVisible('text=새 기록 작성')
    ])
  }

  // Validation helpers
  async expectValidationError(fieldName: string) {
    const fieldErrors = {
      email: '이메일을 입력해주세요',
      password: '비밀번호를 입력해주세요',
      username: '사용자명을 입력해주세요',
      confirmPassword: '비밀번호가 일치하지 않습니다'
    }
    await this.expectErrorMessage(fieldErrors[fieldName as keyof typeof fieldErrors])
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    await this.openLoginModal()
    
    // Test tab navigation through form
    await this.emailInput.press('Tab')
    await this.expectFocused('input[type="password"]')
    
    await this.passwordInput.press('Tab')
    await this.expectFocused('button[type="submit"]')
    
    // Test escape key to close modal
    await this.page.keyboard.press('Escape')
    await this.expectModalHidden()
  }

  async testAriaLabels() {
    await this.openLoginModal()
    
    // Check for proper ARIA labels
    await this.expectAriaLabel('input[type="email"]', '이메일')
    await this.expectAriaLabel('input[type="password"]', '비밀번호')
    await this.expectAriaLabel('button[type="submit"]', '로그인')
  }
}