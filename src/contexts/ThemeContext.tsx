'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'light'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  effectiveTheme: 'light' // 항상 라이트 모드
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme] = useState<Theme>('light')
  const [effectiveTheme] = useState<'light'>('light')

  // DOM에 라이트 테마 클래스 적용
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add('light')
    
    // 메타 테마 컬러 업데이트 (라이트 모드 고정)
    const metaTheme = document.querySelector('meta[name="theme-color"]')
    if (metaTheme) {
      metaTheme.setAttribute('content', '#6F4E37')
    }
  }, [])

  const handleSetTheme = (newTheme: Theme) => {
    // 라이트 모드 고정이므로 실제로는 아무것도 하지 않음
  }

  const toggleTheme = () => {
    // 라이트 모드 고정이므로 토글 불가
  }

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme: handleSetTheme,
        effectiveTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}