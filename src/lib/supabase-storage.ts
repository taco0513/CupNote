'use client'

import { createClient } from '@supabase/supabase-js'
import { CoffeeRecord } from '@/types/coffee'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class SupabaseStorage {
  // 모든 기록 가져오기
  static async getRecords(): Promise<CoffeeRecord[]> {
    try {
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user, returning empty records')
        return []
      }

      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase 데이터 로드 오류:', error)
        return []
      }

      // Transform Supabase records to match CoffeeRecord interface
      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        coffeeName: record.coffee_name,
        roastery: record.roastery || '',
        origin: record.origin || undefined,
        roastLevel: record.roasting_level || undefined,
        temperature: 'Hot', // Default since not stored in Supabase
        date: record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        taste: record.taste_notes,
        roasterNote: record.roaster_notes || undefined,
        tasteMode: 'simple', // Default since not stored in Supabase
        mode: record.mode,
        memo: record.personal_notes || undefined,
        rating: record.rating,
        createdAt: record.created_at,
        // Optional fields that might be missing from Supabase
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        matchScore: record.match_score ? {
          overall: record.match_score,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: []
        } : undefined
      }))
    } catch (error) {
      console.error('Supabase 기록 가져오기 오류:', error)
      return []
    }
  }

  // ID로 기록 찾기
  static async getRecordById(id: string): Promise<CoffeeRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Supabase 단일 기록 로드 오류:', error)
        return null
      }

      // Transform Supabase record to match CoffeeRecord interface
      return {
        id: data.id,
        userId: data.user_id,
        coffeeName: data.coffee_name,
        roastery: data.roastery || '',
        origin: data.origin || undefined,
        roastLevel: data.roasting_level || undefined,
        temperature: 'Hot',
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        taste: data.taste_notes,
        roasterNote: data.roaster_notes || undefined,
        tasteMode: 'simple',
        mode: data.mode,
        memo: data.personal_notes || undefined,
        rating: data.rating,
        createdAt: data.created_at,
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        matchScore: data.match_score ? {
          overall: data.match_score,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: []
        } : undefined
      }
    } catch (error) {
      console.error('Supabase 단일 기록 가져오기 오류:', error)
      return null
    }
  }

  // 새 기록 추가
  static async addRecord(record: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'>): Promise<CoffeeRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('사용자가 로그인되어 있지 않습니다')
      }

      // Calculate match score
      const matchScore = this.calculateMatchScore(
        record.rating,
        record.mode,
        record.taste,
        record.roasterNote
      )

      const supabaseRecord = {
        user_id: user.id,
        coffee_name: record.coffeeName,
        roastery: record.roastery || null,
        origin: record.origin || null,
        roasting_level: record.roastLevel || null,
        brewing_method: null,
        rating: record.rating,
        taste_notes: record.taste,
        roaster_notes: record.roasterNote || null,
        personal_notes: record.memo || null,
        mode: record.mode,
        match_score: matchScore,
        created_at: record.date ? record.date + 'T00:00:00Z' : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('coffee_records')
        .insert(supabaseRecord)
        .select()
        .single()

      if (error) {
        throw error
      }

      // Transform back to CoffeeRecord format
      return {
        id: data.id,
        userId: data.user_id,
        coffeeName: data.coffee_name,
        roastery: data.roastery || '',
        origin: data.origin || undefined,
        roastLevel: data.roasting_level || undefined,
        temperature: 'Hot',
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        taste: data.taste_notes,
        roasterNote: data.roaster_notes || undefined,
        tasteMode: 'simple',
        mode: data.mode,
        memo: data.personal_notes || undefined,
        rating: data.rating,
        createdAt: data.created_at,
        selectedFlavors: record.selectedFlavors || [],
        sensoryExpressions: record.sensoryExpressions || [],
        tags: record.tags || [],
        matchScore: {
          overall: data.match_score || 0,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: []
        }
      }
    } catch (error) {
      console.error('Supabase 기록 추가 오류:', error)
      return null
    }
  }

  // Match Score 계산 함수 (Migration.tsx와 동일한 로직)
  private static calculateMatchScore(rating: number, mode: string, tasteNotes: string, roasterNotes?: string): number {
    let score = rating * 12; // 0-60 points
    
    // Mode bonus
    switch (mode) {
      case 'cafe': score += 10; break;
      case 'homecafe': score += 15; break;
      case 'lab': score += 20; break;
    }
    
    // Detail bonus
    let detailBonus = 0;
    if (tasteNotes.length > 50) detailBonus = 10;
    else if (tasteNotes.length > 20) detailBonus = 5;
    
    if (roasterNotes && roasterNotes.length > 0) {
      detailBonus += 10;
    }
    
    // Quality multiplier
    let qualityMultiplier = 1.0;
    if (rating >= 4) qualityMultiplier = 1.2;
    else if (rating <= 2) qualityMultiplier = 0.8;
    
    score = Math.round((score + detailBonus) * qualityMultiplier);
    return Math.min(Math.max(score, 0), 100);
  }

  // 기록 업데이트
  static async updateRecord(id: string, updates: Partial<CoffeeRecord>): Promise<CoffeeRecord | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const supabaseUpdates: any = {
        updated_at: new Date().toISOString()
      }

      // Map CoffeeRecord fields to Supabase fields
      if (updates.coffeeName !== undefined) supabaseUpdates.coffee_name = updates.coffeeName
      if (updates.roastery !== undefined) supabaseUpdates.roastery = updates.roastery
      if (updates.origin !== undefined) supabaseUpdates.origin = updates.origin
      if (updates.roastLevel !== undefined) supabaseUpdates.roasting_level = updates.roastLevel
      if (updates.rating !== undefined) supabaseUpdates.rating = updates.rating
      if (updates.taste !== undefined) supabaseUpdates.taste_notes = updates.taste
      if (updates.roasterNote !== undefined) supabaseUpdates.roaster_notes = updates.roasterNote
      if (updates.memo !== undefined) supabaseUpdates.personal_notes = updates.memo
      if (updates.mode !== undefined) supabaseUpdates.mode = updates.mode

      // Recalculate match score if relevant fields changed
      if (updates.rating !== undefined || updates.mode !== undefined || updates.taste !== undefined || updates.roasterNote !== undefined) {
        const currentRecord = await this.getRecordById(id)
        if (currentRecord) {
          supabaseUpdates.match_score = this.calculateMatchScore(
            updates.rating ?? currentRecord.rating,
            updates.mode ?? currentRecord.mode,
            updates.taste ?? currentRecord.taste,
            updates.roasterNote ?? currentRecord.roasterNote
          )
        }
      }

      const { data, error } = await supabase
        .from('coffee_records')
        .update(supabaseUpdates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error || !data) {
        console.error('Supabase 기록 업데이트 오류:', error)
        return null
      }

      // Transform back to CoffeeRecord format
      return {
        id: data.id,
        userId: data.user_id,
        coffeeName: data.coffee_name,
        roastery: data.roastery || '',
        origin: data.origin || undefined,
        roastLevel: data.roasting_level || undefined,
        temperature: 'Hot',
        date: data.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        taste: data.taste_notes,
        roasterNote: data.roaster_notes || undefined,
        tasteMode: 'simple',
        mode: data.mode,
        memo: data.personal_notes || undefined,
        rating: data.rating,
        createdAt: data.created_at,
        selectedFlavors: [],
        sensoryExpressions: [],
        tags: [],
        matchScore: {
          overall: data.match_score || 0,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: []
        }
      }
    } catch (error) {
      console.error('Supabase 기록 업데이트 오류:', error)
      return null
    }
  }

  // 기록 삭제
  static async deleteRecord(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { error } = await supabase
        .from('coffee_records')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Supabase 기록 삭제 오류:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Supabase 기록 삭제 오류:', error)
      return false
    }
  }
}