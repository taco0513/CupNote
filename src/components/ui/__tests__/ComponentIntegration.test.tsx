/**
 * Basic Integration Tests for New UI Components
 * Tests that components render and interact properly
 */

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { vi } from 'vitest'

import { Button } from '../Button'
import { Input } from '../Input'

// Mock Next.js hooks
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/test',
}))

describe('UI Component Integration', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  describe('Button Component', () => {
    test('renders button with different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Default')

      rerender(<Button variant="primary">Primary</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Primary')

      rerender(<Button variant="secondary">Secondary</Button>)
      expect(screen.getByRole('button')).toHaveTextContent('Secondary')
    })

    test('handles click events', async () => {
      const handleClick = vi.fn()
      const user = userEvent.setup()

      render(<Button onClick={handleClick}>Click me</Button>)
      
      await user.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    test('supports disabled state', () => {
      render(<Button disabled>Disabled</Button>)
      expect(screen.getByRole('button')).toBeDisabled()
    })

    test('supports different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()

      rerender(<Button size="lg">Large</Button>)
      expect(screen.getByRole('button')).toBeInTheDocument()
    })
  })

  describe('Input Component', () => {
    test('renders input with label', () => {
      render(<Input label="Test Label" value="" onChange={() => {}} />)
      
      expect(screen.getByLabelText('Test Label')).toBeInTheDocument()
      expect(screen.getByText('Test Label')).toBeInTheDocument()
    })

    test('handles value changes', async () => {
      const handleChange = vi.fn()
      const user = userEvent.setup()

      render(<Input label="Test" value="" onChange={handleChange} />)
      
      const input = screen.getByLabelText('Test')
      await user.type(input, 'hello')
      
      expect(handleChange).toHaveBeenCalled()
    })

    test('shows error state', () => {
      render(<Input label="Test" value="" onChange={() => {}} error="Error message" />)
      
      expect(screen.getByText('Error message')).toBeInTheDocument()
    })

    test('supports password type with toggle', async () => {
      const user = userEvent.setup()

      render(<Input label="Password" type="password" value="" onChange={() => {}} />)
      
      const input = screen.getByLabelText('Password')
      expect(input).toHaveAttribute('type', 'password')
      
      // Should have password toggle button
      const toggleButton = screen.getByRole('button')
      await user.click(toggleButton)
      
      expect(input).toHaveAttribute('type', 'text')
    })
  })

  describe('Component Interoperability', () => {
    test('button and input work together in a form', async () => {
      const handleSubmit = vi.fn()
      const handleChange = vi.fn()
      const user = userEvent.setup()

      const TestForm = () => {
        return (
          <form onSubmit={handleSubmit}>
            <Input label="Name" value="" onChange={handleChange} />
            <Button type="submit">Submit</Button>
          </form>
        )
      }

      render(<TestForm />)
      
      const input = screen.getByLabelText('Name')
      const button = screen.getByRole('button')
      
      await user.type(input, 'test name')
      await user.click(button)
      
      expect(handleChange).toHaveBeenCalled()
    })

    test('components maintain consistent styling', () => {
      render(
        <div>
          <Button variant="primary">Button</Button>
          <Input label="Input" value="" onChange={() => {}} />
        </div>
      )
      
      const button = screen.getByRole('button')
      const input = screen.getByLabelText('Input')
      
      // Both should be in the document
      expect(button).toBeInTheDocument()
      expect(input).toBeInTheDocument()
      
      // Should have consistent class patterns
      expect(button).toHaveClass(/rounded/)
      expect(input).toHaveClass(/rounded/)
    })
  })

  describe('Accessibility', () => {
    test('components support keyboard navigation', async () => {
      const user = userEvent.setup()

      render(
        <div>
          <Button>First Button</Button>
          <Input label="Input Field" value="" onChange={() => {}} />
          <Button>Second Button</Button>
        </div>
      )
      
      // Tab through elements
      await user.tab()
      expect(screen.getByText('First Button')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByLabelText('Input Field')).toHaveFocus()
      
      await user.tab()
      expect(screen.getByText('Second Button')).toHaveFocus()
    })

    test('components have proper ARIA attributes', () => {
      render(
        <div>
          <Button aria-label="Custom button label">Button</Button>
          <Input label="Required Field" value="" onChange={() => {}} required />
        </div>
      )
      
      const button = screen.getByRole('button')
      const input = screen.getByRole('textbox')
      
      expect(button).toHaveAttribute('aria-label', 'Custom button label')
      expect(input).toHaveAttribute('required')
    })
  })

  describe('Performance', () => {
    test('components render quickly', () => {
      const startTime = performance.now()
      
      render(
        <div>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i}>
              <Button>Button {i}</Button>
              <Input label={`Input ${i}`} value="" onChange={() => {}} />
            </div>
          ))}
        </div>
      )
      
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render within reasonable time
      expect(renderTime).toBeLessThan(50)
    })
  })
})