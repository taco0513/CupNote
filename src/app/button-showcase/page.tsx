/**
 * Button Showcase - 확장된 UnifiedButton 디자인 시스템 쇼케이스
 */
'use client'

import UnifiedButton from '../../components/ui/UnifiedButton'
import { Coffee, Heart, Download, Share2, Settings, ChevronRight, Sparkles, Trophy, Target } from 'lucide-react'

export default function ButtonShowcasePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-amber-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-coffee-800 mb-2">UnifiedButton Design System</h1>
        <p className="text-coffee-600 mb-8">확장된 버튼 컴포넌트 라이브러리</p>

        {/* Premium Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">Premium Variants</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-coffee-600">Premium (Hero Size)</h3>
              <UnifiedButton 
                variant="premium"
                size="hero"
                shine={true}
                glow={true}
                icon={<Coffee className="h-6 w-6" />}
                arrow={true}
              >
                무료로 시작하기
              </UnifiedButton>

              <UnifiedButton 
                variant="premium"
                size="lg"
                shine={true}
                icon={<Sparkles className="h-5 w-5" />}
              >
                AI 분석 시작
              </UnifiedButton>

              <UnifiedButton 
                variant="premium"
                size="md"
                icon={<Trophy className="h-4 w-4" />}
              >
                성취 확인
              </UnifiedButton>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-coffee-600">Premium Outline</h3>
              <UnifiedButton 
                variant="premium-outline"
                size="hero"
                glow={true}
              >
                먼저 체험하기 👀
              </UnifiedButton>

              <UnifiedButton 
                variant="premium-outline"
                size="lg"
                icon={<Heart className="h-5 w-5" />}
              >
                위시리스트 추가
              </UnifiedButton>

              <UnifiedButton 
                variant="premium-outline"
                size="md"
                arrow={true}
              >
                더 알아보기
              </UnifiedButton>
            </div>
          </div>
        </section>

        {/* Gradient Variants */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">Gradient Variants</h2>
          <div className="flex flex-wrap gap-4">
            <UnifiedButton 
              variant="gradient"
              size="lg"
              shine={true}
              glow={true}
              icon={<Sparkles className="h-5 w-5" />}
            >
              AI 추천 받기
            </UnifiedButton>

            <UnifiedButton 
              variant="gradient"
              size="md"
              icon={<Target className="h-4 w-4" />}
            >
              목표 설정
            </UnifiedButton>

            <UnifiedButton 
              variant="gradient"
              size="sm"
            >
              프리미엄 업그레이드
            </UnifiedButton>
          </div>
        </section>

        {/* Size Variations */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">Size Variations</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">Hero:</span>
              <UnifiedButton variant="primary" size="hero">Hero Size Button</UnifiedButton>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">XL:</span>
              <UnifiedButton variant="primary" size="xl">Extra Large Button</UnifiedButton>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">Large:</span>
              <UnifiedButton variant="primary" size="lg">Large Button</UnifiedButton>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">Medium:</span>
              <UnifiedButton variant="primary" size="md">Medium Button</UnifiedButton>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">Small:</span>
              <UnifiedButton variant="primary" size="sm">Small Button</UnifiedButton>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-coffee-600 w-20">XS:</span>
              <UnifiedButton variant="primary" size="xs">XS Button</UnifiedButton>
            </div>
          </div>
        </section>

        {/* Icon Positions */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">Icon & Arrow Options</h2>
          <div className="grid grid-cols-3 gap-4">
            <UnifiedButton 
              variant="primary"
              size="lg"
              icon={<Coffee className="h-5 w-5" />}
              iconPosition="left"
            >
              Icon Left
            </UnifiedButton>

            <UnifiedButton 
              variant="primary"
              size="lg"
              icon={<Settings className="h-5 w-5" />}
              iconPosition="right"
            >
              Icon Right
            </UnifiedButton>

            <UnifiedButton 
              variant="primary"
              size="lg"
              arrow={true}
            >
              With Arrow
            </UnifiedButton>

            <UnifiedButton 
              variant="secondary"
              size="lg"
              icon={<Download className="h-5 w-5" />}
              arrow={true}
            >
              Both
            </UnifiedButton>

            <UnifiedButton 
              variant="outline"
              size="lg"
              icon={<Share2 className="h-5 w-5" />}
            >
              Share
            </UnifiedButton>

            <UnifiedButton 
              variant="ghost"
              size="lg"
              arrow={true}
            >
              Learn More
            </UnifiedButton>
          </div>
        </section>

        {/* Special Effects */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">Special Effects</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <UnifiedButton 
                variant="premium"
                size="md"
                shine={true}
              >
                Shine Effect
              </UnifiedButton>
              <p className="text-xs text-coffee-600 mt-2">shine={true}</p>
            </div>

            <div className="text-center">
              <UnifiedButton 
                variant="primary"
                size="md"
                glow={true}
              >
                Glow Effect
              </UnifiedButton>
              <p className="text-xs text-coffee-600 mt-2">glow={true}</p>
            </div>

            <div className="text-center">
              <UnifiedButton 
                variant="primary"
                size="md"
                ripple={true}
              >
                Ripple Effect
              </UnifiedButton>
              <p className="text-xs text-coffee-600 mt-2">ripple={true}</p>
            </div>

            <div className="text-center">
              <UnifiedButton 
                variant="premium"
                size="md"
                shine={true}
                glow={true}
              >
                All Effects
              </UnifiedButton>
              <p className="text-xs text-coffee-600 mt-2">Combined</p>
            </div>
          </div>
        </section>

        {/* States */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-coffee-700 mb-6">States</h2>
          <div className="flex gap-4">
            <UnifiedButton variant="primary" size="lg">
              Normal
            </UnifiedButton>
            
            <UnifiedButton variant="primary" size="lg" loading={true}>
              Loading
            </UnifiedButton>
            
            <UnifiedButton variant="primary" size="lg" disabled={true}>
              Disabled
            </UnifiedButton>

            <UnifiedButton variant="primary" size="lg" fullWidth={true}>
              Full Width
            </UnifiedButton>
          </div>
        </section>
      </div>
    </div>
  )
}