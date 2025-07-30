'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CoffeeRecord, TasteMode } from '@/types/coffee'
import { LocalStorage } from '@/lib/storage'
import Navigation from '@/components/Navigation'

export default function RecordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const selectedMode = searchParams.get('mode') as 'cafe' | 'homecafe' | 'lab' | null

  const [mode, setMode] = useState<TasteMode>('simple')
  const [coffeeMode, setCoffeeMode] = useState<'cafe' | 'homecafe' | 'lab'>('cafe')
  const [record, setRecord] = useState<Partial<CoffeeRecord>>({
    date: new Date().toISOString().split('T')[0],
    tasteMode: 'simple',
    mode: 'cafe'
  })
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)

  const [submitting, setSubmitting] = useState(false)

  // 모드 파라미터 처리
  useEffect(() => {
    if (selectedMode && !isEditMode) {
      setCoffeeMode(selectedMode)
      setRecord(prev => ({ ...prev, mode: selectedMode }))
      
      // 모드별 기본 tasteMode 설정
      if (selectedMode === 'cafe') {
        setMode('simple')
        setRecord(prev => ({ ...prev, tasteMode: 'simple' }))
      } else if (selectedMode === 'homecafe') {
        setMode('simple')
        setRecord(prev => ({ ...prev, tasteMode: 'simple' }))
      } else if (selectedMode === 'lab') {
        setMode('advanced')
        setRecord(prev => ({ ...prev, tasteMode: 'advanced' }))
      }
    }
  }, [selectedMode, isEditMode])

  // 편집 모드인 경우 기존 기록 로드
  useEffect(() => {
    if (editId) {
      setLoading(true)
      const existingRecord = LocalStorage.getRecordById(editId)
      if (existingRecord) {
        setRecord(existingRecord)
        setMode(existingRecord.tasteMode)
        setIsEditMode(true)
      } else {
        alert('편집할 기록을 찾을 수 없습니다.')
        router.push('/')
      }
      setLoading(false)
    }
  }, [editId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!record.coffeeName) {
      alert('커피 이름을 입력해주세요')
      return
    }

    try {
      setSubmitting(true)

      const recordToSubmit = {
        coffeeName: record.coffeeName,
        roastery: record.roastery || '',
        date: record.date || new Date().toISOString().split('T')[0],
        taste: record.taste || '',
        roasterNote: record.roasterNote || '',
        tasteMode: mode,
        memo: record.memo || '',
      }

      let savedRecord

      if (isEditMode && editId) {
        // 편집 모드: 기존 기록 업데이트
        savedRecord = LocalStorage.updateRecord(editId, recordToSubmit)
        console.log('커피 기록 수정됨:', savedRecord)
      } else {
        // 추가 모드: 새 기록 생성
        savedRecord = LocalStorage.addRecord(recordToSubmit)
        console.log('커피 기록 저장됨:', savedRecord)
      }

      // 다른 컴포넌트에 변경사항 알림
      window.dispatchEvent(new CustomEvent('cupnote-record-added'))

      // 편집 모드면 상세 페이지로, 추가 모드면 결과 페이지로 이동
      if (isEditMode && editId) {
        router.push(`/coffee/${editId}`)
      } else {
        router.push(`/result?id=${savedRecord.id}`)
      }
    } catch (error) {
      console.error('기록 저장 오류:', error)
      alert('기록 저장 중 오류가 발생했습니다')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />
        
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => (isEditMode ? router.push(`/coffee/${editId}`) : router.push('/mode-selection'))}
              className="mr-4 p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              ← 뒤로
            </button>
            <h1 className="text-3xl font-bold text-coffee-800">
              {isEditMode ? '커피 기록 편집' : '새 커피 기록'}
            </h1>
          </div>
          
          {/* 선택된 모드 표시 */}
          {!isEditMode && selectedMode && (
            <div className="flex items-center space-x-3">
              <div className={`
                flex items-center px-4 py-2 rounded-full text-sm font-medium
                ${coffeeMode === 'cafe' ? 'bg-blue-100 text-blue-800' :
                  coffeeMode === 'homecafe' ? 'bg-green-100 text-green-800' :
                  'bg-purple-100 text-purple-800'}
              `}>
                {coffeeMode === 'cafe' && '☕ 카페 모드'}
                {coffeeMode === 'homecafe' && '🏠 홈카페 모드'}
                {coffeeMode === 'lab' && '🔬 랩 모드'}
              </div>
              <span className="text-coffee-600 text-sm">
                {coffeeMode === 'cafe' && '카페에서 간단히 기록'}
                {coffeeMode === 'homecafe' && '집에서 내린 커피 + 레시피'}
                {coffeeMode === 'lab' && '전문적인 분석과 평가'}
              </span>
            </div>
          )}
        </div>
        </div>

        {/* 메인 폼 */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">커피 이름 *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
                  placeholder="예: 에티오피아 예가체프"
                  value={record.coffeeName || ''}
                  onChange={e => setRecord({ ...record, coffeeName: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">로스터리</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    placeholder="예: 블루보틀"
                    value={record.roastery || ''}
                    onChange={e => setRecord({ ...record, roastery: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                    value={record.date}
                    onChange={e => setRecord({ ...record, date: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 맛 표현 모드 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                어떻게 기록하시겠어요?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setMode('simple')}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                    mode === 'simple'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-800 shadow-md'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">🌱</div>
                  <div className="font-medium">편하게 쓰기</div>
                  <div className="text-sm text-gray-600">내 언어로 자유롭게</div>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('professional')}
                  className={`flex-1 py-4 px-6 rounded-xl border-2 transition-all ${
                    mode === 'professional'
                      ? 'border-coffee-600 bg-coffee-50 text-coffee-800 shadow-md'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-medium">전문가처럼</div>
                  <div className="text-sm text-gray-600">정확한 용어로</div>
                </button>
              </div>
            </div>

            {/* 맛 기록 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {mode === 'simple' ? '어떤 맛이었나요?' : '테이스팅 노트'}
              </label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent text-lg"
                rows={5}
                placeholder={
                  mode === 'simple'
                    ? '예: 새콤달콤한 사탕 같았어요. 차가워지니까 더 달았어요.'
                    : '예: 자몽, 베르가못, 꿀, 밝은 산미'
                }
                value={record.taste || ''}
                onChange={e => setRecord({ ...record, taste: e.target.value })}
              />
            </div>

            {/* 로스터 노트와 비교 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                로스터는 뭐라고 했나요? (선택)
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                placeholder="예: 블루베리, 다크초콜릿, 와인"
                value={record.roasterNote || ''}
                onChange={e => setRecord({ ...record, roasterNote: e.target.value })}
              />
            </div>

            {/* 추가 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">메모 (선택)</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                rows={3}
                placeholder="함께한 사람, 그날의 기분, 특별한 순간..."
                value={record.memo || ''}
                onChange={e => setRecord({ ...record, memo: e.target.value })}
              />
            </div>

            {/* 버튼 */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => (isEditMode ? router.push(`/coffee/${editId}`) : router.push('/'))}
                className="flex-1 py-3 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 px-6 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting
                  ? isEditMode
                    ? '수정 중...'
                    : '저장 중...'
                  : isEditMode
                    ? '수정하기'
                    : '기록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
