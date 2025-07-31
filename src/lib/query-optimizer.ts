import { CoffeeRecord } from '../types/coffee'
import { createClient } from '@supabase/supabase-js'
import { CacheService } from './cache-service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

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
      if (!user) {
        return {
          data: [],
          total: 0,
          page,
          pageSize,
          hasMore: false
        }
      }

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

      // Apply pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      // Transform data
      const records = (data || []).map(record => this.transformRecord(record))

      const result: PaginatedResult<CoffeeRecord> = {
        data: records,
        total: count || 0,
        page,
        pageSize,
        hasMore: (count || 0) > page * pageSize
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