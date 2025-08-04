/**
 * Accessibility Hook
 * Provides utilities for improving accessibility across the app
 */
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'

interface A11yPreferences {
  prefersReducedMotion: boolean
  prefersHighContrast: boolean
  prefersDarkMode: boolean
  prefersReducedTransparency: boolean
  fontSize: 'small' | 'medium' | 'large' | 'extra-large'
}

export function useAccessibility() {
  const [preferences, setPreferences] = useState<A11yPreferences>({
    prefersReducedMotion: false,
    prefersHighContrast: false,
    prefersDarkMode: false,
    prefersReducedTransparency: false,
    fontSize: 'medium'
  })

  const announceRef = useRef<HTMLDivElement | null>(null)

  // Initialize accessibility preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check media queries for user preferences
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const highContrast = window.matchMedia('(prefers-contrast: high)')
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)')
    const reducedTransparency = window.matchMedia('(prefers-reduced-transparency: reduce)')

    const updatePreferences = () => {
      setPreferences({
        prefersReducedMotion: reducedMotion.matches,
        prefersHighContrast: highContrast.matches,
        prefersDarkMode: darkMode.matches,
        prefersReducedTransparency: reducedTransparency.matches,
        fontSize: (localStorage.getItem('fontSize') as A11yPreferences['fontSize']) || 'medium'
      })
    }

    // Initial check
    updatePreferences()

    // Add listeners
    reducedMotion.addEventListener('change', updatePreferences)
    highContrast.addEventListener('change', updatePreferences)
    darkMode.addEventListener('change', updatePreferences)
    reducedTransparency.addEventListener('change', updatePreferences)

    // Create screen reader announcement area
    if (!announceRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.id = 'a11y-announcer'
      document.body.appendChild(announcer)
      announceRef.current = announcer
    }

    return () => {
      reducedMotion.removeEventListener('change', updatePreferences)
      highContrast.removeEventListener('change', updatePreferences)
      darkMode.removeEventListener('change', updatePreferences)
      reducedTransparency.removeEventListener('change', updatePreferences)
    }
  }, [])

  // Announce message to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!announceRef.current) return

    // Clear previous message
    announceRef.current.textContent = ''
    announceRef.current.setAttribute('aria-live', priority)

    // Add new message after a brief delay to ensure it's announced
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = message
      }
    }, 100)

    // Clear message after a delay
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = ''
      }
    }, 5000)
  }, [])

  // Focus management
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector(selector) as HTMLElement
    if (element) {
      element.focus()
      return true
    }
    return false
  }, [])

  const trapFocus = useCallback((containerSelector: string) => {
    const container = document.querySelector(containerSelector) as HTMLElement
    if (!container) return () => {}

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) as NodeListOf<HTMLElement>

    const firstElement = focusableElements[0]
    const lastElement = focusableElements[focusableElements.length - 1]

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    container.addEventListener('keydown', handleKeyDown)

    // Focus first element
    firstElement?.focus()

    return () => {
      container.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Skip link functionality
  const addSkipLink = useCallback((targetSelector: string, text: string = '메인 콘텐츠로 건너뛰기') => {
    if (typeof window === 'undefined') return

    // Check if skip link already exists
    if (document.getElementById('skip-link')) return

    const skipLink = document.createElement('a')
    skipLink.id = 'skip-link'
    skipLink.href = `#${targetSelector.replace('#', '')}`
    skipLink.textContent = text
    skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-coffee-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg'
    
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector(targetSelector) as HTMLElement
      if (target) {
        target.focus()
        target.scrollIntoView({ behavior: 'smooth' })
      }
    })

    document.body.insertBefore(skipLink, document.body.firstChild)
  }, [])

  // Keyboard navigation helpers
  const handleArrowNavigation = useCallback((
    e: KeyboardEvent,
    items: NodeListOf<HTMLElement> | HTMLElement[],
    currentIndex: number,
    onIndexChange: (index: number) => void
  ) => {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
      return
    }

    e.preventDefault()
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
        break
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = items.length - 1
        break
    }

    onIndexChange(newIndex)
    const itemsArray = Array.from(items)
    itemsArray[newIndex]?.focus()
  }, [])

  // ARIA attributes helpers
  const getAriaProps = useCallback((
    role?: string,
    label?: string,
    labelledBy?: string,
    describedBy?: string,
    expanded?: boolean,
    selected?: boolean,
    checked?: boolean,
    disabled?: boolean
  ) => {
    const props: Record<string, any> = {}

    if (role) props.role = role
    if (label) props['aria-label'] = label
    if (labelledBy) props['aria-labelledby'] = labelledBy
    if (describedBy) props['aria-describedby'] = describedBy
    if (expanded !== undefined) props['aria-expanded'] = expanded
    if (selected !== undefined) props['aria-selected'] = selected
    if (checked !== undefined) props['aria-checked'] = checked
    if (disabled !== undefined) props['aria-disabled'] = disabled

    return props
  }, [])

  // Font size management
  const setFontSize = useCallback((size: A11yPreferences['fontSize']) => {
    localStorage.setItem('fontSize', size)
    setPreferences(prev => ({ ...prev, fontSize: size }))
    
    const root = document.documentElement
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    }
    
    root.style.fontSize = sizes[size]
    announce(`글꼴 크기가 ${size}으로 변경되었습니다.`)
  }, [announce])

  // Color contrast helpers
  const checkColorContrast = useCallback((foreground: string, background: string): number => {
    // Simplified contrast ratio calculation
    // In production, you'd want a more robust implementation
    const getLuminance = (color: string) => {
      // Convert hex to RGB and calculate luminance
      const hex = color.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16) / 255
      const g = parseInt(hex.substr(2, 2), 16) / 255
      const b = parseInt(hex.substr(4, 2), 16) / 255
      
      const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
      const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
      const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
      
      return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB
    }
    
    const l1 = getLuminance(foreground)
    const l2 = getLuminance(background)
    const lighter = Math.max(l1, l2)
    const darker = Math.min(l1, l2)
    
    return (lighter + 0.05) / (darker + 0.05)
  }, [])

  // Apply accessibility classes based on preferences
  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    // Apply reduced motion
    if (preferences.prefersReducedMotion) {
      root.classList.add('reduce-motion')
    } else {
      root.classList.remove('reduce-motion')
    }

    // Apply high contrast
    if (preferences.prefersHighContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }

    // Apply font size
    const sizes = {
      small: '14px',
      medium: '16px',
      large: '18px',
      'extra-large': '20px'
    }
    root.style.fontSize = sizes[preferences.fontSize]

  }, [preferences])

  return {
    preferences,
    announce,
    focusElement,
    trapFocus,
    addSkipLink,
    handleArrowNavigation,
    getAriaProps,
    setFontSize,
    checkColorContrast
  }
}

// Hook for managing focus indicators
export function useFocusVisible() {
  const [isKeyboardUser, setIsKeyboardUser] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboardUser(true)
      }
    }

    const handleMouseDown = () => {
      setIsKeyboardUser(false)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousedown', handleMouseDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousedown', handleMouseDown)
    }
  }, [])

  return { isKeyboardUser }
}

// Hook for live regions
export function useLiveRegion() {
  const regionRef = useRef<HTMLDivElement | null>(null)

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!regionRef.current) {
      // Create live region if it doesn't exist
      const region = document.createElement('div')
      region.setAttribute('aria-live', priority)
      region.setAttribute('aria-atomic', 'true')
      region.className = 'sr-only'
      document.body.appendChild(region)
      regionRef.current = region
    }

    regionRef.current.setAttribute('aria-live', priority)
    regionRef.current.textContent = message

    // Clear after delay
    setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = ''
      }
    }, 5000)
  }, [])

  return { announce }
}