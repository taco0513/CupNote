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
import PageLayout from '../../components/ui/PageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import UnifiedInput from '../../components/ui/UnifiedInput'
import UnifiedButton from '../../components/ui/UnifiedButton'
import Alert from '../../components/ui/Alert'
import SectionHeader from '../../components/ui/SectionHeader'

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
      <Navigation showBackButton currentPage="settings" />
      <PageLayout
        showHeader={false}
      >

        {/* 알림 */}
        {notification && (
          <Alert
            variant={notification.type === 'success' ? 'success' : 'error'}
            onClose={() => setNotification(null)}
            className="mb-6"
          >
            {notification.message}
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* 개인 설정 */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>
                <SectionHeader
                  title="개인 설정"
                  icon={<User className="h-5 w-5" />}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <UnifiedInput
                  label="표시 이름"
                  value={settings.displayName}
                  onChange={e => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                  onBlur={() => saveSettings(settings)}
                  placeholder="이름을 입력하세요"
                  fullWidth
                />

              {/* 홈카페 장비 설정 */}
              <div className="pt-4 border-t border-coffee-200/30">
                <SectionHeader
                  title="홈카페 장비 설정"
                  description="HomeCafe 모드에서 사용할 기본 장비를 설정하세요"
                  icon={<Home className="h-4 w-4" />}
                  className="mb-4"
                />

                <div className="space-y-3">
                  <UnifiedInput
                    label="그라인더"
                    value={settings.homeCafeEquipment.grinder}
                    onChange={e => updateEquipment('grinder', e.target.value)}
                    placeholder="예: 코만단테 C40, 바라짜 엔코어"
                    fullWidth
                  />

                  <UnifiedInput
                    label="추출 도구"
                    value={settings.homeCafeEquipment.brewingMethod}
                    onChange={e => updateEquipment('brewingMethod', e.target.value)}
                    placeholder="예: V60, 칼리타 웨이브, 에어로프레스"
                    fullWidth
                  />

                  <UnifiedInput
                    label="저울"
                    value={settings.homeCafeEquipment.scale}
                    onChange={e => updateEquipment('scale', e.target.value)}
                    placeholder="예: 아카이아 펄, 하리오 V60 드립스케일"
                    fullWidth
                  />

                  <UnifiedInput
                    label="케틀"
                    value={settings.homeCafeEquipment.kettle}
                    onChange={e => updateEquipment('kettle', e.target.value)}
                    placeholder="예: 펠로우 스타그 EKG, 하리오 부오노"
                    fullWidth
                  />

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
                    <div className="flex items-center mt-2 gap-2">
                      <UnifiedInput
                        value={newEquipmentItem}
                        onChange={e => setNewEquipmentItem(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addEquipmentItem()}
                        placeholder="추가 장비 입력 (온도계, 타이머 등)"
                        fullWidth
                      />
                      <UnifiedButton
                        onClick={addEquipmentItem}
                        variant="primary"
                        size="icon"
                      >
                        <Plus className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  </div>
                </div>
              </div>
              </div>
            </CardContent>
          </Card>


          {/* 앱 설정 */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>
                <SectionHeader
                  title="앱 설정"
                  icon={<SettingsIcon className="h-5 w-5" />}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">자동 저장</div>
                  <div className="text-sm text-coffee-600">입력하는 동안 자동으로 저장</div>
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
                  <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">목록에서 평점 표시</div>
                  <div className="text-sm text-coffee-600">커피 카드에 별점 표시</div>
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
                  <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">컴팩트 보기</div>
                  <div className="text-sm text-coffee-600">목록을 더 촘촘하게 표시</div>
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
                  <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500"></div>
                </label>
              </div>
            </div>
            </CardContent>
          </Card>

          {/* 성능 설정 */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>
                <SectionHeader
                  title="성능 최적화"
                  icon={<Zap className="h-5 w-5" />}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-coffee-600 mb-4">
                앱 성능을 모니터링하고 캐시를 관리합니다.
              </p>
              <UnifiedButton
                variant="secondary"
                fullWidth
                onClick={() => window.location.href = '/settings/performance'}
              >
                <Zap className="h-4 w-4 mr-2" />
                성능 설정 열기
              </UnifiedButton>
            </CardContent>
          </Card>

          {/* 데이터 관리 */}
          <Card variant="default">
            <CardHeader>
              <CardTitle>
                <SectionHeader
                  title="데이터 관리"
                  icon={<Database className="h-5 w-5" />}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-coffee-600 mb-4">
                현재 <strong>{records.length}개</strong>의 커피 기록이 있습니다.
              </div>

              <div className="space-y-3">
                <UnifiedButton
                  onClick={exportData}
                  variant="secondary"
                  fullWidth
                >
                  <Download className="h-4 w-4 mr-2" />
                  데이터 내보내기 (JSON)
                </UnifiedButton>

                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importData}
                    className="hidden"
                    id="import-file"
                  />
                  <label htmlFor="import-file">
                    <UnifiedButton
                      as="span"
                      variant="outline"
                      fullWidth
                      className="cursor-pointer"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      데이터 가져오기
                    </UnifiedButton>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 위험한 작업 */}
          <Card variant="bordered" className="border-red-200">
            <CardHeader>
              <CardTitle>
                <SectionHeader
                  title="위험한 작업"
                  icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
                />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-coffee-600 mb-4">
                이 작업들은 되돌릴 수 없습니다. 신중히 진행해주세요.
              </div>

              {!showDeleteConfirm ? (
                <UnifiedButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  fullWidth
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모든 데이터 삭제
                </UnifiedButton>
              ) : (
                <div className="space-y-3">
                  <Alert variant="error">
                    <p className="font-medium mb-2">
                      정말로 모든 데이터를 삭제하시겠습니까?
                    </p>
                    <p className="text-xs">
                      {records.length}개의 커피 기록과 모든 설정이 영구적으로 삭제됩니다.
                    </p>
                  </Alert>
                  <div className="flex space-x-3">
                    <UnifiedButton
                      onClick={deleteAllData}
                      variant="danger"
                      fullWidth
                    >
                      삭제
                    </UnifiedButton>
                    <UnifiedButton
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="secondary"
                      fullWidth
                    >
                      취소
                    </UnifiedButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 앱 정보 */}
        <Card variant="default" className="mt-6 md:mt-8">
          <CardHeader>
            <CardTitle>
              <SectionHeader
                title="앱 정보"
                icon={<Coffee className="h-5 w-5" />}
              />
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </PageLayout>
    </ProtectedRoute>
  )
}
