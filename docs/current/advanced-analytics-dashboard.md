# 고급 분석 대시보드 (Advanced Analytics Dashboard)

## 📊 개요
**고급 분석 대시보드**는 CupNote v1.3.0에서 도입된 AI 기반 커피 취향 분석 시스템입니다. 사용자의 커피 기록을 다차원적으로 분석하여 개인화된 인사이트와 추천을 제공합니다.

## 🎯 핵심 기능

### 1. 맛 프로파일 레이더 차트 (Flavor Radar Chart)
- **6가지 핵심 지표**: 산미, 향미, 쓴맛, 단맛, 바디, 아로마
- **시간별 비교**: 이번 달 vs 지난 달 프로파일 비교
- **인터랙티브 UI**: 호버시 실제 수치 표시
- **시각적 디자인**: 브라운 테마의 육각형 차트

### 2. 통계 요약 카드
- **총 기록**: 전체 커피 기록 수
- **평균 평점**: 전체 평균 만족도
- **취향 매치**: AI가 분석한 선호도 매칭률
- **기록 스트릭**: 연속 기록 일수

### 3. 로스터리 선호도 트렌드
- **평점 기반 순위**: 로스터리별 평균 평점
- **트렌드 표시**: 상승/하락/신규 표시
- **방문 빈도**: 각 로스터리 방문 횟수

### 4. 계절별 취향 변화
- **계절별 분석**: 봄/여름/가을/겨울별 선호 패턴
- **주요 키워드**: 계절별 자주 언급한 맛
- **선호 원산지**: 계절별 선호하는 커피 원산지

### 5. AI 추천 시스템
- **취향 프로파일**: AI가 분석한 개인 취향 요약
- **카페 추천**: 취향 매치율 기반 카페 추천
- **원두 추천**: 선호도 기반 원두 추천

## 🚀 접근 방법

### 정식 사용자
1. **홈 화면** → **"내 기록"** 탭
2. **"분석"** 탭 선택
3. **"AI 고급 분석 대시보드"** 섹션
4. **"고급 분석 보기 →"** 버튼 클릭

### 데모 모드
1. **홈 화면** → **"Demo 체험하기"** 버튼
2. 하단 **"고급 분석 체험"** 카드 클릭

### 직접 URL
- Production: `https://cupnote.vercel.app/analytics-concept`
- Local: `http://localhost:5173/analytics-concept`

## 💡 기술 구현

### 컴포넌트 구조
```
/src/components/charts/
├── FlavorRadarChart.tsx    # 맛 프로파일 레이더 차트
└── (future charts...)       # 추가 차트 컴포넌트

/src/app/analytics-concept/
└── page.tsx                 # 메인 대시보드 페이지
```

### 주요 기술
- **React 18**: 클라이언트 컴포넌트
- **SVG Graphics**: 커스텀 레이더 차트
- **Tailwind CSS**: 반응형 디자인
- **TypeScript**: 타입 안전성

### FlavorRadarChart Props
```typescript
interface FlavorRadarChartProps {
  data: {
    labels: string[]      // 라벨 배열
    values: number[]      // 값 배열 (0-5)
  }
  previousData?: {...}    // 비교 데이터 (선택)
  size?: number          // 차트 크기 (기본: 300)
  strokeColor?: string   // 선 색상
  fillColor?: string     // 채우기 색상
  showValues?: boolean   // 값 표시 여부
  showGrid?: boolean     // 그리드 표시 여부
}
```

## 📈 향후 개발 계획

### Phase 1 (v1.3.0) - 현재
- ✅ 디자인 컨셉 페이지 구현
- ✅ FlavorRadarChart 컴포넌트
- ✅ 샘플 데이터 시각화
- ✅ 데모 모드 통합

### Phase 2 (v1.4.0)
- [ ] 실제 사용자 데이터 연동
- [ ] Chart.js/Recharts 통합
- [ ] 데이터 export 기능
- [ ] 커스텀 기간 선택

### Phase 3 (v1.5.0)
- [ ] AI 모델 통합 (GPT API)
- [ ] 실시간 추천 업데이트
- [ ] 커뮤니티 평균 비교
- [ ] 공유 기능

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: Coffee Brown (#8B4513)
- **Secondary**: Chocolate (#D2691E)
- **Accent**: Purple-Blue Gradient
- **Background**: Coffee-tinted whites

### 레이아웃
- **Desktop**: 2-column grid, sidebar filters
- **Mobile**: Single column, collapsible sections
- **Tablet**: Adaptive 1-2 columns

## 📝 사용자 피드백

### Beta 테스트 (2025-08-03)
- "재밌네" - 레이더 차트 디자인에 대한 긍정적 반응
- 스크린샷 스타일 구현 요청 → 완료

### 개선 사항
- 기록이 없는 사용자도 접근 가능하도록 개선
- 데모 모드에서 샘플 데이터 제공
- Beta 태그 추가로 개발 중임을 명시

## 🔧 문제 해결

### 알려진 이슈
- 모바일에서 레이더 차트 크기 조정 필요
- 대량 데이터 처리시 성능 최적화 필요

### 해결 방법
- 반응형 SVG viewBox 적용
- 데이터 페이지네이션 및 가상화 구현 예정

## 📚 참고 자료
- [SCA Cupping Standards](https://sca.coffee/research/protocols-best-practices)
- [D3.js Radar Chart Examples](https://d3js.org/)
- [Coffee Tasting Wheel](https://notbadcoffee.com/flavor-wheel-en/)