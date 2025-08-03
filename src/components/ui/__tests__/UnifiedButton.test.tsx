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
      expect(button).toHaveClass('bg-accent-warm', 'text-white') // primary variant
      expect(button).toHaveClass('px-4', 'py-2') // medium size
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
      expect(button).toHaveClass('bg-accent-warm', 'text-white')
    })

    it('renders secondary variant correctly', () => {
      render(<UnifiedButton variant="secondary">Secondary</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-neutral-200', 'text-neutral-800')
    })

    it('renders outline variant correctly', () => {
      render(<UnifiedButton variant="outline">Outline</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'border-2', 'border-accent-warm', 'text-accent-warm')
    })

    it('renders ghost variant correctly', () => {
      render(<UnifiedButton variant="ghost">Ghost</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-transparent', 'text-neutral-700')
    })

    it('renders danger variant correctly', () => {
      render(<UnifiedButton variant="danger">Danger</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-red-500', 'text-white')
    })
  })

  describe('Sizes', () => {
    it('renders small size correctly', () => {
      render(<UnifiedButton size="small">Small</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-3', 'py-1.5', 'text-sm')
    })

    it('renders medium size correctly', () => {
      render(<UnifiedButton size="medium">Medium</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-4', 'py-2')
    })

    it('renders large size correctly', () => {
      render(<UnifiedButton size="large">Large</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('px-6', 'py-3', 'text-lg')
    })

    it('renders icon size correctly', () => {
      render(<UnifiedButton size="icon">Icon</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('p-2')
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
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
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
      expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
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
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-accent-warm')
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
      expect(button).toHaveClass('focus:ring-2', 'focus:ring-accent-warm', 'focus:ring-offset-2')
    })
  })

  describe('CSS Classes', () => {
    it('always includes base classes', () => {
      render(<UnifiedButton>Base Classes</UnifiedButton>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'inline-flex',
        'items-center',
        'justify-center',
        'font-medium',
        'rounded-lg',
        'transition-all',
        'duration-200'
      )
    })

    it('combines variant, size, and custom classes correctly', () => {
      render(
        <UnifiedButton
          variant="outline"
          size="large"
          fullWidth
          className="custom-class"
        >
          Combined Classes
        </UnifiedButton>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'bg-transparent', // outline variant
        'px-6', 'py-3', 'text-lg', // large size
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