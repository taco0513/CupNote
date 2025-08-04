/**
 * SwipeableItem - 스와이프 제스처 지원 컴포넌트
 * 모바일에서 좌우 스와이프로 액션 메뉴 표시
 */
'use client'

import { useState, useRef, useEffect, ReactNode, TouchEvent, MouseEvent } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'

// 스와이프 액션 인터페이스
export interface SwipeAction {
  id: string
  label: string
  icon: ReactNode
  color: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  onClick: () => void
}

// SwipeableItem Props
export interface SwipeableItemProps {
  children: ReactNode
  className?: string
  
  // 스와이프 액션 설정
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  
  // 스와이프 동작 설정
  threshold?: number        // 스와이프 활성화 임계값 (px)
  maxSwipeDistance?: number // 최대 스와이프 거리 (px)
  animationDuration?: number // 애니메이션 지속시간 (ms)
  
  // 이벤트 핸들러
  onSwipeStart?: (direction: 'left' | 'right') => void
  onSwipeEnd?: (direction: 'left' | 'right', distance: number) => void
  onActionTrigger?: (action: SwipeAction) => void
  
  // 접근성
  'aria-label'?: string
  
  // 비활성화
  disabled?: boolean
}

// 액션 색상 매핑
const actionColorClasses = {
  primary: 'bg-coffee-500 text-white hover:bg-coffee-600',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-amber-500 text-white hover:bg-amber-600',
  error: 'bg-red-500 text-white hover:bg-red-600'
}

// 터치/마우스 이벤트 통합
interface PointerEvent {
  clientX: number
  clientY: number
}

function getPointerEvent(e: TouchEvent | MouseEvent): PointerEvent {
  if ('touches' in e) {
    return {
      clientX: e.touches[0]?.clientX || 0,
      clientY: e.touches[0]?.clientY || 0
    }
  }
  return {
    clientX: e.clientX,
    clientY: e.clientY
  }
}

export default function SwipeableItem({
  children,
  className = '',
  leftActions = [],
  rightActions = [],
  threshold = 80,
  maxSwipeDistance = 120,
  animationDuration = 200,
  onSwipeStart,
  onSwipeEnd,
  onActionTrigger,
  'aria-label': ariaLabel,
  disabled = false
}: SwipeableItemProps) {
  
  // 반응형 컨텍스트
  const { isMobile, isTouchDevice } = useResponsive()
  
  // 상태 관리
  const [isDragging, setIsDragging] = useState(false)
  const [currentX, setCurrentX] = useState(0)
  const [startX, setStartX] = useState(0)
  const [startY, setStartY] = useState(0)
  const [isActionVisible, setIsActionVisible] = useState(false)
  const [activeDirection, setActiveDirection] = useState<'left' | 'right' | null>(null)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const animationTimeoutRef = useRef<NodeJS.Timeout>()
  
  // 스와이프 기능 활성화 조건
  const isSwipeEnabled = !disabled && (isMobile || isTouchDevice) && (leftActions.length > 0 || rightActions.length > 0)
  
  // 터치/마우스 시작
  const handlePointerStart = (e: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
    if (!isSwipeEnabled) return
    
    const pointer = getPointerEvent(e)
    setStartX(pointer.clientX)
    setStartY(pointer.clientY)
    setIsDragging(true)
    
    // 이벤트 전파 방지 (스크롤 간섭 방지)
    e.preventDefault()
  }
  
  // 터치/마우스 이동
  const handlePointerMove = (e: TouchEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !isSwipeEnabled) return
    
    const pointer = getPointerEvent(e)
    const deltaX = pointer.clientX - startX
    const deltaY = pointer.clientY - startY
    
    // 세로 스크롤 감지 (스와이프 취소)
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 10) {
      handlePointerEnd()
      return
    }
    
    // 스와이프 방향 결정
    const direction = deltaX > 0 ? 'right' : 'left'
    const availableActions = direction === 'right' ? leftActions : rightActions
    
    if (availableActions.length === 0) return
    
    // 스와이프 거리 제한
    const limitedDeltaX = Math.max(-maxSwipeDistance, Math.min(maxSwipeDistance, deltaX))
    setCurrentX(limitedDeltaX)
    
    // 액션 활성화 체크
    if (Math.abs(limitedDeltaX) > threshold) {
      if (!isActionVisible) {
        setIsActionVisible(true)
        setActiveDirection(direction)
        onSwipeStart?.(direction)
      }
    } else {
      if (isActionVisible) {
        setIsActionVisible(false)
        setActiveDirection(null)
      }
    }
    
    // 컨텐츠 이동
    if (contentRef.current) {
      contentRef.current.style.transform = `translateX(${limitedDeltaX}px)`
      contentRef.current.style.transition = 'none'
    }
  }
  
  // 터치/마우스 종료
  const handlePointerEnd = () => {
    if (!isDragging || !isSwipeEnabled) return
    
    setIsDragging(false)
    
    const direction = currentX > 0 ? 'right' : 'left'
    const distance = Math.abs(currentX)
    
    // 애니메이션과 함께 원위치로 복귀
    if (contentRef.current) {
      contentRef.current.style.transition = `transform ${animationDuration}ms var(--ease-out)`
      contentRef.current.style.transform = 'translateX(0px)'
    }
    
    // 상태 초기화
    const wasActionVisible = isActionVisible
    
    // 지연된 상태 초기화 (애니메이션 완료 후)
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current)
    }
    
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentX(0)
      setIsActionVisible(false)
      setActiveDirection(null)
      
      if (contentRef.current) {
        contentRef.current.style.transition = ''
      }
    }, animationDuration)
    
    // 이벤트 발생
    if (wasActionVisible) {
      onSwipeEnd?.(direction, distance)
    }
  }
  
  // 액션 버튼 클릭
  const handleActionClick = (action: SwipeAction) => {
    action.onClick()
    onActionTrigger?.(action)
    
    // 스와이프 상태 초기화
    setIsActionVisible(false)
    setActiveDirection(null)
    setCurrentX(0)
    
    if (contentRef.current) {
      contentRef.current.style.transform = 'translateX(0px)'
    }
  }
  
  // 키보드 이벤트 핸들러
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSwipeEnabled) return
    
    // 화살표 키로 액션 활성화
    if (e.key === 'ArrowLeft' && rightActions.length > 0) {
      e.preventDefault()
      setIsActionVisible(true)
      setActiveDirection('left')
    } else if (e.key === 'ArrowRight' && leftActions.length > 0) {
      e.preventDefault()
      setIsActionVisible(true)
      setActiveDirection('right')
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setIsActionVisible(false)
      setActiveDirection(null)
    }
  }
  
  // 컴포넌트 언마운트 시 클린업
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current)
      }
    }
  }, [])
  
  // 액션 렌더링
  const renderActions = (actions: SwipeAction[], side: 'left' | 'right') => {
    if (!isActionVisible || activeDirection !== side) return null
    
    return (
      <div 
        className={`absolute top-0 ${side === 'left' ? 'left-0' : 'right-0'} h-full flex items-center z-10 transition-opacity duration-200 ${
          isActionVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          width: `${Math.min(maxSwipeDistance, Math.abs(currentX))}px`
        }}
      >
        <div className="flex h-full">
          {actions.map((action, index) => (
            <button
              key={action.id}
              onClick={() => handleActionClick(action)}
              className={`
                flex items-center justify-center px-4 h-full min-w-[60px] transition-all duration-150
                ${actionColorClasses[action.color]}
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-white focus:ring-inset
              `}
              aria-label={action.label}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="flex flex-col items-center space-y-1">
                <div className="text-lg">{action.icon}</div>
                <span className="text-xs font-medium">{action.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  // 기본 렌더링 (스와이프 비활성화 시)
  if (!isSwipeEnabled) {
    return (
      <div className={className} aria-label={ariaLabel}>
        {children}
      </div>
    )
  }
  
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      aria-label={ariaLabel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* 왼쪽 액션들 */}
      {renderActions(leftActions, 'left')}
      
      {/* 오른쪽 액션들 */}
      {renderActions(rightActions, 'right')}
      
      {/* 메인 컨텐츠 */}
      <div
        ref={contentRef}
        className={`relative z-20 ${isDragging ? 'select-none' : ''}`}
        onTouchStart={handlePointerStart}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerEnd}
        onMouseDown={handlePointerStart}
        onMouseMove={isDragging ? handlePointerMove : undefined}
        onMouseUp={handlePointerEnd}
        onMouseLeave={handlePointerEnd}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab'
        }}
      >
        {children}
      </div>
      
      {/* 스크린 리더용 액션 안내 */}
      {isSwipeEnabled && (leftActions.length > 0 || rightActions.length > 0) && (
        <div className="sr-only">
          스와이프하여 추가 액션 사용 가능:
          {leftActions.map(action => action.label).join(', ')}
          {rightActions.map(action => action.label).join(', ')}
          키보드 사용자: 화살표 키로 액션 활성화
        </div>
      )}
    </div>
  )
}