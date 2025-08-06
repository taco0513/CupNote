/**
 * Data Crawler for Korean Coffee Shops and Roasteries
 * Automates data collection from various sources
 */

import { supabase } from '@/lib/supabase'

import type { CafeRoastery, Coffee } from '@/types/data-management'

interface CrawlResult {
  success: boolean
  data?: any
  error?: string
  source: string
  timestamp: Date
}

interface CrawlOptions {
  source: 'instagram' | 'google' | 'naver' | 'manual'
  query?: string
  limit?: number
  updateExisting?: boolean
}

/**
 * Instagram Business API crawler (requires API setup)
 * Note: Requires Instagram Business API access token
 */
export async function crawlInstagramCafe(username: string): Promise<CrawlResult> {
  try {
    // Instagram API endpoint (placeholder - requires actual API setup)
    const apiUrl = `https://graph.instagram.com/v12.0/${username}`
    
    // This is a mock implementation - actual implementation requires:
    // 1. Instagram Business API access token
    // 2. Business account verification
    // 3. Rate limiting handling
    
    return {
      success: false,
      error: 'Instagram API integration pending setup',
      source: 'instagram',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'instagram',
      timestamp: new Date()
    }
  }
}

/**
 * Google Places API crawler
 * Note: Requires Google Cloud API key
 */
export async function crawlGooglePlaces(
  query: string,
  location: { lat: number; lng: number; radius: number }
): Promise<CrawlResult> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY
    
    if (!apiKey) {
      return {
        success: false,
        error: 'Google Places API key not configured',
        source: 'google',
        timestamp: new Date()
      }
    }

    // Google Places API search
    const searchUrl = new URL('https://maps.googleapis.com/maps/api/place/nearbysearch/json')
    searchUrl.searchParams.append('key', apiKey)
    searchUrl.searchParams.append('location', `${location.lat},${location.lng}`)
    searchUrl.searchParams.append('radius', location.radius.toString())
    searchUrl.searchParams.append('keyword', query)
    searchUrl.searchParams.append('type', 'cafe')

    const response = await fetch(searchUrl.toString())
    const data = await response.json()

    if (data.status !== 'OK') {
      return {
        success: false,
        error: `Google API error: ${data.status}`,
        source: 'google',
        timestamp: new Date()
      }
    }

    // Transform Google Places data to our format
    const cafes = data.results.map((place: any) => ({
      name: place.name,
      type: 'cafe' as const,
      address: place.vicinity,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      google_place_id: place.place_id,
      rating: place.rating,
      total_ratings: place.user_ratings_total,
      price_level: place.price_level,
      is_verified: false // Requires manual verification
    }))

    return {
      success: true,
      data: cafes,
      source: 'google',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'google',
      timestamp: new Date()
    }
  }
}

/**
 * Naver Maps API crawler for Korean locations
 * Note: More accurate for Korean businesses
 */
export async function crawlNaverMaps(query: string): Promise<CrawlResult> {
  try {
    const clientId = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID
    const clientSecret = process.env.NEXT_PUBLIC_NAVER_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      return {
        success: false,
        error: 'Naver API credentials not configured',
        source: 'naver',
        timestamp: new Date()
      }
    }

    // Naver Search API
    const searchUrl = 'https://openapi.naver.com/v1/search/local.json'
    const params = new URLSearchParams({
      query: `${query} 카페`,
      display: '20',
      sort: 'comment'
    })

    const response = await fetch(`${searchUrl}?${params}`, {
      headers: {
        'X-Naver-Client-Id': clientId,
        'X-Naver-Client-Secret': clientSecret
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: `Naver API error: ${data.errorMessage}`,
        source: 'naver',
        timestamp: new Date()
      }
    }

    // Transform Naver data to our format
    const cafes = data.items.map((item: any) => ({
      name: item.title.replace(/<[^>]*>/g, ''), // Remove HTML tags
      type: 'cafe' as const,
      address: item.address || item.roadAddress,
      phone: item.telephone,
      naver_place_id: item.mapx + ',' + item.mapy,
      category: item.category,
      is_verified: false
    }))

    return {
      success: true,
      data: cafes,
      source: 'naver',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'naver',
      timestamp: new Date()
    }
  }
}

/**
 * Batch crawler that combines multiple sources
 */
export async function batchCrawlCafes(
  options: CrawlOptions
): Promise<{ results: CrawlResult[]; summary: any }> {
  const results: CrawlResult[] = []
  const uniqueCafes = new Map<string, any>()

  // Seoul coordinates for Google Places
  const seoulLocation = { lat: 37.5665, lng: 126.9780, radius: 50000 }

  // Crawl from multiple sources
  if (options.source === 'google' || !options.source) {
    const googleResult = await crawlGooglePlaces(
      options.query || '스페셜티 커피',
      seoulLocation
    )
    results.push(googleResult)
    
    if (googleResult.success && googleResult.data) {
      googleResult.data.forEach((cafe: any) => {
        const key = `${cafe.name}-${cafe.address}`
        if (!uniqueCafes.has(key)) {
          uniqueCafes.set(key, { ...cafe, sources: ['google'] })
        } else {
          uniqueCafes.get(key).sources.push('google')
        }
      })
    }
  }

  if (options.source === 'naver' || !options.source) {
    const naverResult = await crawlNaverMaps(options.query || '스페셜티 커피')
    results.push(naverResult)
    
    if (naverResult.success && naverResult.data) {
      naverResult.data.forEach((cafe: any) => {
        const key = `${cafe.name}-${cafe.address}`
        if (!uniqueCafes.has(key)) {
          uniqueCafes.set(key, { ...cafe, sources: ['naver'] })
        } else {
          uniqueCafes.get(key).sources.push('naver')
        }
      })
    }
  }

  // Save to database if requested
  if (options.updateExisting && uniqueCafes.size > 0) {
    const cafesToInsert = Array.from(uniqueCafes.values()).map(cafe => ({
      name: cafe.name,
      type: cafe.type || 'cafe',
      address: cafe.address,
      city: cafe.city || '서울',
      region: cafe.region,
      phone: cafe.phone,
      lat: cafe.lat,
      lng: cafe.lng,
      features: cafe.features || [],
      is_verified: false,
      crawl_sources: cafe.sources,
      crawled_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('cafe_roasteries')
      .upsert(cafesToInsert, {
        onConflict: 'name,address',
        ignoreDuplicates: true
      })
      .select()

    if (!error && data) {
      // Log the crawl operation
      await supabase.from('data_update_logs').insert({
        update_type: 'crawl',
        source: options.source || 'multiple',
        records_affected: data.length,
        details: {
          query: options.query,
          sources: results.map(r => r.source),
          unique_cafes: uniqueCafes.size,
          inserted: data.length
        }
      })
    }
  }

  return {
    results,
    summary: {
      total_sources: results.length,
      successful_sources: results.filter(r => r.success).length,
      unique_cafes_found: uniqueCafes.size,
      timestamp: new Date()
    }
  }
}

/**
 * Coffee bean data crawler from roastery websites
 * Requires custom parsers for each roastery website
 */
export async function crawlRoasteryCoffees(
  roasteryUrl: string
): Promise<CrawlResult> {
  try {
    // This would require website-specific parsers
    // For now, return a placeholder
    
    const parsers: Record<string, () => Promise<Coffee[]>> = {
      'anthracitecoffee.com': async () => {
        // Custom parser for Anthracite website
        return []
      },
      'fritz.co.kr': async () => {
        // Custom parser for Fritz website
        return []
      },
      'coffeelibre.kr': async () => {
        // Custom parser for Coffee Libre website
        return []
      }
    }

    const domain = new URL(roasteryUrl).hostname.replace('www.', '')
    const parser = parsers[domain]

    if (!parser) {
      return {
        success: false,
        error: `No parser available for ${domain}`,
        source: 'manual',
        timestamp: new Date()
      }
    }

    const coffees = await parser()

    return {
      success: true,
      data: coffees,
      source: 'manual',
      timestamp: new Date()
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      source: 'manual',
      timestamp: new Date()
    }
  }
}

/**
 * Scheduled crawler that runs periodically
 * Can be triggered by cron job or API endpoint
 */
export async function scheduledCrawl(): Promise<void> {

  // Define crawl tasks
  const tasks = [
    { query: '스페셜티 커피 서울', source: 'naver' as const },
    { query: '로스터리 카페 서울', source: 'naver' as const },
    { query: 'specialty coffee seoul', source: 'google' as const },
    { query: 'coffee roastery seoul', source: 'google' as const }
  ]

  for (const task of tasks) {
    
    const result = await batchCrawlCafes({
      source: task.source,
      query: task.query,
      updateExisting: true,
      limit: 20
    })

    
    // Add delay to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

}

/**
 * Manual data enrichment helper
 * Adds missing information to existing records
 */
export async function enrichCafeData(
  cafeId: string,
  additionalData: Partial<CafeRoastery>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('cafe_roasteries')
      .update({
        ...additionalData,
        updated_at: new Date().toISOString(),
        is_verified: true // Mark as verified after manual enrichment
      })
      .eq('id', cafeId)

    if (error) {
      return { success: false, error: error.message }
    }

    // Log the enrichment
    await supabase.from('data_update_logs').insert({
      update_type: 'enrich',
      source: 'manual',
      records_affected: 1,
      details: {
        cafe_id: cafeId,
        fields_updated: Object.keys(additionalData)
      }
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}