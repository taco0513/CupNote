import { render, screen, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import LazyImage from '../LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
const mockObserve = vi.fn()
const mockUnobserve = vi.fn()
const mockDisconnect = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  
  mockIntersectionObserver.mockImplementation((callback) => ({
    observe: mockObserve,
    unobserve: mockUnobserve,
    disconnect: mockDisconnect,
  }))
  
  global.IntersectionObserver = mockIntersectionObserver
})

describe('LazyImage', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  }

  describe('Basic rendering', () => {
    it('should render with placeholder initially', () => {
      render(<LazyImage {...defaultProps} />)
      
      const image = screen.getByAltText('Test image')
      expect(image).toHaveAttribute('src', '/images/placeholder.jpg')
    })

    it('should render with custom placeholder', () => {
      render(<LazyImage {...defaultProps} placeholder="/custom-placeholder.jpg" />)
      
      const image = screen.getByAltText('Test image')
      expect(image).toHaveAttribute('src', '/custom-placeholder.jpg')
    })

    it('should apply custom className', () => {
      render(<LazyImage {...defaultProps} className="custom-image" />)
      
      const container = screen.getByAltText('Test image').closest('.custom-image')
      expect(container).toBeInTheDocument()
    })

    it('should show loading state initially', () => {
      render(<LazyImage {...defaultProps} />)
      
      const image = screen.getByAltText('Test image')
      expect(image).toHaveClass('opacity-0')
      
      const loadingDiv = image.parentElement?.querySelector('.animate-pulse')
      expect(loadingDiv).toBeInTheDocument()
    })
  })

  describe('Intersection Observer setup', () => {
    it('should create IntersectionObserver with correct options', () => {
      render(<LazyImage {...defaultProps} />)
      
      expect(mockIntersectionObserver).toHaveBeenCalledWith(
        expect.any(Function),
        {
          rootMargin: '50px',
          threshold: 0.01,
        }
      )
    })

    it('should observe image element when ref is set', async () => {
      render(<LazyImage {...defaultProps} />)
      
      await waitFor(() => {
        expect(mockObserve).toHaveBeenCalled()
      })
    })

    it('should disconnect observer on unmount', () => {
      const { unmount } = render(<LazyImage {...defaultProps} />)
      
      unmount()
      
      expect(mockDisconnect).toHaveBeenCalled()
    })
  })

  describe('Image loading behavior', () => {
    it('should load actual image when intersecting', async () => {
      const mockOnLoad = vi.fn()
      render(<LazyImage {...defaultProps} onLoad={mockOnLoad} />)
      
      // Get the callback passed to IntersectionObserver
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      
      // Simulate intersection
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      // Create a mock Image constructor that immediately calls onload
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      // Trigger intersection
      observerCallback([mockEntry])
      
      // Simulate successful image load
      mockImage.src = defaultProps.src
      if (mockImage.onload) {
        mockImage.onload()
      }
      
      await waitFor(() => {
        expect(mockOnLoad).toHaveBeenCalled()
      })
      
      global.Image = originalImage
    })

    it('should handle image load error', async () => {
      const mockOnError = vi.fn()
      render(<LazyImage {...defaultProps} onError={mockOnError} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      // Simulate image load error
      if (mockImage.onerror) {
        mockImage.onerror()
      }
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalled()
      })
      
      global.Image = originalImage
    })

    it('should unobserve element after loading starts', () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockTarget = document.createElement('img')
      const mockEntry = {
        isIntersecting: true,
        target: mockTarget,
      }
      
      observerCallback([mockEntry])
      
      expect(mockUnobserve).toHaveBeenCalledWith(mockTarget)
    })

    it('should not load image when not intersecting', () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: false,
        target: document.createElement('img'),
      }
      
      const originalImage = global.Image
      const mockImageConstructor = vi.fn()
      global.Image = mockImageConstructor as any
      
      observerCallback([mockEntry])
      
      expect(mockImageConstructor).not.toHaveBeenCalled()
      
      global.Image = originalImage
    })
  })

  describe('Loading states', () => {
    it('should show image with full opacity when loaded', async () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      // Simulate successful load
      if (mockImage.onload) {
        mockImage.onload()
      }
      
      await waitFor(() => {
        const image = screen.getByAltText('Test image')
        expect(image).toHaveClass('opacity-100')
        expect(image).toHaveAttribute('src', defaultProps.src)
      })
      
      global.Image = originalImage
    })

    it('should hide loading spinner when image loads', async () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      if (mockImage.onload) {
        mockImage.onload()
      }
      
      await waitFor(() => {
        const loadingDiv = screen.queryByText('')?.closest('.animate-pulse')
        expect(loadingDiv).not.toBeInTheDocument()
      })
      
      global.Image = originalImage
    })
  })

  describe('Error handling', () => {
    it('should show error state when image fails to load', async () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      // Simulate error
      if (mockImage.onerror) {
        mockImage.onerror()
      }
      
      await waitFor(() => {
        const errorIcon = screen.getByRole('img', { hidden: true })
        expect(errorIcon).toBeInTheDocument()
      })
      
      global.Image = originalImage
    })

    it('should show error state styling', async () => {
      render(<LazyImage {...defaultProps} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      if (mockImage.onerror) {
        mockImage.onerror()
      }
      
      await waitFor(() => {
        const errorContainer = screen.getByRole('img', { hidden: true }).closest('.bg-gray-100')
        expect(errorContainer).toHaveClass(
          'absolute',
          'inset-0',
          'bg-gray-100',
          'flex',
          'items-center',
          'justify-center'
        )
      })
      
      global.Image = originalImage
    })
  })

  describe('Image attributes', () => {
    it('should have loading="lazy" attribute', () => {
      render(<LazyImage {...defaultProps} />)
      
      const image = screen.getByAltText('Test image')
      expect(image).toHaveAttribute('loading', 'lazy')
    })

    it('should maintain alt text', () => {
      render(<LazyImage {...defaultProps} alt="Custom alt text" />)
      
      expect(screen.getByAltText('Custom alt text')).toBeInTheDocument()
    })

    it('should apply transition classes', () => {
      render(<LazyImage {...defaultProps} />)
      
      const image = screen.getByAltText('Test image')
      expect(image).toHaveClass(
        'w-full',
        'h-full',
        'object-cover',
        'transition-opacity',
        'duration-300'
      )
    })
  })

  describe('Callback functions', () => {
    it('should call onLoad when image loads successfully', async () => {
      const mockOnLoad = vi.fn()
      render(<LazyImage {...defaultProps} onLoad={mockOnLoad} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      if (mockImage.onload) {
        mockImage.onload()
      }
      
      await waitFor(() => {
        expect(mockOnLoad).toHaveBeenCalledTimes(1)
      })
      
      global.Image = originalImage
    })

    it('should call onError when image fails to load', async () => {
      const mockOnError = vi.fn()
      render(<LazyImage {...defaultProps} onError={mockOnError} />)
      
      const observerCallback = mockIntersectionObserver.mock.calls[0][0]
      const mockEntry = {
        isIntersecting: true,
        target: document.createElement('img'),
      }
      
      const mockImage = {
        onload: null as any,
        onerror: null as any,
        src: '',
      }
      
      const originalImage = global.Image
      global.Image = vi.fn(() => mockImage) as any
      
      observerCallback([mockEntry])
      
      if (mockImage.onerror) {
        mockImage.onerror()
      }
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledTimes(1)
      })
      
      global.Image = originalImage
    })
  })
})