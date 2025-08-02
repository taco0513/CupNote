'use client'

import { useEffect, useRef, ReactNode } from 'react'

interface FocusManagerProps {
  children: ReactNode
  autoFocus?: boolean
  restoreFocus?: boolean
  trapFocus?: boolean
}

export function FocusManager({ 
  children, 
  autoFocus = false, 
  restoreFocus = false,
  trapFocus = false 
}: FocusManagerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const previouslyFocusedElement = useRef<HTMLElement | null>(null)

  useEffect(() => {
    // 이전에 포커스된 요소 저장
    if (restoreFocus) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement
    }

    // 자동 포커스
    if (autoFocus && containerRef.current) {
      const firstFocusable = getFocusableElements(containerRef.current)[0]
      if (firstFocusable) {
        setTimeout(() => firstFocusable.focus(), 0)
      }
    }

    // 포커스 트랩
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!trapFocus || e.key !== 'Tab' || !containerRef.current) return

      const focusableElements = getFocusableElements(containerRef.current)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      if (trapFocus) {
        document.removeEventListener('keydown', handleKeyDown)
      }
      
      // 포커스 복원
      if (restoreFocus && previouslyFocusedElement.current) {
        previouslyFocusedElement.current.focus()
      }
    }
  }, [autoFocus, restoreFocus, trapFocus])

  return (
    <div ref={containerRef}>
      {children}
    </div>
  )
}

// 포커스 가능한 요소들을 찾는 헬퍼 함수
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(', ')

  return Array.from(container.querySelectorAll(focusableSelector)) as HTMLElement[]
}

// 포커스 표시 개선을 위한 훅
export function useFocusVisible() {
  useEffect(() => {
    let hadKeyboardEvent = false

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.altKey || e.ctrlKey) return
      hadKeyboardEvent = true
    }

    const handlePointerDown = () => {
      hadKeyboardEvent = false
    }

    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (hadKeyboardEvent || target.matches(':focus-visible')) {
        target.classList.add('focus-visible')
      }
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      target.classList.remove('focus-visible')
    }

    document.addEventListener('keydown', handleKeyDown, true)
    document.addEventListener('mousedown', handlePointerDown, true)
    document.addEventListener('pointerdown', handlePointerDown, true)
    document.addEventListener('touchstart', handlePointerDown, true)
    document.addEventListener('focus', handleFocus, true)
    document.addEventListener('blur', handleBlur, true)

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
      document.removeEventListener('mousedown', handlePointerDown, true)
      document.removeEventListener('pointerdown', handlePointerDown, true)
      document.removeEventListener('touchstart', handlePointerDown, true)
      document.removeEventListener('focus', handleFocus, true)
      document.removeEventListener('blur', handleBlur, true)
    }
  }, [])
}