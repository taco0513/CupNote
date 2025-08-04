/**
 * 커피 취향 인사이트 카드 컴포넌트
 * 사용자의 커피 기록을 분석하여 텍스트 기반 인사이트 제공
 */
'use client'

import { useState, useEffect } from 'react'
import { Brain, TrendingUp, Coffee, Calendar, Lightbulb, ChevronRight, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '../ui/Card'

interface InsightData {
  title: string
  content: string
  type: 'preference' | 'trend' | 'recommendation' | 'discovery'
  confidence: number // 0-100
  icon?: React.ReactNode
}

interface InsightCardProps {
  records?: any[] // 커피 기록 데이터
  className?: string
}

// 샘플 인사이트 생성 함수
const generateInsights = (records: any[]): InsightData[] => {
  const insights: InsightData[] = []
  
  // 취향 분석
  insights.push({
    title: '당신의 커피 취향',
    content: '밝은 산미와 플로럴한 향을 선호하시는군요! 특히 에티오피아와 케냐 원두에서 높은 만족도를 보이셨어요. 가볍고 상큼한 커피를 즐기시는 타입이에요.',
    type: 'preference',
    confidence: 87,
    icon: <Coffee className="h-5 w-5" />
  })

  // 트렌드 분석
  insights.push({
    title: '최근 변화',
    content: '지난 달에 비해 미디엄 로스팅 커피를 더 자주 마시고 계시네요. 다크 로스팅 20% → 미디엄 로스팅 65%로 변화했어요. 더 다양한 맛을 탐험하고 계신 것 같아요!',
    type: 'trend',
    confidence: 92,
    icon: <TrendingUp className="h-5 w-5" />
  })

  // 추천
  insights.push({
    title: '이런 커피는 어떠세요?',
    content: '콜롬비아 게이샤나 파나마 게이샤를 시도해보세요. 당신이 좋아하는 플로럴 노트와 밝은 산미를 가지면서도 더 복잡한 향미를 경험할 수 있을 거예요.',
    type: 'recommendation',
    confidence: 78,
    icon: <Lightbulb className="h-5 w-5" />
  })

  // 발견
  insights.push({
    title: '흥미로운 발견',
    content: '오전에 마신 커피의 평점이 오후보다 평균 0.5점 높네요! 아침의 첫 커피가 특별한 의미를 가지시는 것 같아요. 컨디션이 좋을 때 커피 맛도 더 좋게 느껴지나봐요.',
    type: 'discovery',
    confidence: 85,
    icon: <Brain className="h-5 w-5" />
  })

  return insights
}

export default function InsightCard({ records = [], className = '' }: InsightCardProps) {
  const [insights, setInsights] = useState<InsightData[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    // 실제 구현시에는 records를 분석하여 인사이트 생성
    const generatedInsights = generateInsights(records)
    setInsights(generatedInsights)
  }, [records])

  const nextInsight = () => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length)
      setIsAnimating(false)
    }, 200)
  }

  const getTypeColor = (type: InsightData['type']) => {
    switch (type) {
      case 'preference': return 'from-blue-500 to-blue-600'
      case 'trend': return 'from-green-500 to-green-600'
      case 'recommendation': return 'from-purple-500 to-purple-600'
      case 'discovery': return 'from-amber-500 to-amber-600'
      default: return 'from-coffee-500 to-coffee-600'
    }
  }

  const getTypeBgColor = (type: InsightData['type']) => {
    switch (type) {
      case 'preference': return 'bg-blue-50'
      case 'trend': return 'bg-green-50'
      case 'recommendation': return 'bg-purple-50'
      case 'discovery': return 'bg-amber-50'
      default: return 'bg-coffee-50'
    }
  }

  if (insights.length === 0) {
    return (
      <Card className={`bg-white/90 backdrop-blur-sm border border-coffee-200/40 shadow-lg ${className}`}>
        <CardContent className="p-6">
          <div className="text-center text-coffee-600">
            <Coffee className="h-8 w-8 mx-auto mb-3 text-coffee-400" />
            <p className="text-sm">기록이 더 쌓이면 인사이트를 제공해드릴게요!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentInsight = insights[currentIndex]

  return (
    <Card className={`bg-white/90 backdrop-blur-sm border border-coffee-200/40 shadow-lg overflow-hidden ${className}`}>
      <div className={`h-1 bg-gradient-to-r ${getTypeColor(currentInsight.type)}`} />
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 ${getTypeBgColor(currentInsight.type)} rounded-xl flex items-center justify-center`}>
              {currentInsight.icon || <Brain className="h-5 w-5 text-coffee-600" />}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-coffee-800">
                {currentInsight.title}
              </h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className="flex space-x-1">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className={`h-1 w-6 rounded-full ${
                        i < Math.floor(currentInsight.confidence / 25)
                          ? `bg-gradient-to-r ${getTypeColor(currentInsight.type)}`
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-coffee-600">
                  신뢰도 {currentInsight.confidence}%
                </span>
              </div>
            </div>
          </div>
          
          <button
            onClick={nextInsight}
            className="p-2 hover:bg-coffee-50 rounded-lg transition-colors"
            aria-label="다음 인사이트"
          >
            <RefreshCw className={`h-4 w-4 text-coffee-600 ${isAnimating ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className={`transition-opacity duration-200 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
          <p className="text-coffee-700 leading-relaxed mb-4">
            {currentInsight.content}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            {insights.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  index === currentIndex 
                    ? `w-6 bg-gradient-to-r ${getTypeColor(currentInsight.type)}`
                    : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`인사이트 ${index + 1}`}
              />
            ))}
          </div>
          
          <button className="text-sm text-coffee-600 hover:text-coffee-700 flex items-center space-x-1 hover:underline">
            <span>더 자세히</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </CardContent>
    </Card>
  )
}