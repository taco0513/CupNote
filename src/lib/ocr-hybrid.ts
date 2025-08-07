/**
 * Hybrid OCR Service - 최적의 OCR 방식 자동 선택
 * 1. 프로덕션 서버 (Google Vision) - 가장 정확
 * 2. 외부 OCR API - 백업
 * 3. 클라이언트 Tesseract - 최후의 수단
 */

import OCRServiceClient from './ocr-service-client'

export interface OCRResult {
  text: string
  confidence: number
  extractedInfo: CoffeeInfoOCR
  method: 'google-vision' | 'external-api' | 'tesseract'
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

class HybridOCRService {
  /**
   * 스마트 OCR - 가능한 최선의 방법 자동 선택
   */
  static async extractText(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    
    // 1. 먼저 프로덕션 서버 시도 (Google Vision)
    try {
      const result = await this.tryProductionOCR(imageFile, onProgress)
      if (result) return { ...result, method: 'google-vision' }
    } catch (error) {
      console.log('Production OCR unavailable, trying external API...')
    }

    // 2. 외부 OCR API 시도 (OCR.space 등 무료 API)
    try {
      const result = await this.tryExternalOCR(imageFile, onProgress)
      if (result) return { ...result, method: 'external-api' }
    } catch (error) {
      console.log('External OCR unavailable, falling back to Tesseract...')
    }

    // 3. 마지막으로 클라이언트 Tesseract
    try {
      const result = await OCRServiceClient.extractText(imageFile, onProgress)
      return { ...result, method: 'tesseract' }
    } catch (error) {
      throw new Error('모든 OCR 방법이 실패했습니다')
    }
  }

  /**
   * 프로덕션 서버 OCR (Google Vision)
   */
  private static async tryProductionOCR(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<Omit<OCRResult, 'method'>> {
    const formData = new FormData()
    formData.append('image', imageFile)
    
    if (onProgress) onProgress(0.1)

    // Vercel Functions endpoint 사용
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://mycupnote.com/api/ocr'
      : 'http://localhost:3000/api/ocr'
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('Production server unavailable')
    }

    const result = await response.json()
    if (onProgress) onProgress(1)

    return {
      text: result.text || '',
      confidence: result.confidence || 0,
      extractedInfo: result.extractedInfo || {}
    }
  }

  /**
   * 외부 무료 OCR API (OCR.space)
   */
  private static async tryExternalOCR(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<Omit<OCRResult, 'method'>> {
    const formData = new FormData()
    formData.append('file', imageFile)
    formData.append('apikey', 'K89553184588957') // OCR.space 무료 API 키
    formData.append('language', 'kor+eng')
    formData.append('isOverlayRequired', 'false')
    
    if (onProgress) onProgress(0.1)

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      throw new Error('External OCR API failed')
    }

    const result = await response.json()
    if (onProgress) onProgress(1)

    // OCR.space 응답 파싱
    if (result.ParsedResults && result.ParsedResults[0]) {
      const text = result.ParsedResults[0].ParsedText || ''
      const extractedInfo = this.parseCoffeeInfo(text)
      
      return {
        text,
        confidence: 80, // OCR.space는 confidence 제공 안함
        extractedInfo
      }
    }

    throw new Error('No OCR results')
  }

  /**
   * 텍스트에서 커피 정보 추출 (공통 파서)
   */
  private static parseCoffeeInfo(text: string): CoffeeInfoOCR {
    const lines = text.split('\n').filter(line => line.trim())
    const info: CoffeeInfoOCR = {}

    // 커피 이름 찾기 (보통 첫 줄이나 큰 텍스트)
    const possibleNames = lines.filter(line => 
      line.length > 3 && 
      line.length < 50 &&
      !line.match(/^\d+$/) &&
      !line.toLowerCase().includes('roaster')
    )
    if (possibleNames[0]) {
      info.coffeeName = possibleNames[0]
    }

    // 패턴 매칭으로 정보 추출
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineLower = line.toLowerCase()
      const nextLine = lines[i + 1]

      // 로스터리
      if (lineLower.includes('roaster') || lineLower.includes('로스터')) {
        info.roasterName = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 원산지
      if (lineLower.includes('origin') || lineLower.includes('원산지') || lineLower.includes('country')) {
        info.origin = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 품종
      if (lineLower.includes('variety') || lineLower.includes('품종') || lineLower.includes('varietal')) {
        info.variety = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 가공법
      if (lineLower.includes('process') || lineLower.includes('가공') || lineLower.includes('method')) {
        info.processing = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 로스팅
      if (lineLower.includes('roast') || lineLower.includes('로스팅')) {
        info.roastLevel = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 고도
      if (lineLower.includes('altitude') || lineLower.includes('고도') || lineLower.includes('masl')) {
        info.altitude = nextLine || line.split(/[:：]/)[1]?.trim()
      }

      // 테이스팅 노트
      if (lineLower.includes('note') || lineLower.includes('노트') || lineLower.includes('flavor')) {
        info.notes = nextLine || line.split(/[:：]/)[1]?.trim()
      }
    }

    // 국가명 패턴으로 원산지 찾기
    const countries = ['에티오피아', 'Ethiopia', '케냐', 'Kenya', '콜롬비아', 'Colombia', '브라질', 'Brazil', '과테말라', 'Guatemala']
    if (!info.origin) {
      for (const country of countries) {
        const found = lines.find(line => line.includes(country))
        if (found) {
          info.origin = country
          break
        }
      }
    }

    return info
  }
}

export default HybridOCRService