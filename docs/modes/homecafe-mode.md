# HomeCafe Mode - 홈브루잉 기록 모드

## 🎯 모드 개요

**목적**: 집에서 핸드드립으로 내린 커피의 추출 레시피와 맛 평가를 함께 기록
**소요시간**: 5-8분
**대상 사용자**: 홈브루어, 추출 실험을 즐기는 사용자
**핵심 가치**: 레시피 관리, 추출 데이터, 재현성

## 📱 플로우 단계

### 1. Mode Selection

- 모드 선택 화면에서 "🏠 HomeCafe Mode" 선택
- 추출 레시피와 맛 평가 통합 기록에 중점

### 2. Coffee Info (20% 진행률)

- **필수 정보**: 카페명, 커피명, 온도 (HOT/ICED)
- **선택 정보**: 원산지, 품종, 가공방식, 로스팅 레벨, 고도
- **특징**: 커피 기본 정보 상세 입력 가능

### 3. HomeCafe - 추출 설정 (43% 진행률)

- **드리퍼 선택** (6개 옵션)
  - V60, Chemex, Kalita Wave, Origami, Aeropress, French Press
- **원두량 조절** (다이얼 방식)
  - ± 버튼으로 1g 단위 조절
  - 기본값: 20g
- **추출 비율 프리셋**
  - 1:15 (진한 맛)
  - 1:16 (균형)
  - 1:17 (밝은 맛)
  - 1:18 (가벼운 맛)
- **물량 자동 계산**
  - 비율 변경 시 실시간 업데이트
- **물 온도 설정**
  - 슬라이더 또는 직접 입력 (85-100°C)
- **추출 타이머** (선택사항)
  - 시작/정지/랩 기능
  - 단계별 시간 기록
  - 총 추출 시간 자동 계산
- **개인 레시피 관리**
  - 자주 쓰는 설정 저장
  - 저장된 레시피 불러오기

### 4. Unified Flavor (60% 진행률)

- Cafe Mode와 동일한 향미 선택 시스템
- **추가 기능**: 추출 방법에 따른 향미 필터링 힌트

### 5. Sensory Expression (75% 진행률)

- Cafe Mode와 동일한 한국어 감각 표현
- **추가 컨텍스트**: 추출 파라미터와 맛의 연관성 힌트

### 6. Personal Comment (85% 진행률)

- **퀵 태그 (홈브루 특화)**
  - ☀️ 아침에 마시기 좋아요
  - 🍯 달달해서 좋아요
  - ✨ 산미가 매력적이에요
  - 💪 진하고 묵직해요
  - 😌 부드럽고 편안해요
  - 💕 또 마시고 싶어요
  - ⏱️ 추출이 잘 되었어요
  - 👍 레시피가 완벽해요
- **자유 텍스트**: 200자 제한으로 추출 관련 메모

### 7. Roaster Notes (95% 진행률)

- 원두 패키지의 공식 테이스팅 노트
- **Match Score**: 실제 경험과 공식 노트 비교

### 8. Result (100% 진행률)

- **테이스팅 결과 + 레시피 카드**
- **추출 파라미터 요약**
- **레시피 저장/공유 기능**
- **다음 실험 제안**

## 💾 데이터 구조

```typescript
interface HomeCafeModeData {
  mode: 'homecafe'
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
  homecafe_data: {
    dripper: string
    recipe: {
      coffee_amount: number // g
      water_amount: number // ml
      ratio: number // 1:15, 1:16 등
      water_temp: number // °C
      brew_time: number // 초
      lap_times?: number[] // [30, 60, 120] 등
    }
    quick_notes?: string
  }
  flavor_data: {
    selected_flavors: string[]
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
    free_text?: string
  }
  roaster_notes?: string
}
```

## 🎨 UI/UX 특징

### 설계 원칙

- **레시피 중심**: 추출 파라미터를 명확히 표시
- **실시간 계산**: 비율 변경 시 즉시 물량 업데이트
- **재현성**: 정확한 수치와 시간 기록
- **학습 지원**: 추출과 맛의 연관성 힌트 제공

### 추출 타이머 UX

- **시작**: 명확한 스타트 버튼
- **랩 기능**: 단계별 시간 기록 (30초, 1분, 2분 등)
- **일시정지**: 필요시 타이머 정지/재시작
- **완료**: 총 시간 자동 기록

### 레시피 관리

- **즐겨찾기**: 자주 쓰는 설정 별표 표시
- **빠른 로드**: 원터치로 저장된 레시피 적용
- **비교 기능**: 이전 추출과 현재 설정 비교

## 📊 성과 지표

### 목표 메트릭

- **레시피 재사용률**: 저장된 레시피의 재사용 빈도
- **타이머 사용률**: 추출 타이머 활용 비율
- **추출 개선**: 동일 원두의 점수 향상 추이
- **완료 시간**: 평균 5-8분 내 완료

### 학습 지표

- **파라미터 실험**: 다양한 추출 조건 시도 빈도
- **맛 연관성**: 추출 변수와 맛 평가의 일관성
- **레시피 진화**: 시간에 따른 개인 레시피 발전

## 🔧 기술 구현

### 라우팅

```javascript
// HomeCafe Mode 전용 플로우
const homecafeFlow = [
  '/mode-selection',
  '/coffee-info',
  '/home-cafe',
  '/unified-flavor',
  '/sensory-expression',
  '/personal-comment',
  '/roaster-notes',
  '/result',
]
```

### 실시간 계산

```javascript
// 물량 자동 계산
const waterAmount = computed(() => {
  return coffeeAmount.value * selectedRatio.value
})

// 타이머 관리
const startTimer = () => {
  timerInterval = setInterval(() => {
    currentTime.value += 1
  }, 1000)
}
```

### 로컬 저장

- **레시피 캐싱**: localStorage에 개인 레시피 저장
- **설정 기억**: 마지막 사용 드리퍼/비율 기억
- **타이머 복구**: 앱 재시작 시 진행 중인 타이머 복구

## 🎯 개선 방향

### 단기 개선

- [ ] 추출 단계별 물 양 가이드
- [ ] 이상적인 추출 시간 가이드라인
- [ ] 원두별 추천 추출 파라미터

### 중장기 개선

- [ ] 추출 곡선 그래프 (TDS 연동)
- [ ] 커뮤니티 레시피 공유
- [ ] AI 기반 추출 최적화 제안
- [ ] 스마트 저울/온도계 연동

## 🔄 Pro Mode와의 차이점

| 구분            | HomeCafe Mode | Pro Mode          |
| --------------- | ------------- | ----------------- |
| **대상**        | 홈브루어      | 커피 전문가       |
| **TDS 측정**    | 지원하지 않음 | 필수/선택         |
| **추출 데이터** | 기본 파라미터 | 고급 실험 데이터  |
| **평가 방식**   | 한국어 표현   | SCA 표준 + 한국어 |
| **QC 기능**     | 없음          | SCA QC 프로토콜   |
| **복잡도**      | 중간          | 높음              |

## 📋 체크리스트

### 필수 구현

- [x] 드리퍼 선택 UI
- [x] 원두량/물량 조절 시스템
- [x] 비율 프리셋 및 자동 계산
- [x] 추출 타이머 (시작/정지/랩)
- [x] 레시피 데이터 저장
- [ ] 개인 레시피 관리 시스템
- [ ] 추출 가이드 힌트

### 추가 기능

- [ ] 레시피 즐겨찾기
- [ ] 추출 이력 비교
- [ ] 원두별 추천 설정
- [ ] 커뮤니티 레시피 참고
