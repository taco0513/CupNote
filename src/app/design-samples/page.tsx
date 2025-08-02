/**
 * 디자인 샘플 페이지 - 3가지 방향성 비교
 */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Palette } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/Card'

export default function DesignSamplesPage() {
  const [selectedDesign, setSelectedDesign] = useState<'minimal' | 'premium' | 'social' | null>(null)

  const designs = [
    {
      id: 'hybrid' as const,
      title: '하이브리드 (추천) ⭐',
      subtitle: '미니멀 + 프리미엄 조합',
      description: 'Simple Elegance - 디자인팀 추천 MVP 버전',
      color: 'bg-gradient-to-br from-amber-100 via-coffee-100 to-neutral-100',
      textColor: 'text-coffee-800',
      href: '/design-samples/hybrid',
      isRecommended: true
    },
    {
      id: 'minimal' as const,
      title: '미니멀 저널링',
      subtitle: 'Meta Design 영감',
      description: 'Focus on What Matters - 인지부담 최소화',
      color: 'bg-neutral-100',
      textColor: 'text-neutral-800',
      href: '/design-samples/minimal'
    },
    {
      id: 'premium' as const,
      title: '프리미엄 커피 경험',
      subtitle: 'Apple HIG + Tesla 영감',
      description: 'Craft & Precision - 품질감과 정밀함',
      color: 'bg-gradient-to-br from-coffee-100 to-coffee-200',
      textColor: 'text-coffee-800',
      href: '/design-samples/premium'
    },
    {
      id: 'social' as const,
      title: '소셜 기록 플랫폼',
      subtitle: 'Instagram + Pinterest 영감',
      description: 'Share Your Coffee Story - 커뮤니티 중심',
      color: 'bg-gradient-to-br from-purple-100 to-pink-100',
      textColor: 'text-purple-800',
      href: '/design-samples/social'
    }
  ]

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <header className="flex items-center justify-between mb-8 pt-4">
          <Link href="/" className="flex items-center space-x-2 text-neutral-600 hover:text-neutral-800 transition-colors">
            <ArrowLeft className="h-5 w-5" />
            <span>홈으로</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-coffee-500" />
            <span className="font-medium text-coffee-700">디자인 샘플</span>
          </div>
        </header>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-neutral-800 mb-2">4가지 디자인 방향성</h1>
          <p className="text-neutral-600 mb-2">각각의 디자인을 체험해보세요</p>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
            <span className="text-amber-600 text-sm font-medium">⭐ 하이브리드 버전 추가!</span>
          </div>
        </div>

        {/* Design Options */}
        <div className="space-y-4">
          {designs.map((design) => (
            <Link key={design.id} href={design.href}>
              <Card 
                variant="bordered" 
                hover 
                className={`${design.color} border-2 ${
                  design.isRecommended 
                    ? 'border-amber-300 ring-2 ring-amber-200/50 hover:border-amber-400' 
                    : 'hover:border-coffee-300'
                } transition-all duration-200 transform hover:scale-102 relative`}
              >
                {design.isRecommended && (
                  <div className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    BEST
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center">
                    <h3 className={`text-xl font-bold ${design.textColor} mb-1`}>
                      {design.title}
                    </h3>
                    <p className={`text-sm ${design.textColor} opacity-80 mb-3`}>
                      {design.subtitle}
                    </p>
                    <p className={`text-sm ${design.textColor} opacity-70`}>
                      {design.description}
                    </p>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <span className={`inline-block px-4 py-2 ${design.textColor} ${
                      design.isRecommended ? 'bg-amber-100/70' : 'bg-white/50'
                    } rounded-full text-sm font-medium`}>
                      {design.isRecommended ? '추천 체험하기 ⭐' : '체험해보기 →'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Info */}
        <div className="mt-8 p-4 bg-coffee-50 rounded-xl">
          <p className="text-coffee-700 text-sm text-center">
            💡 각 디자인은 실제 동작하는 프로토타입입니다
          </p>
        </div>
      </div>
    </main>
  )
}