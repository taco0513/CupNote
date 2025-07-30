import { CoffeeRecord } from '@/types/coffee'
import { generateSampleFlavorProfile, generateSampleSensoryExpressions } from './flavorData'

const STORAGE_KEY = 'cupnote-records'

export class LocalStorage {
  // 모든 기록 가져오기
  static getRecords(): CoffeeRecord[] {
    if (typeof window === 'undefined') return []

    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) return []

      const records = JSON.parse(stored)
      return records.sort(
        (a: CoffeeRecord, b: CoffeeRecord) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    } catch (error) {
      console.error('로컬 스토리지 읽기 오류:', error)
      return []
    }
  }

  // 새 기록 추가
  static addRecord(record: Omit<CoffeeRecord, 'id' | 'userId' | 'createdAt'>): CoffeeRecord {
    const newRecord: CoffeeRecord = {
      id: Date.now().toString(),
      userId: 'user1',
      createdAt: new Date().toISOString(),
      ...record,
    }

    const records = this.getRecords()
    records.unshift(newRecord) // 최신 기록을 앞에 추가

    this.saveRecords(records)
    return newRecord
  }

  // 기록 업데이트
  static updateRecord(id: string, updates: Partial<CoffeeRecord>): CoffeeRecord | null {
    const records = this.getRecords()
    const index = records.findIndex(r => r.id === id)

    if (index === -1) return null

    records[index] = { ...records[index], ...updates }
    this.saveRecords(records)
    return records[index]
  }

  // 기록 삭제
  static deleteRecord(id: string): boolean {
    const records = this.getRecords()
    const filteredRecords = records.filter(r => r.id !== id)

    if (filteredRecords.length === records.length) return false

    this.saveRecords(filteredRecords)
    return true
  }

  // ID로 기록 찾기
  static getRecordById(id: string): CoffeeRecord | null {
    const records = this.getRecords()
    return records.find(r => r.id === id) || null
  }

  // 로컬 스토리지에 저장
  private static saveRecords(records: CoffeeRecord[]): void {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
    } catch (error) {
      console.error('로컬 스토리지 저장 오류:', error)
    }
  }

  // 초기 샘플 데이터 설정 (첫 방문시만)
  static initializeSampleData(): void {
    const existing = this.getRecords()
    if (existing.length > 0) return

    const sampleRecords: CoffeeRecord[] = [
      {
        id: '1',
        userId: 'user1',
        coffeeName: '에티오피아 예가체프',
        roastery: '블루보틀 서울',
        origin: '에티오피아 > 예가체프',
        roastLevel: '미디엄 라이트',
        temperature: 'Hot',
        date: '2024-01-30',
        taste:
          '정말 새콤달콤한 사탕 같았어요. 차가워지니까 더 달아졌어요. 베리 향이 특히 인상적이었고, 아침에 마시기 좋은 부드러운 맛이었습니다.',
        roasterNote: '블루베리, 다크초콜릿, 와인',
        tasteMode: 'simple',
        mode: 'cafe',
        memo: '뉴욕에서 친구와 함께. 게이샤 첫 경험!',
        selectedFlavors: generateSampleFlavorProfile(),
        sensoryExpressions: generateSampleSensoryExpressions(),
        matchScore: {
          overall: 88,
          flavorMatching: 92,
          expressionAccuracy: 85,
          consistency: 87,
          strengths: ['향미 감지 뛰어남', '베리 계열 구분 정확'],
          improvements: ['바디감 더 주의깊게', '애프터테이스트 표현력 향상'],
        },
        tags: ['아침커피', '에티오피아', '과일향', '추천', '게이샤'],
        rating: 4,
        createdAt: new Date('2024-01-30T14:30:00').toISOString(),
      },
      {
        id: '2',
        userId: 'user1',
        coffeeName: '콜롬비아 게이샤',
        roastery: '앤썸',
        origin: '콜롬비아 > 우일라',
        roastLevel: '라이트',
        temperature: 'Hot',
        date: '2024-01-28',
        taste: '자몽, 베르가못, 꿀, 밝은 산미',
        roasterNote: '자스민, 베르가못, 꿀',
        tasteMode: 'professional',
        mode: 'homecafe',
        homecafeData: {
          dripper: 'V60',
          grindSize: 'Medium',
          waterTemp: 92,
          brewTime: '3분 30초',
          ratio: '1:16',
          coffeeWeight: 20,
          waterWeight: 320,
          notes: '블룸이 평소보다 활발했음. 향이 매우 강하게 올라옴',
          nextTry: '분쇄도를 조금 더 굵게 해서 추출 시간 늘려보기',
          satisfaction: 4,
        },
        selectedFlavors: [
          { id: 'citrus', name: 'Citrus', category: 'fruity' },
          { id: 'bergamot', name: 'Bergamot', category: 'other' },
          { id: 'honey', name: 'Honey', category: 'other' },
          { id: 'jasmine', name: 'Jasmine', category: 'floral' },
          { id: 'tea', name: 'Tea', category: 'other' },
        ],
        sensoryExpressions: [
          {
            category: 'acidity',
            expressions: ['밝은', '자몽 같은', '깔끔한'],
          },
          {
            category: 'sweetness',
            expressions: ['꿀 같은', '부드러운'],
          },
          {
            category: 'body',
            expressions: ['미디엄바디', '실키한'],
          },
          {
            category: 'aftertaste',
            expressions: ['길게 남는', '복합적인', '여운이 있는'],
          },
        ],
        tags: ['홈카페', '콜롬비아', '게이샤', '실험'],
        rating: 4,
        createdAt: new Date('2024-01-28T16:20:00').toISOString(),
      },
    ]

    this.saveRecords(sampleRecords)
  }

  // 데이터 내보내기 (백업용)
  static exportData(): string {
    const records = this.getRecords()
    return JSON.stringify(records, null, 2)
  }

  // 데이터 가져오기 (복원용)
  static importData(jsonData: string): boolean {
    try {
      const records = JSON.parse(jsonData)
      if (!Array.isArray(records)) return false

      this.saveRecords(records)
      return true
    } catch (error) {
      console.error('데이터 가져오기 오류:', error)
      return false
    }
  }
}
