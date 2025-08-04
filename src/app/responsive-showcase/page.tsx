/**
 * 반응형 디자인 시스템 쇼케이스
 * 모바일, 태블릿, 데스크탑 브레이크포인트 데모
 */
'use client'

import { useState, useEffect } from 'react'
import { Smartphone, Tablet, Monitor, Coffee, ChevronRight } from 'lucide-react'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { Card, CardContent } from '../../components/ui/Card'
import { getCurrentBreakpoint } from '../../utils/responsive'

export default function ResponsiveShowcasePage() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState('md')
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    const updateDimensions = () => {
      setWindowWidth(window.innerWidth)
      setCurrentBreakpoint(getCurrentBreakpoint())
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50">
      {/* Header with current viewport info */}
      <div className="bg-white border-b border-coffee-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold text-coffee-800">반응형 디자인 시스템</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-coffee-100 rounded-lg">
                {windowWidth < 768 && <Smartphone className="h-4 w-4" />}
                {windowWidth >= 768 && windowWidth < 1024 && <Tablet className="h-4 w-4" />}
                {windowWidth >= 1024 && <Monitor className="h-4 w-4" />}
                <span className="font-medium">{windowWidth}px</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-100 rounded-lg font-medium">
                {currentBreakpoint.toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-12">
          
          {/* Typography Scale */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Typography Scale</h2>
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-coffee-800">
                  Heading 1
                </h1>
                <p className="text-sm text-coffee-600 mt-2">
                  text-2xl → sm:text-3xl → md:text-4xl → lg:text-5xl → xl:text-6xl
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-coffee-800">
                  Heading 2
                </h2>
                <p className="text-sm text-coffee-600 mt-2">
                  text-xl → sm:text-2xl → md:text-3xl → lg:text-4xl
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-4 sm:p-6">
                <p className="text-sm sm:text-base md:text-base lg:text-lg text-coffee-700">
                  Body text with responsive sizing. 본문 텍스트는 디바이스에 맞춰 최적화됩니다.
                </p>
                <p className="text-sm text-coffee-600 mt-2">
                  text-sm → sm:text-base → lg:text-lg
                </p>
              </div>
            </div>
          </section>

          {/* Button Sizes */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Button Sizes</h2>
            <div className="bg-white rounded-lg p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <UnifiedButton size="xs">XS Button</UnifiedButton>
                <UnifiedButton size="sm">SM Button</UnifiedButton>
                <UnifiedButton size="md">MD Button</UnifiedButton>
                <UnifiedButton size="lg">LG Button</UnifiedButton>
                <UnifiedButton size="xl">XL Button</UnifiedButton>
              </div>
              <p className="text-sm text-coffee-600">
                버튼 크기는 viewport에 따라 자동으로 조절됩니다.
              </p>
            </div>
          </section>

          {/* Grid System */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Grid System</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="bg-white">
                  <CardContent className="p-4 sm:p-6">
                    <div className="text-2xl font-bold text-coffee-700 mb-2">Card {i}</div>
                    <p className="text-sm text-coffee-600">
                      Responsive grid item
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
            <p className="text-sm text-coffee-600 mt-4">
              Mobile: 1 col → Tablet: 2 cols → Desktop: 3 cols → Large: 4 cols
            </p>
          </section>

          {/* Spacing Scale */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Spacing Scale</h2>
            <div className="bg-white rounded-lg">
              <div className="p-4 sm:p-6 md:p-8 lg:p-10">
                <div className="bg-coffee-100 rounded p-4">
                  <p className="text-coffee-700">Responsive padding</p>
                  <p className="text-sm text-coffee-600 mt-2">
                    p-4 → sm:p-6 → md:p-8 → lg:p-10
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Hero Section Example */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Hero Section Example</h2>
            <div className="bg-white rounded-lg p-6 sm:p-8 md:p-12 text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-coffee-800 mb-4">
                커피 한 잔의 기록
              </h1>
              <p className="text-base sm:text-lg md:text-xl text-coffee-600 mb-6 max-w-2xl mx-auto">
                매일의 커피 경험을 기록하고, AI가 분석한 당신만의 취향을 발견하세요
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <UnifiedButton variant="hero" size="lg" icon={<Coffee className="h-5 w-5" />}>
                  시작하기
                </UnifiedButton>
                <UnifiedButton variant="outline" size="lg">
                  더 알아보기
                </UnifiedButton>
              </div>
            </div>
          </section>

          {/* Visibility Classes */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Visibility Classes</h2>
            <div className="space-y-4">
              <Card className="bg-blue-50 block md:hidden">
                <CardContent className="p-4">
                  <Smartphone className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="text-blue-800 font-medium">Mobile Only (block md:hidden)</p>
                  <p className="text-sm text-blue-600">이 카드는 모바일에서만 보입니다</p>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 hidden md:block lg:hidden">
                <CardContent className="p-4">
                  <Tablet className="h-6 w-6 text-green-600 mb-2" />
                  <p className="text-green-800 font-medium">Tablet Only (hidden md:block lg:hidden)</p>
                  <p className="text-sm text-green-600">이 카드는 태블릿에서만 보입니다</p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-50 hidden lg:block">
                <CardContent className="p-4">
                  <Monitor className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="text-purple-800 font-medium">Desktop Only (hidden lg:block)</p>
                  <p className="text-sm text-purple-600">이 카드는 데스크탑에서만 보입니다</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Breakpoint Reference */}
          <section>
            <h2 className="text-2xl sm:text-3xl font-bold text-coffee-800 mb-6">Breakpoint Reference</h2>
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-coffee-100">
                    <th className="px-4 py-3 text-left text-sm font-medium text-coffee-800">Breakpoint</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-coffee-800">Min Width</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-coffee-800">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-coffee-100">
                  <tr className={windowWidth < 640 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">xs</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">375px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Small Mobile</td>
                  </tr>
                  <tr className={windowWidth >= 640 && windowWidth < 768 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">sm</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">640px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Large Mobile</td>
                  </tr>
                  <tr className={windowWidth >= 768 && windowWidth < 1024 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">md</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">768px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Tablet</td>
                  </tr>
                  <tr className={windowWidth >= 1024 && windowWidth < 1280 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">lg</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">1024px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Small Desktop</td>
                  </tr>
                  <tr className={windowWidth >= 1280 && windowWidth < 1536 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">xl</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">1280px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Desktop</td>
                  </tr>
                  <tr className={windowWidth >= 1536 ? 'bg-amber-50' : ''}>
                    <td className="px-4 py-3 text-sm text-coffee-700 font-medium">2xl</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">1536px</td>
                    <td className="px-4 py-3 text-sm text-coffee-600">Large Desktop</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}