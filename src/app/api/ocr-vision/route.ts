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

  // 패턴 매칭으로 정보 추출
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineLower = line.toLowerCase()
    const nextLine = lines[i + 1]

    // 커피 이름 (첫 번째 큰 텍스트)
    if (!info.coffeeName && i === 0 && line.length > 3) {
      info.coffeeName = line
    }

    // 로스터리
    if (lineLower.includes('roaster') || lineLower.includes('로스터')) {
      info.roasterName = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 원산지
    if (lineLower.includes('origin') || lineLower.includes('원산지')) {
      info.origin = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 품종
    if (lineLower.includes('variety') || lineLower.includes('품종')) {
      info.variety = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 가공법
    if (lineLower.includes('process') || lineLower.includes('가공')) {
      info.processing = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 로스팅
    if (lineLower.includes('roast') || lineLower.includes('로스팅')) {
      info.roastLevel = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 고도
    if (lineLower.includes('altitude') || lineLower.includes('고도')) {
      info.altitude = nextLine || line.split(/[:：]/)[1]?.trim()
    }

    // 노트
    if (lineLower.includes('note') || lineLower.includes('노트')) {
      info.notes = nextLine || line.split(/[:：]/)[1]?.trim()
    }
  }

  // 국가명 패턴 매칭
  const countries = ['에티오피아', 'Ethiopia', '케냐', 'Kenya', '콜롬비아', 'Colombia', 
                    '브라질', 'Brazil', '과테말라', 'Guatemala', '코스타리카', 'Costa Rica',
                    '파나마', 'Panama', '르완다', 'Rwanda', '인도네시아', 'Indonesia']
  if (!info.origin) {
    for (const country of countries) {
      const found = lines.find(line => line.includes(country))
      if (found) {
        info.origin = country
        break
      }
    }
  }

  // 한국 로스터리 매칭
  const roasters = ['프릳츠', '테라로사', '앤트러사이트', '센터커피', '커피몽타주', 
                   '리프커피', '나무사이로', '커피리브레', '커피그래피티', '모모스커피',
                   '블루보틀', '스타벅스 리저브', '콜드브루 라운지']
  if (!info.roasterName) {
    for (const roaster of roasters) {
      const found = lines.find(line => line.includes(roaster))
      if (found) {
        info.roasterName = roaster
        break
      }
    }
  }

  // 가공법 패턴
  const processes = ['Natural', 'Washed', 'Honey', 'Anaerobic', 'Semi-Washed', 
                    '내추럴', '워시드', '허니', '혐기성', '세미워시드']
  if (!info.processing) {
    for (const process of processes) {
      const found = lines.find(line => line.includes(process))
      if (found) {
        info.processing = process
        break
      }
    }
  }

  return info
}