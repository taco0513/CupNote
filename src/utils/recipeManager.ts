// HomeCafe 레시피 저장/불러오기 유틸리티

import { SavedRecipe, RecipeCollection } from '../types/recipe'

const RECIPE_STORAGE_KEY = 'cupnote_homecafe_recipes'

export class RecipeManager {
  // 모든 레시피 불러오기
  static getRecipes(): SavedRecipe[] {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem(RECIPE_STORAGE_KEY)
      if (!stored) return []
      
      const collection: RecipeCollection = JSON.parse(stored)
      return collection.recipes.map(recipe => ({
        ...recipe,
        createdAt: new Date(recipe.createdAt),
        lastUsed: recipe.lastUsed ? new Date(recipe.lastUsed) : undefined,
        timerData: recipe.timerData ? {
          ...recipe.timerData,
          lapTimes: recipe.timerData.lapTimes.map(lap => ({
            ...lap,
            timestamp: new Date(lap.timestamp)
          }))
        } : undefined
      }))
    } catch (error) {
      console.error('레시피 불러오기 실패:', error)
      return []
    }
  }

  // 레시피 저장
  static saveRecipe(recipe: Omit<SavedRecipe, 'id' | 'createdAt' | 'useCount'>): SavedRecipe {
    const recipes = this.getRecipes()
    
    const newRecipe: SavedRecipe = {
      ...recipe,
      id: this.generateId(),
      createdAt: new Date(),
      useCount: 0
    }
    
    recipes.push(newRecipe)
    this.saveToStorage(recipes)
    
    return newRecipe
  }

  // 레시피 업데이트
  static updateRecipe(id: string, updates: Partial<SavedRecipe>): SavedRecipe | null {
    const recipes = this.getRecipes()
    const index = recipes.findIndex(r => r.id === id)
    
    if (index === -1) return null
    
    recipes[index] = { ...recipes[index], ...updates }
    this.saveToStorage(recipes)
    
    return recipes[index]
  }

  // 레시피 삭제
  static deleteRecipe(id: string): boolean {
    const recipes = this.getRecipes()
    const filteredRecipes = recipes.filter(r => r.id !== id)
    
    if (filteredRecipes.length === recipes.length) return false
    
    this.saveToStorage(filteredRecipes)
    return true
  }

  // 레시피 사용 기록
  static markAsUsed(id: string): void {
    const recipes = this.getRecipes()
    const recipe = recipes.find(r => r.id === id)
    
    if (recipe) {
      recipe.lastUsed = new Date()
      recipe.useCount = (recipe.useCount || 0) + 1
      this.saveToStorage(recipes)
    }
  }

  // 즐겨찾기 토글
  static toggleFavorite(id: string): boolean {
    const recipe = this.getRecipes().find(r => r.id === id)
    if (!recipe) return false
    
    const newFavoriteStatus = !recipe.isFavorite
    this.updateRecipe(id, { isFavorite: newFavoriteStatus })
    
    return newFavoriteStatus
  }

  // 즐겨찾기 레시피만 가져오기
  static getFavoriteRecipes(): SavedRecipe[] {
    return this.getRecipes().filter(recipe => recipe.isFavorite)
  }

  // 최근 사용 레시피 가져오기
  static getRecentRecipes(limit: number = 5): SavedRecipe[] {
    return this.getRecipes()
      .filter(recipe => recipe.lastUsed)
      .sort((a, b) => (b.lastUsed?.getTime() || 0) - (a.lastUsed?.getTime() || 0))
      .slice(0, limit)
  }

  // 드리퍼별 레시피 가져오기
  static getRecipesByDripper(dripper: string): SavedRecipe[] {
    return this.getRecipes().filter(recipe => recipe.dripper === dripper)
  }

  // 레시피 검색
  static searchRecipes(query: string): SavedRecipe[] {
    const lowercaseQuery = query.toLowerCase()
    return this.getRecipes().filter(recipe => 
      recipe.name.toLowerCase().includes(lowercaseQuery) ||
      recipe.coffeeName.toLowerCase().includes(lowercaseQuery) ||
      recipe.roastery.toLowerCase().includes(lowercaseQuery) ||
      recipe.notes?.toLowerCase().includes(lowercaseQuery)
    )
  }

  // 레시피 복제
  static duplicateRecipe(id: string, newName?: string): SavedRecipe | null {
    const recipe = this.getRecipes().find(r => r.id === id)
    if (!recipe) return null
    
    const duplicated = {
      ...recipe,
      name: newName || `${recipe.name} (복사본)`,
      isFavorite: false,
      lastUsed: undefined,
      useCount: 0
    }
    
    delete (duplicated as any).id
    delete (duplicated as any).createdAt
    
    return this.saveRecipe(duplicated)
  }

  // 스토리지에 저장
  private static saveToStorage(recipes: SavedRecipe[]): void {
    try {
      const collection: RecipeCollection = {
        recipes,
        lastUpdated: new Date()
      }
      localStorage.setItem(RECIPE_STORAGE_KEY, JSON.stringify(collection))
    } catch (error) {
      console.error('레시피 저장 실패:', error)
    }
  }

  // ID 생성
  private static generateId(): string {
    return `recipe_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // 레시피 통계
  static getRecipeStats() {
    const recipes = this.getRecipes()
    
    return {
      total: recipes.length,
      favorites: recipes.filter(r => r.isFavorite).length,
      totalUseCount: recipes.reduce((sum, r) => sum + (r.useCount || 0), 0),
      mostUsedDripper: this.getMostUsedDripper(recipes),
      averageRatio: this.getAverageRatio(recipes)
    }
  }

  private static getMostUsedDripper(recipes: SavedRecipe[]): string {
    const dripperCounts = recipes.reduce((acc, recipe) => {
      acc[recipe.dripper] = (acc[recipe.dripper] || 0) + (recipe.useCount || 0)
      return acc
    }, {} as Record<string, number>)
    
    return Object.entries(dripperCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'v60'
  }

  private static getAverageRatio(recipes: SavedRecipe[]): number {
    if (recipes.length === 0) return 16
    
    const totalRatio = recipes.reduce((sum, recipe) => sum + recipe.ratio, 0)
    return Math.round((totalRatio / recipes.length) * 10) / 10
  }
}