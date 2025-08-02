/**
 * Accessibility utilities and ARIA helpers
 */

// Skip to main content link
export function addSkipToMainLink() {
  if (typeof document === 'undefined') return

  const skipLink = document.createElement('a')
  skipLink.href = '#main-content'
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-white px-4 py-2 rounded-md z-50'
  skipLink.textContent = '본문으로 건너뛰기'
  
  document.body.insertBefore(skipLink, document.body.firstChild)
}

// Announce to screen readers
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof document === 'undefined') return

  const announcement = document.createElement('div')
  announcement.setAttribute('role', 'status')
  announcement.setAttribute('aria-live', priority)
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)
  
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
  )
  const firstFocusableElement = focusableElements[0] as HTMLElement
  const lastFocusableElement = focusableElements[focusableElements.length - 1] as HTMLElement

  element.addEventListener('keydown', (e) => {
    const isTabPressed = e.key === 'Tab'
    
    if (!isTabPressed) return

    if (e.shiftKey) {
      if (document.activeElement === firstFocusableElement) {
        lastFocusableElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastFocusableElement) {
        firstFocusableElement.focus()
        e.preventDefault()
      }
    }
  })

  firstFocusableElement?.focus()
}

// Keyboard navigation helpers
export function handleArrowNavigation(
  e: React.KeyboardEvent,
  currentIndex: number,
  totalItems: number,
  onNavigate: (index: number) => void
) {
  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault()
      onNavigate(currentIndex > 0 ? currentIndex - 1 : totalItems - 1)
      break
    case 'ArrowDown':
      e.preventDefault()
      onNavigate(currentIndex < totalItems - 1 ? currentIndex + 1 : 0)
      break
    case 'Home':
      e.preventDefault()
      onNavigate(0)
      break
    case 'End':
      e.preventDefault()
      onNavigate(totalItems - 1)
      break
  }
}

// ARIA labels for dynamic content
export function getAriaLabel(type: string, context: any): string {
  switch (type) {
    case 'coffee-rating':
      return `평점 ${context.rating}점 (5점 만점)`
    case 'coffee-mode':
      return `${context.mode} 모드로 기록됨`
    case 'loading':
      return '로딩 중입니다'
    case 'error':
      return `오류: ${context.message}`
    case 'success':
      return `성공: ${context.message}`
    case 'menu':
      return '메뉴 열기'
    case 'close':
      return '닫기'
    default:
      return ''
  }
}

// Color contrast checker
export function checkColorContrast(foreground: string, background: string): number {
  // Convert hex to RGB
  const getRGB = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  // Calculate relative luminance
  const getLuminance = (rgb: { r: number; g: number; b: number }) => {
    const { r, g, b } = rgb
    const sRGB = [r, g, b].map(val => {
      val = val / 255
      return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4)
    })
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2]
  }

  const fgRGB = getRGB(foreground)
  const bgRGB = getRGB(background)
  
  if (!fgRGB || !bgRGB) return 0

  const fgLuminance = getLuminance(fgRGB)
  const bgLuminance = getLuminance(bgRGB)

  const lighter = Math.max(fgLuminance, bgLuminance)
  const darker = Math.min(fgLuminance, bgLuminance)

  return (lighter + 0.05) / (darker + 0.05)
}

// Reduced motion preference
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// High contrast mode detection
export function prefersHighContrast(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-contrast: high)').matches
}

// Touch device detection
export function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0
}

// Accessible form validation messages
export function getValidationMessage(field: string, error: string): string {
  const fieldLabels: Record<string, string> = {
    email: '이메일',
    password: '비밀번호',
    username: '사용자명',
    coffeeName: '커피 이름',
    rating: '평점',
    origin: '원산지',
    roastery: '로스터리'
  }

  const errorMessages: Record<string, string> = {
    required: '필수 입력 항목입니다',
    email: '올바른 이메일 형식이 아닙니다',
    minLength: '최소 길이를 충족하지 못했습니다',
    maxLength: '최대 길이를 초과했습니다',
    pattern: '올바른 형식이 아닙니다'
  }

  const fieldLabel = fieldLabels[field] || field
  const errorMessage = errorMessages[error] || error

  return `${fieldLabel}: ${errorMessage}`
}