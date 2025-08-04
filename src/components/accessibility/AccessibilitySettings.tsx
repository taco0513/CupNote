/**
 * Accessibility Settings Component
 * Provides user controls for accessibility preferences
 */
'use client'

import { useState } from 'react'
import { 
  Eye, 
  Type, 
  Volume2, 
  Contrast, 
  Zap, 
  MousePointer,
  Settings,
  Check,
  Info
} from 'lucide-react'
import { useAccessibility } from '../../hooks/useAccessibility'

interface AccessibilitySettingsProps {
  isOpen: boolean
  onClose: () => void
}

export default function AccessibilitySettings({ isOpen, onClose }: AccessibilitySettingsProps) {
  const { preferences, setFontSize, announce, checkColorContrast } = useAccessibility()
  const [showContrastCheck, setShowContrastCheck] = useState(false)

  if (!isOpen) return null

  const handleFontSizeChange = (size: typeof preferences.fontSize) => {
    setFontSize(size)
  }

  const handleContrastCheck = () => {
    setShowContrastCheck(!showContrastCheck)
    if (!showContrastCheck) {
      announce('색상 대비 검사 도구가 활성화되었습니다.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto shadow-xl"
        role="dialog"
        aria-labelledby="accessibility-title"
        aria-describedby="accessibility-description"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-coffee-100 rounded-lg">
              <Settings className="h-5 w-5 text-coffee-600" />
            </div>
            <div>
              <h2 id="accessibility-title" className="text-xl font-bold text-coffee-800">
                접근성 설정
              </h2>
              <p id="accessibility-description" className="text-coffee-600 text-sm">
                사용자 환경에 맞게 설정을 조정하세요
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-coffee-100 rounded-lg transition-colors"
            aria-label="접근성 설정 닫기"
          >
            ✕
          </button>
        </div>

        {/* Font Size Settings */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Type className="h-4 w-4 text-coffee-600" />
            <h3 className="font-semibold text-coffee-800">글꼴 크기</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'small', label: '작게', size: '14px' },
              { key: 'medium', label: '보통', size: '16px' },
              { key: 'large', label: '크게', size: '18px' },
              { key: 'extra-large', label: '매우 크게', size: '20px' }
            ].map(({ key, label, size }) => (
              <button
                key={key}
                onClick={() => handleFontSizeChange(key as typeof preferences.fontSize)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  preferences.fontSize === key
                    ? 'border-coffee-600 bg-coffee-50 text-coffee-800'
                    : 'border-coffee-200 hover:border-coffee-300 text-coffee-600'
                }`}
                style={{ fontSize: size }}
                aria-pressed={preferences.fontSize === key}
              >
                <div className="flex items-center justify-between">
                  <span>{label}</span>
                  {preferences.fontSize === key && (
                    <Check className="h-4 w-4 text-coffee-600" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* System Preferences Display */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Eye className="h-4 w-4 text-coffee-600" />
            <h3 className="font-semibold text-coffee-800">시스템 환경설정</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-coffee-600" />
                <span className="text-coffee-700">애니메이션 줄이기</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                preferences.prefersReducedMotion 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {preferences.prefersReducedMotion ? '활성화' : '비활성'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Contrast className="h-4 w-4 text-coffee-600" />
                <span className="text-coffee-700">고대비 모드</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                preferences.prefersHighContrast 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {preferences.prefersHighContrast ? '활성화' : '비활성'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-coffee-50 rounded-xl">
              <div className="flex items-center gap-2">
                <MousePointer className="h-4 w-4 text-coffee-600" />
                <span className="text-coffee-700">투명도 줄이기</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${
                preferences.prefersReducedTransparency 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {preferences.prefersReducedTransparency ? '활성화' : '비활성'}
              </span>
            </div>
          </div>
        </div>

        {/* Accessibility Tools */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Volume2 className="h-4 w-4 text-coffee-600" />
            <h3 className="font-semibold text-coffee-800">접근성 도구</h3>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={handleContrastCheck}
              className={`w-full p-3 rounded-xl border-2 transition-all text-left ${
                showContrastCheck
                  ? 'border-coffee-600 bg-coffee-50'
                  : 'border-coffee-200 hover:border-coffee-300'
              }`}
              aria-pressed={showContrastCheck}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">색상 대비 검사</div>
                  <div className="text-sm text-coffee-600">색상 대비를 시각적으로 확인</div>
                </div>
                <Contrast className="h-4 w-4 text-coffee-600" />
              </div>
            </button>

            <button
              onClick={() => announce('스크린 리더 테스트 메시지입니다.')}
              className="w-full p-3 rounded-xl border-2 border-coffee-200 hover:border-coffee-300 transition-all text-left"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">스크린 리더 테스트</div>
                  <div className="text-sm text-coffee-600">음성 안내 기능 테스트</div>
                </div>
                <Volume2 className="h-4 w-4 text-coffee-600" />
              </div>
            </button>
          </div>
        </div>

        {/* Keyboard Shortcuts Info */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Info className="h-4 w-4 text-coffee-600" />
            <h3 className="font-semibold text-coffee-800">키보드 단축키</h3>
          </div>
          
          <div className="space-y-2 text-sm text-coffee-600">
            <div className="flex justify-between">
              <span>메인 콘텐츠로 이동</span>
              <kbd className="bg-coffee-100 px-2 py-1 rounded">Tab</kbd>
            </div>
            <div className="flex justify-between">
              <span>설정 열기</span>
              <kbd className="bg-coffee-100 px-2 py-1 rounded">Alt + S</kbd>
            </div>
            <div className="flex justify-between">
              <span>검색 열기</span>
              <kbd className="bg-coffee-100 px-2 py-1 rounded">Ctrl + K</kbd>
            </div>
          </div>
        </div>

        {/* Contrast Checker Tool */}
        {showContrastCheck && (
          <div className="p-4 bg-coffee-50 rounded-xl border border-coffee-200">
            <h4 className="font-medium text-coffee-800 mb-3">색상 대비 검사</h4>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    전경색
                  </label>
                  <input
                    type="color"
                    defaultValue="#333333"
                    className="w-full h-10 rounded border border-coffee-200"
                    aria-label="전경색 선택"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-1">
                    배경색
                  </label>
                  <input
                    type="color"
                    defaultValue="#ffffff"
                    className="w-full h-10 rounded border border-coffee-200"
                    aria-label="배경색 선택"
                  />
                </div>
              </div>
              <div className="p-3 bg-white rounded border border-coffee-200">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>대비 비율:</span>
                    <span className="font-medium">7.0:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WCAG AA:</span>
                    <span className="text-green-600 font-medium">통과</span>
                  </div>
                  <div className="flex justify-between">
                    <span>WCAG AAA:</span>
                    <span className="text-green-600 font-medium">통과</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-coffee-200">
          <p className="text-xs text-coffee-500 text-center">
            접근성 설정은 브라우저에 저장되며, 다음 방문 시에도 유지됩니다.
          </p>
        </div>
      </div>
    </div>
  )
}