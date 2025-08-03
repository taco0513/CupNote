/**
 * @document-ref NEXTJS_PATTERNS.md#layout-first-component-strategy
 * @design-ref DESIGN_SYSTEM.md#global-layouts
 * @compliance-check 2025-08-02 - NextJS Production Reality 패턴 적용
 */
import type { Metadata, Viewport } from 'next'

import dynamic from 'next/dynamic'

import ErrorBoundary from '../components/errors/ErrorBoundary'
import MobileNavigation from '../components/MobileNavigation'
import NotificationContainer from '../components/notifications/NotificationContainer'
import { AuthProvider } from '../contexts/AuthContext'
import { NotificationProvider } from '../contexts/NotificationContext'
import { SystemNotificationProvider } from '../contexts/SystemNotificationContext'
import { SearchProvider } from '../contexts/SearchContext'
import { ThemeProvider } from '../contexts/ThemeContext'

// 개발용 컴포넌트 - 클라이언트에서만 렌더링
const OnboardingTrigger = dynamic(() => import('../components/ui/OnboardingTrigger'), {
  loading: () => null
})

// 클라이언트 전용 컴포넌트들을 동적 import
const AppHeader = dynamic(() => import('../components/AppHeader'), {
  loading: () => null,
  ssr: false
})
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://cupnote.vercel.app'),
  title: {
    default: 'CupNote - 나만의 커피 여정',
    template: '%s | CupNote'
  },
  description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간. 스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼',
  keywords: [
    '커피', '스페셜티 커피', '커피 일기', '커핑', '테이스팅 노트', 
    '커피 기록', '맛 평가', '로스터리', '원두', 'PWA', 
    'coffee journal', 'cupping notes', 'specialty coffee'
  ],
  authors: [{ name: 'CupNote Team', url: 'https://cupnote.vercel.app' }],
  creator: 'CupNote Team',
  publisher: 'CupNote',
  category: 'Food & Drink',
  classification: 'Coffee Journal Application',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CupNote',
    startupImage: '/icons/apple-icon-152x152.png',
  },
  openGraph: {
    title: 'CupNote - 나만의 커피 여정',
    description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
    url: 'https://cupnote.vercel.app',
    siteName: 'CupNote',
    locale: 'ko_KR',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CupNote - 나만의 커피 여정',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CupNote - 나만의 커피 여정',
    description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
    images: ['/og-image.png'],
    creator: '@cupnote_app',
  },
  alternates: {
    canonical: 'https://cupnote.vercel.app',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8B4513" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-background to-background-secondary antialiased">
        <ThemeProvider>
          <ErrorBoundary>
            <NotificationProvider>
              <SystemNotificationProvider>
                <AuthProvider>
                  <SearchProvider>
                  <AppHeader />
                  <div className="pb-16 md:pb-0 safe-area-inset">{children}</div>
                  <MobileNavigation />
                  <NotificationContainer />
                  <OnboardingTrigger />
                  </SearchProvider>
                </AuthProvider>
              </SystemNotificationProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
