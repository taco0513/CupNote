'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface MobileHeaderProps {
  title?: string
  showBackButton?: boolean
  onBackClick?: () => void
  rightElement?: React.ReactNode
}

export default function MobileHeader({ 
  title, 
  showBackButton = false, 
  onBackClick,
  rightElement 
}: MobileHeaderProps) {
  const router = useRouter()
  
  const handleBack = () => {
    if (onBackClick) {
      onBackClick()
    } else {
      router.back()
    }
  }
  
  // 타이틀이나 백버튼이 없으면 아무것도 렌더링하지 않음
  if (!title && !showBackButton) {
    return null
  }
  
  return (
    <div className="md:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border">
      <div className="flex items-center justify-between h-14 px-4">
        {/* 왼쪽 영역 */}
        <div className="flex items-center flex-1">
          {showBackButton && (
            <button
              onClick={handleBack}
              className="mr-3 p-2 -ml-2 rounded-lg hover:bg-secondary/50 active:bg-secondary transition-colors"
              aria-label="뒤로가기"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          {title && (
            <h1 className="text-lg font-semibold text-foreground truncate">
              {title}
            </h1>
          )}
        </div>
        
        {/* 오른쪽 영역 */}
        {rightElement && (
          <div className="flex items-center ml-4">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  )
}