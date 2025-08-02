'use client'

import { ReactNode } from 'react'

interface ScreenReaderOnlyProps {
  children: ReactNode
  as?: keyof JSX.IntrinsicElements
  className?: string
}

export function ScreenReaderOnly({ 
  children, 
  as: Component = 'span', 
  className = '' 
}: ScreenReaderOnlyProps) {
  return (
    <Component 
      className={`sr-only ${className}`}
      aria-hidden="false"
    >
      {children}
    </Component>
  )
}

// 상태 알림을 위한 컴포넌트
interface LiveRegionProps {
  children: ReactNode
  politeness?: 'polite' | 'assertive' | 'off'
  atomic?: boolean
  relevant?: 'additions' | 'removals' | 'text' | 'all'
  className?: string
}

export function LiveRegion({ 
  children, 
  politeness = 'polite',
  atomic = false,
  relevant = 'all',
  className = ''
}: LiveRegionProps) {
  return (
    <div
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  )
}

// 페이지 제목 관리
interface PageTitleProps {
  title: string
  announcement?: string
}

export function PageTitle({ title, announcement }: PageTitleProps) {
  return (
    <>
      <h1 className="sr-only">{title}</h1>
      {announcement && (
        <LiveRegion politeness="assertive">
          {announcement}
        </LiveRegion>
      )}
    </>
  )
}