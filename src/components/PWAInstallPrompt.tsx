'use client'

import { useEffect, useState } from 'react'

import { X, Download, Share, Smartphone } from 'lucide-react'
import UnifiedButton from './ui/UnifiedButton'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as any).standalone
    if (isStandalone) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

    // iOS: Show prompt after 3 page views
    if (isIOSDevice) {
      const views = parseInt(localStorage.getItem('page-views') || '0') + 1
      localStorage.setItem('page-views', views.toString())
      
      if (views >= 3) {
        setTimeout(() => setShowPrompt(true), 3000)
      }
      return
    }

    // Android/Desktop: Handle install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 30 seconds or 3 page views
      const views = parseInt(localStorage.getItem('page-views') || '0') + 1
      localStorage.setItem('page-views', views.toString())

      if (views >= 3) {
        setTimeout(() => setShowPrompt(true), 2000)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
      localStorage.removeItem('pwa-install-dismissed')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt || isInstalled) return null

  // iOS용 설치 안내
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 animate-slide-up">
        <div className="bg-white rounded-2xl shadow-2xl p-5 border border-coffee-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-xl flex items-center justify-center">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-coffee-800">앱으로 설치하기</h3>
                <p className="text-xs text-coffee-600">홈 화면에서 빠르게 실행</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="p-1 hover:bg-coffee-50 rounded-lg transition-colors"
              aria-label="닫기"
            >
              <X className="h-4 w-4 text-coffee-400" />
            </button>
          </div>
          
          <div className="space-y-2.5 mb-4">
            <div className="flex items-center gap-3 text-sm text-coffee-700">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share className="h-4 w-4 text-white" />
              </div>
              <span>Safari 하단의 공유 버튼을 탭하세요</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-coffee-700">
              <div className="w-8 h-8 bg-coffee-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">➕</span>
              </div>
              <span>"홈 화면에 추가"를 선택하세요</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-coffee-700">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span>오른쪽 상단 "추가"를 탭하세요</span>
            </div>
          </div>
          
          <UnifiedButton
            size="sm"
            variant="primary"
            fullWidth
            onClick={handleDismiss}
          >
            알겠어요
          </UnifiedButton>
        </div>
      </div>
    )
  }

  // Android/Desktop용 설치 프롬프트
  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 animate-slide-up">
      <div className="bg-white rounded-2xl shadow-2xl p-5 border border-coffee-200">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-xl flex items-center justify-center">
              <Download className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-coffee-800">CupNote 앱 설치</h3>
              <p className="text-xs text-coffee-600">홈 화면에서 빠르게 실행</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-coffee-50 rounded-lg transition-colors"
            aria-label="닫기"
          >
            <X className="h-4 w-4 text-coffee-400" />
          </button>
        </div>

        <p className="text-sm text-coffee-700 mb-4">
          CupNote를 앱으로 설치하면 더 빠르고 편리하게 사용할 수 있어요!
        </p>

        <div className="flex gap-2">
          <UnifiedButton
            size="sm"
            variant="secondary"
            onClick={handleDismiss}
            className="flex-1"
          >
            나중에
          </UnifiedButton>
          <UnifiedButton
            size="sm"
            variant="primary"
            onClick={handleInstall}
            className="flex-1"
            icon={<Download className="h-4 w-4" />}
          >
            설치하기
          </UnifiedButton>
        </div>
      </div>
    </div>
  )
}
