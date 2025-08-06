// Simple OCR Test API
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    
    const formData = await request.formData()
    const image = formData.get('image') as File
    
    if (!image) {
      return NextResponse.json({
        success: false,
        error: '이미지가 제공되지 않았습니다.'
      }, { status: 400 })
    }

    
    // Google Vision API 직접 호출 (REST API)
    const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY
    const useGoogleVision = process.env.GOOGLE_APPLICATION_CREDENTIALS
    
    if (useGoogleVision) {
      try {
        
        // 이미지를 base64로 변환
        const buffer = Buffer.from(await image.arrayBuffer())
        const base64Image = buffer.toString('base64')
        
        // Vision 모듈 동적 로드
        const vision = await import('@google-cloud/vision')
        const client = new vision.ImageAnnotatorClient()
        
        // 텍스트 감지 실행
        const [result] = await client.textDetection(buffer)
        const detections = result.textAnnotations
        
        if (detections && detections.length > 0) {
          const extractedText = detections[0].description || ''
          
          return NextResponse.json({
            success: true,
            text: extractedText,
            confidence: 90,
            extractedInfo: {
              coffeeName: 'Test Coffee',
              origin: 'Test Origin',
              notes: extractedText.substring(0, 100)
            }
          })
        }
      } catch (error: any) {
        console.error('❌ Vision API 오류:', error.message)
        return NextResponse.json({
          success: false,
          error: error.message,
          details: error.stack
        }, { status: 500 })
      }
    }
    
    // 폴백: 시뮬레이션 모드
    return NextResponse.json({
      success: true,
      text: 'Simulated OCR Text',
      confidence: 85,
      extractedInfo: {
        coffeeName: 'Simulation Coffee',
        origin: 'Ethiopia',
        notes: 'Simulated notes'
      }
    })
    
  } catch (error: any) {
    console.error('❌ OCR Test API 오류:', error)
    return NextResponse.json({
      success: false,
      error: error.message || '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
}