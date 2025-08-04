/**
 * DesktopLayout - 3-Column 데스크탑 레이아웃 시스템
 * 1024px+ 범위에서 좌측 사이드바 + 메인 + 우측 패널 구성
 */
'use client'

import { useState, useRef, useEffect, ReactNode, useCallback } from 'react'
import { useResponsive } from '../../contexts/ResponsiveContext'
import { createTouchOptimizedProps } from '../../utils/touch-optimization'

// 레이아웃 모드 타입
export type LayoutMode = 'standard' | 'focus' | 'analysis' | 'minimal'

// 워크스페이스 설정
export interface WorkspaceConfig {
  id: string
  name: string
  description?: string
  layoutMode: LayoutMode
  columnRatios: [number, number, number]
  panels: {
    left: { collapsed: boolean, width?: number }
    right: { collapsed: boolean, width?: number }
  }
}

// 데스크탑 전용 단축키
export interface DesktopShortcut {
  key: string
  ctrlKey?: boolean
  shiftKey?: boolean
  altKey?: boolean
  metaKey?: boolean
  action: () => void
  description: string
  category: 'navigation' | 'workspace' | 'tools' | 'view'
  scope?: 'global' | 'panel' | 'workspace'
}

// DesktopLayout Props
export interface DesktopLayoutProps {
  // 컨텐츠 영역 슬롯
  leftSidebarSlot: ReactNode        // 좌측 사이드바 (20%)
  mainContentSlot: ReactNode        // 메인 콘텐츠 (60%)
  rightPanelSlot: ReactNode         // 우측 패널 (20%)
  headerSlot?: ReactNode            // 글로벌 헤더
  statusBarSlot?: ReactNode         // 하단 상태바
  
  // 레이아웃 설정
  layoutMode?: LayoutMode
  columnRatios?: [number, number, number]  // [20, 60, 20] 기본값
  
  // 패널 관리
  collapsiblePanels?: {
    left?: boolean
    right?: boolean
  }
  resizablePanels?: boolean
  
  // 워크스페이스 관리
  workspaceMode?: boolean
  activeWorkspace?: string
  workspaces?: WorkspaceConfig[]
  
  // 키보드 네비게이션
  keyboardNavigation?: boolean
  shortcuts?: DesktopShortcut[]
  commandPalette?: boolean
  
  // 접근성
  'aria-label'?: string
  role?: string
  className?: string
  
  // 이벤트 핸들러
  onLayoutModeChange?: (mode: LayoutMode) => void
  onColumnRatioChange?: (ratios: [number, number, number]) => void
  onWorkspaceChange?: (workspace: string) => void
  onPanelToggle?: (panel: 'left' | 'right', collapsed: boolean) => void
}

// 레이아웃 상태
interface DesktopLayoutState {
  layoutMode: LayoutMode
  columnRatios: [number, number, number]
  leftPanelCollapsed: boolean
  rightPanelCollapsed: boolean
  resizingPanel: 'left' | 'right' | null
  activeWorkspace: string
  focusedPanel: 'left' | 'main' | 'right'
  keyboardMode: boolean
  commandPaletteOpen: boolean
}

// 레이아웃 모드별 기본 비율
const layoutModeRatios: Record<LayoutMode, [number, number, number]> = {
  standard: [20, 60, 20],
  focus: [15, 70, 15],
  analysis: [25, 50, 25],
  minimal: [0, 80, 20]
}

// 기본 데스크탑 단축키
const defaultDesktopShortcuts: DesktopShortcut[] = [
  {
    key: 'l',
    ctrlKey: true,
    shiftKey: true,
    action: () => {},
    description: '좌측 사이드바 포커스',
    category: 'navigation'
  },
  {
    key: 'm',
    ctrlKey: true,
    shiftKey: true,
    action: () => {},
    description: '메인 콘텐츠 포커스',
    category: 'navigation'
  },
  {
    key: 'r',
    ctrlKey: true,
    shiftKey: true,
    action: () => {},
    description: '우측 패널 포커스',
    category: 'navigation'
  },
  {
    key: 'b',
    ctrlKey: true,
    action: () => {},
    description: '좌측 패널 토글',
    category: 'view'
  },
  {
    key: 'b',
    ctrlKey: true,
    shiftKey: true,
    action: () => {},
    description: '우측 패널 토글',
    category: 'view'
  }
]

export default function DesktopLayout({
  leftSidebarSlot,
  mainContentSlot,
  rightPanelSlot,
  headerSlot,
  statusBarSlot,
  layoutMode = 'standard',
  columnRatios,
  collapsiblePanels = { left: true, right: true },
  resizablePanels = true,
  workspaceMode = false,
  activeWorkspace = 'default',
  workspaces = [],
  keyboardNavigation = true,
  shortcuts = [],
  commandPalette = true,
  'aria-label': ariaLabel = '데스크탑 3-컬럼 레이아웃',
  role = 'main',
  className = '',
  onLayoutModeChange,
  onColumnRatioChange,
  onWorkspaceChange,
  onPanelToggle
}: DesktopLayoutProps) {
  
  // 반응형 컨텍스트
  const { deviceType, width, height } = useResponsive()
  
  // 초기 컬럼 비율 설정
  const initialRatios = columnRatios || layoutModeRatios[layoutMode]
  
  // 상태 관리
  const [state, setState] = useState<DesktopLayoutState>({
    layoutMode,
    columnRatios: initialRatios,
    leftPanelCollapsed: false,
    rightPanelCollapsed: false,
    resizingPanel: null,
    activeWorkspace,
    focusedPanel: 'main',
    keyboardMode: false,
    commandPaletteOpen: false
  })
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const mainContentRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  
  // 데스크탑 모드 체크 (1024px+)
  const isDesktopMode = deviceType === 'desktop' && width >= 1024
  
  // 레이아웃 모드 변경
  const changeLayoutMode = useCallback((mode: LayoutMode) => {
    const newRatios = layoutModeRatios[mode]
    setState(prev => ({
      ...prev,
      layoutMode: mode,
      columnRatios: newRatios,
      leftPanelCollapsed: mode === 'minimal',
      rightPanelCollapsed: false
    }))
    onLayoutModeChange?.(mode)
    onColumnRatioChange?.(newRatios)
  }, [onLayoutModeChange, onColumnRatioChange])
  
  // 패널 토글
  const togglePanel = useCallback((panel: 'left' | 'right') => {
    setState(prev => {
      const collapsed = panel === 'left' ? !prev.leftPanelCollapsed : !prev.rightPanelCollapsed
      const newState = {
        ...prev,
        [panel === 'left' ? 'leftPanelCollapsed' : 'rightPanelCollapsed']: collapsed
      }
      
      // 비율 재계산
      if (panel === 'left') {
        if (collapsed) {
          newState.columnRatios = [0, prev.columnRatios[1] + prev.columnRatios[0], prev.columnRatios[2]]
        } else {
          const originalRatios = layoutModeRatios[prev.layoutMode]
          newState.columnRatios = originalRatios
        }
      }
      
      onPanelToggle?.(panel, collapsed)
      return newState
    })
  }, [onPanelToggle])
  
  // 패널 포커스 이동
  const focusPanel = useCallback((panel: 'left' | 'main' | 'right') => {
    setState(prev => ({ ...prev, focusedPanel: panel }))
    
    const panelRef = panel === 'left' ? leftPanelRef : 
                    panel === 'main' ? mainContentRef : rightPanelRef
    panelRef.current?.focus()
  }, [])
  
  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!keyboardNavigation) return
    
    // 통합된 단축키 목록
    const allShortcuts = [
      ...defaultDesktopShortcuts.map(shortcut => ({
        ...shortcut,
        action: () => {
          switch (shortcut.key) {
            case 'l':
              if (shortcut.ctrlKey && shortcut.shiftKey) focusPanel('left')
              break
            case 'm':  
              if (shortcut.ctrlKey && shortcut.shiftKey) focusPanel('main')
              break
            case 'r':
              if (shortcut.ctrlKey && shortcut.shiftKey) focusPanel('right')
              break
            case 'b':
              if (shortcut.ctrlKey && !shortcut.shiftKey) togglePanel('left')
              else if (shortcut.ctrlKey && shortcut.shiftKey) togglePanel('right')
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
      !!shortcut.altKey === e.altKey &&
      !!shortcut.metaKey === e.metaKey
    )
    
    if (matchedShortcut) {
      e.preventDefault()
      matchedShortcut.action()
      setState(prev => ({ ...prev, keyboardMode: true }))
    }
  }, [keyboardNavigation, shortcuts, focusPanel, togglePanel])
  
  // 마우스 클릭 시 키보드 모드 해제
  const handleMouseDown = useCallback(() => {
    setState(prev => ({ ...prev, keyboardMode: false }))
  }, [])
  
  // 데스크탑 모드가 아닐 때는 fallback
  if (!isDesktopMode) {
    return (
      <div className={className}>
        {headerSlot}
        {leftSidebarSlot}
        {mainContentSlot}
        {rightPanelSlot}
        {statusBarSlot}
      </div>
    )
  }
  
  // 컬럼 너비 계산
  const leftWidth = state.leftPanelCollapsed ? '0%' : `${state.columnRatios[0]}%`
  const mainWidth = `${state.columnRatios[1]}%`
  const rightWidth = state.rightPanelCollapsed ? '0%' : `${state.columnRatios[2]}%`
  
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
      {/* 글로벌 헤더 */}
      {headerSlot && (
        <header className="flex-shrink-0 bg-white border-b border-coffee-200 shadow-sm z-30">
          {headerSlot}
        </header>
      )}
      
      {/* 메인 3-컬럼 레이아웃 */}
      <main className="flex flex-1 overflow-hidden relative">
        {/* 좌측 사이드바 */}
        <aside
          ref={leftPanelRef}
          className={`
            bg-white border-r border-coffee-200 shadow-sm
            transition-all duration-400 ease-in-out
            flex flex-col overflow-hidden relative
            ${state.leftPanelCollapsed ? 'w-0 min-w-0' : 'min-w-[240px] max-w-[400px]'}
            ${state.focusedPanel === 'left' ? 'ring-2 ring-coffee-300' : ''}
          `}
          style={{ width: leftWidth }}
          aria-hidden={state.leftPanelCollapsed}
          tabIndex={state.leftPanelCollapsed ? -1 : 0}
          aria-label="좌측 사이드바"
        >
          <div className="flex-1 overflow-y-auto">
            {leftSidebarSlot}
          </div>
          
          {/* 좌측 패널 토글 버튼 (패널이 열려있을 때) */}
          {collapsiblePanels.left && !state.leftPanelCollapsed && (
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
              onClick={() => togglePanel('left')}
              aria-label="좌측 사이드바 닫기"
            >
              <svg 
                className="w-3 h-3 transition-transform duration-200"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </aside>
        
        {/* 좌측 패널 열기 버튼 (패널이 닫혀있을 때) */}
        {collapsiblePanels.left && state.leftPanelCollapsed && (
          <button
            {...createTouchOptimizedProps('md')}
            className={`
              absolute left-0 top-4 z-30
              w-8 h-10 bg-coffee-500 text-white rounded-r-lg
              hover:bg-coffee-600 active:scale-95 transition-all
              flex items-center justify-center shadow-lg
              focus:outline-none focus:ring-2 focus:ring-coffee-300
              ${createTouchOptimizedProps('md').className}
            `}
            onClick={() => togglePanel('left')}
            aria-label="좌측 사이드바 열기"
          >
            <svg 
              className="w-4 h-4 transition-transform duration-200"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
        {/* 메인 콘텐츠 영역 */}
        <section
          ref={mainContentRef}
          className={`
            flex-1 bg-coffee-25 overflow-hidden flex flex-col
            ${state.focusedPanel === 'main' ? 'ring-2 ring-coffee-300' : ''}
          `}
          style={{ width: mainWidth }}
          tabIndex={0}
          aria-label="메인 콘텐츠"
        >
          <div className="flex-1 overflow-y-auto">
            {mainContentSlot}
          </div>
        </section>
        
        {/* 우측 도구 패널 */}
        <aside
          ref={rightPanelRef}
          className={`
            bg-white border-l border-coffee-200 shadow-sm
            transition-all duration-400 ease-in-out
            flex flex-col overflow-hidden relative
            ${state.rightPanelCollapsed ? 'w-0 min-w-0' : 'min-w-[200px] max-w-[350px]'}
            ${state.focusedPanel === 'right' ? 'ring-2 ring-coffee-300' : ''}
          `}
          style={{ width: rightWidth }}
          aria-hidden={state.rightPanelCollapsed}
          tabIndex={state.rightPanelCollapsed ? -1 : 0}
          aria-label="우측 도구 패널"
        >
          <div className="flex-1 overflow-y-auto">
            {rightPanelSlot}
          </div>
          
          {/* 우측 패널 토글 버튼 (패널이 열려있을 때) */}
          {collapsiblePanels.right && !state.rightPanelCollapsed && (
            <button
              {...createTouchOptimizedProps('md')}
              className={`
                absolute top-4 -left-3 z-20
                w-6 h-8 bg-coffee-500 text-white rounded-l-md
                hover:bg-coffee-600 active:scale-95 transition-all
                flex items-center justify-center
                focus:outline-none focus:ring-2 focus:ring-coffee-300
                ${createTouchOptimizedProps('md').className}
              `}
              onClick={() => togglePanel('right')}
              aria-label="우측 패널 닫기"
            >
              <svg 
                className="w-3 h-3 transition-transform duration-200 rotate-180"
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </aside>
        
        {/* 우측 패널 열기 버튼 (패널이 닫혀있을 때) */}
        {collapsiblePanels.right && state.rightPanelCollapsed && (
          <button
            {...createTouchOptimizedProps('md')}
            className={`
              absolute right-0 top-4 z-30
              w-8 h-10 bg-coffee-500 text-white rounded-l-lg
              hover:bg-coffee-600 active:scale-95 transition-all
              flex items-center justify-center shadow-lg
              focus:outline-none focus:ring-2 focus:ring-coffee-300
              ${createTouchOptimizedProps('md').className}
            `}
            onClick={() => togglePanel('right')}
            aria-label="우측 패널 열기"
          >
            <svg 
              className="w-4 h-4 transition-transform duration-200"
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
      </main>
      
      {/* 하단 상태바 */}
      {statusBarSlot && (
        <footer className="flex-shrink-0 bg-coffee-100 border-t border-coffee-200 z-10">
          {statusBarSlot}
        </footer>
      )}
      
      {/* 키보드 네비게이션 안내 */}
      {keyboardNavigation && (
        <div className="sr-only">
          데스크탑 3-컬럼 레이아웃: Ctrl+Shift+L/M/R로 패널 간 이동, Ctrl+B로 사이드바 토글, Ctrl+Shift+B로 우측 패널 토글
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