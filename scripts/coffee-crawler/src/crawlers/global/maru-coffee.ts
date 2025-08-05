/**
 * Maru Coffee Crawler
 * 마루 커피 US 웹사이트 크롤러
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import { BaseCrawler } from '../base-crawler'
import { CoffeeProductData } from '../../types/coffee-data'

export class MaruCoffeeCrawler extends BaseCrawler {
  /**
   * 제품 URL 목록 가져오기
   */
  protected async getProductUrls(): Promise<string[]> {
    const productUrls: string[] = []
    
    try {
      console.log(`🔍 ${this.config.name} 제품 목록 수집 중...`)
      
      const page = await this.getPage(`${this.config.crawlingConfig.baseUrl}${this.config.crawlingConfig.productListPath}`)
      
      // 페이지 로딩 대기
      await this.delay(2000)
      
      // 제품 목록 페이지에서 커피 필터 적용 (Coffee 카테고리만)
      const coffeeCategorySelector = 'a[href*="/collections/coffee"]'
      const coffeeFilter = await page.$(coffeeCategorySelector)
      
      if (coffeeFilter) {
        await coffeeFilter.click()
        await page.waitForNavigation({ waitUntil: 'networkidle2' })
      }
      
      // 제품 링크 추출
      const links = await page.$$eval('a[href*="/products/"]', (elements: any) => {
        return elements
          .map((el: any) => el.href)
          .filter((href: string) => 
            href && 
            href.includes('/products/') &&
            !href.includes('/collections/') &&
            !href.includes('#')
          )
      })
      
      // 중복 제거
      const uniqueLinks = Array.from(new Set(links as string[]))
      productUrls.push(...uniqueLinks)
      
      await page.close()
      
      console.log(`✅ ${this.config.name}: ${productUrls.length}개 제품 URL 수집 완료`)
      
    } catch (error) {
      console.error(`❌ ${this.config.name} 제품 목록 수집 실패:`, error)
    }
    
    return productUrls
  }

  /**
   * 단일 제품 크롤링
   */
  protected async crawlProduct(url: string): Promise<CoffeeProductData | null> {
    let page: any = null
    
    try {
      page = await this.getPage(url)
      
      // 상품 페이지 로딩 대기
      await page.waitForSelector('h1, .product__title', { timeout: 15000 })
      
      // 기본 정보 추출
      const coffeeName = await this.extractCoffeeName(page)
      const origin = await this.extractOrigin(page)
      const price = await this.extractPriceFromPage(page)
      const tastingNotes = await this.extractTastingNotes(page)
      const images = await this.extractImages(page)
      
      // 추가 정보 추출
      const variety = await this.extractVariety(page)
      const processing = await this.extractProcessing(page)
      const roastLevel = await this.extractRoastLevel(page)
      
      if (!coffeeName) {
        console.warn(`⚠️ 커피명 추출 실패: ${url}`)
        return null
      }
      
      const product: CoffeeProductData = {
        coffeeName: this.cleanText(coffeeName),
        roastery: this.config.name,
        roasteryUrl: this.config.url,
        origin: origin ? this.cleanText(origin) : '정보 없음',
        variety: variety ? this.cleanText(variety) : undefined,
        processing: processing ? this.cleanText(processing) : undefined,
        roastLevel: roastLevel ? this.cleanText(roastLevel) : undefined,
        tastingNotes: tastingNotes || [],
        price: price || undefined,
        currency: 'USD',
        productUrl: url,
        imageUrls: images,
        labelImageUrl: this.findLabelImage(images),
        crawledAt: new Date(),
        source: 'web_crawled',
        verified: false,
        qualityScore: 0 // validateProduct에서 계산됨
      }
      
      // 데이터 품질 검증
      if (!this.validateProduct(product)) {
        console.warn(`⚠️ 품질 검증 실패: ${url}`)
        return null
      }
      
      console.log(`✅ 수집 완료: ${product.coffeeName} (${product.origin})`)
      return product
      
    } catch (error) {
      console.error(`❌ 제품 크롤링 실패 [${url}]:`, error)
      return null
    } finally {
      if (page) {
        await page.close()
      }
    }
  }

  /**
   * 커피명 추출
   */
  private async extractCoffeeName(page: any): Promise<string | null> {
    try {
      const nameSelectors = [
        'h1.product__title',
        'h1[itemprop="name"]',
        '.product-single__title',
        'h1',
        '.product-name'
      ]
      
      for (const selector of nameSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const text = await page.evaluate((el: any) => el.textContent, element)
            if (text && text.trim()) {
              return text.trim()
            }
          }
        } catch (e) {
          // 선택자 에러 무시
        }
      }
      
    } catch (error) {
      console.warn('커피명 추출 실패:', error)
    }
    return null
  }

  /**
   * 원산지 추출
   */
  private async extractOrigin(page: any): Promise<string | null> {
    try {
      // 제품 설명에서 원산지 찾기
      const descriptionText = await page.evaluate(() => {
        const desc = document.querySelector('.product__description, .product-single__description, .rte')
        return desc ? desc.textContent : ''
      })
      
      // 원산지 패턴 매칭
      const originPatterns = [
        /(Ethiopia|Colombia|Guatemala|Kenya|Brazil|Peru|Honduras|Costa Rica|Mexico|El Salvador|Nicaragua|Panama|Rwanda|Burundi|Yemen|Indonesia|Vietnam|India|Jamaica|Hawaii)/i
      ]
      
      for (const pattern of originPatterns) {
        const match = descriptionText.match(pattern)
        if (match) {
          return match[1]
        }
      }
      
      // 제목에서도 찾기
      const title = await this.extractCoffeeName(page)
      if (title) {
        for (const pattern of originPatterns) {
          const match = title.match(pattern)
          if (match) {
            return match[1]
          }
        }
      }
      
    } catch (error) {
      console.warn('원산지 추출 실패:', error)
    }
    return null
  }

  /**
   * 가격 추출
   */
  private async extractPriceFromPage(page: any): Promise<number | null> {
    try {
      const priceSelectors = [
        '.product__price',
        '.price__regular',
        '.product-single__price',
        '[data-price]',
        '.price',
        'span[itemprop="price"]'
      ]
      
      for (const selector of priceSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const text = await page.evaluate((el: any) => el.textContent, element)
            if (text) {
              const price = this.extractPrice(text)
              if (price) {
                return price
              }
            }
          }
        } catch (e) {
          // 계속 진행
        }
      }
      
    } catch (error) {
      console.warn('가격 추출 실패:', error)
    }
    return null
  }

  /**
   * 테이스팅 노트 추출
   */
  private async extractTastingNotes(page: any): Promise<string[]> {
    try {
      const descriptionText = await page.evaluate(() => {
        const desc = document.querySelector('.product__description, .product-single__description, .rte')
        return desc ? desc.textContent : ''
      })
      
      // Tasting Notes 패턴 찾기
      const notesPattern = /(?:Tasting Notes?|Notes?|Flavor Notes?)[:\s]+([^.]+)/i
      const match = descriptionText.match(notesPattern)
      
      if (match && match[1]) {
        // 쉼표, 앤드(&), 슬래시로 분리
        return match[1]
          .split(/[,&/]/)
          .map((note: string) => note.trim())
          .filter((note: string) => note.length > 1 && note.length < 50)
      }
      
      return []
      
    } catch (error) {
      console.warn('테이스팅 노트 추출 실패:', error)
    }
    return []
  }

  /**
   * 이미지 추출
   */
  private async extractImages(page: any): Promise<string[]> {
    try {
      const images = await page.$$eval('img', (elements: any) => {
        return elements
          .map((img: any) => img.src || img.dataset.src)
          .filter((src: string) => 
            src && 
            (src.includes('cdn.shopify.com') || src.includes('marucoffee.com')) &&
            !src.includes('logo') &&
            !src.includes('icon') &&
            !src.includes('payment')
          )
      })
      
      return images.map((src: string) => this.resolveImageUrl(src)).slice(0, 10)
    } catch (error) {
      console.warn('이미지 추출 실패:', error)
      return []
    }
  }

  /**
   * 품종 추출
   */
  private async extractVariety(page: any): Promise<string | null> {
    try {
      const descriptionText = await page.evaluate(() => {
        const desc = document.querySelector('.product__description, .product-single__description, .rte')
        return desc ? desc.textContent : ''
      })
      
      const varietyPatterns = [
        /(?:Variety|Varietal)[:\s]+([A-Za-z\s,&]+)/i,
        /(Geisha|Gesha|Bourbon|Typica|Caturra|Catuai|Pacamara|SL28|SL34|Heirloom|Pink Bourbon|Red Bourbon|Yellow Bourbon)/i
      ]
      
      for (const pattern of varietyPatterns) {
        const match = descriptionText.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }
      
    } catch (error) {
      console.warn('품종 추출 실패:', error)
    }
    return null
  }

  /**
   * 가공법 추출
   */
  private async extractProcessing(page: any): Promise<string | null> {
    try {
      const descriptionText = await page.evaluate(() => {
        const desc = document.querySelector('.product__description, .product-single__description, .rte')
        return desc ? desc.textContent : ''
      })
      
      const processingPatterns = [
        /(?:Process|Processing)[:\s]+([A-Za-z\s]+)/i,
        /(Washed|Natural|Honey|Anaerobic|Semi-washed|Wet Hulled|Carbonic Maceration|Extended Fermentation)/i
      ]
      
      for (const pattern of processingPatterns) {
        const match = descriptionText.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }
      
    } catch (error) {
      console.warn('가공법 추출 실패:', error)
    }
    return null
  }

  /**
   * 로스팅 레벨 추출
   */
  private async extractRoastLevel(page: any): Promise<string | null> {
    try {
      const descriptionText = await page.evaluate(() => {
        const desc = document.querySelector('.product__description, .product-single__description, .rte')
        return desc ? desc.textContent : ''
      })
      
      const roastPatterns = [
        /(?:Roast Level?|Roast)[:\s]+([A-Za-z\s]+)/i,
        /(Light|Medium|Medium-Dark|Dark|City|Full City|Vienna|French|Italian)/i
      ]
      
      for (const pattern of roastPatterns) {
        const match = descriptionText.match(pattern)
        if (match) {
          return match[1].trim()
        }
      }
      
    } catch (error) {
      console.warn('로스팅 레벨 추출 실패:', error)
    }
    return null
  }

  /**
   * 라벨 이미지 찾기
   */
  private findLabelImage(images: string[]): string | undefined {
    // 첫 번째 제품 이미지를 라벨로 사용
    return images.find(img => 
      img.includes('product') || 
      img.includes('coffee') ||
      !img.includes('lifestyle')
    ) || images[0]
  }
}