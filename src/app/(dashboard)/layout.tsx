/**
 * Dashboard Layout for App Router
 * Groups authenticated pages with shared optimizations
 */
import { Suspense } from 'react'
import type { Metadata } from 'next'

import DashboardLayoutContent from '../../components/layouts/DashboardLayoutContent'

// Route group config
export const dynamic = 'force-dynamic' // Auth-required pages need dynamic rendering
export const revalidate = 0

// Shared metadata for dashboard pages
export const metadata: Metadata = {
  robots: {
    index: false, // Private user data
    follow: false
  }
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600"></div>
      </div>
    }>
      <DashboardLayoutContent>
        {children}
      </DashboardLayoutContent>
    </Suspense>
  )
}