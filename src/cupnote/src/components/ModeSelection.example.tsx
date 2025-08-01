/**
 * Mode Selection 화면 예시
 * Token System을 활용한 4-Mode 선택 화면
 */

'use client'

import { useRouter } from 'next/navigation'
import { 
  TASTING_MODES_CONFIG, 
  getAllModes, 
  getModeColor,
  getModeGradient,
  UI_LABELS 
} from '@/config'

export default function ModeSelectionExample() {
  const router = useRouter()
  const modes = getAllModes()

  const handleModeSelect = (modeId: string) => {
    // 세션 스토리지에 모드 저장
    sessionStorage.setItem('selectedMode', modeId)
    
    // 해당 모드의 라우트로 이동
    const mode = TASTING_MODES_CONFIG[modeId as keyof typeof TASTING_MODES_CONFIG]
    router.push(mode.route + '/step1')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-coffee-800 mb-4">
            {UI_LABELS.record.selectMode}
          </h1>
          <p className="text-lg text-coffee-600">
            {UI_LABELS.tips.selectMode}
          </p>
        </div>

        {/* 모드 선택 그리드 */}
        <div className="grid md:grid-cols-2 gap-6">
          {modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleModeSelect(mode.id)}
              className={`
                group relative overflow-hidden rounded-2xl p-8
                bg-gradient-to-br ${getModeGradient(mode.id)}
                border-2 ${getModeColor(mode.id)}
                hover:shadow-xl transition-all duration-300
                transform hover:-translate-y-1
              `}
            >
              {/* 아이콘 */}
              <div className="text-6xl mb-4">{mode.icon}</div>
              
              {/* 모드 이름 */}
              <h3 className="text-2xl font-bold mb-2">{mode.labelKr}</h3>
              <p className="text-sm opacity-75 mb-4">{mode.label}</p>
              
              {/* 설명 */}
              <p className="text-base mb-4">{mode.description}</p>
              
              {/* 메타 정보 */}
              <div className="flex items-center justify-between text-sm opacity-75">
                <span>📝 {mode.steps}단계</span>
                <span>⏱️ {mode.estimatedTime}</span>
              </div>
              
              {/* 대상 사용자 */}
              <div className="mt-4 pt-4 border-t border-opacity-20">
                <p className="text-sm font-medium">{mode.target}</p>
              </div>

              {/* 호버 효과 */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </button>
          ))}
        </div>

        {/* 하단 설명 */}
        <div className="mt-10 grid md:grid-cols-2 gap-6 text-sm">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <h4 className="font-bold text-blue-800 mb-2">
              🏪 남이 내려준 커피
            </h4>
            <p className="text-blue-700">
              <strong>Quick Mode</strong>: {UI_LABELS.tips.quickMode}<br />
              <strong>Cafe Mode</strong>: {UI_LABELS.tips.cafeMode}
            </p>
          </div>
          
          <div className="bg-green-50 rounded-xl p-6 border border-green-200">
            <h4 className="font-bold text-green-800 mb-2">
              🏠 직접 내린 커피
            </h4>
            <p className="text-green-700">
              <strong>HomeCafe Mode</strong>: {UI_LABELS.tips.homecafeMode}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * 이 예시의 핵심 포인트:
 * 
 * 1. TASTING_MODES_CONFIG에서 모든 모드 정보를 가져옴
 * 2. UI_LABELS에서 모든 텍스트를 가져옴
 * 3. 모드 이름을 변경하려면 config 파일만 수정하면 됨
 * 4. 새로운 모드를 추가하려면 config에 추가하고 라우팅만 설정
 * 5. 타입 안전성이 보장되어 자동완성과 오류 검출 가능
 */