import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

import LoadingSpinner, {
  InlineSpinner,
  SkeletonLoader,
  LoadingButton,
  CardSkeleton,
  ListSkeleton,
} from '../LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('Basic rendering', () => {
    it('should render default spinner', () => {
      render(<LoadingSpinner />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('animate-spin', 'h-6', 'w-6', 'text-amber-600')
    })

    it('should render coffee variant spinner', () => {
      render(<LoadingSpinner variant="coffee" />)
      
      const coffeeIcon = document.querySelector('svg.lucide-coffee')
      expect(coffeeIcon).toBeInTheDocument()
      expect(coffeeIcon).toHaveClass('animate-bounce')
    })

    it('should render with custom text', () => {
      const testText = 'Loading coffee data...'
      render(<LoadingSpinner text={testText} />)
      
      expect(screen.getByText(testText)).toBeInTheDocument()
    })
  })

  describe('Size variants', () => {
    it('should render small spinner', () => {
      render(<LoadingSpinner size="sm" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-4', 'w-4')
    })

    it('should render medium spinner', () => {
      render(<LoadingSpinner size="md" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-6', 'w-6')
    })

    it('should render large spinner', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-8', 'w-8')
    })

    it('should render extra large spinner', () => {
      render(<LoadingSpinner size="xl" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('h-12', 'w-12')
    })
  })

  describe('Color variants', () => {
    it('should render primary color spinner', () => {
      render(<LoadingSpinner color="primary" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('text-amber-600')
    })

    it('should render white color spinner', () => {
      render(<LoadingSpinner color="white" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('text-white')
    })

    it('should render gray color spinner', () => {
      render(<LoadingSpinner color="gray" />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      expect(spinner).toHaveClass('text-gray-500')
    })
  })

  describe('Layout modes', () => {
    it('should render fullscreen mode', () => {
      render(<LoadingSpinner fullscreen />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      
      // fullscreen 모드에서는 최상위 div가 fixed 클래스를 가짐
      const fullscreenContainer = document.querySelector('.fixed.inset-0.z-50')
      expect(fullscreenContainer).toBeInTheDocument()
    })

    it('should render overlay mode', () => {
      render(<LoadingSpinner overlay />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      
      // overlay 모드에서는 최상위 div가 absolute 클래스를 가짐
      const overlayContainer = document.querySelector('.absolute.inset-0.z-10')
      expect(overlayContainer).toBeInTheDocument()
    })

    it('should render inline mode by default', () => {
      render(<LoadingSpinner />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      const container = spinner?.closest('div')
      expect(container).not.toHaveClass('fixed', 'absolute')
    })
  })

  describe('Custom styling', () => {
    it('should apply custom className', () => {
      const customClass = 'custom-spinner'
      render(<LoadingSpinner className={customClass} />)
      
      const spinner = document.querySelector('svg.animate-spin')
      expect(spinner).toBeInTheDocument()
      const container = spinner?.closest('.custom-spinner')
      expect(container).toBeInTheDocument()
    })
  })

  describe('Text size matching', () => {
    it('should match text size to spinner size', () => {
      render(<LoadingSpinner size="sm" text="Small text" />)
      
      const text = screen.getByText('Small text')
      expect(text).toHaveClass('text-sm')
    })

    it('should match text size for xl spinner', () => {
      render(<LoadingSpinner size="xl" text="Large text" />)
      
      const text = screen.getByText('Large text')
      expect(text).toHaveClass('text-xl')
    })
  })

  describe('Coffee variant specific styling', () => {
    it('should apply coffee-specific text styling', () => {
      render(<LoadingSpinner variant="coffee" text="Coffee loading" />)
      
      const text = screen.getByText('Coffee loading')
      expect(text).toHaveClass('text-coffee-600')
    })
  })
})

describe('InlineSpinner', () => {
  it('should render small inline spinner by default', () => {
    render(<InlineSpinner />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-4', 'w-4', 'animate-spin')
  })

  it('should render medium inline spinner', () => {
    render(<InlineSpinner size="md" />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('h-6', 'w-6', 'animate-spin')
  })

  it('should have correct border styling', () => {
    render(<InlineSpinner />)
    
    const spinner = document.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveClass('border-2', 'border-current', 'border-t-transparent', 'rounded-full')
  })
})

describe('SkeletonLoader', () => {
  it('should render default number of lines', () => {
    render(<SkeletonLoader />)
    
    const lines = document.querySelectorAll('.bg-gray-200')
    expect(lines).toHaveLength(6) // 3 lines * 2 elements per line
  })

  it('should render custom number of lines', () => {
    render(<SkeletonLoader lines={2} />)
    
    const lines = document.querySelectorAll('.bg-gray-200')
    expect(lines).toHaveLength(4) // 2 lines * 2 elements per line
  })

  it('should apply custom className', () => {
    const customClass = 'custom-skeleton'
    render(<SkeletonLoader className={customClass} />)
    
    const container = document.querySelector('.animate-pulse')
    expect(container).toHaveClass(customClass)
  })

  it('should have animate-pulse class', () => {
    render(<SkeletonLoader />)
    
    const container = document.querySelector('.animate-pulse')
    expect(container).toBeInTheDocument()
  })
})

describe('LoadingButton', () => {
  it('should render button with children when not loading', () => {
    render(<LoadingButton>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveTextContent('Click me')
    expect(button).not.toBeDisabled()
  })

  it('should show loading spinner when loading', () => {
    render(<LoadingButton loading>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    
    // Should contain a loading spinner
    const spinner = button.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
  })

  it('should hide children text when loading', () => {
    render(<LoadingButton loading>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    const textSpan = button.querySelector('span')
    expect(textSpan).toHaveClass('opacity-0')
  })

  it('should be disabled when disabled prop is true', () => {
    render(<LoadingButton disabled>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when both loading and disabled', () => {
    render(<LoadingButton loading disabled>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-button'
    render(<LoadingButton className={customClass}>Click me</LoadingButton>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass(customClass)
  })

  it('should pass through other props', () => {
    render(<LoadingButton type="submit" data-testid="submit-btn">Submit</LoadingButton>)
    
    const button = screen.getByTestId('submit-btn')
    expect(button).toHaveAttribute('type', 'submit')
  })
})

describe('CardSkeleton', () => {
  it('should render card skeleton structure', () => {
    render(<CardSkeleton />)
    
    const container = document.querySelector('.bg-white.rounded-xl.animate-pulse')
    expect(container).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const customClass = 'custom-card'
    render(<CardSkeleton className={customClass} />)
    
    const container = document.querySelector('.bg-white.rounded-xl.animate-pulse')
    expect(container).toHaveClass(customClass)
  })

  it('should have skeleton elements for avatar and text', () => {
    render(<CardSkeleton />)
    
    // Check for rounded avatar skeleton
    const avatarSkeleton = document.querySelector('.rounded-full.bg-gray-200')
    expect(avatarSkeleton).toBeInTheDocument()
    
    // Check for text skeleton elements
    const textSkeletons = document.querySelectorAll('.bg-gray-200.rounded')
    expect(textSkeletons.length).toBeGreaterThan(1)
  })
})

describe('ListSkeleton', () => {
  it('should render default number of items', () => {
    render(<ListSkeleton />)
    
    const skeletonItems = document.querySelectorAll('.bg-white.rounded-xl.animate-pulse')
    expect(skeletonItems).toHaveLength(5)
  })

  it('should render custom number of items', () => {
    render(<ListSkeleton items={3} />)
    
    const skeletonItems = document.querySelectorAll('.bg-white.rounded-xl.animate-pulse')
    expect(skeletonItems).toHaveLength(3)
  })

  it('should have spacing between items', () => {
    render(<ListSkeleton />)
    
    const container = document.querySelector('.space-y-4')
    expect(container).toBeInTheDocument()
  })
})

describe('Accessibility', () => {
  it('should not interfere with screen readers for default spinner', () => {
    render(<LoadingSpinner />)
    
    // The SVG should be decorative and hidden from screen readers
    const spinner = document.querySelector('svg.animate-spin')
    expect(spinner).toBeInTheDocument()
    // SVG doesn't have a role attribute, which is correct for decorative elements
  })

  it('should provide meaningful text for screen readers when text is provided', () => {
    render(<LoadingSpinner text="Loading your coffee records" />)
    
    const text = screen.getByText('Loading your coffee records')
    expect(text).toBeInTheDocument()
  })

  it('should ensure loading button is properly labeled', () => {
    render(<LoadingButton loading aria-label="Submitting form">Submit</LoadingButton>)
    
    const button = screen.getByLabelText('Submitting form')
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })
})