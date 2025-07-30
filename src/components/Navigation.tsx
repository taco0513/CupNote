import Link from 'next/link'
import { BarChart3, Settings, Plus, ArrowLeft } from 'lucide-react'

interface NavigationProps {
  showBackButton?: boolean
  backHref?: string
  currentPage?: 'home' | 'stats' | 'settings' | 'record' | 'detail'
}

export default function Navigation({ 
  showBackButton = false, 
  backHref = "/",
  currentPage = 'home'
}: NavigationProps) {
  const isActive = (page: string) => currentPage === page

  return (
    <nav className="flex items-center justify-between mb-8 bg-white rounded-xl p-4 shadow-sm border border-coffee-100">
      <div className="flex items-center">
        {showBackButton && (
          <Link 
            href={backHref}
            className="flex items-center text-coffee-600 hover:text-coffee-800 mr-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            돌아가기
          </Link>
        )}
        <Link href="/" className="text-2xl font-bold text-coffee-800">☕ CupNote</Link>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link
          href="/stats"
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isActive('stats')
              ? 'bg-coffee-100 text-coffee-800'
              : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
          }`}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          통계
        </Link>
        <Link
          href="/settings"
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isActive('settings')
              ? 'bg-coffee-100 text-coffee-800'
              : 'text-coffee-600 hover:text-coffee-800 hover:bg-coffee-50'
          }`}
        >
          <Settings className="h-4 w-4 mr-2" />
          설정
        </Link>
        <Link
          href="/record"
          className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
            isActive('record')
              ? 'bg-coffee-700 text-white'
              : 'bg-coffee-600 text-white hover:bg-coffee-700'
          }`}
        >
          <Plus className="h-4 w-4 mr-2" />
          기록하기
        </Link>
      </div>
    </nav>
  )
}