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
  loading: () => null
})
import './globals.css'
import '../styles/fluid.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://mycupnote.com/'),
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
  authors: [{ name: 'CupNote Team', url: 'https://mycupnote.com' }],
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
    statusBarStyle: 'black-translucent',
    title: 'CupNote',
    startupImage: '/icons/apple-icon-180x180.png',
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/icons/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/icons/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },
  openGraph: {
    title: 'CupNote - 나만의 커피 여정',
    description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
    url: 'https://mycupnote.com/',
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
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-touch-fullscreen': 'yes',
    'format-detection': 'telephone=no',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#8B4513" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-icon-180x180.png" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-background to-background-secondary antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA Mode Detection and Status Bar Handler
              (function() {
                // Check if running in standalone PWA mode
                const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
                
                if (isPWA) {
                  // Add PWA class to body for styling
                  document.body.classList.add('pwa-mode');
                  
                  // Handle status bar style
                  const meta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
                  if (meta) {
                    meta.setAttribute('content', 'black-translucent');
                  }
                  
                  // Only prevent external links from opening in browser
                  document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href && link.target === '_blank') {
                      const url = new URL(link.href);
                      const currentUrl = new URL(window.location.href);
                      
                      // Only prevent external links
                      if (url.origin !== currentUrl.origin) {
                        e.preventDefault();
                        // Keep external links within PWA
                        window.location.href = link.href;
                      }
                    }
                  });
                }
              })();
            `
          }}
        />
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
