import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'

import MultiTagSearch from '../MultiTagSearch'

describe('MultiTagSearch', () => {
  const mockOnTagsChange = vi.fn()
  const allAvailableTags = ['Ethiopian', 'Colombian', 'Brazilian', 'Guatemalan', 'Kenyan']

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with placeholder', () => {
    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        placeholder="태그를 입력하세요"
      />
    )

    const input = screen.getByPlaceholderText('태그를 입력하세요')
    expect(input).toBeInTheDocument()
  })

  it('should render existing tags', () => {
    render(
      <MultiTagSearch
        tags={['Ethiopian', 'Colombian']}
        onTagsChange={mockOnTagsChange}
      />
    )

    expect(screen.getByText('Ethiopian')).toBeInTheDocument()
    expect(screen.getByText('Colombian')).toBeInTheDocument()
  })

  it('should add tag on Enter key', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Brazilian')
    await user.keyboard('{Enter}')

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Brazilian'])
  })

  it('should not add duplicate tags', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={['Ethiopian']}
        onTagsChange={mockOnTagsChange}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Ethiopian')
    await user.keyboard('{Enter}')

    expect(mockOnTagsChange).not.toHaveBeenCalled()
  })

  it('should not add empty tags', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    expect(mockOnTagsChange).not.toHaveBeenCalled()
  })

  it('should remove tag when X button is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={['Ethiopian', 'Colombian']}
        onTagsChange={mockOnTagsChange}
      />
    )

    const removeButtons = screen.getAllByText('×')
    await user.click(removeButtons[0])

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Colombian'])
  })

  it('should show autocomplete suggestions', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Eth')

    expect(screen.getByText('Ethiopian')).toBeInTheDocument()
  })

  it('should filter suggestions based on input', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Col')

    expect(screen.getByText('Colombian')).toBeInTheDocument()
    expect(screen.queryByText('Ethiopian')).not.toBeInTheDocument()
  })

  it('should exclude already selected tags from suggestions', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={['Ethiopian']}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'E')

    expect(screen.queryByText('Ethiopian')).not.toBeInTheDocument()
  })

  it('should add tag when suggestion is clicked', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Bra')

    const suggestion = screen.getByText('Brazilian')
    await user.click(suggestion)

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Brazilian'])
  })

  it('should clear input after adding tag', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
      />
    )

    const input = screen.getByRole('textbox') as HTMLInputElement
    await user.type(input, 'Brazilian')
    await user.keyboard('{Enter}')

    expect(input.value).toBe('')
  })

  it('should hide suggestions when input is empty', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Eth')
    expect(screen.getByText('Ethiopian')).toBeInTheDocument()

    await user.clear(input)
    expect(screen.queryByText('Ethiopian')).not.toBeInTheDocument()
  })

  it('should limit number of suggestions displayed', async () => {
    const user = userEvent.setup()
    const manyTags = Array.from({ length: 20 }, (_, i) => `Tag${i}`)

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={manyTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'Tag')

    const suggestions = screen.getAllByText(/^Tag\d+$/)
    expect(suggestions.length).toBeLessThanOrEqual(5) // Assuming max 5 suggestions
  })

  it('should handle keyboard navigation in suggestions', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'C')

    // Should show Colombian suggestion
    expect(screen.getByText('Colombian')).toBeInTheDocument()

    // Navigate with arrow keys and select with Enter
    await user.keyboard('{ArrowDown}{Enter}')

    expect(mockOnTagsChange).toHaveBeenCalledWith(['Colombian'])
  })

  it('should handle case-insensitive matching', async () => {
    const user = userEvent.setup()

    render(
      <MultiTagSearch
        tags={[]}
        onTagsChange={mockOnTagsChange}
        allAvailableTags={allAvailableTags}
      />
    )

    const input = screen.getByRole('textbox')
    await user.type(input, 'ethiopian')

    expect(screen.getByText('Ethiopian')).toBeInTheDocument()
  })
})