/**
 * Rotating Coffee Fact Component
 * 커피 관련 재미있는 사실들을 순환하며 보여줍니다
 */
'use client'

import { useState, useEffect } from 'react'

import { Lightbulb } from 'lucide-react'

import { Card, CardContent } from '../ui/Card'

const coffeeFacts = [
  "에스프레소는 '빠르다'는 뜻의 이탈리아어에서 유래했어요",
  "커피 체리 안에는 보통 2개의 원두가 들어있어요",
  "핀란드는 1인당 커피 소비량이 가장 많은 나라예요",
  "커피나무는 최대 100년까지 살 수 있어요",
  "디카페인 커피에도 약간의 카페인이 들어있어요",
  "커피는 세계에서 두 번째로 많이 거래되는 상품이에요",
  "브라질은 전 세계 커피의 약 1/3을 생산해요",
  "커피 원두는 사실 씨앗이에요",
  "아이스 커피는 뜨거운 커피보다 더 많은 카페인을 함유할 수 있어요",
  "에티오피아가 커피의 원산지로 알려져 있어요"
]

export default function RotatingCoffeeFact() {
  const [currentFactIndex, setCurrentFactIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % coffeeFacts.length)
    }, 10000) // 10초마다 변경

    return () => clearInterval(interval)
  }, [])

  return (
    <Card variant="default" className="bg-gradient-to-r from-neutral-50 to-neutral-100">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent-warm/20 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="h-4 w-4 text-accent-warm" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-800 mb-1">알고 계셨나요?</h3>
            <p className="text-sm text-neutral-700">{coffeeFacts[currentFactIndex]}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}