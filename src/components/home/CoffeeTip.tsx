/**
 * Coffee Tip Component - Lazy loaded
 */
'use client'

import { memo, useState, useEffect } from 'react'

const tips = [
  {
    icon: '💡',
    title: '커피 팁',
    content: '매일 같은 시간에 커피를 마시면 더 정확한 맛 평가를 할 수 있어요!'
  },
  {
    icon: '🌡️',
    title: '온도 팁',
    content: '커피는 60-70°C에서 가장 다양한 맛을 느낄 수 있어요.'
  },
  {
    icon: '⏱️',
    title: '추출 팁',
    content: '핸드드립은 2분 30초에서 3분 사이가 적정 추출 시간이에요.'
  },
  {
    icon: '📝',
    title: '기록 팁',
    content: '첫 모금의 느낌을 바로 기록하면 더 생생한 테이스팅 노트를 작성할 수 있어요.'
  }
]

const CoffeeTip = memo(function CoffeeTip() {
  const [currentTip, setCurrentTip] = useState(0)

  useEffect(() => {
    // Random tip on mount
    setCurrentTip(Math.floor(Math.random() * tips.length))
  }, [])

  const tip = tips[currentTip]

  return (
    <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 rounded-lg p-4 border border-neutral-200">
      <div className="flex items-start space-x-3">
        <div className="text-2xl flex-shrink-0" aria-hidden="true">{tip.icon}</div>
        <div>
          <h3 className="font-semibold text-neutral-800 mb-1">{tip.title}</h3>
          <p className="text-sm text-neutral-700">
            {tip.content}
          </p>
        </div>
      </div>
    </div>
  )
})

export default CoffeeTip