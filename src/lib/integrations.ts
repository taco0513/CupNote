// 통합 기능들을 위한 설정 및 헬퍼 함수들

// 튜토리얼 통합
export function initializeTutorials() {
  // 튜토리얼 자동 등록 및 초기화
  if (typeof window !== 'undefined') {
    const isFirstVisit = !localStorage.getItem('cupnote-visited')
    const hasCompletedOnboarding = localStorage.getItem('cupnote-onboarding-completed')
    
    if (isFirstVisit) {
      localStorage.setItem('cupnote-visited', 'true')
      // 첫 방문자 플래그 설정
      sessionStorage.setItem('show-onboarding-tutorial', 'true')
    }
    
    return {
      isFirstVisit,
      hasCompletedOnboarding: !!hasCompletedOnboarding,
      shouldShowOnboarding: !hasCompletedOnboarding
    }
  }
  
  return {
    isFirstVisit: false,
    hasCompletedOnboarding: true,
    shouldShowOnboarding: false
  }
}

// 접근성 기능 초기화
export function initializeAccessibility() {
  if (typeof window === 'undefined') return

  // 고대비 모드 감지
  const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches
  
  // 모션 감소 설정 감지
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  
  // 포커스 표시 개선
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-navigation')
    }
  })
  
  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation')
  })
  
  // 접근성 설정 저장
  const accessibilitySettings = {
    highContrast: prefersHighContrast,
    reducedMotion: prefersReducedMotion,
    keyboardNavigation: false
  }
  
  sessionStorage.setItem('accessibility-settings', JSON.stringify(accessibilitySettings))
  
  return accessibilitySettings
}

// 애니메이션 설정 관리
export function getAnimationSettings() {
  if (typeof window === 'undefined') {
    return { enabled: true, reducedMotion: false }
  }
  
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const userPreference = localStorage.getItem('cupnote-animations')
  
  const settings = {
    enabled: userPreference ? JSON.parse(userPreference) : !prefersReducedMotion,
    reducedMotion: prefersReducedMotion
  }
  
  // CSS 변수로 애니메이션 설정 전달
  document.documentElement.style.setProperty(
    '--animation-duration', 
    settings.enabled && !settings.reducedMotion ? '300ms' : '0ms'
  )
  
  return settings
}

// 토스트 알림과 접근성 통합
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  if (typeof window === 'undefined') return
  
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message
  
  document.body.appendChild(announcement)
  
  // 메시지 전달 후 제거
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

// 키보드 단축키 관리
export function initializeKeyboardShortcuts() {
  if (typeof window === 'undefined') return
  
  const shortcuts = new Map([
    ['cmd+k', () => {
      // 검색 모달 열기
      const searchButton = document.querySelector('[data-shortcut="search"]') as HTMLElement
      searchButton?.click()
    }],
    ['cmd+n', () => {
      // 새 기록 작성
      const newRecordButton = document.querySelector('[href="/mode-selection"]') as HTMLElement
      newRecordButton?.click()
    }],
    ['escape', () => {
      // 모달 닫기
      const closeButton = document.querySelector('[data-shortcut="close"]') as HTMLElement
      closeButton?.click()
    }],
    ['alt+h', () => {
      // 홈으로 이동
      const homeButton = document.querySelector('[href="/"]') as HTMLElement
      homeButton?.click()
    }],
    ['alt+s', () => {
      // 통계 페이지로 이동
      const statsButton = document.querySelector('[href="/stats"]') as HTMLElement
      statsButton?.click()
    }]
  ])
  
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase()
    const modifier = e.metaKey ? 'cmd+' : e.altKey ? 'alt+' : ''
    const shortcut = modifier + key
    
    const handler = shortcuts.get(shortcut)
    if (handler) {
      e.preventDefault()
      handler()
      
      // 스크린 리더에 알림
      announceToScreenReader(`단축키 ${shortcut} 실행됨`, 'assertive')
    }
  })
  
  return Array.from(shortcuts.keys())
}

// UI 테마 및 설정 통합
export function initializeUISettings() {
  if (typeof window === 'undefined') return
  
  const settings = {
    animations: getAnimationSettings(),
    accessibility: initializeAccessibility(),
    tutorials: initializeTutorials(),
    shortcuts: initializeKeyboardShortcuts()
  }
  
  // 설정을 전역 객체에 저장
  ;(window as any).cupnoteSettings = settings
  
  return settings
}

// 성능 모니터링 통합
export function initializePerformanceMonitoring() {
  if (typeof window === 'undefined') return
  
  // 핵심 웹 바이탈 측정
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime)
      }
      
      if (entry.entryType === 'first-input') {
        console.log('FID:', (entry as any).processingStart - entry.startTime)
      }
      
      if (entry.entryType === 'layout-shift') {
        console.log('CLS:', (entry as any).value)
      }
    })
  })
  
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] })
  
  // 사용자 상호작용 지연 측정
  document.addEventListener('click', (e) => {
    const startTime = performance.now()
    requestAnimationFrame(() => {
      const endTime = performance.now()
      const delay = endTime - startTime
      
      if (delay > 100) {
        console.warn('Slow interaction detected:', delay + 'ms', e.target)
      }
    })
  })
}

// 제스처 및 고급 기능 초기화
export function initializeAdvancedFeatures() {
  if (typeof window === 'undefined') return

  // 스마트 제스처 활성화
  const gestureElements = document.querySelectorAll('[data-gesture-enabled]')
  gestureElements.forEach(element => {
    // 기본 제스처 이벤트 활성화
    element.addEventListener('touchstart', () => {}, { passive: true })
  })

  // 성능 최적화 활성화
  const performanceObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries()
    entries.forEach((entry) => {
      if (entry.entryType === 'largest-contentful-paint' && entry.startTime > 4000) {
        console.warn('LCP performance issue detected:', entry.startTime)
        // 자동 최적화 트리거
        setTimeout(() => {
          initializePerformanceOptimizations()
        }, 1000)
      }
    })
  })

  try {
    performanceObserver.observe({ entryTypes: ['largest-contentful-paint'] })
  } catch (e) {
    console.warn('Performance observer not supported')
  }

  // 스마트 제안 시스템 초기화
  const inputElements = document.querySelectorAll('input[type="text"], textarea')
  inputElements.forEach(input => {
    input.setAttribute('data-smart-suggestions', 'enabled')
  })

  return {
    gesturesEnabled: true,
    performanceMonitoring: true,
    smartSuggestions: true
  }
}

// 성능 최적화 실행
export function initializePerformanceOptimizations() {
  if (typeof window === 'undefined') return

  // 이미지 지연 로딩
  const images = document.querySelectorAll('img:not([loading])')
  images.forEach(img => {
    img.setAttribute('loading', 'lazy')
  })

  // 스크롤 성능 최적화
  const scrollElements = document.querySelectorAll('[style*="overflow"]')
  scrollElements.forEach(el => {
    (el as HTMLElement).style.willChange = 'scroll-position'
  })

  // 리소스 힌트 추가
  const head = document.head
  if (!document.querySelector('link[rel="dns-prefetch"][href="//fonts.googleapis.com"]')) {
    const link = document.createElement('link')
    link.rel = 'dns-prefetch'
    link.href = '//fonts.googleapis.com'
    head.appendChild(link)
  }

  console.log('Performance optimizations applied')
}

// 전체 초기화 함수
export function initializeApp() {
  const settings = initializeUISettings()
  initializePerformanceMonitoring()
  
  // 고급 기능 초기화 (Phase 3)
  const advancedFeatures = initializeAdvancedFeatures()
  
  // 개발 모드에서만 콘솔 출력
  if (process.env.NODE_ENV === 'development') {
    console.log('CupNote initialized with settings:', settings)
    console.log('Advanced features:', advancedFeatures)
  }
  
  return { ...settings, ...advancedFeatures }
}