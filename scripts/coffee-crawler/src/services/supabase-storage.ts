/**
 * Supabase Storage Service for Coffee Crawler
 * 크롤링된 커피 데이터를 Supabase에 저장하는 서비스
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { CoffeeProductData } from '../types/coffee-data'

export interface StorageResult {
  success: boolean
  insertedCount: number
  updatedCount: number
  skippedCount: number
  errors: string[]
}

export class SupabaseStorageService {
  private supabase: SupabaseClient
  private tableName = 'coffee_products'

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // 서비스 키 사용 (관리자 권한)

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
    }

    this.supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  /**
   * 크롤링된 제품 데이터를 Supabase에 저장
   */
  async storeProducts(products: CoffeeProductData[]): Promise<StorageResult> {
    const result: StorageResult = {
      success: true,
      insertedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      errors: []
    }

    console.log(`💾 Supabase에 ${products.length}개 제품 저장 시작...`)

    for (const product of products) {
      try {
        // 제품 데이터를 DB 스키마에 맞게 변환
        const dbProduct = this.transformProductData(product)
        
        // 기존 제품 확인 (product_url 기준)
        const { data: existing, error: checkError } = await this.supabase
          .from(this.tableName)
          .select('id, coffee_name, updated_at')
          .eq('product_url', dbProduct.product_url)
          .single()

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = 데이터 없음
          result.errors.push(`제품 확인 실패: ${product.coffeeName} - ${checkError.message}`)
          continue
        }

        if (existing) {
          // 기존 제품 업데이트
          const { error: updateError } = await this.supabase
            .from(this.tableName)
            .update({
              ...dbProduct,
              updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)

          if (updateError) {
            result.errors.push(`제품 업데이트 실패: ${product.coffeeName} - ${updateError.message}`)
          } else {
            result.updatedCount++
            console.log(`  🔄 업데이트: ${product.coffeeName}`)
          }
        } else {
          // 새 제품 삽입
          const { error: insertError } = await this.supabase
            .from(this.tableName)
            .insert(dbProduct)

          if (insertError) {
            result.errors.push(`제품 삽입 실패: ${product.coffeeName} - ${insertError.message}`)
          } else {
            result.insertedCount++
            console.log(`  ✅ 삽입: ${product.coffeeName}`)
          }
        }

      } catch (error) {
        result.errors.push(`제품 처리 실패: ${product.coffeeName} - ${(error as Error).message}`)
      }
    }

    // 최종 결과 계산
    result.success = result.errors.length === 0
    
    console.log(`\n📊 Supabase 저장 완료:`)
    console.log(`  ✅ 삽입: ${result.insertedCount}개`)
    console.log(`  🔄 업데이트: ${result.updatedCount}개`)
    console.log(`  ⚠️ 실패: ${result.errors.length}개`)

    if (result.errors.length > 0) {
      console.log(`\n❌ 에러 목록:`)
      result.errors.forEach(error => console.log(`  - ${error}`))
    }

    return result
  }

  /**
   * 제품 데이터를 DB 스키마에 맞게 변환
   */
  private transformProductData(product: CoffeeProductData): any {
    return {
      coffee_name: product.coffeeName,
      roastery: product.roastery,
      roastery_url: product.roasteryUrl,
      origin: product.origin,
      variety: product.variety || null,
      processing: product.processing || null,
      roast_level: product.roastLevel || null,
      tasting_notes: product.tastingNotes || [],
      price: product.price || null,
      currency: product.currency || 'KRW',
      product_url: product.productUrl,
      image_urls: product.imageUrls || [],
      label_image_url: product.labelImageUrl || null,
      crawled_at: product.crawledAt?.toISOString() || new Date().toISOString(),
      source: product.source || 'web_crawled',
      verified: product.verified || false,
      quality_score: product.qualityScore || 0
    }
  }

  /**
   * 저장된 제품 통계 조회
   */
  async getStorageStats(): Promise<{
    totalProducts: number
    roasteryStats: Record<string, number>
    originStats: Record<string, number>
    recentCrawls: number
  }> {
    // 전체 제품 수
    const { count: totalProducts } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })

    // 로스터리별 통계
    const { data: roasteryData } = await this.supabase
      .from(this.tableName)
      .select('roastery')
      .not('roastery', 'is', null)

    // 원산지별 통계
    const { data: originData } = await this.supabase
      .from(this.tableName)
      .select('origin')
      .not('origin', 'is', null)

    // 최근 1시간 내 크롤링된 제품 수
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentCrawls } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .gte('crawled_at', oneHourAgo)

    // 통계 계산
    const roasteryStats: Record<string, number> = {}
    const originStats: Record<string, number> = {}

    roasteryData?.forEach(item => {
      roasteryStats[item.roastery] = (roasteryStats[item.roastery] || 0) + 1
    })

    originData?.forEach(item => {
      originStats[item.origin] = (originStats[item.origin] || 0) + 1
    })

    return {
      totalProducts: totalProducts || 0,
      roasteryStats,
      originStats,
      recentCrawls: recentCrawls || 0
    }
  }

  /**
   * 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('count(*)')
        .limit(1)

      return !error
    } catch (error) {
      console.error('Supabase 연결 테스트 실패:', error)
      return false
    }
  }

  /**
   * 중복 제품 정리
   */
  async cleanupDuplicates(): Promise<number> {
    try {
      // 모든 제품 가져와서 클라이언트에서 중복 찾기
      const { data: allProducts } = await this.supabase
        .from(this.tableName)
        .select('id, product_url, created_at')
        .order('created_at', { ascending: false })

      if (!allProducts || allProducts.length === 0) {
        console.log('제품 없음')
        return 0
      }

      // URL별로 그룹핑해서 중복 찾기
      const urlGroups: { [key: string]: typeof allProducts } = {}
      
      allProducts.forEach(product => {
        if (!urlGroups[product.product_url]) {
          urlGroups[product.product_url] = []
        }
        urlGroups[product.product_url].push(product)
      })

      let removedCount = 0

      // 중복이 있는 URL들 처리
      for (const [url, products] of Object.entries(urlGroups)) {
        if (products.length > 1) {
          // 가장 최신 것을 제외하고 삭제
          const toDelete = products.slice(1) // 첫 번째(최신) 제외하고 삭제
          
          for (const item of toDelete) {
            const { error } = await this.supabase
              .from(this.tableName)
              .delete()
              .eq('id', item.id)

            if (!error) {
              removedCount++
            }
          }
        }
      }

      console.log(`🧹 중복 제품 ${removedCount}개 정리 완료`)
      return removedCount

    } catch (error) {
      console.error('중복 정리 실패:', error)
      return 0
    }
  }
}