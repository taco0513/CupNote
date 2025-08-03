'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import Navigation from '../../../components/Navigation'
import { FLAVOR_COLORS, SENSORY_CATEGORY_NAMES } from '../../../lib/flavorData'
import { SupabaseStorage } from '../../../lib/supabase-storage'
import { CoffeeRecord, FlavorProfile, SensoryExpression } from '../../../types/coffee'

// 데모 데이터
const demoRecords = {
  'demo-1': {
    id: 'demo-1',
    coffeeName: '에티오피아 예가체프',
    roastery: '블루보틀 코리아',
    origin: '에티오피아',
    roastLevel: '라이트 로스트',
    date: '2024-08-01',
    createdAt: '2024-08-01T10:30:00Z',
    rating: 4.5,
    overall: 4.5,
    mode: 'cafe',
    taste: '밝은 산미와 플로럴한 향이 인상적이었어요. 레몬 같은 시트러스 노트와 꽃 향기가 조화롭게 어우러져 정말 상쾌한 느낌이었습니다. 처음 마셔본 싱글 오리진인데 이렇게 복잡하고 다층적인 맛이 날 수 있다는 게 놀라웠어요.',
    roasterNote: '블루보틀만의 정교한 로스팅으로 에티오피아 예가체프 특유의 플로럴한 아로마와 밝은 산미를 극대화했습니다. 베르가못, 자스민, 레몬의 복합적인 풍미를 경험하실 수 있습니다.',
    memo: '첫 블루보틀 방문이었는데 정말 만족스러웠어요! 다음에는 다른 싱글 오리진도 도전해보고 싶습니다.',
    tags: ['밝은', '플로럴', '산미', '시트러스', '상쾌한'],
    selectedFlavors: [
      { id: 'floral', name: '플로럴', category: 'floral' },
      { id: 'citrus', name: '시트러스', category: 'fruity' },
      { id: 'bergamot', name: '베르가못', category: 'other' }
    ],
    sensoryExpressions: [
      { category: 'aroma', expressions: ['꽃향기', '레몬', '자스민'] },
      { category: 'taste', expressions: ['밝은', '상쾌한', '복합적인'] },
      { category: 'finish', expressions: ['깔끔한', '여운이 긴'] }
    ],
    matchScore: {
      overall: 92,
      flavorMatching: 95,
      expressionAccuracy: 88,
      consistency: 93,
      strengths: ['플로럴 노트 정확히 감지', '산미 표현 우수', '복합적 풍미 인식'],
      improvements: ['바디감 표현 보완 필요', '단맛 인지도 향상']
    },
    cafeData: {
      name: '블루보틀 성수점',
      location: '서울 성동구 성수이로 성수동',
      atmosphere: '모던하고 깔끔한 인더스트리얼 디자인'
    }
  },
  'demo-2': {
    id: 'demo-2',
    coffeeName: '콜롬비아 수프리모',
    roastery: '테라로사',
    origin: '콜롬비아',
    roastLevel: '미디엄 로스트',
    date: '2024-07-28',
    createdAt: '2024-07-28T14:15:00Z',
    rating: 4.0,
    overall: 4.0,
    mode: 'homecafe',
    taste: 'V60으로 추출했는데 달콤하고 부드러운 맛이 좋았어요. 캐러멜과 초콜릿의 단맛이 적절히 조화되어 있고, 산미도 부담스럽지 않아 편안하게 마실 수 있었습니다.',
    roasterNote: '콜롬비아 수프리모 등급의 고품질 원두로, 균형 잡힌 단맛과 적당한 산미가 특징입니다. 초콜릿, 캐러멜, 견과류의 풍미를 느낄 수 있습니다.',
    memo: '원두 온도와 추출 시간을 더 연구해봐야겠습니다. 다음번엔 조금 더 세밀하게 조절해보고 싶어요.',
    tags: ['달콤', '부드러운', 'V60', '균형잡힌'],
    homecafeData: {
      dripper: 'V60 02',
      coffeeWeight: '20g',
      waterWeight: '320ml',
      ratio: '1:16',
      waterTemp: '92°C',
      brewTime: '3분 30초',
      grindSize: '중간',
      satisfaction: 4,
      notes: '첫 번째 푸어에서 30초 블룸, 전체 3분 30초로 추출. 단맛이 잘 나왔지만 다음번엔 물 온도를 조금 높여보고 싶음.',
      nextTry: '물 온도를 94°C로 올려보고, 추출 시간을 4분으로 늘려서 더 풍부한 맛을 끌어내보고 싶습니다.'
    },
    selectedFlavors: [
      { id: 'chocolate', name: '초콜릿', category: 'chocolate' },
      { id: 'caramel', name: '캐러멜', category: 'chocolate' },
      { id: 'nuts', name: '견과류', category: 'nutty' }
    ],
    sensoryExpressions: [
      { category: 'aroma', expressions: ['달콤한', '견과류', '초콜릿'] },
      { category: 'taste', expressions: ['부드러운', '균형잡힌', '깔끔한'] },
      { category: 'finish', expressions: ['편안한', '지속적인'] }
    ]
  },
  'demo-3': {
    id: 'demo-3',
    coffeeName: '과테말라 안티구아',
    roastery: '프리츠',
    origin: '과테말라',
    roastLevel: '미디엄 다크',
    date: '2024-07-25',
    createdAt: '2024-07-25T11:20:00Z',
    rating: 3.5,
    overall: 3.5,
    mode: 'cafe',
    taste: '진한 바디감과 초콜릿 향이 특징적이었어요. 스모키한 느낌도 있고 쓴맛이 적당히 있어서 묵직한 느낌입니다. 개인적으로는 조금 더 밝은 맛을 선호하는 것 같아요.',
    roasterNote: '과테말라 안티구아 지역의 화산토에서 자란 원두로, 깊은 바디감과 스모키한 풍미가 특징입니다. 다크 초콜릿과 향신료의 복합적인 맛을 즐기실 수 있습니다.',
    memo: '진한 커피를 좋아하는 분들께는 좋을 것 같아요. 저는 아직 이런 진한 맛에 익숙하지 않은 것 같습니다.',
    tags: ['진한', '초콜릿', '바디감', '스모키'],
    selectedFlavors: [
      { id: 'dark_chocolate', name: '다크 초콜릿', category: 'chocolate' },
      { id: 'smoky', name: '스모키', category: 'other' },
      { id: 'spice', name: '향신료', category: 'spicy' }
    ],
    sensoryExpressions: [
      { category: 'aroma', expressions: ['스모키', '향신료', '진한'] },
      { category: 'taste', expressions: ['묵직한', '깊은', '복합적인'] },
      { category: 'finish', expressions: ['오래가는', '쓴맛'] }
    ],
    cafeData: {
      name: '프리츠 카페',
      location: '서울 강남구',
      atmosphere: '아늑하고 클래식한 카페'
    }
  }
}

function getDemoRecord(id: string): CoffeeRecord | null {
  return demoRecords[id as keyof typeof demoRecords] || null
}

export default function CoffeeDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [record, setRecord] = useState<CoffeeRecord | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadRecord = async () => {
      const id = params.id as string
      if (id) {
        // 데모 데이터 처리
        if (id.startsWith('demo-')) {
          const demoData = getDemoRecord(id)
          setRecord(demoData)
          setLoading(false)
          return
        }
        
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
  const isDemoRecord = record.id.startsWith('demo-')
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {isDemoRecord ? (
        // 데모 기록용 액션
        <div className="text-center space-y-4">
          <div className="bg-coffee-50/80 border border-coffee-200/50 rounded-xl p-6">
            <p className="text-coffee-700 mb-4">
              🎯 이것은 데모 기록입니다. 실제 기능을 체험하려면 회원가입 후 나만의 기록을 작성해보세요!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push('/auth')}
                className="flex items-center justify-center px-6 py-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors font-medium"
              >
                👤 회원가입하기
              </button>
              <button
                onClick={() => router.push('/mode-selection')}
                className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium"
              >
                ☕ 바로 기록하기
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
                className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                📱 공유하기
              </button>
            </div>
          </div>
        </div>
      ) : (
        // 일반 기록용 액션
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
      )}
    </div>
  )
}
