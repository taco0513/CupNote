import { NextRequest, NextResponse } from 'next/server'

import { CoffeeRecord } from '../../../types/coffee'

// 로컬 스토리지 대신 서버에서 관리할 임시 데이터
let records: CoffeeRecord[] = [
  {
    id: '1',
    userId: 'user1',
    coffeeName: '에티오피아 예가체프',
    roastery: '블루보틀',
    date: '2024-01-30',
    taste: '정말 새콤달콤한 사탕 같았어요. 차가워지니까 더 달아졌어요.',
    roasterNote: '블루베리, 다크초콜릿, 와인',
    tasteMode: 'simple',
    memo: '뉴욕에서 친구와 함께. 게이샤 첫 경험!',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user1',
    coffeeName: '콜롬비아 게이샤',
    roastery: '앤썸',
    date: '2024-01-28',
    taste: '자몽, 베르가못, 꿀, 밝은 산미',
    roasterNote: '자스민, 베르가못, 꿀',
    tasteMode: 'professional',
    createdAt: new Date().toISOString(),
  },
]

// GET: 모든 기록 조회
export async function GET() {
  return NextResponse.json(
    records.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  )
}

// POST: 새 기록 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const newRecord: CoffeeRecord = {
      id: Date.now().toString(),
      userId: 'user1', // 임시 사용자 ID
      createdAt: new Date().toISOString(),
      ...body,
    }

    records.push(newRecord)

    return NextResponse.json(newRecord, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
