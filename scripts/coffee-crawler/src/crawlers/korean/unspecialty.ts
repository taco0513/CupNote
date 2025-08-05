/**
 * 언스페셜티 (Unspecialty) 크롤러
 * 한국의 대표적인 스페셜티 커피 마켓플레이스
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import { BaseCrawler } from '../base-crawler'
import { CoffeeProductData } from '../../types/coffee-data'

export class UnspecialtyCrawler extends BaseCrawler {
  /**
   * 제품 URL 목록 가져오기
   */
  protected async getProductUrls(): Promise<string[]> {
    const productUrls: string[] = []
    
    try {
      console.log(`🔍 ${this.config.name} 제품 목록 수집 중...`)
      
      const page = await this.getPage(`${this.config.crawlingConfig.baseUrl}${this.config.crawlingConfig.productListPath}`)
      
      // 제품 링크 추출
      const links = await page.$$eval(this.config.selectors.productLinks, (elements) => {
        return elements.map(el => (el as HTMLAnchorElement).href).filter(Boolean)
      })
      
      // 중복 제거 및 필터링
      const uniqueLinks = Array.from(new Set(links))
      const filteredLinks = uniqueLinks.filter(url => 
        new RegExp(this.config.crawlingConfig.productUrlPattern).test(url)
      )
      
      productUrls.push(...filteredLinks)
      
      // 페이지네이션 처리 (필요시)
      await this.handlePagination(page, productUrls)
      
      await page.close()
      
      console.log(`✅ ${this.config.name}: ${productUrls.length}개 제품 URL 수집 완료`)
      
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
      let currentPage = 1
      const maxPages = 10 // 최대 10페이지까지 탐색
      
      console.log('📄 페이지네이션 탐색 시작...')
      
      while (currentPage < maxPages) {
        // 다음 페이지 링크 찾기 - 다양한 선택자 시도
        const nextPageSelectors = [
          `.pagination a:contains('${currentPage + 1}')`,
          `.paging a:contains('${currentPage + 1}')`,
          `a[href*='page=${currentPage + 1}']`,
          `a[href*='p=${currentPage + 1}']`,
          '.pagination .next:not(.disabled)',
          '.paging .next:not(.disabled)'
        ]
        
        let nextPageLink = null
        
        for (const selector of nextPageSelectors) {
          try {
            // 직접 evaluate로 찾기 (jQuery 선택자 지원)
            const found = await page.evaluate((sel: string) => {
              const links = document.querySelectorAll('a')
              for (const link of links) {
                if (link.textContent?.includes((currentPage + 1).toString()) || 
                    link.href.includes(`page=${currentPage + 1}`) ||
                    link.href.includes(`p=${currentPage + 1}`)) {
                  return link.href
                }
              }
              return null
            }, selector)
            
            if (found) {
              nextPageLink = found
              break
            }
          } catch (e) {
            // 선택자 에러 무시
          }
        }
        
        if (!nextPageLink) {
          console.log(`📄 페이지 ${currentPage}가 마지막 페이지입니다`)
          break
        }
        
        console.log(`📄 페이지 ${currentPage + 1}로 이동: ${nextPageLink}`)
        
        // 페이지 이동
        await page.goto(nextPageLink, { waitUntil: 'networkidle2' })
        await this.delay(2000) // 페이지 로딩 대기
        
        // 새 페이지에서 제품 링크 수집
        const moreLinks = await page.$$eval(this.config.selectors.productLinks, (elements: any) => {
          return elements.map((el: any) => el.href).filter(Boolean)
        })
        
        const newLinks = moreLinks.filter((url: string) => !productUrls.includes(url))
        
        if (newLinks.length === 0) {
          console.log('📄 더 이상 새로운 제품이 없습니다')
          break
        }
        
        productUrls.push(...newLinks)
        console.log(`✅ 페이지 ${currentPage + 1}에서 ${newLinks.length}개 제품 추가 발견 (총 ${productUrls.length}개)`)
        
        currentPage++
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
      
      if (!coffeeName || !origin) {
        console.warn(`⚠️ 필수 정보 누락: ${url}`)
        return null
      }
      
      const product: CoffeeProductData = {
        coffeeName: this.cleanText(coffeeName),
        roastery: this.config.name,
        roasteryUrl: this.config.url,
        origin: this.cleanText(origin),
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
      // 1. h2 제목 태그에서 추출 (가장 정확한 방법)
      const h2Elements = await page.$$('h2')
      for (const element of h2Elements) {
        const text = await page.evaluate((el: any) => el.textContent, element)
        if (text && text.trim() && !text.includes('상품 상세') && !text.includes('관련상품')) {
          // "[8월 커피 월픽] 딥블루레이크 (8/1 ~ 8/31)" → "딥블루레이크"
          const cleanName = text
            .replace(/\[[^\]]+\]/g, '') // 대괄호 제거
            .replace(/\([^)]+\)/g, '')  // 소괄호 제거
            .trim()
          
          if (cleanName && cleanName.length > 2) {
            return cleanName
          }
        }
      }
      
      // 2. 페이지 타이틀에서 추출
      const title = await page.title()
      if (title && title !== '언스페셜티 몰' && !title.includes('상품 상세')) {
        // "8월 커피 월픽 딥블루레이크 - 언스페셜티 몰" → "딥블루레이크"
        let productName = title.replace(/\s*-\s*언스페셜티 몰\s*$/, '').trim()
        
        // 월픽, 특별한 설명 제거하고 핵심 커피명만 추출
        productName = productName
          .replace(/\d+월\s*커피\s*월픽\s*/g, '') // "8월 커피 월픽" 제거
          .replace(/^\[.*?\]\s*/, '')             // 시작 대괄호 제거
          .replace(/\s*\(.*?\)\s*$/, '')          // 끝 소괄호 제거
          .trim()
        
        if (productName && productName.length > 2) {
          return productName
        }
      }
      
      // 3. h1 태그에서 추출
      const h1Element = await page.$('h1')
      if (h1Element) {
        const text = await page.evaluate((el: any) => el.textContent, h1Element)
        if (text && text.trim() && !text.includes('상품 상세')) {
          return text.trim()
        }
      }
      
      // 4. 제품명 클래스에서 추출
      const nameSelectors = ['.product-title', '.prd-name', '.item-name', '.coffee-name']
      for (const selector of nameSelectors) {
        try {
          const element = await page.$(selector)
          if (element) {
            const text = await page.evaluate((el: any) => el.textContent, element)
            if (text && text.trim() && !text.includes('상품 상세')) {
              return text.trim()
            }
          }
        } catch (e) {
          // 해당 선택자가 없으면 계속 진행
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
      // 1. 옵션 드롭다운에서 커피 정보 추출
      const options = await page.evaluate(() => {
        const selectElement = document.querySelector('select')
        if (selectElement) {
          const options = Array.from(selectElement.options)
          return options.map(option => option.textContent?.trim()).filter(Boolean)
        }
        return []
      })
      
      // 옵션에서 원산지 정보 찾기
      for (const option of options) {
        if (option && typeof option === 'string') {
          // "에티오피아", "콜롬비아", "파나마" 등의 패턴 찾기
          const countryMatch = option.match(/(에티오피아|콜롬비아|파나마|케냐|페루|온두라스|과테말라|니카라과|볼리비아|에콰도르|브라질|코스타리카|예멘|탄자니아)/i)
          if (countryMatch) {
            return countryMatch[1]
          }
        }
      }
      
      // 2. 페이지 텍스트에서 원산지 패턴 찾기
      const pageText = await page.evaluate(() => document.body.textContent || '')
      const countryMatch = pageText.match(/(에티오피아|콜롬비아|파나마|케냐|페루|온두라스|과테말라|니카라과|볼리비아|에콰도르|브라질|코스타리카|예멘|탄자니아)/i)
      if (countryMatch) {
        return countryMatch[1]
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
      const element = await page.$(this.config.selectors.price)
      if (element) {
        const text = await page.evaluate((el: any) => el.textContent, element)
        if (text) {
          return this.extractPrice(text) || null // BaseCrawler의 extractPrice 유틸리티 메서드 호출
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
      // Unspecialty는 제품 옵션에서 맛 특성을 확인할 수 있으므로
      // 일단 빈 배열 반환하고 나중에 개선
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
      const images = await page.$$eval(this.config.selectors.images, (elements: any) => {
        return elements.map((img: any) => img.src || img.dataset.src).filter(Boolean)
      })
      
      return images.map((src: string) => this.resolveImageUrl(src))
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
      // 옵션에서 게이샤, 부르봉 등의 품종 찾기
      const options = await page.evaluate(() => {
        const selectElement = document.querySelector('select')
        if (selectElement) {
          const options = Array.from(selectElement.options)
          return options.map(option => option.textContent?.trim()).filter(Boolean)
        }
        return []
      })
      
      for (const option of options) {
        if (option && typeof option === 'string') {
          const varietyMatch = option.match(/(게이샤|부르봉|티피카|SL28|SL34|파카마라|카투라|수단루메)/i)
          if (varietyMatch) {
            return varietyMatch[1]
          }
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
      // 옵션에서 워시드, 내추럴, 허니 등의 가공법 찾기
      const options = await page.evaluate(() => {
        const selectElement = document.querySelector('select')
        if (selectElement) {
          const options = Array.from(selectElement.options)
          return options.map(option => option.textContent?.trim()).filter(Boolean)
        }
        return []
      })
      
      for (const option of options) {
        if (option && typeof option === 'string') {
          const processingMatch = option.match(/(워시드|washed|내추럴|natural|허니|honey|무산소|anaerobic)/i)
          if (processingMatch) {
            return processingMatch[1]
          }
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
      const text = await page.evaluate(() => {
        const elements = document.querySelectorAll('*')
        for (const el of elements) {
          const content = el.textContent || ''
          if (content.includes('로스팅') || content.includes('roast')) {
            return content
          }
        }
        return null
      })
      
      if (text) {
        const levels = ['라이트', 'light', '미디엄', 'medium', '다크', 'dark']
        for (const level of levels) {
          if (text.toLowerCase().includes(level)) {
            return level
          }
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
    // 라벨 관련 키워드가 포함된 이미지 찾기
    const labelKeywords = ['label', 'bag', 'package', '라벨', '포장']
    
    for (const image of images) {
      for (const keyword of labelKeywords) {
        if (image.toLowerCase().includes(keyword)) {
          return image
        }
      }
    }
    
    // 키워드가 없으면 첫 번째 이미지 반환
    return images[0]
  }
}