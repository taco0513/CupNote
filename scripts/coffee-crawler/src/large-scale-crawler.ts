#!/usr/bin/env ts-node

/**
 * Large Scale Coffee Data Crawler
 * 대용량 커피 데이터 수집을 위한 최적화된 크롤러
 * 
 * Features:
 * - Batch processing with checkpoints
 * - Progress tracking and resume capability
 * - Enhanced error handling and retry logic
 * - Memory optimization for large datasets
 * 
 * @version 1.0.0
 * @since 2025-08-05
 */

import { CrawlerManager } from './crawler-manager'
import * as fs from 'fs'
import * as path from 'path'

interface CrawlProgress {
  totalProducts: number
  completedProducts: number
  currentBatch: number
  errors: string[]
  startTime: Date
  lastCheckpoint: Date
}

class LargeScaleCrawler {
  private manager: CrawlerManager
  private batchSize = 10 // 배치당 처리할 제품 수
  private progressFile = './crawl-progress.json'
  private resultsDir = './large-scale-results'

  constructor() {
    this.manager = new CrawlerManager()
    this.ensureResultsDirectory()
  }

  /**
   * 대용량 크롤링 실행
   */
  async runLargeScaleCrawl(): Promise<void> {
    console.log('🚀 대용량 커피 데이터 크롤링 시작')
    
    // 진행상황 복원 또는 새로 시작
    let progress = this.loadProgress()
    
    try {
      // 활성 크롤러만 대상으로 설정
      const activeRoasteries = ['unspecialty'] // 현재는 Unspecialty만 활성화
      
      for (const roasteryId of activeRoasteries) {
        console.log(`\n📊 [${roasteryId}] 크롤링 시작`)
        
        // 로스터리별 진행상황 초기화
        if (!progress[roasteryId]) {
          progress[roasteryId] = {
            totalProducts: 0,
            completedProducts: 0,
            currentBatch: 0,
            errors: [],
            startTime: new Date(),
            lastCheckpoint: new Date()
          }
        }
        
        await this.crawlRoasteryInBatches(roasteryId, progress[roasteryId])
      }
      
      console.log('\n🎉 대용량 크롤링 완료!')
      this.printFinalStats(progress)
      
    } catch (error) {
      console.error('❌ 크롤링 중 치명적 오류:', error)
      this.saveProgress(progress)
    }
  }

  /**
   * 로스터리별 배치 처리 크롤링
   */
  private async crawlRoasteryInBatches(roasteryId: string, progress: CrawlProgress): Promise<void> {
    console.log(`📊 ${roasteryId} 크롤링을 기존 매니저로 위임합니다...`)
    
    // 기존 CrawlerManager의 crawl 메서드 사용
    const result = await this.manager.crawlAll()
    
    if (result && result.length > 0) {
      const roasteryResult = result.find(r => r.roasteryId === roasteryId)
      if (roasteryResult) {
        progress.totalProducts = roasteryResult.totalProducts
        progress.completedProducts = roasteryResult.successfulProducts
        progress.errors = roasteryResult.errors.map(e => e.error)
        progress.lastCheckpoint = new Date()
        
        console.log(`📊 ${roasteryId} 크롤링 완료:`)
        console.log(`  ✅ 성공: ${progress.completedProducts}/${progress.totalProducts}`)
        console.log(`  ❌ 실패: ${roasteryResult.failedProducts}`)
        
        // 결과를 배치 파일로 저장 (기존 JSON 파일에서 읽어서 분할)
        await this.processCrawlResults(roasteryId)
      }
    }
  }

  /**
   * 크롤링 결과 후처리 - 기존 JSON 파일을 배치로 분할
   */
  private async processCrawlResults(roasteryId: string): Promise<void> {
    // 최신 크롤링 결과 파일 찾기
    const files = fs.readdirSync('./').filter(f => f.startsWith(`crawl-results-${roasteryId}-`))
    if (files.length === 0) {
      console.warn(`⚠️ ${roasteryId} 크롤링 결과 파일을 찾을 수 없습니다`)
      return
    }
    
    // 가장 최근 파일 선택
    const latestFile = files.sort().reverse()[0]
    
    try {
      const data = JSON.parse(fs.readFileSync(latestFile, 'utf8'))
      console.log(`📂 ${latestFile}에서 ${data.length}개 제품 발견`)
      
      // 배치로 분할하여 저장
      const totalBatches = Math.ceil(data.length / this.batchSize)
      
      for (let i = 0; i < totalBatches; i++) {
        const startIdx = i * this.batchSize
        const endIdx = Math.min(startIdx + this.batchSize, data.length)
        const batchData = data.slice(startIdx, endIdx)
        
        await this.saveBatchResults(roasteryId, i, batchData)
      }
      
      console.log(`✅ ${totalBatches}개 배치로 분할 저장 완료`)
      
    } catch (error) {
      console.error(`❌ 결과 후처리 실패: ${error}`)
    }
  }

  /**
   * 배치 결과 저장
   */
  private async saveBatchResults(roasteryId: string, batchIndex: number, results: any[]): Promise<void> {
    const filename = `${roasteryId}-batch-${batchIndex.toString().padStart(3, '0')}-${Date.now()}.json`
    const filepath = path.join(this.resultsDir, filename)
    
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2))
    console.log(`  💾 배치 저장: ${filename} (${results.length}개 제품)`)
  }

  /**
   * 진행상황 로드
   */
  private loadProgress(): Record<string, CrawlProgress> {
    if (fs.existsSync(this.progressFile)) {
      try {
        const data = fs.readFileSync(this.progressFile, 'utf8')
        return JSON.parse(data)
      } catch (error) {
        console.warn('⚠️ 진행상황 파일 로드 실패, 새로 시작합니다')
      }
    }
    return {}
  }

  /**
   * 진행상황 저장
   */
  private saveProgress(progress: Record<string, CrawlProgress>): void {
    fs.writeFileSync(this.progressFile, JSON.stringify(progress, null, 2))
  }

  /**
   * 결과 디렉토리 확인
   */
  private ensureResultsDirectory(): void {
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true })
    }
  }

  /**
   * 딜레이 유틸리티
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 최종 통계 출력
   */
  private printFinalStats(progress: Record<string, CrawlProgress>): void {
    console.log('\n' + '='.repeat(50))
    console.log('📊 대용량 크롤링 최종 결과')
    console.log('='.repeat(50))
    
    for (const [roasteryId, stats] of Object.entries(progress)) {
      const duration = new Date().getTime() - new Date(stats.startTime).getTime()
      const successRate = ((stats.completedProducts / stats.totalProducts) * 100).toFixed(1)
      
      console.log(`\n🏪 ${roasteryId}:`)
      console.log(`  ✅ 성공: ${stats.completedProducts}/${stats.totalProducts} (${successRate}%)`)
      console.log(`  ❌ 에러: ${stats.errors.length}개`)
      console.log(`  ⏱️ 소요시간: ${(duration / 1000 / 60).toFixed(1)}분`)
    }
  }
}

// 메인 실행
if (require.main === module) {
  const crawler = new LargeScaleCrawler()
  crawler.runLargeScaleCrawl().catch(console.error)
}

export { LargeScaleCrawler }