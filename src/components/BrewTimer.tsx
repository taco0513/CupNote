'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Clock, Plus, RotateCcw } from 'lucide-react'

interface LapTime {
  time: number
  note: string
  timestamp: Date
}

interface PouringPhase {
  name: string
  targetTime: number // 초
  waterAmount: number // ml
  instruction: string
}

interface BrewTimerProps {
  dripper: string
  totalWaterAmount: number
  onTimerComplete: (timerData: TimerData) => void
  onClose: () => void
}

interface TimerData {
  totalTime: number
  lapTimes: LapTime[]
  completed: boolean
}

// 드리퍼별 푸어링 가이드
const POURING_GUIDES: Record<string, PouringPhase[]> = {
  v60: [
    {
      name: 'Pre-infusion',
      targetTime: 45,
      waterAmount: 0, // 젖히는 정도
      instruction: '원두 전체를 고르게 젖혀주세요'
    },
    {
      name: '1차 푸어링',
      targetTime: 90,
      waterAmount: 100,
      instruction: '중앙에서 시작해서 원형으로 천천히'
    },
    {
      name: '2차 푸어링', 
      targetTime: 150,
      waterAmount: 100,
      instruction: '일정한 속도로 계속 부어주세요'
    },
    {
      name: '3차 푸어링',
      targetTime: 210,
      waterAmount: 120,
      instruction: '마지막 물을 천천히 부어 마무리'
    }
  ],
  kalita: [
    {
      name: 'Pre-infusion',
      targetTime: 30,
      waterAmount: 0,
      instruction: '중앙에 집중해서 젖혀주세요'
    },
    {
      name: '연속 푸어링',
      targetTime: 180,
      waterAmount: 320,
      instruction: '중앙에서 일정한 속도로 연속해서'
    }
  ],
  origami: [
    {
      name: 'Pre-infusion',
      targetTime: 45,
      waterAmount: 0,
      instruction: '원두 전체를 부드럽게 젖혀주세요'
    },
    {
      name: '1차 푸어링',
      targetTime: 90,
      waterAmount: 120,
      instruction: '중앙에서 시작해서 나선형으로'
    },
    {
      name: '2차 푸어링',
      targetTime: 150,
      waterAmount: 100,
      instruction: '일정한 높이에서 천천히'
    },
    {
      name: '3차 푸어링',
      targetTime: 210,
      waterAmount: 100,
      instruction: '마지막 물을 조심스럽게'
    }
  ],
  april: [
    {
      name: 'Pre-infusion',
      targetTime: 30,
      waterAmount: 0,
      instruction: '중앙에 집중해서 고르게 젖혀주세요'
    },
    {
      name: '1차 푸어링',
      targetTime: 90,
      waterAmount: 150,
      instruction: '플랫 베드 특성상 중앙 집중'
    },
    {
      name: '2차 푸어링',
      targetTime: 180,
      waterAmount: 170,
      instruction: '일정한 속도로 마무리'
    }
  ]
}

export default function BrewTimer({ dripper, totalWaterAmount, onTimerComplete, onClose }: BrewTimerProps) {
  const [time, setTime] = useState(0) // 경과 시간 (초)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lapTimes, setLapTimes] = useState<LapTime[]>([])
  const [currentPhase, setCurrentPhase] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout>()

  const phases = POURING_GUIDES[dripper] || []
  const currentPhaseData = phases[currentPhase]
  
  // 타이머 실행
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 1)
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, isPaused])

  // 시간 포맷팅
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 타이머 시작/일시정지
  const toggleTimer = () => {
    if (!isRunning) {
      setIsRunning(true)
      setIsPaused(false)
    } else {
      setIsPaused(!isPaused)
    }
  }

  // 타이머 정지
  const stopTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    
    // 타이머 데이터 전달
    const timerData: TimerData = {
      totalTime: time,
      lapTimes,
      completed: true
    }
    onTimerComplete(timerData)
  }

  // 리셋
  const resetTimer = () => {
    setTime(0)
    setIsRunning(false)
    setIsPaused(false)
    setLapTimes([])
    setCurrentPhase(0)
  }

  // 랩타임 기록
  const addLapTime = () => {
    const note = currentPhaseData ? `${currentPhaseData.name} 완료` : `${lapTimes.length + 1}단계`
    
    setLapTimes(prev => [...prev, {
      time,
      note,
      timestamp: new Date()
    }])

    // 다음 단계로 이동
    if (currentPhase < phases.length - 1) {
      setCurrentPhase(prev => prev + 1)
    }
  }

  // 현재 단계의 목표 시간과 비교
  const getPhaseStatus = () => {
    if (!currentPhaseData) return null
    
    const diff = time - currentPhaseData.targetTime
    if (Math.abs(diff) <= 5) return 'on-time'
    if (diff > 5) return 'over-time'
    if (diff < -5) return 'under-time'
    return 'approaching'
  }

  const phaseStatus = getPhaseStatus()

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            추출 타이머
          </h2>
          <p className="text-sm text-gray-600">
            {dripper.toUpperCase()} · {totalWaterAmount}ml
          </p>
        </div>

        {/* 메인 타이머 */}
        <div className="text-center mb-8">
          <div className="text-6xl font-mono font-bold text-green-600 mb-4">
            {formatTime(time)}
          </div>
          
          {/* 현재 단계 정보 */}
          {currentPhaseData && (
            <div className={`p-4 rounded-xl mb-4 ${
              phaseStatus === 'on-time' ? 'bg-green-50 border border-green-200' :
              phaseStatus === 'over-time' ? 'bg-red-50 border border-red-200' :
              phaseStatus === 'under-time' ? 'bg-blue-50 border border-blue-200' :
              'bg-gray-50 border border-gray-200'
            }`}>
              <div className="font-medium text-gray-800 mb-2">
                {currentPhaseData.name}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                목표: {formatTime(currentPhaseData.targetTime)}
                {currentPhaseData.waterAmount > 0 && ` · ${currentPhaseData.waterAmount}ml`}
              </div>
              <div className="text-sm text-gray-700">
                {currentPhaseData.instruction}
              </div>
            </div>
          )}
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={toggleTimer}
            className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center font-medium transition-colors ${
              !isRunning 
                ? 'bg-green-600 text-white hover:bg-green-700'
                : isPaused
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-yellow-500 text-white hover:bg-yellow-600'
            }`}
          >
            {!isRunning ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                시작
              </>
            ) : isPaused ? (
              <>
                <Play className="h-5 w-5 mr-2" />
                재개
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 mr-2" />
                일시정지
              </>
            )}
          </button>

          {isRunning && (
            <button
              onClick={addLapTime}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="h-5 w-5 mr-1" />
              단계
            </button>
          )}

          <button
            onClick={resetTimer}
            className="px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* 랩타임 기록 */}
        {lapTimes.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">단계별 기록</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {lapTimes.map((lap, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">{lap.note}</span>
                  <span className="font-mono font-medium">{formatTime(lap.time)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            onClick={stopTimer}
            disabled={!isRunning && time === 0}
            className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            <Square className="h-4 w-4 mr-2" />
            완료
          </button>
        </div>
      </div>
    </div>
  )
}