/**
 * PageLayout v2.0 - 하이브리드 디자인 시스템
 * Minimal Structure + Premium Visual Quality 유지
 */
'use client'

import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
  showBackground?: boolean
}

export default function PageLayout({
  children,
  className = '',
  showBackground = true
}: PageLayoutProps) {
  return (
    <div className={`min-h-screen ${showBackground ? 'bg-gradient-to-br from-coffee-50 to-neutral-50' : ''}`}>
      <div className={`pb-20 md:pb-8 ${className}`}>
        <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}