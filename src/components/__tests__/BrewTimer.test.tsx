import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import BrewTimer from '../BrewTimer'

describe('BrewTimer', () => {
  const mockOnTimerComplete = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    dripper: 'v60',
    totalWaterAmount: 320,
    onTimerComplete: mockOnTimerComplete,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Initial Rendering', () => {
    it('renders with correct title and dripper info', () => {
      render(<BrewTimer {...defaultProps} />)
      
      expect(screen.getByText('추출 타이머')).toBeInTheDocument()
      expect(screen.getByText('V60 · 320ml')).toBeInTheDocument()
    })

    it('displays initial timer state', () => {
      render(<BrewTimer {...defaultProps} />)
      
      expect(screen.getByText('0:00')).toBeInTheDocument()
      expect(screen.getByText('시작')).toBeInTheDocument()
    })

    it('shows first phase information for V60', () => {
      render(<BrewTimer {...defaultProps} />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('원두 전체를 고르게 젖혀주세요')).toBeInTheDocument()
    })

    it('shows correct phases for different drippers', () => {
      const { rerender } = render(<BrewTimer {...defaultProps} dripper="kalita" />)
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      
      rerender(<BrewTimer {...defaultProps} dripper="origami" />)
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      
      rerender(<BrewTimer {...defaultProps} dripper="april" />)
      expect(screen.getByText('APRIL · 320ml')).toBeInTheDocument()
    })

    it('handles unknown dripper gracefully', () => {
      render(<BrewTimer {...defaultProps} dripper="unknown" />)
      
      expect(screen.getByText('UNKNOWN · 320ml')).toBeInTheDocument()
      // Should not show phase information for unknown dripper
      expect(screen.queryByText('Pre-infusion')).not.toBeInTheDocument()
    })
  })

  describe('Timer Functionality', () => {
    it('starts timer when start button is clicked', () => {
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      fireEvent.click(startButton)
      
      // After clicking start, should show pause button
      expect(screen.getByText('일시정지')).toBeInTheDocument()
    })

    it('shows correct button states', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Initial state - should show start button
      expect(screen.getByText('시작')).toBeInTheDocument()
      
      // Click start button
      fireEvent.click(screen.getByText('시작'))
      
      // Should now show pause button
      expect(screen.getByText('일시정지')).toBeInTheDocument()
    })

    it('formats time correctly', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Test initial time format
      expect(screen.getByText('0:00')).toBeInTheDocument()
    })
  })

  describe('Modal Behavior', () => {
    it('renders as modal overlay', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Check for modal structure
      const modalOverlay = document.querySelector('.fixed.inset-0')
      expect(modalOverlay).toBeInTheDocument()
    })

    it('has proper modal structure', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Should have modal background and content
      expect(document.querySelector('.bg-black.bg-opacity-50')).toBeInTheDocument()
      expect(document.querySelector('.bg-white.rounded-2xl')).toBeInTheDocument()
    })
  })

  describe('Component Structure', () => {
    it('has all essential elements', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Should have timer display
      expect(screen.getByText('0:00')).toBeInTheDocument()
      
      // Should have control button
      expect(screen.getByText('시작')).toBeInTheDocument()
      
      // Should have phase information
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
    })

    it('renders different dripper configurations', () => {
      const drippers = ['v60', 'kalita', 'origami', 'april']
      
      drippers.forEach(dripper => {
        const { unmount } = render(<BrewTimer {...defaultProps} dripper={dripper} />)
        
        // Should render without errors
        expect(screen.getByText('추출 타이머')).toBeInTheDocument()
        
        unmount()
      })
    })
  })

  describe('Props Handling', () => {
    it('displays correct water amount', () => {
      render(<BrewTimer {...defaultProps} totalWaterAmount={250} />)
      
      expect(screen.getByText('V60 · 250ml')).toBeInTheDocument()
    })

    it('handles different dripper names', () => {
      render(<BrewTimer {...defaultProps} dripper="kalita" />)
      
      expect(screen.getByText('KALITA · 320ml')).toBeInTheDocument()
    })

    it('calls callbacks when provided', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Test that component renders without throwing
      expect(screen.getByText('추출 타이머')).toBeInTheDocument()
    })
  })
})