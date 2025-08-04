/**
 * Phase 2 태블릿 레이아웃 시스템 테스트 페이지
 * TabletLayout, 분할 뷰, 키보드 네비게이션 검증
 */
'use client'

import { useState } from 'react'
import { Coffee, Search, Filter, Plus, Settings, Home, BarChart3 } from 'lucide-react'

import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import TabletLayout from '../../components/layouts/TabletLayout'
import SwipeableItem from '../../components/ui/SwipeableItem'
import FluidText from '../../components/ui/FluidText'

export default function TabletTestPage() {
  const [selectedRecord, setSelectedRecord] = useState<number | null>(1)
  const [splitRatio, setSplitRatio] = useState<[number, number]>([40, 60])
  const [testResults, setTestResults] = useState<string[]>([])
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }
  
  // 샘플 커피 기록 데이터
  const sampleRecords = [
    {
      id: 1,
      name: "에티오피아 예가체프",
      roaster: "블루보틀",
      rating: 4.5,
      date: "2024-08-04",
      notes: "밝은 산미와 플로럴 향이 인상적. 아침에 마시기 좋은 깔끔한 맛",
      origin: "에티오피아",
      process: "워시드",
      roastLevel: "라이트"
    },
    {
      id: 2,
      name: "콜롬비아 슈프리모",
      roaster: "스타벅스",
      rating: 4.0,
      date: "2024-08-03",
      notes: "균형잡힌 바디감과 달콤한 후미. 초콜릿과 견과류 노트",
      origin: "콜롬비아",
      process: "세미워시드",
      roastLevel: "미디움"
    },
    {
      id: 3,
      name: "과테말라 안티구아",
      roaster: "커피빈",
      rating: 4.2,
      date: "2024-08-02",
      notes: "스모키한 향과 초콜릿 노트. 진한 바디감",
      origin: "과테말라",
      process: "풀워시드",
      roastLevel: "미디움다크"
    }
  ]
  
  // 현재 선택된 기록
  const currentRecord = sampleRecords.find(r => r.id === selectedRecord)
  
  // 좌측 패널 컨텐츠 (Primary Slot)
  const primarySlot = (
    <div className="h-full flex flex-col">
      {/* 네비게이션 섹션 */}
      <div className="mb-6">
        <FluidText as="h2" size="lg" weight="semibold" className="mb-3">
          📱 태블릿 네비게이션
        </FluidText>
        <div className="space-y-2">
          {[
            { icon: Home, label: '홈', active: false },
            { icon: Coffee, label: '내 기록', active: true },
            { icon: BarChart3, label: '분석', active: false },
            { icon: Settings, label: '설정', active: false }
          ].map((item, index) => (
            <button
              key={index}
              className={`
                w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all
                ${item.active 
                  ? 'bg-coffee-500 text-white shadow-sm' 
                  : 'bg-coffee-50 text-coffee-700 hover:bg-coffee-100'
                }
                min-h-[44px] focus:outline-none focus:ring-2 focus:ring-coffee-300
              `}
              onClick={() => addTestResult(`네비게이션: ${item.label} 클릭`)}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
      
      {/* 빠른 액션 */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            className="flex-1 flex items-center justify-center space-x-2 p-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors min-h-[44px]"
            onClick={() => addTestResult('새 기록 추가 버튼 클릭')}
          >
            <Plus className="h-4 w-4" />
            <span className="text-sm font-medium">새 기록</span>
          </button>
          <button
            className="p-2 bg-coffee-100 text-coffee-600 rounded-lg hover:bg-coffee-200 transition-colors min-h-[44px] min-w-[44px]"
            onClick={() => addTestResult('검색 버튼 클릭')}
          >
            <Search className="h-4 w-4" />
          </button>
          <button
            className="p-2 bg-coffee-100 text-coffee-600 rounded-lg hover:bg-coffee-200 transition-colors min-h-[44px] min-w-[44px]"
            onClick={() => addTestResult('필터 버튼 클릭')}
          >
            <Filter className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* 커피 기록 목록 */}
      <div className="flex-1 overflow-y-auto">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          ☕ 최근 기록 ({sampleRecords.length})
        </FluidText>
        <div className="space-y-2">
          {sampleRecords.map((record) => (
            <button
              key={record.id}
              className={`
                w-full text-left p-3 rounded-lg border transition-all
                ${selectedRecord === record.id
                  ? 'bg-coffee-100 border-coffee-300 shadow-sm'
                  : 'bg-white border-coffee-200 hover:bg-coffee-50'
                }
                min-h-[60px] focus:outline-none focus:ring-2 focus:ring-coffee-300
              `}
              onClick={() => {
                setSelectedRecord(record.id)
                addTestResult(`기록 선택: ${record.name}`)
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <FluidText as="h4" size="sm" weight="semibold" className="truncate">
                  {record.name}
                </FluidText>
                <div className="flex items-center space-x-1 ml-2">
                  <Coffee className="h-3 w-3 text-amber-500" />
                  <span className="text-xs text-coffee-600">{record.rating}</span>
                </div>
              </div>
              <FluidText as="p" size="xs" color="secondary" className="truncate">
                {record.roaster} • {record.date}
              </FluidText>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
  
  // 우측 패널 컨텐츠 (Secondary Slot)
  const secondarySlot = (
    <div className="h-full flex flex-col">
      {/* 상세 정보 헤더 */}
      <div className="mb-6">
        <FluidText as="h2" size="xl" weight="bold" className="mb-2">
          📋 상세 정보
        </FluidText>
        {currentRecord ? (
          <div className="bg-white rounded-lg p-4 border border-coffee-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <FluidText as="h3" size="lg" weight="semibold">
                {currentRecord.name}
              </FluidText>
              <div className="flex items-center space-x-1">
                <Coffee className="h-4 w-4 text-amber-500" />
                <span className="font-medium">{currentRecord.rating}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <span className="text-coffee-600">로스터리:</span>
                <div className="font-medium">{currentRecord.roaster}</div>
              </div>
              <div>
                <span className="text-coffee-600">원산지:</span>
                <div className="font-medium">{currentRecord.origin}</div>
              </div>
              <div>
                <span className="text-coffee-600">가공법:</span>
                <div className="font-medium">{currentRecord.process}</div>
              </div>
              <div>
                <span className="text-coffee-600">로스팅:</span>
                <div className="font-medium">{currentRecord.roastLevel}</div>
              </div>
            </div>
            
            <div className="mb-4">
              <span className="text-coffee-600 text-sm">테이스팅 노트:</span>
              <p className="mt-1 text-coffee-800">{currentRecord.notes}</p>
            </div>
            
            <div className="flex space-x-2">
              <button
                className="px-4 py-2 bg-coffee-500 text-white rounded-lg hover:bg-coffee-600 transition-colors text-sm font-medium"
                onClick={() => addTestResult(`편집: ${currentRecord.name}`)}
              >
                편집
              </button>
              <button
                className="px-4 py-2 bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors text-sm font-medium"
                onClick={() => addTestResult(`공유: ${currentRecord.name}`)}
              >
                공유
              </button>
              <button
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                onClick={() => addTestResult(`삭제: ${currentRecord.name}`)}
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-coffee-50 rounded-lg p-8 text-center border border-coffee-200">
            <Coffee className="h-12 w-12 text-coffee-300 mx-auto mb-3" />
            <FluidText as="p" size="base" color="secondary">
              커피 기록을 선택해주세요
            </FluidText>
          </div>
        )}
      </div>
      
      {/* 키보드 네비게이션 테스트 */}
      <div className="mb-6">
        <FluidText as="h3" size="lg" weight="semibold" className="mb-3">
          ⌨️ 키보드 네비게이션 테스트
        </FluidText>
        <div className="bg-white rounded-lg p-4 border border-coffee-200">
          <div className="space-y-2 text-sm">
            <div><kbd className="px-2 py-1 bg-coffee-100 rounded text-xs">←</kbd> 좌측 패널로 포커스 이동</div>
            <div><kbd className="px-2 py-1 bg-coffee-100 rounded text-xs">→</kbd> 우측 패널로 포커스 이동</div>
            <div><kbd className="px-2 py-1 bg-coffee-100 rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-1 bg-coffee-100 rounded text-xs">\</kbd> 레이아웃 초기화</div>
            <div><kbd className="px-2 py-1 bg-coffee-100 rounded text-xs">Tab</kbd> 다음 요소로 이동</div>
          </div>
        </div>
      </div>
      
      {/* 분할 비율 정보 */}
      <div className="mb-6">
        <FluidText as="h3" size="lg" weight="semibold" className="mb-3">
          📐 분할 비율 정보
        </FluidText>
        <div className="bg-white rounded-lg p-4 border border-coffee-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-coffee-600">좌측 패널:</span>
              <div className="font-medium">{splitRatio[0]}%</div>
            </div>
            <div>
              <span className="text-coffee-600">우측 패널:</span>
              <div className="font-medium">{splitRatio[1]}%</div>
            </div>
          </div>
          <div className="mt-3 text-xs text-coffee-500">
            중앙 구분선을 드래그하여 비율을 조절할 수 있습니다
          </div>
        </div>
      </div>
      
      {/* 테스트 로그 */}
      <div>
        <FluidText as="h3" size="lg" weight="semibold" className="mb-3">
          📋 테스트 로그
        </FluidText>
        <div className="bg-white rounded-lg border border-coffee-200 p-4 max-h-48 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-center text-coffee-500 py-4 text-sm">
              아직 테스트 결과가 없습니다
            </div>
          ) : (
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div key={index} className="text-xs font-mono text-coffee-700">
                  {result}
                </div>
              ))}
            </div>
          )}
          {testResults.length > 0 && (
            <button
              className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
              onClick={() => setTestResults([])}
            >
              로그 지우기
            </button>
          )}
        </div>
      </div>
    </div>
  )
  
  // 헤더 컨텐츠
  const headerSlot = (
    <div className="flex items-center justify-between h-16 px-6">
      <div className="flex items-center space-x-3">
        <Coffee className="h-6 w-6 text-coffee-500" />
        <FluidText as="h1" size="lg" weight="bold">
          CupNote - 태블릿 테스트
        </FluidText>
      </div>
      <div className="flex items-center space-x-4 text-sm text-coffee-600">
        <span>Phase 2 구현 완료</span>
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
      </div>
    </div>
  )
  
  return (
    <ResponsiveProvider>
      <TabletLayout
        primarySlot={primarySlot}
        secondarySlot={secondarySlot}
        headerSlot={headerSlot}
        splitRatio={splitRatio}
        onSplitRatioChange={setSplitRatio}
        onPanelToggle={(collapsed) => addTestResult(`패널 토글: ${collapsed ? '닫힘' : '열림'}`)}
        onOrientationChange={(orientation) => addTestResult(`화면 방향 변경: ${orientation}`)}
        keyboardNavigation={true}
        shortcuts={[
          {
            key: 'n',
            ctrlKey: true,
            action: () => addTestResult('Ctrl+N: 새 기록 단축키 실행'),
            description: '새 기록 작성'
          },
          {
            key: 'f',
            ctrlKey: true,
            action: () => addTestResult('Ctrl+F: 검색 단축키 실행'),
            description: '검색 활성화'
          }
        ]}
      />
    </ResponsiveProvider>
  )
}