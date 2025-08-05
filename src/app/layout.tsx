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

// Auth persistence hook - temporarily removed due to webpack issues
// SSR safe imports

// 개발용 컴포넌트 - 클라이언트에서만 렌더링
const OnboardingTrigger = dynamic(() => import('../components/ui/OnboardingTrigger'), {
  loading: () => null
})

// AppHeader 일반 import로 변경
import AppHeader from '../components/AppHeader'

const IOSPullToRefreshPreventer = dynamic(() => import('../components/ios/IOSPullToRefreshPreventer'), {
  loading: () => null
})

const FeedbackButton = dynamic(() => import('../components/FeedbackButton'), {
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
    // iOS Safari pull-to-refresh 및 bounce 효과 비활성화
    'msapplication-tap-highlight': 'no',
    'apple-mobile-web-app-title': 'CupNote',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  // iOS Safari bounce 효과 및 pull-to-refresh 비활성화
  themeColor: '#8B4513',
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
              // Enhanced PWA Navigation - Force Standalone Mode Retention
              (function() {
                // Detect PWA mode
                const isPWA = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
                const isIOSPWA = ('standalone' in window.navigator) && (window.navigator.standalone);
                const isInAppMode = isPWA || isIOSPWA;
                
                if (isInAppMode) {
                  // Add PWA class to body
                  document.body.classList.add('pwa-mode');
                  console.log('PWA Mode Active - Navigation Override Enabled');
                  
                  // Force all same-origin navigation to stay in PWA
                  document.addEventListener('click', function(e) {
                    const link = e.target.closest('a');
                    if (link && link.href) {
                      try {
                        const url = new URL(link.href);
                        const currentUrl = new URL(window.location.href);
                        
                        // Handle same-origin links
                        if (url.origin === currentUrl.origin) {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          // Use pushState to navigate without browser UI
                          if (url.pathname !== currentUrl.pathname || url.search !== currentUrl.search) {
                            window.history.pushState(null, '', link.href);
                            
                            // Trigger Next.js router navigation
                            window.dispatchEvent(new PopStateEvent('popstate'));
                            
                            // Fallback: force page reload if needed
                            setTimeout(() => {
                              if (window.location.href !== link.href) {
                                window.location.replace(link.href);
                              }
                            }, 100);
                          }
                        } else {
                          // External links - open in current window to stay in PWA
                          e.preventDefault();
                          window.location.href = link.href;
                        }
                      } catch (err) {
                        console.warn('PWA Navigation Error:', err);
                      }
                    }
                  });
                  
                  // Handle browser back/forward to maintain PWA
                  window.addEventListener('popstate', function(e) {
                    // Ensure we stay in PWA mode
                    if (!document.body.classList.contains('pwa-mode')) {
                      document.body.classList.add('pwa-mode');
                    }
                  });
                  
                  // Prevent accidental exit from PWA
                  let exitAttempts = 0;
                  window.addEventListener('beforeunload', function(e) {
                    exitAttempts++;
                    if (exitAttempts === 1) {
                      // First attempt - try to stay in PWA
                      e.preventDefault();
                      e.returnValue = '';
                      setTimeout(() => { exitAttempts = 0; }, 1000);
                      return '';
                    }
                  });
                }

                // Register Service Worker for PWA
                // iOS WKWebView 감지
                const isIOSWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(navigator.userAgent);
                const isIOSApp = window.navigator.userAgent.includes('CupNote-iOS');
                
                // iOS 앱에서는 Service Worker 비활성화 (호환성 문제)
                if ('serviceWorker' in navigator && !isIOSWebView && !isIOSApp) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js')
                      .then(function(registration) {
                        console.log('CupNote SW: Registration successful');
                        
                        // Force update if new version available
                        registration.addEventListener('updatefound', function() {
                          const newWorker = registration.installing;
                          if (newWorker) {
                            try {
                              // iOS에서 postMessage가 실패할 수 있으므로 try-catch로 감싸기
                              newWorker.postMessage({ type: 'SKIP_WAITING' });
                            } catch (error) {
                              console.log('CupNote SW: Skip waiting message failed (iOS compatibility)', error);
                              // iOS에서는 페이지 새로고침으로 대체
                              if (confirm('새 버전이 있습니다. 페이지를 새로고침하시겠습니까?')) {
                                window.location.reload();
                              }
                            }
                          }
                        });
                      })
                      .catch(function(error) {
                        console.log('CupNote SW: Registration failed', error);
                      });
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
                  <IOSPullToRefreshPreventer />
                  <AppHeader />
                  <div className="pt-16 pb-16 md:pt-0 md:pb-0 safe-area-inset">{children}</div>
                  <MobileNavigation />
                  <NotificationContainer />
                  <OnboardingTrigger />
                  <FeedbackButton />
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
