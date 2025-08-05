/**
 * Base Coffee Crawler Class
 * 모든 로스터리 크롤러의 기본 클래스
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import puppeteer, { Browser, Page } from 'puppeteer'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { CoffeeProductData, RoasteryConfig, CrawlingResult, CrawlingError } from '../types/coffee-data'

export abstract class BaseCrawler {
  protected browser: Browser | null = null
  protected config: RoasteryConfig
  protected errors: CrawlingError[] = []
  protected startTime: Date = new Date()

  constructor(config: RoasteryConfig) {
    this.config = config
  }

  /**
   * 브라우저 초기화
   */
  async initBrowser(): Promise<void> {
    console.log(`🚀 ${this.config.name} 크롤러 시작`)
    
    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--max_old_space_size=4096'
      ],
      protocolTimeout: 60000,
      timeout: 60000
    })
  }

  /**
   * 브라우저 정리
   */
  async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }

  /**
   * 메인 크롤링 실행
   */
  async crawl(): Promise<CrawlingResult> {
    const startTime = Date.now()
    let totalProducts = 0
    let successfulProducts = 0
    let products: CoffeeProductData[] = []

    try {
      await this.initBrowser()
      
      // robots.txt 확인
      await this.checkRobotsTxt()
      
      // 제품 목록 가져오기
      const productUrls = await this.getProductUrls()
      totalProducts = productUrls.length
      
      console.log(`📋 ${this.config.name}: ${totalProducts}개 제품 발견`)
      
      // 각 제품 크롤링 (전체 제품 처리)
      const maxProducts = productUrls.length // 전체 제품 크롤링
      for (let i = 0; i < maxProducts; i++) {
        const url = productUrls[i]
        
        try {
          console.log(`⚡ [${i + 1}/${maxProducts}] 크롤링: ${url}`)
          
          const product = await this.crawlProduct(url)
          if (product) {
            products.push(product)
            successfulProducts++
            console.log(`✅ 수집 성공: ${product.coffeeName} (${product.origin})`)
          }
          
          // 요청 간격 준수
          await this.delay(this.config.crawlingConfig.requestDelay)
          
        } catch (error) {
          console.error(`❌ 크롤링 에러 [${url}]:`, (error as Error).message)
          this.logError(url, error as Error)
        }
      }
      
      // 데이터 저장
      await this.saveProducts(products)
      
    } catch (error) {
      console.error(`❌ ${this.config.name} 크롤링 실패:`, error)
    } finally {
      await this.closeBrowser()
    }

    const duration = Date.now() - startTime
    
    return {
      roasteryId: this.config.id,
      success: successfulProducts > 0,
      totalProducts,
      successfulProducts,
      failedProducts: totalProducts - successfulProducts,
      errors: this.errors,
      duration,
      timestamp: new Date()
    }
  }

  /**
   * robots.txt 확인
   */
  protected async checkRobotsTxt(): Promise<void> {
    try {
      const robotsUrl = `${this.config.crawlingConfig.baseUrl}/robots.txt`
      const response = await axios.get(robotsUrl, { timeout: 5000 })
      
      const robotsTxt = response.data.toLowerCase()
      const crawlerAllowed = !robotsTxt.includes('disallow: /')
      
      if (!crawlerAllowed) {
        console.warn(`⚠️ ${this.config.name}: robots.txt에서 크롤링을 제한합니다`)
      } else {
        console.log(`✅ ${this.config.name}: robots.txt 확인 완료`)
      }
    } catch (error) {
      console.log(`ℹ️ ${this.config.name}: robots.txt 확인 실패 (계속 진행)`)
    }
  }

  /**
   * 제품 URL 목록 가져오기 (서브클래스에서 구현)
   */
  protected abstract getProductUrls(): Promise<string[]>

  /**
   * 단일 제품 크롤링 (서브클래스에서 구현)
   */
  protected abstract crawlProduct(url: string): Promise<CoffeeProductData | null>

  /**
   * 공통 페이지 가져오기 유틸리티
   */
  protected async getPage(url: string): Promise<Page> {
    if (!this.browser) {
      throw new Error('브라우저가 초기화되지 않았습니다')
    }

    const page = await this.browser.newPage()
    
    // 더욱 현실적인 User-Agent 설정 (네이버 스마트스토어 감지 우회)
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36')
    
    // 추가 헤더 설정으로 봇 감지 우회
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept-Encoding': 'gzip, deflate, br',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Cache-Control': 'max-age=0'
    })
    
    // 뷰포트 설정 (실제 브라우저처럼)
    await page.setViewport({ width: 1920, height: 1080 })
    
    // 요청 딜레이
    await this.delay(this.config.crawlingConfig.requestDelay)
    
    // 페이지 로드 타임아웃
    await page.goto(url, { 
      waitUntil: 'networkidle2', 
      timeout: 30000 
    })
    
    return page
  }

  /**
   * HTML 파싱 유틸리티
   */
  protected async getHTML(url: string): Promise<cheerio.CheerioAPI> {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      timeout: 10000
    })
    
    return cheerio.load(response.data) as cheerio.CheerioAPI
  }

  /**
   * 텍스트 정리 유틸리티
   */
  protected cleanText(text: string): string {
    return text
      .replace(/\s+/g, ' ')      // 연속 공백 제거
      .replace(/\n+/g, ' ')      // 줄바꿈 제거
      .trim()                    // 앞뒤 공백 제거
  }

  /**
   * 가격 추출 유틸리티
   */
  protected extractPrice(text: string): number | undefined {
    const match = text.match(this.config.parsingRules.priceExtractor)
    if (match) {
      const price = parseInt(match[1].replace(/,/g, ''))
      return isNaN(price) ? undefined : price
    }
    return undefined
  }

  /**
   * 테이스팅 노트 파싱
   */
  protected parseTastingNotes(text: string): string[] {
    if (!text) return []
    
    switch (this.config.parsingRules.notesParser) {
      case 'comma_separated':
        return text.split(',').map(note => note.trim()).filter(Boolean)
      
      case 'line_separated':
        return text.split('\n').map(note => note.trim()).filter(Boolean)
      
      default:
        return [text.trim()]
    }
  }

  /**
   * 이미지 URL 정리
   */
  protected resolveImageUrl(src: string): string {
    if (src.startsWith('http')) {
      return src
    } else if (src.startsWith('//')) {
      return `https:${src}`
    } else if (src.startsWith('/')) {
      return `${this.config.crawlingConfig.baseUrl}${src}`
    } else {
      return `${this.config.crawlingConfig.baseUrl}/${src}`
    }
  }

  /**
   * 데이터 품질 검증
   */
  protected validateProduct(product: CoffeeProductData): boolean {
    // 필수 필드 검증
    if (!product.coffeeName || !product.origin || !product.roastery) {
      return false
    }
    
    // URL 유효성 검증
    if (!product.productUrl || !product.productUrl.startsWith('http')) {
      return false
    }
    
    // 품질 점수 계산
    let score = 0
    if (product.coffeeName) score += 20
    if (product.origin) score += 20
    if (product.tastingNotes.length > 0) score += 20
    if (product.labelImageUrl) score += 20
    if (product.variety) score += 10
    if (product.processing) score += 10
    
    product.qualityScore = score
    
    return score >= 60 // 최소 60점 이상
  }

  /**
   * 딜레이 유틸리티
   */
  protected async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 에러 로깅
   */
  protected logError(url: string, error: Error): void {
    const errorInfo: CrawlingError = {
      url,
      error: error.message,
      retries: 0,
      timestamp: new Date()
    }
    
    this.errors.push(errorInfo)
    console.error(`❌ 크롤링 에러 [${url}]:`, error.message)
  }

  /**
   * 제품 데이터 저장 (Supabase + JSON 백업)
   */
  protected async saveProducts(products: CoffeeProductData[]): Promise<void> {
    console.log(`💾 ${products.length}개 제품 저장 시작`)
    
    // 1. JSON 파일로 백업 저장 (항상 수행)
    const fs = require('fs')
    const filename = `./crawl-results-${this.config.id}-${Date.now()}.json`
    fs.writeFileSync(filename, JSON.stringify(products, null, 2))
    console.log(`📄 JSON 백업: ${filename}`)
    
    // 2. Supabase에 저장 시도
    try {
      const { SupabaseStorageService } = await import('../services/supabase-storage')
      const storageService = new SupabaseStorageService()
      
      // 연결 테스트
      const isConnected = await storageService.testConnection()
      if (!isConnected) {
        console.warn('⚠️ Supabase 연결 실패, JSON 파일만 저장됨')
        return
      }
      
      // 데이터 저장
      const result = await storageService.storeProducts(products)
      
      if (result.success) {
        console.log(`✅ Supabase 저장 성공: ${result.insertedCount}개 신규, ${result.updatedCount}개 업데이트`)
      } else {
        console.warn(`⚠️ Supabase 저장 부분 실패: ${result.errors.length}개 에러`)
      }
      
    } catch (error) {
      console.error(`❌ Supabase 저장 실패:`, (error as Error).message)
      console.log(`📄 JSON 백업만 유지: ${filename}`)
    }
  }

  /**
   * 크롤링 통계 출력
   */
  protected printStats(result: CrawlingResult): void {
    console.log('\n📊 크롤링 결과:')
    console.log(`✅ 성공: ${result.successfulProducts}/${result.totalProducts}`)
    console.log(`❌ 실패: ${result.failedProducts}`)
    console.log(`⏱️ 소요시간: ${(result.duration / 1000).toFixed(1)}초`)
    console.log(`📈 성공률: ${((result.successfulProducts / result.totalProducts) * 100).toFixed(1)}%`)
  }
}