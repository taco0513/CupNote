import React, { useState, useEffect } from 'react'
import { Lightbulb, Coffee, Thermometer, Clock, Zap } from 'lucide-react'

const coffeeTips = [
  {
    icon: Coffee,
    title: "오늘의 커피 팁",
    content: "커피는 로스팅 후 2-4주가 가장 맛있어요. 구매일을 확인해보세요!",
    color: "from-amber-400 to-orange-500"
  },
  {
    icon: Thermometer,
    title: "추출 온도",
    content: "라이트 로스트는 92-96°C, 다크 로스트는 88-92°C가 적당해요.",
    color: "from-blue-400 to-cyan-500"
  },
  {
    icon: Clock,
    title: "골든 타임",
    content: "에스프레소는 추출 후 30초 이내에 마시면 크레마의 풍미를 즐길 수 있어요.",
    color: "from-purple-400 to-pink-500"
  },
  {
    icon: Zap,
    title: "프로 팁",
    content: "원두를 냉동 보관하면 신선도를 더 오래 유지할 수 있어요!",
    color: "from-green-400 to-emerald-500"
  }
]

export default function CoffeeTip() {
  const [currentTip, setCurrentTip] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false)
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % coffeeTips.length)
        setIsVisible(true)
      }, 300)
    }, 10000) // 10초마다 변경

    return () => clearInterval(interval)
  }, [])

  const tip = coffeeTips[currentTip]
  const Icon = tip.icon

  return (
    <div 
      className={`
        bg-white rounded-2xl p-6 shadow-sm border border-coffee-100
        transform transition-all duration-300
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
      `}
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${tip.color} flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-coffee-800 mb-1 flex items-center">
            {tip.title}
            <Lightbulb className="h-4 w-4 ml-2 text-yellow-500" />
          </h3>
          <p className="text-sm text-coffee-600 leading-relaxed">
            {tip.content}
          </p>
        </div>
      </div>
      
      {/* 인디케이터 */}
      <div className="flex items-center justify-center space-x-1.5 mt-4">
        {coffeeTips.map((_, index) => (
          <div
            key={index}
            className={`
              h-1.5 rounded-full transition-all duration-300
              ${index === currentTip 
                ? 'w-6 bg-coffee-400' 
                : 'w-1.5 bg-coffee-200'
              }
            `}
          />
        ))}
      </div>
    </div>
  )
}