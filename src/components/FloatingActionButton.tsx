'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'

import { Plus } from 'lucide-react'

interface FloatingActionButtonProps {
  href?: string
  onClick?: () => void
  className?: string
}

export default function FloatingActionButton({ 
  href = '/mode-selection',
  onClick,
  className = ''
}: FloatingActionButtonProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // 스크롤 방향에 따라 버튼 표시/숨김
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const buttonContent = (
    <>
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-full animate-ping opacity-20" />
      <Plus className="h-6 w-6 text-white relative z-10" />
    </>
  )

  const baseClasses = `
    fixed bottom-20 right-4 md:bottom-8 md:right-8 z-40
    w-14 h-14 rounded-full shadow-lg
    flex items-center justify-center
    transform transition-all duration-300 ease-out
    hover:scale-110 active:scale-95
    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}
    ${className}
  `

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={baseClasses}
        aria-label="새 커피 기록 추가"
      >
        {buttonContent}
      </button>
    )
  }

  return (
    <Link
      href={href}
      className={baseClasses}
      aria-label="새 커피 기록 추가"
    >
      {buttonContent}
    </Link>
  )
}