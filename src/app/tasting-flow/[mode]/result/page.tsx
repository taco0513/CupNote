'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Trophy, 
  Coffee, 
  Share2, 
  Star, 
  Clock, 
  ArrowRight,
  CheckCircle,
  Target,
  Palette,
  Heart,
  Edit3,
  BarChart3,
  Plus
} from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import AchievementNotification from '../../../../components/achievements/AchievementNotification'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode } from '../../../../types/tasting-flow.types'
import { calculateMatchScore, getDefaultMatchScore, type MatchScoreResult } from '../../../../lib/match-score'
import { AchievementSystem } from '../../../../lib/achievements'
import type { Achievement } from '../../../../types/achievement'

const getScoreGrade = (score: number) => {
  if (score >= 90) return { grade: 'A+', color: 'text-green-600', message: '완벽한 매치!' }
  if (score >= 80) return { grade: 'A', color: 'text-green-600', message: '훌륭한 매치!' }
  if (score >= 70) return { grade: 'B+', color: 'text-blue-600', message: '좋은 매치!' }
  if (score >= 60) return { grade: 'B', color: 'text-blue-600', message: '적당한 매치!' }
  return { grade: 'C', color: 'text-yellow-600', message: '새로운 발견!' }
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [roasterNotes, setRoasterNotes] = useState('')
  const [showRoasterInput, setShowRoasterInput] = useState(false)
  const [matchScoreResult, setMatchScoreResult] = useState<MatchScoreResult | null>(null)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

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
    
    // 기본 Match Score 설정 (로스터 노트 없이)
    const defaultScore = getDefaultMatchScore()
    setMatchScoreResult(defaultScore)

    // Achievement 체크 (첫 테이스팅 완료)
    checkAchievements(parsedSession, defaultScore)
  }, [router])

  // Achievement 체크 함수
  const checkAchievements = (sessionData: Partial<TastingSession>, matchScore: MatchScoreResult) => {
    // 실제로는 사용자의 전체 기록을 가져와서 체크해야 함
    // 여기서는 시뮬레이션으로 첫 테이스팅 Achievement 표시
    if (isFeatureEnabled('ENABLE_ACHIEVEMENTS')) {
      // 첫 테이스팅 Achievement 시뮬레이션
      setTimeout(() => {
        const firstTastingAchievement: Achievement = {
          id: 'first-tasting',
          title: '첫 테이스팅',
          description: '첫 번째 커피 테이스팅을 완료했습니다',
          icon: '☕',
          category: 'tasting',
          condition: { type: 'count', target: 1, field: 'records' },
          reward: { points: 10 },
          unlocked: true,
          unlockedAt: new Date().toISOString(),
          progress: { current: 1, target: 1 }
        }
        setNewAchievement(firstTastingAchievement)
      }, 2000) // 2초 후 Achievement 표시
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CupNote - ${session?.coffeeInfo?.name} 테이스팅`,
          text: `${session?.coffeeInfo?.name}을 테이스팅했어요! Match Score: ${matchScoreResult?.finalScore || 0}점`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(
        `${session?.coffeeInfo?.name} 테이스팅 완료! Match Score: ${matchScoreResult?.finalScore || 0}점 - CupNote에서 기록`
      )
      alert('클립보드에 복사되었습니다!')
    }
  }

  const handleNewTasting = () => {
    sessionStorage.removeItem('tf_session')
    router.push('/tasting-flow')
  }

  const handleViewHistory = () => {
    router.push('/history')
  }

  // 로스터 노트 비교 및 매치 점수 재계산
  const handleRoasterNotesCompare = () => {
    if (!roasterNotes.trim() || !session) {
      setShowRoasterInput(false)
      return
    }

    const userFlavors = session.flavorProfile?.selectedFlavors || []
    const userExpressions = session.sensoryExpression?.selectedExpressions || []
    
    const newMatchScore = calculateMatchScore(userFlavors, userExpressions, roasterNotes.trim())
    setMatchScoreResult(newMatchScore)
    setShowRoasterInput(false)
  }

  const matchScore = matchScoreResult?.finalScore || 0
  const scoreInfo = getScoreGrade(matchScore)
  const completionTime = session?.completedAt ? new Date(session.completedAt) : new Date()
  const startTime = session?.startedAt ? new Date(session.startedAt) : new Date()
  const durationMinutes = Math.round((completionTime.getTime() - startTime.getTime()) / 60000)

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">결과를 생성하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <Navigation showBackButton={false} currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Trophy className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-coffee-800 mb-2">
            테이스팅 완료!
          </h1>
          <p className="text-coffee-600">
            소요 시간: {durationMinutes}분 • {completionTime.toLocaleString('ko-KR')}
          </p>
        </div>

        {/* Match Score */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-coffee-800 mb-6">Match Score</h2>
            
            {/* 점수 원형 차트 */}
            <div className="relative mx-auto mb-6" style={{ width: '200px', height: '200px' }}>
              <svg className="transform -rotate-90 w-full h-full">
                <circle cx="100" cy="100" r="80" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                <circle
                  cx="100"
                  cy="100"
                  r="80"
                  stroke="url(#gradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 80 * (matchScore / 100)}`}
                  strokeDashoffset={`${2 * Math.PI * 80 * 0.25}`}
                />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="50%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <div className="text-5xl font-bold bg-gradient-to-r from-yellow-500 to-green-500 bg-clip-text text-transparent">
                  {matchScore}
                </div>
                <div className={`text-2xl font-bold ${scoreInfo.color}`}>
                  {scoreInfo.grade}
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-coffee-800 mb-2">
              {matchScoreResult?.message || scoreInfo.message}
            </h3>
            <p className="text-coffee-600 text-sm mb-6">
              {roasterNotes ? '로스터 노트와의 일치도입니다' : '로스터 노트를 입력하면 정확한 매치 점수를 확인할 수 있어요'}
            </p>

            {/* 점수 구성 요소 */}
            {roasterNotes && matchScoreResult ? (
              // 로스터 노트가 있을 때: 매치 분석 결과
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Palette className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">향미 매치</div>
                  <div className="text-xs text-coffee-600">
                    {matchScoreResult.flavorScore}점 (70%)
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">감각 매치</div>
                  <div className="text-xs text-coffee-600">
                    {matchScoreResult.sensoryScore}점 (30%)
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <CheckCircle className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">일치 향미</div>
                  <div className="text-xs text-coffee-600">
                    {matchScoreResult.matchedFlavors.length}개
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Target className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">일치 감각</div>
                  <div className="text-xs text-coffee-600">
                    {matchScoreResult.matchedSensory.length}개
                  </div>
                </div>
              </div>
            ) : (
              // 로스터 노트가 없을 때: 기본 구성 요소
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Palette className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">향미 선택</div>
                  <div className="text-xs text-coffee-600">
                    {session.flavorProfile?.selectedFlavors?.length || 0}개
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">감각 표현</div>
                  <div className="text-xs text-coffee-600">
                    {session.sensoryExpression?.selectedExpressions?.length || 0}개
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <BarChart3 className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">수치 평가</div>
                  <div className="text-xs text-coffee-600">
                    {session.sensoryMouthFeel ? `${session.sensoryMouthFeel.averageScore}점` : '건너뜀'}
                  </div>
                </div>
                <div className="p-3 bg-coffee-50 rounded-xl">
                  <Edit3 className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                  <div className="text-sm font-medium text-coffee-800">개인 노트</div>
                  <div className="text-xs text-coffee-600">
                    {session.personalNotes?.noteText ? '작성됨' : '미작성'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 커피 정보 요약 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Coffee className="h-6 w-6 text-coffee-600 mr-2" />
            <h2 className="text-xl font-bold text-coffee-800">커피 정보</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-coffee-800 mb-2">
                {session.coffeeInfo?.name}
              </h3>
              <div className="space-y-1 text-coffee-600">
                <p>로스터: {session.coffeeInfo?.roastery}</p>
                {session.coffeeInfo?.origin && <p>원산지: {session.coffeeInfo?.origin}</p>}
                {session.coffeeInfo?.purchaseLocation && (
                  <p>장소: {session.coffeeInfo.purchaseLocation}</p>
                )}
                <p>날짜: {session.tastingDate ? new Date(session.tastingDate).toLocaleDateString('ko-KR') : '오늘'}</p>
              </div>
            </div>

            {/* HomeCafe 브루잉 정보 */}
            {mode === 'homecafe' && session.brewSetup && (
              <div>
                <h3 className="text-lg font-bold text-coffee-800 mb-2">브루잉 레시피</h3>
                <div className="space-y-1 text-coffee-600 text-sm">
                  <p>드리퍼: {session.brewSetup.dripper.toUpperCase()}</p>
                  <p>비율: {session.brewSetup.coffeeAmount}g : {session.brewSetup.waterAmount}ml</p>
                  <p>분쇄도: {session.brewSetup.grindSize}</p>
                  {session.brewSetup.waterTemp && <p>물 온도: {session.brewSetup.waterTemp}°C</p>}
                  {session.brewSetup.brewTime && session.brewSetup.brewTime > 0 && (
                    <p>추출 시간: {Math.floor(session.brewSetup.brewTime / 60)}:{(session.brewSetup.brewTime % 60).toString().padStart(2, '0')}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 테이스팅 요약 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Target className="h-6 w-6 text-coffee-600 mr-2" />
            <h2 className="text-xl font-bold text-coffee-800">나의 테이스팅</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* 향미 선택 */}
            <div>
              <h3 className="text-lg font-medium text-coffee-800 mb-3 flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                선택한 향미
              </h3>
              {session.flavorProfile?.selectedFlavors && session.flavorProfile.selectedFlavors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.flavorProfile.selectedFlavors.map((flavor, index) => (
                    <span key={index} className="px-3 py-1 bg-coffee-100 text-coffee-800 rounded-full text-sm">
                      {flavor}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">선택된 향미가 없습니다</p>
              )}
            </div>

            {/* 감각 표현 */}
            <div>
              <h3 className="text-lg font-medium text-coffee-800 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                감각 표현
              </h3>
              {session.sensoryExpression?.selectedExpressions && session.sensoryExpression.selectedExpressions.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {session.sensoryExpression.selectedExpressions.map((expression, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {expression}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">선택된 표현이 없습니다</p>
              )}
            </div>

            {/* 수치 평가 */}
            {session.sensoryMouthFeel && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-coffee-800 mb-3 flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  수치 평가 (평균: {session.sensoryMouthFeel.averageScore}점)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {Object.entries(session.sensoryMouthFeel.ratings).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="font-medium text-coffee-700">
                        {key === 'body' ? 'Body' : 
                         key === 'acidity' ? 'Acidity' :
                         key === 'sweetness' ? 'Sweetness' :
                         key === 'finish' ? 'Finish' :
                         key === 'bitterness' ? 'Bitterness' :
                         key === 'balance' ? 'Balance' : key}
                      </span>
                      <div className="flex items-center mt-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= value ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-xs text-gray-600">{value}점</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 개인 노트 */}
            {session.personalNotes && (
              <div className="md:col-span-2">
                <h3 className="text-lg font-medium text-coffee-800 mb-3 flex items-center">
                  <Edit3 className="h-5 w-5 mr-2" />
                  개인 노트
                </h3>
                {session.personalNotes.noteText && (
                  <div className="p-4 bg-gray-50 rounded-xl mb-4">
                    <p className="text-coffee-700">{session.personalNotes.noteText}</p>
                  </div>
                )}
                
                <div className="space-y-3">
                  {session.personalNotes.selectedQuickInputs && session.personalNotes.selectedQuickInputs.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-coffee-700 mb-2">빠른 표현:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.personalNotes.selectedQuickInputs.map((input, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {input}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {session.personalNotes.selectedEmotions && session.personalNotes.selectedEmotions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-coffee-700 mb-2">감정:</p>
                      <div className="flex flex-wrap gap-2">
                        {session.personalNotes.selectedEmotions.map((emotion, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                            {emotion}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 로스터 노트 비교 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-coffee-800 mb-6">로스터 노트 비교</h2>
          
          {!showRoasterInput && !roasterNotes ? (
            <div className="text-center py-8">
              <p className="text-coffee-600 mb-4">로스터 노트를 입력하면 내 테이스팅과 비교해드립니다</p>
              <button
                onClick={() => setShowRoasterInput(true)}
                className="inline-flex items-center px-4 py-2 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                로스터 노트 입력하기
              </button>
            </div>
          ) : showRoasterInput ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                로스터 노트 (패키지나 메뉴에 적힌 설명)
              </label>
              <textarea
                value={roasterNotes}
                onChange={(e) => setRoasterNotes(e.target.value)}
                placeholder="예: 블루베리, 다크초콜릿, 와인, 밝은 산미"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent mb-4"
                rows={3}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRoasterInput(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleRoasterNotesCompare}
                  className="px-4 py-2 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors"
                >
                  비교하기
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-coffee-50 rounded-xl">
                <p className="text-coffee-700 mb-4">
                  <strong>로스터 노트:</strong> {roasterNotes}
                </p>
              </div>
              
              {/* 매치 분석 결과 */}
              {matchScoreResult && matchScoreResult.roasterNote && (
                <div className="grid md:grid-cols-2 gap-4">
                  {/* 일치한 향미 */}
                  {matchScoreResult.matchedFlavors.length > 0 && (
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                      <h4 className="font-medium text-green-800 mb-2">🎯 일치한 향미</h4>
                      <div className="flex flex-wrap gap-2">
                        {matchScoreResult.matchedFlavors.map((flavor, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                            {flavor}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* 일치한 감각 */}
                  {matchScoreResult.matchedSensory.length > 0 && (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <h4 className="font-medium text-blue-800 mb-2">💭 일치한 감각</h4>
                      <div className="flex flex-wrap gap-2">
                        {matchScoreResult.matchedSensory.map((sensory, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                            {sensory}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 성장 인사이트 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-xl font-bold text-coffee-800 mb-6">성장 인사이트</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-2xl font-bold text-blue-800">1</div>
              <div className="text-sm text-blue-600">누적 테이스팅</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-2xl font-bold text-green-800">
                {session.flavorProfile?.selectedFlavors?.length || 0}
              </div>
              <div className="text-sm text-green-600">오늘 발견한 향미</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-2xl font-bold text-purple-800">{scoreInfo.grade}</div>
              <div className="text-sm text-purple-600">테이스팅 등급</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
            <p className="text-yellow-800 text-sm">
              💡 <strong>다음 도전:</strong> 더 다양한 향미를 발견해보세요! 
              {(session.flavorProfile?.selectedFlavors?.length || 0) < 5 && 
                ` 이번에는 ${session.flavorProfile?.selectedFlavors?.length || 0}개를 선택하셨는데, 5개 이상 선택하면 더 높은 점수를 받을 수 있어요.`
              }
            </p>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <button
            onClick={handleShare}
            className="flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Share2 className="h-5 w-5 mr-2" />
            결과 공유하기
          </button>
          
          <button
            onClick={handleViewHistory}
            className="flex items-center justify-center px-6 py-4 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Clock className="h-5 w-5 mr-2" />
            기록 보기
          </button>

          <button
            onClick={handleNewTasting}
            className="flex items-center justify-center px-6 py-4 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            새 테이스팅
          </button>
        </div>

        {/* 완료 메시지 */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 px-6 py-3 bg-green-100 text-green-800 rounded-full">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">테이스팅이 성공적으로 저장되었습니다!</span>
          </div>
        </div>
      </div>

      {/* Achievement 알림 */}
      <AchievementNotification
        achievement={newAchievement}
        onClose={() => setNewAchievement(null)}
      />
    </div>
  )
}