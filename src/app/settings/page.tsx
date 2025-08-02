'use client'

import { useState, useEffect } from 'react'

import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Coffee,
  Settings as SettingsIcon,
  User,
  Database,
  Zap,
  Home,
  Plus,
  X,
} from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import { CoffeeRecord } from '../../types/coffee'
import '../../utils/demo-equipment' // 개발 모드에서 데모 함수 사용 가능

interface UserSettings {
  displayName: string
  autoSaveEnabled: boolean
  showRatingInList: boolean
  compactView: boolean
  homeCafeEquipment: {
    grinder: string
    brewingMethod: string
    scale: string
    kettle: string
    other: string[]
  }
}

const defaultSettings: UserSettings = {
  displayName: '',
  autoSaveEnabled: true,
  showRatingInList: true,
  compactView: false,
  homeCafeEquipment: {
    grinder: '',
    brewingMethod: '',
    scale: '',
    kettle: '',
    other: []
  }
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [records, setRecords] = useState<CoffeeRecord[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [newEquipmentItem, setNewEquipmentItem] = useState('')
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    // 설정 불러오기
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('userSettings')
        if (stored) {
          const parsedSettings = JSON.parse(stored)
          setSettings({ ...defaultSettings, ...parsedSettings })
        }
      } catch (error) {
        console.error('Failed to load settings:', error)
      }
    }

    // 기록 개수 확인을 위해 로드
    const loadRecords = () => {
      try {
        const stored = localStorage.getItem('coffeeRecords')
        if (stored) {
          const parsedRecords = JSON.parse(stored)
          setRecords(parsedRecords)
        }
      } catch (error) {
        console.error('Failed to load records:', error)
      }
    }

    loadSettings()
    loadRecords()
  }, [])

  const saveSettings = (newSettings: UserSettings) => {
    try {
      localStorage.setItem('userSettings', JSON.stringify(newSettings))
      setSettings(newSettings)
      showNotification('success', '설정이 저장되었습니다.')
    } catch (error) {
      console.error('Failed to save settings:', error)
      showNotification('error', '설정 저장에 실패했습니다.')
    }
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const updateEquipment = (field: keyof typeof settings.homeCafeEquipment, value: string) => {
    const newSettings = {
      ...settings,
      homeCafeEquipment: {
        ...settings.homeCafeEquipment,
        [field]: value
      }
    }
    saveSettings(newSettings)
  }

  const addEquipmentItem = () => {
    if (newEquipmentItem.trim()) {
      const newSettings = {
        ...settings,
        homeCafeEquipment: {
          ...settings.homeCafeEquipment,
          other: [...settings.homeCafeEquipment.other, newEquipmentItem.trim()]
        }
      }
      saveSettings(newSettings)
      setNewEquipmentItem('')
    }
  }

  const removeEquipmentItem = (index: number) => {
    const newSettings = {
      ...settings,
      homeCafeEquipment: {
        ...settings.homeCafeEquipment,
        other: settings.homeCafeEquipment.other.filter((_, i) => i !== index)
      }
    }
    saveSettings(newSettings)
  }

  const exportData = () => {
    try {
      const data = {
        records,
        settings,
        exportedAt: new Date().toISOString(),
        version: '1.0',
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `cupnote-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      showNotification('success', '데이터가 내보내기되었습니다.')
    } catch (error) {
      console.error('Export failed:', error)
      showNotification('error', '내보내기에 실패했습니다.')
    }
  }

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.records && Array.isArray(data.records)) {
          localStorage.setItem('coffeeRecords', JSON.stringify(data.records))
          setRecords(data.records)
        }

        if (data.settings) {
          const importedSettings = { ...defaultSettings, ...data.settings }
          localStorage.setItem('userSettings', JSON.stringify(importedSettings))
          setSettings(importedSettings)
        }

        showNotification('success', '데이터가 가져오기되었습니다.')

        // 페이지 새로고침으로 변경사항 반영
        setTimeout(() => window.location.reload(), 1000)
      } catch (error) {
        console.error('Import failed:', error)
        showNotification('error', '파일 형식이 올바르지 않습니다.')
      }
    }
    reader.readAsText(file)
  }

  const deleteAllData = () => {
    try {
      localStorage.removeItem('coffeeRecords')
      localStorage.removeItem('userSettings')
      setRecords([])
      setSettings(defaultSettings)
      setShowDeleteConfirm(false)
      showNotification('success', '모든 데이터가 삭제되었습니다.')
    } catch (error) {
      console.error('Delete failed:', error)
      showNotification('error', '삭제에 실패했습니다.')
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl pb-20 md:pb-8">
          <Navigation showBackButton currentPage="settings" />

        {/* 헤더 */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center">
            <SettingsIcon className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" />
            설정
          </h1>
          <p className="text-base md:text-lg text-foreground-secondary mt-1">앱 설정 및 데이터 관리</p>
        </div>

        {/* 알림 */}
        {notification && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center ${
              notification.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {notification.message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 개인 설정 */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
            <h2 className="text-lg md:text-xl font-semibold text-coffee-800 mb-4 flex items-center">
              <User className="h-5 w-5 mr-2" />
              개인 설정
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">표시 이름</label>
                <input
                  type="text"
                  value={settings.displayName}
                  onChange={e => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                  onBlur={() => saveSettings(settings)}
                  className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500"
                  placeholder="이름을 입력하세요"
                />
              </div>

              {/* 홈카페 장비 설정 */}
              <div className="pt-4 border-t border-coffee-200">
                <h3 className="text-md font-semibold text-coffee-800 mb-3 flex items-center">
                  <Home className="h-4 w-4 mr-2" />
                  홈카페 장비 설정
                </h3>
                <p className="text-sm text-coffee-600 mb-4">
                  HomeCafe 모드에서 사용할 기본 장비를 설정하세요
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">그라인더</label>
                    <input
                      type="text"
                      value={settings.homeCafeEquipment.grinder}
                      onChange={e => updateEquipment('grinder', e.target.value)}
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
                      placeholder="예: 코만단테 C40, 바라짜 엔코어"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">추출 도구</label>
                    <input
                      type="text"
                      value={settings.homeCafeEquipment.brewingMethod}
                      onChange={e => updateEquipment('brewingMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
                      placeholder="예: V60, 칼리타 웨이브, 에어로프레스"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">저울</label>
                    <input
                      type="text"
                      value={settings.homeCafeEquipment.scale}
                      onChange={e => updateEquipment('scale', e.target.value)}
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
                      placeholder="예: 아카이아 펄, 하리오 V60 드립스케일"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">케틀</label>
                    <input
                      type="text"
                      value={settings.homeCafeEquipment.kettle}
                      onChange={e => updateEquipment('kettle', e.target.value)}
                      className="w-full px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
                      placeholder="예: 펠로우 스타그 EKG, 하리오 부오노"
                    />
                  </div>

                  {/* 추가 장비 */}
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-1">기타 장비</label>
                    
                    {/* 기존 추가 장비 목록 */}
                    {settings.homeCafeEquipment.other.map((item, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <span className="flex-1 px-3 py-2 bg-coffee-50 border border-coffee-200 rounded-lg text-sm">
                          {item}
                        </span>
                        <button
                          onClick={() => removeEquipmentItem(index)}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                    {/* 새 장비 추가 */}
                    <div className="flex items-center mt-2">
                      <input
                        type="text"
                        value={newEquipmentItem}
                        onChange={e => setNewEquipmentItem(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addEquipmentItem()}
                        className="flex-1 px-3 py-2 border border-coffee-300 rounded-lg focus:outline-none focus:border-coffee-500 text-sm"
                        placeholder="추가 장비 입력 (온도계, 타이머 등)"
                      />
                      <button
                        onClick={addEquipmentItem}
                        className="ml-2 p-2 bg-coffee-600 text-white rounded-lg hover:bg-coffee-700 transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>


          {/* 앱 설정 */}
          <div className="bg-background rounded-xl p-4 md:p-6 shadow-sm border border-border">
            <h2 className="text-lg md:text-xl font-semibold text-foreground mb-4 flex items-center">
              <SettingsIcon className="h-5 w-5 mr-2" />앱 설정
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">자동 저장</div>
                  <div className="text-sm text-foreground-muted">입력하는 동안 자동으로 저장</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSaveEnabled}
                    onChange={e => {
                      const newSettings = { ...settings, autoSaveEnabled: e.target.checked }
                      saveSettings(newSettings)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">목록에서 평점 표시</div>
                  <div className="text-sm text-foreground-muted">커피 카드에 별점 표시</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showRatingInList}
                    onChange={e => {
                      const newSettings = { ...settings, showRatingInList: e.target.checked }
                      saveSettings(newSettings)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-foreground">컴팩트 보기</div>
                  <div className="text-sm text-foreground-muted">목록을 더 촘촘하게 표시</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactView}
                    onChange={e => {
                      const newSettings = { ...settings, compactView: e.target.checked }
                      saveSettings(newSettings)
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-secondary peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* 성능 설정 */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
            <h2 className="text-lg md:text-xl font-semibold text-coffee-800 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              성능 최적화
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-coffee-600">
                앱 성능을 모니터링하고 캐시를 관리합니다.
              </p>
              <a
                href="/settings/performance"
                className="w-full flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <Zap className="h-4 w-4 mr-2" />
                성능 설정 열기
              </a>
            </div>
          </div>

          {/* 데이터 관리 */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
            <h2 className="text-lg md:text-xl font-semibold text-coffee-800 mb-4 flex items-center">
              <Database className="h-5 w-5 mr-2" />
              데이터 관리
            </h2>

            <div className="space-y-4">
              <div className="text-sm text-coffee-600 mb-4">
                현재 <strong>{records.length}개</strong>의 커피 기록이 있습니다.
              </div>

              <button
                onClick={exportData}
                className="w-full flex items-center justify-center px-4 py-3 bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                데이터 내보내기 (JSON)
              </button>

              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={importData}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  데이터 가져오기
                </label>
              </div>
            </div>
          </div>

          {/* 위험한 작업 */}
          <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm border border-red-200">
            <h2 className="text-lg md:text-xl font-semibold text-red-700 mb-4 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              위험한 작업
            </h2>

            <div className="space-y-4">
              <div className="text-sm text-coffee-600 mb-4">
                이 작업들은 되돌릴 수 없습니다. 신중히 진행해주세요.
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full flex items-center justify-center px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모든 데이터 삭제
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm text-red-800 font-medium mb-2">
                      정말로 모든 데이터를 삭제하시겠습니까?
                    </p>
                    <p className="text-xs text-red-600">
                      {records.length}개의 커피 기록과 모든 설정이 영구적으로 삭제됩니다.
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={deleteAllData}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-coffee-100 text-coffee-700 rounded-lg hover:bg-coffee-200 transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 앱 정보 */}
        <div className="mt-6 md:mt-8 bg-white rounded-xl p-4 md:p-6 shadow-sm border border-coffee-100">
          <h2 className="text-lg md:text-xl font-semibold text-coffee-800 mb-4 flex items-center">
            <Coffee className="h-5 w-5 mr-2" />앱 정보
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-coffee-600">
            <div>
              <div className="font-medium">버전</div>
              <div>0.4.0</div>
            </div>
            <div>
              <div className="font-medium">데이터 저장</div>
              <div>로컬 브라우저 저장소</div>
            </div>
            <div>
              <div className="font-medium">개발자</div>
              <div>CupNote Team</div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
