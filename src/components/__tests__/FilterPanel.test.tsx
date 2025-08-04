import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest'

import FilterPanel, { FilterOptions } from '../FilterPanel'

// Mock dependencies
vi.mock('../MultiTagSearch', () => ({
  default: ({ tags, onTagsChange, placeholder }: any) => (
    <div data-testid="multi-tag-search">
      <input
        placeholder={placeholder}
        onChange={(e) => onTagsChange([e.target.value])}
        data-testid="tag-input"
      />
      {tags.map((tag: string, i: number) => (
        <span key={i} data-testid={`tag-${i}`}>{tag}</span>
      ))}
    </div>
  )
}))

vi.mock('../lib/supabase-storage', () => ({
  SupabaseStorage: {
    getRecords: vi.fn(() => Promise.resolve([
      { tags: ['Ethiopian', 'Light'] },
      { tags: ['Colombian', 'Medium'] },
    ])),
  },
}))

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

describe('FilterPanel', () => {
  const defaultFilters: FilterOptions = {}
  const mockOnFiltersChange = vi.fn()
  const mockOnToggle = vi.fn()

  const defaultProps = {
    filters: defaultFilters,
    onFiltersChange: mockOnFiltersChange,
    isOpen: false,
    onToggle: mockOnToggle,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Filter toggle button', () => {
    it('should render toggle button', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} />)
      })
      
      const toggleButton = screen.getByRole('button', { name: /필터/ })
      expect(toggleButton).toBeInTheDocument()
    })

    it('should call onToggle when button clicked', async () => {
      const user = userEvent.setup()
      render(<FilterPanel {...defaultProps} />)
      
      const toggleButton = screen.getByRole('button', { name: /필터/ })
      
      await act(async () => {
        await user.click(toggleButton)
      })
      
      expect(mockOnToggle).toHaveBeenCalledTimes(1)
    })

    it('should show filter count badge when filters applied', async () => {
      const filtersWithValues: FilterOptions = {
        mode: 'cafe',
        rating: 4,
      }
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} filters={filtersWithValues} />)
      })
      
      expect(screen.getByText('2')).toBeInTheDocument()
    })

    it('should not show badge when no filters applied', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} />)
      })
      
      expect(screen.queryByText(/\d+/)).not.toBeInTheDocument()
    })
  })

  describe('Filter panel visibility', () => {
    it('should not show panel when closed', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={false} />)
      })
      
      expect(screen.queryByText('모드')).not.toBeInTheDocument()
    })

    it('should show panel when open', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByText('모드')).toBeInTheDocument()
    })
  })

  describe('Mode filter', () => {
    it('should render mode select', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const modeSelect = screen.getByDisplayValue('전체')
      expect(modeSelect).toBeInTheDocument()
    })

    it('should call onFiltersChange when mode changed', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const modeSelect = screen.getByDisplayValue('전체')
      
      await act(async () => {
        await user.selectOptions(modeSelect, 'cafe')
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ mode: 'cafe' })
    })

    it('should show current mode value', async () => {
      const filtersWithMode: FilterOptions = { mode: 'homecafe' }
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} filters={filtersWithMode} isOpen={true} />)
      })
      
      const modeSelect = screen.getByDisplayValue('🏠 HomeCafe') as HTMLSelectElement
      expect(modeSelect.value).toBe('homecafe')
    })
  })

  describe('Rating filter', () => {
    it('should render rating select', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByText('최소 평점')).toBeInTheDocument()
    })

    it('should call onFiltersChange when rating changed', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const ratingSelect = screen.getByDisplayValue('전체')
      
      await act(async () => {
        await user.selectOptions(ratingSelect, '4')
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ rating: 4 })
    })
  })

  describe('Date range filter', () => {
    it('should render date range select', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByText('기간')).toBeInTheDocument()
    })

    it('should show custom date inputs when custom selected', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const dateSelect = screen.getByDisplayValue('전체')
      
      await act(async () => {
        await user.selectOptions(dateSelect, 'custom')
      })
      
      await waitFor(() => {
        expect(screen.getByPlaceholderText('시작일')).toBeInTheDocument()
        expect(screen.getByPlaceholderText('종료일')).toBeInTheDocument()
      })
    })

    it('should handle custom date range input', async () => {
      const user = userEvent.setup()
      const filtersWithCustomDate: FilterOptions = { dateRange: 'custom' }
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} filters={filtersWithCustomDate} isOpen={true} />)
      })
      
      const startDateInput = screen.getByPlaceholderText('시작일')
      
      await act(async () => {
        await user.type(startDateInput, '2023-01-01')
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          customDateRange: expect.objectContaining({
            start: '2023-01-01',
          }),
        })
      )
    })
  })

  describe('Sort options', () => {
    it('should render sort by and sort order selects', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByText('정렬')).toBeInTheDocument()
      expect(screen.getByDisplayValue('날짜순')).toBeInTheDocument()
      expect(screen.getByDisplayValue('내림차순')).toBeInTheDocument()
    })

    it('should call onFiltersChange when sort options changed', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const sortBySelect = screen.getByDisplayValue('날짜순')
      
      await act(async () => {
        await user.selectOptions(sortBySelect, 'rating')
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ sortBy: 'rating' })
    })
  })

  describe('Image filter', () => {
    it('should render image checkbox', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByText('이미지가 있는 기록만 표시')).toBeInTheDocument()
    })

    it('should call onFiltersChange when image filter toggled', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const imageCheckbox = screen.getByRole('checkbox')
      
      await act(async () => {
        await user.click(imageCheckbox)
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ hasImages: true })
    })
  })

  describe('Tag filter', () => {
    it('should render tag search component', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      await waitFor(() => {
        expect(screen.getByTestId('multi-tag-search')).toBeInTheDocument()
      })
    })

    it('should load available tags from records', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      // Wait for tags to load and verify the mock was called
      await waitFor(() => {
        expect(vi.mocked(require('../lib/supabase-storage').SupabaseStorage.getRecords)).toHaveBeenCalled()
      })
    })

    it('should call onFiltersChange when tags changed', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      await waitFor(() => {
        const tagInput = screen.getByTestId('tag-input')
        
        act(() => {
          fireEvent.change(tagInput, { target: { value: 'Ethiopian' } })
        })
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({ tags: ['Ethiopian'] })
    })
  })

  describe('Reset filters', () => {
    it('should render reset button', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      expect(screen.getByRole('button', { name: '필터 초기화' })).toBeInTheDocument()
    })

    it('should call onFiltersChange with empty object when reset clicked', async () => {
      const user = userEvent.setup()
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const resetButton = screen.getByRole('button', { name: '필터 초기화' })
      
      await act(async () => {
        await user.click(resetButton)
      })
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith({})
    })
  })

  describe('Filter panel styling', () => {
    it('should have correct panel positioning and styling', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const panel = screen.getByText('모드').closest('div')
      expect(panel).toHaveClass(
        'absolute',
        'top-full',
        'left-0',
        'mt-2',
        'w-80',
        'bg-white',
        'border',
        'border-gray-200',
        'rounded-xl',
        'shadow-lg',
        'z-10',
        'p-6'
      )
    })

    it('should have proper spacing between filter sections', async () => {
      await act(async () => {
        render(<FilterPanel {...defaultProps} isOpen={true} />)
      })
      
      const filterContainer = screen.getByText('모드').closest('.space-y-4')
      expect(filterContainer).toBeInTheDocument()
    })
  })

  describe('Edge cases', () => {
    it('should handle undefined filter values gracefully', async () => {
      const filtersWithUndefined: FilterOptions = {
        mode: undefined,
        rating: undefined,
      }
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} filters={filtersWithUndefined} isOpen={true} />)
      })
      
      expect(screen.getByDisplayValue('전체')).toBeInTheDocument()
    })

    it('should handle empty tags array', async () => {
      const filtersWithEmptyTags: FilterOptions = { tags: [] }
      
      await act(async () => {
        render(<FilterPanel {...defaultProps} filters={filtersWithEmptyTags} isOpen={true} />)
      })
      
      expect(screen.getByTestId('multi-tag-search')).toBeInTheDocument()
    })
  })
})