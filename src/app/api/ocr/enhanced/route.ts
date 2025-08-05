// 향상된 OCR API (Google Vision + 스마트 파싱)
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Enhanced OCR API 시작 ===')
    
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json({
        success: false,
        error: '이미지가 제공되지 않았습니다.'
      }, { status: 400 })
    }

    console.log('✅ 이미지 수신:', image.size, 'bytes')
    
    // 이미지를 버퍼로 변환
    const buffer = Buffer.from(await image.arrayBuffer())
    
    try {
      // Google Vision API 사용
      const vision = await import('@google-cloud/vision')
      const client = new vision.ImageAnnotatorClient()
      
      console.log('🔍 Google Vision API 호출 중...')
      
      // 텍스트 감지 실행
      const [result] = await client.textDetection(buffer)
      const detections = result.textAnnotations
      
      if (detections && detections.length > 0) {
        const extractedText = detections[0].description || ''
        console.log('✅ OCR 성공, 텍스트 길이:', extractedText.length)
        console.log('📄 추출된 전체 텍스트:\n', extractedText)
        
        // 향상된 커피 정보 추출
        const extractedInfo = extractEnhancedCoffeeInfo(extractedText)
        
        return NextResponse.json({
          success: true,
          text: extractedText,
          confidence: 90,
          extractedInfo
        })
      } else {
        console.log('⚠️ 텍스트를 찾을 수 없음')
        return NextResponse.json({
          success: false,
          error: '이미지에서 텍스트를 찾을 수 없습니다.'
        }, { status: 400 })
      }
    } catch (visionError: any) {
      console.error('❌ Google Vision API 오류:', visionError.message)
      throw visionError
    }
    
  } catch (error: any) {
    console.error('❌ Enhanced OCR API 오류:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}

// 향상된 커피 정보 추출 (한국어 라벨 지원)
function extractEnhancedCoffeeInfo(text: string) {
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean)
  console.log('📝 파싱할 라인들:', lines)
  
  const info: any = {}
  
  // 한국어 키워드 매핑
  const koreanKeywords = {
    origin: ['산지', '원산지', '국가'],
    farm: ['농장', '농원', '생산자', '농가'],
    variety: ['품종', '품종명', '바라이어티'],
    processing: ['프로세스', '가공법', '처리법'],
    altitude: ['고도', '해발'],
    notes: ['컵 노트', '컵노트', '테이스팅 노트', '향미', '풍미', '맛']
  }
  
  // 1. 커피 이름 찾기 (여러 패턴 지원)
  for (const line of lines) {
    // 영어 패턴: "El Diviso - Ombligon Decaf"
    if (line.includes('-') && 
        !line.toLowerCase().includes('region') && 
        !line.toLowerCase().includes('process') &&
        !line.match(/^\d+$/)) {
      info.coffeeName = line
      break
    }
    
    // 한국어 패턴: 숫자로 시작하는 커피명 ("10. 콜롬비아 파라이소 92...")
    if (line.match(/^\d+\.\s*.+/) && line.length > 10) {
      // 앞의 숫자와 점 제거
      info.coffeeName = line.replace(/^\d+\.\s*/, '').trim()
      break
    }
    
    // 따옴표로 감싸진 커피명 패턴
    if (line.includes('"') && line.includes('"')) {
      info.coffeeName = line
      break
    }
  }
  
  // 2. 각 라인을 순회하면서 정보 추출
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    
    // 원산지 추출 (영어 패턴)
    if (!info.origin && line === line.toUpperCase() && line.length > 2 && line.length < 20) {
      // #SOLD OUT 같은 것은 제외
      if (!/^\d+$/.test(line) && !line.includes('SOLD') && line !== info.coffeeName) {
        info.origin = line
      }
    }
    
    // 한국어 테이블 형태 정보 추출
    for (const [key, keywords] of Object.entries(koreanKeywords)) {
      if (keywords.some(keyword => line.includes(keyword)) && i + 1 < lines.length) {
        const nextLine = lines[i + 1]
        
        if (key === 'origin' && !info.origin) {
          // "Cauca, Piendamo, Colombia" 형태 처리
          info.origin = nextLine
        } else if (key === 'variety' && !info.variety) {
          info.variety = nextLine
        } else if (key === 'processing' && !info.processing) {
          info.processing = nextLine
        } else if (key === 'altitude' && !info.altitude) {
          info.altitude = nextLine
        } else if (key === 'notes' && !info.notes) {
          info.notes = nextLine
        }
      }
    }
    
    // 영어 라벨 패턴
    if (lineLower.includes('region') && i + 1 < lines.length) {
      info.region = lines[i + 1]
    }
    
    if (lineLower.includes('process') && i + 1 < lines.length) {
      info.processing = lines[i + 1]
    }
    
    if ((lineLower.includes('varietal') || lineLower.includes('variety')) && i + 1 < lines.length) {
      info.variety = lines[i + 1]
    }
    
    // 로스터 노트 패턴 (영어 + 한국어)
    if (!info.notes && line.includes(',')) {
      const flavors = ['berry', 'candy', 'chocolate', 'floral', 'fruity', 'nutty', 'caramel', 
                      'vanilla', 'honey', 'wine', 'tea', 'citrus', 'apple', 'cherry', 'silky', 
                      'cacao', 'nibs', 'raspberry', 'watermelon', 'melon',
                      // 한국어 향미
                      '딸기', '베리', '체리', '사과', '복숭아', '망고', '파인애플',
                      '초콜릿', '카라멜', '바닐라', '꿀', '견과', '차', '와인',
                      '히비스커스', '리치', '딸기']
      
      if (flavors.some(flavor => lineLower.includes(flavor))) {
        info.notes = line
      }
    }
  }
  
  // 3. 커피 이름 후보 재검토
  if (!info.coffeeName) {
    for (const line of lines) {
      if (line && 
          line !== info.origin && 
          line !== info.region &&
          !line.toLowerCase().includes('region') &&
          !line.toLowerCase().includes('process') &&
          !line.toLowerCase().includes('varietal') &&
          !line.includes('SOLD') &&
          !/^\d+$/.test(line) &&
          line.length > 5) {
        info.coffeeName = line
        break
      }
    }
  }
  
  // 4. 로스터 노트 후보 재검토 (한국어 포함)
  if (!info.notes) {
    for (const line of lines) {
      const lineLower = line.toLowerCase()
      if ((lineLower.includes('blue') || lineLower.includes('raspberry') || 
           lineLower.includes('watermelon') || lineLower.includes('candy') ||
           lineLower.includes('silky') || lineLower.includes('히비스커스') ||
           lineLower.includes('리치') || lineLower.includes('딸기')) &&
          line !== info.coffeeName) {
        info.notes = line
        break
      }
    }
  }
  
  // 5. 정리 작업
  // 커피명에서 불필요한 부분 제거
  if (info.coffeeName && info.coffeeName.includes('SOLD OUT')) {
    info.coffeeName = info.coffeeName.replace('#SOLD OUT', '').trim()
  }
  
  // 디버깅을 위한 로그
  console.log('🎯 추출된 정보:', info)
  
  return info
}