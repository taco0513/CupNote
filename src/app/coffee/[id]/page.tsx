'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Navigation from '../../../components/Navigation'
import { FLAVOR_COLORS, SENSORY_CATEGORY_NAMES } from '../../../lib/flavorData'
import { SupabaseStorage } from '../../../lib/supabase-storage'
import { CoffeeRecord, FlavorProfile, SensoryExpression } from '../../../types/coffee'

export default function CoffeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [record, setRecord] = useState<CoffeeRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecord = async () => {
      const id = params.id as string
      if (id) {
        const foundRecord = await SupabaseStorage.getRecordById(id)
        setRecord(foundRecord)
        setLoading(false)
      }
    }

    loadRecord()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">커피 기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">☕</div>
          <h1 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
            기록을 찾을 수 없습니다
          </h1>
          <p className="text-coffee-600 mb-6">요청하신 커피 기록이 존재하지 않습니다.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-coffee-600 text-white rounded-full hover:bg-coffee-700 transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 max-w-6xl">
        <Navigation showBackButton currentPage="detail" />

        {/* 헤더 */}
        <HeaderSection record={record} router={router} />

        {/* 메인 컨텐트 */}
        <div className="space-y-8">
          {/* 기본 정보 카드 */}
          <BasicInfoCard record={record} />

          {/* 모드별 특화 정보 */}
          {record.mode && <ModeSpecificSection record={record} />}

          {/* 향미 프로파일 */}
          <FlavorProfileSection record={record} />

          {/* Match Score 분석 */}
          {record.matchScore && <MatchScoreSection matchScore={record.matchScore} />}

          {/* 개인 평가 및 코멘트 */}
          <PersonalEvaluationSection record={record} />

          {/* 액션 버튼 */}
          <ActionButtonsSection record={record} router={router} />
        </div>
      </div>
    </div>
  )
}

// 헤더 컴포넌트
function HeaderSection({ record, router }: { record: CoffeeRecord; router: any }) {
  const getModeDisplay = (mode?: string, tasteMode?: string) => {
    if (mode === 'cafe') return { icon: '🏪', text: 'Cafe', color: 'bg-blue-100 text-blue-800' }
    if (mode === 'homecafe')
      return { icon: '🏠', text: 'HomeCafe', color: 'bg-green-100 text-green-800' }

    // 기본 모드 (tasteMode 기반)
    if (tasteMode === 'simple')
      return { icon: '🌱', text: '편하게', color: 'bg-green-100 text-green-800' }
    return { icon: '🎯', text: '전문가', color: 'bg-blue-100 text-blue-800' }
  }

  const modeDisplay = getModeDisplay(record.mode, record.tasteMode)

  return (
    <div className="flex items-center justify-between mb-8 bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center">
        <button
          onClick={() => router.push('/')}
          className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          ← 뒤로가기
        </button>
        <div>
          <h1 className="text-2xl font-bold text-coffee-800 mb-1">☕ {record.coffeeName}</h1>
          <p className="text-gray-600">
            {record.date} · {new Date(record.createdAt).toLocaleString('ko-KR')}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${modeDisplay.color}`}>
          {modeDisplay.icon} {modeDisplay.text}
        </span>
        {record.rating && (
          <div className="flex items-center">
            {'⭐'.repeat(record.rating)}
            {'☆'.repeat(5 - record.rating)}
          </div>
        )}
      </div>
    </div>
  )
}

// 기본 정보 카드
function BasicInfoCard({ record }: { record: CoffeeRecord }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-semibold text-coffee-800 mb-6">기본 정보</h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <InfoItem icon="☕" label="커피명" value={record.coffeeName} />
        {record.roastery && <InfoItem icon="🏪" label="로스터리" value={record.roastery} />}
        {record.origin && <InfoItem icon="🌍" label="원산지" value={record.origin} />}
        {record.roastLevel && <InfoItem icon="🔥" label="로스팅" value={record.roastLevel} />}
        {record.temperature && <InfoItem icon="🌡️" label="온도" value={record.temperature} />}
        <InfoItem icon="📅" label="기록일" value={record.date} />
      </div>

      {/* 이미지 섹션 */}
      {record.images && record.images.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-coffee-800 mb-4">📸 사진</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {record.images.map((imageUrl, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`${record.coffeeName} ${index + 1}`}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                  onClick={() => window.open(imageUrl, '_blank')}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 정보 아이템 컴포넌트
function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center space-x-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-sm text-coffee-600">{label}</p>
        <p className="font-medium text-coffee-800">{value}</p>
      </div>
    </div>
  )
}

// 모드별 특화 섹션
function ModeSpecificSection({ record }: { record: CoffeeRecord }) {
  if (record.mode === 'homecafe' && record.homecafeData) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-xl font-semibold text-coffee-800 mb-6">🏠 HomeCafe 추출 정보</h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {record.homecafeData.dripper && (
            <InfoItem icon="☕" label="드리퍼" value={record.homecafeData.dripper} />
          )}
          {record.homecafeData.ratio && (
            <InfoItem
              icon="⚖️"
              label="레시피"
              value={`${record.homecafeData.coffeeWeight}g : ${record.homecafeData.waterWeight}ml (${record.homecafeData.ratio})`}
            />
          )}
          {record.homecafeData.waterTemp && (
            <InfoItem icon="🌡️" label="물온도" value={`${record.homecafeData.waterTemp}°C`} />
          )}
          {record.homecafeData.brewTime && (
            <InfoItem icon="⏱️" label="추출시간" value={record.homecafeData.brewTime} />
          )}
          {record.homecafeData.grindSize && (
            <InfoItem icon="🌰" label="분쇄도" value={record.homecafeData.grindSize} />
          )}
          {record.homecafeData.satisfaction && (
            <InfoItem icon="⭐" label="만족도" value={`${record.homecafeData.satisfaction}/5`} />
          )}
        </div>

        {record.homecafeData.notes && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-800 mb-2">🔬 실험 노트</h3>
            <p className="text-gray-700 bg-green-50 p-4 rounded-xl">{record.homecafeData.notes}</p>
          </div>
        )}

        {record.homecafeData.nextTry && (
          <div>
            <h3 className="font-medium text-gray-800 mb-2">💡 다음번 시도</h3>
            <p className="text-gray-700 bg-yellow-50 p-4 rounded-xl">
              {record.homecafeData.nextTry}
            </p>
          </div>
        )}
      </div>
    )
  }

  // Pro/Lab mode removed - features migrated to HomeCafe mode
  // Legacy records with pro mode are displayed as HomeCafe mode

  return null
}

// 향미 프로파일 섹션
function FlavorProfileSection({ record }: { record: CoffeeRecord }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-semibold text-coffee-800 mb-6">향미 프로파일</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {/* 내 맛 평가 */}
        <div>
          <h3 className="text-lg font-medium text-coffee-800 mb-4">
            {record.tasteMode === 'simple' ? '내가 느낀 맛' : '테이스팅 노트'}
          </h3>
          <div className="bg-coffee-50 rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed">{record.taste || '맛 기록이 없습니다.'}</p>
          </div>
        </div>

        {/* 로스터 노트 */}
        {record.roasterNote && (
          <div>
            <h3 className="text-lg font-medium text-coffee-800 mb-4">로스터 노트</h3>
            <div className="bg-amber-50 rounded-xl p-6">
              <p className="text-gray-700 leading-relaxed">{record.roasterNote}</p>
            </div>
          </div>
        )}
      </div>

      {/* 선택된 향미 */}
      {record.selectedFlavors && record.selectedFlavors.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-coffee-800 mb-4">🎯 선택된 향미</h3>
          <div className="flex flex-wrap gap-2">
            {record.selectedFlavors.map(flavor => (
              <FlavorChip key={flavor.id} flavor={flavor} />
            ))}
          </div>
        </div>
      )}

      {/* 감각 표현 */}
      {record.sensoryExpressions && record.sensoryExpressions.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-medium text-coffee-800 mb-4">💭 감각 표현</h3>
          <div className="grid md:grid-cols-2 gap-6">
            {record.sensoryExpressions.map(sensory => (
              <SensoryExpressionItem key={sensory.category} sensory={sensory} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 향미 칩 컴포넌트
function FlavorChip({ flavor }: { flavor: FlavorProfile }) {
  const colors = FLAVOR_COLORS[flavor.category]
  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium border ${colors.bg} ${colors.border} ${colors.text}`}
    >
      {flavor.name}
    </span>
  )
}

// 감각 표현 아이템
function SensoryExpressionItem({ sensory }: { sensory: SensoryExpression }) {
  const categoryName = SENSORY_CATEGORY_NAMES[sensory.category]

  return (
    <div>
      <h4 className="font-medium text-gray-800 mb-2">{categoryName}</h4>
      <div className="flex flex-wrap gap-1">
        {sensory.expressions.map((expression, index) => (
          <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">
            {expression}
          </span>
        ))}
      </div>
    </div>
  )
}

// Match Score 분석 섹션
function MatchScoreSection({ matchScore }: { matchScore: any }) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50'
    if (score >= 80) return 'text-blue-600 bg-blue-50'
    if (score >= 70) return 'text-yellow-600 bg-yellow-50'
    return 'text-red-600 bg-red-50'
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-semibold text-coffee-800 mb-6">💯 Match Score 분석</h2>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className={`text-center p-4 rounded-xl ${getScoreColor(matchScore.overall)}`}>
          <div className="text-3xl font-bold mb-1">{matchScore.overall}%</div>
          <div className="text-sm">전체 점수</div>
        </div>
        <div className={`text-center p-4 rounded-xl ${getScoreColor(matchScore.flavorMatching)}`}>
          <div className="text-2xl font-bold mb-1">{matchScore.flavorMatching}%</div>
          <div className="text-sm">향미 매칭</div>
        </div>
        <div
          className={`text-center p-4 rounded-xl ${getScoreColor(matchScore.expressionAccuracy)}`}
        >
          <div className="text-2xl font-bold mb-1">{matchScore.expressionAccuracy}%</div>
          <div className="text-sm">표현 정확도</div>
        </div>
        <div className={`text-center p-4 rounded-xl ${getScoreColor(matchScore.consistency)}`}>
          <div className="text-2xl font-bold mb-1">{matchScore.consistency}%</div>
          <div className="text-sm">일관성</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {matchScore.strengths && matchScore.strengths.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-3">🎯 강점</h3>
            <ul className="space-y-2">
              {matchScore.strengths.map((strength: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center text-green-700 bg-green-50 px-3 py-2 rounded-lg"
                >
                  <span className="mr-2">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchScore.improvements && matchScore.improvements.length > 0 && (
          <div>
            <h3 className="font-medium text-gray-800 mb-3">💡 개선점</h3>
            <ul className="space-y-2">
              {matchScore.improvements.map((improvement: string, index: number) => (
                <li
                  key={index}
                  className="flex items-center text-orange-700 bg-orange-50 px-3 py-2 rounded-lg"
                >
                  <span className="mr-2">→</span>
                  {improvement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

// 개인 평가 섹션
function PersonalEvaluationSection({ record }: { record: CoffeeRecord }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-xl font-semibold text-coffee-800 mb-6">개인 평가 및 코멘트</h2>

      {/* 개인 메모 */}
      {record.memo && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-800 mb-3">📝 개인 코멘트</h3>
          <div className="bg-gray-50 rounded-xl p-6">
            <p className="text-gray-700 leading-relaxed italic">{record.memo}</p>
          </div>
        </div>
      )}

      {/* 태그 */}
      {record.tags && record.tags.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-800 mb-3">🏷️ 태그</h3>
          <div className="flex flex-wrap gap-2">
            {record.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// 액션 버튼 섹션
function ActionButtonsSection({ record, router }: { record: CoffeeRecord; router: any }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => router.push(`/record?edit=${record.id}`)}
          className="flex items-center justify-center px-6 py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
        >
          📝 편집하기
        </button>
        <button
          onClick={async () => {
            if (confirm('정말 이 기록을 삭제하시겠습니까?')) {
              const success = await SupabaseStorage.deleteRecord(record.id)
              if (success) {
                window.dispatchEvent(new CustomEvent('cupnote-record-deleted'))
                router.push('/')
              } else {
                alert('삭제 중 오류가 발생했습니다.')
              }
            }
          }}
          className="flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          🗑️ 삭제하기
        </button>
        <button
          onClick={() => {
            const shareText = `☕ ${record.coffeeName}\n${record.roastery ? `🏪 ${record.roastery}\n` : ''}${record.taste}\n\n#CupNote #커피기록`
            if (navigator.share) {
              navigator.share({
                title: `CupNote - ${record.coffeeName}`,
                text: shareText,
              })
            } else {
              navigator.clipboard.writeText(shareText)
              alert('클립보드에 복사되었습니다!')
            }
          }}
          className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
        >
          📱 공유하기
        </button>
      </div>
    </div>
  )
}
