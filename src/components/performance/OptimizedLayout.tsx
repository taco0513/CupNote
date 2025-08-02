'use client'

import { Suspense } from 'react'
import CoreWebVitalsOptimizer, { CriticalContent, DynamicContent } from './CoreWebVitalsOptimizer'
import { LoadingSpinner } from '../ui'

interface OptimizedLayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
  critical?: boolean
}

/**
 * Performance-optimized layout wrapper
 * Implements critical rendering path optimization
 */
export function OptimizedLayout({ 
  children, 
  showNavigation = true, 
  critical = false 
}: OptimizedLayoutProps) {
  const ContentWrapper = critical ? CriticalContent : DynamicContent

  return (
    <>
      <CoreWebVitalsOptimizer />
      
      {/* Critical above-the-fold content */}
      <ContentWrapper>
        <div className="min-h-screen flex flex-col">
          {/* Navigation - lazy load if not critical */}
          {showNavigation && (
            <Suspense fallback={<div className="h-16 bg-white border-b" />}>
              <DynamicContent threshold={0.1}>
                {/* Navigation component would go here */}
                <nav className="h-16 bg-white border-b flex items-center justify-between px-4">
                  <div className="text-xl font-bold text-coffee-600">CupNote</div>
                  <div className="flex space-x-4">
                    {/* Navigation items */}
                  </div>
                </nav>
              </DynamicContent>
            </Suspense>
          )}

          {/* Main content area */}
          <main className="flex-1">
            <Suspense 
              fallback={
                <div className="flex items-center justify-center min-h-[400px]">
                  <LoadingSpinner size="lg" text="로딩 중..." />
                </div>
              }
            >
              {children}
            </Suspense>
          </main>

          {/* Footer - always lazy loaded */}
          <DynamicContent threshold={0.1}>
            <footer className="bg-gray-50 border-t py-8">
              <div className="container mx-auto px-4 text-center text-gray-600">
                <p>&copy; 2025 CupNote. 모든 권리 보유.</p>
              </div>
            </footer>
          </DynamicContent>
        </div>
      </ContentWrapper>
    </>
  )
}

/**
 * Hero section with LCP optimization
 */
interface OptimizedHeroProps {
  title: string
  subtitle?: string
  backgroundImage?: string
  children?: React.ReactNode
}

export function OptimizedHero({ 
  title, 
  subtitle, 
  backgroundImage,
  children 
}: OptimizedHeroProps) {
  return (
    <CriticalContent>
      <section 
        className="relative min-h-[400px] flex items-center justify-center text-white"
        style={{
          background: backgroundImage 
            ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${backgroundImage})`
            : 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="text-center z-10 px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl md:text-2xl text-gray-200 mb-8">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </section>
    </CriticalContent>
  )
}

/**
 * Card grid with intersection observer optimization
 */
interface OptimizedCardGridProps {
  children: React.ReactNode
  className?: string
  threshold?: number
}

export function OptimizedCardGrid({ 
  children, 
  className = '',
  threshold = 0.1 
}: OptimizedCardGridProps) {
  return (
    <DynamicContent 
      threshold={threshold}
      fallback={
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="dynamic-content-placeholder h-48 rounded-lg" />
          ))}
        </div>
      }
    >
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
        {children}
      </div>
    </DynamicContent>
  )
}

export default OptimizedLayout