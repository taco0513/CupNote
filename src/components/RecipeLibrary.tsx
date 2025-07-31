'use client'

import { useState, useEffect } from 'react'
import { 
  BookOpen, 
  Star, 
  Search, 
  Filter, 
  Clock,
  Coffee,
  Heart,
  MoreVertical,
  Copy,
  Trash2,
  Play
} from 'lucide-react'
import { SavedRecipe } from '../types/recipe'
import { RecipeManager } from '../utils/recipeManager'

interface RecipeLibraryProps {
  onRecipeSelect: (recipe: SavedRecipe) => void
  onClose: () => void
}

export default function RecipeLibrary({ onRecipeSelect, onClose }: RecipeLibraryProps) {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([])
  const [filteredRecipes, setFilteredRecipes] = useState<SavedRecipe[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'favorites' | 'recent'>('all')
  const [selectedDripper, setSelectedDripper] = useState<string>('all')
  const [showMenu, setShowMenu] = useState<string | null>(null)

  useEffect(() => {
    loadRecipes()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [recipes, searchQuery, filterMode, selectedDripper])

  const loadRecipes = () => {
    const loadedRecipes = RecipeManager.getRecipes()
    setRecipes(loadedRecipes)
  }

  const applyFilters = () => {
    let filtered = recipes

    // 필터 모드 적용
    if (filterMode === 'favorites') {
      filtered = filtered.filter(recipe => recipe.isFavorite)
    } else if (filterMode === 'recent') {
      filtered = filtered.filter(recipe => recipe.lastUsed)
        .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
        .slice(0, 10)
    }

    // 드리퍼 필터 적용
    if (selectedDripper !== 'all') {
      filtered = filtered.filter(recipe => recipe.dripper === selectedDripper)
    }

    // 검색 적용
    if (searchQuery) {
      filtered = RecipeManager.searchRecipes(searchQuery)
        .filter(recipe => 
          (filterMode === 'all' || 
           (filterMode === 'favorites' && recipe.isFavorite) ||
           (filterMode === 'recent' && recipe.lastUsed)) &&
          (selectedDripper === 'all' || recipe.dripper === selectedDripper)
        )
    }

    setFilteredRecipes(filtered)
  }

  const handleRecipeUse = (recipe: SavedRecipe) => {
    RecipeManager.markAsUsed(recipe.id)
    onRecipeSelect(recipe)
  }

  const toggleFavorite = (recipeId: string) => {
    RecipeManager.toggleFavorite(recipeId)
    loadRecipes()
  }

  const duplicateRecipe = (recipe: SavedRecipe) => {
    RecipeManager.duplicateRecipe(recipe.id)
    loadRecipes()
    setShowMenu(null)
  }

  const deleteRecipe = (recipeId: string) => {
    if (confirm('정말 이 레시피를 삭제하시겠습니까?')) {
      RecipeManager.deleteRecipe(recipeId)
      loadRecipes()
      setShowMenu(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getDripperEmoji = (dripper: string) => {
    const emojis: Record<string, string> = {
      v60: '☕',
      kalita: '🌊',
      origami: '📄',
      april: '🌸'
    }
    return emojis[dripper] || '☕'
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* 헤더 */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">레시피 라이브러리</h2>
                <p className="text-sm text-gray-600">{recipes.length}개의 저장된 레시피</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              ✕
            </button>
          </div>

          {/* 검색 및 필터 */}
          <div className="space-y-4">
            {/* 검색바 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="레시피 이름, 커피명, 로스터리로 검색..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* 필터 버튼들 */}
            <div className="flex flex-wrap gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    filterMode === 'all'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  전체
                </button>
                <button
                  onClick={() => setFilterMode('favorites')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                    filterMode === 'favorites'
                      ? 'bg-yellow-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Star className="h-4 w-4 mr-1" />
                  즐겨찾기
                </button>
                <button
                  onClick={() => setFilterMode('recent')}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center ${
                    filterMode === 'recent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  최근 사용
                </button>
              </div>

              {/* 드리퍼 필터 */}
              <select
                value={selectedDripper}
                onChange={(e) => setSelectedDripper(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm bg-white"
              >
                <option value="all">모든 드리퍼</option>
                <option value="v60">☕ V60</option>
                <option value="kalita">🌊 Kalita Wave</option>
                <option value="origami">📄 Origami</option>
                <option value="april">🌸 April</option>
              </select>
            </div>
          </div>
        </div>

        {/* 레시피 목록 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredRecipes.length === 0 ? (
            <div className="text-center py-12">
              <Coffee className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">
                {searchQuery ? '검색 결과가 없습니다' : '저장된 레시피가 없습니다'}
              </p>
              <p className="text-gray-400 text-sm">
                {searchQuery ? '다른 검색어를 시도해보세요' : '첫 번째 레시피를 만들어보세요!'}
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors relative"
                >
                  {/* 즐겨찾기 & 메뉴 */}
                  <div className="flex justify-between items-start mb-3">
                    <button
                      onClick={() => toggleFavorite(recipe.id)}
                      className={`p-1 rounded-full transition-colors ${
                        recipe.isFavorite ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                      }`}
                    >
                      <Star className={`h-5 w-5 ${recipe.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                    
                    <div className="relative">
                      <button
                        onClick={() => setShowMenu(showMenu === recipe.id ? null : recipe.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-200"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      
                      {showMenu === recipe.id && (
                        <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                          <button
                            onClick={() => duplicateRecipe(recipe)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            복사
                          </button>
                          <button
                            onClick={() => deleteRecipe(recipe.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center text-sm text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 레시피 정보 */}
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-800 mb-1">{recipe.name}</h3>
                    <p className="text-sm text-gray-600">{recipe.coffeeName}</p>
                    {recipe.roastery && (
                      <p className="text-xs text-gray-500">{recipe.roastery}</p>
                    )}
                  </div>

                  {/* 레시피 상세 */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{getDripperEmoji(recipe.dripper)}</span>
                      <span className="text-gray-600">{recipe.dripper.toUpperCase()}</span>
                    </div>
                    <div className="text-gray-600">
                      1:{recipe.ratio} · {recipe.coffeeAmount}g
                    </div>
                    {recipe.timerData && (
                      <div className="flex items-center text-gray-600">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTime(recipe.timerData.totalTime)}
                      </div>
                    )}
                    {recipe.rating && (
                      <div className="flex items-center text-yellow-500">
                        <Star className="h-3 w-3 mr-1 fill-current" />
                        {recipe.rating}/5
                      </div>
                    )}
                  </div>

                  {/* 사용 정보 */}
                  <div className="flex justify-between items-center text-xs text-gray-500 mb-4">
                    <span>사용횟수: {recipe.useCount || 0}회</span>
                    {recipe.lastUsed && (
                      <span>최근: {recipe.lastUsed.toLocaleDateString()}</span>
                    )}
                  </div>

                  {/* 사용 버튼 */}
                  <button
                    onClick={() => handleRecipeUse(recipe)}
                    className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    이 레시피 사용하기
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}