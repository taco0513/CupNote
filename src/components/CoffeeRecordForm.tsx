'use client'

import { useState } from 'react'
import { CoffeeRecord, TasteMode } from '../types/coffee'

interface CoffeeRecordFormProps {
  onClose: () => void
}

export default function CoffeeRecordForm({ onClose }: CoffeeRecordFormProps) {
  const [mode, setMode] = useState<TasteMode>('simple')
  const [record, setRecord] = useState<Partial<CoffeeRecord>>({
    date: new Date().toISOString().split('T')[0],
    tasteMode: 'simple',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: API 연동
    console.log('커피 기록:', record)
    onClose()
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-coffee-800">새 커피 기록</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">커피 이름 *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              placeholder="예: 에티오피아 예가체프"
              value={record.coffeeName || ''}
              onChange={e => setRecord({ ...record, coffeeName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">로스터리</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                placeholder="예: 블루보틀"
                value={record.roastery || ''}
                onChange={e => setRecord({ ...record, roastery: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
                value={record.date}
                onChange={e => setRecord({ ...record, date: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* 맛 표현 모드 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            어떻게 기록하시겠어요?
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setMode('simple')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                mode === 'simple'
                  ? 'border-coffee-600 bg-coffee-50 text-coffee-800'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              🌱 편하게 쓰기
            </button>
            <button
              type="button"
              onClick={() => setMode('professional')}
              className={`flex-1 py-2 px-4 rounded-lg border-2 transition-colors ${
                mode === 'professional'
                  ? 'border-coffee-600 bg-coffee-50 text-coffee-800'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              🎯 전문가처럼
            </button>
          </div>
        </div>

        {/* 맛 기록 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {mode === 'simple' ? '어떤 맛이었나요?' : '테이스팅 노트'}
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            rows={4}
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            로스터는 뭐라고 했나요? (선택)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            placeholder="예: 블루베리, 다크초콜릿, 와인"
            value={record.roasterNote || ''}
            onChange={e => setRecord({ ...record, roasterNote: e.target.value })}
          />
        </div>

        {/* 추가 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">메모 (선택)</label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
            rows={3}
            placeholder="함께한 사람, 그날의 기분, 특별한 순간..."
            value={record.memo || ''}
            onChange={e => setRecord({ ...record, memo: e.target.value })}
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            className="flex-1 py-2 px-4 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
          >
            기록하기
          </button>
        </div>
      </form>
    </div>
  )
}
