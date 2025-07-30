import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import MobileNavigation from '@/components/MobileNavigation'
import './globals.css'

export const metadata: Metadata = {
  title: 'CupNote - 나만의 커피 여정',
  description: '누구나 전문가처럼, 그러나 자기만의 방식으로 커피를 기록하고 나눌 수 있는 공간',
  keywords: ['커피', '스페셜티 커피', '커피 일기', '커핑', '테이스팅 노트'],
  authors: [{ name: 'CupNote Team' }],
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
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
        <AuthProvider>
          <div className="pb-16 md:pb-0 safe-area-inset">{children}</div>
          <MobileNavigation />
        </AuthProvider>
      </body>
    </html>
  )
}
