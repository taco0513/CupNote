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