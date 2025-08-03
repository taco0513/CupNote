import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import CoffeeRecordForm from '../CoffeeRecordForm'

describe('CoffeeRecordForm', () => {
  const mockOnClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly with default values', () => {
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Check if main elements are rendered
    expect(screen.getByText('새 커피 기록')).toBeInTheDocument()
    expect(screen.getByLabelText('커피 이름 *')).toBeInTheDocument()
    expect(screen.getByLabelText('로스터리')).toBeInTheDocument()
    expect(screen.getByLabelText('날짜')).toBeInTheDocument()
    expect(screen.getByText('어떻게 기록하시겠어요?')).toBeInTheDocument()

    // Check default mode selection
    expect(screen.getByText('🌱 편하게 쓰기')).toHaveClass('border-coffee-600', 'bg-coffee-50')
    expect(screen.getByText('🎯 전문가처럼')).toHaveClass('border-gray-300')

    // Check default date is today
    const today = new Date().toISOString().split('T')[0]
    expect(screen.getByDisplayValue(today)).toBeInTheDocument()
  })

  it('handles taste mode switching correctly', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    const simpleMode = screen.getByText('🌱 편하게 쓰기')
    const professionalMode = screen.getByText('🎯 전문가처럼')

    // Initially simple mode should be selected
    expect(simpleMode).toHaveClass('border-coffee-600', 'bg-coffee-50')
    expect(professionalMode).toHaveClass('border-gray-300')

    // Switch to professional mode
    await user.click(professionalMode)
    
    expect(professionalMode).toHaveClass('border-coffee-600', 'bg-coffee-50')
    expect(simpleMode).toHaveClass('border-gray-300')

    // Check if textarea placeholder changes
    expect(screen.getByText('테이스팅 노트')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 자몽, 베르가못, 꿀, 밝은 산미')).toBeInTheDocument()

    // Switch back to simple mode
    await user.click(simpleMode)
    
    expect(simpleMode).toHaveClass('border-coffee-600', 'bg-coffee-50')
    expect(professionalMode).toHaveClass('border-gray-300')

    // Check if textarea label and placeholder change back
    expect(screen.getByText('어떤 맛이었나요?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('예: 새콤달콤한 사탕 같았어요. 차가워지니까 더 달았어요.')).toBeInTheDocument()
  })

  it('handles form input changes correctly', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Test coffee name input
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    await user.type(coffeeNameInput, '에티오피아 예가체프')
    expect(coffeeNameInput).toHaveValue('에티오피아 예가체프')

    // Test roastery input
    const roasteryInput = screen.getByLabelText('로스터리')
    await user.type(roasteryInput, '블루보틀')
    expect(roasteryInput).toHaveValue('블루보틀')

    // Test date input
    const dateInput = screen.getByLabelText('날짜')
    await user.clear(dateInput)
    await user.type(dateInput, '2023-12-01')
    expect(dateInput).toHaveValue('2023-12-01')

    // Test taste textarea
    const tasteTextarea = screen.getByLabelText('어떤 맛이었나요?')
    await user.type(tasteTextarea, '새콤달콤한 사탕맛')
    expect(tasteTextarea).toHaveValue('새콤달콤한 사탕맛')

    // Test roaster note input
    const roasterNoteInput = screen.getByLabelText('로스터는 뭐라고 했나요? (선택)')
    await user.type(roasterNoteInput, '블루베리, 다크초콜릿')
    expect(roasterNoteInput).toHaveValue('블루베리, 다크초콜릿')

    // Test memo textarea
    const memoTextarea = screen.getByLabelText('메모 (선택)')
    await user.type(memoTextarea, '친구와 함께 마셨어요')
    expect(memoTextarea).toHaveValue('친구와 함께 마셨어요')
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    const closeButton = screen.getByText('✕')
    await user.click(closeButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    const cancelButton = screen.getByText('취소')
    await user.click(cancelButton)

    expect(mockOnClose).toHaveBeenCalledTimes(1)
  })

  it('handles form submission correctly', async () => {
    const user = userEvent.setup()
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Fill required field
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    await user.type(coffeeNameInput, '에티오피아 예가체프')

    // Fill optional fields
    const roasteryInput = screen.getByLabelText('로스터리')
    await user.type(roasteryInput, '블루보틀')

    const tasteTextarea = screen.getByLabelText('어떤 맛이었나요?')
    await user.type(tasteTextarea, '새콤달콤한 맛')

    // Submit form
    const submitButton = screen.getByText('기록하기')
    await user.click(submitButton)

    // Check if console.log was called with correct data
    expect(consoleSpy).toHaveBeenCalledWith('커피 기록:', expect.objectContaining({
      coffeeName: '에티오피아 예가체프',
      roastery: '블루보틀',
      taste: '새콤달콤한 맛',
      tasteMode: 'simple',
      date: expect.any(String),
    }))

    // Check if onClose was called
    expect(mockOnClose).toHaveBeenCalledTimes(1)

    consoleSpy.mockRestore()
  })

  it('prevents form submission without required fields', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    const submitButton = screen.getByText('기록하기')
    await user.click(submitButton)

    // onClose should not be called if validation fails
    expect(mockOnClose).not.toHaveBeenCalled()
  })

  it('maintains form data when switching between modes', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Fill form data
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    await user.type(coffeeNameInput, '에티오피아 예가체프')

    const tasteTextarea = screen.getByLabelText('어떤 맛이었나요?')
    await user.type(tasteTextarea, '새콤달콤한 맛')

    // Switch to professional mode
    const professionalMode = screen.getByText('🎯 전문가처럼')
    await user.click(professionalMode)

    // Check if data is preserved
    expect(coffeeNameInput).toHaveValue('에티오피아 예가체프')
    
    // The textarea should now have label "테이스팅 노트" but same value
    const updatedTasteTextarea = screen.getByLabelText('테이스팅 노트')
    expect(updatedTasteTextarea).toHaveValue('새콤달콤한 맛')

    // Switch back to simple mode
    const simpleMode = screen.getByText('🌱 편하게 쓰기')
    await user.click(simpleMode)

    // Data should still be preserved
    expect(coffeeNameInput).toHaveValue('에티오피아 예가체프')
    
    const finalTasteTextarea = screen.getByLabelText('어떤 맛이었나요?')
    expect(finalTasteTextarea).toHaveValue('새콤달콤한 맛')
  })

  it('has correct form structure and accessibility', () => {
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Check form element exists
    const form = screen.getByRole('form', { hidden: true })
    expect(form).toBeInTheDocument()

    // Check required field has required attribute
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    expect(coffeeNameInput).toBeRequired()

    // Check all input types are correct
    expect(coffeeNameInput).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('로스터리')).toHaveAttribute('type', 'text')
    expect(screen.getByLabelText('날짜')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('로스터는 뭐라고 했나요? (선택)')).toHaveAttribute('type', 'text')

    // Check textareas have correct rows
    expect(screen.getByLabelText('어떤 맛이었나요?')).toHaveAttribute('rows', '4')
    expect(screen.getByLabelText('메모 (선택)')).toHaveAttribute('rows', '3')

    // Check buttons have correct types
    expect(screen.getByText('취소')).toHaveAttribute('type', 'button')
    expect(screen.getByText('기록하기')).toHaveAttribute('type', 'submit')
  })

  it('applies correct CSS classes for styling', () => {
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Check main container
    const container = screen.getByText('새 커피 기록').parentElement?.parentElement
    expect(container).toHaveClass('p-6')

    // Check title styling
    expect(screen.getByText('새 커피 기록')).toHaveClass('text-2xl', 'font-bold', 'text-coffee-800')

    // Check input styling
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    expect(coffeeNameInput).toHaveClass('w-full', 'px-3', 'py-2', 'border', 'border-gray-300', 'rounded-lg')

    // Check selected mode button styling
    const selectedModeButton = screen.getByText('🌱 편하게 쓰기')
    expect(selectedModeButton).toHaveClass('border-coffee-600', 'bg-coffee-50', 'text-coffee-800')

    // Check submit button styling
    const submitButton = screen.getByText('기록하기')
    expect(submitButton).toHaveClass('bg-coffee-600', 'text-white', 'hover:bg-coffee-700')
  })

  it('handles edge cases and validation correctly', async () => {
    const user = userEvent.setup()
    render(<CoffeeRecordForm onClose={mockOnClose} />)

    // Test with very long input
    const coffeeNameInput = screen.getByLabelText('커피 이름 *')
    const longText = 'a'.repeat(1000)
    await user.type(coffeeNameInput, longText)
    expect(coffeeNameInput).toHaveValue(longText)

    // Test with special characters
    await user.clear(coffeeNameInput)
    await user.type(coffeeNameInput, '커피 이름 with 특수문자 !@#$%^&*()')
    expect(coffeeNameInput).toHaveValue('커피 이름 with 특수문자 !@#$%^&*()')

    // Test date input with invalid format (should be handled by browser)
    const dateInput = screen.getByLabelText('날짜')
    expect(dateInput).toHaveAttribute('type', 'date')
  })
})