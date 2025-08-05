/**
 * 네이버 스마트스토어 크롤러
 * 네이버 스마트스토어의 커피 제품 정보를 수집
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import { BaseCrawler } from '../base-crawler'
import { CoffeeProductData } from '../../types/coffee-data'

export class NaverSmartstoreCrawler extends BaseCrawler {
  /**
   * 제품 URL 목록 가져오기
   */
  protected async getProductUrls(): Promise<string[]> {
    const productUrls: string[] = []
    
    try {
      console.log(`🔍 ${this.config.name} 제품 목록 수집 중...`)
      
      const page = await this.getPage(`${this.config.crawlingConfig.baseUrl}${this.config.crawlingConfig.productListPath}`)
      
      // 네이버 스마트스토어 페이지 로딩 대기 (더 긴 시간)
      await this.delay(3000)
      
      // 상품 목록이 로드될 때까지 대기 - 네이버 스마트스토어의 실제 구조 반영
      const productSelector = 'a[href*="/noto-inc/products/"]'
      
      try {
        await page.waitForSelector(productSelector, { timeout: 10000 })
        console.log('✅ 제품 링크 선택자 발견됨')
      } catch (e) {
        console.log('⚠️ 제품 링크 선택자를 찾을 수 없음, 페이지 구조 확인 중...')
        
        // 페이지의 모든 링크를 확인해보기
        const allLinks = await page.$$eval('a[href]', (elements: any) => {
          return elements.slice(0, 10).map((a: any) => ({
            href: a.href,
            text: a.textContent?.trim() || ''
          }))
        })
        console.log('🔍 발견된 링크들:', allLinks)
      }
      
      // 제품 링크 추출 - 네이버 스마트스토어 구조에 맞춤
      const links = await page.evaluate(() => {
        // 더 구체적인 선택자들 시도
        const selectors = [
          'a[href*="/noto-inc/products/"]',
          'a[href*="/products/11187827321"]',
          'a[href*="/products/"]'
        ]
        
        let foundLinks: string[] = []
        
        for (const selector of selectors) {
          const elements = document.querySelectorAll(selector)
          if (elements.length > 0) {
            foundLinks = Array.from(elements).map(link => (link as HTMLAnchorElement).href)
            console.log(`선택자 "${selector}"로 ${foundLinks.length}개 링크 발견`)
            break
          }
        }
        
        return foundLinks
      })
      
      console.log(`📋 추출된 원시 링크: ${links.length}개`)
      if (links.length > 0) {
        console.log('첫 번째 링크:', links[0])
      }
      
      // 중복 제거 및 필터링
      const uniqueLinks = Array.from(new Set(links))
      const filteredLinks = uniqueLinks.filter(url => 
        new RegExp(this.config.crawlingConfig.productUrlPattern).test(url)
      )
      
      productUrls.push(...filteredLinks)
      
      // 페이지네이션은 일단 스킵 (1개 제품만 있음)
      
      await page.close()
      
      console.log(`✅ ${this.config.name}: ${productUrls.length}개 제품 URL 수집 완료`)
      if (productUrls.length > 0) {
        console.log('수집된 URL들:', productUrls)
      }
      
    } catch (error) {
      console.error(`❌ ${this.config.name} 제품 목록 수집 실패:`, error)
    }
    
    return productUrls
  }

  /**
   * 페이지네이션 처리
   */
  private async handlePagination(page: any, productUrls: string[]): Promise<void> {
    try {
      // 네이버 스마트스토어는 무한 스크롤 형태가 많음
      let hasMoreItems = true
      let scrollAttempts = 0
      const maxScrolls = 5 // 최대 5번 스크롤
      
      while (hasMoreItems && scrollAttempts < maxScrolls) {
        // 현재 상품 수 확인
        const initialCount = productUrls.length
        
        // 페이지 하단으로 스크롤
        await page.evaluate(() => {
          window.scrollTo(0, document.body.scrollHeight)
        })
        
        // 로딩 대기
        await this.delay(2000)
        
        // 새로운 상품 링크 수집
        const newLinks = await page.$$eval('[href*="/products/"]', (elements: any) => {
          return elements
            .map((el: any) => el.href as string)
            .filter((href: string) => href && href.includes('/products/'))
        })
        
        // 중복 제거 후 추가
        const uniqueNewLinks = Array.from(new Set(newLinks)) as string[]
        const filteredNewLinks = uniqueNewLinks.filter((url: string) => 
          !productUrls.includes(url) && 
          new RegExp(this.config.crawlingConfig.productUrlPattern).test(url)
        )
        
        productUrls.push(...filteredNewLinks)
        
        // 새로운 아이템이 없으면 종료
        if (productUrls.length === initialCount) {
          hasMoreItems = false
        }
        
        scrollAttempts++
        console.log(`📜 스크롤 ${scrollAttempts}: ${productUrls.length - initialCount}개 신규 상품 발견`)
      }
      
    } catch (error) {
      console.log(`ℹ️ 페이지네이션 처리 완료 또는 에러:`, error)
    }
  }

  /**
   * 단일 제품 크롤링
   */
  protected async crawlProduct(url: string): Promise<CoffeeProductData | null> {
    let page: any = null
    
    try {
      page = await this.getPage(url)
      
      // 상품 페이지 로딩 대기
      await page.waitForSelector('.product_info, .product_detail', { timeout: 15000 })
      
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
        currency: 'KRW',
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
      // 네이버 스마트스토어 상품명 선택자들
      const nameSelectors = [
        '.product_title h1',
        '.product_info h1', 
        '.product_detail h1',
        'h1[class*="product"]',
        '.product_name',
        '[data-testid*="product-title"]'
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
          // 해당 선택자가 없으면 계속 진행
        }
      }
      
      // 페이지 타이틀에서 추출 (fallback)
      const title = await page.title()
      if (title && !title.includes('네이버') && !title.includes('스마트스토어')) {
        return title.replace(/\s*-\s*.*$/, '').trim() // " - 네이버쇼핑" 등 제거
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
      // 페이지 텍스트에서 원산지 패턴 찾기
      const pageText = await page.evaluate(() => document.body.textContent || '')
      
      // 한국어 원산지 패턴
      const originPatterns = [
        /(에티오피아|콜롬비아|파나마|케냐|페루|온두라스|과테말라|니카라과|볼리비아|에콰도르|브라질|코스타리카|예멘|탄자니아|자메이카|인도네시아|베트남|인도|하와이)/i,
        /(Ethiopia|Colombia|Panama|Kenya|Peru|Honduras|Guatemala|Nicaragua|Bolivia|Ecuador|Brazil|Costa Rica|Yemen|Tanzania|Jamaica|Indonesia|Vietnam|India|Hawaii)/i
      ]
      
      for (const pattern of originPatterns) {
        const match = pageText.match(pattern)
        if (match) {
          return match[1]
        }
      }
      
      // 상품 설명에서 원산지 찾기
      const descriptionSelectors = [
        '.product_description',
        '.product_detail',
        '.product_info_text',
        '[class*="description"]'
      ]
      
      for (const selector of descriptionSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const text = await page.evaluate((el: any) => el.textContent, element)
            if (text) {
              for (const pattern of originPatterns) {
                const match = text.match(pattern)
                if (match) {
                  return match[1]
                }
              }
            }
          }
        } catch (e) {
          // 계속 진행
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
        '.product_price .price',
        '.price_area .price',
        '[class*="price"]',
        '.product_info .price',
        '.product_detail .price'
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
      // 상품 설명에서 맛 관련 키워드 찾기
      const pageText = await page.evaluate(() => document.body.textContent || '')
      
      const tasteKeywords = [
        '자스민', '복숭아', '얼그레이', '레몬', '오렌지', '초콜릿', '바닐라',
        '견과류', '캐러멜', '블루베리', '체리', '딸기', '포도', '사과',
        '꽃향기', '꿀', '설탕', '계피', '향신료', '허브'
      ]
      
      const foundNotes: string[] = []
      
      for (const keyword of tasteKeywords) {
        if (pageText.includes(keyword)) {
          foundNotes.push(keyword)
        }
      }
      
      return foundNotes.slice(0, 5) // 최대 5개까지
      
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
            (src.includes('shopping.pstatic.net') || 
             src.includes('shop.pstatic.net') ||
             src.includes('img.shop.naver.net')) &&
            !src.includes('icon') &&
            !src.includes('logo')
          )
      })
      
      return images.map((src: string) => this.resolveImageUrl(src)).slice(0, 10) // 최대 10개
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
      const pageText = await page.evaluate(() => document.body.textContent || '')
      
      const varietyPatterns = [
        /(게이샤|부르봉|티피카|SL28|SL34|파카마라|카투라|수단루메|카티모르|문도노보)/i,
        /(Geisha|Bourbon|Typica|Pacamara|Caturra|Sudan Rume|Catimor|Mundo Novo)/i
      ]
      
      for (const pattern of varietyPatterns) {
        const match = pageText.match(pattern)
        if (match) {
          return match[1]
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
      const pageText = await page.evaluate(() => document.body.textContent || '')
      
      const processingPatterns = [
        /(워시드|washed|내추럴|natural|허니|honey|무산소|anaerobic|세미워시드|semi-washed)/i
      ]
      
      for (const pattern of processingPatterns) {
        const match = pageText.match(pattern)
        if (match) {
          return match[1]
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
      const pageText = await page.evaluate(() => document.body.textContent || '')
      
      const roastPatterns = [
        /(라이트|light|미디엄|medium|다크|dark|시티|city|풀시티|full city)/i
      ]
      
      for (const pattern of roastPatterns) {
        const match = pageText.match(pattern)
        if (match) {
          return match[1]
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
    // 상품 대표 이미지를 라벨로 사용
    return images[0]
  }
}