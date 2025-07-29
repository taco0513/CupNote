# Cafe Mode - 간편 커피 기록 모드

## 🎯 모드 개요

**목적**: 카페에서 간단하고 빠르게 커피 경험을 기록
**소요시간**: 3-5분
**대상 사용자**: 커피 초보자, 간편 기록을 원하는 사용자
**핵심 가치**: 빠름, 간편함, 직관성

## 📱 플로우 단계

### 1. Mode Selection
- 모드 선택 화면에서 "☕ Cafe Mode" 선택
- 간편함과 빠른 기록에 중점을 둔 UI 안내

### 2. Coffee Info (25% 진행률)
- **필수 정보**: 카페명, 커피명, 온도 (HOT/ICED)
- **선택 정보**: 원산지, 품종, 가공방식, 로스팅 레벨, 고도
- **특징**: 추출 관련 정보는 모두 스킵

### 3. Unified Flavor (50% 진행률)
- **카테고리별 향미 선택** (최대 5개)
  - 🍓 Fruity: 딸기, 블루베리, 레몬, 오렌지, 사과
  - 🥜 Nutty: 아몬드, 헤이즐넛, 땅콩, 호두
  - 🍫 Chocolate: 다크초콜릿, 밀크초콜릿, 카카오, 캐러멜
  - 🌺 Floral: 재스민, 장미, 라벤더, 허브
- **특징**: 직관적인 아이콘과 한국어 표현으로 쉬운 선택

### 4. Sensory Expression (70% 진행률)
- **6개 카테고리 한국어 표현**
  - 산미: 상큼한, 밝은, 과일향의...
  - 단맛: 달콤한, 부드러운, 캐러멜향의...
  - 쓴맛: 진한, 강한, 로스팅향의...
  - 바디: 묵직한, 가벼운, 부드러운...
  - 애프터: 깔끔한, 여운이 긴, 개운한...
  - 밸런스: 조화로운, 균형잡힌, 완성도 높은...
- **특징**: 탭 전환으로 카테고리 이동, 다중 선택 가능

### 5. Personal Comment (85% 진행률)
- **퀵 태그 선택**
  - ☀️ 아침에 마시기 좋아요
  - 🍯 달달해서 좋아요
  - ✨ 산미가 매력적이에요
  - 💪 진하고 묵직해요
  - 😌 부드럽고 편안해요
  - 💕 또 마시고 싶어요
- **자유 텍스트**: 200자 제한으로 간단한 메모

### 6. Roaster Notes (95% 진행률)
- **카페/로스터 공식 테이스팅 노트** 입력
- **Match Score 계산**을 위한 참조 데이터
- 건너뛰기 가능

### 7. Result (100% 진행률)
- **테이스팅 결과 카드** 표시
- **성취 시스템** 체크 및 팝업
- **공유 기능** 및 새로운 기록 시작

## 💾 데이터 구조

```typescript
interface CafeModeData {
  mode: 'cafe'
  coffee_info: {
    cafe_name: string
    coffee_name: string
    temperature: 'hot' | 'iced'
    origin?: string
    variety?: string
    process?: string
    roast_level?: string
    altitude?: number
  }
  flavor_data: {
    selected_flavors: string[] // 최대 5개
  }
  sensory_expression: {
    acidity?: string[]
    sweetness?: string[]
    bitterness?: string[]
    body?: string[]
    aftertaste?: string[]
    balance?: string[]
  }
  personal_comment: {
    quick_tags?: string[]
    free_text?: string // 200자 제한
  }
  roaster_notes?: string
}
```

## 🎨 UI/UX 특징

### 설계 원칙
- **최소 입력**: 필수 정보만 요구, 선택사항 최소화
- **직관적 선택**: 아이콘과 색상으로 빠른 인식
- **건너뛰기 가능**: 모든 선택적 단계에서 스킵 허용
- **즉시 피드백**: 선택 즉시 시각적 확인

### 진행률 표시
- 총 7단계 중 현재 위치 표시
- 각 단계별 명확한 퍼센티지 제공
- 뒤로가기로 이전 단계 수정 가능

### 접근성
- 44px 이상 터치 타겟
- 명확한 색상 대비
- 한국어 중심 UI

## 📊 성과 지표

### 목표 메트릭
- **완료율**: 90% 이상 (시작한 사용자의 완료 비율)
- **완료 시간**: 평균 3-5분
- **재사용률**: 주간 2회 이상 사용
- **만족도**: 사용 후 긍정적 피드백 80% 이상

### 주요 이탈 지점
1. Coffee Info → Unified Flavor (복잡함 인식)
2. Sensory Expression (선택지 과다)
3. Personal Comment (추가 입력 부담)

## 🔧 기술 구현

### 라우팅
```javascript
// Cafe Mode 전용 플로우
const cafeFlow = [
  '/mode-selection',
  '/coffee-info',
  '/unified-flavor',
  '/sensory-expression', 
  '/personal-comment',
  '/roaster-notes',
  '/result'
]
```

### 상태 관리
- **coffeeRecordStore**: 전체 데이터 관리
- **모드별 필터링**: 불필요한 단계 자동 스킵
- **진행률 계산**: 7단계 기준 퍼센티지

### 성능 최적화
- **즉시 로딩**: PWA 캐싱으로 오프라인 지원
- **부드러운 전환**: 페이지 간 애니메이션
- **배터리 효율**: 최소한의 백그라운드 처리

## 🎯 개선 방향

### 단기 개선
- [ ] 자주 선택하는 향미 우선 표시
- [ ] 개인 맞춤 퀵 태그 추천
- [ ] 입력 중 임시 저장 기능

### 중장기 개선
- [ ] AI 기반 향미 추천
- [ ] 음성 입력 지원
- [ ] 카메라로 커피 정보 자동 인식
- [ ] 소셜 공유 기능 강화