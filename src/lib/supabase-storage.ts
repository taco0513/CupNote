'use client'

import { createClient } from '@supabase/supabase-js'

import { offlineStorage } from './offline-storage'
import { SupabaseAchievements } from './supabase-achievements'
import { CoffeeRecord } from '../types/coffee'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export class SupabaseStorage {
  // 모든 기록 가져오기
  static async getRecords(): Promise<CoffeeRecord[]> {
    try {
      // Check if user is authenticated
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.log('No authenticated user, checking for guest records')
        return await this.getGuestRecords()
      }

      // Try to get from Supabase first
      if (navigator.onLine) {
        const { data, error } = await supabase
          .from('coffee_records')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase 데이터 로드 오류:', error)
          // Fall back to offline storage
          const offlineRecords = await offlineStorage.getRecords(user.id)
          return offlineRecords.map(({ syncStatus, syncError, lastAttempt, ...record }) => record)
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
          images: record.image_url
            ? [record.image_url, ...(record.additional_images || [])].filter(Boolean)
            : undefined,
          matchScore: record.match_score
            ? {
                overall: record.match_score,
                flavorMatching: 0,
                expressionAccuracy: 0,
                consistency: 0,
                strengths: [],
                improvements: [],
              }
            : undefined,
        }))
      } else {
        // Offline - get from IndexedDB
        const offlineRecords = await offlineStorage.getRecords(user.id)
        return offlineRecords.map(({ syncStatus, syncError, lastAttempt, ...record }) => record)
      }
    } catch (error) {
      console.error('Supabase 기록 가져오기 오류:', error)
      return []
    }
  }

  // ID로 기록 찾기
  static async getRecordById(id: string): Promise<CoffeeRecord | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      // 사용자가 로그인되어 있지 않은 경우 게스트 기록에서 찾기
      if (!user) {
        console.log('게스트 모드: 로컬 스토리지에서 기록 검색')
        return await this.getGuestRecordById(id)
      }

      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) {
        console.error('Supabase 단일 기록 로드 오류:', error)
        // Supabase에서 찾지 못한 경우 게스트 기록도 확인
        return await this.getGuestRecordById(id)
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
        images: data.image_url
          ? [data.image_url, ...(data.additional_images || [])].filter(Boolean)
          : undefined,
        matchScore: data.match_score
          ? {
              overall: data.match_score,
              flavorMatching: 0,
              expressionAccuracy: 0,
              consistency: 0,
              strengths: [],
              improvements: [],
            }
          : undefined,
      }
    } catch (error) {
      console.error('Supabase 단일 기록 가져오기 오류:', error)
      return null
    }
  }

  // 새 기록 추가 (성취 시스템 포함)
  static async addRecordWithAchievements(
    record: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'>
  ): Promise<{
    record: CoffeeRecord | null
    newAchievements: string[]
  }> {
    try {
      console.log('addRecordWithAchievements 시작')
      const {
        data: { user },
      } = await supabase.auth.getUser()
      
      // 사용자가 로그인되어 있지 않은 경우 게스트 모드로 처리
      if (!user) {
        console.log('사용자가 로그인되어 있지 않음 - 게스트 모드로 처리')
        return await this.handleGuestRecord(record)
      }
      console.log('사용자 확인됨:', user.id)

      // Initialize achievements for new users
      console.log('성취 시스템 초기화 중...')
      await SupabaseAchievements.initializeUserAchievements(user.id)

      // Add the record
      console.log('기록 추가 시도 중...')
      const newRecord = await this.addRecord(record)
      console.log('addRecord 결과:', newRecord)
      
      if (!newRecord) {
        console.error('addRecord가 null을 반환했습니다')
        return { record: null, newAchievements: [] }
      }

      // Update achievements
      console.log('성취 업데이트 중...')
      const newAchievements = await SupabaseAchievements.updateAchievements(user.id)
      console.log('성취 업데이트 완료:', newAchievements)

      return { record: newRecord, newAchievements }
    } catch (error) {
      console.error('기록 추가 및 성취 업데이트 오류 상세:', error)
      console.error('오류 스택:', error instanceof Error ? error.stack : 'Unknown error')
      return { record: null, newAchievements: [] }
    }
  }

  // 게스트 사용자 기록 가져오기
  static async getGuestRecords(): Promise<CoffeeRecord[]> {
    try {
      const guestUserId = localStorage.getItem('cupnote-guest-id')
      if (!guestUserId) {
        console.log('게스트 ID가 없음, 빈 배열 반환')
        return []
      }

      console.log('게스트 기록 조회:', guestUserId)
      const offlineRecords = await offlineStorage.getRecords(guestUserId)
      return offlineRecords.map(({ syncStatus, syncError, lastAttempt, ...record }) => record)
    } catch (error) {
      console.error('게스트 기록 조회 오류:', error)
      return []
    }
  }

  // 게스트 사용자 기록을 ID로 찾기
  static async getGuestRecordById(id: string): Promise<CoffeeRecord | null> {
    try {
      const guestUserId = localStorage.getItem('cupnote-guest-id')
      if (!guestUserId) {
        console.log('게스트 ID가 없음')
        return null
      }

      console.log('게스트 기록 ID 검색:', id, guestUserId)
      const offlineRecords = await offlineStorage.getRecords(guestUserId)
      
      // ID로 기록 찾기
      const foundRecord = offlineRecords.find(record => record.id === id)
      if (foundRecord) {
        // syncStatus 등 오프라인 전용 필드 제거
        const { syncStatus, syncError, lastAttempt, ...cleanRecord } = foundRecord
        console.log('게스트 기록 찾음:', cleanRecord)
        return cleanRecord
      }

      console.log('게스트 기록을 찾을 수 없음')
      return null
    } catch (error) {
      console.error('게스트 기록 ID 검색 오류:', error)
      return null
    }
  }

  // 게스트 사용자를 위한 기록 처리 (로그인하지 않은 경우)
  static async handleGuestRecord(
    record: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'>
  ): Promise<{
    record: CoffeeRecord | null
    newAchievements: string[]
  }> {
    try {
      console.log('게스트 모드: 로컬 스토리지에 저장')
      
      // 게스트 사용자 ID 생성/가져오기
      let guestUserId = localStorage.getItem('cupnote-guest-id')
      if (!guestUserId) {
        guestUserId = `guest-${crypto.randomUUID()}`
        localStorage.setItem('cupnote-guest-id', guestUserId)
        console.log('새 게스트 ID 생성:', guestUserId)
      }

      // 게스트 기록 생성
      const guestRecord: CoffeeRecord = {
        id: crypto.randomUUID(),
        userId: guestUserId,
        coffeeName: record.coffeeName,
        roastery: record.roastery || '',
        origin: record.origin || undefined,
        roastLevel: record.roastLevel || undefined,
        temperature: record.temperature || 'Hot',
        date: record.date || new Date().toISOString().split('T')[0],
        taste: record.taste || '',
        roasterNote: record.roasterNote || undefined,
        tasteMode: record.tasteMode || 'simple',
        mode: record.mode,
        memo: record.memo || undefined,
        rating: record.rating || 0,
        createdAt: new Date().toISOString(),
        selectedFlavors: record.selectedFlavors || [],
        sensoryExpressions: record.sensoryExpressions || [],
        tags: record.tags || [],
        images: record.images || undefined,
        matchScore: {
          overall: 0,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: [],
        },
      }

      // 로컬 스토리지에 저장 (오프라인 스토리지 사용)
      await offlineStorage.saveRecord(guestRecord, 'pending')
      
      console.log('게스트 기록 저장 완료:', guestRecord)
      
      return { 
        record: guestRecord, 
        newAchievements: [] // 게스트 모드에서는 성취 없음
      }
    } catch (error) {
      console.error('게스트 기록 저장 오류:', error)
      return { record: null, newAchievements: [] }
    }
  }

  // 새 기록 추가
  static async addRecord(
    record: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'>
  ): Promise<CoffeeRecord | null> {
    try {
      console.log('addRecord 시작, 받은 데이터:', record)
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.error('addRecord: 사용자가 로그인되어 있지 않습니다')
        throw new Error('사용자가 로그인되어 있지 않습니다')
      }
      console.log('addRecord: 사용자 확인됨:', user.id)

      // Calculate match score
      const matchScore = this.calculateMatchScore(
        record.rating || 0,
        record.mode || 'cafe',
        record.taste || '',
        record.roasterNote
      )

      // Map to existing database schema columns only
      const supabaseRecord = {
        user_id: user.id,
        coffee_name: record.coffeeName,
        roastery: record.roastery || null,
        origin: record.origin || null,
        roasting_level: record.roastLevel || null,
        brewing_method: record.brewMethod || null,
        rating: record.rating || 0,
        taste_notes: record.taste || '',
        roaster_notes: record.roasterNote || null,
        personal_notes: record.memo || null,
        mode: record.mode || 'cafe',
        match_score: matchScore || 0,
        // Image fields are not available in current schema - skip for now
        created_at: record.date ? record.date + 'T00:00:00Z' : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Match score 계산됨:', matchScore)
      
      // Create the record object first
      const newRecord: CoffeeRecord = {
        id: crypto.randomUUID(),
        userId: user.id,
        coffeeName: record.coffeeName,
        roastery: record.roastery || '',
        origin: record.origin || undefined,
        roastLevel: record.roastLevel || undefined,
        temperature: record.temperature || 'Hot',
        date: record.date || new Date().toISOString().split('T')[0],
        taste: record.taste || '',
        roasterNote: record.roasterNote || undefined,
        tasteMode: record.tasteMode || 'simple',
        mode: record.mode,
        memo: record.memo || undefined,
        rating: record.rating || 0,
        createdAt: new Date().toISOString(),
        selectedFlavors: record.selectedFlavors || [],
        sensoryExpressions: record.sensoryExpressions || [],
        tags: record.tags || [],
        images: record.images || undefined,
        matchScore: {
          overall: matchScore || 0,
          flavorMatching: 0,
          expressionAccuracy: 0,
          consistency: 0,
          strengths: [],
          improvements: [],
        },
      }
      
      console.log('newRecord 생성됨:', newRecord)

      console.log('Supabase에 저장할 데이터:', supabaseRecord)
      
      // Try to save online first
      if (navigator.onLine) {
        console.log('온라인 상태, Supabase에 저장 시도')
        const insertData = {
          ...supabaseRecord,
          id: newRecord.id,
        }
        console.log('실제 insert 데이터:', insertData)
        
        const { data, error } = await supabase
          .from('coffee_records')
          .insert(insertData)
          .select()
          .single()

        if (error) {
          console.error('Supabase insert 실패:', error)
          console.error('에러 세부사항:', error.message, error.details, error.hint)
          // Save to offline storage with pending status
          await offlineStorage.saveRecord(newRecord, 'pending')
          return newRecord
        }

        console.log('Supabase 저장 성공:', data)
        // Save to offline storage as synced
        await offlineStorage.saveRecord(newRecord, 'synced')
        return newRecord
      } else {
        console.log('오프라인 상태, IndexedDB에 저장')
        // Offline - save to IndexedDB
        await offlineStorage.saveRecord(newRecord, 'pending')
        return newRecord
      }
    } catch (error) {
      console.error('Supabase 기록 추가 오류 상세:', error)
      console.error('오류 스택:', error instanceof Error ? error.stack : 'Unknown error')
      return null
    }
  }

  // Match Score 계산 함수 (Migration.tsx와 동일한 로직)
  private static calculateMatchScore(
    rating: number,
    mode: string,
    tasteNotes: string,
    roasterNotes?: string
  ): number {
    let score = rating * 12 // 0-60 points

    // Mode bonus
    switch (mode) {
      case 'cafe':
        score += 10
        break
      case 'homecafe':
        score += 15
        break
    }

    // Detail bonus
    let detailBonus = 0
    if (tasteNotes.length > 50) detailBonus = 10
    else if (tasteNotes.length > 20) detailBonus = 5

    if (roasterNotes && roasterNotes.length > 0) {
      detailBonus += 10
    }

    // Quality multiplier
    let qualityMultiplier = 1.0
    if (rating >= 4) qualityMultiplier = 1.2
    else if (rating <= 2) qualityMultiplier = 0.8

    score = Math.round((score + detailBonus) * qualityMultiplier)
    return Math.min(Math.max(score, 0), 100)
  }

  // 기록 업데이트
  static async updateRecord(
    id: string,
    updates: Partial<CoffeeRecord>
  ): Promise<CoffeeRecord | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null

      const supabaseUpdates: any = {
        updated_at: new Date().toISOString(),
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
      if (
        updates.rating !== undefined ||
        updates.mode !== undefined ||
        updates.taste !== undefined ||
        updates.roasterNote !== undefined
      ) {
        const currentRecord = await this.getRecordById(id)
        if (currentRecord) {
          supabaseUpdates.match_score = this.calculateMatchScore(
            updates.rating ?? currentRecord.rating ?? 0,
            updates.mode ?? currentRecord.mode ?? 'cafe',
            updates.taste ?? currentRecord.taste ?? '',
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
          improvements: [],
        },
      }
    } catch (error) {
      console.error('Supabase 기록 업데이트 오류:', error)
      return null
    }
  }

  // 기록 삭제
  static async deleteRecord(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
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

  // 사용자 통계 및 성취 정보 가져오기
  static async getUserStats() {
    return await SupabaseAchievements.getUserStats()
  }
}
