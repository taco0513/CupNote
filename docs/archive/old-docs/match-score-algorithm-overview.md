# CupNote Match Score 알고리즘 Overview

## 📊 3단계 레벨 시스템

CupNote의 Match Score는 사용자의 수준과 필요에 따라 3가지 레벨로 제공됩니다.

## 🎯 Level 1 - 향미 전용 (Flavor Only)

**파일**: `match-score-algorithm-level1.md`

### 특징

- **가장 심플**: 향미만 평가
- **초보자 친화적**: "딸기맛이 나요" 수준
- **빠른 평가**: 3-7개 향미 선택만으로 완료
- **직관적 피드백**: 맞춘/놓친 향미 명확히 표시

### 계산 방식

```
Match Score = (맞춘 향미 수 ÷ 전체 향미 수) × 100
```

### 적합한 경우

- MVP 테스트
- 커피 입문자
- 카페에서 빠른 기록
- 게임화 요소 강조

## 📈 Level 2 - 향미 + 감각 (Flavor + Sensory)

**파일**: `match-score-algorithm-level2.md`

### 특징

- **균형잡힌 평가**: 향미와 감각 표현 모두 고려
- **유연한 비율**: 사용자 레벨별 조정 가능
- **전문성 향상**: 6가지 감각 카테고리 평가
- **한국어 특화**: 한국어 감각 표현 매핑

### 계산 방식

```
// 기본 (50:50)
Match Score = (향미 매칭 50%) + (감각 매칭 50%)

// 사용자 레벨별
초보자: 향미 70% + 감각 30%
중급자: 향미 60% + 감각 40%
고급자: 향미 50% + 감각 50%
```

### 적합한 경우

- 정식 출시 버전
- 어느 정도 경험 있는 사용자
- 학습 목적
- 데이터 수집 후 비율 조정

## 🏆 Level 3 - 향미 + 감각 + 전체 인상 (Full Version)

**파일**: `match-score-algorithm-level3.md`

### 특징

- **가장 정교함**: 3가지 요소 종합 평가
- **전문가 수준**: 감정 분석까지 포함
- **상세한 피드백**: 카테고리별 세부 분석
- **고급 기능**: NLP, 머신러닝 활용 가능

### 계산 방식

```
Match Score = (향미 40%) + (감각 40%) + (전체 인상 20%)
```

### 적합한 경우

- 전문가 모드
- 프리미엄 기능
- 상세한 분석 원하는 사용자
- 장기 사용자

## 🚀 단계적 구현 전략

### Phase 1: MVP (1-2주) - 동적 레벨 시스템

- **동적 레벨 구현**: 사용자 입력에 따라 Level 1 또는 2 자동 적용
- 감각 표현 스킵 가능
- 30개 주요 향미 지원
- 유연한 평가 시스템

### Phase 2: 정식 출시 (3-4주)

- **레벨 시스템 고도화**: 사용자 통계 기반 개인화
- 50개 향미로 확장
- 한국어 감각 표현 매핑 강화
- 사용 패턴 분석

### Phase 3: 프리미엄 (5-8주)

- **Level 3 옵션**: 전체 버전
- 사용자 선택 가능
- AI/ML 기능 추가
- 개인화 알고리즘

## 📊 레벨 선택 가이드

### MVP: 동적 레벨 시스템

```javascript
// 사용자 입력에 따른 자동 레벨 결정
function determineMatchScoreLevel(tastingData) {
  const { flavors, sensoryExpressions } = tastingData

  // 감각 표현이 없거나 스킵한 경우
  if (!sensoryExpressions || isEmptySensoryExpressions(sensoryExpressions)) {
    return 'level1' // 향미만 평가
  }

  // 감각 표현이 있는 경우
  return 'level2' // 향미 + 감각 평가
}
```

### 향후: 사용자 경험 기반 추천

```javascript
// 사용자 통계 기반 레벨 추천
function recommendMatchScoreLevel(userStats) {
  const { sensoryCompletionRate, totalTastings } = userStats

  if (sensoryCompletionRate < 30) {
    return 'level1' // 감각 표현 잘 안함
  } else if (sensoryCompletionRate > 70) {
    return 'level2' // 감각 표현 자주 함
  }

  return 'dynamic' // 선택적
}
```

## 🎮 사용자 경험 시나리오

### 신규 사용자

1. **Level 1로 시작**: 향미만 선택하는 간단한 방식
2. **즉각적 피드백**: 67% 맞췄어요! ⭐⭐⭐
3. **동기부여**: 다음엔 더 잘 맞출 수 있을 거예요!

### 성장하는 사용자

1. **Level 2 추천**: "감각 표현도 평가해보세요!"
2. **더 상세한 분석**: 향미 80%, 감각 60%
3. **학습 효과**: 놓친 부분에 대한 구체적 피드백

### 전문가 사용자

1. **Level 3 선택 가능**: 설정에서 활성화
2. **종합적 분석**: 3가지 요소 모두 평가
3. **전문가 인증**: 90% 이상 시 배지 획득

## 💡 핵심 차별화 포인트

1. **점진적 복잡도**: 사용자 성장에 맞춘 단계별 시스템
2. **선택의 자유**: 원하는 레벨 선택 가능
3. **한국어 최적화**: 모든 레벨에서 한국어 표현 지원
4. **데이터 기반**: 사용 패턴에 따른 레벨 추천

---

**문서 버전**: 1.0  
**작성일**: 2025-01-28  
**관련 문서**:

- `match-score-algorithm-level1.md`
- `match-score-algorithm-level2.md`
- `match-score-algorithm-level3.md`
