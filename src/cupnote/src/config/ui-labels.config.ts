/**
 * UI Labels Configuration
 * 중앙집중화된 UI 텍스트 관리
 * 
 * 이 파일에서 라벨을 변경하면 앱 전체에 자동 반영됩니다.
 */

export const UI_LABELS = {
  // Navigation
  navigation: {
    home: '홈',
    record: '기록',
    search: '검색',
    mypage: '마이페이지',
    back: '뒤로',
    next: '다음',
    previous: '이전',
    save: '저장',
    cancel: '취소',
    complete: '완료',
  },

  // Record Flow
  record: {
    title: '커피 기록하기',
    selectMode: '기록 모드를 선택하세요',
    basicInfo: '기본 정보',
    tasteEvaluation: '맛 평가',
    additionalInfo: '추가 정보',
    review: '최종 검토',
    submitRecord: '기록 완료하기',
    saving: '저장 중...',
    saved: '저장 완료!',
  },

  // Form Fields
  form: {
    coffeeName: '커피 이름',
    roastery: '로스터리',
    cafe: '카페',
    date: '날짜',
    rating: '평점',
    taste: '맛 표현',
    memo: '메모',
    origin: '원산지',
    roastLevel: '로스팅 정도',
    brewMethod: '추출 방법',
    grindSize: '분쇄도',
    waterTemp: '물 온도',
    brewTime: '추출 시간',
    ratio: '비율',
  },

  // Rating Labels
  rating: {
    1: '별로예요',
    2: '그냥 그래요',
    3: '괜찮아요',
    4: '맛있어요',
    5: '최고예요!',
  },

  // Common Actions
  actions: {
    edit: '수정',
    delete: '삭제',
    share: '공유',
    filter: '필터',
    sort: '정렬',
    search: '검색',
    reset: '초기화',
    loadMore: '더 보기',
    refresh: '새로고침',
  },

  // Status Messages
  status: {
    loading: '불러오는 중...',
    error: '오류가 발생했습니다',
    empty: '데이터가 없습니다',
    noResults: '검색 결과가 없습니다',
    offline: '오프라인 모드',
    syncing: '동기화 중...',
    synced: '동기화 완료',
  },

  // Tips & Helpers
  tips: {
    selectMode: '어떤 상황에서 커피를 마셨나요?',
    quickMode: '빠르게 기록하고 싶을 때',
    cafeMode: '카페에서 마신 커피를 기록할 때',
    homecafeMode: '집에서 직접 내린 커피를 기록할 때',
  },
} as const

// Type exports
export type UILabelCategory = keyof typeof UI_LABELS
export type UILabel<T extends UILabelCategory> = keyof typeof UI_LABELS[T]

// Helper functions
export const getLabel = <T extends UILabelCategory>(
  category: T,
  key: UILabel<T>
): string => {
  const categoryObj = UI_LABELS[category]
  const value = (categoryObj as any)[key]
  return value as string
}

export const getRatingLabel = (rating: number): string => {
  return UI_LABELS.rating[rating as keyof typeof UI_LABELS.rating] || ''
}

// Interpolation helper for dynamic labels
export const formatLabel = (template: string, values: Record<string, any>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match
  })
}