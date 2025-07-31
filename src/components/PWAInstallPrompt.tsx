'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if already dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      return
    }

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

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 border border-coffee-200">
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="닫기"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>

        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-coffee-100 rounded-xl flex items-center justify-center">
              <Download className="h-6 w-6 text-coffee-600" />
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">CupNote 앱 설치</h3>
            <p className="text-sm text-gray-600 mb-4">
              홈 화면에 추가하고 더 빠르고 편리하게 사용해보세요!
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleInstall}
                className="flex-1 bg-coffee-600 text-white py-2 px-4 rounded-xl hover:bg-coffee-700 transition-colors font-medium text-sm"
              >
                설치하기
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
              >
                나중에
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
