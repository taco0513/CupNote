/**
 * OCR Service v2 - Server-side Only (Google Vision API)
 * 완전히 새로운 서버 사이드 전용 OCR 서비스
 * 
 * @version 2.0.0
 * @since 2025-08-05
 */

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
 * 서버 사이드 전용 OCR 서비스
 */
class OCRServiceV2 {
  /**
   * 단일 이미지에서 텍스트 추출 (Google Vision API 서버 사이드)
   */
  static async extractText(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    
    if (!(imageFile instanceof File)) {
      throw new Error('File 객체만 지원됩니다.')
    }

    return await this.serverSideOCR(imageFile, onProgress)
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
      
      const result = await this.serverSideOCR(imageFile, singleProgress)
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
   * 서버 사이드 OCR 처리 (Google Vision API)
   */
  private static async serverSideOCR(
    imageFile: File,
    onProgress?: (progress: number) => void
  ): Promise<OCRResult> {
    try {
      
      const formData = new FormData()
      formData.append('image', imageFile)
      
      // 진행률 시뮬레이션
      if (onProgress) {
        onProgress(0.1)
      }
      
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
      }, 15000)
      
      // 진행률 업데이트
      let progress = 0.1
      const progressInterval = setInterval(() => {
        if (onProgress && progress < 0.9) {
          progress += 0.1
          onProgress(progress)
        }
      }, 300)
      
      const response = await fetch('/api/ocr/enhanced', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      clearInterval(progressInterval)
      
      if (!response.ok) {
        if (onProgress) onProgress(0)
        
        if (response.status === 500) {
          throw new Error('서버에서 OCR 처리 중 오류가 발생했습니다.')
        }
        throw new Error(`서버 OCR 요청 실패: ${response.status}`)
      }
      
      const result = await response.json()
      
      // 성공 시 진행률 100%
      if (onProgress) {
        onProgress(1)
      }
      
      
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
      
      if (onProgress) {
        onProgress(0)
      }
      
      if (error.name === 'AbortError') {
        throw new Error('OCR 처리 시간이 초과되었습니다.')
      }
      
      throw new Error(error.message || '서버 OCR 처리에 실패했습니다.')
    }
  }

  /**
   * 다중 이미지 결과에서 커피 정보 추출
   */
  private static parseMultiImageCoffeeInfo(results: Array<{text: string, confidence: number}>): CoffeeInfoOCR {
    const combinedInfo: CoffeeInfoOCR = {}
    
    // 각 이미지별로 정보 추출
    const imageInfos = results.map(result => this.parseStrageCoffeeInfo(result.text))
    
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
  private static parseStrageCoffeeInfo(text: string): CoffeeInfoOCR {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const info: CoffeeInfoOCR = {}

    // 커피 이름을 먼저 찾기 ("El Diviso - Ombligon Decaf" 패턴)
    for (const line of lines) {
      if (line.includes('-') && 
          !line.toLowerCase().includes('region') && 
          !line.toLowerCase().includes('process') &&
          !/^\d+$/.test(line)) {
        info.coffeeName = line
        break
      }
    }

    // 원산지, 가공법 등 추출
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const lineLower = line.toLowerCase()
      
      // 원산지 (대문자 국가명)
      if (!info.origin && line === line.toUpperCase() && line.length > 2 && line.length < 20) {
        if (!/^\d+$/.test(line) && line !== info.coffeeName) {
          info.origin = line
        }
      }
      
      // 가공법
      if (lineLower.includes('process') && i + 1 < lines.length) {
        info.processing = lines[i + 1]
      }
      
      // 품종
      if ((lineLower.includes('varietal') || lineLower.includes('variety')) && i + 1 < lines.length) {
        info.variety = lines[i + 1]
      }
      
      // 로스터 노트 (콤마로 구분된 플레이버)
      if (!info.notes && line.includes(',')) {
        const flavors = ['berry', 'candy', 'chocolate', 'floral', 'fruity', 'nutty', 'caramel', 
                        'vanilla', 'honey', 'wine', 'tea', 'citrus', 'apple', 'cherry', 'silky', 
                        'cacao', 'nibs', 'raspberry', 'watermelon', 'melon']
        
        if (flavors.some(flavor => lineLower.includes(flavor))) {
          info.notes = line
        }
      }
    }

    // 커피 이름이 없으면 다른 패턴 시도
    if (!info.coffeeName) {
      for (const line of lines) {
        if (line && 
            line !== info.origin && 
            !line.toLowerCase().includes('region') &&
            !line.toLowerCase().includes('process') &&
            !line.toLowerCase().includes('varietal') &&
            !/^\d+$/.test(line) &&
            line.length > 5) {
          info.coffeeName = line
          break
        }
      }
    }

    // 로스터 노트 대체 패턴
    if (!info.notes) {
      for (const line of lines) {
        const lineLower = line.toLowerCase()
        if ((lineLower.includes('blue') || lineLower.includes('raspberry') || 
             lineLower.includes('watermelon') || lineLower.includes('candy') ||
             lineLower.includes('silky')) &&
            line !== info.coffeeName) {
          info.notes = line
          break
        }
      }
    }

    return info
  }

  /**
   * Cleanup (서버 사이드는 정리할 것 없음)
   */
  static async cleanup(): Promise<void> {
  }
}

export default OCRServiceV2