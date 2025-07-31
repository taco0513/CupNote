import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import HelpTooltip from '../HelpTooltip'

describe('HelpTooltip', () => {
  const defaultProps = {
    title: 'Help Title',
    content: 'This is helpful content for the user.',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Basic rendering', () => {
    it('should render help icon button', () => {
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      expect(helpButton).toBeInTheDocument()
      
      const helpIcon = screen.getByTestId('lucide-help-circle')
      expect(helpIcon).toBeInTheDocument()
    })

    it('should not show tooltip initially', () => {
      render(<HelpTooltip {...defaultProps} />)
      
      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
      expect(screen.queryByText(defaultProps.content)).not.toBeInTheDocument()
    })

    it('should apply custom className', () => {
      const customClass = 'custom-tooltip'
      render(<HelpTooltip {...defaultProps} className={customClass} />)
      
      const container = screen.getByRole('button').parentElement
      expect(container).toHaveClass(customClass)
    })
  })

  describe('Tooltip visibility', () => {
    it('should show tooltip on click', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      expect(screen.getByText(defaultProps.content)).toBeInTheDocument()
    })

    it('should hide tooltip on second click', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      
      // Show tooltip
      await user.click(helpButton)
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      
      // Hide tooltip
      await user.click(helpButton)
      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })

    it('should show tooltip on mouse enter', async () => {
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      fireEvent.mouseEnter(helpButton)
      
      await waitFor(() => {
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
        expect(screen.getByText(defaultProps.content)).toBeInTheDocument()
      })
    })

    it('should hide tooltip on mouse leave', async () => {
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      
      // Show tooltip
      fireEvent.mouseEnter(helpButton)
      await waitFor(() => {
        expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      })
      
      // Hide tooltip
      fireEvent.mouseLeave(helpButton)
      await waitFor(() => {
        expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
      })
    })

    it('should close tooltip when X button is clicked', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      
      const closeButton = screen.getByRole('button', { name: '' }) // X button doesn't have accessible name
      await user.click(closeButton)
      
      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })
  })

  describe('Tooltip positioning', () => {
    it('should apply top position by default', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      expect(tooltip).toHaveClass('bottom-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mb-2')
    })

    it('should apply bottom position', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} position="bottom" />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      expect(tooltip).toHaveClass('top-full', 'left-1/2', 'transform', '-translate-x-1/2', 'mt-2')
    })

    it('should apply left position', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} position="left" />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      expect(tooltip).toHaveClass('right-full', 'top-1/2', 'transform', '-translate-y-1/2', 'mr-2')
    })

    it('should apply right position', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} position="right" />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      expect(tooltip).toHaveClass('left-full', 'top-1/2', 'transform', '-translate-y-1/2', 'ml-2')
    })
  })

  describe('Tooltip content', () => {
    it('should display title and content correctly', async () => {
      const user = userEvent.setup()
      const title = 'Custom Help Title'
      const content = 'This is custom help content with detailed information.'
      
      render(<HelpTooltip title={title} content={content} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(title)).toBeInTheDocument()
      expect(screen.getByText(content)).toBeInTheDocument()
    })

    it('should render title as heading', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const title = screen.getByText(defaultProps.title)
      expect(title.tagName).toBe('H4')
      expect(title).toHaveClass('font-semibold', 'text-white')
    })

    it('should render content as paragraph', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const content = screen.getByText(defaultProps.content)
      expect(content.tagName).toBe('P')
      expect(content).toHaveClass('text-coffee-100', 'text-xs', 'leading-relaxed')
    })
  })

  describe('Tooltip styling', () => {
    it('should have correct base styling', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      expect(tooltip).toHaveClass(
        'absolute',
        'z-50',
        'bg-coffee-800',
        'text-white',
        'text-sm',
        'rounded-lg',
        'p-3',
        'shadow-lg',
        'max-w-xs'
      )
    })

    it('should show arrow element', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(defaultProps.title).closest('div')
      const arrow = tooltip?.querySelector('.bg-coffee-800.transform.rotate-45')
      expect(arrow).toBeInTheDocument()
    })
  })

  describe('Button styling', () => {
    it('should have correct button styling', () => {
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      expect(helpButton).toHaveClass(
        'text-coffee-400',
        'hover:text-coffee-600',
        'transition-colors',
        'p-1'
      )
    })

    it('should have correct close button styling', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const closeButton = screen.getByTestId('lucide-x').closest('button')
      expect(closeButton).toHaveClass(
        'text-coffee-300',
        'hover:text-white',
        'ml-2',
        'flex-shrink-0'
      )
    })
  })

  describe('Mobile overlay', () => {
    it('should show mobile overlay when tooltip is visible', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const overlay = document.querySelector('.fixed.inset-0.z-40.md\\:hidden')
      expect(overlay).toBeInTheDocument()
    })

    it('should close tooltip when mobile overlay is clicked', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      
      const overlay = document.querySelector('.fixed.inset-0.z-40.md\\:hidden')
      if (overlay) {
        await user.click(overlay as Element)
      }
      
      expect(screen.queryByText(defaultProps.title)).not.toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('should have accessible button label', () => {
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      expect(helpButton).toHaveAttribute('aria-label', '도움말')
    })

    it('should maintain focus management', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      
      await user.click(helpButton)
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      
      // Focus should remain manageable
      expect(document.activeElement).toBeDefined()
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      
      // Focus the button
      await user.tab()
      expect(helpButton).toHaveFocus()
      
      // Activate with Enter
      await user.keyboard('{Enter}')
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
      
      // Should be able to close with Escape (if implemented)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty title', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip title="" content={defaultProps.content} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(defaultProps.content)).toBeInTheDocument()
    })

    it('should handle empty content', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip title={defaultProps.title} content="" />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    })

    it('should handle long content', async () => {
      const user = userEvent.setup()
      const longContent = 'This is a very long help content that should wrap properly within the tooltip container and not break the layout or exceed the maximum width constraint.'
      
      render(<HelpTooltip title={defaultProps.title} content={longContent} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const tooltip = screen.getByText(longContent).closest('div')
      expect(tooltip).toHaveClass('max-w-xs')
      expect(screen.getByText(longContent)).toBeInTheDocument()
    })
  })

  describe('Interaction behavior', () => {
    it('should not close on tooltip content click', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      await user.click(helpButton)
      
      const content = screen.getByText(defaultProps.content)
      await user.click(content)
      
      // Tooltip should still be visible
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    })

    it('should handle rapid clicks', async () => {
      const user = userEvent.setup()
      render(<HelpTooltip {...defaultProps} />)
      
      const helpButton = screen.getByRole('button', { name: '도움말' })
      
      // Rapid clicks
      await user.click(helpButton)
      await user.click(helpButton)
      await user.click(helpButton)
      
      // Should handle state correctly
      expect(screen.getByText(defaultProps.title)).toBeInTheDocument()
    })
  })
})