# Search System Design

**Document Status**: Implementation Guide  
**Version**: 1.0.0  
**Last Updated**: 2025-08-02  
**Compliance**: CupNote v1.3 Feature Specification

## 검색 시스템 철학

**"Find Every Drop"** - 사용자가 기록한 모든 커피 경험을 쉽고 빠르게 찾을 수 있어야 함

### 핵심 원칙

1. **Real-time Search**: 타이핑과 동시에 즉시 결과 표시
2. **Multi-field Search**: 커피명, 로스터리, 맛 노트, 장소 등 통합 검색
3. **Smart Filtering**: 날짜, 평점, 모드별 지능형 필터링
4. **Mobile Optimized**: 모바일에서 사용하기 편한 인터페이스
5. **Performance First**: 검색 결과 <200ms 응답 시간

## 검색 가능한 필드

### 1. 기본 정보
- **커피 이름**: 원두명, 블렌드명
- **로스터리**: 로스터리 이름, 브랜드
- **원산지**: 국가, 지역, 농장명
- **가격**: 범위 검색 지원

### 2. 맛 관련
- **맛 노트**: 사용자가 입력한 맛 설명
- **로스터 노트**: 공식 맛 프로필
- **평점**: 전체 평점, 개별 항목 평점
- **추출 방법**: 드립, 에스프레소, 프렌치프레스 등

### 3. 메타데이터
- **기록 날짜**: 날짜 범위 검색
- **장소**: 카페명, 집, 기타 장소
- **기록 모드**: Cafe, HomeCafe, Lab
- **태그**: 사용자 커스텀 태그

### 4. 고급 검색
- **추출 변수**: 원두량, 물 온도, 추출 시간
- **기구**: 사용한 추출 기구
- **날씨/분위기**: 함께한 사람, 날씨 등

## 검색 인터페이스 디자인

### 헤더 검색바
```typescript
interface SearchBarProps {
  placeholder: string
  value: string
  onSearch: (query: string) => void
  onFilterOpen: () => void
  results: SearchResult[]
  isLoading: boolean
}
```

### 검색 결과 페이지
- **통합 결과**: 모든 타입의 결과를 하나의 리스트로
- **카테고리 필터**: 기본정보, 맛, 장소별 분류
- **정렬 옵션**: 관련도, 날짜, 평점순
- **미리보기**: 검색어 하이라이트와 컨텍스트

### 고급 필터
- **날짜 범위**: 달력 UI로 직관적 선택
- **평점 범위**: 슬라이더로 범위 설정
- **모드 선택**: 체크박스로 다중 선택
- **태그 선택**: 자동완성으로 기존 태그 선택

## 검색 알고리즘

### 1. 텍스트 매칭
```typescript
interface SearchScore {
  relevance: number  // 0-100
  fieldMatches: {
    coffeeName: number
    roastery: number
    tastingNotes: number
    location: number
  }
}
```

**점수 계산**:
- 정확한 매칭: 100점
- 부분 매칭: 60-80점
- 유사 문자열: 30-50점
- 태그 매칭: 40-60점

### 2. 가중치 시스템
- **커피 이름**: 40%
- **로스터리**: 25%
- **맛 노트**: 20%
- **장소**: 10%
- **기타**: 5%

### 3. 최근성 부스트
- 최근 30일: +20점
- 최근 90일: +10점
- 최근 1년: +5점

## 성능 최적화

### 프론트엔드 최적화
- **Debouncing**: 300ms 딜레이로 API 호출 최소화
- **Memoization**: 검색 결과 캐싱
- **Virtual Scrolling**: 대량 결과 처리
- **Lazy Loading**: 상세 정보는 필요시 로드

### 백엔드 최적화
- **인덱싱**: 주요 검색 필드에 복합 인덱스
- **Full-text Search**: PostgreSQL Full-text search 활용
- **캐싱**: Redis로 인기 검색어 캐싱
- **페이지네이션**: 20개씩 페이지 단위 로드

## 사용자 경험

### 검색 플로우
1. **헤더 검색**: 빠른 접근, 자동완성
2. **즉시 결과**: 타이핑 중 실시간 미리보기
3. **상세 검색**: 필터와 함께 정밀 검색
4. **저장된 검색**: 자주 사용하는 검색어 저장

### 모바일 최적화
- **터치 친화적**: 44px 최소 터치 영역
- **스와이프**: 필터 패널 스와이프 열기/닫기
- **음성 검색**: (향후) 음성으로 검색어 입력
- **검색 히스토리**: 최근 검색어 빠른 접근

### 빈 상태 처리
- **검색 전**: 인기 검색어, 최근 검색어 표시
- **결과 없음**: 검색어 수정 제안, 필터 해제 제안
- **오류 상태**: 재시도 버튼, 오프라인 알림

## 구현 단계

### Phase 1: 기본 검색 (이번 구현)
- AppHeader 검색바 활성화
- 기본 텍스트 검색 (커피명, 로스터리)
- 검색 결과 페이지
- 기본 필터 (날짜, 모드)

### Phase 2: 고급 검색
- 맛 노트 Full-text 검색
- 고급 필터 UI
- 검색 결과 정렬/그룹핑
- 검색 히스토리

### Phase 3: 지능형 검색
- 자동완성
- 검색어 추천
- 태그 기반 검색
- 저장된 검색

### Phase 4: AI 검색
- 의미 기반 검색
- 맛 프로필 유사도 검색
- 자연어 쿼리 처리

## 기술 스택

- **Frontend**: React, TypeScript, Tailwind CSS
- **State**: Context API + useReducer
- **Search Engine**: Supabase PostgreSQL Full-text Search
- **Caching**: Browser localStorage, Session storage
- **Animation**: 기존 마이크로 애니메이션 시스템 활용