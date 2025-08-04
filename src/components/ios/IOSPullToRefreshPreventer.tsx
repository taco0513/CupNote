'use client'

import { useEffect } from 'react'

/**
 * iOS WKWebView에서 pull-to-refresh와 네비게이션 드래그를 방지하는 컴포넌트
 * 강화된 iOS 터치 이벤트 처리로 헤더/하단 네비게이션 드래그 문제를 해결합니다.
 */
export default function IOSPullToRefreshPreventer() {
  useEffect(() => {
    // iOS 환경 감지 (Safari + WKWebView)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const isWKWebView = window.navigator.userAgent.includes('Mobile/') && !window.navigator.userAgent.includes('Safari/')
    
    if (!isIOS) return

    let touchStartY = 0
    let touchMoveY = 0
    let touchStartX = 0
    let touchMoveX = 0
    let isScrolling = false

    const preventNavDrag = (e: TouchEvent) => {
      const target = e.target as HTMLElement
      const scrollY = window.scrollY || window.pageYOffset
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      
      // 헤더와 하단 네비게이션 영역 감지 - 더 정확한 감지
      const isHeaderTouch = target.closest('header') || target.closest('[data-header="true"]')
      const isBottomNavTouch = target.closest('nav[data-bottom-nav="true"]') || 
                              target.closest('nav.fixed.bottom-0') ||
                              target.closest('nav[class*="bottom"]')
      const isFixedElementTouch = isHeaderTouch || isBottomNavTouch
      
      if (e.type === 'touchstart') {
        touchStartY = e.touches[0].clientY
        touchStartX = e.touches[0].clientX
        isScrolling = false
      } else if (e.type === 'touchmove') {
        touchMoveY = e.touches[0].clientY
        touchMoveX = e.touches[0].clientX
        const touchDiffY = touchMoveY - touchStartY
        const touchDiffX = touchMoveX - touchStartX
        
        // 수직 스크롤인지 수평 스크롤인지 판단
        if (!isScrolling) {
          isScrolling = Math.abs(touchDiffY) > Math.abs(touchDiffX)
        }
        
        // 고정 요소를 터치한 경우 항상 차단 - 더 엄격한 차단
        if (isFixedElementTouch) {
          e.preventDefault()
          e.stopPropagation()
          e.stopImmediatePropagation()
          return false
        }
        
        // 페이지 최상단에서 아래로 드래그 시 차단 (pull-to-refresh 방지)
        if (scrollY <= 0 && touchDiffY > 0 && isScrolling) {
          e.preventDefault()
          return
        }
        
        // 페이지 최하단에서 위로 드래그 시 차단 (bounce 방지)
        if (scrollY + windowHeight >= documentHeight && touchDiffY < 0 && isScrolling) {
          e.preventDefault()
          return
        }
      }
    }

    const preventContextMenu = (e: Event) => {
      // 긴 터치 시 컨텍스트 메뉴 방지
      const target = e.target as HTMLElement
      const isFixedElementTouch = target.closest('header') || 
                                  target.closest('[data-header="true"]') ||
                                  target.closest('nav[data-bottom-nav="true"]') || 
                                  target.closest('nav.fixed.bottom-0') ||
                                  target.closest('nav[class*="bottom"]')
      
      if (isFixedElementTouch) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
      
      e.preventDefault()
    }

    // 이벤트 리스너 등록 - passive: false로 preventDefault 사용 가능
    document.addEventListener('touchstart', preventNavDrag, { passive: false })
    document.addEventListener('touchmove', preventNavDrag, { passive: false })
    document.addEventListener('contextmenu', preventContextMenu, { passive: false })

    // CSS 스타일로 추가 보안
    const style = document.createElement('style')
    style.textContent = `
      /* iOS WKWebView 최적화 */
      html, body {
        overscroll-behavior: none;
        -webkit-overflow-scrolling: touch;
        position: relative;
        overflow-x: hidden;
      }
      
      /* 고정 요소 강화 - 헤더와 네비게이션 */
      header[class*="fixed"], 
      nav[class*="fixed"], 
      [data-header="true"], 
      [data-bottom-nav="true"] {
        position: fixed !important;
        -webkit-transform: translate3d(0, 0, 0) !important;
        transform: translate3d(0, 0, 0) !important;
        -webkit-backface-visibility: hidden !important;
        backface-visibility: hidden !important;
        -webkit-perspective: 1000 !important;
        perspective: 1000 !important;
        will-change: transform !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
        touch-action: none !important;
        pointer-events: auto !important;
      }
      
      /* 고정 요소 내부 링크와 버튼도 드래그 방지 */
      header[class*="fixed"] *, 
      nav[class*="fixed"] *,
      [data-header="true"] *,
      [data-bottom-nav="true"] * {
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-user-drag: none !important;
        user-drag: none !important;
        touch-action: none !important;
      }
      
      /* WKWebView 특화 */
      @supports (-webkit-touch-callout: none) {
        * {
          -webkit-touch-callout: none;
          -webkit-tap-highlight-color: transparent;
        }
        
        header, nav {
          -webkit-user-drag: none;
          -webkit-user-select: none;
          user-select: none;
        }
      }
    `
    document.head.appendChild(style)

    // 전역 body 스타일 적용
    document.body.style.overscrollBehavior = 'none'
    document.body.style.webkitOverflowScrolling = 'touch'
    document.body.style.touchAction = 'pan-y'
    
    // WKWebView 특화 설정
    if (isWKWebView) {
      document.body.style.webkitUserSelect = 'none'
      document.body.style.webkitTouchCallout = 'none'
      document.body.style.webkitTapHighlightColor = 'transparent'
    }

    return () => {
      // 정리
      document.removeEventListener('touchstart', preventNavDrag)
      document.removeEventListener('touchmove', preventNavDrag)
      document.removeEventListener('contextmenu', preventContextMenu)
      document.head.removeChild(style)
      document.body.style.overscrollBehavior = ''
      document.body.style.webkitOverflowScrolling = ''
      document.body.style.touchAction = ''
      document.body.style.webkitUserSelect = ''
      document.body.style.webkitTouchCallout = ''
      document.body.style.webkitTapHighlightColor = ''
    }
  }, [])

  return null
}