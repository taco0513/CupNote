/**
 * Coffee Crawler Manager
 * 모든 크롤러를 관리하고 실행하는 메인 클래스
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import * as fs from 'fs'
import * as path from 'path'
import { BaseCrawler } from './crawlers/base-crawler'
import { UnspecialtyCrawler } from './crawlers/korean/unspecialty'
import { NaverSmartstoreCrawler } from './crawlers/korean/naver-smartstore'
import { MaruCoffeeCrawler } from './crawlers/global/maru-coffee'
import { RoasteryConfig, CrawlingResult } from './types/coffee-data'

export class CrawlerManager {
  private config: any
  private crawlers: Map<string, BaseCrawler> = new Map()
  
  constructor() {
    this.loadConfig()
    this.initializeCrawlers()
  }

  /**
   * 설정 파일 로드
   */
  private loadConfig(): void {
    const configPath = path.join(__dirname, '../config/roasteries.json')
    
    if (!fs.existsSync(configPath)) {
      throw new Error('로스터리 설정 파일을 찾을 수 없습니다: ' + configPath)
    }
    
    const configData = fs.readFileSync(configPath, 'utf-8')
    this.config = JSON.parse(configData)
    
    console.log('📋 설정 파일 로드 완료')
  }

  /**
   * 크롤러 초기화
   */
  private initializeCrawlers(): void {
    // 한국 로스터리 크롤러
    for (const roastery of this.config.korean) {
      if (roastery.isActive) {
        this.createCrawler(roastery)
      }
    }
    
    // 글로벌 로스터리 크롤러
    for (const roastery of this.config.global) {
      if (roastery.isActive) {
        this.createCrawler(roastery)
      }
    }
    
    console.log(`🤖 ${this.crawlers.size}개 크롤러 초기화 완료`)
  }

  /**
   * 로스터리별 크롤러 생성
   */
  private createCrawler(config: RoasteryConfig): void {
    let crawler: BaseCrawler

    switch (config.id) {
      case 'unspecialty':
        crawler = new UnspecialtyCrawler(config)
        break
      
      case 'noto-inc':
        crawler = new NaverSmartstoreCrawler(config)
        break
      
      case 'maru-coffee':
        crawler = new MaruCoffeeCrawler(config)
        break
      
      // TODO: 다른 로스터리 크롤러 추가
      // case 'nams':
      //   crawler = new NamsCrawler(config)
      //   break
      
      default:
        console.warn(`⚠️ 지원하지 않는 로스터리: ${config.id}`)
        return
    }

    this.crawlers.set(config.id, crawler)
    console.log(`✅ ${config.name} 크롤러 생성 완료`)
  }

  /**
   * 모든 크롤러 실행
   */
  async crawlAll(): Promise<CrawlingResult[]> {
    console.log('🚀 전체 크롤링 시작')
    console.log(`📊 대상: ${this.crawlers.size}개 로스터리`)
    
    const results: CrawlingResult[] = []
    const startTime = Date.now()
    
    for (const [roasteryId, crawler] of this.crawlers) {
      try {
        console.log(`\n⚡ [${roasteryId}] 크롤링 시작`)
        
        const result = await crawler.crawl()
        results.push(result)
        
        this.printCrawlerResult(result)
        
        // 글로벌 딜레이
        await this.delay(this.config.settings.globalDelay)
        
      } catch (error) {
        console.error(`❌ [${roasteryId}] 크롤링 실패:`, error)
        
        results.push({
          roasteryId,
          success: false,
          totalProducts: 0,
          successfulProducts: 0,
          failedProducts: 0,
          errors: [{ url: '', error: (error as Error).message, retries: 0, timestamp: new Date() }],
          duration: 0,
          timestamp: new Date()
        })
      }
    }
    
    const totalDuration = Date.now() - startTime
    this.printFinalStats(results, totalDuration)
    
    return results
  }

  /**
   * 특정 로스터리만 크롤링
   */
  async crawlRoastery(roasteryId: string): Promise<CrawlingResult | null> {
    const crawler = this.crawlers.get(roasteryId)
    
    if (!crawler) {
      console.error(`❌ 로스터리를 찾을 수 없습니다: ${roasteryId}`)
      console.log(`📋 사용 가능한 로스터리: ${Array.from(this.crawlers.keys()).join(', ')}`)
      return null
    }
    
    console.log(`🎯 [${roasteryId}] 단일 크롤링 시작`)
    
    try {
      const result = await crawler.crawl()
      this.printCrawlerResult(result)
      return result
    } catch (error) {
      console.error(`❌ [${roasteryId}] 크롤링 실패:`, error)
      return null
    }
  }

  /**
   * 사용 가능한 로스터리 목록
   */
  listRoasteries(): void {
    console.log('\n📋 사용 가능한 로스터리:')
    
    for (const [id, crawler] of this.crawlers) {
      const config = this.getConfigById(id)
      console.log(`  • ${id}: ${config?.name} (${config?.country})`)
    }
  }

  /**
   * 크롤러 결과 출력
   */
  private printCrawlerResult(result: CrawlingResult): void {
    const successRate = result.totalProducts > 0 
      ? ((result.successfulProducts / result.totalProducts) * 100).toFixed(1)
      : '0.0'
    
    console.log(`\n📊 [${result.roasteryId}] 크롤링 결과:`)
    console.log(`  ✅ 성공: ${result.successfulProducts}/${result.totalProducts} (${successRate}%)`)
    console.log(`  ❌ 실패: ${result.failedProducts}`)
    console.log(`  ⏱️ 소요시간: ${(result.duration / 1000).toFixed(1)}초`)
    
    if (result.errors.length > 0) {
      console.log(`  🚨 에러: ${result.errors.length}개`)
    }
  }

  /**
   * 최종 통계 출력
   */
  private printFinalStats(results: CrawlingResult[], totalDuration: number): void {
    const totalProducts = results.reduce((sum, r) => sum + r.totalProducts, 0)
    const totalSuccessful = results.reduce((sum, r) => sum + r.successfulProducts, 0)
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0)
    const successfulCrawlers = results.filter(r => r.success).length
    
    console.log('\n🎉 전체 크롤링 완료!')
    console.log('=' .repeat(50))
    console.log(`📊 전체 통계:`)
    console.log(`  🤖 크롤러: ${successfulCrawlers}/${results.length} 성공`)
    console.log(`  ☕ 제품: ${totalSuccessful}/${totalProducts} 수집`)
    console.log(`  📈 성공률: ${totalProducts > 0 ? ((totalSuccessful / totalProducts) * 100).toFixed(1) : '0.0'}%`)
    console.log(`  🚨 총 에러: ${totalErrors}개`)
    console.log(`  ⏱️ 총 소요시간: ${(totalDuration / 1000 / 60).toFixed(1)}분`)
    console.log('=' .repeat(50))
    
    // 결과 저장
    this.saveResults(results)
  }

  /**
   * 결과 저장
   */
  private saveResults(results: CrawlingResult[]): void {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const filename = `crawling-results-${timestamp}.json`
    const filepath = path.join(__dirname, '../results', filename)
    
    // results 디렉토리 생성
    const resultsDir = path.dirname(filepath)
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir, { recursive: true })
    }
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2))
    console.log(`💾 결과 저장: ${filename}`)
  }

  /**
   * 설정 정보 조회
   */
  private getConfigById(id: string): RoasteryConfig | null {
    const allConfigs = [...this.config.korean, ...this.config.global]
    return allConfigs.find((config: RoasteryConfig) => config.id === id) || null
  }

  /**
   * 딜레이 유틸리티
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 크롤러 정리
   */
  async cleanup(): Promise<void> {
    console.log('🧹 크롤러 정리 중...')
    // 필요시 브라우저 정리 등
    console.log('✅ 정리 완료')
  }
}

// CLI 실행을 위한 메인 함수
export async function main() {
  const manager = new CrawlerManager()
  
  try {
    // 명령행 인수 처리
    const args = process.argv.slice(2)
    const roasteryArg = args.find(arg => arg.startsWith('--roastery='))
    
    if (roasteryArg) {
      // 특정 로스터리만 크롤링
      const roasteryId = roasteryArg.split('=')[1]
      await manager.crawlRoastery(roasteryId)
    } else if (args.includes('--list')) {
      // 로스터리 목록 출력
      manager.listRoasteries()
    } else {
      // 전체 크롤링
      await manager.crawlAll()
    }
    
  } catch (error) {
    console.error('❌ 크롤링 매니저 에러:', error)
    process.exit(1)
  } finally {
    await manager.cleanup()
  }
}

// 직접 실행 시
if (require.main === module) {
  main()
}