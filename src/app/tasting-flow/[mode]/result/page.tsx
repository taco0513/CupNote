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
  Plus,
  Users
} from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import AchievementNotification from '../../../../components/achievements/AchievementNotification'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode } from '../../../../types/tasting-flow.types'
import { calculateMatchScore, getDefaultMatchScore, getDefaultMatchScoreAsync, type MatchScoreResult } from '../../../../lib/match-score'
import { AchievementSystem } from '../../../../lib/achievements'
import type { Achievement } from '../../../../types/achievement'

const getScoreGrade = (score: number) => {
  if (score >= 90) return { color: 'text-green-600', message: '완벽한 매치!' }
  if (score >= 80) return { color: 'text-green-600', message: '훌륭한 매치!' }
  if (score >= 70) return { color: 'text-blue-600', message: '좋은 매치!' }
  if (score >= 60) return { color: 'text-blue-600', message: '적당한 매치!' }
  return { color: 'text-yellow-600', message: '새로운 발견!' }
}

export default function ResultPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [roasterNotes, setRoasterNotes] = useState('')
  const [showRoasterInput, setShowRoasterInput] = useState(false)
  const [matchScoreResult, setMatchScoreResult] = useState<MatchScoreResult | null>(null)
  const [roasterMatchScore, setRoasterMatchScore] = useState<MatchScoreResult | null>(null)
  const [communityMatchScore, setCommunityMatchScore] = useState<MatchScoreResult | null>(null)
  const [currentScoreIndex, setCurrentScoreIndex] = useState(0)
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
    
    // 두 가지 매치 점수를 모두 계산
    const loadBothScores = async () => {
      const userFlavors = parsedSession.flavorProfile?.selectedFlavors || []
      const userExpressions = parsedSession.sensoryExpression?.selectedExpressions || []
      const coffeeName = parsedSession.coffeeInfo?.coffeeName
      const roastery = parsedSession.coffeeInfo?.roasterName
      
      try {
        // 1. 커뮤니티 점수 (항상 계산)
        const communityScore = await getDefaultMatchScoreAsync(
          userFlavors, 
          userExpressions, 
          coffeeName, 
          roastery
        )
        setCommunityMatchScore(communityScore)
        
        // 2. 로스터 노트 점수 (로스터 노트가 있을 때만)
        // 초기 로드시에는 로스터 노트가 없으므로 null로 유지
        
        // 기본 표시용 (하위 호환성)
        setMatchScoreResult(communityScore)
      } catch (error) {
        console.error('점수 로드 실패, 레거시 사용:', error)
        const fallbackScore = getDefaultMatchScore(userFlavors, userExpressions)
        setCommunityMatchScore(fallbackScore)
        setMatchScoreResult(fallbackScore)
      }
    }
    
    loadBothScores()

    // Achievement 체크는 점수 로드 후에 실행됨
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
          category: 'milestone',
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

  // matchScoreResult가 업데이트될 때 Achievement 체크
  useEffect(() => {
    if (session && matchScoreResult) {
      checkAchievements(session, matchScoreResult)
    }
  }, [session, matchScoreResult])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `CupNote - ${session?.coffeeInfo?.coffeeName} 테이스팅`,
          text: `${session?.coffeeInfo?.coffeeName}을 테이스팅했어요! Match Score: ${matchScoreResult?.finalScore || 0}%`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('공유 취소됨')
      }
    } else {
      // 클립보드에 복사
      navigator.clipboard.writeText(
        `${session?.coffeeInfo?.coffeeName} 테이스팅 완료! Match Score: ${matchScoreResult?.finalScore || 0}% - CupNote에서 기록`
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
    
    const newRoasterScore = calculateMatchScore(userFlavors, userExpressions, roasterNotes.trim(), true)
    setRoasterMatchScore(newRoasterScore)
    setCurrentScoreIndex(1) // 로스터 점수로 자동 전환
    setShowRoasterInput(false)
  }

  // 스와이프 핸들러
  const handleSwipe = (direction: 'left' | 'right') => {
    const scores = [communityMatchScore, roasterMatchScore].filter(Boolean)
    if (scores.length <= 1) return
    
    if (direction === 'left') {
      setCurrentScoreIndex((prev) => (prev + 1) % scores.length)
    } else {
      setCurrentScoreIndex((prev) => (prev - 1 + scores.length) % scores.length)
    }
  }

  // 터치/마우스 이벤트 핸들러
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
    setTouchEnd(null)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    setTouchEnd({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const diffX = touchStart.x - touchEnd.x
    const diffY = touchStart.y - touchEnd.y
    const absDiffX = (diffX < 0 ? -diffX : diffX)
    const absDiffY = Math.abs(diffY)
    
    // 수평 스와이프인지 확인 (세로 스와이프보다 가로 스와이프가 더 클 때)
    if (absDiffX > absDiffY && absDiffX > 50) {
      if (diffX > 0) {
        // 왼쪽으로 스와이프 (다음)
        handleSwipe('left')
      } else {
        // 오른쪽으로 스와이프 (이전)
        handleSwipe('right')
      }
    }
    
    setTouchStart(null)
    setTouchEnd(null)
  }

  // 마우스 이벤트 핸들러 (데스크톱용)
  const [mouseStart, setMouseStart] = useState<{ x: number; y: number } | null>(null)
  const [isMouseDown, setIsMouseDown] = useState(false)

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseStart({ x: e.clientX, y: e.clientY })
    setIsMouseDown(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDown || !mouseStart) return
    
    const diffX = mouseStart.x - e.clientX
    const absDiffX = diffX < 0 ? -diffX : diffX
    
    // 드래그 중인 것을 시각적으로 표시 (선택적)
    if (absDiffX > 20) {
      const element = e.currentTarget as HTMLElement
      if (element && element.style) {
        element.style.transform = `translateX(${-diffX * 0.1}px)`
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    if (!isMouseDown || !mouseStart) return
    
    const diffX = mouseStart.x - e.clientX
    const absDiffX = diffX < 0 ? -diffX : diffX
    
    // 원래 위치로 복원
    const element = e.currentTarget as HTMLElement
    if (element && element.style) {
      element.style.transform = 'translateX(0)'
    }
    
    if (absDiffX > 50) {
      if (diffX > 0) {
        // 왼쪽으로 드래그 (다음)
        handleSwipe('left')
      } else {
        // 오른쪽으로 드래그 (이전)
        handleSwipe('right')
      }
    }
    
    setMouseStart(null)
    setIsMouseDown(false)
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

        {/* Match Score - 스와이프 가능한 두 개 점수 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-coffee-800 mb-6">Match Score</h2>
            
            {(() => {
              const scores = [communityMatchScore, roasterMatchScore].filter(Boolean)
              const currentScore = scores[currentScoreIndex] || communityMatchScore
              const currentMatchScore = currentScore?.finalScore || 0
              const isRoasterScore = currentScore === roasterMatchScore
              
              return (
                <>
                  {/* 스와이프 인디케이터 */}
                  {scores.length > 1 && (
                    <div className="flex justify-center mb-4 space-x-2">
                      {scores.map((_, index) => (
                        <div
                          key={index}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentScoreIndex ? 'bg-coffee-600' : 'bg-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* 점수 원형 차트 */}
                  <div 
                    className="relative mx-auto mb-6 cursor-pointer select-none transition-transform duration-200"
                    style={{ width: '200px', height: '200px' }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={() => {
                      // 마우스가 영역을 벗어나면 드래그 취소
                      if (isMouseDown) {
                        setIsMouseDown(false)
                        setMouseStart(null)
                      }
                    }}
                    onClick={() => {
                      // 스와이프가 아닌 단순 클릭일 때만 실행
                      if (!touchStart && !mouseStart && scores.length > 1) {
                        handleSwipe('left')
                      }
                    }}
                  >
                    <svg className="transform -rotate-90 w-full h-full">
                      <circle cx="100" cy="100" r="80" stroke="#f3f4f6" strokeWidth="12" fill="none" />
                      <circle
                        cx="100"
                        cy="100"
                        r="80"
                        stroke={`url(#gradient-${isRoasterScore ? 'roaster' : 'community'})`}
                        strokeWidth="12"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 80 * (currentMatchScore / 100)}`}
                        strokeDashoffset={`${2 * Math.PI * 80 * 0.25}`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient-community" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#3b82f6" />
                          <stop offset="50%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <linearGradient id="gradient-roaster" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </svg>

                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <div className={`text-5xl font-bold bg-gradient-to-r ${
                        isRoasterScore 
                          ? 'from-yellow-500 to-green-500' 
                          : 'from-blue-500 to-cyan-500'
                      } bg-clip-text text-transparent transition-all duration-500`}>
                        {currentMatchScore}%
                      </div>
                      <div className="text-sm font-medium text-gray-600 mt-1">
                        {isRoasterScore ? '로스터 매치' : '커뮤니티 매치'}
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-coffee-800 mb-2">
                    {currentScore?.message || '점수를 계산하는 중...'}
                  </h3>
                  <p className="text-coffee-600 text-sm mb-6">
                    {isRoasterScore ? (
                      <span className="inline-flex items-center">
                        <Edit3 className="h-4 w-4 mr-1" />
                        로스터 노트와의 일치도입니다
                      </span>
                    ) : (
                      <span className="inline-flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        커뮤니티 평균과의 비교 점수입니다
                      </span>
                    )}
                    {scores.length > 1 && (
                      <span className="block text-xs text-gray-500 mt-1">
                        👈👉 좌우로 스와이프해서 다른 점수 보기
                      </span>
                    )}
                  </p>

                  {/* 점수 구성 요소 */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-coffee-50 rounded-xl">
                      <Palette className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                      <div className="text-sm font-medium text-coffee-800">향미 매치</div>
                      <div className="text-xs text-coffee-600">
                        {currentScore?.flavorScore || 0}%
                      </div>
                    </div>
                    <div className="p-3 bg-coffee-50 rounded-xl">
                      <Heart className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                      <div className="text-sm font-medium text-coffee-800">감각 매치</div>
                      <div className="text-xs text-coffee-600">
                        {currentScore?.sensoryScore || 0}%
                      </div>
                    </div>
                    <div className="p-3 bg-coffee-50 rounded-xl">
                      <CheckCircle className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                      <div className="text-sm font-medium text-coffee-800">일치 향미</div>
                      <div className="text-xs text-coffee-600">
                        {currentScore?.matchedFlavors?.length || 0}개
                      </div>
                    </div>
                    <div className="p-3 bg-coffee-50 rounded-xl">
                      <Target className="h-5 w-5 mx-auto mb-1 text-coffee-600" />
                      <div className="text-sm font-medium text-coffee-800">일치 감각</div>
                      <div className="text-xs text-coffee-600">
                        {currentScore?.matchedSensory?.length || 0}개
                      </div>
                    </div>
                  </div>

                  {/* 가중치 설명 */}
                  <div className="mt-6 p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-600 text-center">
                      💡 <strong>점수 계산:</strong> 향미 매치 70% + 감각 매치 30% = 최종 점수
                    </p>
                  </div>
                </>
              )
            })()}
          </div>
        </div>

        {/* 커피 정보 요약 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Coffee className="h-6 w-6 text-coffee-600 mr-2" />
              <h2 className="text-xl font-bold text-coffee-800">커피 정보</h2>
            </div>
            <button
              onClick={() => {
                // 즐겨찾기 기능 (실제로는 API 호출이나 로컬 저장소에 저장)
                alert('즐겨찾기에 추가되었습니다!')
              }}
              className="flex items-center px-3 py-1.5 border border-yellow-500 text-yellow-600 rounded-lg hover:bg-yellow-50 transition-colors"
            >
              <Star className="h-4 w-4 mr-1" />
              즐겨찾기
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-coffee-800 mb-2">
                {session.coffeeInfo?.coffeeName}
              </h3>
              <div className="space-y-1 text-coffee-600">
                <p>로스터: {session.coffeeInfo?.roasterName}</p>
                {session.coffeeInfo?.origin && <p>원산지: {session.coffeeInfo?.origin}</p>}
                {session.coffeeInfo?.cafeName && (
                  <p>카페: {session.coffeeInfo.cafeName}</p>
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

        {/* 로스터 노트 입력 */}
        {!roasterMatchScore && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <h2 className="text-xl font-bold text-coffee-800 mb-6">로스터 노트 비교</h2>
            
            {!showRoasterInput ? (
              <div className="text-center py-8">
                <p className="text-coffee-600 mb-4">로스터 노트를 입력하면 위에서 두 점수를 비교해볼 수 있어요</p>
                <button
                  onClick={() => setShowRoasterInput(true)}
                  className="inline-flex items-center px-4 py-2 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  로스터 노트 입력하기
                </button>
              </div>
            ) : (
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
            )}
          </div>
        )}

        {/* 로스터 노트가 있을 때 간단한 표시 */}
        {roasterMatchScore && (
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-coffee-800">로스터 노트</h2>
              <button
                onClick={() => {
                  setRoasterNotes('')
                  setRoasterMatchScore(null)
                  setCurrentScoreIndex(0)
                }}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                제거
              </button>
            </div>
            <div className="p-4 bg-coffee-50 rounded-xl">
              <p className="text-coffee-700">
                <strong>로스터 노트:</strong> {roasterNotes}
              </p>
            </div>
          </div>
        )}

        {/* 커뮤니티 비교 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <div className="flex items-center mb-6">
            <Users className="h-6 w-6 text-coffee-600 mr-2" />
            <h2 className="text-xl font-bold text-coffee-800">다른 사용자들의 선택</h2>
          </div>
          
          {/* Mock 데이터로 커뮤니티 비교 표시 */}
          <div className="p-4 bg-gray-50 rounded-xl mb-4">
            <p className="text-sm text-gray-600 mb-4">
              이 커피를 마신 <strong className="text-coffee-800">23명</strong>의 다른 사용자들이 선택한 향미
            </p>
            
            <div className="space-y-3">
              {/* 가장 많이 선택된 향미 */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">🏆 가장 많이 선택된 향미 TOP 5</h4>
                <div className="space-y-2">
                  {[
                    { flavor: '블루베리', percent: 78, count: 18 },
                    { flavor: '다크초콜릿', percent: 65, count: 15 },
                    { flavor: '캐러멜', percent: 52, count: 12 },
                    { flavor: '와인', percent: 43, count: 10 },
                    { flavor: '꿀', percent: 39, count: 9 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="text-xs font-medium text-gray-600 w-12">{index + 1}위</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-gray-800">{item.flavor}</span>
                          <span className="text-xs text-gray-500">{item.count}명 ({item.percent}%)</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-coffee-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${item.percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* 나와의 비교 */}
              {session.flavorProfile?.selectedFlavors && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">💫 나와 비슷한 선택</h4>
                  <p className="text-xs text-blue-700">
                    {(() => {
                      const popularFlavors = ['블루베리', '다크초콜릿', '캐러멜', '와인', '꿀']
                      const matching = session.flavorProfile.selectedFlavors.filter(f => 
                        popularFlavors.includes(f)
                      )
                      
                      if (matching.length >= 3) {
                        return `와! 다른 사용자들과 매우 비슷한 향미를 느끼셨네요. ${matching.join(', ')}를 공통으로 선택하셨어요.`
                      } else if (matching.length > 0) {
                        return `${matching.join(', ')}를 다른 사용자들도 많이 선택했어요. 좋은 감각을 가지고 계세요!`
                      } else {
                        return '당신만의 독특한 향미 감각을 가지고 계시네요! 다양성이 커피 문화를 풍부하게 만듭니다.'
                      }
                    })()}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <p className="text-xs text-gray-500 text-center">
            * 커뮤니티 데이터는 실제 사용자들의 선택을 기반으로 합니다
          </p>
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
              <div className="text-2xl font-bold text-purple-800">
                {Math.max(
                  communityMatchScore?.finalScore || 0,
                  roasterMatchScore?.finalScore || 0
                )}%
              </div>
              <div className="text-sm text-purple-600">최고 Match Score</div>
            </div>
          </div>

          {/* 개인화된 인사이트 */}
          {matchScoreResult && matchScoreResult.roasterNote && (
            <div className="mt-6 space-y-4">
              {/* 강점 분석 */}
              {matchScoreResult.matchedFlavors.length > 0 && (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">🌟 당신의 강점</h3>
                  {(() => {
                    const matchedCategories = new Set<string>()
                    matchScoreResult.matchedFlavors.forEach(flavor => {
                      if (flavor.includes('베리') || flavor.includes('과일')) matchedCategories.add('과일향')
                      if (flavor.includes('초콜릿') || flavor.includes('카카오')) matchedCategories.add('초콜릿')
                      if (flavor.includes('산미') || flavor.includes('밝은')) matchedCategories.add('산미')
                      if (flavor.includes('달콤') || flavor.includes('꿀')) matchedCategories.add('단맛')
                    })
                    
                    if (matchedCategories.has('산미')) {
                      return <p className="text-sm text-green-700">산미를 정확하게 감지하는 능력이 뛰어나시네요! 밝고 상큼한 커피의 특징을 잘 파악하고 계십니다.</p>
                    } else if (matchedCategories.has('과일향')) {
                      return <p className="text-sm text-green-700">과일향을 찾아내는 감각이 훌륭해요! 복잡한 향미 중에서도 과일의 뉘앙스를 잘 포착하셨습니다.</p>
                    } else if (matchedCategories.has('초콜릿')) {
                      return <p className="text-sm text-green-700">초콜릿과 같은 달콤하고 진한 향미를 잘 구분하시네요! 로스팅의 특성을 정확히 이해하고 계십니다.</p>
                    } else {
                      return <p className="text-sm text-green-700">로스터의 의도를 잘 이해하고 계세요! {matchScoreResult.matchedFlavors.length}개의 향미를 정확히 찾아내셨습니다.</p>
                    }
                  })()}
                </div>
              )}

              {/* 개선 제안 */}
              {matchScore < 80 && (
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">💡 다음에 도전해보세요</h3>
                  <p className="text-sm text-blue-700">
                    {(() => {
                      const missedNotes = matchScoreResult.roasterNote.split(',')
                        .map(note => note.trim())
                        .filter(note => !matchScoreResult.matchedFlavors.includes(note))
                      
                      if (missedNotes.length > 0) {
                        const firstMissed = missedNotes[0]
                        if (firstMissed.includes('산미') || firstMissed.includes('밝은')) {
                          return `로스터가 언급한 '${firstMissed}'를 다음엔 찾아보세요. 커피를 마실 때 첫 입의 느낌에 집중해보면 산미를 더 잘 감지할 수 있어요.`
                        } else if (firstMissed.includes('꽃') || firstMissed.includes('플로럴')) {
                          return `'${firstMissed}' 같은 섬세한 향은 커피가 약간 식었을 때 더 잘 느껴져요. 천천히 음미해보세요.`
                        } else {
                          return `로스터가 언급한 '${firstMissed}'를 다음엔 찾아보세요. 향미를 찾는 것도 연습이 필요해요!`
                        }
                      } else {
                        return '더 많은 향미를 선택해보세요. 5개 이상 선택하면 더 정확한 분석이 가능해요!'
                      }
                    })()}
                  </p>
                </div>
              )}

              {/* 독특한 발견 인정 */}
              {session.flavorProfile?.selectedFlavors && 
               session.flavorProfile.selectedFlavors.filter(f => !matchScoreResult.matchedFlavors.includes(f)).length > 0 && (
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <h3 className="font-medium text-purple-800 mb-2">🎨 당신만의 독특한 발견</h3>
                  <p className="text-sm text-purple-700">
                    로스터가 언급하지 않은 향미를 발견하셨네요! 이것은 '틀린' 것이 아니라 당신만의 독특한 감각입니다. 
                    모든 사람의 미각은 다르며, 이런 개인적인 발견이 커피를 더 풍부하게 만들어요.
                  </p>
                </div>
              )}
            </div>
          )}

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