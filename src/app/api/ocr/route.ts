// Google Cloud Vision API를 사용한 OCR API
import { NextRequest, NextResponse } from 'next/server'

// Dynamic import to avoid build issues
let vision: any

// 커피 정보 추출을 위한 타입 정의
interface CoffeeTextPatterns {
  coffeeName?: string
  roasterName?: string
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  altitude?: string
  notes?: string
}

// 커피 관련 키워드 패턴
const COFFEE_PATTERNS = {
  origin: /(?:origin|산지|원산지|country|나라)\s*:?\s*([가-힣a-zA-Z\s]+)/i,
  variety: /(?:variety|varietal|품종|종류)\s*:?\s*([가-힣a-zA-Z\s,]+)/i,
  processing: /(?:process|processing|가공|프로세스|워시드|내추럴|허니|애너로빅)\s*:?\s*([가-힣a-zA-Z\s]+)/i,
  roastLevel: /(?:roast|로스팅|로스트)\s*(?:level|레벨)?\s*:?\s*(light|medium|dark|라이트|미디엄|다크)/i,
  altitude: /(?:altitude|elevation|고도|해발)\s*:?\s*(\d+)\s*(?:m|masl|meters)?/i,
  notes: /(?:notes|flavor|taste|노트|맛|향미|플레이버)\s*:?\s*([가-힣a-zA-Z\s,]+)/i
}

export async function POST(request: NextRequest) {
  try {
    console.log('=== OCR API 시작 ===')
    
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      console.log('❌ 이미지 없음')
      return NextResponse.json({
        success: false,
        error: '이미지가 제공되지 않았습니다.'
      }, { status: 400 })
    }

    console.log('✅ 이미지 수신:', image.size, 'bytes', image.type)
    
    // 이미지 크기 검증
    if (image.size > 10 * 1024 * 1024) { // 10MB 제한
      console.log('❌ 이미지 크기 초과:', image.size)
      return NextResponse.json({
        success: false,
        error: '이미지 크기가 너무 큽니다. 10MB 이하의 이미지를 사용해주세요.'
      }, { status: 400 })
    }
    
    // 이미지 타입 검증
    if (!image.type.startsWith('image/')) {
      console.log('❌ 잘못된 파일 타입:', image.type)
      return NextResponse.json({
        success: false,
        error: '이미지 파일만 업로드 가능합니다.'
      }, { status: 400 })
    }
    
    // 이미지를 버퍼로 변환
    const buffer = Buffer.from(await image.arrayBuffer())
    
    // Google Cloud Vision API 사용 가능 여부 확인
    const useGoogleVision = process.env.GOOGLE_APPLICATION_CREDENTIALS || 
                           (process.env.GOOGLE_CLOUD_PROJECT_ID && 
                            process.env.GOOGLE_CLOUD_PRIVATE_KEY && 
                            process.env.GOOGLE_CLOUD_CLIENT_EMAIL)
    
    let extractedText = ''
    let confidence = 0
    
    if (useGoogleVision) {
      console.log('🔍 Google Cloud Vision API 사용')
      
      try {
        // Dynamic import
        if (!vision) {
          const visionModule = await import('@google-cloud/vision')
          vision = visionModule.default
        }
        
        // Vision API 클라이언트 생성
        const client = new vision.ImageAnnotatorClient(
          process.env.GOOGLE_APPLICATION_CREDENTIALS ? {} : {
            credentials: {
              client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
              private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
          }
        )
        
        // 텍스트 감지 실행
        const [result] = await client.textDetection(buffer)
        const detections = result.textAnnotations
        
        if (detections && detections.length > 0) {
          extractedText = detections[0].description || ''
          confidence = 90 // Google Vision은 일반적으로 높은 정확도
          console.log('✅ Google Vision OCR 성공')
        } else {
          console.log('⚠️ 텍스트를 찾을 수 없음')
        }
      } catch (visionError: any) {
        console.error('❌ Google Vision API 오류:', visionError)
        console.error('Error details:', visionError.message, visionError.stack)
        // 폴백으로 시뮬레이션 모드 사용
      }
    }
    
    // Google Vision이 실패하거나 설정되지 않은 경우 시뮬레이션 모드
    if (!extractedText) {
      console.log('🔄 시뮬레이션 모드로 폴백')
      
      // 기존 시뮬레이션 로직
      const fileName = image.name.toLowerCase()
      const sampleCoffees = [
        {
          coffeeName: 'El Diviso - Omblgon Decaf',
          roasterName: 'Onyx Coffee Lab',
          origin: 'Colombia',
          variety: 'Omblgon',
          processing: 'Mossto Anaerobic Natural',
          roastLevel: 'Light',
          altitude: '1800m',
          notes: 'Blue Raspberry, Watermelon Candy, Silky, Cacao Nibs'
        },
        {
          coffeeName: 'Ethiopia Yirgacheffe',
          roasterName: 'Blue Bottle Coffee',
          origin: 'Ethiopia',
          variety: 'Heirloom',
          processing: 'Washed',
          roastLevel: 'Light-Medium',
          altitude: '2000m',
          notes: 'Lemon, Bergamot, Black Tea, Floral'
        },
        {
          coffeeName: 'Kenya Gichugu AA',
          roasterName: 'Counter Culture Coffee',
          origin: 'Kenya',
          variety: 'SL28, SL34',
          processing: 'Double Washed',
          roastLevel: 'Medium',
          altitude: '1700m',
          notes: 'Blackcurrant, Tomato, Wine-like, Bright'
        }
      ]
      
      let hash = 0
      for (let i = 0; i < fileName.length; i++) {
        hash = ((hash << 5) - hash) + fileName.charCodeAt(i)
        hash = hash & hash
      }
      const selectedCoffee = sampleCoffees[Math.abs(hash) % sampleCoffees.length]
      
      extractedText = `${selectedCoffee.origin.toUpperCase()}
${selectedCoffee.coffeeName}
${selectedCoffee.notes}
Roaster: ${selectedCoffee.roasterName}
Process: ${selectedCoffee.processing}
Varietal: ${selectedCoffee.variety}
Altitude: ${selectedCoffee.altitude}`
      
      confidence = 85
      
      // 시뮬레이션인 경우 직접 파싱된 정보 반환
      return NextResponse.json({
        success: true,
        text: extractedText,
        confidence,
        extractedInfo: selectedCoffee,
        mode: 'simulation'
      })
    }
    
    // 실제 OCR 텍스트에서 커피 정보 추출
    const extractedInfo = extractCoffeeInfo(extractedText)
    
    console.log('📄 추출된 텍스트:', extractedText)
    console.log('📋 파싱된 정보:', extractedInfo)
    
    return NextResponse.json({
      success: true,
      text: extractedText,
      confidence,
      extractedInfo,
      mode: useGoogleVision ? 'google-vision' : 'simulation'
    })
    
  } catch (error) {
    console.error('❌ OCR API 오류:', error)
    
    return NextResponse.json({
      success: false,
      error: '서버 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// 텍스트에서 커피 정보 추출하는 함수
function extractCoffeeInfo(text: string): CoffeeTextPatterns {
  const lines = text.split('\n')
  const extractedInfo: CoffeeTextPatterns = {}
  
  // 첫 번째 줄은 종종 커피 이름
  if (lines.length > 0) {
    // 대문자로만 된 줄은 보통 원산지
    const upperCaseLines = lines.filter(line => line.trim() && line === line.toUpperCase())
    if (upperCaseLines.length > 0) {
      extractedInfo.origin = upperCaseLines[0].trim()
    }
    
    // 커피 이름 찾기 (보통 첫 번째나 두 번째 줄)
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i].trim()
      if (line && !line.includes(':') && line !== extractedInfo.origin) {
        extractedInfo.coffeeName = line
        break
      }
    }
  }
  
  // 패턴 매칭으로 정보 추출
  const fullText = text.toLowerCase()
  
  // 로스터리 찾기
  const roasterMatch = text.match(/(?:roaster|roastery|로스터리|로스터)\s*:?\s*([가-힣a-zA-Z\s]+)/i)
  if (roasterMatch) {
    extractedInfo.roasterName = roasterMatch[1].trim()
  }
  
  // 기타 정보 추출
  Object.entries(COFFEE_PATTERNS).forEach(([key, pattern]) => {
    const match = text.match(pattern)
    if (match && match[1]) {
      extractedInfo[key as keyof CoffeeTextPatterns] = match[1].trim()
    }
  })
  
  // 로스팅 레벨 정규화
  if (extractedInfo.roastLevel) {
    const level = extractedInfo.roastLevel.toLowerCase()
    if (level.includes('light') || level.includes('라이트')) {
      extractedInfo.roastLevel = 'Light'
    } else if (level.includes('dark') || level.includes('다크')) {
      extractedInfo.roastLevel = 'Dark'
    } else {
      extractedInfo.roastLevel = 'Medium'
    }
  }
  
  // 고도에서 숫자만 추출
  if (extractedInfo.altitude) {
    const altMatch = extractedInfo.altitude.match(/\d+/)
    if (altMatch) {
      extractedInfo.altitude = altMatch[0] + 'm'
    }
  }
  
  return extractedInfo
}