import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import SearchBar from '../SearchBar'

describe('SearchBar', () => {
  const mockOnSearch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render with default placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.getByPlaceholderText('커피명, 카페명, 원산지 검색...')).toBeInTheDocument()
    })

    it('should render with custom placeholder', () => {
      render(<SearchBar onSearch={mockOnSearch} placeholder="Search coffee..." />)
      
      expect(screen.getByPlaceholderText('Search coffee...')).toBeInTheDocument()
    })

    it('should render search icon', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const searchIcon = screen.getByRole('textbox').parentElement?.querySelector('svg')
      expect(searchIcon).toBeInTheDocument()
    })
  })

  describe('Search functionality', () => {
    it('should call onSearch on input change (real-time search)', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'coffee')
      
      expect(mockOnSearch).toHaveBeenCalledTimes(6) // Each character
      expect(mockOnSearch).toHaveBeenLastCalledWith('coffee')
    })

    it('should call onSearch on form submit', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'espresso')
      
      const form = input.closest('form')
      if (form) {
        fireEvent.submit(form)
      }
      
      expect(mockOnSearch).toHaveBeenCalledWith('espresso')
    })

    it('should prevent default form submission', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const form = screen.getByRole('textbox').closest('form')
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true })
      
      form?.dispatchEvent(submitEvent)
      
      expect(submitEvent.defaultPrevented).toBe(true)
    })
  })

  describe('Clear functionality', () => {
    it('should show clear button when input has value', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toBeInTheDocument()
    })

    it('should not show clear button when input is empty', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should clear input and call onSearch with empty string when clear button clicked', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox') as HTMLInputElement
      await user.type(input, 'test query')
      
      const clearButton = screen.getByRole('button')
      await user.click(clearButton)
      
      expect(input.value).toBe('')
      expect(mockOnSearch).toHaveBeenLastCalledWith('')
    })
  })

  describe('Styling', () => {
    it('should have correct input styling', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass(
        'w-full',
        'px-4',
        'py-3',
        'pl-12',
        'pr-4',
        'text-gray-700',
        'bg-white',
        'border',
        'border-gray-300',
        'rounded-xl',
        'focus:outline-none',
        'focus:ring-2',
        'focus:ring-coffee-500',
        'focus:border-transparent'
      )
    })

    it('should position search icon correctly', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const iconContainer = screen.getByRole('textbox').parentElement?.querySelector('.absolute.inset-y-0.left-0')
      expect(iconContainer).toBeInTheDocument()
      expect(iconContainer).toHaveClass('flex', 'items-center', 'pl-4')
    })

    it('should position clear button correctly when visible', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveClass(
        'absolute',
        'inset-y-0',
        'right-0',
        'flex',
        'items-center',
        'pr-4',
        'text-gray-400',
        'hover:text-gray-600'
      )
    })
  })

  describe('Accessibility', () => {
    it('should be focusable', () => {
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      input.focus()
      
      expect(input).toHaveFocus()
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      
      await user.tab()
      expect(input).toHaveFocus()
      
      await user.keyboard('test{Enter}')
      expect(mockOnSearch).toHaveBeenCalledWith('test')
    })

    it('should have accessible clear button', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      const clearButton = screen.getByRole('button')
      expect(clearButton).toHaveAttribute('type', 'button')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty search queries', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '   ')
      
      expect(mockOnSearch).toHaveBeenCalledWith('   ')
    })

    it('should handle special characters', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, '한글@#$%')
      
      expect(mockOnSearch).toHaveBeenLastCalledWith('한글@#$%')
    })

    it('should maintain input state correctly', async () => {
      const user = userEvent.setup()
      render(<SearchBar onSearch={mockOnSearch} />)
      
      const input = screen.getByRole('textbox') as HTMLInputElement
      
      await user.type(input, 'test')
      expect(input.value).toBe('test')
      
      await user.clear(input)
      expect(input.value).toBe('')
      expect(mockOnSearch).toHaveBeenLastCalledWith('')
    })
  })
})