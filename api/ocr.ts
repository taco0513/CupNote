/**
 * Vercel Function - Google Vision OCR API
 * Production endpoint for OCR processing
 */

import { VercelRequest, VercelResponse } from '@vercel/node'
import vision from '@google-cloud/vision'
import formidable from 'formidable'
import fs from 'fs'

// Google Vision Client 초기화
const client = new vision.ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
})

export const config = {
  api: {
    bodyParser: false,
  },
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // FormData 파싱
    const form = formidable({ multiples: false })
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve([fields, files])
      })
    })

    const imageFile = Array.isArray(files.image) ? files.image[0] : files.image
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // 이미지 파일 읽기
    const imageBuffer = fs.readFileSync(imageFile.filepath)

    // Google Vision API 호출
    const [result] = await client.textDetection({
      image: { content: imageBuffer.toString('base64') }
    })

    const detections = result.textAnnotations
    const fullText = detections?.[0]?.description || ''

    // 커피 정보 추출
    const extractedInfo = extractCoffeeInfo(fullText)

    // 신뢰도 계산 (추출된 필드 수 기반)
    const fieldsFound = Object.values(extractedInfo).filter(v => v).length
    const confidence = Math.min(95, fieldsFound * 12 + 35)

    return res.status(200).json({
      success: true,
      text: fullText,
      confidence,
      extractedInfo,
      method: 'google-vision'
    })

  } catch (error: any) {
    console.error('OCR processing error:', error)
    return res.status(500).json({
      success: false,
      error: error.message || 'OCR processing failed'
    })
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
                    '브라질', 'Brazil', '과테말라', 'Guatemala', '코스타리카', 'Costa Rica']
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
                   '리프커피', '나무사이로', '커피리브레']
  if (!info.roasterName) {
    for (const roaster of roasters) {
      const found = lines.find(line => line.includes(roaster))
      if (found) {
        info.roasterName = roaster
        break
      }
    }
  }

  return info
}