'use client'

import { useState, useEffect } from 'react'
import { Keyboard, X, Command, Option } from 'lucide-react'

interface KeyboardShortcut {
  keys: string[]
  description: string
  category: string
}

const shortcuts: KeyboardShortcut[] = [
  // 네비게이션
  { keys: ['⌘', 'K'], description: '검색 열기', category: '네비게이션' },
  { keys: ['⌘', 'N'], description: '새 기록 작성', category: '네비게이션' },
  { keys: ['⌥', 'H'], description: '홈으로 이동', category: '네비게이션' },
  { keys: ['⌥', 'S'], description: '통계 페이지', category: '네비게이션' },
  { keys: ['Escape'], description: '모달 닫기', category: '네비게이션' },
  
  // 기록 작성
  { keys: ['⌘', 'S'], description: '기록 저장', category: '기록 작성' },
  { keys: ['⌘', 'Enter'], description: '기록 완료', category: '기록 작성' },
  { keys: ['Tab'], description: '다음 필드로 이동', category: '기록 작성' },
  { keys: ['Shift', 'Tab'], description: '이전 필드로 이동', category: '기록 작성' },
  
  // 평가 및 점수
  { keys: ['1', '-', '5'], description: '점수 입력 (1-5)', category: '평가' },
  { keys: ['Space'], description: '선택 토글', category: '평가' },
  { keys: ['Enter'], description: '선택 확인', category: '평가' },
  
  // 접근성
  { keys: ['?'], description: '키보드 단축키 도움말', category: '도움말' },
  { keys: ['⌘', '='], description: '화면 확대', category: '접근성' },
  { keys: ['⌘', '-'], description: '화면 축소', category: '접근성' },
  { keys: ['⌘', '0'], description: '화면 크기 원래대로', category: '접근성' }
]

interface KeyboardShortcutsHelpProps {
  isOpen: boolean
  onClose: () => void
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  const [searchTerm, setSearchTerm] = useState('')

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // 검색 필터링
  const filteredShortcuts = shortcuts.filter(shortcut =>
    shortcut.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shortcut.keys.some(key => key.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // 카테고리별 그룹화
  const groupedShortcuts = filteredShortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = []
    }
    acc[shortcut.category].push(shortcut)
    return acc
  }, {} as Record<string, KeyboardShortcut[]>)

  if (!isOpen) return null

  return (
    <>
      {/* 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* 모달 */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background border border-border rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* 헤더 */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">키보드 단축키</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-background-secondary rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 검색 */}
          <div className="p-6 border-b border-border">
            <input
              type="text"
              placeholder="단축키 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              autoFocus
            />
          </div>

          {/* 단축키 목록 */}
          <div className="overflow-y-auto max-h-[50vh]">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="p-6 border-b border-border last:border-b-0">
                <h3 className="text-lg font-medium text-foreground mb-4">{category}</h3>
                <div className="space-y-3">
                  {categoryShortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-foreground-secondary">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <div key={keyIndex} className="flex items-center gap-1">
                            <KeyboardKey keyName={key} />
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-foreground-muted text-sm">+</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 푸터 */}
          <div className="p-6 bg-background-secondary">
            <div className="flex items-center justify-between text-sm text-foreground-muted">
              <span>총 {filteredShortcuts.length}개의 단축키</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Command className="w-4 h-4" />
                  <span>Command</span>
                </div>
                <div className="flex items-center gap-1">
                  <Option className="w-4 h-4" />
                  <span>Option</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// 키보드 키 컴포넌트
interface KeyboardKeyProps {
  keyName: string
}

function KeyboardKey({ keyName }: KeyboardKeyProps) {
  const getKeySymbol = (key: string) => {
    const symbols: Record<string, string> = {
      '⌘': '⌘',
      'cmd': '⌘',
      'command': '⌘',
      '⌥': '⌥',
      'alt': '⌥',
      'option': '⌥',
      '⇧': '⇧',
      'shift': '⇧',
      '⌃': '⌃',
      'ctrl': '⌃',
      'control': '⌃',
      'space': '␣',
      'enter': '↵',
      'return': '↵',
      'tab': '⇥',
      'escape': '⎋',
      'esc': '⎋',
      'backspace': '⌫',
      'delete': '⌦',
      'up': '↑',
      'down': '↓',
      'left': '←',
      'right': '→'
    }

    return symbols[key.toLowerCase()] || key
  }

  return (
    <kbd className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 bg-background border border-border rounded text-sm font-mono text-foreground shadow-sm">
      {getKeySymbol(keyName)}
    </kbd>
  )
}

// 키보드 단축키 도움말 트리거 훅
export function useKeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? 키로 도움말 열기
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        // 입력 필드에서는 무시
        const target = e.target as HTMLElement
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
          return
        }
        
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }
}