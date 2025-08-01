# Pro Mode - 전문가급 커피 품질 평가 모드

## 🎯 모드 개요

**목적**: SCA(Specialty Coffee Association) 표준에 따른 전문적 커피 품질 평가 및 QC 데이터 수집
**소요시간**: 15-20분
**대상 사용자**: 커피 전문가, 바리스타, 로스터, 품질 관리자
**핵심 가치**: 정확성, 표준 준수, 데이터 신뢰성, 전문성

## 📱 플로우 단계 (✅ 구현 완료 - 2025-12-01)

**라우팅**: `/record/pro` (단일 페이지, 8단계 진행)

### Step 1: 기본 정보 (12.5% 진행률)
- **원두명**: 평가할 커피 이름 (필수)
- **로스터리**: 로스팅 업체명 (필수)
- **로스팅 날짜**: 로스팅 일자
- **평가 날짜**: 오늘 날짜 (자동)

### Step 2: 원두 상세 정보 (25% 진행률)
- **원산지**: 국가/지역 (필수)
- **농장/스테이션**: 생산 농장명
- **품종**: 커피 품종 (필수)
- **가공방식**: Washed/Natural/Honey 등 (필수)
- **고도**: 재배 고도 (m)

### Step 3: 로스팅 프로파일 (37.5% 진행률)
- **로스팅 레벨**: Light/Medium/Dark (필수)
- **1차 크랙**: 시간 기록
- **개발 시간**: Development time
- **종료 온도**: 로스팅 종료 온도
- **프로파일 메모**: 추가 로스팅 정보

### Step 4: 추출 파라미터 (50% 진행률)

- **SCA 표준 추출 프로토콜**
  - 원두 대 물 비율: 1:15 ~ 1:17 (SCA 권장)
  - 추출 시간: 2:30 ~ 6:00 (방법별)
  - 물 온도: 90-96°C (SCA 표준)
- **고급 추출 변수**
  - 분쇄도 (Coarse/Medium/Fine/Extra Fine)
  - 블루밍 시간, 총 추출 시간
  - 물 유속 (g/s), 추출 온도 변화
- **물 품질 측정**
  - 물 경도 (TDS ppm)
  - pH 수치
- **장비 상세 정보**
  - 그라인더 모델, 필터 종류
  - 특별한 장비 설정 메모

### 5. QC Measurement (57% 진행률)

- **TDS 측정** (선택사항/필수)
  - TDS 수치 입력 (%)
  - 추출 수율 자동 계산
  - SCA 기준 (18-22%) 대비 평가
- **품질 지표**
  - 미추출 (<18%), 적정 (18-22%), 과추출 (>22%)
  - 색상 상태 표시 (빨강/초록/주황)
- **TDS 없을 시**: 해당 기능 비활성화

### 6. Flavor Selection - SCA Flavor Wheel (71% 진행률)

- **SCA 커피 향미 휠 기반**
- **1차 카테고리**: Fruity, Floral, Sweet, Nutty/Cocoa, Spices, Roasted, Green/Vegetative, Other
- **2차 상세 향미**: 각 카테고리 내 세부 향미 (영어/한국어 병기)
- **강도 표시**: 각 향미별 1-5 스케일 강도 설정
- **특징**: 국제 표준 준수하되 한국어 지원

### 7. Sensory Expression (한국어 표현) (78% 진행률)

- HomeCafe Mode와 동일한 한국어 감각 표현
- **추가 컨텍스트**: SCA 평가와 한국어 표현 연결

### 8. SCA Sensory Evaluation (86% 진행률)

- **모드별 속성 설정**
  - **Pro Mode**: SCA 표준 속성 매핑
    - Fragrance/Aroma → 향미
    - Flavor → 맛
    - Aftertaste → 여운
    - Acidity → 산미
    - Body → 바디
    - Balance → 균형
    - Overall → 종합
  - **기존 모드**: 기존 속성 유지
- **1-5 스케일 평가** (SCA 10점 만점을 5점으로 스케일링)
- **품질 등급 자동 산출**
  - <3.0: Commercial Grade
  - 3.0-3.5: Premium Grade
  - 3.5-4.0: Specialty Grade
  - > 4.0: Outstanding

### 9. Personal Comment (92% 진행률)

- **전문가 퀵 태그**
  - 🎯 큐그레이더 기준 통과
  - 📊 데이터 품질 우수
  - ⭐ 스페셜티 등급
  - 🔬 추가 분석 필요
  - 📈 개선 여지 있음
  - ✅ 상업적 품질 확인
- **전문 메모**: 500자 제한으로 상세 평가 기록

### 10. Roaster Notes (97% 진행률)

- **로스터 공식 노트**와 실제 평가 비교
- **편차 분석**: 기대값과 실제값 비교

### 11. Pro QC Report (100% 진행률)

- **종합 QC 리포트**
  - SCA 점수 요약
  - TDS/추출수율 데이터
  - 품질 등급 및 개선 제안
- **데이터 내보내기**
  - PDF 리포트 생성
  - CSV 데이터 추출
- **전문가 인증**: 평가자 서명/스탬프 기능

## 💾 데이터 구조

```typescript
interface ProModeData {
  mode: 'pro'
  coffee_info: {
    // 기본 정보
    cafe_name: string
    coffee_name: string
    temperature: 'hot' | 'iced'

    // 확장 원산지 정보
    farm_name?: string
    region: string
    altitude: number
    variety: string
    process: string
    roast_date?: string
    roaster_info?: string
  }

  homecafe_data: {
    // HomeCafe Mode와 동일
    dripper: string
    recipe: {
      coffee_amount: number
      water_amount: number
      ratio: number
      water_temp: number
      brew_time: number
      lap_times?: number[]
    }
  }

  pro_brewing_data: {
    // SCA 표준 프로토콜
    extraction_method: 'pourover' | 'immersion' | 'pressure' | 'cold_brew'
    grind_size: number // 1-10 스케일
    bloom_time: number // 초
    total_time: string // "2:30" 형식
    flow_rate?: number // g/s
    temp_drop?: number // °C

    // 물 품질
    water_tds: number // ppm
    water_ph: number

    // 장비 정보
    equipment_notes?: string
  }

  qc_measurement: {
    tds_value?: number // %
    extraction_yield?: number // %
    yield_status: 'under' | 'optimal' | 'over'
  }

  sca_flavor_data: {
    flavor_wheel: {
      category: string
      flavor: string
      intensity: number // 1-5
    }[]
  }

  sensory_expression: {
    // 기존 한국어 표현 유지
    acidity?: string[]
    sweetness?: string[]
    bitterness?: string[]
    body?: string[]
    aftertaste?: string[]
    balance?: string[]
  }

  sca_sensory_evaluation: {
    // SCA 표준 평가 (Pro Mode에서 매핑 변경)
    fragrance_aroma: number // 1-5
    flavor: number
    aftertaste: number
    acidity: number
    body: number
    balance: number
    overall: number

    // 계산된 값
    total_score: number
    quality_grade: 'commercial' | 'premium' | 'specialty' | 'outstanding'
  }

  personal_comment: {
    expert_tags?: string[]
    professional_notes?: string // 500자 제한
  }

  roaster_notes?: string

  qc_report: {
    generated_at: string
    evaluator?: string
    summary: string
    recommendations?: string[]
  }
}
```

## 🎨 UI/UX 특징

### 설계 원칙

- **전문성 우선**: 정확한 수치와 표준 준수
- **SCA 호환**: 국제 표준과 호환되는 UI
- **데이터 무결성**: 입력 검증 및 품질 보장
- **효율성**: 전문가 워크플로우 최적화

### Pro Mode 전용 UI

- **정밀 입력**: 소수점 단위 정확한 수치 입력
- **실시간 계산**: TDS ↔ 추출수율 자동 계산
- **상태 표시**: SCA 기준 대비 시각적 상태 표시
- **프로페셔널 리포트**: 인쇄 가능한 QC 리포트

### SCA 표준 준수

- **색상 코딩**: SCA 권장 색상 시스템
- **용어 통일**: SCA 공식 용어 사용
- **스케일 매핑**: 10점 → 5점 스케일 변환 명시

## 📊 성과 지표

### 품질 지표

- **평가 정확도**: SCA 인증 평가자와의 일치율
- **데이터 완성도**: 필수 항목 입력 완료율
- **재현성**: 동일 샘플의 평가 일관성
- **전문가 만족도**: 커피 전문가 사용 만족도

### 사용성 지표

- **완료 시간**: 평균 8-12분 내 완료
- **TDS 활용률**: TDS 측정 기능 사용 빈도
- **리포트 생성**: QC 리포트 다운로드 빈도
- **전문가 채택률**: 업계 전문가의 지속 사용률

## 🔧 기술 구현

### 라우팅

```javascript
// Pro Mode 전용 플로우
const proFlow = [
  '/mode-selection',
  '/coffee-info', // + Origin Details
  '/home-cafe', // 기본 추출 설정
  '/pro-brewing', // SCA 표준 프로토콜
  '/qc-measurement', // TDS 및 품질 측정
  '/sca-flavor', // SCA Flavor Wheel
  '/sensory-expression', // 한국어 표현
  '/sca-evaluation', // SCA 관능 평가
  '/personal-comment', // 전문가 코멘트
  '/roaster-notes', // 로스터 노트
  '/pro-qc-report', // QC 리포트
]
```

### SCA 계산 로직

```javascript
// 추출 수율 계산
const extractionYield = computed(() => {
  if (!tdsValue.value) return 0
  return (tdsValue.value * waterAmount.value) / coffeeAmount.value
})

// SCA 품질 등급 판정
const qualityGrade = computed(() => {
  const score = totalScaScore.value
  if (score >= 4.0) return 'outstanding'
  if (score >= 3.5) return 'specialty'
  if (score >= 3.0) return 'premium'
  return 'commercial'
})
```

### 리포트 생성

- **PDF 출력**: HTML → PDF 변환
- **데이터 내보내기**: JSON → CSV 변환
- **템플릿 시스템**: 다양한 리포트 형식 지원

## 🎯 개선 방향

### 단기 개선

- [ ] SCA 공식 인증 획득
- [ ] 전문가 베타 테스트 및 피드백 반영
- [ ] 다국어 지원 (영어/한국어)

### 중장기 개선

- [ ] 큐그레이더 인증 연동
- [ ] 실험실 장비 API 연동 (TDS 미터)
- [ ] 블록체인 기반 품질 인증
- [ ] AI 기반 품질 예측 모델

## 🔄 다른 모드와의 차이점

| 구분            | Cafe Mode       | HomeCafe Mode   | Pro Mode         |
| --------------- | --------------- | --------------- | ---------------- |
| **평가 표준**   | 개인 취향       | 홈브루 경험     | SCA 국제 표준    |
| **TDS 측정**    | 없음            | 없음            | 선택적 필수      |
| **향미 평가**   | 한국어 카테고리 | 한국어 카테고리 | SCA Flavor Wheel |
| **관능 평가**   | 간단한 표현     | 간단한 표현     | SCA 7항목 평가   |
| **리포트**      | 간단 결과       | 레시피 + 결과   | 전문 QC 리포트   |
| **대상 사용자** | 일반인          | 홈브루어        | 커피 전문가      |
| **소요 시간**   | 3-5분           | 5-8분           | 8-12분           |

## 📋 구현 체크리스트

### Phase 1: 기본 구조

- [ ] Pro Mode 라우팅 구조 설계
- [ ] SCA 표준 데이터 구조 정의
- [ ] 기존 모드와 차별화된 UI 설계

### Phase 2: 핵심 기능

- [ ] Origin Details 확장 입력 폼
- [ ] Pro Brewing Protocol 화면
- [ ] QC Measurement (TDS/추출수율) 기능
- [ ] SCA Flavor Wheel 구현
- [ ] SCA Sensory Evaluation 시스템

### Phase 3: 고급 기능

- [ ] 모드별 속성 매핑 시스템
- [ ] QC 리포트 생성 엔진
- [ ] PDF/CSV 내보내기 기능
- [ ] 전문가 인증 시스템

### Phase 4: 검증 및 최적화

- [ ] SCA 표준 준수 검증
- [ ] 전문가 베타 테스트
- [ ] 성능 최적화
- [ ] 문서화 완료

## 🏆 목표

**단기 목표 (3개월)**

- SCA 표준에 완전 준수하는 평가 시스템 구축
- 커피 전문가 100명 베타 테스트 완료
- 주요 로스터리/카페 파트너십 3곳 확보

**중기 목표 (6개월)**

- 큐그레이더 커뮤니티 공식 도구 인정
- 국내 스페셜티 커피 업계 표준 도구 지위 확보
- 해외 시장 진출 기반 마련

**장기 목표 (1년)**

- SCA 공식 파트너십 체결
- 글로벌 커피 품질 평가 표준 도구 지위 확보
- 커피 산업 디지털 전환 선도
