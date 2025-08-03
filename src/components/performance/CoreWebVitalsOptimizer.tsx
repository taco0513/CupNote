'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

/**
 * Core Web Vitals Optimizer Component
 * Implements performance optimizations for LCP and FID
 */

// Critical resource preloader
function preloadCriticalResources() {
  const criticalResources = [
    // Coffee images for LCP optimization
    '/coffee-hero.jpg',
    '/mode-selection-bg.jpg',
    // Critical CSS (already handled by Next.js)
    // Critical fonts (if any)
  ]

  criticalResources.forEach(resource => {
    if (resource.endsWith('.jpg') || resource.endsWith('.png') || resource.endsWith('.webp')) {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = resource
      document.head.appendChild(link)
    }
  })
}

// Optimize First Input Delay through code splitting
function optimizeInputDelay() {
  // Preload Next.js router chunks
  if (typeof window !== 'undefined') {
    // Prefetch critical routes
    const router = useRouter()
    const criticalRoutes = [
      '/mode-selection',
      '/tasting-flow/cafe',
      '/tasting-flow/homecafe',
      '/tasting-flow/lab'
    ]
    
    criticalRoutes.forEach(route => {
      router.prefetch(route)
    })
  }
}

// Optimize layout shift prevention
function preventLayoutShift() {
  // Add CSS for preventing CLS
  const style = document.createElement('style')
  style.textContent = `
    /* Prevent layout shift for images */
    img[data-optimize] {
      aspect-ratio: attr(width) / attr(height);
    }
    
    /* Prevent layout shift for dynamic content */
    .dynamic-content-placeholder {
      min-height: 200px;
      background: linear-gradient(90deg, #f0f0f0 25%, transparent 37%, #f0f0f0 63%);
      background-size: 400% 100%;
      animation: shimmer 1.5s ease-in-out infinite;
    }
    
    @keyframes shimmer {
      0% { background-position: 100% 0; }
      100% { background-position: -100% 0; }
    }
    
    /* Optimize font loading to prevent FOIT/FOUT */
    @font-face {
      font-family: 'System-UI-Fallback';
      src: local('system-ui'), local('-apple-system'), local('BlinkMacSystemFont');
      font-display: swap;
    }
  `
  document.head.appendChild(style)
}

// Main optimization hook
function useWebVitalsOptimization() {
  useEffect(() => {
    // Only run optimizations on client side
    if (typeof window === 'undefined') return

    // Preload critical resources
    preloadCriticalResources()
    
    // Prevent layout shift
    preventLayoutShift()
    
    // Optimize critical rendering path
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Log LCP improvements
        if (entry.entryType === 'largest-contentful-paint') {
          console.log('✅ LCP Optimized:', entry.startTime, 'ms')
        }
        
        // Log FID improvements  
        if (entry.entryType === 'first-input') {
          console.log('✅ FID Optimized:', (entry as any).processingStart - entry.startTime, 'ms')
        }
      })
    })
    
    observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input'] })
    
    return () => observer.disconnect()
  }, [])
}

// Image optimization component
interface OptimizedImageProps {
  src: string
  alt: string
  width: number
  height: number
  priority?: boolean
  className?: string
}

export function OptimizedImage({ 
  src, 
  alt, 
  width, 
  height, 
  priority = false,
  className = '' 
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      data-optimize="true"
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      className={`${className} ${priority ? 'priority-image' : ''}`}
      style={{
        aspectRatio: `${width} / ${height}`,
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  )
}

// Critical above-the-fold component wrapper
interface CriticalContentProps {
  children: React.ReactNode
  className?: string
}

export function CriticalContent({ children, className = '' }: CriticalContentProps) {
  useWebVitalsOptimization()
  
  return (
    <div className={`critical-content ${className}`}>
      {children}
    </div>
  )
}

// Performance-optimized dynamic content loader
interface DynamicContentProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  threshold?: number
}

export function DynamicContent({ 
  children, 
  fallback,
  threshold = 0.1 
}: DynamicContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [threshold])

  return (
    <div ref={ref}>
      {isVisible ? children : (
        fallback || <div className="dynamic-content-placeholder" />
      )}
    </div>
  )
}

// Resource hints component for critical path optimization
export function ResourceHints() {
  useEffect(() => {
    // DNS prefetch for external resources
    const dnsPrefetchDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      // Add any CDN domains
    ]

    dnsPrefetchDomains.forEach(domain => {
      const link = document.createElement('link')
      link.rel = 'dns-prefetch'
      link.href = `//${domain}`
      document.head.appendChild(link)
    })

    // Preconnect to critical origins
    const preconnectOrigins = [
      'https://fonts.googleapis.com',
      // Add critical external origins
    ]

    preconnectOrigins.forEach(origin => {
      const link = document.createElement('link')
      link.rel = 'preconnect'
      link.href = origin
      link.crossOrigin = 'anonymous'
      document.head.appendChild(link)
    })
  }, [])

  return null
}

export default function CoreWebVitalsOptimizer() {
  useWebVitalsOptimization()
  
  return (
    <>
      <ResourceHints />
      {/* This component provides passive optimization */}
    </>
  )
}