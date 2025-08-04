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

    // Tesseract 서버 사이드 처리
    const result = await Tesseract.recognize(
      dataUrl,
      'eng+kor',
      {
        logger: m => console.log('OCR Progress:', m)
      }
    )

    // 커피 정보 추출 로직
    const extractedInfo = parseStrageCoffeeInfo(result.data.text)

    return NextResponse.json({
      success: true,
      text: result.data.text,
      confidence: result.data.confidence,
      extractedInfo
    })
  } catch (error) {
    console.error('서버 OCR 오류:', error)
    return NextResponse.json(
      { error: 'OCR 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// Strage 커피 정보 파싱 함수
function parseStrageCoffeeInfo(text: string): any {
  const info: any = {}
  
  // 커피 이름 추출
  const nameMatch = text.match(/([A-Za-z가-힣\s]+)\s*(?:블렌드|싱글|에스프레소|드립)/i)
  if (nameMatch) info.name = nameMatch[1].trim()
  
  // 로스터리 추출
  const roasteryPatterns = [
    /로스터리\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
    /Roastery\s*[:：]\s*([A-Za-z\s]+)/i,
    /by\s+([A-Za-z가-힣\s]+)/i
  ]
  
  for (const pattern of roasteryPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.roastery = match[1].trim()
      break
    }
  }
  
  // 원산지 추출
  const originPatterns = [
    /원산지\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
    /Origin\s*[:：]\s*([A-Za-z\s,]+)/i,
    /산지\s*[:：]\s*([A-Za-z가-힣\s,]+)/i
  ]
  
  for (const pattern of originPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.origin = match[1].trim()
      break
    }
  }
  
  // 가공 방식 추출
  const processPatterns = [
    /가공\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
    /Process\s*[:：]\s*([A-Za-z\s]+)/i,
    /(Natural|Washed|Honey|Semi-washed|Anaerobic)/i
  ]
  
  for (const pattern of processPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.process = match[1].trim()
      break
    }
  }
  
  // 로스팅 포인트 추출
  const roastPatterns = [
    /로스팅\s*[:：]\s*([A-Za-z가-힣\s]+)/i,
    /Roast\s*[:：]\s*([A-Za-z\s]+)/i,
    /(Light|Medium|Dark|City|Full City)/i
  ]
  
  for (const pattern of roastPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.roastLevel = match[1].trim()
      break
    }
  }
  
  // 향미 노트 추출
  const flavorPatterns = [
    /향미\s*[:：]\s*([A-Za-z가-힣\s,]+)/i,
    /Flavor\s*[:：]\s*([A-Za-z\s,]+)/i,
    /Notes?\s*[:：]\s*([A-Za-z\s,]+)/i,
    /테이스팅\s?노트\s*[:：]\s*([A-Za-z가-힣\s,]+)/i
  ]
  
  for (const pattern of flavorPatterns) {
    const match = text.match(pattern)
    if (match) {
      info.flavorNotes = match[1].trim()
      break
    }
  }
  
  return info
}