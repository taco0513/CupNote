import { supabase } from './supabase'
import { CacheService } from './cache-service'
import { CoffeeRecord } from '../types/coffee'

export interface QueryOptions {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filters?: Record<string, any>
  select?: string
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export class QueryOptimizer {
  private static readonly DEFAULT_PAGE_SIZE = 20
  private static readonly CACHE_TTL = 3 * 60 * 1000 // 3 minutes

  /**
   * Get paginated coffee records with caching
   */
  static async getPaginatedRecords(
    options: QueryOptions = {}
  ): Promise<PaginatedResult<CoffeeRecord>> {
    const {
      page = 1,
      pageSize = this.DEFAULT_PAGE_SIZE,
      sortBy = 'created_at',
      sortOrder = 'desc',
      filters = {},
      select = '*'
    } = options

    // Generate cache key
    const cacheKey = this.generateCacheKey('records', options)
    
    // Check cache first
    const cached = CacheService.get<PaginatedResult<CoffeeRecord>>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      let allRecords: CoffeeRecord[] = []
      
      // 로그인된 경우 Supabase에서 데이터 가져오기
      if (user) {
        // Build query
        let query = supabase
          .from('coffee_records')
          .select(select, { count: 'exact' })
          .eq('user_id', user.id)

        // Apply filters
        if (filters.mode) {
          query = query.eq('mode', filters.mode)
        }
        if (filters.rating) {
          query = query.gte('rating', filters.rating)
        }
        if (filters.hasImages) {
          query = query.not('image_url', 'is', null)
        }
        if (filters.dateFrom) {
          query = query.gte('created_at', filters.dateFrom)
        }
        if (filters.dateTo) {
          query = query.lte('created_at', filters.dateTo)
        }

        // Apply sorting
        query = query.order(sortBy, { ascending: sortOrder === 'asc' })

        const { data, error, count } = await query

        if (error) throw error

        // Transform data
        allRecords = (data || []).map(record => this.transformRecord(record))
      }
      
      // 게스트 모드이거나 추가 데이터가 필요한 경우 IndexedDB에서도 가져오기
      try {
        const { offlineStorage } = await import('./offline-storage')
        const offlineRecords = await offlineStorage.getRecords('guest')
        
        if (offlineRecords && offlineRecords.length > 0) {
          // 중복 제거 (Supabase 데이터와 중복되지 않도록)
          const existingIds = new Set(allRecords.map(r => r.id))
          const uniqueOfflineRecords = offlineRecords.filter(r => !existingIds.has(r.id))
          allRecords = [...allRecords, ...uniqueOfflineRecords]
        }
      } catch (error) {
      }
      
      // 클라이언트 사이드에서 필터링, 정렬, 페이지네이션 적용
      let filteredRecords = allRecords
      
      // Apply filters
      if (filters.mode) {
        filteredRecords = filteredRecords.filter(r => r.mode === filters.mode)
      }
      if (filters.rating) {
        filteredRecords = filteredRecords.filter(r => (r.rating || 0) >= filters.rating)
      }
      if (filters.hasImages) {
        filteredRecords = filteredRecords.filter(r => r.images && r.images.length > 0)
      }
      if (filters.dateFrom) {
        const dateFrom = new Date(filters.dateFrom)
        filteredRecords = filteredRecords.filter(r => new Date(r.date) >= dateFrom)
      }
      if (filters.dateTo) {
        const dateTo = new Date(filters.dateTo)
        filteredRecords = filteredRecords.filter(r => new Date(r.date) <= dateTo)
      }
      
      // Apply sorting
      filteredRecords.sort((a, b) => {
        let aVal, bVal
        
        switch (sortBy) {
          case 'created_at':
            aVal = new Date(a.createdAt || a.date)
            bVal = new Date(b.createdAt || b.date)
            break
          case 'rating':
            aVal = a.rating || 0
            bVal = b.rating || 0
            break
          case 'coffee_name':
            aVal = a.coffeeName
            bVal = b.coffeeName
            break
          default:
            aVal = a.createdAt || a.date
            bVal = b.createdAt || b.date
        }
        
        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })
      
      // Apply pagination
      const total = filteredRecords.length
      const from = (page - 1) * pageSize
      const to = from + pageSize
      const paginatedRecords = filteredRecords.slice(from, to)

      const result: PaginatedResult<CoffeeRecord> = {
        data: paginatedRecords,
        total: total,
        page,
        pageSize,
        hasMore: total > page * pageSize
      }

      // Cache the result
      CacheService.set(cacheKey, result, this.CACHE_TTL)

      return result
    } catch (error) {
      console.error('Query error:', error)
      throw error
    }
  }

  /**
   * Get record by ID with caching
   */
  static async getRecordById(id: string): Promise<CoffeeRecord | null> {
    const cacheKey = `record_${id}`
    
    // Check cache
    const cached = CacheService.get<CoffeeRecord>(cacheKey)
    if (cached) {
      return cached
    }

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data, error } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single()

      if (error || !data) return null

      const record = this.transformRecord(data)
      
      // Cache for longer since single records change less frequently
      CacheService.set(cacheKey, record, 10 * 60 * 1000) // 10 minutes

      return record
    } catch (error) {
      console.error('Get record error:', error)
      return null
    }
  }

  /**
   * Batch load records by IDs
   */
  static async getRecordsByIds(ids: string[]): Promise<Map<string, CoffeeRecord>> {
    const recordMap = new Map<string, CoffeeRecord>()
    const uncachedIds: string[] = []

    // Check cache for each ID
    for (const id of ids) {
      const cached = CacheService.get<CoffeeRecord>(`record_${id}`)
      if (cached) {
        recordMap.set(id, cached)
      } else {
        uncachedIds.push(id)
      }
    }

    // Batch load uncached records
    if (uncachedIds.length > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return recordMap

        const { data, error } = await supabase
          .from('coffee_records')
          .select('*')
          .in('id', uncachedIds)
          .eq('user_id', user.id)

        if (!error && data) {
          for (const record of data) {
            const transformed = this.transformRecord(record)
            recordMap.set(record.id, transformed)
            // Cache individual records
            CacheService.set(`record_${record.id}`, transformed, 10 * 60 * 1000)
          }
        }
      } catch (error) {
        console.error('Batch load error:', error)
      }
    }

    return recordMap
  }

  /**
   * Invalidate record caches
   */
  static invalidateRecordCache(recordId?: string) {
    if (recordId) {
      CacheService.invalidate(`record_${recordId}`)
    }
    // Invalidate all paginated queries
    CacheService.invalidatePattern('records_')
  }

  /**
   * Generate cache key from query options
   */
  private static generateCacheKey(prefix: string, options: QueryOptions): string {
    const sortedOptions = Object.keys(options)
      .sort()
      .reduce((acc, key) => {
        acc[key] = options[key as keyof QueryOptions]
        return acc
      }, {} as any)
    
    return `${prefix}_${JSON.stringify(sortedOptions)}`
  }

  /**
   * Transform Supabase record to CoffeeRecord
   */
  private static transformRecord(record: any): CoffeeRecord {
    return {
      id: record.id,
      userId: record.user_id,
      coffeeName: record.coffee_name,
      roastery: record.roastery || '',
      origin: record.origin || undefined,
      roastLevel: record.roasting_level || undefined,
      temperature: 'Hot',
      date: record.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      taste: record.taste_notes,
      roasterNote: record.roaster_notes || undefined,
      tasteMode: 'simple',
      mode: record.mode,
      memo: record.personal_notes || undefined,
      rating: record.rating,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
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
    }
  }
}