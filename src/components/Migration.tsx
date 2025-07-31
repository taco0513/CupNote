'use client'

import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface LocalRecord {
  id: string
  userId: string
  coffeeName: string
  roastery: string
  origin?: string
  roastLevel?: string
  date: string
  taste: string
  roasterNote?: string
  memo?: string
  rating: number
  mode: string
  createdAt?: string
  // 추가 필드들
  selectedFlavors?: any[]
  sensoryExpressions?: any[]
  tags?: string[]
  matchScore?: any
  homecafeData?: any
}

// Match Score 계산 함수 (Supabase의 함수와 동일한 로직)
function calculateMatchScore(
  rating: number,
  mode: string,
  tasteNotes: string,
  roasterNotes?: string
): number {
  let score = rating * 12 // 0-60 points

  // Mode bonus
  switch (mode) {
    case 'cafe':
      score += 10
      break
    case 'homecafe':
      score += 15
      break
    case 'lab':
      score += 20
      break
  }

  // Detail bonus
  let detailBonus = 0
  if (tasteNotes.length > 50) detailBonus = 10
  else if (tasteNotes.length > 20) detailBonus = 5

  if (roasterNotes && roasterNotes.length > 0) {
    detailBonus += 10
  }

  // Quality multiplier
  let qualityMultiplier = 1.0
  if (rating >= 4) qualityMultiplier = 1.2
  else if (rating <= 2) qualityMultiplier = 0.8

  score = Math.round((score + detailBonus) * qualityMultiplier)
  return Math.min(Math.max(score, 0), 100)
}

export default function Migration() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState('')

  const migrateData = async () => {
    setIsLoading(true)
    setError('')
    setResults([])

    try {
      // 1. 현재 사용자 확인
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다')
      }

      // 2. LocalStorage에서 데이터 가져오기
      const recordsData = localStorage.getItem('cupnote-records')
      if (!recordsData) {
        throw new Error('마이그레이션할 데이터가 없습니다')
      }

      const localRecords: LocalRecord[] = JSON.parse(recordsData)
      console.log('로컬 데이터:', localRecords)

      // 3. 이미 마이그레이션된 데이터 확인 (커피명 + 날짜로 중복 체크)
      const { data: existingRecords } = await supabase
        .from('coffee_records')
        .select('coffee_name, created_at')
        .eq('user_id', user.id)

      const existingRecords_keys =
        existingRecords?.map(r => `${r.coffee_name}_${r.created_at?.split('T')[0]}`) || []
      console.log('기존 데이터 키:', existingRecords_keys)

      const migrationResults = []

      // 4. 각 레코드 마이그레이션
      for (const record of localRecords) {
        // 이미 마이그레이션된 데이터는 스킵 (커피명 + 날짜로 체크)
        const recordKey = `${record.coffeeName}_${(record.createdAt || record.date)?.split('T')[0]}`
        if (existingRecords_keys.includes(recordKey)) {
          migrationResults.push({
            id: record.id,
            coffeeName: record.coffeeName,
            status: 'skipped',
            message: '이미 마이그레이션됨',
          })
          continue
        }

        try {
          // Match Score 계산
          const matchScore = calculateMatchScore(
            record.rating,
            record.mode,
            record.taste,
            record.roasterNote
          )

          // Supabase 스키마에 맞게 데이터 변환
          const supabaseRecord = {
            // id는 UUID로 자동 생성되므로 제외
            user_id: user.id, // 실제 Supabase user_id로 매핑
            coffee_name: record.coffeeName,
            roastery: record.roastery || null,
            origin: record.origin || null,
            roasting_level: record.roastLevel || null,
            brewing_method: null, // LocalStorage에 없는 필드
            rating: record.rating,
            taste_notes: record.taste,
            roaster_notes: record.roasterNote || null,
            personal_notes: record.memo || null,
            mode: record.mode,
            match_score: matchScore,
            created_at: record.createdAt || record.date + 'T00:00:00Z',
            updated_at: new Date().toISOString(),
          }

          // Supabase에 삽입
          const { data, error: insertError } = await supabase
            .from('coffee_records')
            .insert(supabaseRecord)
            .select()

          if (insertError) {
            throw insertError
          }

          migrationResults.push({
            id: record.id,
            coffeeName: record.coffeeName,
            status: 'success',
            message: `Match Score: ${matchScore}`,
            supabaseId: data?.[0]?.id,
          })
        } catch (recordError: any) {
          migrationResults.push({
            id: record.id,
            coffeeName: record.coffeeName,
            status: 'error',
            message: recordError.message || '알 수 없는 오류',
          })
        }
      }

      setResults(migrationResults)
    } catch (err: any) {
      setError(err.message || '마이그레이션 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }

  const clearLocalData = () => {
    if (confirm('LocalStorage의 커피 기록 데이터를 삭제하시겠습니까? (성취 데이터는 유지됩니다)')) {
      localStorage.removeItem('cupnote-records')
      alert('LocalStorage 데이터가 삭제되었습니다')
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">🔄 데이터 마이그레이션</h2>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            LocalStorage에 저장된 커피 기록을 Supabase 데이터베이스로 마이그레이션합니다.
          </p>

          <div className="flex gap-4">
            <button
              onClick={migrateData}
              disabled={isLoading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? '마이그레이션 중...' : '데이터 마이그레이션 시작'}
            </button>

            <button
              onClick={clearLocalData}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700"
            >
              LocalStorage 정리
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {results.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">마이그레이션 결과</h3>

            <div className="space-y-2">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded ${
                    result.status === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : result.status === 'skipped'
                        ? 'bg-yellow-50 border border-yellow-200'
                        : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium">{result.coffeeName}</span>
                      <span className="text-sm text-gray-500 ml-2">(ID: {result.id})</span>
                    </div>
                    <div className="text-right">
                      <div
                        className={`inline-block px-2 py-1 text-xs rounded ${
                          result.status === 'success'
                            ? 'bg-green-100 text-green-800'
                            : result.status === 'skipped'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {result.status === 'success'
                          ? '✅ 성공'
                          : result.status === 'skipped'
                            ? '⏭️ 스킵'
                            : '❌ 실패'}
                      </div>
                      <div className="text-sm text-gray-600">{result.message}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">총 {results.length}개 항목 처리 완료</div>
          </div>
        )}
      </div>
    </div>
  )
}
