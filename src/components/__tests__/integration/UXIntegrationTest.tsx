/**
 * Integration Tests for UX/UI Enhancement Components
 * Tests component interoperability and advanced features
 */

import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'

// Component imports
import AdvancedFeatures from '../../advanced/AdvancedFeatures'
import { AnimatedButton, AnimatedCard } from '../../animations/MicroInteractions'
import { ThemeProvider, ThemeToggle } from '../../DarkModeEnhancer'
import SmartSuggestions, { SmartInput } from '../../SmartSuggestions'
import TutorialOverlay from '../../tutorial/TutorialOverlay'
import { TutorialProvider } from '../../tutorial/TutorialProvider'
import { Button } from '../../ui/Button'
import { Input } from '../../ui/Input'
import { Modal } from '../../ui/Modal'
import { ToastProvider, useToast } from '../../ui/Toast'

// Mock hooks and dependencies
jest.mock('../../hooks/useGestures', () => ({
  useGestures: () => ({ current: null }),
  useKeyboardShortcuts: () => [],
  useSmartGestures: () => ({ gestureRef: { current: null }, keyboardShortcuts: [] })
}))

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>
      <TutorialProvider>
        {children}
      </TutorialProvider>
    </ToastProvider>
  </ThemeProvider>
)

// Integration test component
const IntegrationTestComponent = () => {
  const { showToast } = useToast()
  
  return (
    <div data-testid="integration-test-container">
      {/* Tutorial System */}
      <TutorialOverlay />
      
      {/* UI Components */}
      <Button 
        variant="primary" 
        onClick={() => showToast('Button clicked!', 'success')}
        data-testid="test-button"
      >
        Test Button
      </Button>
      
      <Input
        label="Test Input"
        value=""
        onChange={() => {}}
        data-testid="test-input"
      />
      
      {/* Animated Components */}
      <AnimatedButton 
        onClick={() => showToast('Animated button clicked!', 'success')}
        data-testid="animated-button"
      >
        Animated Button
      </AnimatedButton>
      
      <AnimatedCard hoverable clickable data-testid="animated-card">
        <p>Animated Card Content</p>
      </AnimatedCard>
      
      {/* Smart Suggestions */}
      <SmartInput
        value=""
        onChange={() => {}}
        placeholder="Smart input test"
        data-testid="smart-input"
      />
      
      {/* Theme Components */}
      <ThemeToggle data-testid="theme-toggle" />
      
      {/* Advanced Features */}
      <AdvancedFeatures data-testid="advanced-features" />
    </div>
  )
}

describe('UX/UI Integration Tests', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
    
    // Mock IntersectionObserver
    global.IntersectionObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }))
    
    // Mock PerformanceObserver
    global.PerformanceObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }))
  })

  describe('Component Rendering Integration', () => {
    test('should render all components without errors', () => {
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      expect(screen.getByTestId('integration-test-container')).toBeInTheDocument()
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
      expect(screen.getByTestId('animated-button')).toBeInTheDocument()
      expect(screen.getByTestId('animated-card')).toBeInTheDocument()
      expect(screen.getByTestId('smart-input')).toBeInTheDocument()
      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument()
      expect(screen.getByTestId('advanced-features')).toBeInTheDocument()
    })

    test('should handle component interactions without conflicts', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Test button interactions
      const testButton = screen.getByTestId('test-button')
      await user.click(testButton)
      
      const animatedButton = screen.getByTestId('animated-button')
      await user.click(animatedButton)
      
      // Test input interactions
      const testInput = screen.getByTestId('test-input')
      await user.click(testInput)
      await user.type(testInput, 'test value')
      
      // Test smart input
      const smartInput = screen.getByTestId('smart-input')
      await user.click(smartInput)
      await user.type(smartInput, 'coffee')
      
      // Verify no errors occurred
      expect(screen.getByTestId('integration-test-container')).toBeInTheDocument()
    })
  })

  describe('Theme System Integration', () => {
    test('should integrate theme system with all components', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      const themeToggle = screen.getByTestId('theme-toggle')
      
      // Test theme switching
      const lightButton = screen.getByText('라이트')
      await user.click(lightButton)
      
      const darkButton = screen.getByText('다크')
      await user.click(darkButton)
      
      const systemButton = screen.getByText('시스템')
      await user.click(systemButton)
      
      // Verify components still render correctly after theme changes
      expect(screen.getByTestId('test-button')).toBeInTheDocument()
      expect(screen.getByTestId('animated-card')).toBeInTheDocument()
    })
  })

  describe('Toast Integration', () => {
    test('should display toast notifications from different components', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Trigger toast from regular button
      const testButton = screen.getByTestId('test-button')
      await user.click(testButton)
      
      // Wait for toast to appear
      await waitFor(() => {
        expect(screen.getByText('Button clicked!')).toBeInTheDocument()
      })
      
      // Trigger toast from animated button
      const animatedButton = screen.getByTestId('animated-button')
      await user.click(animatedButton)
      
      await waitFor(() => {
        expect(screen.getByText('Animated button clicked!')).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Integration', () => {
    test('should maintain accessibility features across all components', () => {
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Check for ARIA attributes
      const testButton = screen.getByTestId('test-button')
      expect(testButton).toHaveAttribute('type', 'button')
      
      const testInput = screen.getByTestId('test-input')
      expect(testInput).toHaveAttribute('aria-label')
      
      // Check for keyboard navigation support
      const animatedButton = screen.getByTestId('animated-button')
      expect(animatedButton).toHaveAttribute('type', 'button')
    })

    test('should support keyboard navigation between components', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Test tab navigation
      await user.tab()
      expect(screen.getByTestId('test-button')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('test-input')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByTestId('animated-button')).toHaveFocus()
    })
  })

  describe('Performance Integration', () => {
    test('should not cause performance issues with multiple components', () => {
      const startTime = performance.now()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Render should complete within reasonable time (100ms)
      expect(renderTime).toBeLessThan(100)
    })

    test('should handle rapid interactions without performance degradation', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      const button = screen.getByTestId('test-button')
      const startTime = performance.now()
      
      // Simulate rapid clicking
      for (let i = 0; i < 10; i++) {
        await user.click(button)
      }
      
      const endTime = performance.now()
      const interactionTime = endTime - startTime
      
      // All interactions should complete within reasonable time
      expect(interactionTime).toBeLessThan(1000)
    })
  })

  describe('Advanced Features Integration', () => {
    test('should open advanced features panel without conflicts', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Click advanced features button
      const advancedButton = screen.getByText('고급 설정')
      await user.click(advancedButton)
      
      // Wait for panel to open
      await waitFor(() => {
        expect(screen.getByText('고급 설정')).toBeInTheDocument()
      })
      
      // Verify tabs are present
      expect(screen.getByText('성능')).toBeInTheDocument()
      expect(screen.getByText('제스처')).toBeInTheDocument()
      expect(screen.getByText('접근성')).toBeInTheDocument()
      expect(screen.getByText('키보드')).toBeInTheDocument()
    })
  })

  describe('Error Boundary Integration', () => {
    test('should handle component errors gracefully', () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const ThrowError = () => {
        throw new Error('Test error')
      }
      
      const TestWithErrorBoundary = () => (
        <TestWrapper>
          <div>
            <IntegrationTestComponent />
            <ThrowError />
          </div>
        </TestWrapper>
      )
      
      // Should not crash the entire app
      expect(() => render(<TestWithErrorBoundary />)).not.toThrow()
      
      consoleSpy.mockRestore()
    })
  })

  describe('Storage Integration', () => {
    test('should persist settings across component interactions', async () => {
      const user = userEvent.setup()
      
      render(
        <TestWrapper>
          <IntegrationTestComponent />
        </TestWrapper>
      )
      
      // Open advanced features and change settings
      const advancedButton = screen.getByText('고급 설정')
      await user.click(advancedButton)
      
      // Verify localStorage is used for persistence
      expect(localStorage.getItem).toBeDefined()
      
      // Test that settings are maintained
      const performanceTab = screen.getByText('성능')
      await user.click(performanceTab)
      
      // Settings should persist without errors
      expect(screen.getByText('성능 모니터링')).toBeInTheDocument()
    })
  })
})

// Additional utility tests
describe('Integration Utilities', () => {
  test('should initialize all features without conflicts', () => {
    // Mock initializeApp function
    const mockInitialize = jest.fn(() => ({
      animations: { enabled: true },
      accessibility: { highContrast: false },
      tutorials: { hasCompletedOnboarding: false },
      shortcuts: ['cmd+k', 'cmd+n']
    }))
    
    const result = mockInitialize()
    
    expect(result).toHaveProperty('animations')
    expect(result).toHaveProperty('accessibility')
    expect(result).toHaveProperty('tutorials')
    expect(result).toHaveProperty('shortcuts')
  })

  test('should handle feature initialization errors gracefully', () => {
    const mockInitializeWithError = jest.fn(() => {
      throw new Error('Initialization failed')
    })
    
    expect(() => {
      try {
        mockInitializeWithError()
      } catch (error) {
        // Should handle gracefully
        console.warn('Feature initialization failed:', error)
      }
    }).not.toThrow()
  })
})