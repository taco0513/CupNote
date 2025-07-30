export const isTouchDevice = () => {
  if (typeof window === 'undefined') return false
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  )
}

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

// Prevent mobile browser zoom on input focus
export const preventZoomOnFocus = () => {
  if (typeof window === 'undefined') return

  const viewport = document.querySelector('meta[name="viewport"]')
  if (viewport) {
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
    )
  }
}

// Add touch feedback class
export const addTouchFeedback = (element: HTMLElement) => {
  element.addEventListener('touchstart', () => {
    element.classList.add('touch-active')
  })

  element.addEventListener('touchend', () => {
    setTimeout(() => {
      element.classList.remove('touch-active')
    }, 150)
  })
}

// Smooth scroll with touch momentum
export const enableSmoothScroll = (element: HTMLElement) => {
  ;(element.style as any).webkitOverflowScrolling = 'touch'
  element.style.overflowY = 'auto'
}
