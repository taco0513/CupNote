'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Sun } from 'lucide-react'

interface ThemeToggleProps {
  variant?: 'button' | 'dropdown'
  size?: 'sm' | 'md' | 'lg'
}

export default function ThemeToggle({ variant = 'button', size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme, effectiveTheme } = useTheme()

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

  // 라이트 모드만 표시 (고정)
  return (
    <div className={`
      ${buttonSize}
      inline-flex items-center justify-center rounded-full
      bg-secondary text-secondary-foreground
      opacity-60 cursor-default
    `}>
      <Sun size={iconSize} className="text-amber-500" />
    </div>
  )
}