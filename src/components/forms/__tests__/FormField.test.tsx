import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

import FormField from '../FormField'

describe('FormField', () => {
  describe('Basic rendering', () => {
    it('should render children', () => {
      render(
        <FormField>
          <input data-testid="test-input" />
        </FormField>
      )
      
      expect(screen.getByTestId('test-input')).toBeInTheDocument()
    })

    it('should render label when provided', () => {
      render(
        <FormField label="Test Label">
          <input />
        </FormField>
      )
      
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should not render label when not provided', () => {
      render(
        <FormField>
          <input />
        </FormField>
      )
      
      expect(screen.queryByText('Test Label')).not.toBeInTheDocument()
    })
  })

  describe('Required field indicator', () => {
    it('should show asterisk when required', () => {
      render(
        <FormField label="Required Field" required>
          <input />
        </FormField>
      )
      
      expect(screen.getByText('*')).toBeInTheDocument()
      expect(screen.getByText('*')).toHaveClass('text-red-500', 'ml-1')
    })

    it('should not show asterisk when not required', () => {
      render(
        <FormField label="Optional Field">
          <input />
        </FormField>
      )
      
      expect(screen.queryByText('*')).not.toBeInTheDocument()
    })
  })

  describe('Error handling', () => {
    it('should display error message', () => {
      render(
        <FormField error="This field is required">
          <input />
        </FormField>
      )
      
      expect(screen.getByText('This field is required')).toBeInTheDocument()
    })

    it('should display error with icon', () => {
      render(
        <FormField error="Error message">
          <input />
        </FormField>
      )
      
      const errorContainer = screen.getByText('Error message').parentElement
      const errorIcon = errorContainer?.querySelector('svg')
      expect(errorIcon).toBeInTheDocument()
      expect(errorIcon).toHaveClass('h-4', 'w-4', 'flex-shrink-0')
    })

    it('should style error message correctly', () => {
      render(
        <FormField error="Error message">
          <input />
        </FormField>
      )
      
      const errorContainer = screen.getByText('Error message').parentElement
      expect(errorContainer).toHaveClass('flex', 'items-center', 'space-x-1', 'text-red-600', 'text-sm')
    })

    it('should not display error when null', () => {
      render(
        <FormField error={null}>
          <input />
        </FormField>
      )
      
      expect(screen.queryByText('Error message')).not.toBeInTheDocument()
    })
  })

  describe('Helper text', () => {
    it('should display helper text when no error', () => {
      render(
        <FormField helperText="This is helpful information">
          <input />
        </FormField>
      )
      
      expect(screen.getByText('This is helpful information')).toBeInTheDocument()
    })

    it('should style helper text correctly', () => {
      render(
        <FormField helperText="Helper text">
          <input />
        </FormField>
      )
      
      const helperText = screen.getByText('Helper text')
      expect(helperText).toHaveClass('text-sm', 'text-gray-500')
    })

    it('should hide helper text when error exists', () => {
      render(
        <FormField helperText="Helper text" error="Error message">
          <input />
        </FormField>
      )
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  describe('Label styling', () => {
    it('should style label correctly', () => {
      render(
        <FormField label="Test Label">
          <input />
        </FormField>
      )
      
      const label = screen.getByText('Test Label')
      expect(label.tagName).toBe('LABEL')
      expect(label).toHaveClass('block', 'text-sm', 'font-medium', 'text-gray-700')
    })
  })

  describe('Container styling', () => {
    it('should apply default container styling', () => {
      render(
        <FormField>
          <input data-testid="test-input" />
        </FormField>
      )
      
      const container = screen.getByTestId('test-input').closest('div')?.parentElement
      expect(container).toHaveClass('space-y-2')
    })

    it('should apply custom className', () => {
      render(
        <FormField className="custom-class">
          <input data-testid="test-input" />
        </FormField>
      )
      
      const container = screen.getByTestId('test-input').closest('div')?.parentElement
      expect(container).toHaveClass('custom-class', 'space-y-2')
    })

    it('should have relative wrapper for children', () => {
      render(
        <FormField>
          <input data-testid="test-input" />
        </FormField>
      )
      
      const wrapper = screen.getByTestId('test-input').parentElement
      expect(wrapper).toHaveClass('relative')
    })
  })

  describe('Forward ref', () => {
    it('should forward ref to container element', () => {
      const ref = vi.fn()
      render(
        <FormField ref={ref}>
          <input />
        </FormField>
      )
      
      expect(ref).toHaveBeenCalled()
    })
  })

  describe('Complex scenarios', () => {
    it('should handle all props together', () => {
      render(
        <FormField
          label="Complete Field"
          required
          error="Validation failed"
          helperText="This won't show"
          className="custom-field"
        >
          <input data-testid="complete-input" />
        </FormField>
      )
      
      // Label and required indicator
      expect(screen.getByText('Complete Field')).toBeInTheDocument()
      expect(screen.getByText('*')).toBeInTheDocument()
      
      // Error message (helper text should be hidden)
      expect(screen.getByText('Validation failed')).toBeInTheDocument()
      expect(screen.queryByText("This won't show")).not.toBeInTheDocument()
      
      // Custom styling
      const container = screen.getByTestId('complete-input').closest('div')?.parentElement
      expect(container).toHaveClass('custom-field')
    })

    it('should handle empty strings as no error', () => {
      render(
        <FormField error="" helperText="Should show">
          <input />
        </FormField>
      )
      
      expect(screen.getByText('Should show')).toBeInTheDocument()
    })
  })
})