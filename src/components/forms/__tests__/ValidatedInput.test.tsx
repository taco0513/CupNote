import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import ValidatedInput from '../ValidatedInput'

describe('ValidatedInput', () => {
  const mockOnValidatedChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render input with label', () => {
      render(<ValidatedInput label="Test Label" />)
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    it('should render without label', () => {
      render(<ValidatedInput placeholder="Enter text" />)
      
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
    })

    it('should show required indicator', () => {
      render(<ValidatedInput label="Required Field" required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('Validation states', () => {
    it('should show error state', () => {
      render(<ValidatedInput error="This field is required" value="test" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('border-red-300', 'bg-red-50')
    })

    it('should show success state when valid', () => {
      render(<ValidatedInput value="valid input" />)
      
      const input = screen.getByRole('textbox')
      fireEvent.blur(input) // Trigger validation
      
      expect(input).toHaveClass('border-green-300', 'bg-green-50')
    })

    it('should show focused state', () => {
      render(<ValidatedInput />)
      
      const input = screen.getByRole('textbox')
      fireEvent.focus(input)
      
      expect(input).toHaveClass('border-amber-500', 'focus:ring-amber-200')
    })
  })

  describe('Validation icons', () => {
    it('should show error icon when error exists', () => {
      render(<ValidatedInput error="Error message" value="test" />)
      
      const errorIcon = screen.getByRole('textbox').parentElement?.querySelector('svg')
      expect(errorIcon).toHaveClass('text-red-500')
    })

    it('should show success icon when valid', () => {
      render(<ValidatedInput value="valid" />)
      
      const input = screen.getByRole('textbox')
      fireEvent.blur(input)
      
      const successIcon = input.parentElement?.querySelector('.text-green-500')
      expect(successIcon).toBeInTheDocument()
    })

    it('should not show icons when showValidationIcon is false', () => {
      render(<ValidatedInput error="Error" showValidationIcon={false} value="test" />)
      
      const icon = screen.getByRole('textbox').parentElement?.querySelector('svg')
      expect(icon).not.toBeInTheDocument()
    })
  })

  describe('User interactions', () => {
    it('should call onValidatedChange on input', async () => {
      const user = userEvent.setup()
      render(<ValidatedInput onValidatedChange={mockOnValidatedChange} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(mockOnValidatedChange).toHaveBeenCalledWith('test', true)
    })

    it('should trigger validation on blur', async () => {
      const user = userEvent.setup()
      render(<ValidatedInput validateOnBlur />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      await user.tab()
      
      expect(input).toHaveClass('border-green-300') // Valid state
    })

    it('should not validate on change when validateOnChange is false', async () => {
      const user = userEvent.setup()
      render(<ValidatedInput validateOnChange={false} />)
      
      const input = screen.getByRole('textbox')
      await user.type(input, 'test')
      
      expect(input).not.toHaveClass('border-green-300')
    })
  })

  describe('Error handling', () => {
    it('should display error message', () => {
      render(<ValidatedInput error="Field is required" value="test" />)
      
      expect(screen.getByText('Field is required')).toBeInTheDocument()
    })

    it('should set aria-invalid when error exists', () => {
      render(<ValidatedInput error="Error message" value="test" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-invalid')
    })

    it('should associate error with input via aria-describedby', () => {
      render(<ValidatedInput error="Error message" id="test-input" value="test" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('aria-describedby', 'test-input-error')
    })
  })

  describe('Helper text', () => {
    it('should show helper text when no error', () => {
      render(<ValidatedInput helperText="Enter your name" />)
      
      expect(screen.getByText('Enter your name')).toBeInTheDocument()
    })

    it('should hide helper text when error exists', () => {
      render(<ValidatedInput helperText="Helper text" error="Error message" value="test" />)
      
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument()
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className to container', () => {
      render(<ValidatedInput className="custom-class" />)
      
      const container = screen.getByRole('textbox').closest('.custom-class')
      expect(container).toBeInTheDocument()
    })

    it('should apply custom inputClassName to input', () => {
      render(<ValidatedInput inputClassName="custom-input" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveClass('custom-input')
    })
  })

  describe('Input types', () => {
    it('should render email input', () => {
      render(<ValidatedInput type="email" />)
      
      const input = screen.getByRole('textbox')
      expect(input).toHaveAttribute('type', 'email')
    })

    it('should render password input', () => {
      render(<ValidatedInput type="password" />)
      
      const input = screen.getByLabelText('')
      expect(input).toHaveAttribute('type', 'password')
    })
  })

  describe('Forward ref', () => {
    it('should forward ref to input element', () => {
      const ref = vi.fn()
      render(<ValidatedInput ref={ref} />)
      
      expect(ref).toHaveBeenCalled()
    })
  })
})