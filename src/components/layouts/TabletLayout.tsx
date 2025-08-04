/**
 * TabletLayout - 1.5-Column 태블릿 레이아웃 시스템
 * 768px-1024px 범위에서 좌측 네비게이션 + 우측 메인 컨텐츠 분할 뷰 제공
 */
'use client'

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'
import { createTouchOptimizedProps } from '../../utils/touch-optimization'

// 키보드 단축키 인터페이스
export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  action: () => void
  description: string
}

// TabletLayout Props
export interface TabletLayoutProps {
  // 컨텐츠 슬롯
  primarySlot: ReactNode      // 좌측 영역 (40%)
  secondarySlot: ReactNode    // 우측 영역 (60%)
  headerSlot?: ReactNode      // 상단 헤더 (선택적)
  
  // 레이아웃 설정
  splitRatio?: [number, number]     // [40, 60] 기본값
  orientation?: 'portrait' | 'landscape' | 'auto'
  
  // 인터랙션 설정
  resizable?: boolean               // 분할 비율 조절 가능
  collapsible?: boolean             // 좌측 영역 접기/펼치기
  
  // 키보드 네비게이션
  keyboardNavigation?: boolean      // 키보드 네비게이션 활성화
  shortcuts?: KeyboardShortcut[]    // 커스텀 단축키
  
  // 접근성
  'aria-label'?: string
  role?: string
  
  // 커스텀 스타일
  className?: string
  
  // 이벤트 핸들러
  onSplitRatioChange?: (ratio: [number, number]) => void
  onPanelToggle?: (collapsed: boolean) => void
  onOrientationChange?: (orientation: 'portrait' | 'landscape') => void
}

// 레이아웃 상태 인터페이스
interface TabletLayoutState {
  splitRatio: [number, number]
  isLeftCollapsed: boolean
  orientation: 'portrait' | 'landscape'
  isDragging: boolean
  dragStartX: number
  keyboardMode: boolean
}

// 기본 키보드 단축키
const defaultShortcuts: KeyboardShortcut[] = [
  {
    key: 'Tab',
    action: () => {}, // 기본 브라우저 동작 사용
    description: '다음 요소로 포커스 이동'
  },
  {
    key: 'ArrowLeft',
    action: () => {}, // 구현에서 정의
    description: '좌측 패널로 포커스 이동'
  },
  {
    key: 'ArrowRight',
    action: () => {}, // 구현에서 정의  
    description: '우측 패널로 포커스 이동'
  },
  {
    key: '\\',
    ctrlKey: true,
    action: () => {}, // 구현에서 정의
    description: '레이아웃 초기화'
  }
]

export default function TabletLayout({
  primarySlot,
  secondarySlot,
  headerSlot,
  splitRatio = [40, 60],
  orientation = 'auto',
  resizable = true,
  collapsible = true,
  keyboardNavigation = true,
  shortcuts = [],
  'aria-label': ariaLabel = '태블릿 분할 레이아웃',
  role = 'main',
  className = '',
  onSplitRatioChange,
  onPanelToggle,
  onOrientationChange
}: TabletLayoutProps) {
  
  // 반응형 컨텍스트
  const { deviceType, orientation: detectedOrientation, width, height } = useResponsive()
  
  // 상태 관리
  const [state, setState] = useState<TabletLayoutState>({
    splitRatio,
    isLeftCollapsed: false,
    orientation: orientation === 'auto' ? detectedOrientation as 'portrait' | 'landscape' : orientation,
    isDragging: false,
    dragStartX: 0,
    keyboardMode: false
  })
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const resizeHandleRef = useRef<HTMLDivElement>(null)
  
  // 태블릿 모드 체크 (768px-1024px)
  const isTabletMode = deviceType === 'tablet' && width >= 768 && width <= 1024
  
  // 화면 방향 업데이트
  useEffect(() => {
    if (orientation === 'auto') {
      const newOrientation = width > height ? 'landscape' : 'portrait'
      if (newOrientation !== state.orientation) {
        setState(prev => ({ ...prev, orientation: newOrientation }))
        onOrientationChange?.(newOrientation)
      }
    }
  }, [width, height, orientation, state.orientation, onOrientationChange])
  
  // 분할 비율 업데이트
  const updateSplitRatio = useCallback((newRatio: [number, number]) => {
    setState(prev => ({ ...prev, splitRatio: newRatio }))
    onSplitRatioChange?.(newRatio)
  }, [onSplitRatioChange])
  
  // 좌측 패널 토글
  const toggleLeftPanel = useCallback(() => {
    setState(prev => {
      const newCollapsed = !prev.isLeftCollapsed
      onPanelToggle?.(newCollapsed)
      return { ...prev, isLeftCollapsed: newCollapsed }
    })
  }, [onPanelToggle])
  
  // 레이아웃 초기화
  const resetLayout = useCallback(() => {
    updateSplitRatio(splitRatio)
    setState(prev => ({ ...prev, isLeftCollapsed: false }))
  }, [splitRatio, updateSplitRatio])
  
  // 리사이즈 핸들 드래그 시작
  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!resizable) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    setState(prev => ({
      ...prev,
      isDragging: true,
      dragStartX: clientX
    }))
    
    e.preventDefault()
  }
  
  // 리사이즈 핸들 드래그 중
  const handleResizeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!state.isDragging || !containerRef.current) return
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    
    // 새로운 분할 비율 계산
    const newLeftPercent = Math.min(80, Math.max(20, (clientX - containerRect.left) / containerWidth * 100))
    const newRightPercent = 100 - newLeftPercent
    
    updateSplitRatio([Math.round(newLeftPercent), Math.round(newRightPercent)])
  }, [state.isDragging, updateSplitRatio])
  
  // 리사이즈 핸들 드래그 종료
  const handleResizeEnd = useCallback(() => {
    setState(prev => ({ ...prev, isDragging: false }))
  }, [])
  
  // 마우스/터치 이벤트 리스너
  useEffect(() => {
    if (state.isDragging) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      document.addEventListener('touchmove', handleResizeMove)
      document.addEventListener('touchend', handleResizeEnd)
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
        document.removeEventListener('touchmove', handleResizeMove)
        document.removeEventListener('touchend', handleResizeEnd)
      }
    }
  }, [state.isDragging, handleResizeMove, handleResizeEnd])
  
  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavigation) return
    
    // 통합된 단축키 목록
    const allShortcuts = [
      ...defaultShortcuts.map(shortcut => ({
        ...shortcut,
        action: () => {
          switch (shortcut.key) {
            case 'ArrowLeft':
              leftPanelRef.current?.focus()
              break
            case 'ArrowRight':
              rightPanelRef.current?.focus()
              break
            case '\\':
              if (shortcut.ctrlKey) resetLayout()
              break
          }
        }
      })),
      ...shortcuts
    ]
    
    // 단축키 매칭
    const matchedShortcut = allShortcuts.find(shortcut => 
      shortcut.key === e.key &&
      !!shortcut.ctrlKey === e.ctrlKey &&
      !!shortcut.shiftKey === e.shiftKey &&
      !!shortcut.altKey === e.altKey
    )
    
    if (matchedShortcut) {
      e.preventDefault()
      matchedShortcut.action()
      setState(prev => ({ ...prev, keyboardMode: true }))
    }
  }, [keyboardNavigation, shortcuts, resetLayout])
  
  // 키보드 모드 감지
  const handleMouseDown = useCallback(() => {
    setState(prev => ({ ...prev, keyboardMode: false }))
  }, [])
  
  // 태블릿 모드가 아닐 때는 children 그대로 반환
  if (!isTabletMode) {
    return (
      <div className={className}>
        {headerSlot}
        {primarySlot}
        {secondarySlot}
      </div>
    )
  }
  
  // 스타일 계산
  const leftWidth = state.isLeftCollapsed ? '0%' : `${state.splitRatio[0]}%`
  const rightWidth = state.isLeftCollapsed ? '100%' : `${state.splitRatio[1]}%`
  
  return (
    <div
      ref={containerRef}
      className={`
        flex flex-col h-screen bg-coffee-50 
        ${className}
        ${state.keyboardMode ? 'keyboard-navigation' : ''}
      `}
      role={role}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      onMouseDown={handleMouseDown}
      tabIndex={-1}
    >
      {/* 헤더 (선택적) */}
      {headerSlot && (
        <header className="flex-shrink-0 bg-white border-b border-coffee-200 shadow-sm z-10">
          {headerSlot}
        </header>
      )}
      
      {/* 메인 컨텐츠 영역 */}
      <main className="flex flex-1 overflow-hidden">
        {/* 좌측 패널 (Primary) */}
        <aside
          ref={leftPanelRef}
          className={`
            bg-white border-r border-coffee-200 shadow-sm
            transition-all duration-300 ease-in-out
            flex flex-col overflow-hidden relative
            ${state.isLeftCollapsed ? 'w-0 min-w-0' : 'min-w-[280px] max-w-[480px]'}
          `}
          style={{ width: leftWidth }}
          aria-hidden={state.isLeftCollapsed}
          tabIndex={state.isLeftCollapsed ? -1 : 0}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {primarySlot}
          </div>
          
          {/* 패널 토글 버튼 */}
          {collapsible && (
            <button
              {...createTouchOptimizedProps('md')}
              className={`
                absolute top-4 -right-3 z-20
                w-6 h-8 bg-coffee-500 text-white rounded-r-md
                hover:bg-coffee-600 active:scale-95 transition-all
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-coffee-300
                ${createTouchOptimizedProps('md').className}
              `}
              onClick={toggleLeftPanel}
              aria-label={state.isLeftCollapsed ? '좌측 패널 열기' : '좌측 패널 닫기'}
            >
              <svg 
                className={`w-3 h-3 transition-transform duration-200 ${state.isLeftCollapsed ? 'rotate-180' : ''}`}
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </aside>
        
        {/* 리사이즈 핸들 */}
        {resizable && !state.isLeftCollapsed && (
          <div
            ref={resizeHandleRef}
            className={`
              w-1 bg-coffee-200 hover:bg-coffee-400 cursor-col-resize
              transition-colors duration-150 relative group
              ${state.isDragging ? 'bg-coffee-500' : ''}
            `}
            onMouseDown={handleResizeStart}
            onTouchStart={handleResizeStart}
            role="separator"
            aria-label="패널 크기 조절"
            aria-valuenow={state.splitRatio[0]}
            aria-valuemin={20}
            aria-valuemax={80}
          >
            {/* 리사이즈 핸들 표시 */}
            <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-1 h-8 bg-coffee-400 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* 우측 패널 (Secondary) */}
        <section
          ref={rightPanelRef}
          className="flex-1 bg-coffee-25 overflow-hidden flex flex-col"
          style={{ width: rightWidth }}
          tabIndex={0}
        >
          <div className="flex-1 overflow-y-auto p-4">
            {secondarySlot}
          </div>
        </section>
      </main>
      
      {/* 키보드 네비게이션 안내 (스크린 리더용) */}
      {keyboardNavigation && (
        <div className="sr-only">
          태블릿 분할 레이아웃: 화살표 키로 패널 간 이동, Ctrl+\로 레이아웃 초기화
          {shortcuts.length > 0 && (
            <div>
              추가 단축키: {shortcuts.map(s => s.description).join(', ')}
            </div>
          )}
        </div>
      )}
    </div>
  )
}