'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { ArrowRight, ArrowLeft, Edit3, Clock, Info, CheckCircle, Loader2, Camera } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import ImageUpload from '../../../../components/ImageUpload'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'

import type { TastingSession, TastingMode, PersonalNotes } from '../../../../types/tasting-flow.types'

// 빠른 입력 도구
const QUICK_INPUTS = [
  "아침에 좋을 것 같다",
  "다시 마시고 싶다", 
  "친구에게 추천하고 싶다",
  "특별한 날에 어울린다",
  "집중할 때 좋을 것 같다",
  "편안한 느낌이다",
  "새로운 경험이었다",
  "기대보다 좋았다"
]

// 감정 태그
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

export default function PersonalNotesPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [noteText, setNoteText] = useState('')
  const [selectedQuickInputs, setSelectedQuickInputs] = useState<string[]>([])
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([])
  const [currentTime, setCurrentTime] = useState('')
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>('')
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('')

  // 자동 저장 타이머
  useEffect(() => {
    const interval = setInterval(() => {
      if (noteText.trim() || selectedQuickInputs.length > 0 || selectedEmotions.length > 0) {
        setIsSaving(true)
        // 10초마다 자동 저장 (실제로는 sessionStorage에 임시 저장)
        const tempData = {
          noteText: noteText.trim(),
          selectedQuickInputs,
          selectedEmotions,
          savedAt: new Date().toISOString()
        }
        sessionStorage.setItem('tf_temp_notes', JSON.stringify(tempData))
        
        setTimeout(() => {
          setIsSaving(false)
          setLastSavedTime(new Date())
        }, 500) // 저장 애니메이션을 위한 짧은 딜레이
      }
    }, 10000)

    return () => clearInterval(interval)
  }, [noteText, selectedQuickInputs, selectedEmotions])

  // 저장 시간 업데이트 타이머
  useEffect(() => {
    const timer = setInterval(() => {
      // 매초마다 컴포넌트를 리렌더링하여 저장 시간을 업데이트
      if (lastSavedTime) {
        setCurrentTime(prev => prev) // 강제 리렌더링
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [lastSavedTime])

  // 세션 로드 및 검증
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
      router.push('/mode-selection')
      return
    }

    const sessionData = sessionStorage.getItem('tf_session')
    if (!sessionData) {
      router.push('/tasting-flow')
      return
    }

    const parsedSession = JSON.parse(sessionData)
    if (!parsedSession.mode || (parsedSession.mode !== 'cafe' && parsedSession.mode !== 'homecafe')) {
      router.push('/tasting-flow')
      return
    }

    setSession(parsedSession)

    // 임시 저장된 노트 불러오기
    const tempNotes = sessionStorage.getItem('tf_temp_notes')
    if (tempNotes) {
      const parsed = JSON.parse(tempNotes)
      setNoteText(parsed.noteText || '')
      setSelectedQuickInputs(parsed.selectedQuickInputs || [])
      setSelectedEmotions(parsed.selectedEmotions || [])
    }

    // 현재 시간 설정
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 5 && hour < 12) {
      setCurrentTime('오전')
    } else if (hour >= 12 && hour < 18) {
      setCurrentTime('오후')
    } else if (hour >= 18 && hour < 22) {
      setCurrentTime('저녁')
    } else {
      setCurrentTime('밤')
    }
  }, [router])

  const handleQuickInputToggle = (input: string) => {
    if (selectedQuickInputs.includes(input)) {
      setSelectedQuickInputs(prev => prev.filter(item => item !== input))
    } else {
      setSelectedQuickInputs(prev => [...prev, input])
    }
  }

  const handleEmotionToggle = (emotion: string) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(prev => prev.filter(item => item !== emotion))
    } else {
      setSelectedEmotions(prev => [...prev, emotion])
    }
  }

  const handleImageUploaded = (url: string, thumbnail?: string) => {
    setImageUrl(url)
    setThumbnailUrl(thumbnail || '')
  }

  const handleImageRemoved = () => {
    setImageUrl('')
    setThumbnailUrl('')
  }

  const handleNext = () => {
    const personalNotes: PersonalNotes = {
      noteText: noteText.trim(),
      selectedQuickInputs,
      selectedEmotions,
      timeContext: currentTime,
      imageUrl: imageUrl || undefined,
      thumbnailUrl: thumbnailUrl || undefined,
      createdAt: new Date().toISOString(),
    }

    const updatedSession = {
      ...session,
      personalNotes,
      currentScreen: 'result',
      completedAt: new Date().toISOString(),
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    
    // 임시 노트 삭제
    sessionStorage.removeItem('tf_temp_notes')
    
    router.push(`/tasting-flow/${mode}/result`)
  }

  const handleBack = () => {
    router.push(`/tasting-flow/${mode}/sensory-mouthfeel`)
  }

  const getCharacterCount = () => {
    return noteText.length
  }

  const maxCharacters = 200

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-3xl pb-20 md:pb-8">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">개인 노트</h1>
            <div className="text-sm text-coffee-600">
              {mode === 'cafe' ? '6' : '6'} / {mode === 'cafe' ? '6' : '7'}
            </div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: mode === 'cafe' ? '100%' : '85.71%' }}
            />
          </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Edit3 className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
              자유로운 감상을 남겨보세요
            </h2>
            <p className="text-coffee-600">함께한 사람, 그날의 기분, 특별한 순간을 기록해보세요</p>
          </div>

          <div className="space-y-8">
            {/* 메인 텍스트 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Edit3 className="inline h-4 w-4 mr-1" />
                자유로운 메모 ({getCharacterCount()}/{maxCharacters})
              </label>
              <textarea
                value={noteText}
                onChange={(e) => {
                  if (e.target.value.length <= maxCharacters) {
                    setNoteText(e.target.value)
                  }
                }}
                placeholder="예: 아침에 마시기 좋은 부드러운 맛이었다. 친구와 함께 마셨는데 대화가 더 깊어진 것 같다..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent resize-none"
                rows={5}
              />
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center text-xs text-gray-500">
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                      저장 중...
                    </>
                  ) : lastSavedTime ? (
                    <>
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {Math.floor((new Date().getTime() - lastSavedTime.getTime()) / 1000)}초 전 저장됨
                    </>
                  ) : (
                    '10초마다 자동 저장됩니다'
                  )}
                </div>
                <div className={`text-xs ${
                  getCharacterCount() > maxCharacters * 0.9 
                    ? 'text-red-500' 
                    : 'text-gray-500'
                }`}>
                  {maxCharacters - getCharacterCount()}자 남음
                </div>
              </div>
            </div>

            {/* 빠른 입력 도구 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                빠른 입력 도구 (선택사항)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {QUICK_INPUTS.map((input) => (
                  <button
                    key={input}
                    onClick={() => handleQuickInputToggle(input)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      selectedQuickInputs.includes(input)
                        ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm">{input}</span>
                  </button>
                ))}
              </div>
              
              {selectedQuickInputs.length > 0 && (
                <div className="mt-4 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
                  <h4 className="text-sm font-medium text-coffee-700 mb-2">선택된 표현</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedQuickInputs.map((input) => (
                      <span
                        key={input}
                        className="px-2 py-1 bg-coffee-600 text-white rounded-full text-xs"
                      >
                        {input}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 감정 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                감정 태그 (선택사항)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {EMOTION_TAGS.map((tag) => (
                  <button
                    key={tag.label}
                    onClick={() => handleEmotionToggle(tag.label)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      selectedEmotions.includes(tag.label)
                        ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl mb-1">{tag.emoji}</div>
                    <div className="text-xs">{tag.label}</div>
                  </button>
                ))}
              </div>
              
              {selectedEmotions.length > 0 && (
                <div className="mt-4 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
                  <h4 className="text-sm font-medium text-coffee-700 mb-2">선택된 감정</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEmotions.map((emotion) => {
                      const tag = EMOTION_TAGS.find(t => t.label === emotion)
                      return (
                        <span
                          key={emotion}
                          className="inline-flex items-center px-2 py-1 bg-coffee-600 text-white rounded-full text-xs"
                        >
                          <span className="mr-1">{tag?.emoji}</span>
                          {emotion}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 사진 촬영 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                <Camera className="inline h-4 w-4 mr-2" />
                커피 사진 (선택사항)
              </label>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <ImageUpload
                  onImageUploaded={handleImageUploaded}
                  onImageRemoved={handleImageRemoved}
                  existingImageUrl={imageUrl}
                  className="w-full"
                  showThumbnail={true}
                />
                <p className="text-xs text-gray-500 mt-2">
                  카메라로 촬영하거나 갤러리에서 선택할 수 있습니다
                </p>
              </div>
            </div>

            {/* 컨텍스트 정보 */}
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center mb-2">
                <Clock className="h-4 w-4 text-gray-600 mr-2" />
                <h4 className="text-sm font-medium text-gray-700">컨텍스트 정보</h4>
              </div>
              <div className="text-sm text-gray-600">
                작성 시간: {currentTime}
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">개인 노트 안내</p>
                <ul className="space-y-1 text-xs">
                  <li>• 모든 입력은 선택사항입니다. 빈 상태로도 완료할 수 있어요</li>
                  <li>• 나만의 기억과 감정을 자유롭게 기록해보세요</li>
                  <li>• 시간이 지나면 소중한 추억이 될 거예요</li>
                </ul>
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
            onClick={handleNext}
            className="flex-2 py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            테이스팅 완료
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">다음: 결과 및 Match Score 확인</p>
        </div>
      </div>
    </div>
  )
}