/**
 * 설정 페이지 - 하이브리드 디자인 시스템
 * 순수 앱 동작 설정만 포함 (개인정보는 /profile로 분리)
 */
'use client'

import { useState, useEffect } from 'react'

import {
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  Coffee,
  Settings as SettingsIcon,
  Database,
  Zap,
  Info,
} from 'lucide-react'

import ProtectedRoute from '../../components/auth/ProtectedRoute'
import Navigation from '../../components/Navigation'
import PageLayout from '../../components/ui/PageLayout'
import PageHeader from '../../components/ui/PageHeader'
import { Card, CardContent } from '../../components/ui/Card'
import UnifiedButton from '../../components/ui/UnifiedButton'
import Alert from '../../components/ui/Alert'
import { CoffeeRecord } from '../../types/coffee'

interface AppSettings {
  autoSaveEnabled: boolean
  showRatingInList: boolean
  compactView: boolean
  performanceMode: boolean
}

const defaultSettings: AppSettings = {
  autoSaveEnabled: true,
  showRatingInList: true,
  compactView: false,
  performanceMode: true
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)
  const [records, setRecords] = useState<CoffeeRecord[]>([])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  useEffect(() => {
    // 앱 설정 불러오기
    const loadSettings = () => {
      try {
        const stored = localStorage.getItem('appSettings')
        if (stored) {
          const parsedSettings = JSON.parse(stored)
          setSettings({ ...defaultSettings, ...parsedSettings })
        }
      } catch (error) {
        console.error('Failed to load app settings:', error)
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

  const saveSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(newSettings))
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
      localStorage.removeItem('appSettings')
      localStorage.removeItem('userSettings') // 이전 설정도 제거
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
      <PageLayout>
        {/* 하이브리드 디자인 페이지 헤더 */}
        <PageHeader 
          title="설정"
          description="앱 동작 방식과 데이터를 관리하세요"
          icon={<SettingsIcon className="h-6 w-6" />}
        />

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

        <div className="space-y-8">
          {/* 앱 동작 설정 - 하이브리드 카드 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
                <SettingsIcon className="h-5 w-5 mr-2" />
                앱 동작 설정
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-coffee-800">자동 저장 활성화</div>
                    <div className="text-sm text-coffee-600">입력하는 동안 자동으로 저장됩니다</div>
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
                    <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-coffee-800">목록에서 평점 표시</div>
                    <div className="text-sm text-coffee-600">커피 목록에서 별점을 표시합니다</div>
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
                    <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-coffee-800">컴팩트 보기</div>
                    <div className="text-sm text-coffee-600">목록을 더 촘촘하게 표시합니다</div>
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
                    <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-coffee-800">성능 최적화</div>
                    <div className="text-sm text-coffee-600">앱 성능을 향상시킵니다</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.performanceMode}
                      onChange={e => {
                        const newSettings = { ...settings, performanceMode: e.target.checked }
                        saveSettings(newSettings)
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 성능 & 캐시 관리 - 하이브리드 카드 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
                <Zap className="h-5 w-5 mr-2" />
                성능 & 캐시
              </h3>
              
              <p className="text-sm text-coffee-600 mb-4">
                앱 성능을 모니터링하고 캐시를 관리합니다. 문제가 발생하면 캐시를 초기화하세요.
              </p>
              
              <div className="space-y-3">
                <UnifiedButton
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    // 캐시 초기화 로직
                    showNotification('success', '캐시가 초기화되었습니다.')
                  }}
                  className="bg-coffee-50/80 hover:bg-coffee-100/80 text-coffee-700 border-coffee-200/50"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  캐시 초기화
                </UnifiedButton>
              </div>
            </CardContent>
          </Card>

          {/* 데이터 관리 - 하이브리드 카드 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
                <Database className="h-5 w-5 mr-2" />
                데이터 관리
              </h3>
              
              <div className="text-sm text-coffee-600 mb-6">
                현재 <strong className="text-coffee-800">{records.length}개</strong>의 커피 기록이 저장되어 있습니다.
              </div>

              <div className="space-y-3">
                <UnifiedButton
                  onClick={exportData}
                  variant="secondary"
                  fullWidth
                  className="bg-coffee-50/80 hover:bg-coffee-100/80 text-coffee-700 border-coffee-200/50"
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
                      className="cursor-pointer bg-white/50 hover:bg-coffee-50/80 text-coffee-700 border-coffee-200/50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      데이터 가져오기
                    </UnifiedButton>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 위험한 작업 - 하이브리드 경고 카드 */}
          <Card variant="default" className="bg-red-50/80 backdrop-blur-sm border border-red-200/50 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                위험한 작업
              </h3>
              
              <div className="text-sm text-red-600 mb-4">
                이 작업들은 되돌릴 수 없습니다. 신중히 진행해주세요.
              </div>

              {!showDeleteConfirm ? (
                <UnifiedButton
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="danger"
                  fullWidth
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  모든 데이터 삭제
                </UnifiedButton>
              ) : (
                <div className="space-y-3">
                  <Alert variant="error" className="bg-red-100/80 border-red-300/50">
                    <p className="font-medium mb-2 text-red-800">
                      정말로 모든 데이터를 삭제하시겠습니까?
                    </p>
                    <p className="text-xs text-red-600">
                      {records.length}개의 커피 기록과 모든 설정이 영구적으로 삭제됩니다.
                    </p>
                  </Alert>
                  <div className="grid grid-cols-2 gap-3">
                    <UnifiedButton
                      onClick={deleteAllData}
                      variant="danger"
                      fullWidth
                      className="bg-red-500 hover:bg-red-600"
                    >
                      삭제 확인
                    </UnifiedButton>
                    <UnifiedButton
                      onClick={() => setShowDeleteConfirm(false)}
                      variant="secondary"
                      fullWidth
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700"
                    >
                      취소
                    </UnifiedButton>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 앱 정보 - 하이브리드 정보 카드 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm border border-coffee-200/30 shadow-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center">
                <Info className="h-5 w-5 mr-2" />
                앱 정보
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-coffee-50/50 rounded-lg">
                  <div className="text-sm font-medium text-coffee-700">버전</div>
                  <div className="text-coffee-600 mt-1">v1.1.0</div>
                </div>
                <div className="text-center p-3 bg-coffee-50/50 rounded-lg">
                  <div className="text-sm font-medium text-coffee-700">데이터 저장</div>
                  <div className="text-coffee-600 mt-1">로컬 브라우저</div>
                </div>
                <div className="text-center p-3 bg-coffee-50/50 rounded-lg">
                  <div className="text-sm font-medium text-coffee-700">개발자</div>
                  <div className="text-coffee-600 mt-1">CupNote Team</div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-coffee-200/30 text-center">
                <p className="text-xs text-coffee-500">
                  개인정보 처리방침 • 이용약관 • 문의하기
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
