import { useRouter, usePathname } from 'next/navigation'

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import Navigation from '../Navigation'

// Mock the AuthContext
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  level: 5,
  total_points: 1250
}

const mockAuthContext = {
  user: null,
  loading: false,
  logout: vi.fn(),
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  refreshProfile: vi.fn(),
}

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
}))

// Mock feature flags
vi.mock('../config/feature-flags.config', () => ({
  isFeatureEnabled: vi.fn((flag: string) => {
    if (flag === 'ENABLE_NEW_TASTING_FLOW') return true
    return false
  }),
}))

// Mock child components
vi.mock('./auth/AuthModal', () => ({
  default: ({ isOpen, onClose, onSuccess, initialMode }: any) => (
    isOpen ? (
      <div data-testid="auth-modal">
        <div>AuthModal - {initialMode}</div>
        <button onClick={onClose}>Close Modal</button>
        <button onClick={onSuccess}>Success</button>
      </div>
    ) : null
  ),
}))

vi.mock('./auth/UserProfile', () => ({
  default: () => <div data-testid="user-profile">UserProfile</div>,
}))

vi.mock('./GuestModeIndicator', () => ({
  NavigationGuestIndicator: ({ onLoginClick }: any) => (
    <button onClick={onLoginClick} data-testid="guest-indicator">
      Guest Login
    </button>
  ),
}))

// Mock next/navigation
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockBack = vi.fn()

vi.mocked(useRouter).mockReturnValue({
  push: mockPush,
  replace: mockReplace,
  back: mockBack,
  forward: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
})

vi.mocked(usePathname).mockReturnValue('/')

describe('Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockAuthContext.user = null
    mockAuthContext.loading = false
  })

  describe('Basic Rendering', () => {
    it('renders desktop navigation with logo', () => {
      render(<Navigation />)
      
      expect(screen.getByText('☕ CupNote')).toBeInTheDocument()
      expect(screen.getByRole('link', { name: '☕ CupNote' })).toHaveAttribute('href', '/')
    })

    it('renders mobile navigation for mobile viewport', () => {
      render(<Navigation />)
      
      // Desktop nav should be hidden on mobile (using CSS classes)
      const desktopNav = screen.getByText('☕ CupNote').closest('nav')
      expect(desktopNav).toHaveClass('hidden', 'md:block')
      
      // Mobile nav should be visible
      const mobileNavs = screen.getAllByRole('navigation')
      const mobileNav = mobileNavs.find(nav => nav.classList.contains('fixed'))
      expect(mobileNav).toHaveClass('fixed', 'bottom-0')
    })

    it('shows correct navigation items for guest users', () => {
      render(<Navigation />)
      
      // Should show home and login
      expect(screen.getByText('홈')).toBeInTheDocument()
      expect(screen.getByText('로그인')).toBeInTheDocument()
      expect(screen.getByTestId('guest-indicator')).toBeInTheDocument()
      
      // Should not show authenticated user items
      expect(screen.queryByText('내 기록')).not.toBeInTheDocument()
      expect(screen.queryByText('성취')).not.toBeInTheDocument()
    })

    it('shows correct navigation items for authenticated users', () => {
      mockAuthContext.user = mockUser
      render(<Navigation />)
      
      // Should show all navigation items
      expect(screen.getByText('홈')).toBeInTheDocument()
      expect(screen.getByText('내 기록')).toBeInTheDocument()
      expect(screen.getByText('작성')).toBeInTheDocument()
      expect(screen.getByText('성취')).toBeInTheDocument()
      
      // Should not show login button
      expect(screen.queryByText('로그인')).not.toBeInTheDocument()
    })

    it('shows loading state correctly', () => {
      mockAuthContext.loading = true
      render(<Navigation />)
      
      expect(screen.getByText('로딩...')).toBeInTheDocument()
      
      // Should show loading skeleton in desktop
      const loadingDiv = screen.getByText('로딩...').parentElement?.parentElement?.querySelector('.animate-pulse')
      expect(loadingDiv).toBeInTheDocument()
    })
  })

  describe('Back Button Functionality', () => {
    it('renders back button when showBackButton is true', () => {
      render(<Navigation showBackButton={true} />)
      
      expect(screen.getByText('돌아가기')).toBeInTheDocument()
      expect(screen.getByLabelText(/back/i)).toBeInTheDocument()
    })

    it('uses custom backHref when provided', async () => {
      const user = userEvent.setup()
      render(<Navigation showBackButton={true} backHref="/custom-back" />)
      
      const backButton = screen.getByText('돌아가기')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/custom-back')
    })

    it('calculates smart back href for tasting flow paths', async () => {
      const user = userEvent.setup()
      vi.mocked(usePathname).mockReturnValue('/tasting-flow/coffee-info')
      
      render(<Navigation showBackButton={true} />)
      
      const backButton = screen.getByText('돌아가기')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/tasting-flow')
    })

    it('defaults to home for unknown paths', async () => {
      const user = userEvent.setup()
      vi.mocked(usePathname).mockReturnValue('/unknown-path')
      
      render(<Navigation showBackButton={true} />)
      
      const backButton = screen.getByText('돌아가기')
      await user.click(backButton)
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Active Page Highlighting', () => {
    it('highlights correct page in desktop navigation', () => {
      mockAuthContext.user = mockUser
      render(<Navigation currentPage="my-records" />)
      
      const myRecordsLink = screen.getByRole('link', { name: /내 기록/ })
      expect(myRecordsLink).toHaveClass('bg-coffee-100/80', 'text-coffee-800')
      
      const achievementsLink = screen.getByRole('link', { name: /성취/ })
      expect(achievementsLink).toHaveClass('text-coffee-600')
    })

    it('highlights correct page in mobile navigation', () => {
      mockAuthContext.user = mockUser
      render(<Navigation currentPage="achievements" />)
      
      // Find mobile navigation items
      const homeLink = screen.getByText('홈').parentElement
      const achievementsLink = screen.getByText('성취').parentElement
      
      expect(homeLink).toHaveClass('text-coffee-400')
      expect(achievementsLink).toHaveClass('text-coffee-800')
    })
  })

  describe('User Profile Dropdown', () => {
    beforeEach(() => {
      mockAuthContext.user = mockUser
    })

    it('shows user profile button when authenticated', () => {
      render(<Navigation />)
      
      expect(screen.getByText(mockUser.username)).toBeInTheDocument()
      expect(screen.getByText(mockUser.email)).toBeInTheDocument()
    })

    it('toggles profile dropdown on click', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const profileButton = screen.getByText(mockUser.username).closest('button')
      expect(profileButton).toBeInTheDocument()
      
      // Initially dropdown should not be visible
      expect(screen.queryByText('내 프로필')).not.toBeInTheDocument()
      
      // Click to open dropdown
      await user.click(profileButton!)
      expect(screen.getByText('내 프로필')).toBeInTheDocument()
      expect(screen.getByText('도움말')).toBeInTheDocument()
      
      // Click again to close
      await user.click(profileButton!)
      expect(screen.queryByText('내 프로필')).not.toBeInTheDocument()
    })

    it('handles logout correctly', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Open dropdown
      const profileButton = screen.getByText(mockUser.username).closest('button')
      await user.click(profileButton!)
      
      // Click logout
      const logoutButton = screen.getByText('로그아웃')
      await user.click(logoutButton)
      
      expect(mockAuthContext.logout).toHaveBeenCalledTimes(1)
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Open dropdown
      const profileButton = screen.getByText(mockUser.username).closest('button')
      await user.click(profileButton!)
      expect(screen.getByText('내 프로필')).toBeInTheDocument()
      
      // Click outside (simulate mousedown event)
      fireEvent.mouseDown(document.body)
      
      await waitFor(() => {
        expect(screen.queryByText('내 프로필')).not.toBeInTheDocument()
      })
    })
  })

  describe('Authentication Modal', () => {
    it('opens login modal when guest clicks login', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const loginButton = screen.getByText('로그인')
      await user.click(loginButton)
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      expect(screen.getByText('AuthModal - login')).toBeInTheDocument()
    })

    it('opens signup modal when guest clicks signup', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const signupButton = screen.getByText('회원가입')
      await user.click(signupButton)
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      expect(screen.getByText('AuthModal - signup')).toBeInTheDocument()
    })

    it('opens login modal from guest indicator', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const guestIndicator = screen.getByTestId('guest-indicator')
      await user.click(guestIndicator)
      
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      expect(screen.getByText('AuthModal - login')).toBeInTheDocument()
    })

    it('closes modal when onClose is called', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Open modal
      const loginButton = screen.getByText('로그인')
      await user.click(loginButton)
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      
      // Close modal
      const closeButton = screen.getByText('Close Modal')
      await user.click(closeButton)
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })

    it('closes modal on successful authentication', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      // Open modal
      const loginButton = screen.getByText('로그인')
      await user.click(loginButton)
      expect(screen.getByTestId('auth-modal')).toBeInTheDocument()
      
      // Trigger success
      const successButton = screen.getByText('Success')
      await user.click(successButton)
      expect(screen.queryByTestId('auth-modal')).not.toBeInTheDocument()
    })
  })

  describe('Navigation Links', () => {
    it('has correct href for record button', () => {
      render(<Navigation />)
      
      const recordLinks = screen.getAllByRole('link').filter(link => 
        link.textContent?.includes('기록하기') || link.textContent?.includes('작성')
      )
      
      // Should link to tasting flow since feature flag is enabled
      recordLinks.forEach(link => {
        expect(link).toHaveAttribute('href', '/tasting-flow')
      })
    })

    it('shows correct navigation structure for different user states', () => {
      // Test guest user
      render(<Navigation />)
      expect(screen.getAllByRole('navigation')).toHaveLength(2) // Desktop + Mobile
      
      // Test authenticated user
      mockAuthContext.user = mockUser
      render(<Navigation />)
      expect(screen.getAllByRole('navigation')).toHaveLength(2) // Same structure
    })
  })

  describe('Responsive Behavior', () => {
    it('applies correct CSS classes for responsive design', () => {
      render(<Navigation />)
      
      // Desktop nav should be hidden on mobile
      const desktopNav = screen.getByText('☕ CupNote').closest('nav')
      expect(desktopNav).toHaveClass('hidden', 'md:block')
      
      // Mobile nav should be fixed at bottom
      const mobileNavs = screen.getAllByRole('navigation')
      const mobileNav = mobileNavs.find(nav => nav.classList.contains('fixed'))
      expect(mobileNav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0', 'md:hidden')
    })

    it('adjusts mobile grid layout based on user authentication', () => {
      // Guest user - 2 columns
      render(<Navigation />)
      let mobileNavs = screen.getAllByRole('navigation')
      let mobileNav = mobileNavs.find(nav => nav.classList.contains('fixed'))
      let gridContainer = mobileNav?.querySelector('div')
      expect(gridContainer).toHaveClass('grid-cols-2')
      
      // Authenticated user - 4 columns
      mockAuthContext.user = mockUser
      render(<Navigation />)
      mobileNavs = screen.getAllByRole('navigation')
      mobileNav = mobileNavs.find(nav => nav.classList.contains('fixed'))
      gridContainer = mobileNav?.querySelector('div')
      expect(gridContainer).toHaveClass('grid-cols-4')
    })
  })

  describe('Error Handling', () => {
    it('handles logout error gracefully', async () => {
      const user = userEvent.setup()
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      mockAuthContext.user = mockUser
      mockAuthContext.logout.mockRejectedValue(new Error('Logout failed'))
      
      render(<Navigation />)
      
      // Open dropdown and logout
      const profileButton = screen.getByText(mockUser.username).closest('button')
      await user.click(profileButton!)
      
      const logoutButton = screen.getByText('로그아웃')
      await user.click(logoutButton)
      
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('로그아웃 오류:', expect.any(Error))
      })
      
      consoleErrorSpy.mockRestore()
    })
  })
})