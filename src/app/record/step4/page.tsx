'use client'

import { useState, useEffect } from 'react'

import { useRouter } from 'next/navigation'

import {
  Check,
  ArrowLeft,
  Star,
  Coffee,
  MapPin,
  Calendar,
  Settings,
  Heart,
  Smile,
  Edit3,
  Camera,
} from 'lucide-react'

import Navigation from '../../../components/Navigation'
import { SupabaseStorage } from '../../../lib/supabase-storage'
import { CoffeeRecord } from '../../../types/coffee'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe' | 'lab'
}

interface Step2Data {
  [key: string]: any
}

interface Step3Data {
  rating: number
  tasteMode: 'simple' | 'professional'
  taste: string
  roasterNote: string
  memo: string
}

const RATING_LABELS = ['별로예요', '그냥 그래요', '괜찮아요', '맛있어요', '최고예요!']

export default function RecordStep4Page() {
  const router = useRouter()

  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null)
  const [step3Data, setStep3Data] = useState<Step3Data | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // 모든 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const saved2 = sessionStorage.getItem('recordStep2')
    const saved3 = sessionStorage.getItem('recordStep3')

    if (saved1 && saved2 && saved3) {
      setStep1Data(JSON.parse(saved1))
      setStep2Data(JSON.parse(saved2))
      setStep3Data(JSON.parse(saved3))
    } else {
      // 필요한 데이터가 없으면 처음으로 돌아감
      router.push('/mode-selection')
    }
  }, [router])

  const handleSubmit = async () => {
    if (!step1Data || !step3Data) return

    try {
      setSubmitting(true)

      // 모든 데이터를 합쳐서 CoffeeRecord 생성
      const recordToSubmit = {
        coffeeName: step1Data.coffeeName,
        roastery: step1Data.roastery || '',
        date: step1Data.date,
        taste: step3Data.taste,
        roasterNote: step3Data.roasterNote || '',
        tasteMode: step3Data.tasteMode,
        memo: step3Data.memo || '',
        rating: step3Data.rating,
        mode: step1Data.mode,
        // 이미지 추가
        images: (step3Data as any).imageUrl ? [(step3Data as any).imageUrl] : undefined,

        // Step 2 데이터 추가
        ...(step2Data || {}),
      }

      // Supabase에 저장 (성취 시스템 포함)
      const result = await SupabaseStorage.addRecordWithAchievements(recordToSubmit)
      const savedRecord = result.record

      if (!savedRecord) {
        throw new Error('기록 저장에 실패했습니다')
      }

      console.log('커피 기록 저장됨:', savedRecord)

      // 다른 컴포넌트에 변경사항 알림
      window.dispatchEvent(new CustomEvent('cupnote-record-added'))

      // 세션 스토리지 정리
      sessionStorage.removeItem('recordStep1')
      sessionStorage.removeItem('recordStep2')
      sessionStorage.removeItem('recordStep3')

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
    router.push('/record/step3')
  }

  const handleEdit = (step: number) => {
    router.push(`/record/step${step}`)
  }

  if (!step1Data || !step2Data || !step3Data) {
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
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-coffee-800">커피 기록하기</h1>
            <div className="text-sm text-coffee-600">4 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2 mb-4">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
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

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-coffee-100 rounded-full mb-4">
              <Check className="h-8 w-8 text-coffee-600" />
            </div>
            <h2 className="text-2xl font-bold text-coffee-800 mb-2">최종 검토</h2>
            <p className="text-coffee-600">입력하신 정보를 확인해주세요</p>
          </div>

          <div className="space-y-6">
            {/* Step 1: 기본 정보 */}
            <div className="border border-coffee-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Coffee className="h-5 w-5 text-coffee-600" />
                  <h3 className="text-lg font-semibold text-coffee-800">기본 정보</h3>
                </div>
                <button
                  onClick={() => handleEdit(1)}
                  className="text-coffee-600 hover:text-coffee-800 transition-colors p-1"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div
                    className={`
                    px-3 py-1 rounded-full text-sm font-medium
                    ${
                      step1Data.mode === 'cafe'
                        ? 'bg-blue-100 text-blue-800'
                        : step1Data.mode === 'homecafe'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-purple-100 text-purple-800'
                    }
                  `}
                  >
                    {step1Data.mode === 'cafe' && '☕ 카페 모드'}
                    {step1Data.mode === 'homecafe' && '🏠 홈카페 모드'}
                    {step1Data.mode === 'lab' && '🔬 랩 모드'}
                  </div>
                </div>
                <p className="text-xl font-bold text-coffee-800">{step1Data.coffeeName}</p>
                {step1Data.roastery && (
                  <p className="flex items-center text-coffee-600">
                    <MapPin className="h-4 w-4 mr-1" />
                    {step1Data.roastery}
                  </p>
                )}
                <p className="flex items-center text-coffee-600">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(step1Data.date).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>

            {/* Step 2: 상세 설정 */}
            <div className="border border-coffee-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Settings className="h-5 w-5 text-coffee-600" />
                  <h3 className="text-lg font-semibold text-coffee-800">
                    {step1Data.mode === 'cafe'
                      ? '추가 정보'
                      : step1Data.mode === 'homecafe'
                        ? '추출 정보'
                        : '전문 데이터'}
                  </h3>
                </div>
                <button
                  onClick={() => handleEdit(2)}
                  className="text-coffee-600 hover:text-coffee-800 transition-colors p-1"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-coffee-600">
                {Object.entries(step2Data).map(([key, value]) => {
                  if (!value) return null

                  const getKeyLabel = (key: string) => {
                    const labels: { [key: string]: string } = {
                      origin: '원산지',
                      roastLevel: '로스팅 정도',
                      brewMethod: '추출 방법',
                      grindSize: '분쇄도',
                      waterTemp: '물 온도',
                      brewTime: '추출 시간',
                      ratio: '비율',
                      variety: '품종',
                      process: '가공 방식',
                      altitude: '재배 고도',
                      tds: 'TDS',
                      extraction: '추출 수율',
                    }
                    return labels[key] || key
                  }

                  return (
                    <div key={key}>
                      <span className="font-medium">{getKeyLabel(key)}:</span> {value}
                    </div>
                  )
                })}
                {Object.keys(step2Data).filter(key => step2Data[key]).length === 0 && (
                  <p className="text-gray-500 italic">추가 정보 없음</p>
                )}
              </div>
            </div>

            {/* Step 3: 맛 평가 */}
            <div className="border border-coffee-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-coffee-600" />
                  <h3 className="text-lg font-semibold text-coffee-800">맛 평가</h3>
                </div>
                <button
                  onClick={() => handleEdit(3)}
                  className="text-coffee-600 hover:text-coffee-800 transition-colors p-1"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${
                          star <= step3Data.rating
                            ? 'text-yellow-500 fill-yellow-500'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-medium text-coffee-800">
                    {RATING_LABELS[step3Data.rating - 1]}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-coffee-700 mb-1">
                    {step3Data.tasteMode === 'simple' ? '맛 표현' : '테이스팅 노트'}
                  </p>
                  <p className="text-coffee-600 bg-coffee-50 p-3 rounded-lg">{step3Data.taste}</p>
                </div>

                {step3Data.roasterNote && (
                  <div>
                    <p className="font-medium text-coffee-700 mb-1">로스터 노트</p>
                    <p className="text-coffee-600">{step3Data.roasterNote}</p>
                  </div>
                )}

                {step3Data.memo && (
                  <div>
                    <p className="font-medium text-coffee-700 mb-1 flex items-center">
                      <Smile className="h-4 w-4 mr-1" />
                      메모
                    </p>
                    <p className="text-coffee-600 bg-coffee-50 p-3 rounded-lg">{step3Data.memo}</p>
                  </div>
                )}

                {(step3Data as any).imageUrl && (
                  <div>
                    <p className="font-medium text-coffee-700 mb-1 flex items-center">
                      <Camera className="h-4 w-4 mr-1" />
                      사진
                    </p>
                    <img
                      src={(step3Data as any).imageUrl}
                      alt="커피 사진"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
            <p className="text-sm text-green-700">
              <span className="font-medium">✅ 준비 완료!</span>
              저장 버튼을 누르면 커피 기록이 완성되고 Match Score 결과를 확인할 수 있어요!
            </p>
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
            className="flex-2 py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
          <p className="text-sm text-coffee-500">
            저장 후: Match Score 결과 및 개인화된 피드백 확인
          </p>
        </div>
      </div>
    </div>
  )
}
