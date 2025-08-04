/**
 * Offline Page - PWA Offline Experience
 * Displayed when user is offline and requested page is not cached
 */
import { Metadata } from 'next'
import { Coffee, Wifi, RefreshCw } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '오프라인 모드',
  description: '인터넷 연결을 확인해주세요'
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background-secondary flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Offline Icon */}
        <div className="relative mb-8">
          <Coffee className="h-16 w-16 text-coffee-400 mx-auto mb-4" />
          <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-2">
            <Wifi className="h-4 w-4 text-white" />
          </div>
        </div>

        {/* Main Message */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-coffee-100">
          <h1 className="text-2xl font-bold text-coffee-800 mb-4">
            오프라인 모드
          </h1>
          
          <p className="text-coffee-600 mb-6 leading-relaxed">
            인터넷 연결이 없어도 이미 기록한 커피 노트들을 확인할 수 있습니다. 
            연결이 복구되면 자동으로 동기화됩니다.
          </p>

          {/* Offline Actions */}
          <div className="space-y-4">
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-coffee-600 text-white py-3 px-4 rounded-xl hover:bg-coffee-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              다시 시도
            </button>

            <Link
              href="/"
              className="block w-full bg-coffee-100 text-coffee-700 py-3 px-4 rounded-xl hover:bg-coffee-200 transition-colors"
            >
              홈으로 이동
            </Link>

            <Link
              href="/my-records"
              className="block w-full bg-coffee-50 text-coffee-600 py-3 px-4 rounded-xl hover:bg-coffee-100 transition-colors"
            >
              내 기록 보기
            </Link>
          </div>

          {/* Connection Status */}
          <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-sm">연결 상태 확인 중...</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 text-left">
          <h3 className="text-coffee-700 font-semibold mb-3">💡 오프라인에서도 가능한 작업:</h3>
          <ul className="text-coffee-600 text-sm space-y-2">
            <li>• 이전에 기록한 커피 노트 읽기</li>
            <li>• 즐겨찾기한 레시피 확인</li>
            <li>• 성취 배지 보기</li>
            <li>• 새 기록 작성 (연결 시 동기화)</li>
          </ul>
        </div>
      </div>

      {/* Background Animation */}
      <div className="fixed inset-0 pointer-events-none opacity-10">
        <div className="absolute top-20 left-10 animate-float">
          <Coffee className="h-8 w-8 text-coffee-300" />
        </div>
        <div className="absolute top-40 right-20 animate-float-delayed">
          <Coffee className="h-6 w-6 text-coffee-300" />
        </div>
        <div className="absolute bottom-32 left-20 animate-float">
          <Coffee className="h-10 w-10 text-coffee-300" />
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}