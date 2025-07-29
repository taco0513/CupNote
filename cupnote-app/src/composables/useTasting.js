import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useTasting() {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  // 테이스팅 목록 조회
  const getTastings = async (options = {}) => {
    try {
      loading.value = true
      error.value = null

      let query = supabase
        .from('tastings')
        .select(`
          *,
          coffees (
            id,
            name,
            roaster,
            origin
          )
        `)
        .eq('user_id', user.value.id)
        .order('created_at', { ascending: false })

      if (options.limit) {
        query = query.limit(options.limit)
      }

      if (options.mode) {
        query = query.eq('mode', options.mode)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      return { data, error: null }
    } catch (err) {
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // 테이스팅 저장
  const saveTasting = async (tastingData) => {
    try {
      loading.value = true
      error.value = null

      // Match Score 계산
      const matchScore = calculateMatchScore(tastingData)

      const { data, error: supabaseError } = await supabase
        .from('tastings')
        .insert({
          user_id: user.value.id,
          ...tastingData,
          match_score: matchScore,
          sensory_skipped: !tastingData.sensory_expressions || 
                          Object.keys(tastingData.sensory_expressions).length === 0
        })
        .select()
        .single()

      if (supabaseError) throw supabaseError

      return { data, error: null }
    } catch (err) {
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // 테이스팅 업데이트
  const updateTasting = async (id, updates) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: supabaseError } = await supabase
        .from('tastings')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.value.id)
        .select()
        .single()

      if (supabaseError) throw supabaseError

      return { data, error: null }
    } catch (err) {
      error.value = err.message
      return { data: null, error: err }
    } finally {
      loading.value = false
    }
  }

  // 테이스팅 삭제
  const deleteTasting = async (id) => {
    try {
      loading.value = true
      error.value = null

      const { error: supabaseError } = await supabase
        .from('tastings')
        .delete()
        .eq('id', id)
        .eq('user_id', user.value.id)

      if (supabaseError) throw supabaseError

      return { error: null }
    } catch (err) {
      error.value = err.message
      return { error: err }
    } finally {
      loading.value = false
    }
  }

  // Match Score 계산 (동적 레벨)
  const calculateMatchScore = (tastingData) => {
    const { selected_flavors, sensory_expressions, roaster_notes } = tastingData

    if (!roaster_notes) {
      return null
    }

    // 감각 표현이 비어있으면 Level 1, 있으면 Level 2
    const hassensoryExpressions = sensory_expressions && 
                                  Object.values(sensory_expressions).some(arr => arr && arr.length > 0)
    
    const level = hasensoryExpressions ? 'level2' : 'level1'

    if (level === 'level1') {
      // 향미만 평가
      const flavorScore = calculateFlavorMatch(selected_flavors, roaster_notes)
      return {
        level: 'level1',
        score: flavorScore,
        details: {
          flavorScore,
          sensoryScore: null
        }
      }
    } else {
      // 향미 + 감각 평가
      const flavorScore = calculateFlavorMatch(selected_flavors, roaster_notes)
      const sensoryScore = calculateSensoryMatch(sensory_expressions, roaster_notes)
      const finalScore = Math.round((flavorScore * 0.5) + (sensoryScore * 0.5))
      
      return {
        level: 'level2',
        score: finalScore,
        details: {
          flavorScore,
          sensoryScore
        }
      }
    }
  }

  // 향미 매칭 계산
  const calculateFlavorMatch = (selectedFlavors, roasterNotes) => {
    if (!selectedFlavors || selectedFlavors.length === 0) return 0
    if (!roasterNotes) return 0

    const roasterText = roasterNotes.toLowerCase()
    let matchCount = 0

    // 기본 매핑 테이블 (추후 DB에서 가져오기)
    const flavorMapping = {
      '딸기': ['strawberry', 'berry'],
      '체리': ['cherry'],
      '블루베리': ['blueberry', 'berry'],
      '사과': ['apple'],
      '레몬': ['lemon', 'citrus'],
      '오렌지': ['orange', 'citrus'],
      '자몽': ['grapefruit', 'citrus'],
      '초콜릿': ['chocolate', 'cocoa'],
      '캐러멜': ['caramel'],
      '꿀': ['honey'],
      '바닐라': ['vanilla'],
      '꽃': ['floral', 'flower'],
      '아몬드': ['almond', 'nut'],
      '헤이즐넛': ['hazelnut', 'nut']
    }

    selectedFlavors.forEach(flavor => {
      const englishTerms = flavorMapping[flavor] || [flavor]
      const found = englishTerms.some(term => 
        roasterText.includes(term.toLowerCase())
      )
      if (found) matchCount++
    })

    return Math.round((matchCount / selectedFlavors.length) * 100)
  }

  // 감각 매칭 계산 (기본 구현)
  const calculateSensoryMatch = (sensoryExpressions, roasterNotes) => {
    // 간단한 구현 - 추후 고도화 예정
    return 75 // 기본값
  }

  return {
    loading: readonly(loading),
    error: readonly(error),
    getTastings,
    saveTasting,
    updateTasting,
    deleteTasting,
    calculateMatchScore
  }
}