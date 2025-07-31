import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import LazyImage from '../LazyImage'

// Mock IntersectionObserver
const mockIntersectionObserver = vi.fn()
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
})
vi.stubGlobal('IntersectionObserver', mockIntersectionObserver)

describe('LazyImage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with placeholder initially', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholder="/placeholder.jpg"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/placeholder.jpg')
    expect(img).toHaveAttribute('alt', 'Test image')
  })

  it('should setup IntersectionObserver on mount', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    expect(mockIntersectionObserver).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        rootMargin: '50px',
        threshold: 0.1,
      })
    )
  })

  it('should apply custom className', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        className="custom-class"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveClass('custom-class')
  })

  it('should call onLoad when image loads successfully', () => {
    const mockOnLoad = vi.fn()
    
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        onLoad={mockOnLoad}
      />
    )

    const img = screen.getByRole('img')
    fireEvent.load(img)

    expect(mockOnLoad).toHaveBeenCalled()
  })

  it('should call onError when image fails to load', () => {
    const mockOnError = vi.fn()
    
    render(
      <LazyImage
        src="https://example.com/invalid-image.jpg"
        alt="Test image"
        onError={mockOnError}
      />
    )

    const img = screen.getByRole('img')
    fireEvent.error(img)

    expect(mockOnError).toHaveBeenCalled()
  })

  it('should use default placeholder when not provided', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/images/placeholder.jpg')
  })

  it('should handle intersection observer callback', () => {
    let intersectionCallback: IntersectionObserverCallback

    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
    })

    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    // Simulate intersection
    const mockEntry = {
      isIntersecting: true,
      target: screen.getByRole('img'),
    }

    intersectionCallback!([mockEntry] as IntersectionObserverEntry[], {} as IntersectionObserver)

    // Should load actual image when intersecting
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('data-loading', 'true')
  })

  it('should not load image when not intersecting', () => {
    let intersectionCallback: IntersectionObserverCallback

    mockIntersectionObserver.mockImplementation((callback) => {
      intersectionCallback = callback
      return {
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
      }
    })

    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholder="/placeholder.jpg"
      />
    )

    // Simulate no intersection
    const mockEntry = {
      isIntersecting: false,
      target: screen.getByRole('img'),
    }

    intersectionCallback!([mockEntry] as IntersectionObserverEntry[], {} as IntersectionObserver)

    // Should still show placeholder
    const img = screen.getByRole('img')
    expect(img).toHaveAttribute('src', '/placeholder.jpg')
  })

  it('should cleanup intersection observer on unmount', () => {
    const mockDisconnect = vi.fn()
    const mockUnobserve = vi.fn()

    mockIntersectionObserver.mockReturnValue({
      observe: vi.fn(),
      unobserve: mockUnobserve,
      disconnect: mockDisconnect,
    })

    const { unmount } = render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
      />
    )

    unmount()

    expect(mockDisconnect).toHaveBeenCalled()
  })

  it('should handle loading state transition', () => {
    render(
      <LazyImage
        src="https://example.com/image.jpg"
        alt="Test image"
        placeholder="/placeholder.jpg"
      />
    )

    const img = screen.getByRole('img')
    
    // Initially should show placeholder
    expect(img).toHaveAttribute('src', '/placeholder.jpg')
    expect(img).not.toHaveAttribute('data-loading')

    // After intersection, should be in loading state
    // (This would be tested with actual intersection simulation)
  })
})