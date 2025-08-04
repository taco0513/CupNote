// 서버 사이드 OCR API
// iOS 호환성 문제 해결을 위한 서버 사이드 OCR 처리

import { NextRequest, NextResponse } from 'next/server'

// Next.js API Route에서는 동적 import 사용
const Tesseract = require('tesseract.js')

export async function POST(request: NextRequest) {
  try {
    console.log('OCR API 요청 받음')
    
    // FormData 처리 시 에러 핸들링 개선
    let formData
    try {
      formData = await request.formData()
    } catch (error) {
      console.error('FormData 파싱 오류:', error)
      return NextResponse.json(
        { error: 'FormData 파싱 실패' },
        { status: 400 }
      )
    }
    
    const image = formData?.get('image') as File
    
    if (!image) {
      return NextResponse.json(
        { error: '이미지가 제공되지 않았습니다.' },
        { status: 400 }
      )
    }
    
    console.log('이미지 받음:', image.name, image.size)

    // 이미지를 Buffer로 변환
    const buffer = await image.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${image.type};base64,${base64}`

    // Tesseract 서버 사이드 처리 (타임아웃 30초)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('OCR 처리 시간 초과')), 30000)
    })
    
    const ocrPromise = Tesseract.recognize(
      dataUrl,
      'eng+kor',
      {
        logger: m => {
          console.log('OCR Progress:', m.status, m.progress)
          if (m.status === 'recognizing text') {
            console.log(`진행률: ${Math.round(m.progress * 100)}%`)
          }
        }
      }
    )
    
    const result = await Promise.race([ocrPromise, timeoutPromise])

    // 커피 정보 추출 로직
    let extractedInfo = {}
    try {
      extractedInfo = parseStrageCoffeeInfo(result.data.text)
      console.log('파싱된 커피 정보:', extractedInfo)
    } catch (parseError) {
      console.warn('커피 정보 파싱 실패:', parseError)
      // 파싱 실패해도 텍스트는 반환
    }

    return NextResponse.json({
      success: true,
      text: result.data.text || '',
      confidence: result.data.confidence || 0,
      extractedInfo: extractedInfo || {}
    })
  } catch (error) {
    console.error('서버 OCR 오류:', error)
    return NextResponse.json(
      { error: 'OCR 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// 커피 정보 파싱 함수 (더 안전한 버전)
function parseStrageCoffeeInfo(text: string): any {
  if (!text || typeof text !== 'string') {
    console.warn('빈 텍스트 또는 잘못된 형식:', text)
    return {}
  }

  const info: any = {}
  
  try {
    // 커피 이름 추출 (다양한 패턴)
    const namePatterns = [
      /([A-Za-z가-힣\s]+)\s*(?:블렌드|싱글|에스프레소|드립)/i,
      /Coffee[:\s]*([A-Za-z가-힣\s]+)/i,
      /커피[:\s]*([A-Za-z가-힣\s]+)/i,
      /^([A-Za-z가-힣\s]{3,30})/m // 첫 줄에서 3-30자 사이
    ]
    
    for (const pattern of namePatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 2) {
        info.coffeeName = match[1].trim()
        break
      }
    }
    
    // 로스터리 추출
    const roasteryPatterns = [
      /로스터리\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
      /Roastery\s*[:：]\s*([A-Za-z\s]+)/i,
      /Roasted\s+by\s+([A-Za-z가-힣\s]+)/i,
      /by\s+([A-Za-z가-힣\s]{3,20})/i
    ]
    
    for (const pattern of roasteryPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 2) {
        info.roasterName = match[1].trim()
        break
      }
    }
    
    // 원산지 추출
    const originPatterns = [
      /원산지\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
      /Origin\s*[:：]\s*([A-Za-z\s,]+)/i,
      /산지\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
      /(Ethiopia|Colombia|Brazil|Kenya|Guatemala|Costa Rica|Panama|Jamaica|Yemen|Honduras|Nicaragua|Peru|Bolivia|Ecuador)/i
    ]
    
    for (const pattern of originPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 1) {
        info.origin = match[1].trim()
        break
      }
    }
    
    // 가공 방식 추출
    const processPatterns = [
      /가공\s*방식?\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
      /Process\s*[:：]\s*([A-Za-z\s]+)/i,
      /(Natural|Washed|Honey|Semi-washed|Anaerobic|Wet|Dry)/i
    ]
    
    for (const pattern of processPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 2) {
        info.processing = match[1].trim()
        break
      }
    }
    
    // 로스팅 레벨 추출
    const roastPatterns = [
      /로스팅\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
      /Roast\s*[:：]\s*([A-Za-z\s]+)/i,
      /(Light|Medium|Dark|City|Full City|French|Italian)/i
    ]
    
    for (const pattern of roastPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 2) {
        info.roastLevel = match[1].trim()
        break
      }
    }
    
    // 향미 노트 추출
    const flavorPatterns = [
      /향미\s*노트?\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
      /Flavor\s*Notes?\s*[:：]\s*([A-Za-z\s,]+)/i,
      /Notes?\s*[:：]\s*([A-Za-z\s,]+)/i,
      /테이스팅\s?노트\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
      /맛\s*[:：]\s*([A-Za-z가-힣\s,]+)/i
    ]
    
    for (const pattern of flavorPatterns) {
      const match = text.match(pattern)
      if (match && match[1] && match[1].trim().length > 2) {
        info.notes = match[1].trim()
        break
      }
    }

    console.log('추출된 정보:', info)
    return info
    
  } catch (error) {
    console.error('파싱 중 오류:', error)
    return {}
  }
}