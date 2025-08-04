// 간단한 서버 사이드 OCR API
import { NextRequest, NextResponse } from 'next/server'

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
    
    // 처리 시뮬레이션 (실제 OCR 처리 시간을 모방)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // 테스트용: 항상 성공적인 모의 데이터 반환
    const mockExtractedInfo = {
      coffeeName: 'El Diviso - Omblgon Decaf',
      roasterName: '',
      origin: 'Colombia',
      variety: 'Omblgon',
      processing: 'Mossto Anaerobic Natural',
      roastLevel: '',
      altitude: '',
      notes: 'Blue Raspberry, Watermelon Candy, Silky, Cacao Nibs'
    }
    
    const mockText = `COLOMBIA
El Diviso - Omblgon Decaf
Blue Raspberry, Watermelon Candy, Silky, Cacao Nibs
Region: Bruselas, Pitalito-Huila
Process: Mossto Anaerobic Natural  
Varietal: Omblgon`

    console.log('✅ 모의 OCR 데이터 생성 완료')
    console.log('📄 추출된 텍스트:', mockText)
    console.log('📋 파싱된 정보:', mockExtractedInfo)
    
    return NextResponse.json({
      success: true,
      text: mockText,
      confidence: 95,
      extractedInfo: mockExtractedInfo
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