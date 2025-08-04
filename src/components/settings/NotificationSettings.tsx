// 알림 설정 컴포넌트

'use client'

import { useState, useEffect } from 'react'
import { Bell, Award, BarChart3, Info, CheckCircle } from 'lucide-react'
import { useSystemNotifications } from '../../contexts/SystemNotificationContext'
import { NotificationSettings as NotificationSettingsType } from '../../types/notification'

export default function NotificationSettings() {
  const { settings, updateSettings, requestPermission } = useSystemNotifications()
  const [tempSettings, setTempSettings] = useState<NotificationSettingsType>(settings)
  const [hasChanges, setHasChanges] = useState(false)
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default')

  useEffect(() => {
    setTempSettings(settings)
  }, [settings])

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission)
    }
  }, [])

  useEffect(() => {
    const changed = JSON.stringify(tempSettings) !== JSON.stringify(settings)
    setHasChanges(changed)
  }, [tempSettings, settings])

  const handleToggle = (key: keyof NotificationSettingsType, value: boolean | string | number[]) => {
    setTempSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    updateSettings(tempSettings)
    setHasChanges(false)
  }

  const handleRequestPermission = async () => {
    const permission = await requestPermission()
    setPermissionStatus(permission)
  }


  return (
    <div className="space-y-6">
      {/* 알림 권한 상태 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-coffee-600" />
            <h3 className="text-lg font-semibold text-coffee-800">브라우저 알림 권한</h3>
          </div>
          {permissionStatus === 'granted' && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-coffee-700">현재 상태:</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              permissionStatus === 'granted' ? 'bg-green-100 text-green-800' :
              permissionStatus === 'denied' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {permissionStatus === 'granted' ? '허용됨' :
               permissionStatus === 'denied' ? '차단됨' : '설정되지 않음'}
            </span>
          </div>
          
          {permissionStatus !== 'granted' && (
            <button
              onClick={handleRequestPermission}
              className="w-full bg-coffee-500 text-white py-2 px-4 rounded-xl hover:bg-coffee-600 transition-colors"
            >
              알림 권한 요청
            </button>
          )}
          
          <p className="text-sm text-coffee-600">
            브라우저 알림을 받으려면 권한을 허용해주세요. 앱을 닫아도 중요한 알림을 받을 수 있습니다.
          </p>
        </div>
      </div>

      {/* 전체 알림 설정 */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-coffee-600" />
            <h3 className="text-lg font-semibold text-coffee-800">알림 설정</h3>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={tempSettings.enabled}
              onChange={(e) => handleToggle('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
          </label>
        </div>
        
        <p className="text-sm text-coffee-600 mb-4">
          모든 알림을 켜거나 끌 수 있습니다.
        </p>
      </div>

      {/* 세부 알림 설정 */}
      {tempSettings.enabled && (
        <div className="space-y-4">

          {/* 성취 알림 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-amber-600" />
                <h4 className="font-medium text-coffee-800">새로운 뱃지 획득</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.achievement}
                  onChange={(e) => handleToggle('achievement', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
              </label>
            </div>
            
            <p className="text-sm text-coffee-600">
              새로운 뱃지를 획득했을 때 알려드려요.
            </p>
          </div>

          {/* 통계 알림 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-coffee-800">주간/월간 요약</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.stats}
                  onChange={(e) => handleToggle('stats', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
              </label>
            </div>
            
            <p className="text-sm text-coffee-600">
              주간, 월간 커피 여정 요약을 알려드려요.
            </p>
          </div>

          {/* 시스템 알림 */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-coffee-200/30">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Info className="h-5 w-5 text-gray-600" />
                <h4 className="font-medium text-coffee-800">시스템 알림</h4>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={tempSettings.system}
                  onChange={(e) => handleToggle('system', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-coffee-200/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-500 shadow-sm"></div>
              </label>
            </div>
            
            <p className="text-sm text-coffee-600">
              앱 업데이트, 공지사항 등을 알려드려요.
            </p>
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      {hasChanges && (
        <div className="sticky bottom-4 bg-white rounded-2xl p-4 shadow-lg border border-coffee-200/30">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setTempSettings(settings)
                setHasChanges(false)
              }}
              className="flex-1 px-4 py-3 border border-coffee-300 text-coffee-700 rounded-xl hover:bg-coffee-50 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-3 bg-coffee-500 text-white rounded-xl hover:bg-coffee-600 transition-colors font-medium"
            >
              저장
            </button>
          </div>
        </div>
      )}
    </div>
  )
}