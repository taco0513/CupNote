# 검색 및 필터링 기능

> 커피 기록을 효율적으로 찾고 정리할 수 있는 검색/필터링 시스템

## 🎯 기능 개요

사용자가 쌓아가는 커피 기록들 중에서 원하는 것을 빠르게 찾을 수 있도록 도와주는 검색과 필터링 시스템입니다.

### 핵심 기능

- **실시간 검색**: 타이핑과 동시에 결과 업데이트
- **다중 필드 검색**: 커피명, 카페명, 원산지, 맛 노트, 메모, 태그 모든 검색
- **고급 필터링**: 모드, 평점, 날짜, 테이스팅 모드별 필터
- **정렬 옵션**: 날짜, 이름, 평점순 정렬
- **사용자 친화적**: 검색 상태 표시 및 초기화 기능

## 🔍 검색 기능

### 실시간 검색

```typescript
// SearchBar 컴포넌트에서 실시간 검색 구현
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value
  setQuery(value)
  onSearch(value) // 실시간으로 검색 수행
}
```

### 검색 대상 필드

- **커피명**: `record.coffeeName`
- **카페명/로스터리**: `record.roastery`
- **원산지**: `record.origin`
- **맛 노트**: `record.taste`
- **개인 메모**: `record.memo`
- **태그**: `record.tags[]`

### 검색 로직

```typescript
if (searchQuery.trim()) {
  const query = searchQuery.toLowerCase()
  filtered = filtered.filter(
    record =>
      record.coffeeName.toLowerCase().includes(query) ||
      record.roastery?.toLowerCase().includes(query) ||
      record.origin?.toLowerCase().includes(query) ||
      record.taste.toLowerCase().includes(query) ||
      record.memo?.toLowerCase().includes(query) ||
      record.tags?.some(tag => tag.toLowerCase().includes(query))
  )
}
```

## 🎛️ 필터링 시스템

### 모드 필터

사용자가 기록한 커피의 모드별로 필터링

- **🏪 Cafe**: 카페에서 마신 커피
- **🏠 HomeCafe**: 집에서 직접 내린 커피
- **🔬 Lab**: 전문적인 분석이 포함된 기록

### 테이스팅 모드 필터

커피를 기록할 때 선택한 테이스팅 방식별 필터

- **🌱 편하게**: 간단한 맛 표현 모드
- **🎯 전문가**: 상세한 테이스팅 노트 모드

### 평점 필터

최소 별점을 기준으로 필터링

- ⭐⭐⭐⭐⭐ 5점 이상
- ⭐⭐⭐⭐ 4점 이상
- ⭐⭐⭐ 3점 이상
- ⭐⭐ 2점 이상
- ⭐ 1점 이상

### 날짜 범위 필터

기록 생성 날짜를 기준으로 필터링

- **오늘**: 오늘 기록된 커피만
- **이번 주**: 최근 7일간 기록
- **이번 달**: 최근 30일간 기록
- **전체**: 모든 기록

```typescript
switch (filters.dateRange) {
  case 'today':
    return recordDate >= today
  case 'week':
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    return recordDate >= weekAgo
  case 'month':
    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
    return recordDate >= monthAgo
  default:
    return true
}
```

## 📊 정렬 기능

### 정렬 기준

- **날짜순**: 기록 생성 시간 기준 (기본값)
- **이름순**: 커피명 알파벳/한글 순서
- **평점순**: 별점 높은/낮은 순서

### 정렬 방향

- **내림차순**: 최신순, 높은 평점순 (기본값)
- **오름차순**: 과거순, 낮은 평점순

```typescript
filtered.sort((a, b) => {
  let comparison = 0

  switch (sortBy) {
    case 'name':
      comparison = a.coffeeName.localeCompare(b.coffeeName)
      break
    case 'rating':
      comparison = (a.rating || 0) - (b.rating || 0)
      break
    case 'date':
    default:
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      break
  }

  return sortOrder === 'asc' ? comparison : -comparison
})
```

## 🎨 사용자 인터페이스

### SearchBar 컴포넌트

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}
```

**특징:**

- 검색 아이콘 표시
- 검색어 입력시 X 버튼으로 초기화
- 실시간 검색 지원
- 접근성 고려한 폼 구조

### FilterPanel 컴포넌트

```typescript
interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
}
```

**특징:**

- 토글 버튼으로 패널 열기/닫기
- 활성 필터 개수 배지 표시
- 모든 필터 옵션을 한 곳에서 관리
- 필터 초기화 버튼

### 검색 결과 표시

- **결과 개수**: "총 N개의 기록" 표시
- **검색어 표시**: 검색 중일 때 검색어 표시
- **빈 결과**: 검색 결과가 없을 때 안내 메시지
- **전체 초기화**: 모든 검색/필터 한번에 제거

## 🔧 기술적 구현

### 컴포넌트 구조

```
CoffeeList
├── SearchBar (검색 바)
├── FilterPanel (필터 패널)
└── CoffeeCard[] (검색 결과)
```

### 상태 관리

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState<FilterOptions>({})
const [isFilterOpen, setIsFilterOpen] = useState(false)
```

### 성능 최적화

- `useMemo`를 사용한 필터링 결과 캐싱
- 실시간 검색으로 별도 검색 버튼 불필요
- 필터 상태 변경시에만 재계산

### 타입 정의

```typescript
export interface FilterOptions {
  mode?: CoffeeMode
  tasteMode?: TasteMode
  rating?: number
  dateRange?: 'all' | 'today' | 'week' | 'month'
  sortBy?: 'date' | 'name' | 'rating'
  sortOrder?: 'asc' | 'desc'
}
```

## 🎯 사용자 경험

### 직관적인 인터페이스

- 검색창과 필터 버튼이 한 줄에 배치
- 필터 개수 배지로 활성 상태 시각화
- 반응형 디자인으로 모바일 대응

### 상태 피드백

- 검색 결과 개수 실시간 표시
- 검색어/필터 적용시 상태 명시
- 빈 결과에 대한 친절한 안내

### 접근성

- 키보드 내비게이션 지원
- 스크린 리더 호환
- 명확한 레이블과 설명

## 📈 향후 개선사항

### Phase 2

- **고급 검색**: 향미, 로스팅 레벨 등 세부 조건
- **검색 히스토리**: 최근 검색어 저장
- **저장된 필터**: 자주 사용하는 필터 조합 저장

### Phase 3

- **AI 추천**: 검색 패턴 기반 추천
- **지능형 검색**: 오타 교정, 동의어 지원
- **고급 분석**: 검색 통계 및 트렌드

## 🧪 테스트 시나리오

### 기능 테스트

1. **검색 정확성**: 각 필드별 검색 결과 확인
2. **필터 조합**: 여러 필터 동시 적용 테스트
3. **정렬 동작**: 모든 정렬 옵션 검증
4. **상태 관리**: 검색/필터 초기화 확인

### 성능 테스트

1. **대량 데이터**: 1000개 이상 기록에서 검색 속도
2. **실시간 응답**: 타이핑 지연 없이 결과 업데이트
3. **메모리 사용**: 필터링 과정에서 메모리 효율성

### 사용성 테스트

1. **직관성**: 첫 사용자도 쉽게 찾을 수 있는지
2. **모바일**: 터치 인터페이스에서 사용 편의성
3. **접근성**: 스크린 리더 등 보조 기술 호환성

---

**구현 파일**:

- `/src/components/SearchBar.tsx`
- `/src/components/FilterPanel.tsx`
- `/src/components/CoffeeList.tsx`

**의존성**:

- `@tailwindcss/line-clamp`: 텍스트 말줄임 처리

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-30  
**구현 상태**: ✅ 완료
