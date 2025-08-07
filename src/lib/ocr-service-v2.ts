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
      
      // 로스터 노트 - 명시적 레이블 패턴
      if (!info.notes) {
        // 한국어/영어 로스터 노트 레이블 체크
        const noteLabels = ['로스터 노트', '테이스팅 노트', '노트', 'roaster note', 'tasting note', 'note', 'flavor']
        const hasLabel = noteLabels.some(label => lineLower.includes(label))
        
        if (hasLabel) {
          // 같은 줄에 콜론이나 화살표 뒤에 있는 내용
          if (line.includes(':') || line.includes('→')) {
            const parts = line.split(/[:→]/)
            if (parts.length > 1) {
              info.notes = parts[1].trim()
            }
          } 
          // 다음 줄에 있는 경우
          else if (i + 1 < lines.length) {
            info.notes = lines[i + 1]
          }
        }
      }
      
      // 로스터 노트 (콤마로 구분된 플레이버 또는 한국어 키워드)
      if (!info.notes && (line.includes(',') || line.includes('·') || line.includes('|'))) {
        const flavors = ['berry', 'candy', 'chocolate', 'floral', 'fruity', 'nutty', 'caramel', 
                        'vanilla', 'honey', 'wine', 'tea', 'citrus', 'apple', 'cherry', 'silky', 
                        'cacao', 'nibs', 'raspberry', 'watermelon', 'melon']
        
        const koreanFlavors = ['베리', '초콜릿', '꽃', '과일', '견과', '캐러멜', 
                               '바닐라', '꿀', '와인', '차', '시트러스', '사과', '체리', 
                               '카카오', '라즈베리', '수박', '멜론', '오렌지', '레몬', 
                               '자몽', '복숭아', '살구', '블루베리', '딸기', '포도']
        
        if (flavors.some(flavor => lineLower.includes(flavor)) || 
            koreanFlavors.some(flavor => line.includes(flavor))) {
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

    // 로스터 노트 대체 패턴 (한국어/영어 혼용)
    if (!info.notes) {
      for (const line of lines) {
        const lineLower = line.toLowerCase()
        
        // 영어 키워드
        const englishKeywords = ['blue', 'raspberry', 'watermelon', 'candy', 'silky', 
                                 'chocolate', 'berry', 'fruit', 'floral', 'caramel']
        
        // 한국어 키워드
        const koreanKeywords = ['블루베리', '라즈베리', '수박', '사탕', '실키', 
                               '초콜릿', '베리', '과일', '꽃', '캐러멜', '달콤', 
                               '산뜻', '부드러운', '깔끔한', '상큼한']
        
        const hasEnglish = englishKeywords.some(keyword => lineLower.includes(keyword))
        const hasKorean = koreanKeywords.some(keyword => line.includes(keyword))
        
        if ((hasEnglish || hasKorean) && line !== info.coffeeName && line.length > 5) {
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