'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Check,
  ArrowLeft, 
  Edit3,
  Smile,
  Clock,
  Save
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'
import { SupabaseStorage } from '../../../../lib/supabase-storage'
import RecipeSaveDialog from '../../../../components/RecipeSaveDialog'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'pro'
}

interface HomeCafeData {
  dripper: string
  coffeeAmount: number
  waterAmount: number
  ratio: number
  grindSize?: string
  grinderBrand?: string
  grinderModel?: string
  grinderSetting?: string
  waterTemp?: number
  brewTime?: number
  notes?: string
  timerData?: any
}

// Foundation 문서의 빠른 표현 및 감정 태그
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

export default function HomeCafeStep5Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [homeCafeData, setHomeCafeData] = useState<HomeCafeData | null>(null)
  const [flavorSelection, setFlavorSelection] = useState<any>(null)
  const [sensoryExpressions, setSensoryExpressions] = useState<any>(null)
  
  const [commentText, setCommentText] = useState('')
  const [selectedQuickExpressions, setSelectedQuickExpressions] = useState<string[]>([])
  const [selectedEmotionTags, setSelectedEmotionTags] = useState<string[]>([])
  const [companion, setCompanion] = useState<string>('')
  
  const [submitting, setSubmitting] = useState(false)
  const [showRecipeSave, setShowRecipeSave] = useState(false)
  const [startTime] = useState(Date.now())
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'unsaved'>('saved')

  useEffect(() => {
    // 모든 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const savedHomeCafe = sessionStorage.getItem('recordHomeCafe')
    const savedStep3 = sessionStorage.getItem('homecafeStep3')
    const savedStep4 = sessionStorage.getItem('homecafeStep4')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'homecafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (savedHomeCafe) {
      setHomeCafeData(JSON.parse(savedHomeCafe))
    } else {
      router.push('/record/homecafe')
      return
    }

    if (savedStep3) {
      setFlavorSelection(JSON.parse(savedStep3))
    }

    if (savedStep4) {
      setSensoryExpressions(JSON.parse(savedStep4))
    }

    // 드래프트 복구
    const draft = sessionStorage.getItem('homecafeDraft')
    if (draft) {
      const draftData = JSON.parse(draft)
      setCommentText(draftData.commentText || '')
      setSelectedQuickExpressions(draftData.selectedQuickExpressions || [])
      setSelectedEmotionTags(draftData.selectedEmotionTags || [])
      setCompanion(draftData.companion || '')
    }
  }, [router])

  // Foundation 문서의 자동 저장 기능
  const saveDraft = useCallback((data: any) => {
    setAutoSaveStatus('saving')
    sessionStorage.setItem('homecafeDraft', JSON.stringify(data))
    setTimeout(() => setAutoSaveStatus('saved'), 500)
  }, [])

  // 10초마다 자동 저장
  useEffect(() => {
    const interval = setInterval(() => {
      const draftData = {
        commentText,
        selectedQuickExpressions,
        selectedEmotionTags, 
        companion
      }
      if (commentText || selectedQuickExpressions.length > 0 || selectedEmotionTags.length > 0 || companion) {
        saveDraft(draftData)
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [commentText, selectedQuickExpressions, selectedEmotionTags, companion, saveDraft])

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

  const handleRecipeSave = () => {
    setShowRecipeSave(true)
  }

  const handleRecipeSaved = () => {
    setShowRecipeSave(false)
    // 성공 메시지 표시
    alert('레시피가 성공적으로 저장되었습니다!')
  }

  const handleSubmit = async () => {
    if (!step1Data || !homeCafeData) return

    try {
      setSubmitting(true)

      // Foundation 문서의 출력 데이터 구조
      const personalComment = {
        comment_text: commentText,
        quick_expressions: selectedQuickExpressions,
        emotion_tags: selectedEmotionTags,
        context_info: {
          time_of_day: getTimeOfDay(),
          companion: companion || 'alone'
        },
        writing_duration: Math.round((Date.now() - startTime) / 1000),
        character_count: commentText.length,
        created_at: new Date()
      }

      // 모든 데이터를 통합하여 저장
      const recordToSubmit = {
        coffeeName: step1Data.coffeeName,
        roastery: step1Data.roastery || '',
        date: step1Data.date,
        mode: step1Data.mode,
        
        // HomeCafe 특화 데이터
        homecafeData: {
          ...homeCafeData,
          satisfaction: 5 // 임시값, 실제로는 별점 입력 필요
        },
        
        // 향미 선택 데이터
        selectedFlavors: flavorSelection?.selected_flavors || [],
        
        // 감각 표현 데이터
        sensoryExpressions: sensoryExpressions?.expressions || {},
        
        // 개인 코멘트
        personalComment,
        
        // 통합 맛 기록
        taste: [
          ...selectedQuickExpressions,
          commentText
        ].filter(Boolean).join(', ') || '기록 없음',
        
        rating: 5, // 임시값
        tasteMode: 'professional' as const
      }

      // Supabase에 저장
      const result = await SupabaseStorage.addRecordWithAchievements(recordToSubmit)
      const savedRecord = result.record

      if (!savedRecord) {
        throw new Error('기록 저장에 실패했습니다')
      }

      console.log('HomeCafe 기록 저장됨:', savedRecord)

      // 다른 컴포넌트에 변경사항 알림
      window.dispatchEvent(new CustomEvent('cupnote-record-added'))

      // 세션 스토리지 정리
      sessionStorage.removeItem('recordStep1')
      sessionStorage.removeItem('recordHomeCafe')
      sessionStorage.removeItem('homecafeStep3')
      sessionStorage.removeItem('homecafeStep4')
      sessionStorage.removeItem('homecafeDraft')

      // 결과 페이지로 이동
      router.push(`/result?id=${savedRecord.id}`)
    } catch (error) {
      console.error('기록 저장 오류:', error)
      alert('기록 저장 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  const handleBack = () => {
    router.push('/record/homecafe/step4')
  }

  if (!step1Data || !homeCafeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-green-800">개인 코멘트</h1>
            <div className="text-sm text-green-600">5 / 5</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-green-200 rounded-full h-2 mb-4">
            <div
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '100%' }}
            ></div>
          </div>

          {/* 완료 메시지 */}
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <Check className="h-4 w-4" />
              <span>모든 정보 입력 완료</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Foundation 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Edit3 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">이 커피에 대한 개인적인 생각을 자유롭게 적어보세요</h2>
            <p className="text-green-600 mb-4">특별한 순간이나 느낌을 기록해두면 좋은 추억이 됩니다</p>
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
                    <span className="text-xs text-green-500">자동 저장됨</span>
                  )}
                  {/* Foundation 문서의 글자 수 카운터 */}
                  <span className="text-sm text-gray-500">
                    {commentText.length}/200
                  </span>
                </div>
              </div>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                rows={4}
                maxLength={200}
                placeholder="예) 아침에 마시기 좋은 부드러운 맛이었다. 다음에는 분쇄도를 조금 더 굵게 해봐야겠다..."
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
                        ? 'bg-green-100 text-green-800 border-2 border-green-500'
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
                        ? 'border-green-500 bg-green-50 scale-110'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{tag.emoji}</div>
                    <div className="text-xs text-gray-600">{tag.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Foundation 문서의 컨텍스트 정보 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                함께한 사람 (선택사항)
              </label>
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={companion}
                onChange={(e) => setCompanion(e.target.value)}
              >
                <option value="">선택하세요</option>
                <option value="alone">혼자</option>
                <option value="with_friends">친구와</option>
                <option value="with_family">가족과</option>
                <option value="date">연인과</option>
                <option value="business">동료와</option>
              </select>
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
                  <span>홈카페</span>
                </div>
              </div>
            </div>
          </div>

          {/* HomeCafe 레시피 저장 */}
          <div className="p-6 bg-green-50 rounded-xl border border-green-200">
            <div className="text-center">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                🏠 레시피 저장하기
              </h3>
              <p className="text-sm text-green-700 mb-4">
                이 추출 설정을 저장해서 나중에 다시 사용할 수 있어요
              </p>
              <button
                onClick={handleRecipeSave}
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                <Save className="h-5 w-5 mr-2" />
                레시피 저장하기
              </button>
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
            className="flex-2 py-4 px-8 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-sm text-green-500">
            저장 후: Match Score 결과 및 개인화된 피드백 확인
          </p>
        </div>

        {/* 레시피 저장 다이얼로그 */}
        {showRecipeSave && step1Data && homeCafeData && (
          <RecipeSaveDialog
            recipeData={{
              coffeeName: step1Data.coffeeName,
              roastery: step1Data.roastery,
              dripper: homeCafeData.dripper,
              coffeeAmount: homeCafeData.coffeeAmount,
              waterAmount: homeCafeData.waterAmount,
              ratio: homeCafeData.ratio,
              grindSize: homeCafeData.grindSize,
              grinderBrand: homeCafeData.grinderBrand,
              grinderModel: homeCafeData.grinderModel,
              grinderSetting: homeCafeData.grinderSetting,
              waterTemp: homeCafeData.waterTemp,
              brewTime: homeCafeData.brewTime,
              notes: homeCafeData.notes,
              timerData: homeCafeData.timerData
            }}
            rating={5} // 임시값
            tastingNotes={[...selectedQuickExpressions, commentText].filter(Boolean).join(', ')}
            onSave={handleRecipeSaved}
            onClose={() => setShowRecipeSave(false)}
          />
        )}
      </div>
    </div>
  )
}