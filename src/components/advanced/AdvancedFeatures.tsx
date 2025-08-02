'use client'

import { useState, useEffect } from 'react'
import { Settings, Zap, Smartphone, Palette, Keyboard, Eye } from 'lucide-react'

// 개별 컴포넌트 임포트
import { ThemeSettings } from '../DarkModeEnhancer'
import PerformanceOptimizer from '../PerformanceOptimizer'
import KeyboardShortcutsHelp, { useKeyboardShortcutsHelp } from './KeyboardShortcutsHelp'
import { useSmartGestures } from '../../hooks/useGestures'

interface AdvancedFeaturesProps {
  className?: string
}

export default function AdvancedFeatures({ className = '' }: AdvancedFeaturesProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'performance' | 'gestures' | 'accessibility' | 'keyboard'>('performance')
  const [settings, setSettings] = useState({
    performanceMonitoring: true,
    gestureSupport: true,
    smartSuggestions: true,
    keyboardShortcuts: true,
    highContrast: false,
    reducedMotion: false
  })

  // 키보드 단축키 도움말
  const keyboardHelp = useKeyboardShortcutsHelp()

  // 스마트 제스처 활성화
  const { gestureRef } = useSmartGestures()

  // 설정 로드
  useEffect(() => {
    const savedSettings = localStorage.getItem('cupnote-advanced-settings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Failed to parse advanced settings:', e)
      }
    }
  }, [])

  // 설정 저장
  const updateSetting = (key: keyof typeof settings, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    localStorage.setItem('cupnote-advanced-settings', JSON.stringify(newSettings))

    // 설정에 따른 DOM 업데이트
    if (key === 'highContrast') {
      document.documentElement.setAttribute('data-high-contrast', value.toString())
    }
    if (key === 'reducedMotion') {
      document.documentElement.style.setProperty('--reduced-motion', value ? 'reduce' : 'no-preference')
    }
  }

  const tabs = [
    { id: 'performance', label: '성능', icon: <Zap className="w-4 h-4" /> },
    { id: 'gestures', label: '제스처', icon: <Smartphone className="w-4 h-4" /> },
    { id: 'accessibility', label: '접근성', icon: <Eye className="w-4 h-4" /> },
    { id: 'keyboard', label: '키보드', icon: <Keyboard className="w-4 h-4" /> }
  ] as const

  return (
    <div className={`relative ${className}`}>
      {/* 트리거 버튼 */}
      <button
        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-background-secondary transition-all"
        title="고급 설정"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">고급 설정</span>
      </button>

      {/* 설정 패널 */}
      {isSettingsOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-background border border-border rounded-lg shadow-xl z-50">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="font-semibold text-foreground">고급 설정</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-foreground-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* 탭 */}
            <div className="flex border-b border-border">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-primary border-b-2 border-primary bg-primary/5'
                      : 'text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* 탭 컨텐츠 */}
            <div className="p-4 max-h-80 overflow-y-auto">
              {activeTab === 'performance' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">성능 모니터링</h3>
                      <p className="text-sm text-foreground-muted">실시간 성능 지표 표시</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.performanceMonitoring}
                      onChange={(e) => updateSetting('performanceMonitoring', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-2">성능 최적화</h4>
                    <button
                      onClick={() => {
                        // 수동 성능 최적화 실행
                        console.log('Manual performance optimization triggered')
                      }}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      지금 최적화 실행
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'gestures' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">스마트 제스처</h3>
                      <p className="text-sm text-foreground-muted">터치 제스처 및 스와이프 지원</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.gestureSupport}
                      onChange={(e) => updateSetting('gestureSupport', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div className="space-y-2 text-sm text-foreground-muted">
                    <div className="flex justify-between">
                      <span>← 스와이프:</span>
                      <span>뒤로 가기</span>
                    </div>
                    <div className="flex justify-between">
                      <span>→ 스와이프:</span>
                      <span>앞으로 가기</span>
                    </div>
                    <div className="flex justify-between">
                      <span>↑ 스와이프:</span>
                      <span>페이지 상단</span>
                    </div>
                    <div className="flex justify-between">
                      <span>↓ 스와이프:</span>
                      <span>새로고침</span>
                    </div>
                    <div className="flex justify-between">
                      <span>핀치:</span>
                      <span>확대/축소</span>
                    </div>
                    <div className="flex justify-between">
                      <span>롱프레스:</span>
                      <span>컨텍스트 메뉴</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'accessibility' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">고대비 모드</h3>
                      <p className="text-sm text-foreground-muted">높은 대비로 가독성 향상</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.highContrast}
                      onChange={(e) => updateSetting('highContrast', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">모션 감소</h3>
                      <p className="text-sm text-foreground-muted">애니메이션 및 전환 효과 최소화</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.reducedMotion}
                      onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <h4 className="font-medium text-foreground mb-2">접근성 도구</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          // 스크린 리더 테스트
                          const announcement = document.createElement('div')
                          announcement.setAttribute('aria-live', 'polite')
                          announcement.className = 'sr-only'
                          announcement.textContent = '접근성 도구가 활성화되었습니다.'
                          document.body.appendChild(announcement)
                          setTimeout(() => document.body.removeChild(announcement), 1000)
                        }}
                        className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition-colors text-left"
                      >
                        스크린 리더 테스트
                      </button>
                      <button
                        onClick={() => {
                          // 포커스 가능한 요소에 하이라이트
                          const focusableElements = document.querySelectorAll(
                            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                          )
                          focusableElements.forEach(el => {
                            (el as HTMLElement).style.outline = '2px solid red'
                            setTimeout(() => {
                              (el as HTMLElement).style.outline = ''
                            }, 3000)
                          })
                        }}
                        className="w-full px-3 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-hover transition-colors text-left"
                      >
                        포커스 요소 하이라이트
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'keyboard' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">키보드 단축키</h3>
                      <p className="text-sm text-foreground-muted">키보드로 빠른 조작</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.keyboardShortcuts}
                      onChange={(e) => updateSetting('keyboardShortcuts', e.target.checked)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-primary"
                    />
                  </div>

                  <div className="pt-4 border-t border-border">
                    <button
                      onClick={keyboardHelp.open}
                      className="w-full px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      키보드 단축키 보기
                    </button>
                  </div>

                  <div className="space-y-2 text-sm text-foreground-muted">
                    <div className="flex justify-between">
                      <span>⌘ + K:</span>
                      <span>검색</span>
                    </div>
                    <div className="flex justify-between">
                      <span>⌘ + N:</span>
                      <span>새 기록</span>
                    </div>
                    <div className="flex justify-between">
                      <span>?:</span>
                      <span>도움말</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escape:</span>
                      <span>닫기</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 푸터 */}
            <div className="p-4 border-t border-border bg-background-secondary">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground-muted">
                  설정은 자동으로 저장됩니다
                </span>
                <ThemeSettings />
              </div>
            </div>
          </div>
        </>
      )}

      {/* 성능 모니터 */}
      {settings.performanceMonitoring && (
        <PerformanceOptimizer 
          enableMonitoring={true}
          showMetrics={true}
        />
      )}

      {/* 키보드 단축키 도움말 */}
      <KeyboardShortcutsHelp 
        isOpen={keyboardHelp.isOpen}
        onClose={keyboardHelp.close}
      />

      {/* 제스처 활성화된 컨테이너 */}
      <div 
        ref={gestureRef}
        data-gesture-enabled={settings.gestureSupport}
        className="hidden"
      />
    </div>
  )
}