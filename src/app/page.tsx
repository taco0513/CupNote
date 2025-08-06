/**
 * 홈페이지 - 설정 페이지와 동일한 구조로 재구성
 */
'use client'

import { useState, useEffect } from 'react'

import ProtectedRoute from '../components/auth/ProtectedRoute'
import Navigation from '../components/Navigation'
import PageLayout from '../components/ui/PageLayout'
import HybridHomePageContent from '../components/pages/HybridHomePageContent'

export default function HomePage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <Navigation showBackButton={false} currentPage="home" />
      <PageLayout showBackground className="!pb-20 md:!pb-8">
        <HybridHomePageContent />
      </PageLayout>
    </ProtectedRoute>
  )
}