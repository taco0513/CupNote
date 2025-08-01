'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check,
  ArrowLeft, 
  Edit3,
  Smile,
  Clock
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'
import { SupabaseStorage } from '../../../../lib/supabase-storage'
import { useAuth } from '../../../../contexts/AuthContext'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe'
}

interface CafeData {
  cafe_name: string
  cafe_location?: string
  coffee_name: string
  price?: string
  temperature: 'hot' | 'iced'
  origin?: string
  roast_level?: string
  processing?: string
}

// Foundation 문서의 빠른 표현 및 감정 태그 (홈카페와 동일)
const QUICK_EXPRESSIONS = [
  '아침에 좋을 것 같다',
  '다시 마시고 싶다', 
  '친구에게 추천하고 싶다',
  '특별한 날에 어울린다',
  '집중할 때 좋을 것 같다',
  '편안한 느낌이다',
  '새로운 경험이었다',
  '기대보다 좋았다'
]

const EMOTION_TAGS = [
  { emoji: '😊', label: '만족' },
  { emoji: '😍', label: '최고' },
  { emoji: '😌', label: '편안함' },
  { emoji: '🤔', label: '흥미로움' },
  { emoji: '😋', label: '맛있음' },
  { emoji: '✨', label: '특별함' },
  { emoji: '💭', label: '생각나는' },
  { emoji: '🎯', label: '집중' },
  { emoji: '☕', label: '일상' }
]

export default function CafeStep4Page() {
  const router = useRouter()
  const { user } = useAuth()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [cafeData, setCafeData] = useState<CafeData | null>(null)
  const [flavorSelection, setFlavorSelection] = useState<any>(null)
  const [sensoryExpressions, setSensoryExpressions] = useState<any>(null)
  
  const [commentText, setCommentText] = useState('')
  const [selectedQuickExpressions, setSelectedQuickExpressions] = useState<string[]>([])
  const [selectedEmotionTags, setSelectedEmotionTags] = useState<string[]>([])
  
  const [submitting, setSubmitting] = useState(false)
  const [startTime] = useState(Date.now())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  useEffect(() => {
    // 모든 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const savedCafe = sessionStorage.getItem('cafeStep1')
    const savedStep2 = sessionStorage.getItem('cafeStep2')
    const savedStep3 = sessionStorage.getItem('cafeStep3')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'cafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (savedCafe) {
      setCafeData(JSON.parse(savedCafe))
    } else {
      router.push('/record/cafe/step1')
      return
    }

    if (savedStep2) {
      setFlavorSelection(JSON.parse(savedStep2))
    }

    if (savedStep3) {
      setSensoryExpressions(JSON.parse(savedStep3))
    }

    // 드래프트 복구
    const draft = sessionStorage.getItem('cafeDraft')
    if (draft) {
      const draftData = JSON.parse(draft)
      setCommentText(draftData.commentText || '')
      setSelectedQuickExpressions(draftData.selectedQuickExpressions || [])
      setSelectedEmotionTags(draftData.selectedEmotionTags || [])
    }
  }, [router])

  // Foundation 문서의 자동 저장 기능
  const saveDraft = useCallback((data: any) => {
    setAutoSaveStatus('saving')
    sessionStorage.setItem('cafeDraft', JSON.stringify(data))
    setTimeout(() => setAutoSaveStatus('saved'), 500)
  }, [])

  // 10초마다 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      const draftData = {
        commentText,
        selectedQuickExpressions,
        selectedEmotionTags
      }
      if (commentText || selectedQuickExpressions.length > 0 || selectedEmotionTags.length > 0) {
        saveDraft(draftData)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [commentText, selectedQuickExpressions, selectedEmotionTags, saveDraft])

  // Foundation 문서의 빠른 표현 선택
  const handleQuickExpressionToggle = (expression: string) => {
    setSelectedQuickExpressions(prev => {
      if (prev.includes(expression)) {
        return prev.filter(expr => expr !== expression)
      }
      return [...prev, expression]
    })
  }

  // Foundation 문서의 감정 태그 선택
  const handleEmotionTagToggle = (emoji: string) => {
    setSelectedEmotionTags(prev => {
      if (prev.includes(emoji)) {
        return prev.filter(tag => tag !== emoji)
      }
      return [...prev, emoji]
    })
  }

  const getTimeOfDay = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon' 
    if (hour < 22) return 'evening'
    return 'night'
  }

  const handleSubmit = async () => {
    if (!step1Data || !cafeData) return

    try {
      setSubmitting(true)

      // Foundation 문서의 출력 데이터 구조
      const personalComment = {
        comment_text: commentText,
        quick_expressions: selectedQuickExpressions,
        emotion_tags: selectedEmotionTags,
        context_info: {
          time_of_day: getTimeOfDay()
        },
        writing_duration: Math.round((Date.now() - startTime) / 1000),
        character_count: commentText.length,
        created_at: new Date()
      }

      // 향미 선택 데이터를 FlavorProfile[] 형식으로 변환
      const convertedFlavors = flavorSelection?.selectedFlavors?.map((flavorChoice, index) => ({
        id: `sca-${flavorChoice.level2}-${index}`,
        name: flavorChoice.level2, // Level 2 ID를 이름으로 사용 (임시)
        category: 'other' as const, // FlavorCategory에 맞는 값
        intensity: 3 // 기본값
      })) || []

      // 감각 표현 데이터를 SensoryExpression[] 형식으로 변환
      const convertedSensoryExpressions = Object.entries(sensoryExpressions?.expressions || {})
        .map(([category, expressions]) => ({
          category: category as 'acidity' | 'sweetness' | 'body' | 'aftertaste',
          expressions: expressions as string[]
        }))
        .filter(item => 
          ['acidity', 'sweetness', 'body', 'aftertaste'].includes(item.category)
        )

      // 모든 데이터를 통합하여 저장 (CoffeeRecord 인터페이스에 맞춤)
      const recordToSubmit = {
        coffeeName: cafeData.coffee_name,
        roastery: cafeData.cafe_name,
        date: step1Data.date,
        mode: step1Data.mode as 'cafe' | 'homecafe',
        
        // 통합 맛 기록 (필수 필드)
        taste: [
          ...selectedQuickExpressions,
          commentText.trim()
        ].filter(Boolean).join(', ') || '카페에서 마신 커피',
        
        rating: 5, // 임시값, 실제로는 별점 입력 필요
        tasteMode: 'professional' as const,
        
        // 선택적 필드들
        origin: cafeData.origin,
        roastLevel: cafeData.roast_level,
        temperature: (cafeData.temperature as 'hot' | 'iced') || 'hot',
        memo: commentText || undefined,
        
        // 향미 선택 데이터 (FlavorProfile[] 형식)
        selectedFlavors: convertedFlavors,
        
        // 감각 표현 데이터 (SensoryExpression[] 형식)
        sensoryExpressions: convertedSensoryExpressions,
        
        // 태그 데이터
        tags: selectedEmotionTags,
        
        // Cafe 모드 특화 데이터
        cafeData: {
          cafeName: cafeData.cafe_name,
          cafeLocation: cafeData.cafe_location,
          menuName: cafeData.coffee_name,
          price: cafeData.price ? parseFloat(cafeData.price) : undefined,
          atmosphere: undefined // 현재 단계에서는 없음
        },
        
        // 이미지는 현재 없음
        images: undefined
      }

      console.log('Cafe 기록 저장 데이터:', recordToSubmit)

      // Supabase에 저장
      console.log('저장 시도 중...')
      console.log('완전한 저장 데이터:', JSON.stringify(recordToSubmit, null, 2))
      
      // 디버그: 현재 인증 상태 확인
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { data: authData, error: authError } = await supabase.auth.getUser()
      console.log('현재 인증 상태:', authData, authError)
      console.log('AuthContext 사용자:', user)
      
      // 로그인 상태에 따라 다른 저장 방법 사용
      let result
      if (user) {
        console.log('로그인된 사용자 - addRecordWithAchievements 사용')
        result = await SupabaseStorage.addRecordWithAchievements(recordToSubmit)
      } else {
        console.log('게스트 모드 - addGuestRecord 사용')
        result = await SupabaseStorage.addGuestRecord(recordToSubmit)
      }
      console.log('저장 결과:', result)
      
      const savedRecord = result.record

      if (!savedRecord) {
        console.error('저장 결과가 null입니다. 전체 결과:', result)
        console.error('newAchievements:', result.newAchievements)
        throw new Error('기록 저장에 실패했습니다 - Supabase에서 null 반환')
      }

      console.log('Cafe 기록 저장 성공:', savedRecord)

      // 다른 컴포넌트에 변경사항 알림
      window.dispatchEvent(new CustomEvent('cupnote-record-added'))

      // 세션 스토리지 정리
      sessionStorage.removeItem('recordStep1')
      sessionStorage.removeItem('cafeStep1')
      sessionStorage.removeItem('cafeStep2')
      sessionStorage.removeItem('cafeStep3')
      sessionStorage.removeItem('cafeDraft')

      // 결과 페이지로 이동
      router.push(`/result?id=${savedRecord.id}`)
    } catch (error) {
      console.error('기록 저장 오류 상세:', error)
      console.error('오류 스택:', error instanceof Error ? error.stack : 'Unknown error')
      console.error('전송한 데이터:', JSON.stringify({
        coffeeName: cafeData.coffee_name,
        roastery: cafeData.cafe_name,
        hasFlavorSelection: !!flavorSelection,
        hasSensoryExpressions: !!sensoryExpressions
      }))
      alert(`기록 저장 중 오류가 발생했습니다: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/record/cafe/step3')
  }

  if (!step1Data || !cafeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-800">개인 코멘트</h1>
            <div className="text-sm text-blue-600">4 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            ></div>
          </div>

          {/* 완료 메시지 */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <Check className="h-4 w-4" />
              <span>모든 정보 입력 완료</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Foundation 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Edit3 className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">이 커피에 대한 개인적인 생각을 자유롭게 적어보세요</h2>
            <p className="text-blue-600 mb-4">특별한 순간이나 느낌을 기록해두면 좋은 추억이 됩니다</p>
          </div>

          {/* Foundation 문서의 메인 입력 영역 */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            {/* 자유 텍스트 입력 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  자유 코멘트 (선택사항)
                </label>
                <div className="flex items-center space-x-2">
                  {/* Foundation 문서의 자동 저장 상태 */}
                  {autoSaveStatus === 'saving' && (
                    <span className="text-xs text-gray-500">저장 중...</span>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <span className="text-xs text-blue-500">자동 저장됨</span>
                  )}
                  {/* Foundation 문서의 글자 수 카운터 */}
                  <span className="text-sm text-gray-500">
                    {commentText.length}/200
                  </span>
                </div>
              </div>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={200}
                placeholder="예) 카페 분위기가 너무 좋았다. 커피도 생각보다 산미가 강해서 좋았고, 다음에 또 오고 싶다..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </div>

            {/* Foundation 문서의 빠른 입력 도구 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                자주 사용하는 표현 (선택사항)
              </label>
              <div className="flex flex-wrap gap-2">
                {QUICK_EXPRESSIONS.map((expression) => (
                  <button
                    key={expression}
                    onClick={() => handleQuickExpressionToggle(expression)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedQuickExpressions.includes(expression)
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-500'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    {expression}
                  </button>
                ))}
              </div>
            </div>

            {/* Foundation 문서의 감정 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                감정 태그 (선택사항)
              </label>
              <div className="grid grid-cols-5 gap-3">
                {EMOTION_TAGS.map((tag) => (
                  <button
                    key={tag.emoji}
                    onClick={() => handleEmotionTagToggle(tag.emoji)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedEmotionTags.includes(tag.emoji)
                        ? 'border-blue-500 bg-blue-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{tag.emoji}</div>
                    <div className="text-xs text-gray-600">{tag.label}</div>
                  </button>
                ))}
              </div>
            </div>


            {/* 컨텍스트 정보 표시 */}
            <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {getTimeOfDay() === 'morning' ? '오전' :
                     getTimeOfDay() === 'afternoon' ? '오후' :
                     getTimeOfDay() === 'evening' ? '저녁' : '밤'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Smile className="h-4 w-4" />
                  <span>카페</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            이전
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-2 py-4 px-8 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Check className="h-5 w-5 mr-2" />
                기록 완료하기
              </>
            )}
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-blue-500">
            저장 후: Match Score 결과 및 개인화된 피드백 확인
          </p>
        </div>
      </div>
    </div>
  )
}