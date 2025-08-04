/**
 * Modern Fluid Design System Showcase
 * Container Queries + Fluid Typography + Dynamic Spacing
 * 2024-2025 Best Practices Demo
 */
'use client'

import { useState, useEffect } from 'react'
import { Coffee, Smartphone, Tablet, Monitor, Zap, Sparkles, Target } from 'lucide-react'
import { useResponsive } from '../../hooks/useResponsive'
import FluidText from '../../components/ui/FluidText'
import FluidContainer from '../../components/ui/FluidContainer'
import UnifiedButton from '../../components/ui/UnifiedButton'
import { Card, CardContent } from '../../components/ui/Card'

export default function FluidShowcasePage() {
  const {
    width,
    height,
    breakpoint,
    deviceCategory,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    supportsContainerQueries,
    isHighDensity,
    isReducedMotion,
    isHighContrast,
    respectsUserFontSize,
    isHydrated
  } = useResponsive()

  const [containerWidth, setContainerWidth] = useState(320)

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50">
      {/* Fixed Header with Device Info */}
      <div className="bg-white/90 backdrop-blur-md border-b border-coffee-200 sticky top-0 z-50 shadow-sm">
        <FluidContainer padding="md" maxWidth="2xl">
          <div className="flex flex-col gap-3 py-4">
            <FluidText as="h1" size="2xl" weight="bold" color="primary">
              Fluid Design System 2025
            </FluidText>
            
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {/* Device Icon - Hydration safe */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-coffee-100 rounded-lg">
                {isHydrated && isMobile && <Smartphone className="h-4 w-4" />}
                {isHydrated && isTablet && <Tablet className="h-4 w-4" />}
                {isHydrated && isDesktop && <Monitor className="h-4 w-4" />}
                {!isHydrated && <Monitor className="h-4 w-4" />}
                <span className="font-medium">{width} × {height}</span>
              </div>
              
              {/* Breakpoint */}
              <div className="px-3 py-1.5 bg-amber-100 rounded-lg font-medium">
                {breakpoint.toUpperCase()}
              </div>
              
              {/* Device Category */}
              <div className="px-3 py-1.5 bg-emerald-100 rounded-lg font-medium text-emerald-800">
                {deviceCategory}
              </div>
              
              {/* Orientation */}
              <div className="px-3 py-1.5 bg-blue-100 rounded-lg font-medium text-blue-800">
                {orientation}
              </div>
              
              {/* Features - Hydration safe */}
              {isHydrated && isHighDensity && (
                <div className="px-2 py-1 bg-purple-100 rounded text-purple-800 text-xs font-medium">
                  Hi-DPI
                </div>
              )}
              {isHydrated && isReducedMotion && (
                <div className="px-2 py-1 bg-gray-100 rounded text-gray-800 text-xs font-medium">
                  Reduced Motion
                </div>
              )}
              {isHydrated && supportsContainerQueries && (
                <div className="px-2 py-1 bg-green-100 rounded text-green-800 text-xs font-medium">
                  Container Queries ✓
                </div>
              )}
              {isHydrated && isHighContrast && (
                <div className="px-2 py-1 bg-yellow-100 rounded text-yellow-800 text-xs font-medium">
                  High Contrast
                </div>
              )}
              {isHydrated && respectsUserFontSize && (
                <div className="px-2 py-1 bg-blue-100 rounded text-blue-800 text-xs font-medium">
                  Custom Font Size
                </div>
              )}
            </div>
          </div>
        </FluidContainer>
      </div>

      {/* Main Content */}
      <div className="fluid-padding-inline fluid-margin-block">
        <FluidContainer maxWidth="2xl" className="space-y-12">
          
          {/* Hero Section */}
          <section className="text-center py-8">
            <FluidText as="h1" size="hero" weight="bold" balance className="mb-4">
              <span className="text-coffee-800">Modern </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-coffee-600 to-amber-600">
                Fluid Design
              </span>
            </FluidText>
            
            <FluidText as="p" size="xl" color="secondary" className="mb-8 max-w-3xl mx-auto">
              Container queries, fluid typography, dynamic spacing으로 구현한 
              차세대 반응형 디자인 시스템
            </FluidText>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <UnifiedButton variant="hero" size="lg" icon={<Zap className="h-5 w-5" />}>
                실시간 적응형
              </UnifiedButton>
              <UnifiedButton variant="outline" size="lg" icon={<Sparkles className="h-5 w-5" />}>
                CSS 커스텀 속성
              </UnifiedButton>
            </div>
          </section>

          {/* Fluid Typography Demo */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              Fluid Typography
            </FluidText>
            
            <div className="space-y-6">
              {/* Typography Scale */}
              <Card className="card-container">
                <CardContent className="card-responsive">
                  <div className="space-y-4">
                    <FluidText as="h1" size="display" weight="extrabold" color="primary">
                      Display Text
                    </FluidText>
                    <FluidText as="h2" size="hero" weight="bold" color="secondary">
                      Hero Text
                    </FluidText>
                    <FluidText as="h3" size="5xl" weight="bold">
                      Heading 1
                    </FluidText>
                    <FluidText as="h4" size="3xl" weight="semibold">
                      Heading 2
                    </FluidText>
                    <FluidText as="p" size="lg" lineHeight="relaxed">
                      Large body text with relaxed line height. 
                      Fluid typography automatically adapts to viewport size using CSS clamp().
                    </FluidText>
                    <FluidText as="p" size="base" color="muted">
                      Regular body text with muted color.
                      모든 텍스트는 viewport에 따라 자동으로 크기가 조절됩니다.
                    </FluidText>
                  </div>
                </CardContent>
              </Card>
              
              {/* Custom Clamp Example */}
              <Card>
                <CardContent className="p-6">
                  <FluidText 
                    as="h3" 
                    clamp={['1.5rem', '2vw + 1rem', '3rem']} 
                    weight="bold" 
                    className="mb-4"
                  >
                    Custom Clamp: clamp(1.5rem, 2vw + 1rem, 3rem)
                  </FluidText>
                  <FluidText as="p" size="base" color="muted">
                    직접 clamp 값을 지정하여 더 정밀한 제어가 가능합니다.
                  </FluidText>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Container Queries Demo */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              Container Queries
            </FluidText>
            
            <div className="space-y-6">
              {/* Container Width Slider */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    Container Width: {containerWidth}px
                  </FluidText>
                  <input
                    type="range"
                    min="280"
                    max="800"
                    value={containerWidth}
                    onChange={(e) => setContainerWidth(Number(e.target.value))}
                    className="w-full mb-6"
                  />
                  
                  <div 
                    className="card-container border-2 border-dashed border-coffee-300 p-4"
                    style={{ width: `${containerWidth}px`, maxWidth: '100%' }}
                  >
                    <div className="card-responsive bg-coffee-50 rounded-lg">
                      <FluidText as="h4" size="lg" weight="medium" className="mb-2">
                        Container-based Responsive Card
                      </FluidText>
                      <FluidText as="p" size="sm" color="muted">
                        이 카드의 스타일은 viewport가 아닌 container 크기에 따라 변합니다.
                        Container Query를 지원하는 브라우저에서 확인하세요.
                      </FluidText>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Grid with Container Queries */}
              <div className="fluid-grid">
                {[1, 2, 3, 4].map((i) => (
                  <FluidContainer 
                    key={i} 
                    as="div" 
                    containerName={`grid-item-${i}`}
                    enableContainerQuery
                    className="card-container"
                  >
                    <Card className="h-full">
                      <CardContent className="card-responsive">
                        <div className="flex items-center gap-3 mb-3">
                          <Target className="h-6 w-6 text-coffee-600" />
                          <FluidText as="h4" size="lg" weight="medium">
                            Grid Item {i}
                          </FluidText>
                        </div>
                        <FluidText as="p" size="sm" color="muted">
                          Container query로 개별 그리드 아이템이 
                          독립적으로 반응형 동작을 합니다.
                        </FluidText>
                      </CardContent>
                    </Card>
                  </FluidContainer>
                ))}
              </div>
            </div>
          </section>

          {/* Fluid Spacing Demo */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              Fluid Spacing
            </FluidText>
            
            <div className="space-y-6">
              <Card>
                <CardContent className="fluid-p-xs">
                  <FluidText weight="medium">fluid-p-xs padding</FluidText>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="fluid-p-sm">
                  <FluidText weight="medium">fluid-p-sm padding</FluidText>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="fluid-p-md">
                  <FluidText weight="medium">fluid-p-md padding</FluidText>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="fluid-p-lg">
                  <FluidText weight="medium">fluid-p-lg padding</FluidText>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="fluid-p-xl">
                  <FluidText weight="medium">fluid-p-xl padding</FluidText>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Modern Features */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              2024-2025 Modern Features
            </FluidText>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Aspect Ratios */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    Modern Aspect Ratios
                  </FluidText>
                  <div className="space-y-4">
                    <div className="aspect-fluid bg-gradient-to-r from-coffee-200 to-amber-200 rounded-lg flex items-center justify-center">
                      <FluidText weight="medium">16:9 Fluid</FluidText>
                    </div>
                    <div className="aspect-square bg-gradient-to-r from-emerald-200 to-blue-200 rounded-lg flex items-center justify-center">
                      <FluidText weight="medium">1:1 Square</FluidText>
                    </div>
                    <div className="aspect-portrait bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg flex items-center justify-center">
                      <FluidText weight="medium">3:4 Portrait</FluidText>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Safe Areas */}
              <FluidContainer 
                as={Card}
                safeArea={isMobile}
                className="h-full"
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    Safe Area Support
                  </FluidText>
                  <FluidText as="p" size="base" color="muted" className="flex-1">
                    모바일 디바이스의 노치, 홈 인디케이터 등을 고려한 
                    Safe Area 패딩이 자동으로 적용됩니다.
                  </FluidText>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <FluidText as="p" size="sm" color="accent">
                      {isHydrated && isMobile ? '✓ 모바일에서 Safe Area 적용 중' : 'ℹ️ 모바일에서 확인하세요'}
                    </FluidText>
                  </div>
                </CardContent>
              </FluidContainer>
            </div>
          </section>

          {/* Accessibility Features */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              Accessibility Features
            </FluidText>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Font Size Scaling */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    🔤 Font Size Scaling
                  </FluidText>
                  <FluidText as="p" size="base" color="muted" className="mb-4">
                    사용자의 브라우저 폰트 크기 설정을 자동으로 감지하여 UI 전체 크기를 조정합니다.
                  </FluidText>
                  <div className="space-y-2">
                    <FluidText size="sm">작은 텍스트 (자동 조절)</FluidText>
                    <FluidText size="base">기본 텍스트 (자동 조절)</FluidText>
                    <FluidText size="lg">큰 텍스트 (자동 조절)</FluidText>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <FluidText as="p" size="sm">
                      {isHydrated && respectsUserFontSize 
                        ? '✓ 사용자 지정 폰트 크기 감지됨' 
                        : 'ℹ️ 브라우저 설정에서 폰트 크기를 변경해보세요'}
                    </FluidText>
                  </div>
                </CardContent>
              </Card>
              
              {/* High Contrast Mode */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    🎨 High Contrast Support
                  </FluidText>
                  <FluidText as="p" size="base" color="muted" className="mb-4">
                    고대비 모드에서 자동으로 시스템 색상을 사용하여 가독성을 향상시킵니다.
                  </FluidText>
                  <div className="space-y-2">
                    <div className="p-2 border rounded">일반 모드 색상</div>
                    <div className={`p-2 border rounded ${isHydrated && isHighContrast ? 'fluid-high-contrast' : ''}`}>
                      고대비 모드 색상
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <FluidText as="p" size="sm">
                      {isHydrated && isHighContrast 
                        ? '✓ 고대비 모드 활성화됨' 
                        : 'ℹ️ 시스템 설정에서 고대비 모드를 활성화해보세요'}
                    </FluidText>
                  </div>
                </CardContent>
              </Card>
              
              {/* Reduced Motion */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    🚫 Motion Preferences
                  </FluidText>
                  <FluidText as="p" size="base" color="muted" className="mb-4">
                    애니메이션 감소 설정을 존중하여 모든 애니메이션을 비활성화합니다.
                  </FluidText>
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-full bg-coffee-200 ${!isReducedMotion ? 'animate-bounce' : ''}`}></div>
                    <div className={`w-12 h-12 rounded-full bg-amber-200 ${!isReducedMotion ? 'animate-pulse' : ''}`}></div>
                  </div>
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <FluidText as="p" size="sm">
                      {isHydrated && isReducedMotion 
                        ? '✓ 애니메이션 감소 모드 활성화됨' 
                        : 'ℹ️ 시스템 설정에서 애니메이션 감소를 활성화해보세요'}
                    </FluidText>
                  </div>
                </CardContent>
              </Card>
              
              {/* Screen Reader Support */}
              <Card>
                <CardContent className="p-6">
                  <FluidText as="h3" size="xl" weight="semibold" className="mb-4">
                    📱 Screen Reader Support
                  </FluidText>
                  <FluidText as="p" size="base" color="muted" className="mb-4">
                    의미 있는 HTML 구조와 ARIA 라벨로 스크린 리더 접근성을 보장합니다.
                  </FluidText>
                  <div className="space-y-2">
                    <button 
                      className="px-4 py-2 bg-coffee-100 rounded hover:bg-coffee-200"
                      aria-label="접근성 테스트 버튼 - 커피 주문하기"
                    >
                      커피 주문
                    </button>
                    <div role="status" aria-live="polite" className="text-sm text-coffee-600">
                      상태 업데이트가 스크린 리더에 자동으로 전달됩니다
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <FluidText as="p" size="sm">
                      ✓ ARIA 라벨과 시맨틱 HTML 구조 적용됨
                    </FluidText>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Technical Details */}
          <section>
            <FluidText as="h2" size="3xl" weight="bold" className="mb-6">
              Technical Implementation
            </FluidText>
            
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <FluidText as="h4" size="lg" weight="semibold" className="mb-3">
                      CSS Features
                    </FluidText>
                    <ul className="space-y-2">
                      <li><FluidText size="sm">✓ CSS Custom Properties</FluidText></li>
                      <li><FluidText size="sm">✓ clamp() for fluid typography</FluidText></li>
                      <li><FluidText size="sm">✓ Container queries (@container)</FluidText></li>
                      <li><FluidText size="sm">✓ Logical properties (margin-block, padding-inline)</FluidText></li>
                      <li><FluidText size="sm">✓ Modern aspect-ratio property</FluidText></li>
                      <li><FluidText size="sm">✓ Preference-based queries</FluidText></li>
                    </ul>
                  </div>
                  
                  <div>
                    <FluidText as="h4" size="lg" weight="semibold" className="mb-3">
                      React Integration
                    </FluidText>
                    <ul className="space-y-2">
                      <li><FluidText size="sm">✓ useResponsive hook</FluidText></li>
                      <li><FluidText size="sm">✓ FluidText component</FluidText></li>
                      <li><FluidText size="sm">✓ FluidContainer component</FluidText></li>
                      <li><FluidText size="sm">✓ Device detection</FluidText></li>
                      <li><FluidText size="sm">✓ Safe area support</FluidText></li>
                      <li><FluidText size="sm">✓ High DPI optimization</FluidText></li>
                    </ul>
                  </div>
                  
                  <div>
                    <FluidText as="h4" size="lg" weight="semibold" className="mb-3">
                      Accessibility Features
                    </FluidText>
                    <ul className="space-y-2">
                      <li><FluidText size="sm">✓ User font size scaling</FluidText></li>
                      <li><FluidText size="sm">✓ High contrast mode support</FluidText></li>
                      <li><FluidText size="sm">✓ Reduced motion preferences</FluidText></li>
                      <li><FluidText size="sm">✓ Screen reader compatibility</FluidText></li>
                      <li><FluidText size="sm">✓ ARIA attributes</FluidText></li>
                      <li><FluidText size="sm">✓ Semantic HTML structure</FluidText></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

        </FluidContainer>
      </div>
    </div>
  )
}