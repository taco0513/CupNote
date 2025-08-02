'use client'

import { useState } from 'react'
import { X, Coffee, Star, Camera, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface QuickRecordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuickRecordModal({ isOpen, onClose }: QuickRecordModalProps) {
  const router = useRouter()
  const [coffeeName, setCoffeeName] = useState('')
  const [rating, setRating] = useState(0)
  const [quickNote, setQuickNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleQuickSave = async () => {
    if (!coffeeName || rating === 0) return
    
    setIsSubmitting(true)
    
    // 빠른 저장 로직
    try {
      // TODO: 실제 저장 로직 구현
      console.log('Quick save:', { coffeeName, rating, quickNote })
      
      // 성공 시 상세 페이지로 이동하거나 닫기
      onClose()
    } catch (error) {
      console.error('Quick save failed:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDetailedRecord = () => {
    // 입력한 정보를 가지고 상세 기록 페이지로 이동
    const params = new URLSearchParams({
      name: coffeeName,
      rating: rating.toString(),
      note: quickNote
    })
    router.push(`/mode-selection?${params.toString()}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* 배경 오버레이 */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* 모달 컨텐츠 */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl md:rounded-2xl shadow-xl transform transition-all">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-coffee-800 flex items-center">
            <Coffee className="h-5 w-5 mr-2 text-coffee-600" />
            빠른 커피 기록
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        
        {/* 바디 */}
        <div className="p-6 space-y-6">
          {/* 커피 이름 */}
          <div>
            <label className="text-sm font-medium text-coffee-700 mb-2 block">
              어떤 커피를 마셨나요?
            </label>
            <input
              type="text"
              value={coffeeName}
              onChange={(e) => setCoffeeName(e.target.value)}
              placeholder="예: 에티오피아 예가체프"
              className="w-full px-4 py-3 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-400 focus:border-transparent outline-none transition-all"
              autoFocus
            />
          </div>
          
          {/* 별점 */}
          <div>
            <label className="text-sm font-medium text-coffee-700 mb-2 block">
              맛은 어땠나요?
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          
          {/* 간단 메모 */}
          <div>
            <label className="text-sm font-medium text-coffee-700 mb-2 block">
              한줄평 (선택)
            </label>
            <input
              type="text"
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              placeholder="예: 과일향이 풍부하고 산미가 좋았어요"
              className="w-full px-4 py-3 border border-coffee-200 rounded-xl focus:ring-2 focus:ring-coffee-400 focus:border-transparent outline-none transition-all"
            />
          </div>
          
          {/* 추가 옵션 */}
          <button
            onClick={handleDetailedRecord}
            className="w-full flex items-center justify-between p-4 bg-coffee-50 rounded-xl hover:bg-coffee-100 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <Camera className="h-5 w-5 text-coffee-600" />
              <span className="text-coffee-700">사진, 위치 등 상세 정보 추가</span>
            </div>
            <ChevronRight className="h-5 w-5 text-coffee-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        {/* 액션 버튼 */}
        <div className="p-6 bg-gray-50 rounded-b-2xl">
          <button
            onClick={handleQuickSave}
            disabled={!coffeeName || rating === 0 || isSubmitting}
            className="w-full py-4 bg-coffee-600 text-white rounded-xl font-medium hover:bg-coffee-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? '저장 중...' : '빠르게 저장'}
          </button>
        </div>
      </div>
    </div>
  )
}