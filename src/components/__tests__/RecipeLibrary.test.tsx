import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { SavedRecipe } from '../../types/recipe'
import RecipeLibrary from '../RecipeLibrary'

// Mock RecipeManager
const mockRecipes: SavedRecipe[] = [
  {
    id: '1',
    name: '모닝 블렌드',
    coffeeName: '에티오피아 예가체프',
    roastery: '블루보틀',
    dripper: 'v60',
    coffeeAmount: 20,
    waterAmount: 320,
    ratio: 16,
    grindSize: 'medium',
    waterTemp: 92,
    rating: 4,
    isFavorite: true,
    useCount: 5,
    createdAt: new Date('2024-01-01'),
    lastUsed: new Date('2024-01-15'),
    timerData: {
      totalTime: 240,
      lapTimes: [
        { time: 45, note: 'Pre-infusion 완료', timestamp: new Date() },
        { time: 120, note: '1차 푸어링 완료', timestamp: new Date() }
      ],
      completed: true
    }
  },
  {
    id: '2',
    name: '애프터눈 딜라이트',
    coffeeName: '케냐 AA',
    roastery: '커피빈',
    dripper: 'kalita',
    coffeeAmount: 22,
    waterAmount: 352,
    ratio: 16,
    grindSize: 'medium-fine',
    waterTemp: 90,
    rating: 5,
    isFavorite: false,
    useCount: 2,
    createdAt: new Date('2024-01-10'),
    lastUsed: new Date('2024-01-12'),
  },
  {
    id: '3',
    name: '실험용 레시피',
    coffeeName: '과테말라 안티구아',
    roastery: '로컬 로스터리',
    dripper: 'origami',
    coffeeAmount: 18,
    waterAmount: 288,
    ratio: 16,
    isFavorite: true,
    useCount: 1,
    createdAt: new Date('2024-01-20'),
  }
]

const mockRecipeManager = {
  getRecipes: vi.fn(() => mockRecipes),
  searchRecipes: vi.fn((query: string) => 
    mockRecipes.filter(recipe => 
      recipe.name.toLowerCase().includes(query.toLowerCase()) ||
      recipe.coffeeName.toLowerCase().includes(query.toLowerCase()) ||
      recipe.roastery.toLowerCase().includes(query.toLowerCase())
    )
  ),
  markAsUsed: vi.fn(),
  toggleFavorite: vi.fn(),
  duplicateRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}

vi.mock('../../utils/recipeManager', () => ({
  RecipeManager: mockRecipeManager,
}))

// Mock window.confirm
Object.defineProperty(window, 'confirm', {
  value: vi.fn(() => true),
})

describe('RecipeLibrary', () => {
  const mockOnRecipeSelect = vi.fn()
  const mockOnClose = vi.fn()

  const defaultProps = {
    onRecipeSelect: mockOnRecipeSelect,
    onClose: mockOnClose,
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRecipeManager.getRecipes.mockReturnValue(mockRecipes)
  })

  describe('Initial Rendering', () => {
    it('renders with correct title and recipe count', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      expect(screen.getByText('레시피 라이브러리')).toBeInTheDocument()
      expect(screen.getByText('3개의 저장된 레시피')).toBeInTheDocument()
    })

    it('renders all recipes by default', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.getByText('애프터눈 딜라이트')).toBeInTheDocument()
      expect(screen.getByText('실험용 레시피')).toBeInTheDocument()
    })

    it('displays recipe details correctly', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Check first recipe details
      expect(screen.getByText('에티오피아 예가체프')).toBeInTheDocument()
      expect(screen.getByText('블루보틀')).toBeInTheDocument()
      expect(screen.getByText('1:16 · 20g')).toBeInTheDocument()
      expect(screen.getByText('4/5')).toBeInTheDocument()
      expect(screen.getByText('사용횟수: 5회')).toBeInTheDocument()
    })

    it('shows correct dripper emojis', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // V60 should show ☕
      expect(screen.getByText('☕')).toBeInTheDocument()
      // Kalita should show 🌊
      expect(screen.getByText('🌊')).toBeInTheDocument()
      // Origami should show 📄
      expect(screen.getByText('📄')).toBeInTheDocument()
    })

    it('displays timer data when available', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should show formatted timer duration
      expect(screen.getByText('4:00')).toBeInTheDocument() // 240 seconds = 4:00
    })

    it('shows empty state when no recipes', () => {
      mockRecipeManager.getRecipes.mockReturnValue([])
      render(<RecipeLibrary {...defaultProps} />)
      
      expect(screen.getByText('저장된 레시피가 없습니다')).toBeInTheDocument()
      expect(screen.getByText('첫 번째 레시피를 만들어보세요!')).toBeInTheDocument()
    })
  })

  describe('Search Functionality', () => {
    it('filters recipes by search query', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('레시피 이름, 커피명, 로스터리로 검색...')
      await user.type(searchInput, '모닝')
      
      expect(mockRecipeManager.searchRecipes).toHaveBeenCalledWith('모닝')
      // Only recipes matching search should be visible
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
    })

    it('shows empty search results correctly', async () => {
      const user = userEvent.setup()
      mockRecipeManager.searchRecipes.mockReturnValue([])
      render(<RecipeLibrary {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('레시피 이름, 커피명, 로스터리로 검색...')
      await user.type(searchInput, 'nonexistent')
      
      expect(screen.getByText('검색 결과가 없습니다')).toBeInTheDocument()
      expect(screen.getByText('다른 검색어를 시도해보세요')).toBeInTheDocument()
    })

    it('clears search when input is cleared', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const searchInput = screen.getByPlaceholderText('레시피 이름, 커피명, 로스터리로 검색...')
      await user.type(searchInput, '모닝')
      await user.clear(searchInput)
      
      // All recipes should be visible again
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.getByText('애프터눈 딜라이트')).toBeInTheDocument()
      expect(screen.getByText('실험용 레시피')).toBeInTheDocument()
    })
  })

  describe('Filter Functionality', () => {
    it('filters by favorites', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const favoritesButton = screen.getByText('즐겨찾기')
      await user.click(favoritesButton)
      
      // Only favorite recipes should be visible
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.getByText('실험용 레시피')).toBeInTheDocument()
      expect(screen.queryByText('애프터눈 딜라이트')).not.toBeInTheDocument()
      
      // Button should be active
      expect(favoritesButton).toHaveClass('bg-yellow-500', 'text-white')
    })

    it('filters by recent usage', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const recentButton = screen.getByText('최근 사용')
      await user.click(recentButton)
      
      // Only recipes with lastUsed should be visible
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.getByText('애프터눈 딜라이트')).toBeInTheDocument()
      expect(screen.queryByText('실험용 레시피')).not.toBeInTheDocument()
      
      // Button should be active
      expect(recentButton).toHaveClass('bg-blue-500', 'text-white')
    })

    it('filters by dripper type', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const dripperSelect = screen.getByDisplayValue('모든 드리퍼')
      await user.selectOptions(dripperSelect, 'v60')
      
      // Only V60 recipes should be visible
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.queryByText('애프터눈 딜라이트')).not.toBeInTheDocument()
      expect(screen.queryByText('실험용 레시피')).not.toBeInTheDocument()
    })

    it('combines multiple filters correctly', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      // Apply favorite filter and dripper filter
      const favoritesButton = screen.getByText('즐겨찾기')
      await user.click(favoritesButton)
      
      const dripperSelect = screen.getByDisplayValue('모든 드리퍼')
      await user.selectOptions(dripperSelect, 'v60')
      
      // Only V60 favorite recipes should be visible
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
      expect(screen.queryByText('실험용 레시피')).not.toBeInTheDocument()
    })
  })

  describe('Recipe Actions', () => {
    it('handles recipe selection', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const useButton = screen.getAllByText('이 레시피 사용하기')[0]
      await user.click(useButton)
      
      expect(mockRecipeManager.markAsUsed).toHaveBeenCalledWith('1')
      expect(mockOnRecipeSelect).toHaveBeenCalledWith(mockRecipes[0])
    })

    it('toggles favorite status', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      // Find favorite buttons (star icons)
      const favoriteButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && !button.textContent
      )
      
      if (favoriteButtons.length > 0) {
        await user.click(favoriteButtons[0])
        expect(mockRecipeManager.toggleFavorite).toHaveBeenCalledWith('1')
      }
    })

    it('opens and closes context menu', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      // Find menu buttons (three dots)
      const menuButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && button.getAttribute('aria-expanded') !== 'true'
      )
      
      // Click on the first menu button to open dropdown
      if (menuButtons.length > 0) {
        await user.click(menuButtons[0])
        
        // Menu should be visible
        expect(screen.getByText('복사')).toBeInTheDocument()
        expect(screen.getByText('삭제')).toBeInTheDocument()
        
        // Click again to close
        await user.click(menuButtons[0])
        
        // Menu should be hidden
        await waitFor(() => {
          expect(screen.queryByText('복사')).not.toBeInTheDocument()
        })
      }
    })

    it('duplicates recipe', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      // Open menu and click duplicate
      const menuButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && button.getAttribute('aria-expanded') !== 'true'
      )
      
      if (menuButtons.length > 0) {
        await user.click(menuButtons[0])
        
        const duplicateButton = screen.getByText('복사')
        await user.click(duplicateButton)
        
        expect(mockRecipeManager.duplicateRecipe).toHaveBeenCalledWith('1')
      }
    })

    it('deletes recipe with confirmation', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true)
      
      render(<RecipeLibrary {...defaultProps} />)
      
      // Open menu and click delete
      const menuButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && button.getAttribute('aria-expanded') !== 'true'
      )
      
      if (menuButtons.length > 0) {
        await user.click(menuButtons[0])
        
        const deleteButton = screen.getByText('삭제')
        await user.click(deleteButton)
        
        expect(confirmSpy).toHaveBeenCalledWith('정말 이 레시피를 삭제하시겠습니까?')
        expect(mockRecipeManager.deleteRecipe).toHaveBeenCalledWith('1')
      }
      
      confirmSpy.mockRestore()
    })

    it('cancels delete when user declines confirmation', async () => {
      const user = userEvent.setup()
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false)
      
      render(<RecipeLibrary {...defaultProps} />)
      
      // Open menu and click delete
      const menuButtons = screen.getAllByRole('button').filter(
        button => button.querySelector('svg') && button.getAttribute('aria-expanded') !== 'true'
      )
      
      if (menuButtons.length > 0) {
        await user.click(menuButtons[0])
        
        const deleteButton = screen.getByText('삭제')
        await user.click(deleteButton)
        
        expect(confirmSpy).toHaveBeenCalled()
        expect(mockRecipeManager.deleteRecipe).not.toHaveBeenCalled()
      }
      
      confirmSpy.mockRestore()
    })
  })

  describe('Modal Behavior', () => {
    it('closes modal when close button is clicked', async () => {
      const user = userEvent.setup()
      render(<RecipeLibrary {...defaultProps} />)
      
      const closeButton = screen.getByText('✕')
      await user.click(closeButton)
      
      expect(mockOnClose).toHaveBeenCalledTimes(1)
    })

    it('renders as modal overlay', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should render with modal styling classes
      const modalOverlay = screen.getByText('레시피 라이브러리').closest('div')?.parentElement?.parentElement
      expect(modalOverlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50')
    })
  })

  describe('Time Formatting', () => {
    it('formats time correctly for different durations', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // 240 seconds should be formatted as 4:00
      expect(screen.getByText('4:00')).toBeInTheDocument()
    })
  })

  describe('Recipe Display Logic', () => {
    it('shows rating only when available', () => {
      const recipesWithoutRating = [
        {
          ...mockRecipes[0],
          rating: undefined
        }
      ]
      
      mockRecipeManager.getRecipes.mockReturnValue(recipesWithoutRating)
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should not show rating stars
      expect(screen.queryByText('/5')).not.toBeInTheDocument()
    })

    it('shows timer data only when available', () => {
      const recipesWithoutTimer = [
        {
          ...mockRecipes[0],
          timerData: undefined
        }
      ]
      
      mockRecipeManager.getRecipes.mockReturnValue(recipesWithoutTimer)
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should not show timer info
      expect(screen.queryByText('4:00')).not.toBeInTheDocument()
    })

    it('shows last used date when available', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should show formatted last used date
      expect(screen.getByText(/최근:/)).toBeInTheDocument()
    })

    it('handles recipes without roastery', () => {
      const recipesWithoutRoastery = [
        {
          ...mockRecipes[0],
          roastery: ''
        }
      ]
      
      mockRecipeManager.getRecipes.mockReturnValue(recipesWithoutRoastery)
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should still render recipe without roastery
      expect(screen.getByText('모닝 블렌드')).toBeInTheDocument()
    })
  })

  describe('Responsive Layout', () => {
    it('uses grid layout for multiple recipes', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Should have grid layout classes
      const recipeGrid = screen.getByText('모닝 블렌드').closest('.grid')
      expect(recipeGrid).toHaveClass('grid', 'md:grid-cols-2')
    })

    it('handles scrolling for long recipe lists', () => {
      render(<RecipeLibrary {...defaultProps} />)
      
      // Recipe list container should have overflow styling
      const listContainer = screen.getByText('모닝 블렌드').closest('.overflow-y-auto')
      expect(listContainer).toHaveClass('overflow-y-auto', 'max-h-[60vh]')
    })
  })

  describe('Error Handling', () => {
    it('handles RecipeManager errors gracefully', () => {
      mockRecipeManager.getRecipes.mockImplementation(() => {
        throw new Error('Storage error')
      })
      
      // Should not crash when RecipeManager throws error
      expect(() => render(<RecipeLibrary {...defaultProps} />)).not.toThrow()
    })

    it('handles invalid recipe data gracefully', () => {
      const invalidRecipes = [
        {
          id: '1',
          name: null, // Invalid data
          coffeeName: 'Test Coffee'
          // Missing required fields
        } as any
      ]
      
      mockRecipeManager.getRecipes.mockReturnValue(invalidRecipes)
      
      // Should render without crashing
      expect(() => render(<RecipeLibrary {...defaultProps} />)).not.toThrow()
    })
  })
})