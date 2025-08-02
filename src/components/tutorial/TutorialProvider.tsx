'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import TutorialOverlay from './TutorialOverlay'

interface TutorialStep {
  id: string
  target: string
  title: string
  content: string
  placement: 'top' | 'bottom' | 'left' | 'right'
  action?: 'click' | 'hover' | 'input'
  skipable?: boolean
}

interface Tutorial {
  id: string
  name: string
  steps: TutorialStep[]
  autoStart?: boolean
  conditions?: {
    pathname?: string
    userType?: 'new' | 'returning'
    maxCompletions?: number
  }
}

interface TutorialContextValue {
  startTutorial: (tutorialId: string) => void
  registerTutorial: (tutorial: Tutorial) => void
  isActive: boolean
  currentTutorial: Tutorial | null
}

const TutorialContext = createContext<TutorialContextValue | null>(null)

export function useTutorial() {
  const context = useContext(TutorialContext)
  if (!context) {
    throw new Error('useTutorial must be used within TutorialProvider')
  }
  return context
}

interface TutorialProviderProps {
  children: ReactNode
}

export function TutorialProvider({ children }: TutorialProviderProps) {
  const [tutorials, setTutorials] = useState<Map<string, Tutorial>>(new Map())
  const [activeTutorial, setActiveTutorial] = useState<Tutorial | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)

  // 튜토리얼 등록
  const registerTutorial = (tutorial: Tutorial) => {
    setTutorials(prev => new Map(prev.set(tutorial.id, tutorial)))
  }

  // 튜토리얼 시작
  const startTutorial = (tutorialId: string) => {
    const tutorial = tutorials.get(tutorialId)
    if (!tutorial) {
      console.warn(`Tutorial ${tutorialId} not found`)
      return
    }

    // 이미 완료된 튜토리얼인지 확인
    const isCompleted = localStorage.getItem(`tutorial-${tutorialId}-completed`)
    if (isCompleted) {
      console.log(`Tutorial ${tutorialId} already completed`)
      return
    }

    setActiveTutorial(tutorial)
    setIsOverlayOpen(true)
  }

  // 튜토리얼 완료/닫기
  const handleTutorialClose = () => {
    setIsOverlayOpen(false)
    setActiveTutorial(null)
  }

  const handleTutorialComplete = () => {
    if (activeTutorial) {
      // 완료 이벤트 트래킹
      console.log(`Tutorial ${activeTutorial.id} completed`)
      
      // 사용자 데이터 업데이트 (예: 성취 시스템)
      // updateUserAchievements('tutorial_completed', activeTutorial.id)
    }
    handleTutorialClose()
  }

  // 자동 시작 튜토리얼 체크
  useEffect(() => {
    const checkAutoStartTutorials = () => {
      const currentPath = window.location.pathname
      
      tutorials.forEach(tutorial => {
        if (!tutorial.autoStart) return
        
        // 조건 확인
        if (tutorial.conditions?.pathname && tutorial.conditions.pathname !== currentPath) {
          return
        }
        
        // 이미 완료된 튜토리얼인지 확인
        const isCompleted = localStorage.getItem(`tutorial-${tutorial.id}-completed`)
        if (isCompleted) return
        
        // 최대 완료 횟수 확인
        if (tutorial.conditions?.maxCompletions) {
          const completionCount = parseInt(localStorage.getItem(`tutorial-${tutorial.id}-count`) || '0')
          if (completionCount >= tutorial.conditions.maxCompletions) return
        }
        
        // 튜토리얼 시작 (딜레이 추가)
        setTimeout(() => {
          startTutorial(tutorial.id)
        }, 1000)
      })
    }

    checkAutoStartTutorials()
  }, [tutorials])

  const contextValue: TutorialContextValue = {
    startTutorial,
    registerTutorial,
    isActive: isOverlayOpen,
    currentTutorial: activeTutorial
  }

  return (
    <TutorialContext.Provider value={contextValue}>
      {children}
      
      {activeTutorial && (
        <TutorialOverlay
          isOpen={isOverlayOpen}
          onClose={handleTutorialClose}
          onComplete={handleTutorialComplete}
          steps={activeTutorial.steps}
          tutorialId={activeTutorial.id}
        />
      )}
    </TutorialContext.Provider>
  )
}