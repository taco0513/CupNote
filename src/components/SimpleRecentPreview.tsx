'use client'

import Link from 'next/link'

import { Coffee, ArrowRight } from 'lucide-react'

// 임시로 매우 간단한 버전
export default function SimpleRecentPreview() {
  return (
    <div className="space-y-4">
      {/* 기록이 없을 때의 상태 */}
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <Coffee className="h-16 w-16 text-coffee-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-coffee-800 mb-2">
          아직 기록이 없습니다
        </h3>
        <p className="text-coffee-600 mb-6">
          첫 번째 커피 기록을 작성해보세요!
        </p>
        <Link
          href="/mode-selection"
          className="inline-flex items-center space-x-2 bg-coffee-600 text-white px-6 py-3 rounded-full hover:bg-coffee-700 transition-colors"
        >
          <Coffee className="h-5 w-5" />
          <span>기록 작성하기</span>
        </Link>
      </div>

      {/* 모든 기록 보기 버튼 */}
      <Link
        href="/records"
        className="block w-full p-4 bg-coffee-50 hover:bg-coffee-100 rounded-xl transition-colors group"
      >
        <div className="flex items-center justify-center space-x-2 text-coffee-700">
          <span className="font-medium">모든 커피 기록 보기</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </Link>
    </div>
  )
}