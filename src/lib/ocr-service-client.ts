/**
 * OCR Service - Client-side Only (Tesseract.js)
 * Static export를 위한 클라이언트 사이드 전용 OCR 서비스
 * 
 * @version 3.0.0
 * @since 2025-08-07
 */

import Tesseract from 'tesseract.js'

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
 * 클라이언트 사이드 전용 OCR 서비스
 */
class OCRServiceClient {
  /**
   * 단일 이미지에서 텍스트 추출 (Tesseract.js)
   */
  static async extractText(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    
    if (!(imageFile instanceof File)) {
      throw new Error('File 객체만 지원됩니다.')
    }

    return await this.clientSideOCR(imageFile, onProgress)
  }

  /**
   * 다중 이미지에서 텍스트 추출
   */
  static async extractTextFromMultipleImages(
    imageFiles: File[],
    onProgress?: (progress: number, imageIndex: number) => void
  ): Promise<OCRResult> {
    
    const results = []
    let combinedText = ''
    let averageConfidence = 0

    for (let i = 0; i < imageFiles.length; i++) {
      const imageFile = imageFiles[i]
      
      const singleProgress = (progress: number) => {
        if (onProgress) {
          const overallProgress = (i + progress) / imageFiles.length
          onProgress(overallProgress, i)
        }
      }
      
      const result = await this.clientSideOCR(imageFile, singleProgress)
      results.push({ text: result.text, confidence: result.confidence })
      combinedText += (i > 0 ? '\n---IMAGE_SEPARATOR---\n' : '') + result.text
      averageConfidence += result.confidence
    }

    averageConfidence = averageConfidence / imageFiles.length

    // 다중 이미지에서 더 정확한 정보 추출
    const extractedInfo = this.parseMultiImageCoffeeInfo(results)

    return {
      text: combinedText,
      confidence: averageConfidence,
      extractedInfo
    }
  }

  /**
   * 클라이언트 사이드 OCR 처리 (Tesseract.js)
   */
  private static async clientSideOCR(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    try {
      // File을 Data URL로 변환
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = reject
        reader.readAsDataURL(imageFile)
      })

      // Tesseract.js로 OCR 수행
      const result = await Tesseract.recognize(
        imageDataUrl,
        'kor+eng', // 한국어와 영어 모두 인식
        {
          logger: (info) => {
            if (onProgress && info.status === 'recognizing text') {
              onProgress(info.progress)
            }
          }
        }
      )

      const text = result.data.text
      const confidence = result.data.confidence

      // 텍스트에서 커피 정보 추출
      const extractedInfo = this.parseCoffeeInfo(text)

      return {
        text,
        confidence,
        extractedInfo
      }
    } catch (error: any) {
      console.error('클라이언트 사이드 OCR 오류:', error)
      
      if (onProgress) {
        onProgress(0)
      }
      
      throw new Error(error.message || '클라이언트 OCR 처리에 실패했습니다.')
    }
  }

  /**
   * 다중 이미지 결과에서 커피 정보 추출
   */
  private static parseMultiImageCoffeeInfo(results: Array<{text: string, confidence: number}>): CoffeeInfoOCR {
    const combinedInfo: CoffeeInfoOCR = {}
    
    // 각 이미지별로 정보 추출
    const imageInfos = results.map(result => this.parseCoffeeInfo(result.text))
    
    // 정보 병합
    const mergeField = (field: keyof CoffeeInfoOCR) => {
      for (let i = 0; i < imageInfos.length; i++) {
        if (imageInfos[i][field] && !combinedInfo[field]) {
          combinedInfo[field] = imageInfos[i][field]
          break
        }
      }
    }

    // 모든 필드 병합
    mergeField('coffeeName')
    mergeField('roasterName')
    mergeField('origin')
    mergeField('variety')
    mergeField('processing')
    mergeField('roastLevel')
    mergeField('altitude')
    
    // 노트는 모든 이미지의 텍스트 결합
    const allNotes = results.map(r => r.text).join('\n---\n')
    combinedInfo.notes = allNotes

    return combinedInfo
  }

  /**
   * OCR 텍스트에서 커피 정보 추출
   */
  private static parseCoffeeInfo(text: string): CoffeeInfoOCR {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const info: CoffeeInfoOCR = {}

    // 간단한 패턴 매칭으로 정보 추출
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineLower = line.toLowerCase()
      
      // 커피 이름 (첫 번째 큰 텍스트일 가능성)
      if (!info.coffeeName && i === 0 && line.length > 3) {
        info.coffeeName = line
      }
      
      // 로스터리 이름
      if (!info.roasterName && (lineLower.includes('roaster') || lineLower.includes('로스터'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.roasterName = nextLine
        }
      }
      
      // 원산지
      if (!info.origin && (lineLower.includes('origin') || lineLower.includes('원산지'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.origin = nextLine
        }
      }
      
      // 품종
      if (!info.variety && (lineLower.includes('variety') || lineLower.includes('품종'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.variety = nextLine
        }
      }
      
      // 가공법
      if (!info.processing && (lineLower.includes('process') || lineLower.includes('가공'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.processing = nextLine
        }
      }
      
      // 로스팅 레벨
      if (!info.roastLevel && (lineLower.includes('roast') || lineLower.includes('로스팅'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.roastLevel = nextLine
        }
      }
      
      // 고도
      if (!info.altitude && (lineLower.includes('altitude') || lineLower.includes('고도'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.altitude = nextLine
        }
      }
      
      // 노트
      if (!info.notes && (lineLower.includes('note') || lineLower.includes('노트'))) {
        const nextLine = lines[i + 1]?.trim()
        if (nextLine) {
          info.notes = nextLine
        }
      }
    }

    return info
  }
}

export default OCRServiceClient