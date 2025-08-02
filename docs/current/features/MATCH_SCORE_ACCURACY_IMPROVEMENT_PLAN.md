# Match Score 정확도 개선 계획서

_작성일: 2025-08-02_  
_문서타입: 기술 기획서_  
_상태: ✅ 1단계 구현 진행 중_  

## 📊 개요

CupNote의 Match Score 알고리즘 정확도를 단계적으로 개선하여 사용자 만족도와 매칭 신뢰성을 향상시키는 계획입니다.

## 🎯 현재 시스템 분석

### **기존 알고리즘의 한계점**

1. **단순한 키워드 매칭**: 문자열 포함 여부만 확인 (`includes()` 기반)
2. **가중치 고정**: 모든 사용자에게 동일한 70:30 비율 적용
3. **매칭 테이블 한계**: 제한적인 동의어/유사어 커버리지
4. **맥락 무시**: 로스터 노트의 문맥적 의미 미반영 ("subtle citrus" vs "bright citrus")
5. **개인화 부족**: 사용자별 선호도나 숙련도 미고려
6. **학습 불가**: 사용자 피드백 기반 개선 시스템 없음

### **현재 정확도 추정**

- **향미 매칭**: ~65% 정확도 (키워드 기반)  
- **감각 매칭**: ~70% 정확도 (상대적으로 단순)  
- **전체 만족도**: ~67% (추정치)

---

## 🚀 6단계 개선 로드맵

### **✅ 1단계: 고급 텍스트 매칭** (진행 중)
**난이도**: ⭐ 쉬움 | **소요시간**: 2-3시간 | **정확도 향상**: +15-20%

#### 구현 내용
- **퍼지 매칭 알고리즘**: Levenshtein distance 기반 유사 단어 탐지
- **확장된 동의어 테이블**: 기존 대비 2-3배 확장
- **유사도 점수 시스템**: 0-1 범위의 매칭 신뢰도
- **매칭 신뢰도 표시**: 사용자에게 매칭 품질 투명성 제공

#### 기술적 구현
```typescript
interface MatchResult {
  keyword: string
  similarity: number      // 0-1 유사도 점수
  confidence: number      // 매칭 신뢰도
  context: string[]       // 주변 단어들
}

const findSimilarKeywords = (
  note: string, 
  targetKeyword: string
): MatchResult[] => {
  // Levenshtein distance + 음성학적 유사성
  return fuzzyMatch(note, targetKeyword, {
    threshold: 0.7,
    maxDistance: 2,
    phonetic: true
  })
}
```

#### 예상 개선 효과
- "citrus" ↔ "시트러스", "오렌지향" 매칭 개선
- "chocolate" ↔ "초콜릿맛", "코코아향" 정확도 향상
- 오타 및 표기 변형 대응 강화

---

### **📋 2단계: 동적 가중치 시스템** (백로그)
**난이도**: ⭐⭐ 보통 | **소요시간**: 4-6시간 | **정확도 향상**: +20-25%

#### 구현 계획
```typescript
interface UserProfile {
  tastingExperience: 'beginner' | 'intermediate' | 'expert'
  flavorSensitivity: number     // 0-1 개인별 향미 민감도
  preferredCategories: string[] // 자주 선택하는 카테고리
  matchingHistory: AccuracyLog[] // 과거 매칭 정확도 기록
}

const calculateDynamicWeights = (
  profile: UserProfile, 
  coffeeType: string
) => {
  // 초보자: 감각표현 비중 ↑ (향미 60% + 감각 40%)
  // 전문가: 향미 비중 ↑ (향미 80% + 감각 20%)  
  // 라이트 로스트: 향미 비중 ↑
  // 다크 로스트: 감각표현 비중 ↑
}
```

---

### **📋 3단계: 확장된 매칭 테이블 + 시맨틱 매칭** (백로그)
**난이도**: ⭐⭐⭐ 어려움 | **소요시간**: 1-2일 | **정확도 향상**: +25-35%

#### 구현 계획
```typescript
interface FlavorProfile {
  primary: string[]      // 직접 매칭 (1.0 점수)
  related: string[]      // 관련 향미 (0.8 점수)
  opposite: string[]     // 상반된 향미 (-0.5 점수)
  intensity: number      // 향미 강도 맞춤 (1-5)
  categories: string[]   // 다중 카테고리 매칭
}

// Word2Vec, BERT 등 활용한 의미적 유사성
const calculateSemanticSimilarity = async (
  userInput: string, 
  roasterNote: string
) => {
  // "오렌지" ↔ "citrusy bright" = 0.85 유사도
  // "다크초콜릿" ↔ "rich cocoa notes" = 0.92 유사도
}
```

---

### **📋 4단계: 컨텍스트 어웨어 매칭** (백로그)
**난이도**: ⭐⭐⭐⭐ 매우 어려움 | **소요시간**: 3-5일 | **정확도 향상**: +30-40%

#### 구현 계획
- **NLP 파싱**: 로스터 노트의 문맥적 의미 분석
- **강도 인식**: "subtle citrus" vs "bright citrusy"
- **시간적 매칭**: "chocolate finish" vs "initial chocolate"
- **조합 인식**: "caramel and vanilla" vs "caramel or vanilla"

---

### **📋 5단계: 머신러닝 기반 개인화** (백로그)
**난이도**: ⭐⭐⭐⭐⭐ 전문가 | **소요시간**: 1-2주 | **정확도 향상**: +40-50%

#### 구현 계획
- **개인화 모델**: 사용자별 향미 선호도 학습
- **정확도 기록**: 과거 매칭 정확도 추적
- **보정 계수**: 개인별 매칭 패턴 보정
- **협업 필터링**: 유사한 취향 사용자 패턴 활용

---

### **📋 6단계: 실시간 학습 & 피드백 루프** (백로그)
**난이도**: ⭐⭐⭐⭐⭐⭐ 연구급 | **소요시간**: 1개월+ | **정확도 향상**: +50-60%

#### 구현 계획
- **피드백 시스템**: 사용자 매칭 만족도 수집
- **A/B 테스트**: 알고리즘 성능 실시간 비교
- **모델 재학습**: 피드백 기반 자동 모델 업데이트
- **지속적 개선**: 커뮤니티 + 개인 데이터 균형 최적화

---

## 📊 단계별 구현 우선순위

| 단계 | 상태 | 난이도 | 시간 | 정확도 향상 | ROI | 구현 계획 |
|------|------|--------|------|-------------|-----|-----------|
| **1단계** | 🔄 **진행 중** | ⭐ | 2-3h | +15-20% | ⭐⭐⭐⭐⭐ | 즉시 구현 |
| **2단계** | 📋 백로그 | ⭐⭐ | 4-6h | +20-25% | ⭐⭐⭐⭐ | v2.1 계획 |
| **3단계** | 📋 백로그 | ⭐⭐⭐ | 1-2d | +25-35% | ⭐⭐⭐ | v2.2 계획 |
| **4단계** | 📋 백로그 | ⭐⭐⭐⭐ | 3-5d | +30-40% | ⭐⭐ | v3.0 계획 |
| **5단계** | 📋 백로그 | ⭐⭐⭐⭐⭐ | 1-2w | +40-50% | ⭐ | 연구 프로젝트 |
| **6단계** | 📋 백로그 | ⭐⭐⭐⭐⭐⭐ | 1m+ | +50-60% | ⭐ | 장기 로드맵 |

---

## 🎯 1단계 상세 구현 계획

### **구현 대상 파일**
- `/src/lib/match-score.ts` - 핵심 매칭 알고리즘
- `/src/lib/fuzzy-matching.ts` - 새로운 퍼지 매칭 유틸리티
- `/src/lib/enhanced-dictionaries.ts` - 확장된 매칭 테이블

### **구현 세부사항**

#### 1. **퍼지 매칭 알고리즘**
```typescript
// Levenshtein distance 계산
const calculateDistance = (str1: string, str2: string): number => {
  // 편집 거리 계산 알고리즘
}

// 음성학적 유사성 (한글 특화)
const calculatePhoneticSimilarity = (korean1: string, korean2: string): number => {
  // 한글 자모 분해 기반 유사성
}

// 종합 유사도 점수
const calculateOverallSimilarity = (
  textSimilarity: number,
  phoneticSimilarity: number,
  contextBonus: number
): number => {
  return (textSimilarity * 0.6 + phoneticSimilarity * 0.3 + contextBonus * 0.1)
}
```

#### 2. **확장된 매칭 테이블**
```typescript
export const ENHANCED_FLAVOR_MATCHING = {
  // 기존 대비 3배 확장
  citrus: {
    primary: ['시트러스', '오렌지', '레몬', '라임', '자몽'],
    related: ['상큼한', '오렌지향', '시트러스향', '귤', '레몬향'],
    variations: ['citrusy', 'orange', 'lemon', 'lime'],
    intensity: ['subtle citrus', 'bright citrus', 'strong citrus'],
    confidence: 0.95
  },
  // ... 다른 향미들도 동일하게 확장
}
```

#### 3. **매칭 신뢰도 시스템**
```typescript
interface EnhancedMatchResult {
  keyword: string
  userSelection: string
  similarity: number      // 0-1 유사도
  confidence: number      // 매칭 신뢰도
  matchType: 'exact' | 'fuzzy' | 'semantic' | 'contextual'
  explanation: string     // 왜 매칭되었는지 설명
}
```

### **성공 지표 (KPI)**
- **매칭 정확도**: 현재 67% → 목표 82%+ 
- **사용자 만족도**: 매칭 결과에 대한 긍정 피드백 증가
- **매칭 신뢰도**: 높은 confidence 점수 비율 증가
- **커버리지**: 매칭되지 않는 사용자 입력 감소

---

## 📈 예상 효과 및 성과 측정

### **정량적 지표**
- **정확도 개선**: 단계별 15-60% 누적 향상
- **응답 시간**: 1단계는 성능 영향 최소 (<10ms 추가)
- **매칭 성공률**: 현재 ~70% → 1단계 후 ~85%

### **정성적 지표**  
- **사용자 신뢰도**: 매칭 결과에 대한 확신 증가
- **학습 효과**: 사용자의 커피 감각 발달 도움
- **재사용성**: 매칭 품질 향상으로 지속 사용 증가

---

## 🔧 기술적 고려사항

### **성능 최적화**
- **1단계**: 사전 계산 + 캐싱으로 성능 영향 최소화
- **2-3단계**: 서버사이드 연산 + 결과 캐싱
- **4-6단계**: 백그라운드 처리 + 비동기 업데이트

### **확장성 고려**
- 모듈화된 구조로 단계별 독립 배포 가능
- A/B 테스트를 위한 알고리즘 전환 시스템
- 다국어 지원을 위한 언어별 매칭 테이블

### **데이터 수집 계획**
- 사용자 피드백 수집 시스템 구축
- 매칭 정확도 로깅 및 분석
- 커뮤니티 데이터 품질 관리

---

## 📅 구현 타임라인

### **2025-08-02 ~ 2025-08-05** (1단계)
- [x] 기획서 작성 및 문서화
- [ ] 퍼지 매칭 알고리즘 구현
- [ ] 확장된 매칭 테이블 작성
- [ ] 기존 시스템 통합 및 테스트
- [ ] 성능 최적화 및 배포

### **2025-08-06 이후** (백로그)
- 2단계: 사용자 프로필 시스템 구축 (v2.1)
- 3단계: 시맨틱 매칭 연구 및 구현 (v2.2)
- 4-6단계: 장기 로드맵으로 관리

---

## 🎯 결론

**1단계 고급 텍스트 매칭**을 우선 구현하여 즉시 체감 가능한 개선 효과를 제공하고, 나머지 단계들은 백로그에서 체계적으로 관리하여 장기적인 정확도 개선을 달성합니다.

**핵심 성공요소**:
- ✅ 단계적 접근으로 안정성 확보
- ✅ 사용자 피드백 기반 검증  
- ✅ 기술적 부채 최소화
- ✅ 지속가능한 개선 프로세스

---

**문서 상태**: ✅ 완료  
**다음 액션**: 1단계 퍼지 매칭 알고리즘 구현 시작  
**담당자**: 개발팀  
**검토 주기**: 단계별 완료 시점