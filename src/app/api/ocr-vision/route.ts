/**
 * Next.js App Router API - Google Vision OCR
 * Production endpoint for OCR processing
 */

import { NextRequest, NextResponse } from 'next/server'
import vision from '@google-cloud/vision'

// Google Vision Client 초기화
let client: vision.ImageAnnotatorClient | null = null

function getVisionClient() {
  if (!client) {
    // Vercel 환경에서는 환경 변수로 JSON 키를 직접 전달
    const credentials = process.env.GOOGLE_VISION_CREDENTIALS
    
    if (credentials) {
      // JSON 문자열로 저장된 경우
      client = new vision.ImageAnnotatorClient({
        credentials: JSON.parse(credentials)
      })
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // 로컬에서 파일 경로 사용
      client = new vision.ImageAnnotatorClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      })
    } else {
      throw new Error('Google Vision credentials not configured')
    }
  }
  return client
}

interface CoffeeInfoOCR {
  coffeeName?: string
  roasterName?: string
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  altitude?: string
  notes?: string
}

// CORS 헤더 설정
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  try {
    // FormData 파싱
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'No image file provided' },
        { status: 400, headers: corsHeaders }
      )
    }

    // File을 Buffer로 변환
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Google Vision API 호출
    const visionClient = getVisionClient()
    const [result] = await visionClient.textDetection({
      image: { content: buffer.toString('base64') }
    })

    const detections = result.textAnnotations
    const fullText = detections?.[0]?.description || ''

    // 커피 정보 추출
    const extractedInfo = extractCoffeeInfo(fullText)

    // 신뢰도 계산 (추출된 필드 수 기반)
    const fieldsFound = Object.values(extractedInfo).filter(v => v).length
    const confidence = Math.min(95, fieldsFound * 12 + 35)

    return NextResponse.json(
      {
        success: true,
        text: fullText,
        confidence,
        extractedInfo,
        method: 'google-vision'
      },
      { headers: corsHeaders }
    )

  } catch (error: any) {
    console.error('OCR processing error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'OCR processing failed'
      },
      { status: 500, headers: corsHeaders }
    )
  }
}

function extractCoffeeInfo(text: string): CoffeeInfoOCR {
  const lines = text.split('\n').filter(line => line.trim())
  const info: CoffeeInfoOCR = {}

  console.log('OCR Raw Text:', text)
  console.log('OCR Lines:', lines)

  // 1단계: 커피 이름 추출 (가장 중요)
  extractCoffeeName(lines, info)
  
  // 2단계: 로스터리 추출 
  extractRoasterName(lines, info)
  
  // 3단계: 원산지 추출
  extractOrigin(lines, info)
  
  // 4단계: 기타 정보 추출
  extractOtherInfo(lines, info)
  
  console.log('Extracted Info:', info)
  return info
}

// 커피 이름 추출 - 한국 라벨 패턴 최적화
function extractCoffeeName(lines: string[], info: CoffeeInfoOCR) {
  // 패턴 1: "Ethiopia Yirgacheffe" 같은 원산지+지역 형태
  for (const line of lines) {
    if (line.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/) && line.length > 10 && line.length < 40) {
      info.coffeeName = line
      return
    }
  }
  
  // 패턴 2: "에티오피아 예가체프" 같은 한글 형태
  for (const line of lines) {
    const koreanPattern = /^[가-힣]+ [가-힣]+$/
    if (koreanPattern.test(line) && line.length > 6 && line.length < 20) {
      info.coffeeName = line
      return
    }
  }
  
  // 패턴 3: 대문자로 된 긴 이름 (브랜드명 제외)
  const excludeBrands = ['TERAROSA', 'FRITZ', 'ANTHRACITE', 'CENTER', 'MONTAGE', 'LEAF']
  for (const line of lines) {
    if (line === line.toUpperCase() && 
        line.length > 8 && 
        line.length < 50 &&
        !excludeBrands.some(brand => line.includes(brand)) &&
        !line.includes('COFFEE') &&
        !line.includes('ROASTERY')) {
      info.coffeeName = line
      return
    }
  }
  
  // 패턴 4: 첫 번째 의미있는 라인 (마지막 수단)
  for (let i = 0; i < Math.min(3, lines.length); i++) {
    const line = lines[i]
    if (line.length > 5 && line.length < 50 && 
        !line.toLowerCase().includes('coffee') &&
        !line.toLowerCase().includes('roastery')) {
      info.coffeeName = line
      return
    }
  }
}

// 로스터리 추출 - 한국 로스터리 최적화
function extractRoasterName(lines: string[], info: CoffeeInfoOCR) {
  const koreanRoasters = [
    '프릳츠', '테라로사', '앤트러사이트', '센터커피', '커피몽타주', 
    '리프커피', '나무사이로', '커피리브레', '커피그래피티', '모모스커피',
    '블루보틀', '스타벅스 리저브', '콜드브루 라운지', '빈브라더스'
  ]
  
  const englishRoasters = [
    'FRITZ', 'TERAROSA', 'ANTHRACITE', 'CENTER', 'MONTAGE',
    'LEAF', 'NAMUSAIRO', 'LIBRE', 'GRAFFITI', 'MOMOS',
    'BLUE BOTTLE', 'STARBUCKS RESERVE', 'BEAN BROTHERS'
  ]
  
  // 정확한 로스터리 이름 매칭
  for (const line of lines) {
    for (const roaster of [...koreanRoasters, ...englishRoasters]) {
      if (line.includes(roaster)) {
        info.roasterName = roaster
        return
      }
    }
  }
  
  // "ROASTERY" 키워드 근처 찾기
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes('roastery') || line.includes('로스터리')) {
      // 같은 줄에서 찾기
      const parts = lines[i].split(/roastery|로스터리/i)
      if (parts[0].trim().length > 2) {
        info.roasterName = parts[0].trim()
        return
      }
      // 이전 줄에서 찾기
      if (i > 0 && lines[i-1].length > 2 && lines[i-1].length < 20) {
        info.roasterName = lines[i-1]
        return
      }
    }
  }
}

// 원산지 추출 - 한국어/영어 모두 지원
function extractOrigin(lines: string[], info: CoffeeInfoOCR) {
  const countries = [
    // 한국어
    { ko: '에티오피아', en: 'ETHIOPIA' },
    { ko: '케냐', en: 'KENYA' },
    { ko: '콜롬비아', en: 'COLOMBIA' },
    { ko: '브라질', en: 'BRAZIL' },
    { ko: '과테말라', en: 'GUATEMALA' },
    { ko: '코스타리카', en: 'COSTA RICA' },
    { ko: '파나마', en: 'PANAMA' },
    { ko: '르완다', en: 'RWANDA' },
    { ko: '인도네시아', en: 'INDONESIA' },
    { ko: '페루', en: 'PERU' },
    { ko: '온두라스', en: 'HONDURAS' },
    { ko: '니카라과', en: 'NICARAGUA' }
  ]
  
  // 정확한 국가명 매칭
  for (const line of lines) {
    const upperLine = line.toUpperCase()
    for (const country of countries) {
      if (line.includes(country.ko) || upperLine.includes(country.en)) {
        info.origin = country.ko
        return
      }
    }
  }
  
  // "ORIGIN" 키워드 근처 찾기
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase()
    if (line.includes('origin') || line.includes('원산지')) {
      const nextLine = lines[i + 1]
      if (nextLine) {
        // 다음 줄에서 국가 찾기
        for (const country of countries) {
          if (nextLine.includes(country.ko) || nextLine.toUpperCase().includes(country.en)) {
            info.origin = country.ko
            return
          }
        }
      }
    }
  }
}

// 기타 정보 추출
function extractOtherInfo(lines: string[], info: CoffeeInfoOCR) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    const nextLine = lines[i + 1]

    // 품종 추출
    if (!info.variety && (lineLower.includes('variety') || lineLower.includes('품종'))) {
      const varieties = ['Geisha', 'Bourbon', 'Typica', 'Caturra', 'Catuai', 'SL28', 'SL34', 'Heirloom']
      for (const variety of varieties) {
        if (nextLine?.includes(variety) || line.includes(variety)) {
          info.variety = variety
          break
        }
      }
    }

    // 가공법 추출
    if (!info.processing) {
      const processes = ['Natural', 'Washed', 'Honey', 'Anaerobic', 'Semi-Washed', 'Wet Hulled']
      for (const process of processes) {
        if (line.includes(process)) {
          info.processing = process
          break
        }
      }
    }

    // 로스팅 레벨
    if (!info.roastLevel) {
      const roastLevels = ['Light', 'Medium', 'Dark', 'City', 'Full City']
      for (const level of roastLevels) {
        if (line.includes(level)) {
          info.roastLevel = level
          break
        }
      }
    }

    // 고도 추출 (숫자 + m 패턴)
    if (!info.altitude) {
      const altitudeMatch = line.match(/(\d{1,4}[-~]\d{1,4}m|\d{1,4}m)/i)
      if (altitudeMatch) {
        info.altitude = altitudeMatch[1]
      }
    }

    // 테이스팅 노트 (맛 키워드가 포함된 라인)
    if (!info.notes) {
      const flavorKeywords = [
        'chocolate', 'berry', 'citrus', 'floral', 'fruity', 'nutty', 'wine',
        '초콜릿', '베리', '시트러스', '꽃', '과일', '견과', '와인', '카라멜'
      ]
      
      if (flavorKeywords.some(keyword => lineLower.includes(keyword)) ||
          line.includes(',') && line.length > 10) {
        info.notes = line
      }
    }
  }
}