'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Moon, Sun, Monitor, Palette, Eye } from 'lucide-react'

type ThemeMode = 'light' | 'dark' | 'system'
type ColorScheme = 'default' | 'high-contrast' | 'warm' | 'cool'

interface ThemeContextType {
  mode: ThemeMode
  colorScheme: ColorScheme
  setMode: (mode: ThemeMode) => void
  setColorScheme: (scheme: ColorScheme) => void
  isDark: boolean
  isSystemDark: boolean
  contrast: number
  setContrast: (contrast: number) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultMode?: ThemeMode
  defaultColorScheme?: ColorScheme
}

export function ThemeProvider({ 
  children, 
  defaultMode = 'light',
  defaultColorScheme = 'default'
}: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(defaultMode)
  const [colorScheme, setColorScheme] = useState<ColorScheme>(defaultColorScheme)
  const [contrast, setContrast] = useState<number>(100)
  const [isSystemDark, setIsSystemDark] = useState(false)

  // 시스템 다크 모드 감지
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsSystemDark(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  // 저장된 설정 불러오기
  useEffect(() => {
    const savedMode = localStorage.getItem('cupnote-theme-mode') as ThemeMode
    const savedScheme = localStorage.getItem('cupnote-color-scheme') as ColorScheme
    const savedContrast = localStorage.getItem('cupnote-contrast')

    if (savedMode) setMode(savedMode)
    if (savedScheme) setColorScheme(savedScheme)
    if (savedContrast) setContrast(parseInt(savedContrast))
  }, [])

  // 실제 다크 모드 상태 계산
  const isDark = mode === 'dark' || (mode === 'system' && isSystemDark)

  // 테마 적용
  useEffect(() => {
    const root = document.documentElement
    
    // 다크 모드 클래스 적용
    if (isDark) {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }

    // 컬러 스킴 적용
    root.setAttribute('data-color-scheme', colorScheme)
    
    // 대비 설정 적용
    root.style.setProperty('--theme-contrast', `${contrast}%`)
    
    // 고대비 모드 적용
    if (colorScheme === 'high-contrast') {
      root.style.setProperty('--color-background', isDark ? '0 0 0' : '255 255 255')
      root.style.setProperty('--color-foreground', isDark ? '255 255 255' : '0 0 0')
      root.style.setProperty('--color-border', isDark ? '255 255 255' : '0 0 0')
    }

    // 설정 저장
    localStorage.setItem('cupnote-theme-mode', mode)
    localStorage.setItem('cupnote-color-scheme', colorScheme)
    localStorage.setItem('cupnote-contrast', contrast.toString())
  }, [mode, colorScheme, contrast, isDark])

  const contextValue: ThemeContextType = {
    mode,
    colorScheme,
    setMode,
    setColorScheme,
    isDark,
    isSystemDark,
    contrast,
    setContrast
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// 테마 전환 버튼 컴포넌트
interface ThemeToggleProps {
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ className = '', showLabel = true }: ThemeToggleProps) {
  const { mode, setMode, isDark } = useTheme()

  const modes: { key: ThemeMode; label: string; icon: ReactNode }[] = [
    { key: 'light', label: '라이트', icon: <Sun className="w-4 h-4" /> },
    { key: 'dark', label: '다크', icon: <Moon className="w-4 h-4" /> },
    { key: 'system', label: '시스템', icon: <Monitor className="w-4 h-4" /> }
  ]

  return (
    <div className={`inline-flex rounded-lg border border-border bg-background ${className}`}>
      {modes.map(({ key, label, icon }) => (
        <button
          key={key}
          onClick={() => setMode(key)}
          className={`
            flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all
            ${mode === key 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }
          `}
        >
          {icon}
          {showLabel && <span>{label}</span>}
        </button>
      ))}
    </div>
  )
}

// 컬러 스킴 선택기
interface ColorSchemePickerProps {
  className?: string
}

export function ColorSchemePicker({ className = '' }: ColorSchemePickerProps) {
  const { colorScheme, setColorScheme } = useTheme()

  const schemes: { key: ColorScheme; label: string; icon: ReactNode; colors: string[] }[] = [
    { 
      key: 'default', 
      label: '기본', 
      icon: <Palette className="w-4 h-4" />,
      colors: ['#6F4E37', '#9B5F35', '#C7965D']
    },
    { 
      key: 'high-contrast', 
      label: '고대비', 
      icon: <Eye className="w-4 h-4" />,
      colors: ['#000000', '#FFFFFF', '#808080']
    },
    { 
      key: 'warm', 
      label: '따뜻한', 
      icon: <Sun className="w-4 h-4" />,
      colors: ['#D4742A', '#E6952C', '#F4B942']
    },
    { 
      key: 'cool', 
      label: '차가운', 
      icon: <Moon className="w-4 h-4" />,
      colors: ['#2563EB', '#3B82F6', '#60A5FA']
    }
  ]

  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-sm font-medium text-foreground">컬러 스킴</h3>
      <div className="grid grid-cols-2 gap-2">
        {schemes.map(({ key, label, icon, colors }) => (
          <button
            key={key}
            onClick={() => setColorScheme(key)}
            className={`
              flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left
              ${colorScheme === key 
                ? 'border-primary bg-primary/5' 
                : 'border-border hover:border-border-secondary hover:bg-background-secondary'
              }
            `}
          >
            <div className="flex items-center gap-2">
              {icon}
              <span className="text-sm font-medium">{label}</span>
            </div>
            <div className="flex gap-1 ml-auto">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// 대비 조절기
interface ContrastSliderProps {
  className?: string
}

export function ContrastSlider({ className = '' }: ContrastSliderProps) {
  const { contrast, setContrast } = useTheme()

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">대비</h3>
        <span className="text-sm text-foreground-muted">{contrast}%</span>
      </div>
      
      <div className="space-y-2">
        <input
          type="range"
          min="50"
          max="150"
          value={contrast}
          onChange={(e) => setContrast(parseInt(e.target.value))}
          className="w-full h-2 bg-background-secondary rounded-lg appearance-none cursor-pointer slider"
        />
        
        <div className="flex justify-between text-xs text-foreground-muted">
          <span>낮음</span>
          <span>보통</span>
          <span>높음</span>
        </div>
      </div>
    </div>
  )
}

// 테마 설정 패널
interface ThemeSettingsProps {
  className?: string
}

export function ThemeSettings({ className = '' }: ThemeSettingsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border hover:bg-background-secondary transition-all"
      >
        <Palette className="w-4 h-4" />
        <span className="text-sm">테마 설정</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 p-4 bg-background border border-border rounded-lg shadow-lg z-50 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-foreground">테마 설정</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-foreground-muted hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-2">테마 모드</h3>
                <ThemeToggle showLabel />
              </div>

              <ColorSchemePicker />
              <ContrastSlider />
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-foreground-muted">
                설정은 자동으로 저장되며 다음 방문 시에도 적용됩니다.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// CSS 변수 스타일
export const themeStyles = `
  /* 대비 조절 슬라이더 스타일 */
  .slider::-webkit-slider-thumb {
    appearance: none;
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: rgb(var(--color-primary));
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .slider::-moz-range-thumb {
    height: 20px;
    width: 20px;
    border-radius: 50%;
    background: rgb(var(--color-primary));
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  /* 컬러 스킴별 CSS 변수 오버라이드 */
  [data-color-scheme="warm"] {
    --color-primary: 212 116 42;
    --color-primary-hover: 230 149 44;
    --color-accent: 244 185 66;
  }

  [data-color-scheme="cool"] {
    --color-primary: 37 99 235;
    --color-primary-hover: 59 130 246;
    --color-accent: 96 165 250;
  }

  [data-color-scheme="high-contrast"] {
    --color-border: 128 128 128;
  }

  /* 대비 조절 */
  :root {
    filter: contrast(var(--theme-contrast, 100%));
  }
`