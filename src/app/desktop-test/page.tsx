/**
 * Phase 3 데스크탑 레이아웃 시스템 테스트 페이지
 * DesktopLayout, 3-컬럼 시스템, 고급 키보드 네비게이션 검증
 */
'use client'

import { useState } from 'react'
import { 
  Coffee, Search, Filter, Plus, Settings, Home, BarChart3, 
  Users, Calendar, Tag, Download, Upload, Zap, Bell, Info,
  Monitor, Keyboard, Mouse, Layers, Grid, Eye, EyeOff
} from 'lucide-react'

import { ResponsiveProvider } from '../../contexts/ResponsiveContext'
import DesktopLayout, { LayoutMode, DesktopShortcut } from '../../components/layouts/DesktopLayout'
import FluidText from '../../components/ui/FluidText'

export default function DesktopTestPage() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('standard')
  const [columnRatios, setColumnRatios] = useState<[number, number, number]>([20, 60, 20])
  const [testResults, setTestResults] = useState<string[]>([])
  const [activeWorkspace, setActiveWorkspace] = useState('main')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  
  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }
  
  // 샘플 워크스페이스 데이터
  const workspaces = [
    { id: 'main', name: '메인 작업공간', description: '일반적인 커피 기록 관리' },
    { id: 'analysis', name: '분석 작업공간', description: '데이터 분석 및 통계' },
    { id: 'batch', name: '배치 작업공간', description: '대량 편집 및 관리' }
  ]
  
  // 샘플 커피 기록 데이터 (확장)
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
      tags: ["플로럴", "산미", "아침"]
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
      tags: ["초콜릿", "견과류", "균형"]
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
      tags: ["스모키", "초콜릿", "진함"]
    },
    {
      id: 4,
      name: "케냐 AA",
      roaster: "탐앤탐스",
      rating: 4.3,
      date: "2024-08-01",
      notes: "강렬한 산미와 와인 같은 향. 복합적인 풍미",
      origin: "케냐",
      process: "워시드",
      tags: ["산미", "와인", "복합"]
    },
    {
      id: 5,
      name: "자메이카 블루마운틴",
      roaster: "폴바셋",
      rating: 4.8,
      date: "2024-07-31",
      notes: "부드럽고 섬세한 맛. 최고급 원두의 품격",
      origin: "자메이카",
      process: "워시드",
      tags: ["부드러움", "섬세함", "프리미엄"]
    }
  ]
  
  // 커스텀 데스크탑 단축키
  const customShortcuts: DesktopShortcut[] = [
    {
      key: 'n',
      ctrlKey: true,
      action: () => addTestResult('Ctrl+N: 새 기록 생성 단축키'),
      description: '새 커피 기록 생성',
      category: 'tools'
    },
    {
      key: 'f',
      ctrlKey: true,
      action: () => addTestResult('Ctrl+F: 검색 활성화 단축키'),
      description: '검색 활성화',
      category: 'navigation'
    },
    {
      key: 'e',
      ctrlKey: true,
      action: () => addTestResult('Ctrl+E: 내보내기 단축키'),
      description: '데이터 내보내기',
      category: 'tools'
    },
    {
      key: '1',
      ctrlKey: true,
      action: () => {
        setLayoutMode('standard')
        addTestResult('Ctrl+1: 표준 레이아웃 모드 전환')
      },
      description: '표준 레이아웃 모드',
      category: 'view'
    },
    {
      key: '2',
      ctrlKey: true,
      action: () => {
        setLayoutMode('focus')
        addTestResult('Ctrl+2: 집중 레이아웃 모드 전환')
      },
      description: '집중 레이아웃 모드',
      category: 'view'
    },
    {
      key: '3',
      ctrlKey: true,
      action: () => {
        setLayoutMode('analysis')
        addTestResult('Ctrl+3: 분석 레이아웃 모드 전환')
      },
      description: '분석 레이아웃 모드',
      category: 'view'
    }
  ]
  
  // 좌측 사이드바 컨텐츠
  const leftSidebarSlot = (
    <div className="h-full flex flex-col p-4">
      {/* 워크스페이스 선택 */}
      <div className="mb-6">
        <FluidText as="h2" size="lg" weight="semibold" className="mb-3">
          🏢 워크스페이스
        </FluidText>
        <select
          value={activeWorkspace}
          onChange={(e) => {
            setActiveWorkspace(e.target.value)
            addTestResult(`워크스페이스 전환: ${e.target.value}`)
          }}
          className="w-full p-2 border border-coffee-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-300"
        >
          {workspaces.map(ws => (
            <option key={ws.id} value={ws.id}>
              {ws.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* 메인 네비게이션 */}
      <div className="mb-6">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          🧭 네비게이션
        </FluidText>
        <div className="space-y-1">
          {[
            { icon: Home, label: '대시보드', active: true, count: null },
            { icon: Coffee, label: '내 기록', active: false, count: sampleRecords.length },
            { icon: BarChart3, label: '분석', active: false, count: null },
            { icon: Users, label: '커뮤니티', active: false, count: 3 },
            { icon: Settings, label: '설정', active: false, count: null }
          ].map((item, index) => (
            <button
              key={index}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg text-left transition-all text-sm
                ${item.active 
                  ? 'bg-coffee-500 text-white shadow-sm' 
                  : 'bg-coffee-50 text-coffee-700 hover:bg-coffee-100'
                }
                min-h-[44px] focus:outline-none focus:ring-2 focus:ring-coffee-300
              `}
              onClick={() => addTestResult(`네비게이션: ${item.label} 클릭`)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </div>
              {item.count && (
                <span className={`
                  px-2 py-1 rounded-full text-xs font-medium
                  ${item.active ? 'bg-white/20 text-white' : 'bg-coffee-200 text-coffee-700'}
                `}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* 빠른 필터 */}
      <div className="mb-6">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          🔍 빠른 필터
        </FluidText>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="커피 기록 검색..."
            className="w-full p-2 border border-coffee-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-coffee-300"
            onFocus={() => addTestResult('검색 필드 포커스')}
          />
          <div className="flex flex-wrap gap-1">
            {['높은 평점', '최근', '즐겨찾기'].map(filter => (
              <button
                key={filter}
                className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded text-xs hover:bg-coffee-200 transition-colors"
                onClick={() => addTestResult(`필터 적용: ${filter}`)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 태그 클라우드 */}
      <div className="flex-1 overflow-y-auto">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          🏷️ 태그
        </FluidText>
        <div className="space-y-1">
          {['플로럴', '초콜릿', '산미', '견과류', '스모키', '와인', '부드러움'].map(tag => (
            <button
              key={tag}
              className="block w-full text-left p-2 bg-coffee-50 rounded text-sm hover:bg-coffee-100 transition-colors"
              onClick={() => addTestResult(`태그 선택: ${tag}`)}
            >
              <Tag className="h-3 w-3 inline mr-2" />
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
  
  // 메인 콘텐츠 컨텐츠
  const mainContentSlot = (
    <div className="h-full flex flex-col p-6">
      {/* 브레드크럼과 액션 바 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <FluidText as="h1" size="2xl" weight="bold" className="mb-1">
            🖥️ 데스크탑 대시보드
          </FluidText>
          <div className="flex items-center space-x-2 text-sm text-coffee-600">
            <span>홈</span>
            <span>›</span>
            <span>데스크탑 테스트</span>
            <span>›</span>
            <span className="text-coffee-800 font-medium">Phase 3</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-2 bg-coffee-500 text-white rounded-lg text-sm font-medium hover:bg-coffee-600 transition-colors flex items-center space-x-2"
            onClick={() => addTestResult('새 기록 생성 버튼 클릭')}
          >
            <Plus className="h-4 w-4" />
            <span>새 기록</span>
          </button>
          <button
            className="px-3 py-2 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 transition-colors flex items-center space-x-2"
            onClick={() => addTestResult('배치 작업 버튼 클릭')}
          >
            <Layers className="h-4 w-4" />
            <span>배치 작업</span>
          </button>
        </div>
      </div>
      
      {/* 레이아웃 모드 컨트롤 */}
      <div className="mb-6">
        <FluidText as="h2" size="lg" weight="semibold" className="mb-3">
          📐 레이아웃 모드 테스트
        </FluidText>
        <div className="flex space-x-2">
          {[
            { mode: 'standard' as LayoutMode, label: '표준', icon: Grid },
            { mode: 'focus' as LayoutMode, label: '집중', icon: Eye },
            { mode: 'analysis' as LayoutMode, label: '분석', icon: BarChart3 },
            { mode: 'minimal' as LayoutMode, label: '미니멀', icon: EyeOff }
          ].map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${layoutMode === mode
                  ? 'bg-coffee-500 text-white'
                  : 'bg-coffee-100 text-coffee-700 hover:bg-coffee-200'
                }
              `}
              onClick={() => {
                setLayoutMode(mode)
                addTestResult(`레이아웃 모드 변경: ${label}`)
              }}
            >
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>
        <div className="mt-2 text-sm text-coffee-600">
          현재 비율: {columnRatios.join(' : ')}
        </div>
      </div>
      
      {/* 데이터 테이블 */}
      <div className="flex-1 overflow-hidden">
        <FluidText as="h2" size="lg" weight="semibold" className="mb-3">
          ☕ 커피 기록 테이블
        </FluidText>
        <div className="bg-white rounded-lg border border-coffee-200 overflow-hidden h-full">
          <div className="overflow-x-auto h-full">
            <table className="w-full">
              <thead className="bg-coffee-50 border-b border-coffee-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(sampleRecords.map(r => r.id.toString()))
                          addTestResult('전체 선택')
                        } else {
                          setSelectedItems([])
                          addTestResult('전체 선택 해제')
                        }
                      }}
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">이름</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">로스터리</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">평점</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">원산지</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">태그</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-coffee-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-coffee-200">
                {sampleRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-coffee-25 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedItems.includes(record.id.toString())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedItems(prev => [...prev, record.id.toString()])
                            addTestResult(`기록 선택: ${record.name}`)
                          } else {
                            setSelectedItems(prev => prev.filter(id => id !== record.id.toString()))
                            addTestResult(`기록 선택 해제: ${record.name}`)
                          }
                        }}
                      />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-coffee-900">{record.name}</div>
                      <div className="text-sm text-coffee-500">{record.date}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-coffee-700">
                      {record.roaster}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <Coffee className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="text-sm font-medium">{record.rating}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-coffee-700">
                      {record.origin}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {record.tags.slice(0, 2).map(tag => (
                          <span key={tag} className="px-2 py-1 bg-coffee-100 text-coffee-700 rounded text-xs">
                            {tag}
                          </span>
                        ))}
                        {record.tags.length > 2 && (
                          <span className="px-2 py-1 bg-coffee-200 text-coffee-600 rounded text-xs">
                            +{record.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      <button
                        className="text-coffee-600 hover:text-coffee-800 mr-2"
                        onClick={() => addTestResult(`편집: ${record.name}`)}
                      >
                        편집
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => addTestResult(`삭제: ${record.name}`)}
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
  
  // 우측 도구 패널 컨텐츠
  const rightPanelSlot = (
    <div className="h-full flex flex-col p-4">
      {/* 빠른 액션 */}
      <div className="mb-6">
        <FluidText as="h2" size="lg" weight="semibold" className="mb-3">
          ⚡ 빠른 액션
        </FluidText>
        <div className="space-y-2">
          <button
            className="w-full flex items-center space-x-2 p-2 bg-coffee-500 text-white rounded-lg text-sm font-medium hover:bg-coffee-600 transition-colors"
            onClick={() => addTestResult('새 기록 작성 클릭')}
          >
            <Plus className="h-4 w-4" />
            <span>새 기록 작성</span>
          </button>
          <button
            className="w-full flex items-center space-x-2 p-2 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 transition-colors"
            onClick={() => addTestResult('데이터 내보내기 클릭')}
          >
            <Download className="h-4 w-4" />
            <span>데이터 내보내기</span>
          </button>
          <button
            className="w-full flex items-center space-x-2 p-2 bg-coffee-100 text-coffee-700 rounded-lg text-sm hover:bg-coffee-200 transition-colors"
            onClick={() => addTestResult('데이터 가져오기 클릭')}
          >
            <Upload className="h-4 w-4" />
            <span>데이터 가져오기</span>
          </button>
        </div>
      </div>
      
      {/* 선택된 항목 정보 */}
      {selectedItems.length > 0 && (
        <div className="mb-6">
          <FluidText as="h3" size="base" weight="semibold" className="mb-2">
            ☑️ 선택된 항목
          </FluidText>
          <div className="bg-coffee-100 rounded-lg p-3">
            <div className="text-sm text-coffee-700 mb-2">
              {selectedItems.length}개 선택됨
            </div>
            <div className="flex space-x-2">
              <button
                className="px-2 py-1 bg-coffee-500 text-white rounded text-xs hover:bg-coffee-600 transition-colors"
                onClick={() => addTestResult(`배치 편집: ${selectedItems.length}개 항목`)}
              >
                편집
              </button>
              <button
                className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
                onClick={() => addTestResult(`배치 삭제: ${selectedItems.length}개 항목`)}
              >
                삭제
              </button>
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
                onClick={() => addTestResult(`배치 내보내기: ${selectedItems.length}개 항목`)}
              >
                내보내기
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 통계 위젯 */}
      <div className="mb-6">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          📊 실시간 통계
        </FluidText>
        <div className="bg-coffee-50 rounded-lg p-3 space-y-2 text-sm">
          <div className="flex justify-between">
            <span>총 기록:</span>
            <span className="font-medium">{sampleRecords.length}개</span>
          </div>
          <div className="flex justify-between">
            <span>평균 평점:</span>
            <span className="font-medium">
              {(sampleRecords.reduce((sum, r) => sum + r.rating, 0) / sampleRecords.length).toFixed(1)}⭐
            </span>
          </div>
          <div className="flex justify-between">
            <span>선택된 항목:</span>
            <span className="font-medium">{selectedItems.length}개</span>
          </div>
          <div className="flex justify-between">
            <span>현재 모드:</span>
            <span className="font-medium capitalize">{layoutMode}</span>
          </div>
        </div>
      </div>
      
      {/* 키보드 단축키 안내 */}
      <div className="mb-6">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          ⌨️ 단축키
        </FluidText>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs space-y-1">
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+Shift+L</kbd> 좌측 패널</div>
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+Shift+M</kbd> 메인 콘텐츠</div>
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+Shift+R</kbd> 우측 패널</div>
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+B</kbd> 사이드바 토글</div>
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+1-3</kbd> 레이아웃 모드</div>
          <div><kbd className="px-1 py-0.5 bg-amber-100 rounded">Ctrl+N</kbd> 새 기록</div>
        </div>
      </div>
      
      {/* 테스트 로그 */}
      <div className="flex-1 overflow-hidden">
        <FluidText as="h3" size="base" weight="semibold" className="mb-3">
          📋 테스트 로그
        </FluidText>
        <div className="bg-white rounded-lg border border-coffee-200 p-3 h-full overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-center text-coffee-500 py-4 text-sm">
              테스트 결과가 여기에 표시됩니다
            </div>
          ) : (
            <div className="space-y-1">
              {testResults.slice(-20).map((result, index) => (
                <div key={index} className="text-xs font-mono text-coffee-700 break-words">
                  {result}
                </div>
              ))}
            </div>
          )}
          {testResults.length > 0 && (
            <button
              className="mt-3 px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200 transition-colors"
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
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <Monitor className="h-6 w-6 text-coffee-500" />
          <FluidText as="h1" size="lg" weight="bold">
            CupNote Desktop - Phase 3
          </FluidText>
        </div>
        <div className="flex items-center space-x-2 text-sm text-coffee-600">
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            Live
          </span>
          <span>3-Column Layout</span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-coffee-600">
          <Keyboard className="h-4 w-4" />
          <span>키보드 네비게이션 활성화</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg transition-colors"
            onClick={() => addTestResult('알림 센터 클릭')}
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            className="p-2 text-coffee-600 hover:text-coffee-800 hover:bg-coffee-100 rounded-lg transition-colors"
            onClick={() => addTestResult('도움말 클릭')}
          >
            <Info className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
  
  // 상태바 컨텐츠
  const statusBarSlot = (
    <div className="flex items-center justify-between px-4 py-2 text-xs text-coffee-600">
      <div className="flex items-center space-x-4">
        <span className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Ready</span>
        </span>
        <span>Desktop Layout Active</span>
        <span>{selectedItems.length} items selected</span>
      </div>
      
      <div className="flex items-center space-x-4">
        <span>Workspace: {workspaces.find(w => w.id === activeWorkspace)?.name}</span>
        <span>Mode: {layoutMode}</span>
        <span>Ratio: {columnRatios.join(':')}</span>
      </div>
    </div>
  )
  
  return (
    <ResponsiveProvider>
      <DesktopLayout
        leftSidebarSlot={leftSidebarSlot}
        mainContentSlot={mainContentSlot}
        rightPanelSlot={rightPanelSlot}
        headerSlot={headerSlot}
        statusBarSlot={statusBarSlot}
        layoutMode={layoutMode}
        columnRatios={columnRatios}
        onLayoutModeChange={(mode) => {
          setLayoutMode(mode)
          addTestResult(`레이아웃 모드 변경됨: ${mode}`)
        }}
        onColumnRatioChange={(ratios) => {
          setColumnRatios(ratios)
          addTestResult(`컬럼 비율 변경됨: ${ratios.join(':')}`)
        }}
        onPanelToggle={(panel, collapsed) => {
          addTestResult(`${panel} 패널 ${collapsed ? '닫힘' : '열림'}`)
        }}
        shortcuts={customShortcuts}
        keyboardNavigation={true}
        commandPalette={true}
      />
    </ResponsiveProvider>
  )
}