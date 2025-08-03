import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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
      expect(screen.getByText('취소')).toBeInTheDocument()
      expect(screen.getByText('완료')).toBeInTheDocument()
    })

    it('shows first phase information for V60', () => {
      render(<BrewTimer {...defaultProps} />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:45')).toBeInTheDocument()
      expect(screen.getByText('원두 전체를 고르게 젖혀주세요')).toBeInTheDocument()
    })

    it('shows correct phases for different drippers', () => {
      render(<BrewTimer {...defaultProps} dripper="kalita" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:30')).toBeInTheDocument()
      expect(screen.getByText('중앙에 집중해서 젖혀주세요')).toBeInTheDocument()
    })

    it('handles unknown dripper gracefully', () => {
      render(<BrewTimer {...defaultProps} dripper="unknown" />)
      
      expect(screen.getByText('추출 타이머')).toBeInTheDocument()
      expect(screen.getByText('UNKNOWN · 320ml')).toBeInTheDocument()
      // Should not show phase information for unknown dripper
      expect(screen.queryByText('Pre-infusion')).not.toBeInTheDocument()
    })
  })

  describe('Timer Functionality', () => {
    it('starts timer when start button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      expect(screen.getByText('일시정지')).toBeInTheDocument()
      
      // Advance time by 5 seconds
      vi.advanceTimersByTime(5000)
      await waitFor(() => {
        expect(screen.getByText('0:05')).toBeInTheDocument()
      })
    })

    it('pauses and resumes timer correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      // Start timer
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Advance time
      vi.advanceTimersByTime(3000)
      await waitFor(() => {
        expect(screen.getByText('0:03')).toBeInTheDocument()
      })
      
      // Pause timer
      const pauseButton = screen.getByText('일시정지')
      await user.click(pauseButton)
      expect(screen.getByText('재개')).toBeInTheDocument()
      
      // Time should not advance when paused
      vi.advanceTimersByTime(2000)
      await waitFor(() => {
        expect(screen.getByText('0:03')).toBeInTheDocument()
      })
      
      // Resume timer
      const resumeButton = screen.getByText('재개')
      await user.click(resumeButton)
      expect(screen.getByText('일시정지')).toBeInTheDocument()
      
      // Time should advance again
      vi.advanceTimersByTime(2000)
      await waitFor(() => {
        expect(screen.getByText('0:05')).toBeInTheDocument()
      })
    })

    it('resets timer to initial state', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      // Start timer and advance time
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      vi.advanceTimersByTime(10000)
      await waitFor(() => {
        expect(screen.getByText('0:10')).toBeInTheDocument()
      })
      
      // Reset timer
      const resetButton = screen.getByLabelText(/reset/i) || screen.getByRole('button', { name: '' })
      const resetButtons = screen.getAllByRole('button').filter(btn => 
        btn.querySelector('svg') && !btn.textContent?.trim()
      )
      if (resetButtons.length > 0) {
        await user.click(resetButtons[0])
      }
      
      expect(screen.getByText('0:00')).toBeInTheDocument()
      expect(screen.getByText('시작')).toBeInTheDocument()
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument() // Back to first phase
    })

    it('formats time correctly for different durations', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Test seconds formatting
      vi.advanceTimersByTime(5000)
      await waitFor(() => {
        expect(screen.getByText('0:05')).toBeInTheDocument()
      })
      
      // Test minutes formatting
      vi.advanceTimersByTime(55000)
      await waitFor(() => {
        expect(screen.getByText('1:00')).toBeInTheDocument()
      })
      
      // Test minutes and seconds
      vi.advanceTimersByTime(125000)
      await waitFor(() => {
        expect(screen.getByText('3:05')).toBeInTheDocument()
      })
    })
  })

  describe('Phase Management', () => {
    it('shows phase status based on timing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Pre-infusion target is 45 seconds for V60
      // Test on-time (around 45 seconds)
      vi.advanceTimersByTime(45000)
      await waitFor(() => {
        const phaseContainer = screen.getByText('Pre-infusion').parentElement
        expect(phaseContainer).toHaveClass('bg-green-50')
      })
      
      // Test over-time (more than 50 seconds)
      vi.advanceTimersByTime(10000) // 55 seconds total
      await waitFor(() => {
        const phaseContainer = screen.getByText('Pre-infusion').parentElement
        expect(phaseContainer).toHaveClass('bg-red-50')
      })
    })

    it('advances to next phase when lap time is added', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Should show "단계" button when timer is running
      expect(screen.getByText('단계')).toBeInTheDocument()
      
      // Advance time and add lap
      vi.advanceTimersByTime(45000)
      const lapButton = screen.getByText('단계')
      await user.click(lapButton)
      
      // Should advance to next phase
      expect(screen.getByText('1차 푸어링')).toBeInTheDocument()
      expect(screen.getByText('목표: 1:30 · 100ml')).toBeInTheDocument()
    })

    it('records lap times correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Add first lap
      vi.advanceTimersByTime(45000)
      const lapButton = screen.getByText('단계')
      await user.click(lapButton)
      
      // Should show lap time record
      expect(screen.getByText('단계별 기록')).toBeInTheDocument()
      expect(screen.getByText('Pre-infusion 완료')).toBeInTheDocument()
      expect(screen.getByText('0:45')).toBeInTheDocument()
      
      // Add second lap
      vi.advanceTimersByTime(45000) // 1:30 total
      await user.click(lapButton)
      
      expect(screen.getByText('1차 푸어링 완료')).toBeInTheDocument()
      expect(screen.getByText('1:30')).toBeInTheDocument()
    })
  })

  describe('Timer Completion', () => {
    it('calls onTimerComplete when stop button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Advance time and add some laps
      vi.advanceTimersByTime(45000)
      const lapButton = screen.getByText('단계')
      await user.click(lapButton)
      
      vi.advanceTimersByTime(45000)
      await user.click(lapButton)
      
      // Stop timer
      const stopButton = screen.getByText('완료')
      await user.click(stopButton)
      
      expect(mockOnTimerComplete).toHaveBeenCalledWith({
        totalTime: 90,
        lapTimes: expect.arrayContaining([
          expect.objectContaining({
            time: 45,
            note: 'Pre-infusion 완료',
            timestamp: expect.any(Date)
          }),
          expect.objectContaining({
            time: 90,
            note: '1차 푸어링 완료',
            timestamp: expect.any(Date)
          })
        ]),
        completed: true
      })
    })

    it('disables complete button when timer not started', () => {
      render(<BrewTimer {...defaultProps} />)
      
      const completeButton = screen.getByText('완료')
      expect(completeButton).toBeDisabled()
    })

    it('enables complete button when timer is running', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      const completeButton = screen.getByText('완료')
      expect(completeButton).not.toBeDisabled()
    })
  })

  describe('Modal Behavior', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<BrewTimer {...defaultProps} />)
      
      const cancelButton = screen.getByText('취소')
      await user.click(cancelButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('renders as modal overlay', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Should render with modal styling classes
      const modalOverlay = screen.getByText('추출 타이머').closest('div')?.parentElement?.parentElement
      expect(modalOverlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50')
    })
  })

  describe('Different Dripper Configurations', () => {
    it('shows correct phases for Kalita', () => {
      render(<BrewTimer {...defaultProps} dripper="kalita" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:30')).toBeInTheDocument()
      expect(screen.getByText('중앙에 집중해서 젖혀주세요')).toBeInTheDocument()
    })

    it('shows correct phases for Origami', () => {
      render(<BrewTimer {...defaultProps} dripper="origami" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:45')).toBeInTheDocument()
      expect(screen.getByText('원두 전체를 부드럽게 젖혀주세요')).toBeInTheDocument()
    })

    it('shows correct phases for April', () => {
      render(<BrewTimer {...defaultProps} dripper="april" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:30')).toBeInTheDocument()
      expect(screen.getByText('중앙에 집중해서 고르게 젖혀주세요')).toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid button clicks gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      
      // Rapid clicks
      await user.click(startButton)
      await user.click(startButton)
      await user.click(startButton)
      
      // Should still work correctly
      expect(screen.getByText('일시정지')).toBeInTheDocument()
      
      vi.advanceTimersByTime(5000)
      await waitFor(() => {
        expect(screen.getByText('0:05')).toBeInTheDocument()
      })
    })

    it('maintains correct state after multiple resets', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      // Start, advance, reset multiple times
      for (let i = 0; i < 3; i++) {
        const startButton = screen.getByText('시작')
        await user.click(startButton)
        
        vi.advanceTimersByTime(10000)
        
        const resetButtons = screen.getAllByRole('button').filter(btn => 
          btn.querySelector('svg') && !btn.textContent?.trim()
        )
        if (resetButtons.length > 0) {
          await user.click(resetButtons[0])
        }
        
        expect(screen.getByText('0:00')).toBeInTheDocument()
        expect(screen.getByText('시작')).toBeInTheDocument()
      }
    })

    it('handles component unmounting during timer', () => {
      const { unmount } = render(<BrewTimer {...defaultProps} />)
      
      // Start timer
      const startButton = screen.getByText('시작')
      fireEvent.click(startButton)
      
      // Should not throw error when unmounting with active timer
      expect(() => unmount()).not.toThrow()
    })

    it('scrolls lap times when there are many records', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      await user.click(startButton)
      
      // Add multiple laps
      for (let i = 0; i < 5; i++) {
        vi.advanceTimersByTime(30000)
        const lapButton = screen.getByText('단계')
        await user.click(lapButton)
      }
      
      // Lap times container should have overflow styling
      const lapContainer = screen.getByText('단계별 기록').nextElementSibling
      expect(lapContainer).toHaveClass('max-h-32', 'overflow-y-auto')
    })
  })
})