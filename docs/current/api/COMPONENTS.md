# 컴포넌트 API 문서

> CupNote 프로젝트의 React 컴포넌트 사용법과 API 명세

## 🔍 검색 및 필터링 컴포넌트

### SearchBar

실시간 검색 기능을 제공하는 검색 바 컴포넌트

**Props:**

```typescript
interface SearchBarProps {
  onSearch: (query: string) => void
  placeholder?: string
}
```

**사용 예제:**

```typescript
<SearchBar
  onSearch={setSearchQuery}
  placeholder="커피명, 카페명, 원산지 검색..."
/>
```

**기능:**

- 실시간 검색 (타이핑과 동시에 `onSearch` 호출)
- 검색어 초기화 버튼 (X 아이콘)
- 검색 아이콘 표시
- 반응형 디자인

---

### FilterPanel

고급 필터링 옵션을 제공하는 패널 컴포넌트

**Props:**

```typescript
interface FilterPanelProps {
  filters: FilterOptions
  onFiltersChange: (filters: FilterOptions) => void
  isOpen: boolean
  onToggle: () => void
}

interface FilterOptions {
  mode?: CoffeeMode
  tasteMode?: TasteMode
  rating?: number
  dateRange?: 'all' | 'today' | 'week' | 'month'
  sortBy?: 'date' | 'name' | 'rating'
  sortOrder?: 'asc' | 'desc'
}
```

**사용 예제:**

```typescript
<FilterPanel
  filters={filters}
  onFiltersChange={setFilters}
  isOpen={isFilterOpen}
  onToggle={() => setIsFilterOpen(!isFilterOpen)}
/>
```

**기능:**

- 토글 방식 패널 열기/닫기
- 활성 필터 개수 배지 표시
- 모든 필터 옵션 통합 관리
- 필터 초기화 기능

---

## ☕ 커피 기록 컴포넌트

### CoffeeList

커피 기록 목록을 표시하고 검색/필터링을 관리하는 메인 컴포넌트

**Props:** 없음 (자체적으로 상태 관리)

**사용 예제:**

```typescript
<CoffeeList />
```

**내부 구조:**

- `SearchBar`: 검색 기능
- `FilterPanel`: 필터링 기능
- `CoffeeCard[]`: 커피 기록 카드들

**상태 관리:**

```typescript
const [records, setRecords] = useState<CoffeeRecord[]>([])
const [searchQuery, setSearchQuery] = useState('')
const [filters, setFilters] = useState<FilterOptions>({})
const [isFilterOpen, setIsFilterOpen] = useState(false)
```

---

### CoffeeCard

개별 커피 기록을 카드 형태로 표시하는 컴포넌트

**Props:**

```typescript
interface CoffeeCardProps {
  record: CoffeeRecord
}
```

**사용 예제:**

```typescript
<CoffeeCard record={coffeeRecord} />
```

**표시 정보:**

- 커피명 및 모드 배지
- 카페명/로스터리 및 날짜
- 평점 (별점 시각화)
- 맛 노트 (2줄로 제한)
- 원산지 정보
- 태그 (최대 3개 + 더보기)
- 개인 메모 (1줄로 제한)

**기능:**

- 클릭시 상세 페이지로 이동
- 호버 효과 및 그림자
- 반응형 그리드 레이아웃

---

## 📊 상세 페이지 컴포넌트

### HeaderSection

상세 페이지 헤더 (커피명, 날짜, 모드 배지)

**Props:**

```typescript
interface HeaderSectionProps {
  record: CoffeeRecord
  router: any
}
```

**기능:**

- 뒤로가기 버튼
- 커피명 및 날짜 표시
- 모드별 배지 표시
- 평점 시각화

---

### BasicInfoCard

기본 커피 정보를 표시하는 카드

**Props:**

```typescript
interface BasicInfoCardProps {
  record: CoffeeRecord
}
```

**표시 정보:**

- 커피명, 로스터리, 원산지
- 로스팅 레벨, 온도, 기록일

---

### ModeSpecificSection

모드별(HomeCafe/Lab) 특화 정보 표시

**Props:**

```typescript
interface ModeSpecificSectionProps {
  record: CoffeeRecord
}
```

**HomeCafe 모드:**

- 드리퍼, 레시피, 물온도, 추출시간, 분쇄도
- 실험 노트 및 다음번 시도 계획
- 만족도 점수

**Lab 모드:**

- TDS, 추출수율, SCA 점수, 캘리브레이션 점수
- 레이더 차트 분석 (6개 항목)

---

### FlavorProfileSection

향미 프로파일 및 감각 표현 표시

**Props:**

```typescript
interface FlavorProfileSectionProps {
  record: CoffeeRecord
}
```

**구성 요소:**

- 맛 평가 (내가 느낀 맛/테이스팅 노트)
- 로스터 노트
- 선택된 향미 (카테고리별 색상 구분)
- 감각 표현 (산미, 단맛, 바디, 애프터)

---

### FlavorChip

개별 향미를 표시하는 칩 컴포넌트

**Props:**

```typescript
interface FlavorChipProps {
  flavor: FlavorProfile
}

interface FlavorProfile {
  id: string
  name: string
  category: FlavorCategory
  intensity?: number
}
```

**카테고리별 색상:**

- `fruity`: 빨강 계열
- `nutty`: 주황 계열
- `chocolate`: 갈색 계열
- `floral`: 분홍 계열
- `spicy`: 노랑 계열
- `other`: 회색 계열

---

### MatchScoreSection

Match Score 분석 결과 표시

**Props:**

```typescript
interface MatchScoreSectionProps {
  matchScore: MatchScore
}

interface MatchScore {
  overall: number
  flavorMatching: number
  expressionAccuracy: number
  consistency: number
  strengths: string[]
  improvements: string[]
}
```

**기능:**

- 점수별 색상 구분 (90+: 초록, 80+: 파랑, 70+: 노랑, 70-: 빨강)
- 강점 및 개선점 목록 표시

---

### ActionButtonsSection

상세 페이지 하단 액션 버튼들

**Props:**

```typescript
interface ActionButtonsSectionProps {
  record: CoffeeRecord
  router: any
}
```

**버튼 기능:**

- **편집하기**: 편집 모드로 이동 (`/record?edit=${id}`)
- **삭제하기**: 확인 후 기록 삭제
- **공유하기**: 네이티브 공유 API 또는 클립보드 복사

---

## 🛠️ 유틸리티 컴포넌트

### InfoItem

정보를 아이콘과 함께 표시하는 재사용 가능한 컴포넌트

**Props:**

```typescript
interface InfoItemProps {
  icon: string
  label: string
  value: string
}
```

**사용 예제:**

```typescript
<InfoItem icon="☕" label="커피명" value={record.coffeeName} />
<InfoItem icon="🌡️" label="온도" value={record.temperature} />
```

---

### SensoryExpressionItem

감각 표현을 카테고리별로 표시

**Props:**

```typescript
interface SensoryExpressionItemProps {
  sensory: SensoryExpression
}

interface SensoryExpression {
  category: 'acidity' | 'sweetness' | 'body' | 'aftertaste'
  expressions: string[]
}
```

**카테고리 한글명:**

- `acidity`: 산미
- `sweetness`: 단맛
- `body`: 바디
- `aftertaste`: 애프터

---

## 🎨 스타일링 가이드

### Tailwind CSS 클래스

**컨테이너:**

```css
.container mx-auto px-4 py-8 max-w-6xl
```

**카드:**

```css
.bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow
```

**버튼:**

```css
.px-6 py-3 rounded-xl hover:opacity-90 transition-colors font-medium
```

**배지:**

```css
.px-2 py-1 rounded-full text-xs font-medium
```

### 색상 팔레트

**Coffee 색상:**

```css
coffee-50: #f9f6f3
coffee-100: #f0e6dc
coffee-600: #814923
coffee-800: #562f1b
```

**상태별 색상:**

- 성공: `green-*`
- 경고: `yellow-*`
- 오류: `red-*`
- 정보: `blue-*`

---

## 🔧 개발 가이드

### 컴포넌트 작성 규칙

1. **타입 안전성**: 모든 Props에 TypeScript 인터페이스 정의
2. **반응형**: 모든 컴포넌트는 모바일 우선 반응형 설계
3. **접근성**: ARIA 속성 및 키보드 내비게이션 고려
4. **재사용성**: 공통 기능은 별도 컴포넌트로 분리

### 네이밍 컨벤션

- **컴포넌트**: PascalCase (`SearchBar`, `CoffeeCard`)
- **Props 인터페이스**: `{ComponentName}Props`
- **CSS 클래스**: kebab-case 또는 Tailwind 유틸리티
- **이벤트 핸들러**: `handle{EventName}` (`handleSearch`, `handleFilter`)

### 파일 구조

```
src/
├── components/
│   ├── SearchBar.tsx
│   ├── FilterPanel.tsx
│   ├── CoffeeList.tsx
│   └── ...
├── types/
│   └── coffee.ts
└── lib/
    ├── storage.ts
    └── flavorData.ts
```

---

**문서 버전**: 1.0  
**최종 업데이트**: 2025-01-30  
**구현 파일 개수**: 15개 컴포넌트  
**총 라인 수**: ~1200줄
