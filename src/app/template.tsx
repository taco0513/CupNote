/**
 * Root Template for App Router
 * Provides consistent layout animations and transitions
 */
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

import { reportWebVitals, observePerformance } from '../lib/web-vitals'

interface TemplateProps {
  children: React.ReactNode
}

export default function Template({ children }: TemplateProps) {
  const pathname = usePathname()

  useEffect(() => {
    // Page view tracking and Web Vitals setup
    if (typeof window !== 'undefined') {
      // Report page views to analytics
      console.log('Page view:', pathname)
      
      // Initialize Web Vitals reporting on first load
      reportWebVitals()
      observePerformance()
    }
  }, [pathname])

  useEffect(() => {
    // Progressive enhancement: Add class for JavaScript-enabled styling
    document.documentElement.classList.add('js-enabled')
    
    // Intersection Observer for progressive image loading
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement
            if (img.dataset.src) {
              img.src = img.dataset.src
              img.classList.remove('lazy')
              imageObserver.unobserve(img)
            }
          }
        })
      })

      // Observe all lazy images
      document.querySelectorAll('img[data-src]').forEach((img) => {
        imageObserver.observe(img)
      })
    }
  }, [])

  return (
    <div className="app-template">
      {/* Page transition wrapper */}
      <div 
        key={pathname}
        className="page-content animate-in fade-in duration-200"
      >
        {children}
      </div>
    </div>
  )
}