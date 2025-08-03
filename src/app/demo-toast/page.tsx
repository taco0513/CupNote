/**
 * Toast 데모 페이지
 * 토스트 알림 시스템 테스트
 */
'use client'

import { Coffee, Save, Trash, Download, Share } from 'lucide-react'

import Navigation from '../../components/Navigation'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import PageLayout from '../../components/ui/PageLayout'
import { 
  ToastProvider, 
  useSuccessToast, 
  useErrorToast, 
  useWarningToast, 
  useInfoToast,
  useCoffeeToast,
  useToast
} from '../../components/ui/Toast'
import UnifiedButton from '../../components/ui/UnifiedButton'

function ToastDemoContent() {
  const successToast = useSuccessToast()
  const errorToast = useErrorToast()
  const warningToast = useWarningToast()
  const infoToast = useInfoToast()
  const coffeeToast = useCoffeeToast()
  const { addToast } = useToast()

  const handleSaveRecord = () => {
    successToast('기록이 저장되었습니다', {
      title: '저장 완료'
    })
  }

  const handleDeleteRecord = () => {
    errorToast('기록을 삭제할 수 없습니다', {
      title: '삭제 실패',
      duration: 6000
    })
  }

  const handleWarning = () => {
    warningToast('저장되지 않은 변경사항이 있습니다', {
      title: '주의',
      action: {
        label: '저장하기',
        onClick: () => {
          successToast('자동 저장되었습니다')
        }
      }
    })
  }

  const handleInfo = () => {
    infoToast('새로운 업데이트가 있습니다', {
      title: '알림',
      persistent: true
    })
  }

  const handleCoffeeRecord = () => {
    coffeeToast('오늘의 커피를 기록했습니다 ☕', {
      title: '에티오피아 예가체프',
      action: {
        label: '자세히 보기',
        onClick: () => {
          console.log('Navigate to record')
        }
      }
    })
  }

  const handleShareSuccess = () => {
    addToast({
      type: 'success',
      title: '공유 완료',
      message: '커피 기록이 성공적으로 공유되었습니다',
      duration: 4000
    })
  }

  const handleExportData = () => {
    addToast({
      type: 'info',
      title: '데이터 내보내기',
      message: '데이터를 준비하는 중입니다...',
      persistent: true,
      action: {
        label: '다운로드',
        onClick: () => {
          successToast('다운로드가 시작되었습니다')
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-coffee-50 to-coffee-100">
      <Navigation showBackButton currentPage="home" />
      
      <PageLayout>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-coffee-800 mb-2">토스트 알림 데모</h1>
          <p className="text-coffee-600">하이브리드 디자인 시스템 토스트 컴포넌트 테스트</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 기본 토스트 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>기본 토스트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UnifiedButton 
                variant="primary"
                onClick={handleSaveRecord}
                className="w-full bg-green-500 hover:bg-green-600"
              >
                <Save className="h-4 w-4 mr-2" />
                성공 메시지
              </UnifiedButton>

              <UnifiedButton 
                variant="primary"
                onClick={handleDeleteRecord}
                className="w-full bg-red-500 hover:bg-red-600"
              >
                <Trash className="h-4 w-4 mr-2" />
                에러 메시지
              </UnifiedButton>

              <UnifiedButton 
                variant="primary"
                onClick={handleWarning}
                className="w-full bg-amber-500 hover:bg-amber-600"
              >
                경고 메시지 (액션 포함)
              </UnifiedButton>

              <UnifiedButton 
                variant="primary"
                onClick={handleInfo}
                className="w-full bg-blue-500 hover:bg-blue-600"
              >
                정보 메시지 (고정)
              </UnifiedButton>
            </CardContent>
          </Card>

          {/* 커피 테마 토스트 */}
          <Card variant="default" className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>커피 테마 토스트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UnifiedButton 
                variant="primary"
                onClick={handleCoffeeRecord}
                className="w-full"
              >
                <Coffee className="h-4 w-4 mr-2" />
                커피 기록 토스트
              </UnifiedButton>

              <UnifiedButton 
                variant="outline"
                onClick={handleShareSuccess}
                className="w-full"
              >
                <Share className="h-4 w-4 mr-2" />
                공유 성공
              </UnifiedButton>

              <UnifiedButton 
                variant="outline"
                onClick={handleExportData}
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                데이터 내보내기
              </UnifiedButton>
            </CardContent>
          </Card>
        </div>

        {/* 사용 예시 코드 */}
        <Card variant="default" className="bg-white/80 backdrop-blur-sm mt-6">
          <CardHeader>
            <CardTitle>사용 방법</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-coffee-50 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{`// 1. Provider로 앱 감싸기
<ToastProvider>
  <App />
</ToastProvider>

// 2. Hook 사용하기
const successToast = useSuccessToast()
const coffeeToast = useCoffeeToast()

// 3. 토스트 표시
successToast('저장되었습니다')
coffeeToast('커피 기록 완료', {
  title: '에티오피아 예가체프',
  action: {
    label: '보기',
    onClick: () => console.log('View')
  }
})`}</code>
            </pre>
          </CardContent>
        </Card>
      </PageLayout>
    </div>
  )
}

export default function ToastDemoPage() {
  return (
    <ToastProvider>
      <ToastDemoContent />
    </ToastProvider>
  )
}