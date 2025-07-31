'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CoffeeRecord } from '@/types/coffee'
import { SupabaseStorage } from '@/lib/supabase-storage'
import Navigation from '@/components/Navigation'
import {
  CheckCircle,
  TrendingUp,
  Coffee,
  Heart,
  Share2,
  BarChart3,
  Star,
  Target,
  Award,
  ArrowRight,
  Trophy,
} from 'lucide-react'

// Match Score 계산 함수
const calculateMatchScore = (record: CoffeeRecord): number => {
  // 기본 점수: 평점 기반 (0-100 스케일)
  let score = ((record.rating || 0) / 5) * 100

  // 모드별 가중치
  if (record.mode === 'lab') {
    score += 10 // 전문 모드 보너스
  } else if (record.mode === 'homecafe') {
    score += 5 // 홈카페 정성 보너스
  }

  // 상세 정보 완성도 보너스
  let completeness = 0
  if (record.roastery) completeness += 5
  if (record.origin) completeness += 5
  if (record.roastLevel) completeness += 5
  if (record.taste) completeness += 10
  if (record.memo) completeness += 5

  score += completeness

  // 100점 초과 방지
  return Math.min(Math.round(score), 100)
}

// 점수별 등급 및 색상
const getScoreGrade = (score: number) => {
  if (score >= 90)
    return { grade: 'S', color: 'from-yellow-400 to-orange-500', text: 'text-yellow-600' }
  if (score >= 80)
    return { grade: 'A', color: 'from-green-400 to-green-600', text: 'text-green-600' }
  if (score >= 70) return { grade: 'B', color: 'from-blue-400 to-blue-600', text: 'text-blue-600' }
  if (score >= 60)
    return { grade: 'C', color: 'from-purple-400 to-purple-600', text: 'text-purple-600' }
  return { grade: 'D', color: 'from-gray-400 to-gray-600', text: 'text-gray-600' }
}

// 개인적 메시지
const getPersonalMessage = (score: number, mode: string) => {
  if (score >= 90) {
    return mode === 'lab' ? '완벽한 전문가 수준의 평가입니다!' : '정말 특별한 커피를 만나셨네요!'
  } else if (score >= 80) {
    return '훌륭한 커피 경험이었습니다 ✨'
  } else if (score >= 70) {
    return '좋은 커피 기록이 완성되었어요 👍'
  } else if (score >= 60) {
    return '새로운 발견이 있는 기록이네요 🔍'
  } else {
    return '모든 경험이 소중한 배움입니다 📚'
  }
}

function ResultPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('id')

  const [record, setRecord] = useState<CoffeeRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchScore, setMatchScore] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)

  useEffect(() => {
    const loadRecord = async () => {
      if (recordId) {
        const foundRecord = await SupabaseStorage.getRecordById(recordId)
        if (foundRecord) {
          setRecord(foundRecord)
          const score = calculateMatchScore(foundRecord)
          setMatchScore(score)

          // 애니메이션 시작
          setTimeout(() => setShowAnimation(true), 500)
        } else {
          router.push('/')
        }
      } else {
        router.push('/')
      }
      setLoading(false)
    }

    loadRecord()
  }, [recordId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">결과를 준비하고 있어요...</p>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <Coffee className="h-16 w-16 text-coffee-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-coffee-800 mb-2">결과를 찾을 수 없어요</h1>
          <p className="text-coffee-600 mb-6">기록이 존재하지 않거나 삭제되었습니다.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-coffee-600 text-white rounded-full hover:bg-coffee-700 transition-colors"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const scoreGrade = getScoreGrade(matchScore)
  const personalMessage = getPersonalMessage(matchScore, record.mode || 'cafe')

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <Navigation showBackButton currentPage="result" />

        {/* 성공 헤더 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">기록 완료!</h1>
          <p className="text-xl text-coffee-600">새로운 커피 여정이 추가되었어요</p>
        </div>

        {/* Match Score 메인 카드 */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 relative overflow-hidden">
          {/* 배경 그라데이션 */}
          <div className={`absolute inset-0 bg-gradient-to-br ${scoreGrade.color} opacity-5`} />

          <div className="relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center space-x-3 mb-4">
                <Target className={`h-6 w-6 ${scoreGrade.text}`} />
                <h2 className="text-2xl font-bold text-coffee-800">Match Score</h2>
              </div>

              {/* 점수 원형 표시 */}
              <div className="relative mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
                <svg className="transform -rotate-90 w-full h-full">
                  {/* 배경 원 */}
                  <circle cx="100" cy="100" r="90" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                  {/* 점수 원 */}
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 90}`}
                    strokeDashoffset={`${2 * Math.PI * 90 * (1 - (showAnimation ? matchScore : 0) / 100)}`}
                    className="transition-all duration-2000 ease-out"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* 중앙 점수 표시 */}
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <div
                    className={`text-5xl font-bold bg-gradient-to-r ${scoreGrade.color} bg-clip-text text-transparent transition-all duration-1000 ${showAnimation ? 'scale-100' : 'scale-0'}`}
                  >
                    {showAnimation ? matchScore : 0}
                  </div>
                  <div
                    className={`text-3xl font-bold ${scoreGrade.text} transition-all duration-1000 delay-500 ${showAnimation ? 'opacity-100' : 'opacity-0'}`}
                  >
                    {scoreGrade.grade}
                  </div>
                </div>
              </div>

              <p className="text-lg text-coffee-700 font-medium mb-2">{personalMessage}</p>
              <p className="text-coffee-500">나만의 커피 취향이 한 층 더 명확해졌어요</p>
            </div>
          </div>
        </div>

        {/* 기록 요약 카드 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-coffee-800 mb-4 flex items-center">
            <Coffee className="h-5 w-5 mr-2" />
            기록 요약
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-coffee-800 text-lg mb-2">{record.coffeeName}</h4>
              {record.roastery && <p className="text-coffee-600 mb-1">📍 {record.roastery}</p>}
              {record.origin && <p className="text-coffee-600 mb-1">🌍 {record.origin}</p>}
              <div className="flex items-center mt-3">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                <span className="font-medium text-coffee-700">{record.rating}/5</span>
              </div>
            </div>

            <div>
              <div className="flex items-center mb-3">
                <div
                  className={`
                  px-3 py-1 rounded-full text-sm font-medium
                  ${
                    record.mode === 'cafe'
                      ? 'bg-blue-100 text-blue-800'
                      : record.mode === 'homecafe'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                  }
                `}
                >
                  {record.mode === 'cafe' && '☕ 카페 모드'}
                  {record.mode === 'homecafe' && '🏠 홈카페 모드'}
                  {record.mode === 'lab' && '🔬 랩 모드'}
                </div>
              </div>

              {record.taste && (
                <div className="bg-coffee-50 rounded-lg p-3">
                  <p className="text-sm text-coffee-700 font-medium mb-1">맛 표현</p>
                  <p className="text-coffee-600 text-sm">{record.taste}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Link
            href={`/coffee/${record.id}`}
            className="flex items-center justify-center px-6 py-4 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
          >
            <Coffee className="h-5 w-5 mr-2" />
            상세보기
          </Link>

          <button
            onClick={() => {
              // TODO: 공유 기능 구현
              navigator.share?.({
                title: `CupNote - ${record.coffeeName}`,
                text: `${record.coffeeName} ${record.rating}/5점 - ${personalMessage}`,
                url: window.location.origin + `/coffee/${record.id}`,
              })
            }}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            <Share2 className="h-5 w-5 mr-2" />
            공유하기
          </button>

          <Link
            href="/stats"
            className="flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            통계보기
          </Link>
        </div>

        {/* 성취 링크 */}
        <div className="bg-gradient-to-r from-yellow-100 to-orange-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                성취 시스템이 추가되었어요!
              </h3>
              <p className="text-coffee-600">커피 기록을 통해 배지를 모으고 레벨을 올리세요</p>
            </div>
            <Link
              href="/achievements"
              className="flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-colors font-medium"
            >
              <Trophy className="h-4 w-4 mr-2" />
              성취 보기
            </Link>
          </div>
        </div>

        {/* 다음 액션 추천 */}
        <div className="bg-gradient-to-r from-coffee-100 to-coffee-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-coffee-800 mb-2">
                다음 커피도 기록해보세요!
              </h3>
              <p className="text-coffee-600">더 많은 경험을 쌓을수록 취향 분석이 정확해져요</p>
            </div>
            <Link
              href="/mode-selection"
              className="flex items-center px-6 py-3 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors font-medium"
            >
              새 기록
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
            <p className="text-coffee-600">결과를 준비하고 있어요...</p>
          </div>
        </div>
      }
    >
      <ResultPageContent />
    </Suspense>
  )
}
