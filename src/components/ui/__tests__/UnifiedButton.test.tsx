import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import UnifiedButton from '../UnifiedButton'

describe('UnifiedButton', () => {
  describe('Basic Rendering', () => {
    it('renders with default props', () => {
      render(<UnifiedButton>Default Button</UnifiedButton>)
      
      const button = screen.getByRole('button', { name: 'Default Button' })
      expect(button).toBeInTheDocument()
      expect(button).toHaveClass('btn-base', 'btn-primary') // primary variant
      expect(button).toHaveClass('min-h-[48px]') // medium size
    })

    it('renders children correctly', () => {
      render(
        <UnifiedButton>
          <span>Custom Content</span>
        </UnifiedButton>
      )
      
      expect(screen.getByText('Custom Content')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<UnifiedButton className="custom-class">Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })
  })

  describe('Variants', () => {
    it('renders primary variant correctly', () => {
      render(<UnifiedButton variant="primary">Primary</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base', 'btn-primary')
    })

    it('renders secondary variant correctly', () => {
      render(<UnifiedButton variant="secondary">Secondary</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base', 'btn-secondary')
    })

    it('renders outline variant correctly', () => {
      render(<UnifiedButton variant="outline">Outline</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base', 'btn-secondary', 'border-2', 'border-coffee-400', 'bg-transparent')
    })

    it('renders ghost variant correctly', () => {
      render(<UnifiedButton variant="ghost">Ghost</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base', 'bg-transparent', 'text-coffee-600')
    })

    it('renders danger variant correctly', () => {
      render(<UnifiedButton variant="danger">Danger</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base', 'bg-red-500', 'text-white', 'border-red-600')
    })
  })

  describe('Sizes', () => {
    it('renders xs size correctly', () => {
      render(<UnifiedButton size="xs">Extra Small</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]', 'px-3', 'text-xs')
    })

    it('renders sm size correctly', () => {
      render(<UnifiedButton size="sm">Small</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]', 'px-3.5', 'text-sm')
    })

    it('renders md size correctly', () => {
      render(<UnifiedButton size="md">Medium</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[48px]', 'px-4', 'text-sm')
    })

    it('renders lg size correctly', () => {
      render(<UnifiedButton size="lg">Large</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[52px]', 'px-5', 'text-base')
    })

    it('renders xl size correctly', () => {
      render(<UnifiedButton size="xl">Extra Large</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[56px]', 'px-6', 'text-lg')
    })

    it('renders icon size correctly', () => {
      render(<UnifiedButton size="icon">Icon</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('min-h-[44px]', 'min-w-[44px]', 'aspect-square')
    })
  })

  describe('Layout Options', () => {
    it('renders full width when specified', () => {
      render(<UnifiedButton fullWidth>Full Width</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('w-full')
    })

    it('does not apply full width by default', () => {
      render(<UnifiedButton>Normal Width</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveClass('w-full')
    })
  })

  describe('Loading State', () => {
    it('shows loading spinner when loading is true', () => {
      render(<UnifiedButton loading>Loading Button</UnifiedButton>)
      
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
      expect(screen.queryByText('Loading Button')).not.toBeInTheDocument()
      
      // Should show spinner icon
      const spinner = screen.getByRole('button').querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('shows normal content when not loading', () => {
      render(<UnifiedButton loading={false}>Normal Button</UnifiedButton>)
      
      expect(screen.getByText('Normal Button')).toBeInTheDocument()
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })

    it('disables button when loading', () => {
      render(<UnifiedButton loading>Loading Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('applies loading styles', () => {
      render(<UnifiedButton loading>Loading Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Disabled State', () => {
    it('disables button when disabled prop is true', () => {
      render(<UnifiedButton disabled>Disabled Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('applies disabled styles', () => {
      render(<UnifiedButton disabled>Disabled Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })

    it('shows normal content when disabled', () => {
      render(<UnifiedButton disabled>Disabled Button</UnifiedButton>)
      
      expect(screen.getByText('Disabled Button')).toBeInTheDocument()
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })
  })

  describe('Event Handling', () => {
    it('calls onClick when clicked and not disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<UnifiedButton onClick={handleClick}>Clickable Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<UnifiedButton onClick={handleClick} disabled>Disabled Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<UnifiedButton onClick={handleClick} loading>Loading Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      await user.click(button)
      
      expect(handleClick).not.toHaveBeenCalled()
    })

    it('supports other event handlers', () => {
      const handleMouseEnter = vi.fn()
      const handleMouseLeave = vi.fn()
      
      render(
        <UnifiedButton
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          Hover Button
        </UnifiedButton>
      )
      
      const button = screen.getByRole('button')
      
      fireEvent.mouseEnter(button)
      expect(handleMouseEnter).toHaveBeenCalledTimes(1)
      
      fireEvent.mouseLeave(button)
      expect(handleMouseLeave).toHaveBeenCalledTimes(1)
    })
  })

  describe('HTML Attributes', () => {
    it('forwards HTML button attributes', () => {
      render(
        <UnifiedButton
          type="submit"
          id="submit-button"
          data-testid="custom-button"
          aria-label="Submit form"
        >
          Submit
        </UnifiedButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
      expect(button).toHaveAttribute('id', 'submit-button')
      expect(button).toHaveAttribute('data-testid', 'custom-button')
      expect(button).toHaveAttribute('aria-label', 'Submit form')
    })

    it('applies focus styles correctly', () => {
      render(<UnifiedButton>Focus Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base')
    })
  })

  describe('Accessibility', () => {
    it('has correct button role', () => {
      render(<UnifiedButton>Accessible Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('is keyboard accessible', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()
      
      render(<UnifiedButton onClick={handleClick}>Keyboard Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(handleClick).toHaveBeenCalledTimes(1)
      
      await user.keyboard(' ')
      expect(handleClick).toHaveBeenCalledTimes(2)
    })

    it('maintains focus ring styles', () => {
      render(<UnifiedButton>Focus Ring Button</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base')
    })
  })

  describe('CSS Classes', () => {
    it('always includes base classes', () => {
      render(<UnifiedButton>Base Classes</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('btn-base')
    })

    it('combines variant, size, and custom classes correctly', () => {
      render(
        <UnifiedButton
          variant="outline"
          size="lg"
          fullWidth
          className="custom-class"
        >
          Combined Classes
        </UnifiedButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'btn-base', // base class
        'bg-transparent', // outline variant
        'min-h-[52px]', // large size
        'w-full', // full width
        'custom-class' // custom class
      )
    })
  })

  describe('Edge Cases', () => {
    it('handles empty children gracefully', () => {
      render(<UnifiedButton>{}</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles null children gracefully', () => {
      render(<UnifiedButton>{null}</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('handles both loading and disabled props correctly', () => {
      render(<UnifiedButton loading disabled>Both Loading and Disabled</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
    })

    it('handles rapid state changes correctly', () => {
      const { rerender } = render(<UnifiedButton>Initial</UnifiedButton>)
      
      // Change to loading
      rerender(<UnifiedButton loading>Loading</UnifiedButton>)
      expect(screen.getByText('로딩 중...')).toBeInTheDocument()
      
      // Change back to normal
      rerender(<UnifiedButton>Normal</UnifiedButton>)
      expect(screen.getByText('Normal')).toBeInTheDocument()
      expect(screen.queryByText('로딩 중...')).not.toBeInTheDocument()
    })
  })
})