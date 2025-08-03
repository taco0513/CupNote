/**
 * 어드민 시스템 설정 페이지
 * 공지사항, 앱 설정, 콘텐츠 관리, 시스템 구성
 */
'use client'

import { useState, useEffect } from 'react'

import { 
  Settings, 
  Bell, 
  Shield,
  Database,
  Monitor,
  Palette,
  Globe,
  Mail,
  Key,
  FileText,
  Upload,
  Download,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Tag,
  Users,
  Coffee
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card'
import UnifiedButton from '../../../components/ui/UnifiedButton'
import { logger } from '../../../lib/logger'
import { supabase } from '../../../lib/supabase'

interface SystemConfig {
  // 일반 설정
  general: {
    appName: string
    appDescription: string
    maintenanceMode: boolean
    betaMode: boolean
    registrationEnabled: boolean
    maxUsersPerDay: number
  }
  
  // 알림 설정
  notifications: {
    emailNotifications: boolean
    pushNotifications: boolean
    feedbackAlerts: boolean
    systemAlerts: boolean
    adminEmail: string
  }
  
  // 보안 설정
  security: {
    passwordMinLength: number
    sessionTimeout: number
    maxLoginAttempts: number
    twoFactorRequired: boolean
    rateLimiting: boolean
  }
  
  // 콘텐츠 설정
  content: {
    maxImageSize: number // MB
    allowedImageTypes: string[]
    maxRecordsPerUser: number
    autoModeration: boolean
  }
  
  // 성능 설정
  performance: {
    cacheEnabled: boolean
    compressionEnabled: boolean
    cdnEnabled: boolean
    analyticsEnabled: boolean
  }
}

interface Announcement {
  id: string
  title: string
  content: string
  type: 'info' | 'warning' | 'success' | 'error'
  priority: 'low' | 'medium' | 'high'
  startDate: string
  endDate: string | null
  isActive: boolean
  targetUsers: 'all' | 'new' | 'beta' | 'admin'
  created_at: string
  updated_at: string
}

interface ContentTemplate {
  id: string
  name: string
  type: 'tip' | 'guide' | 'faq' | 'message'
  content: string
  isActive: boolean
  order: number
}

export default function AdminSettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    general: {
      appName: 'CupNote',
      appDescription: '스페셜티 커피 애호가들을 위한 개인화된 커피 기록 & 커뮤니티 플랫폼',
      maintenanceMode: false,
      betaMode: true,
      registrationEnabled: true,
      maxUsersPerDay: 100
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      feedbackAlerts: true,
      systemAlerts: true,
      adminEmail: 'admin@cupnote.app'
    },
    security: {
      passwordMinLength: 8,
      sessionTimeout: 24, // hours
      maxLoginAttempts: 5,
      twoFactorRequired: false,
      rateLimiting: true
    },
    content: {
      maxImageSize: 5, // MB
      allowedImageTypes: ['jpg', 'jpeg', 'png', 'webp'],
      maxRecordsPerUser: 1000,
      autoModeration: false
    },
    performance: {
      cacheEnabled: true,
      compressionEnabled: true,
      cdnEnabled: false,
      analyticsEnabled: true
    }
  })
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [contentTemplates, setContentTemplates] = useState<ContentTemplate[]>([])
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'content' | 'performance' | 'announcements' | 'templates'>('general')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [newAnnouncement, setNewAnnouncement] = useState<Partial<Announcement>>({
    title: '',
    content: '',
    type: 'info',
    priority: 'medium',
    targetUsers: 'all'
  })

  // 설정 데이터 로드
  const loadSettings = async () => {
    try {
      setIsLoading(true)
      
      // 실제 구현에서는 Supabase에서 설정을 가져옴
      // 현재는 기본값 사용
      
      // 공지사항 시뮬레이션 데이터
      const simulatedAnnouncements: Announcement[] = [
        {
          id: '1',
          title: '베타 서비스 론칭',
          content: 'CupNote 베타 서비스가 정식으로 시작되었습니다! 많은 피드백 부탁드립니다.',
          type: 'success',
          priority: 'high',
          startDate: new Date().toISOString(),
          endDate: null,
          isActive: true,
          targetUsers: 'all',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          title: '시스템 점검 안내',
          content: '매주 일요일 새벽 2-4시 정기 점검이 진행됩니다.',
          type: 'info',
          priority: 'medium',
          startDate: new Date().toISOString(),
          endDate: null,
          isActive: true,
          targetUsers: 'all',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      
      // 콘텐츠 템플릿 시뮬레이션 데이터
      const simulatedTemplates: ContentTemplate[] = [
        {
          id: '1',
          name: '오늘의 커피 팁',
          type: 'tip',
          content: '좋은 커피를 위해서는 신선한 원두가 가장 중요합니다.',
          isActive: true,
          order: 1
        },
        {
          id: '2',
          name: '첫 기록 가이드',
          type: 'guide',
          content: '처음 커피를 기록하는 방법을 안내해드립니다.',
          isActive: true,
          order: 2
        }
      ]
      
      setAnnouncements(simulatedAnnouncements)
      setContentTemplates(simulatedTemplates)
      
      logger.info('Admin settings loaded successfully')
      
    } catch (error) {
      logger.error('Failed to load admin settings', { error })
    } finally {
      setIsLoading(false)
    }
  }

  // 설정 저장
  const saveSettings = async () => {
    try {
      setIsSaving(true)
      
      // 실제 구현에서는 Supabase에 설정 저장
      await new Promise(resolve => setTimeout(resolve, 1000)) // 시뮬레이션
      
      setHasChanges(false)
      logger.info('Admin settings saved successfully', { config })
      
      // 성공 메시지 표시 (실제 구현에서는 토스트 등 사용)
      alert('설정이 저장되었습니다.')
      
    } catch (error) {
      logger.error('Failed to save admin settings', { error })
      alert('설정 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  // 공지사항 추가
  const addAnnouncement = async () => {
    try {
      if (!newAnnouncement.title || !newAnnouncement.content) {
        alert('제목과 내용을 입력해주세요.')
        return
      }
      
      const announcement: Announcement = {
        ...newAnnouncement,
        id: Date.now().toString(),
        startDate: new Date().toISOString(),
        endDate: null,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as Announcement
      
      setAnnouncements(prev => [announcement, ...prev])
      setNewAnnouncement({
        title: '',
        content: '',
        type: 'info',
        priority: 'medium',
        targetUsers: 'all'
      })
      
      logger.info('Announcement added', { announcement })
      
    } catch (error) {
      logger.error('Failed to add announcement', { error })
    }
  }

  // 공지사항 삭제
  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id))
  }

  // 설정 변경 감지
  const handleConfigChange = (section: keyof SystemConfig, key: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasChanges(true)
  }

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadSettings()
  }, [])

  // 타입 색상
  const getAnnouncementTypeColor = (type: Announcement['type']) => {
    switch (type) {
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'success': return 'text-green-600 bg-green-50 border-green-200'
      case 'error': return 'text-red-600 bg-red-50 border-red-200'
    }
  }

  // 우선순위 색상
  const getPriorityColor = (priority: Announcement['priority']) => {
    switch (priority) {
      case 'low': return 'text-gray-600 bg-gray-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'high': return 'text-red-600 bg-red-50'
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-coffee-800">시스템 설정 로딩 중...</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-coffee-200 rounded mb-2"></div>
                <div className="h-8 bg-coffee-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-coffee-800">시스템 설정</h1>
          <p className="text-coffee-600 mt-1">
            CupNote 시스템의 전반적인 설정을 관리하세요
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {hasChanges && (
            <span className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              저장되지 않은 변경사항이 있습니다
            </span>
          )}
          <UnifiedButton
            variant="outline"
            size="small"
            onClick={loadSettings}
            className="border-coffee-200 text-coffee-600 hover:bg-coffee-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            새로고침
          </UnifiedButton>
          <UnifiedButton
            variant="default"
            size="small"
            onClick={saveSettings}
            disabled={!hasChanges || isSaving}
            className="bg-gradient-to-r from-coffee-500 to-coffee-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? '저장 중...' : '설정 저장'}
          </UnifiedButton>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex space-x-1 bg-coffee-100 p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'general', label: '일반', icon: <Settings className="h-4 w-4" /> },
          { id: 'notifications', label: '알림', icon: <Bell className="h-4 w-4" /> },
          { id: 'security', label: '보안', icon: <Shield className="h-4 w-4" /> },
          { id: 'content', label: '콘텐츠', icon: <FileText className="h-4 w-4" /> },
          { id: 'performance', label: '성능', icon: <Monitor className="h-4 w-4" /> },
          { id: 'announcements', label: '공지사항', icon: <Bell className="h-4 w-4" /> },
          { id: 'templates', label: '템플릿', icon: <FileText className="h-4 w-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white text-coffee-600 shadow-sm'
                : 'text-coffee-600 hover:text-coffee-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 일반 설정 */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>앱 기본 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">앱 이름</label>
                <input
                  type="text"
                  value={config.general.appName}
                  onChange={(e) => handleConfigChange('general', 'appName', e.target.value)}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">앱 설명</label>
                <textarea
                  value={config.general.appDescription}
                  onChange={(e) => handleConfigChange('general', 'appDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">일일 최대 가입자 수</label>
                <input
                  type="number"
                  value={config.general.maxUsersPerDay}
                  onChange={(e) => handleConfigChange('general', 'maxUsersPerDay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>서비스 상태</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">점검 모드</div>
                  <div className="text-sm text-coffee-600">점검 중에는 서비스 이용이 제한됩니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.general.maintenanceMode}
                    onChange={(e) => handleConfigChange('general', 'maintenanceMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">베타 모드</div>
                  <div className="text-sm text-coffee-600">베타 기능을 활성화합니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.general.betaMode}
                    onChange={(e) => handleConfigChange('general', 'betaMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">신규 가입 허용</div>
                  <div className="text-sm text-coffee-600">새로운 사용자 가입을 허용합니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.general.registrationEnabled}
                    onChange={(e) => handleConfigChange('general', 'registrationEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 알림 설정 */}
      {activeTab === 'notifications' && (
        <Card>
          <CardHeader>
            <CardTitle>알림 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">관리자 이메일</label>
              <input
                type="email"
                value={config.notifications.adminEmail}
                onChange={(e) => handleConfigChange('notifications', 'adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">이메일 알림</div>
                  <div className="text-sm text-coffee-600">시스템 알림을 이메일로 받습니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifications.emailNotifications}
                    onChange={(e) => handleConfigChange('notifications', 'emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">피드백 알림</div>
                  <div className="text-sm text-coffee-600">새로운 피드백이 등록되면 알림을 받습니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifications.feedbackAlerts}
                    onChange={(e) => handleConfigChange('notifications', 'feedbackAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">시스템 알림</div>
                  <div className="text-sm text-coffee-600">시스템 이슈 발생시 알림을 받습니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.notifications.systemAlerts}
                    onChange={(e) => handleConfigChange('notifications', 'systemAlerts', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 보안 설정 */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle>보안 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">최소 비밀번호 길이</label>
                <input
                  type="number"
                  value={config.security.passwordMinLength}
                  onChange={(e) => handleConfigChange('security', 'passwordMinLength', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">세션 만료 시간 (시간)</label>
                <input
                  type="number"
                  value={config.security.sessionTimeout}
                  onChange={(e) => handleConfigChange('security', 'sessionTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">최대 로그인 시도 횟수</label>
                <input
                  type="number"
                  value={config.security.maxLoginAttempts}
                  onChange={(e) => handleConfigChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-coffee-800">속도 제한</div>
                  <div className="text-sm text-coffee-600">API 요청 속도를 제한합니다</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.security.rateLimiting}
                    onChange={(e) => handleConfigChange('security', 'rateLimiting', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 콘텐츠 설정 */}
      {activeTab === 'content' && (
        <Card>
          <CardHeader>
            <CardTitle>콘텐츠 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">최대 이미지 크기 (MB)</label>
                <input
                  type="number"
                  value={config.content.maxImageSize}
                  onChange={(e) => handleConfigChange('content', 'maxImageSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">사용자당 최대 기록 수</label>
                <input
                  type="number"
                  value={config.content.maxRecordsPerUser}
                  onChange={(e) => handleConfigChange('content', 'maxRecordsPerUser', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">허용 이미지 형식</label>
              <div className="flex flex-wrap gap-2">
                {['jpg', 'jpeg', 'png', 'webp', 'gif'].map(type => (
                  <label key={type} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={config.content.allowedImageTypes.includes(type)}
                      onChange={(e) => {
                        const types = e.target.checked
                          ? [...config.content.allowedImageTypes, type]
                          : config.content.allowedImageTypes.filter(t => t !== type)
                        handleConfigChange('content', 'allowedImageTypes', types)
                      }}
                      className="rounded border-coffee-300 text-coffee-600 focus:ring-coffee-500"
                    />
                    <span className="text-sm text-coffee-700">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 성능 설정 */}
      {activeTab === 'performance' && (
        <Card>
          <CardHeader>
            <CardTitle>성능 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-coffee-800">캐시 활성화</div>
                <div className="text-sm text-coffee-600">응답 속도를 개선합니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.performance.cacheEnabled}
                  onChange={(e) => handleConfigChange('performance', 'cacheEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-coffee-800">압축 활성화</div>
                <div className="text-sm text-coffee-600">네트워크 사용량을 줄입니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.performance.compressionEnabled}
                  onChange={(e) => handleConfigChange('performance', 'compressionEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-coffee-800">분석 활성화</div>
                <div className="text-sm text-coffee-600">사용자 행동을 분석합니다</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.performance.analyticsEnabled}
                  onChange={(e) => handleConfigChange('performance', 'analyticsEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
              </label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 공지사항 관리 */}
      {activeTab === 'announcements' && (
        <div className="space-y-6">
          {/* 새 공지사항 작성 */}
          <Card>
            <CardHeader>
              <CardTitle>새 공지사항 작성</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-coffee-700 mb-2">제목</label>
                  <input
                    type="text"
                    value={newAnnouncement.title}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    placeholder="공지사항 제목을 입력하세요"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">유형</label>
                    <select
                      value={newAnnouncement.type}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, type: e.target.value as Announcement['type'] }))}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="info">정보</option>
                      <option value="warning">경고</option>
                      <option value="success">성공</option>
                      <option value="error">오류</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">우선순위</label>
                    <select
                      value={newAnnouncement.priority}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, priority: e.target.value as Announcement['priority'] }))}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="low">낮음</option>
                      <option value="medium">보통</option>
                      <option value="high">높음</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-coffee-700 mb-2">대상</label>
                    <select
                      value={newAnnouncement.targetUsers}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, targetUsers: e.target.value as Announcement['targetUsers'] }))}
                      className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="all">모든 사용자</option>
                      <option value="new">신규 사용자</option>
                      <option value="beta">베타 사용자</option>
                      <option value="admin">관리자</option>
                    </select>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-coffee-700 mb-2">내용</label>
                <textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-coffee-200 rounded-lg focus:ring-2 focus:ring-coffee-500"
                  placeholder="공지사항 내용을 입력하세요"
                />
              </div>
              <UnifiedButton
                variant="default"
                onClick={addAnnouncement}
                className="bg-gradient-to-r from-coffee-500 to-coffee-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                공지사항 추가
              </UnifiedButton>
            </CardContent>
          </Card>

          {/* 공지사항 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>공지사항 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${getAnnouncementTypeColor(announcement.type)}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium text-coffee-800">{announcement.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                            {announcement.priority === 'high' ? '높음' : announcement.priority === 'medium' ? '보통' : '낮음'}
                          </span>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {announcement.targetUsers === 'all' ? '모든 사용자' : 
                             announcement.targetUsers === 'new' ? '신규 사용자' :
                             announcement.targetUsers === 'beta' ? '베타 사용자' : '관리자'}
                          </span>
                        </div>
                        <p className="text-sm text-coffee-700 mb-2">{announcement.content}</p>
                        <div className="text-xs text-coffee-500">
                          {new Date(announcement.created_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          className="p-2"
                        >
                          <Edit className="h-4 w-4" />
                        </UnifiedButton>
                        <UnifiedButton
                          variant="ghost"
                          size="small"
                          onClick={() => deleteAnnouncement(announcement.id)}
                          className="p-2 text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </UnifiedButton>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 콘텐츠 템플릿 */}
      {activeTab === 'templates' && (
        <Card>
          <CardHeader>
            <CardTitle>콘텐츠 템플릿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contentTemplates.map(template => (
                <div key={template.id} className="p-4 border border-coffee-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-coffee-800">{template.name}</h3>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.isActive ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50'
                      }`}>
                        {template.isActive ? '활성' : '비활성'}
                      </span>
                      <UnifiedButton
                        variant="ghost"
                        size="small"
                        className="p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </UnifiedButton>
                    </div>
                  </div>
                  <p className="text-sm text-coffee-600">{template.content}</p>
                  <div className="text-xs text-coffee-500 mt-2">
                    유형: {template.type} · 순서: {template.order}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}