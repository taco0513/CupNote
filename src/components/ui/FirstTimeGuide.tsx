/**
 * 첫 사용자를 위한 가이드 컴포넌트
 */
'use client'

import { Coffee, ArrowDown } from 'lucide-react'
import { Card, CardContent } from './Card'
import UnifiedButton from './UnifiedButton'

interface FirstTimeGuideProps {
  onStartRecord?: () => void
}

export default function FirstTimeGuide({ onStartRecord }: FirstTimeGuideProps) {
  return (
    <Card className="max-w-md mx-auto mb-8 bg-gradient-to-br from-coffee-50 to-coffee-100 border-coffee-200">
      <CardContent className="text-center p-6">
        <div className="w-16 h-16 mx-auto bg-coffee-400/20 rounded-full flex items-center justify-center mb-4">
          <Coffee className="h-8 w-8 text-coffee-500" />
        </div>
        
        <h3 className="text-lg font-semibold text-coffee-800 mb-2">
          첫 커피 기록을 시작해보세요! 
        </h3>
        
        <p className="text-coffee-700 text-sm mb-4 leading-relaxed">
          어려운 전문 용어는 필요 없어요. <br />
          오늘 마신 커피가 어땠는지 자유롭게 기록해보세요.
        </p>

        <div className="flex items-center justify-center space-x-2 mb-4">
          <ArrowDown className="h-4 w-4 text-coffee-400 animate-bounce" />
          <span className="text-xs text-coffee-600">아래 버튼을 눌러보세요</span>
          <ArrowDown className="h-4 w-4 text-coffee-400 animate-bounce" />
        </div>

        <div className="space-y-2 text-xs text-coffee-600">
          <div className="flex items-center justify-center space-x-2">
            <span>✨</span>
            <span>간단한 정보만으로도 OK</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <span>📈</span>
            <span>기록할수록 내 취향이 보여요</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}