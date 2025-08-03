'use client'

import { useState } from 'react'

import { Save, Star, Coffee } from 'lucide-react'

import { SavedRecipe } from '../types/recipe'
import { RecipeManager } from '../utils/recipeManager'

interface RecipeSaveDialogProps {
  recipeData: {
    coffeeName: string
    roastery: string
    dripper: string
    coffeeAmount: number
    waterAmount: number
    ratio: number
    grindSize?: string
    grinderBrand?: string
    grinderModel?: string
    grinderSetting?: string
    waterTemp?: number
    brewTime?: number
    notes?: string
    timerData?: any
  }
  rating?: number
  tastingNotes?: string
  onSave: (savedRecipe: SavedRecipe) => void
  onClose: () => void
}

export default function RecipeSaveDialog({
  recipeData,
  rating,
  tastingNotes,
  onSave,
  onClose
}: RecipeSaveDialogProps) {
  const [recipeName, setRecipeName] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    if (!recipeName.trim()) return

    setIsLoading(true)
    
    try {
      const savedRecipe = RecipeManager.saveRecipe({
        name: recipeName.trim(),
        coffeeName: recipeData.coffeeName,
        roastery: recipeData.roastery,
        dripper: recipeData.dripper,
        coffeeAmount: recipeData.coffeeAmount,
        waterAmount: recipeData.waterAmount,
        ratio: recipeData.ratio,
        grindSize: recipeData.grindSize,
        grinderBrand: recipeData.grinderBrand,
        grinderModel: recipeData.grinderModel,
        grinderSetting: recipeData.grinderSetting,
        waterTemp: recipeData.waterTemp,
        brewTime: recipeData.brewTime,
        notes: recipeData.notes,
        timerData: recipeData.timerData,
        rating,
        tastingNotes,
        isFavorite
      })
      
      onSave(savedRecipe)
    } catch (error) {
      console.error('레시피 저장 실패:', error)
      alert('레시피 저장에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const generateSuggestedName = () => {
    const { coffeeName, dripper, ratio } = recipeData
    return `${coffeeName} ${dripper.toUpperCase()} 1:${ratio}`
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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Save className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">레시피 저장하기</h2>
          <p className="text-gray-600">이 추출 설정을 나중에 다시 사용할 수 있어요</p>
        </div>

        {/* 레시피 미리보기 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-3">{getDripperEmoji(recipeData.dripper)}</span>
            <div>
              <p className="font-medium text-gray-800">{recipeData.coffeeName}</p>
              <p className="text-sm text-gray-600">{recipeData.roastery}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-gray-600">드리퍼</div>
              <div className="font-bold text-gray-800">{recipeData.dripper.toUpperCase()}</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-gray-600">비율</div>
              <div className="font-bold text-gray-800">1:{recipeData.ratio}</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-gray-600">원두량</div>
              <div className="font-bold text-gray-800">{recipeData.coffeeAmount}g</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="text-gray-600">물량</div>
              <div className="font-bold text-gray-800">{recipeData.waterAmount}ml</div>
            </div>
          </div>

          {recipeData.timerData && (
            <div className="mt-3 text-center p-2 bg-white rounded-lg">
              <div className="text-gray-600 text-sm">추출 시간</div>
              <div className="font-bold text-gray-800">
                {Math.floor(recipeData.timerData.totalTime / 60)}:
                {(recipeData.timerData.totalTime % 60).toString().padStart(2, '0')}
              </div>
            </div>
          )}
        </div>

        {/* 레시피 이름 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            레시피 이름 *
          </label>
          <input
            type="text"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="예: 아침용 V60 레시피"
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            maxLength={50}
          />
          <div className="flex justify-between items-center mt-2">
            <button
              onClick={() => setRecipeName(generateSuggestedName())}
              className="text-sm text-green-600 hover:text-green-700"
            >
              추천 이름 사용하기
            </button>
            <span className="text-xs text-gray-500">
              {recipeName.length}/50
            </span>
          </div>
        </div>

        {/* 즐겨찾기 설정 */}
        <div className="mb-6">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`w-full py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center ${
              isFavorite
                ? 'border-yellow-500 bg-yellow-50 text-yellow-700'
                : 'border-gray-300 hover:border-yellow-300 text-gray-600'
            }`}
          >
            <Star className={`h-5 w-5 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
            {isFavorite ? '즐겨찾기에 추가됨' : '즐겨찾기에 추가하기'}
          </button>
        </div>

        {/* 저장 정보 안내 */}
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            <Coffee className="inline h-4 w-4 mr-1" />
            <span className="font-medium">저장되는 정보:</span> 드리퍼, 비율, 분쇄도, 타이머 데이터, 
            {rating && ' 평점,'} 맛 노트 등이 모두 포함돼요
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!recipeName.trim() || isLoading}
            className="flex-2 py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                레시피 저장하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}