'use client'

import { useState } from 'react'
import { HelpCircle, X } from 'lucide-react'

interface HelpTooltipProps {
  title: string
  content: string
  position?: 'top' | 'bottom' | 'left' | 'right'
  className?: string
}

export default function HelpTooltip({
  title,
  content,
  position = 'top',
  className = '',
}: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const getPositionClasses = () => {
    const baseClasses =
      'absolute z-50 bg-coffee-800 text-white text-sm rounded-lg p-3 shadow-lg max-w-xs'

    switch (position) {
      case 'top':
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
      case 'bottom':
        return `${baseClasses} top-full left-1/2 transform -translate-x-1/2 mt-2`
      case 'left':
        return `${baseClasses} right-full top-1/2 transform -translate-y-1/2 mr-2`
      case 'right':
        return `${baseClasses} left-full top-1/2 transform -translate-y-1/2 ml-2`
      default:
        return `${baseClasses} bottom-full left-1/2 transform -translate-x-1/2 mb-2`
    }
  }

  const getArrowClasses = () => {
    const baseArrow = 'absolute w-2 h-2 bg-coffee-800 transform rotate-45'

    switch (position) {
      case 'top':
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`
      case 'bottom':
        return `${baseArrow} bottom-full left-1/2 -translate-x-1/2 translate-y-1/2`
      case 'left':
        return `${baseArrow} left-full top-1/2 -translate-x-1/2 -translate-y-1/2`
      case 'right':
        return `${baseArrow} right-full top-1/2 translate-x-1/2 -translate-y-1/2`
      default:
        return `${baseArrow} top-full left-1/2 -translate-x-1/2 -translate-y-1/2`
    }
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="text-coffee-400 hover:text-coffee-600 transition-colors p-1"
        aria-label="도움말"
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isVisible && (
        <>
          <div className={getPositionClasses()}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-white">{title}</h4>
              <button
                onClick={() => setIsVisible(false)}
                className="text-coffee-300 hover:text-white ml-2 flex-shrink-0"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
            <p className="text-coffee-100 text-xs leading-relaxed">{content}</p>
            <div className={getArrowClasses()} />
          </div>

          {/* 모바일용 오버레이 */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsVisible(false)} />
        </>
      )}
    </div>
  )
}
