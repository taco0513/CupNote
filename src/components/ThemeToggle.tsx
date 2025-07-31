'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun, Moon, Monitor } from 'lucide-react'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ variant = 'button', size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme, toggleTheme } = useTheme()

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }[size]

  const buttonSize = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }[size]

  if (variant === 'button') {
    return (
      <button
        onClick={toggleTheme}
        className={`
          ${buttonSize}
          inline-flex items-center justify-center rounded-full
          bg-secondary hover:bg-secondary-hover
          text-secondary-foreground
          transition-all duration-200
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        `}
        title={`현재: ${effectiveTheme === 'light' ? '라이트' : '다크'} 모드`}
        aria-label="테마 변경"
      >
        {effectiveTheme === 'light' ? (
          <Sun size={iconSize} className="text-amber-500" />
        ) : (
          <Moon size={iconSize} className="text-blue-400" />
        )}
      </button>
    )
  }

  return (
    <div className="relative group">
      <button
        className={`
          ${buttonSize}
          inline-flex items-center justify-center rounded-full
          bg-secondary hover:bg-secondary-hover
          text-secondary-foreground
          transition-all duration-200
          hover:scale-105 active:scale-95
          focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
        `}
        title="테마 선택"
        aria-label="테마 선택 메뉴"
      >
        {theme === 'system' ? (
          <Monitor size={iconSize} />
        ) : theme === 'light' ? (
          <Sun size={iconSize} className="text-amber-500" />
        ) : (
          <Moon size={iconSize} className="text-blue-400" />
        )}
      </button>
      
      <div className="
        absolute top-full right-0 mt-2
        opacity-0 invisible group-hover:opacity-100 group-hover:visible
        transition-all duration-200 ease-in-out
        bg-background border border-border rounded-lg shadow-lg
        min-w-[120px] py-1
        z-50
      ">
        <button
          onClick={() => setTheme('light')}
          className={`
            w-full px-3 py-2 text-left text-sm
            hover:bg-secondary transition-colors
            flex items-center gap-2
            ${theme === 'light' ? 'bg-secondary text-primary font-medium' : 'text-foreground'}
          `}
        >
          <Sun size={16} className="text-amber-500" />
          라이트
        </button>
        
        <button
          onClick={() => setTheme('dark')}
          className={`
            w-full px-3 py-2 text-left text-sm
            hover:bg-secondary transition-colors
            flex items-center gap-2
            ${theme === 'dark' ? 'bg-secondary text-primary font-medium' : 'text-foreground'}
          `}
        >
          <Moon size={16} className="text-blue-400" />
          다크
        </button>
        
        <button
          onClick={() => setTheme('system')}
          className={`
            w-full px-3 py-2 text-left text-sm
            hover:bg-secondary transition-colors
            flex items-center gap-2
            ${theme === 'system' ? 'bg-secondary text-primary font-medium' : 'text-foreground'}
          `}
        >
          <Monitor size={16} />
          시스템
        </button>
      </div>
    </div>
  )
}