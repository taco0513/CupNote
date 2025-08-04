/**
 * OCR Service for Coffee Information Extraction
 * Tesseract.js 기반 클라이언트 사이드 OCR
 * 
 * @version 1.0.0
 * @since 2025-08-04
 */

import { createWorker } from 'tesseract.js'

export interface OCRResult {
  text: string
  confidence: number
  extractedInfo: CoffeeInfoOCR
}

export interface CoffeeInfoOCR {
  coffeeName?: string
  roasterName?: string
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  altitude?: string
  notes?: string
}

/**
 * OCR Worker 싱글톤 관리
 */
class OCRService {
  private static worker: Tesseract.Worker | null = null
  private static isInitialized = false

  /**
   * OCR Worker 초기화
   */
  private static async initializeWorker(): Promise<Tesseract.Worker> {
    // iOS에서는 Worker 초기화를 건너뛰고 서버 사이드로 처리
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
    const isIOSApp = navigator.userAgent.includes('CupNote-iOS') || 
                    (isIOS && !navigator.userAgent.includes('Safari'))
    
    if (isIOSApp) {
      console.log('iOS 감지됨, Worker 초기화 건너뜀')
      throw new Error('iOS detected, use server-side OCR')
    }

    if (this.worker && this.isInitialized) {
      return this.worker
    }

    console.log('OCR Worker 초기화 시작...')
    
    try {
      // iOS/WKWebView 호환성을 위한 설정
      const workerOptions = {
        logger: (m: any) => {
          console.log('OCR Status:', m.status, 'Progress:', m.progress)
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
          }
        },
        // iOS에서 Worker 경로 문제 해결
        workerPath: 'https://unpkg.com/tesseract.js@4.0.2/dist/worker.min.js',
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        corePath: 'https://unpkg.com/tesseract.js-core@4.0.2/tesseract-core.wasm.js',
      }
      
      this.worker = await createWorker('eng+kor', 1, workerOptions)
      
      console.log('OCR Worker 생성 완료')

      // OCR 정확도 향상을 위한 설정
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789가-힣 .,()-:%°',
        tessedit_pageseg_mode: '6', // 단일 텍스트 블록으로 처리
        preserve_interword_spaces: '1'
      })
      
      console.log('OCR Worker 설정 완료')

      this.isInitialized = true
      return this.worker
    } catch (error) {
      console.error('OCR Worker 초기화 실패:', error)
      this.worker = null
      this.isInitialized = false
      throw error
    }
  }

  /**
   * 단일 이미지에서 텍스트 추출
   */
  static async extractText(
    imageFile: File | string,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    try {
      console.log('OCR extractText 시작, 이미지 타입:', typeof imageFile)
      
      // iOS 감지
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      const isIOSApp = navigator.userAgent.includes('CupNote-iOS') || 
                      (isIOS && !navigator.userAgent.includes('Safari'))
      
      // iOS 앱에서는 서버 사이드 OCR 사용
      if (isIOSApp && imageFile instanceof File) {
        console.log('iOS 감지됨, 서버 사이드 OCR 사용')
        return await this.serverSideOCR(imageFile, onProgress)
      }
      
      // 기존 클라이언트 사이드 OCR
      let imageInput: string | File = imageFile
      if (imageFile instanceof File) {
        console.log('File 객체 감지, 크기:', imageFile.size, '타입:', imageFile.type)
        // File을 Base64로 변환 (iOS 호환성)
        const reader = new FileReader()
        imageInput = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(imageFile)
        })
        console.log('Base64 변환 완료')
      }
      
      const worker = await this.initializeWorker()
      console.log('Worker 초기화 완료, recognize 시작...')
      
      const { data: { text, confidence } } = await worker.recognize(imageInput, {
        logger: m => {
          console.log('OCR Logger - Status:', m.status, 'Progress:', m.progress)
          if (m.status === 'recognizing text' && onProgress) {
            onProgress(m.progress)
          }
        }
      })

      console.log('OCR 인식 완료, 텍스트 길이:', text.length)
      const extractedInfo = this.parseStrageCoffeeInfo(text)

      return {
        text: text.trim(),
        confidence,
        extractedInfo
      }
    } catch (error) {
      console.error('OCR 처리 중 오류 상세:', error)
      // iOS에서 Worker 오류인 경우 서버 사이드로 재시도
      if (error instanceof Error && (error.message.includes('Worker') || error.message.includes('Failed'))) {
        console.log('Worker 오류 감지, 서버 사이드 OCR로 재시도')
        if (imageFile instanceof File) {
          return await this.serverSideOCR(imageFile, onProgress)
        }
      }
      throw new Error('OCR 처리에 실패했습니다. 다시 시도해주세요.')
    }
  }

  /**
   * 서버 사이드 OCR 처리 (iOS 호환성)
   */
  private static async serverSideOCR(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    try {
      console.log('서버 사이드 OCR 시작')
      
      // 진행률 시뮬레이션 (서버 처리 시간을 고려)
      if (onProgress) {
        onProgress(0.1)
        setTimeout(() => onProgress(0.3), 2000)
        setTimeout(() => onProgress(0.6), 5000)
        setTimeout(() => onProgress(0.8), 15000)
        setTimeout(() => onProgress(0.9), 25000)
      }
      
      const formData = new FormData()
      formData.append('image', imageFile)
      
      // 타임아웃 설정 (35초)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 35000)
      
      const response = await fetch('/api/ocr', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        if (response.status === 500) {
          throw new Error('서버에서 OCR 처리 중 오류가 발생했습니다. 이미지가 너무 크거나 복잡할 수 있습니다.')
        }
        throw new Error(`서버 OCR 요청 실패: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (onProgress) {
        onProgress(1)
      }
      
      console.log('서버 사이드 OCR 완료:', result)
      
      if (!result.success) {
        throw new Error(result.error || '서버 OCR 처리 실패')
      }
      
      return {
        text: result.text || '',
        confidence: result.confidence || 0,
        extractedInfo: result.extractedInfo || {}
      }
    } catch (error: any) {
      console.error('서버 사이드 OCR 오류:', error)
      
      if (error.name === 'AbortError') {
        throw new Error('OCR 처리 시간이 초과되었습니다. 더 작은 이미지나 더 선명한 이미지로 다시 시도해주세요.')
      }
      
      throw new Error(error.message || '서버 OCR 처리에 실패했습니다.')
    }
  }

  /**
   * 다중 이미지에서 텍스트 추출 (커피 인포카드 앞뒤면)
   */
  static async extractTextFromMultipleImages(
    imageFiles: (File | string)[],
    onProgress?: (progress: number, imageIndex: number) => void
  ): Promise<OCRResult> {
    try {
      // iOS 감지
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      const isIOSApp = navigator.userAgent.includes('CupNote-iOS') || 
                      (isIOS && !navigator.userAgent.includes('Safari'))
      
      const results = []
      let combinedText = ''
      let averageConfidence = 0

      // iOS에서는 각 이미지를 개별적으로 서버 사이드 OCR로 처리
      if (isIOSApp) {
        console.log('iOS 다중 이미지 OCR - 서버 사이드 처리')
        
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i]
          
          if (imageFile instanceof File) {
            // 각 이미지에 대해 서버 사이드 OCR 실행
            const singleProgress = (progress: number) => {
              if (onProgress) {
                const overallProgress = (i + progress) / imageFiles.length
                onProgress(overallProgress, i)
              }
            }
            
            const result = await this.serverSideOCR(imageFile, singleProgress)
            results.push({ text: result.text, confidence: result.confidence })
            combinedText += (i > 0 ? '\n---IMAGE_SEPARATOR---\n' : '') + result.text
            averageConfidence += result.confidence
          }
        }
      } else {
        // 기존 클라이언트 사이드 처리
        const worker = await this.initializeWorker()
        
        for (let i = 0; i < imageFiles.length; i++) {
          const imageFile = imageFiles[i]
          
          const { data: { text, confidence } } = await worker.recognize(imageFile, {
            logger: m => {
              if (m.status === 'recognizing text' && onProgress) {
                const overallProgress = (i + m.progress) / imageFiles.length
                onProgress(overallProgress, i)
              }
            }
          })

          results.push({ text: text.trim(), confidence })
          combinedText += (i > 0 ? '\n---IMAGE_SEPARATOR---\n' : '') + text.trim()
          averageConfidence += confidence
        }
      }

      averageConfidence = averageConfidence / imageFiles.length

      // 다중 이미지에서 더 정확한 정보 추출
      const extractedInfo = this.parseMultiImageCoffeeInfo(results)

      return {
        text: combinedText,
        confidence: averageConfidence,
        extractedInfo
      }
    } catch (error) {
      console.error('다중 이미지 OCR 처리 중 오류:', error)
      throw new Error('이미지 처리에 실패했습니다. 다시 시도해주세요.')
    }
  }

  /**
   * 다중 이미지 결과에서 커피 정보 추출 (앞뒤면 정보 병합)
   */
  private static parseMultiImageCoffeeInfo(results: Array<{text: string, confidence: number}>): CoffeeInfoOCR {
    const combinedInfo: CoffeeInfoOCR = {}
    
    // 각 이미지별로 정보 추출
    const imageInfos = results.map(result => this.parseStrageCoffeeInfo(result.text))
    
    // 정보 병합 (신뢰도 높은 정보 우선)
    const mergeField = (field: keyof CoffeeInfoOCR) => {
      for (let i = 0; i < imageInfos.length; i++) {
        if (imageInfos[i][field] && !combinedInfo[field]) {
          combinedInfo[field] = imageInfos[i][field]
          break
        }
      }
    }

    // 모든 필드에 대해 병합 수행
    mergeField('coffeeName')
    mergeField('roasterName')
    mergeField('origin')
    mergeField('variety')
    mergeField('processing')
    mergeField('roastLevel')
    mergeField('altitude')
    
    // 노트는 모든 이미지의 텍스트를 결합
    const allNotes = results.map(r => r.text).join('\n---\n')
    combinedInfo.notes = allNotes

    return combinedInfo
  }

  /**
   * OCR 텍스트에서 커피 정보 추출
   */
  private static parseStrageCoffeeInfo(text: string): CoffeeInfoOCR {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const info: CoffeeInfoOCR = {}

    // 로스터리 패턴 매칭
    const roasteryPatterns = [
      /roaster[y]?[:\s]+(.+)/i,
      /로스터[리]?[:\s]+(.+)/i,
      /roasted\s+by[:\s]+(.+)/i,
      /볶은\s*곳[:\s]+(.+)/i
    ]

    // 원산지 패턴 매칭  
    const originPatterns = [
      /origin[:\s]+(.+)/i,
      /원산지[:\s]+(.+)/i,
      /country[:\s]+(.+)/i,
      /region[:\s]+(.+)/i,
      /(ethiopia|kenya|colombia|brazil|guatemala|honduras|panama|jamaica|yemen|hawaii|nicaragua|costa rica|el salvador|mexico|peru|bolivia|ecuador|venezuela|india|indonesia|vietnam|thailand|china|papua new guinea|australia|에티오피아|케냐|콜롬비아|브라질|과테말라|온두라스|파나마|자메이카|예멘|하와이|니카라과|코스타리카|엘살바도르|멕시코|페루|볼리비아|에콰도르|베네수엘라|인도|인도네시아|베트남|태국|중국|파푸아뉴기니|호주)/i
    ]

    // 품종 패턴 매칭
    const varietyPatterns = [
      /variety[:\s]+(.+)/i,
      /품종[:\s]+(.+)/i,
      /varietal[:\s]+(.+)/i,
      /(bourbon|typica|caturra|catuai|mundo novo|pacas|maragogipe|geisha|gesha|pacamara|sl28|sl34|bourbon|ruiru|batian|부르봉|티피카|카투라|카투아이|문도노보|파카스|마라고지페|게이샤|파카마라)/i
    ]

    // 가공법 패턴 매칭
    const processingPatterns = [
      /process[ing]*[:\s]+(.+)/i,
      /가공[법]*[:\s]+(.+)/i,
      /method[:\s]+(.+)/i,
      /(washed|natural|honey|semi-washed|wet|dry|pulped natural|anaerobic|워시드|내추럴|허니|세미워시드|펄프드내추럴|혐기성)/i
    ]

    // 로스팅 레벨 패턴 매칭
    const roastPatterns = [
      /roast[:\s]+(.+)/i,
      /로스팅[:\s]+(.+)/i,
      /roast\s*level[:\s]+(.+)/i,
      /(light|medium|dark|city|full city|french|italian|라이트|미디엄|다크|시티|풀시티|프렌치|이탈리안)/i
    ]

    // 고도 패턴 매칭
    const altitudePatterns = [
      /altitude[:\s]+(.+)/i,
      /고도[:\s]+(.+)/i,
      /elevation[:\s]+(.+)/i,
      /(\d{3,4})\s*m/i,
      /(\d{3,4})\s*미터/i
    ]

    for (const line of lines) {
      // 로스터리 추출
      if (!info.roasterName) {
        for (const pattern of roasteryPatterns) {
          const match = line.match(pattern)
          if (match) {
            info.roasterName = match[1].trim()
            break
          }
        }
      }

      // 원산지 추출
      if (!info.origin) {
        for (const pattern of originPatterns) {
          const match = line.match(pattern)
          if (match) {
            info.origin = match[1].trim()
            break
          }
        }
      }

      // 품종 추출
      if (!info.variety) {
        for (const pattern of varietyPatterns) {
          const match = line.match(pattern)
          if (match) {
            info.variety = match[1].trim()
            break
          }
        }
      }

      // 가공법 추출
      if (!info.processing) {
        for (const pattern of processingPatterns) {
          const match = line.match(pattern)
          if (match) {
            info.processing = match[1].trim()
            break
          }
        }
      }

      // 로스팅 레벨 추출
      if (!info.roastLevel) {
        for (const pattern of roastPatterns) {
          const match = line.match(pattern)
          if (match) {
            info.roastLevel = match[1].trim()
            break
          }
        }
      }

      // 고도 추출
      if (!info.altitude) {
        for (const pattern of altitudePatterns) {
          const match = line.match(pattern)
          if (match) {
            info.altitude = match[1].trim()
            break
          }
        }
      }
    }

    // 커피명 추출 (첫 번째 라인이나 가장 긴 라인을 커피명으로 추정)
    if (!info.coffeeName && lines.length > 0) {
      // 첫 번째 라인이 다른 정보와 겹치지 않으면 커피명으로 사용
      const firstLine = lines[0].trim()
      if (firstLine.length > 3 && 
          !roasteryPatterns.some(p => p.test(firstLine)) &&
          !originPatterns.some(p => p.test(firstLine))) {
        info.coffeeName = firstLine
      } else {
        // 가장 긴 라인을 커피명으로 추정
        const longestLine = lines.reduce((a, b) => a.length > b.length ? a : b).trim()
        if (longestLine.length > 3) {
          info.coffeeName = longestLine
        }
      }
    }

    return info
  }

  /**
   * Worker 정리
   */
  static async cleanup(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate()
      this.worker = null
      this.isInitialized = false
    }
  }

  /**
   * 사전 정의된 커피 정보 키워드로 매칭 개선
   */
  private static enhanceExtraction(info: CoffeeInfoOCR, text: string): CoffeeInfoOCR {
    const enhanced = { ...info }

    // 한국 로스터리 매칭
    const koreanRoasters = ['테라로사', '블루보틀', '앤썸', '프릳츠', '커피컨티뉴엄', '드롭탑', '디저트', '폴바셋', '스타벅스', '이디야', '할리스', '엔젤리너스', '카페베네', '탐앤탐스']
    const textLower = text.toLowerCase()
    
    if (!enhanced.roasterName) {
      for (const roaster of koreanRoasters) {
        if (text.includes(roaster)) {
          enhanced.roasterName = roaster
          break
        }
      }
    }

    return enhanced
  }
}

export default OCRService