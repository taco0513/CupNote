import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import ErrorBoundary from '@/components/errors/ErrorBoundary'
import NotificationContainer from '@/components/notifications/NotificationContainer'
import NetworkStatus, { ConnectionIndicator } from '@/components/network/NetworkStatus'
import MobileNavigation from '@/components/MobileNavigation'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import SyncStatus from '@/components/SyncStatus'
import './globals.css'

export const metadata: Metadata = {
  title: 'CupNote - 나만의 커피 여정',
  description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
  keywords: ['커피', '스페셜티 커피', '커피 일기', '커핑', '테이스팅 노트'],
  authors: [{ name: 'CupNote Team' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CupNote',
  },
  openGraph: {
    title: 'CupNote - 나만의 커피 여정',
    description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
    url: 'https://cupnote.com',
    siteName: 'CupNote',
    locale: 'ko_KR',
    type: 'website',
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
        <meta name="theme-color" content="#6F4E37" />
        <meta name="theme-color" content="#1a1a1a" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-background to-background-secondary antialiased">
        <ThemeProvider>
          <ErrorBoundary>
            <NotificationProvider>
              <AuthProvider>
                <NetworkStatus />
                <SyncStatus />
                <div className="pb-16 md:pb-0 safe-area-inset">{children}</div>
                <MobileNavigation />
                <NotificationContainer />
                <ConnectionIndicator />
                <PWAInstallPrompt />
              </AuthProvider>
            </NotificationProvider>
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  )
}
