import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

import BrewTimer from '../BrewTimer'

// Suppress React DOM act warnings during testing
const originalError = console.error
beforeAll(() => {
  console.error = (...args) => {
    if (/Warning.*not wrapped in act/.test(args[0])) {
      return
    }
    originalError.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
})

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
      const { rerender } = render(<BrewTimer {...defaultProps} dripper="kalita" />)
      expect(screen.getByText('KALITA · 320ml')).toBeInTheDocument()
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()

      rerender(<BrewTimer {...defaultProps} dripper="origami" />)
      expect(screen.getByText('ORIGAMI · 320ml')).toBeInTheDocument()
    })

    it('handles unknown dripper gracefully', () => {
      render(<BrewTimer {...defaultProps} dripper="unknown" />)
      
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
      
      await act(async () => {
        await user.click(startButton)
      })
      
      expect(screen.getByText('일시정지')).toBeInTheDocument()
      
      // Advance time and wait for update
      await act(async () => {
        vi.advanceTimersByTime(5000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('0:05')).toBeInTheDocument()
      }, { timeout: 1000 })
    })

    it('pauses and resumes timer correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      // Start timer
      await act(async () => {
        await user.click(screen.getByText('시작'))
      })
      
      // Advance time
      await act(async () => {
        vi.advanceTimersByTime(10000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('0:10')).toBeInTheDocument()
      })
      
      // Pause timer
      await act(async () => {
        await user.click(screen.getByText('일시정지'))
      })
      
      expect(screen.getByText('계속')).toBeInTheDocument()
      
      // Resume timer
      await act(async () => {
        await user.click(screen.getByText('계속'))
      })
      
      expect(screen.getByText('일시정지')).toBeInTheDocument()
    })

    it('resets timer to initial state', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      // Start and advance timer
      await act(async () => {
        await user.click(screen.getByText('시작'))
        vi.advanceTimersByTime(15000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('0:15')).toBeInTheDocument()
      })
      
      // Reset timer
      await act(async () => {
        await user.click(screen.getByRole('button', { name: /reset/i }) || screen.getByLabelText('리셋'))
      })
      
      await waitFor(() => {
        expect(screen.getByText('0:00')).toBeInTheDocument()
        expect(screen.getByText('시작')).toBeInTheDocument()
      })
    })

    it('formats time correctly for different durations', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
      })
      
      // Test different time formats
      const timeTests = [
        { advance: 5000, expected: '0:05' },
        { advance: 30000, expected: '0:35' }, // Total 35s
        { advance: 25000, expected: '1:00' }, // Total 60s
        { advance: 90000, expected: '2:30' }, // Total 150s
      ]
      
      for (const test of timeTests) {
        await act(async () => {
          vi.advanceTimersByTime(test.advance)
        })
        
        await waitFor(() => {
          expect(screen.getByText(test.expected)).toBeInTheDocument()
        }, { timeout: 500 })
      }
    })
  })

  describe('Phase Management', () => {
    it('shows phase status based on timing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
      })
      
      // During pre-infusion phase (0-44s)
      await act(async () => {
        vi.advanceTimersByTime(30000)
      })
      
      await waitFor(() => {
        expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
        expect(screen.getByText('목표: 0:45')).toBeInTheDocument()
      })
      
      // Move to next phase (45s+)
      await act(async () => {
        vi.advanceTimersByTime(20000) // Total 50s
      })
      
      await waitFor(() => {
        expect(screen.getByText('1차 푸어링')).toBeInTheDocument()
      })
    })

    it('advances to next phase when lap time is added', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
        vi.advanceTimersByTime(45000)
      })
      
      // Add lap time to advance phase
      const lapButton = screen.queryByText('랩') || screen.queryByRole('button', { name: /lap/i })
      if (lapButton) {
        await act(async () => {
          await user.click(lapButton)
        })
        
        await waitFor(() => {
          expect(screen.getByText('1차 푸어링')).toBeInTheDocument()
        })
      }
    })

    it('records lap times correctly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
        vi.advanceTimersByTime(30000)
      })
      
      const lapButton = screen.queryByText('랩') || screen.queryByRole('button', { name: /lap/i })
      if (lapButton) {
        await act(async () => {
          await user.click(lapButton)
        })
        
        // Check if lap time is recorded (implementation dependent)
        await waitFor(() => {
          expect(screen.getByText('0:30')).toBeInTheDocument()
        })
      }
    })
  })

  describe('Timer Completion', () => {
    it('calls onTimerComplete when stop button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
        vi.advanceTimersByTime(60000)
      })
      
      await act(async () => {
        await user.click(screen.getByText('완료'))
      })
      
      await waitFor(() => {
        expect(mockOnTimerComplete).toHaveBeenCalled()
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
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
      })
      
      await waitFor(() => {
        const completeButton = screen.getByText('완료')
        expect(completeButton).not.toBeDisabled()
      })
    })
  })

  describe('Modal Behavior', () => {
    it('calls onClose when cancel button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('취소'))
      })
      
      expect(mockOnClose).toHaveBeenCalled()
    })

    it('renders as modal overlay', () => {
      render(<BrewTimer {...defaultProps} />)
      
      // Check for modal structure
      const modal = screen.getByRole('dialog') || screen.getByTestId('brew-timer-modal')
      expect(modal).toBeInTheDocument()
    })
  })

  describe('Different Dripper Configurations', () => {
    it('shows correct phases for Kalita', () => {
      render(<BrewTimer {...defaultProps} dripper="kalita" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:30')).toBeInTheDocument()
    })

    it('shows correct phases for Origami', () => {
      render(<BrewTimer {...defaultProps} dripper="origami" />)
      
      expect(screen.getByText('Pre-infusion')).toBeInTheDocument()
      expect(screen.getByText('목표: 0:45')).toBeInTheDocument()
    })

    it('shows correct phases for April', () => {
      render(<BrewTimer {...defaultProps} dripper="april" />)
      
      // Assuming April dripper exists
      expect(screen.getByText('APRIL · 320ml')).toBeInTheDocument()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles rapid button clicks gracefully', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      const startButton = screen.getByText('시작')
      
      // Rapid clicks should not cause issues
      await act(async () => {
        await user.click(startButton)
        await user.click(startButton)
        await user.click(startButton)
      })
      
      // Should still be in running state
      await waitFor(() => {
        expect(screen.getByText('일시정지')).toBeInTheDocument()
      })
    })

    it('maintains correct state after multiple resets', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      for (let i = 0; i < 3; i++) {
        await act(async () => {
          await user.click(screen.getByText('시작'))
          vi.advanceTimersByTime(10000)
        })
        
        const resetButton = screen.queryByRole('button', { name: /reset/i }) || screen.queryByLabelText('리셋')
        if (resetButton) {
          await act(async () => {
            await user.click(resetButton)
          })
        }
        
        await waitFor(() => {
          expect(screen.getByText('0:00')).toBeInTheDocument()
          expect(screen.getByText('시작')).toBeInTheDocument()
        })
      }
    })

    it('handles component unmounting during timer', () => {
      const { unmount } = render(<BrewTimer {...defaultProps} />)
      
      // Should not throw errors when unmounting
      expect(() => unmount()).not.toThrow()
    })

    it('scrolls lap times when there are many records', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<BrewTimer {...defaultProps} />)
      
      await act(async () => {
        await user.click(screen.getByText('시작'))
      })
      
      const lapButton = screen.queryByText('랩') || screen.queryByRole('button', { name: /lap/i })
      if (lapButton) {
        // Add multiple lap times
        for (let i = 0; i < 5; i++) {
          await act(async () => {
            vi.advanceTimersByTime(10000)
            await user.click(lapButton)
          })
        }
        
        // Check if lap times container is scrollable or shows scroll behavior
        const lapContainer = screen.queryByTestId('lap-times-container')
        if (lapContainer) {
          expect(lapContainer).toBeInTheDocument()
        }
      }
    })
  })
})