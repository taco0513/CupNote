'use client'

import { useEffect, useState } from 'react'

interface SkipLinkProps {
  targetId: string
  children: string
  className?: string
}

export function SkipLink({ targetId, children, className = '' }: SkipLinkProps) {
  const [isVisible, setIsVisible] = useState(false)

  const handleFocus = () => setIsVisible(true)
  const handleBlur = () => setIsVisible(false)

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const target = document.getElementById(targetId)
    if (target) {
      target.focus()
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <a
      href={`#${targetId}`}
      className={`
        fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-lg
        font-medium shadow-lg transition-all duration-200
        transform ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        focus:translate-y-0 focus:opacity-100
        ${className}
      `}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

// 여러 스킵 링크를 관리하는 컴포넌트
export function SkipLinks() {
  return (
    <>
      <SkipLink targetId="main-content">메인 콘텐츠로 건너뛰기</SkipLink>
      <SkipLink targetId="navigation">네비게이션으로 건너뛰기</SkipLink>
      <SkipLink targetId="footer">푸터로 건너뛰기</SkipLink>
    </>
  )
}