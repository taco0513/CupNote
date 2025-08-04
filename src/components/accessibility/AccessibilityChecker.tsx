/**
 * Accessibility Checker Component
 * Development tool for checking accessibility issues
 */
'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle, Info, X, Eye, Keyboard, Volume2 } from 'lucide-react'

interface A11yIssue {
  type: 'error' | 'warning' | 'info'
  category: 'structure' | 'color' | 'keyboard' | 'screen-reader' | 'content'
  message: string
  element?: HTMLElement
  suggestion?: string
}

interface AccessibilityCheckerProps {
  isEnabled?: boolean
}

export default function AccessibilityChecker({ isEnabled = process.env.NODE_ENV === 'development' }: AccessibilityCheckerProps) {
  const [issues, setIssues] = useState<A11yIssue[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isScanning, setIsScanning] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!isEnabled) return

    // Run initial scan
    runAccessibilityCheck()

    // Set up periodic scanning
    intervalRef.current = setInterval(runAccessibilityCheck, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isEnabled])

  const runAccessibilityCheck = async () => {
    if (isScanning) return
    
    setIsScanning(true)
    const foundIssues: A11yIssue[] = []

    try {
      // Check for missing alt text
      const images = document.querySelectorAll('img')
      images.forEach((img) => {
        if (!img.alt && !img.getAttribute('aria-label') && !img.getAttribute('aria-labelledby')) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Image missing alt text',
            element: img,
            suggestion: 'Add alt attribute or aria-label to describe the image'
          })
        }
      })

      // Check for missing form labels
      const inputs = document.querySelectorAll('input, select, textarea')
      inputs.forEach((input) => {
        const element = input as HTMLInputElement
        if (element.type === 'hidden') return

        const hasLabel = element.labels && element.labels.length > 0
        const hasAriaLabel = element.getAttribute('aria-label')
        const hasAriaLabelledby = element.getAttribute('aria-labelledby')

        if (!hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Form control missing label',
            element: element,
            suggestion: 'Add a label element or aria-label attribute'
          })
        }
      })

      // Check for missing button text
      const buttons = document.querySelectorAll('button')
      buttons.forEach((button) => {
        const hasText = button.textContent && button.textContent.trim().length > 0
        const hasAriaLabel = button.getAttribute('aria-label')
        const hasAriaLabelledby = button.getAttribute('aria-labelledby')

        if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Button missing accessible name',
            element: button,
            suggestion: 'Add text content or aria-label to describe the button\'s purpose'
          })
        }
      })

      // Check for proper heading structure
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
      let lastLevel = 0
      headings.forEach((heading) => {
        const level = parseInt(heading.tagName.charAt(1))
        if (level > lastLevel + 1 && lastLevel !== 0) {
          foundIssues.push({
            type: 'warning',
            category: 'structure',
            message: `Heading level jumps from h${lastLevel} to h${level}`,
            element: heading as HTMLElement,
            suggestion: 'Use consecutive heading levels for proper document structure'
          })
        }
        lastLevel = level
      })

      // Check for keyboard focus indicators
      const interactiveElements = document.querySelectorAll('a, button, input, select, textarea, [tabindex]')
      interactiveElements.forEach((element) => {
        const styles = window.getComputedStyle(element as HTMLElement)
        const pseudoStyles = window.getComputedStyle(element as HTMLElement, ':focus')
        
        // Simple check for focus styles (in real implementation, this would be more comprehensive)
        if (pseudoStyles.outline === 'none' && pseudoStyles.boxShadow === 'none') {
          foundIssues.push({
            type: 'warning',
            category: 'keyboard',
            message: 'Interactive element may lack focus indicator',
            element: element as HTMLElement,
            suggestion: 'Ensure visible focus indicators for keyboard navigation'
          })
        }
      })

      // Check for color contrast (simplified)
      const textElements = document.querySelectorAll('p, span, div, a, button, h1, h2, h3, h4, h5, h6')
      textElements.forEach((element) => {
        const styles = window.getComputedStyle(element as HTMLElement)
        const color = styles.color
        const backgroundColor = styles.backgroundColor
        
        // This is a simplified check - in production, you'd use a proper contrast calculation
        if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
          foundIssues.push({
            type: 'warning',
            category: 'color',
            message: 'Potential low color contrast',
            element: element as HTMLElement,
            suggestion: 'Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)'
          })
        }
      })

      // Check for ARIA attributes
      const elementsWithAria = document.querySelectorAll('[aria-expanded], [aria-selected], [aria-checked]')
      elementsWithAria.forEach((element) => {
        const expanded = element.getAttribute('aria-expanded')
        const selected = element.getAttribute('aria-selected')
        const checked = element.getAttribute('aria-checked')

        if (expanded && !['true', 'false'].includes(expanded)) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Invalid aria-expanded value',
            element: element as HTMLElement,
            suggestion: 'Use "true" or "false" for aria-expanded'
          })
        }

        if (selected && !['true', 'false'].includes(selected)) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Invalid aria-selected value',
            element: element as HTMLElement,
            suggestion: 'Use "true" or "false" for aria-selected'
          })
        }

        if (checked && !['true', 'false', 'mixed'].includes(checked)) {
          foundIssues.push({
            type: 'error',
            category: 'screen-reader',
            message: 'Invalid aria-checked value',
            element: element as HTMLElement,
            suggestion: 'Use "true", "false", or "mixed" for aria-checked'
          })
        }
      })

      setIssues(foundIssues)
    } catch (error) {
      console.error('Accessibility check failed:', error)
    } finally {
      setIsScanning(false)
    }
  }

  const getIssueIcon = (type: A11yIssue['type']) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getCategoryIcon = (category: A11yIssue['category']) => {
    switch (category) {
      case 'keyboard':
        return <Keyboard className="h-4 w-4" />
      case 'screen-reader':
        return <Volume2 className="h-4 w-4" />
      case 'color':
        return <Eye className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const highlightElement = (element: HTMLElement) => {
    // Remove previous highlights
    document.querySelectorAll('.a11y-highlight').forEach(el => {
      el.classList.remove('a11y-highlight')
    })

    // Add highlight to current element
    element.classList.add('a11y-highlight')
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Remove highlight after 3 seconds
    setTimeout(() => {
      element.classList.remove('a11y-highlight')
    }, 3000)
  }

  const filteredIssues = selectedCategory === 'all' 
    ? issues 
    : issues.filter(issue => issue.category === selectedCategory)

  const issueStats = {
    error: issues.filter(i => i.type === 'error').length,
    warning: issues.filter(i => i.type === 'warning').length,
    info: issues.filter(i => i.type === 'info').length
  }

  if (!isEnabled) return null

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-4 right-4 z-50 p-3 rounded-full shadow-lg transition-all ${
          issues.length === 0 
            ? 'bg-green-500 hover:bg-green-600' 
            : issueStats.error > 0 
              ? 'bg-red-500 hover:bg-red-600' 
              : 'bg-amber-500 hover:bg-amber-600'
        } text-white`}
        title={`접근성 검사 (${issues.length}개 이슈)`}
      >
        <Eye className="h-5 w-5" />
        {issues.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {issues.length > 99 ? '99+' : issues.length}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed right-4 bottom-20 z-40 w-96 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">접근성 검사</h3>
              {isScanning && (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>오류: {issueStats.error}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <span>경고: {issueStats.warning}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>정보: {issueStats.info}</span>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-sm"
            >
              <option value="all">모든 카테고리</option>
              <option value="structure">구조</option>
              <option value="color">색상</option>
              <option value="keyboard">키보드</option>
              <option value="screen-reader">스크린 리더</option>
              <option value="content">콘텐츠</option>
            </select>
          </div>

          {/* Issues List */}
          <div className="max-h-64 overflow-y-auto">
            {filteredIssues.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p>접근성 이슈가 발견되지 않았습니다!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredIssues.map((issue, index) => (
                  <div
                    key={index}
                    className="p-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => issue.element && highlightElement(issue.element)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIssueIcon(issue.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {getCategoryIcon(issue.category)}
                          <span className="text-xs text-gray-500 uppercase tracking-wide">
                            {issue.category}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-800 mb-1">
                          {issue.message}
                        </p>
                        {issue.suggestion && (
                          <p className="text-xs text-gray-600">
                            💡 {issue.suggestion}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={runAccessibilityCheck}
              disabled={isScanning}
              className="w-full px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
            >
              {isScanning ? '검사 중...' : '다시 검사'}
            </button>
          </div>
        </div>
      )}

      {/* CSS for highlighting */}
      <style jsx global>{`
        .a11y-highlight {
          outline: 3px solid #f59e0b !important;
          outline-offset: 2px !important;
          background-color: rgba(245, 158, 11, 0.1) !important;
        }
      `}</style>
    </>
  )
}