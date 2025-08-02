'use client'

import { useRef, useEffect } from 'react'

interface GestureOptions {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeUp?: () => void
  onSwipeDown?: () => void
  onPinch?: (scale: number) => void
  onLongPress?: () => void
  threshold?: number
  longPressDelay?: number
}

interface TouchPoint {
  x: number
  y: number
  time: number
}

export function useGestures(options: GestureOptions) {
  const elementRef = useRef<HTMLElement>(null)
  const touchStart = useRef<TouchPoint | null>(null)
  const touchCurrent = useRef<TouchPoint | null>(null)
  const initialDistance = useRef<number>(0)
  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    onLongPress,
    threshold = 50,
    longPressDelay = 500
  } = options

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    // 터치 시작
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0]
      touchStart.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
      
      // 멀티터치 (핀치) 감지
      if (e.touches.length === 2) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        initialDistance.current = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
      }
      
      // 롱프레스 타이머 설정
      if (onLongPress) {
        longPressTimer.current = setTimeout(() => {
          onLongPress()
        }, longPressDelay)
      }
    }

    // 터치 이동
    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return

      const touch = e.touches[0]
      touchCurrent.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now()
      }
      
      // 멀티터치 (핀치) 처리
      if (e.touches.length === 2 && onPinch) {
        const touch1 = e.touches[0]
        const touch2 = e.touches[1]
        const currentDistance = Math.sqrt(
          Math.pow(touch2.clientX - touch1.clientX, 2) +
          Math.pow(touch2.clientY - touch1.clientY, 2)
        )
        
        if (initialDistance.current > 0) {
          const scale = currentDistance / initialDistance.current
          onPinch(scale)
        }
      }
      
      // 움직임이 있으면 롱프레스 취소
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    // 터치 종료
    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current || !touchCurrent.current) {
        // 롱프레스 타이머 정리
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        return
      }

      const deltaX = touchCurrent.current.x - touchStart.current.x
      const deltaY = touchCurrent.current.y - touchStart.current.y
      const absDeltaX = Math.abs(deltaX)
      const absDeltaY = Math.abs(deltaY)

      // 스와이프 감지
      if (absDeltaX > threshold || absDeltaY > threshold) {
        if (absDeltaX > absDeltaY) {
          // 수평 스와이프
          if (deltaX > 0 && onSwipeRight) {
            onSwipeRight()
          } else if (deltaX < 0 && onSwipeLeft) {
            onSwipeLeft()
          }
        } else {
          // 수직 스와이프
          if (deltaY > 0 && onSwipeDown) {
            onSwipeDown()
          } else if (deltaY < 0 && onSwipeUp) {
            onSwipeUp()
          }
        }
      }

      // 상태 초기화
      touchStart.current = null
      touchCurrent.current = null
      initialDistance.current = 0
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
        longPressTimer.current = null
      }
    }

    // 이벤트 리스너 등록
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      
      if (longPressTimer.current) {
        clearTimeout(longPressTimer.current)
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onPinch, onLongPress, threshold, longPressDelay])

  return elementRef
}

// 키보드 단축키 훅
interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  callback: () => void
  description?: string
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(shortcut => {
        return (
          shortcut.key.toLowerCase() === e.key.toLowerCase() &&
          (shortcut.ctrlKey || false) === e.ctrlKey &&
          (shortcut.altKey || false) === e.altKey &&
          (shortcut.metaKey || false) === e.metaKey &&
          (shortcut.shiftKey || false) === e.shiftKey
        )
      })

      if (matchingShortcut) {
        e.preventDefault()
        matchingShortcut.callback()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])

  return shortcuts
}

// 스마트 제스처 조합 훅
export function useSmartGestures() {
  const gestureRef = useGestures({
    onSwipeLeft: () => {
      // 뒤로 가기 또는 이전 페이지
      if (window.history.length > 1) {
        window.history.back()
      }
    },
    onSwipeRight: () => {
      // 앞으로 가기 (가능한 경우)
      window.history.forward()
    },
    onSwipeUp: () => {
      // 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    onSwipeDown: () => {
      // 새로고침 (상단에서만)
      if (window.scrollY < 100) {
        window.location.reload()
      }
    },
    onPinch: (scale) => {
      // 줌 인/아웃 (접근성)
      const currentFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const newFontSize = Math.max(12, Math.min(24, currentFontSize * scale))
      document.documentElement.style.fontSize = `${newFontSize}px`
    },
    onLongPress: () => {
      // 컨텍스트 메뉴 또는 도움말
      console.log('Long press detected - showing help')
    }
  })

  const keyboardShortcuts = useKeyboardShortcuts([
    {
      key: 'k',
      metaKey: true,
      callback: () => {
        // 검색 모달 열기
        const searchButton = document.querySelector('[data-search-trigger]') as HTMLElement
        searchButton?.click()
      },
      description: '검색 열기'
    },
    {
      key: 'n',
      metaKey: true,
      callback: () => {
        // 새 기록 작성
        const newRecordButton = document.querySelector('[href="/mode-selection"]') as HTMLElement
        newRecordButton?.click()
      },
      description: '새 기록 작성'
    },
    {
      key: 'h',
      altKey: true,
      callback: () => {
        // 홈으로 이동
        window.location.href = '/'
      },
      description: '홈으로 이동'
    },
    {
      key: 's',
      altKey: true,
      callback: () => {
        // 통계 페이지로 이동
        window.location.href = '/stats'
      },
      description: '통계 페이지'
    },
    {
      key: '?',
      callback: () => {
        // 키보드 단축키 도움말
        console.log('Keyboard shortcuts help')
      },
      description: '도움말 보기'
    }
  ])

  return { gestureRef, keyboardShortcuts }
}