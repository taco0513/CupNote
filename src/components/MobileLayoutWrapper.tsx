'use client'

import { ReactNode } from 'react'

interface MobileLayoutWrapperProps {
  children: ReactNode
  className?: string
}

export default function MobileLayoutWrapper({ 
  children, 
  className = '' 
}: MobileLayoutWrapperProps) {
  return (
    <div className={`${className} md:pb-0 pb-20`}>
      {children}
    </div>
  )
}