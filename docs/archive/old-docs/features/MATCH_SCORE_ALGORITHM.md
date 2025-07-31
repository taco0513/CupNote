# Match Score 알고리즘 상세 문서

_최종 업데이트: 2025-01-30_

## 🎯 Match Score 개요

Match Score는 사용자의 커피 기록 완성도와 품질을 측정하는 점수 시스템입니다.

## 📊 점수 계산 로직

### **기본 점수 구성**

```typescript
const calculateMatchScore = (record: CoffeeRecord): number => {
  // 1. 기본 점수: 평점 기반 (0-100 스케일)
  let score = ((record.rating || 0) / 5) * 100

  // 2. 모드별 가중치
  if (record.mode === 'lab') {
    score += 10 // 전문 모드 보너스
  } else if (record.mode === 'homecafe') {
    score += 5 // 홈카페 정성 보너스
  }

  // 3. 완성도 보너스
  let completeness = 0
  if (record.roastery) completeness += 5
  if (record.origin) completeness += 5
  if (record.roastLevel) completeness += 5
  if (record.taste) completeness += 10
  if (record.memo) completeness += 5

  score += completeness

  // 100점 초과 방지
  return Math.min(Math.round(score), 100)
}
```

### **점수 구성 요소**

1. **기본 평점 (0-100점)**
   - 5점 만점 평점을 100점 스케일로 변환
   - 핵심 점수 요소

2. **모드 보너스**
   - Lab 모드: +10점 (전문성)
   - HomeCafe 모드: +5점 (정성)
   - Cafe 모드: +0점 (기본)

3. **완성도 보너스 (최대 30점)**
   - 로스터리 정보: +5점
   - 원산지 정보: +5점
   - 로스팅 레벨: +5점
   - 맛 표현: +10점
   - 개인 메모: +5점

## 🎨 등급 시스템

### **점수별 등급**

```typescript
const getScoreGrade = (score: number) => {
  if (score >= 90)
    return {
      grade: 'S',
      color: 'from-yellow-400 to-orange-500',
      text: 'text-yellow-600',
    }
  if (score >= 80)
    return {
      grade: 'A',
      color: 'from-green-400 to-green-600',
      text: 'text-green-600',
    }
  if (score >= 70)
    return {
      grade: 'B',
      color: 'from-blue-400 to-blue-600',
      text: 'text-blue-600',
    }
  if (score >= 60)
    return {
      grade: 'C',
      color: 'from-purple-400 to-purple-600',
      text: 'text-purple-600',
    }
  return {
    grade: 'D',
    color: 'from-gray-400 to-gray-600',
    text: 'text-gray-600',
  }
}
```

### **등급 의미**

- **S (90-100점)**: 완벽한 기록
- **A (80-89점)**: 훌륭한 기록
- **B (70-79점)**: 좋은 기록
- **C (60-69점)**: 보통 기록
- **D (0-59점)**: 기본 기록

## 💬 개인화 메시지

### **점수별 메시지**

```typescript
const getPersonalMessage = (score: number, mode: string) => {
  if (score >= 90) {
    return mode === 'lab' ? '완벽한 전문가 수준의 평가입니다!' : '정말 특별한 커피를 만나셨네요!'
  } else if (score >= 80) {
    return '훌륭한 커피 경험이었습니다 ✨'
  } else if (score >= 70) {
    return '좋은 커피 기록이 완성되었어요 👍'
  } else if (score >= 60) {
    return '새로운 발견이 있는 기록이네요 🔍'
  } else {
    return '모든 경험이 소중한 배움입니다 📚'
  }
}
```

## 🎯 시각화

### **원형 진행바**

- SVG 원형 차트 사용
- 애니메이션 효과 (2초)
- 그라데이션 색상
- 중앙 점수 및 등급 표시

### **애니메이션 시퀀스**

1. 페이지 로드 후 0.5초 대기
2. 0에서 실제 점수까지 2초간 애니메이션
3. 등급 표시는 1초 딜레이 후 페이드인

## 📈 점수 향상 가이드

### **점수 올리는 방법**

1. **평점 신중히 매기기**: 기본 점수의 핵심
2. **모든 정보 입력**: 완성도 보너스 최대화
3. **상세 모드 사용**: Lab/HomeCafe 모드 보너스
4. **맛 표현 상세히**: 가장 높은 보너스 (10점)

### **최대 점수 구성**

- 평점 5점: 100점
- Lab 모드: +10점
- 모든 정보 입력: +30점
- **이론적 최대**: 140점 → 100점으로 제한

## 🔮 향후 개선 계획

1. **동적 가중치**: 사용자별 맞춤 가중치
2. **시간 보너스**: 기록 직후 작성 시 추가 점수
3. **사진 보너스**: 사진 추가 시 점수 부여
4. **커뮤니티 비교**: 다른 사용자와 점수 비교
5. **AI 분석**: 맛 표현 품질 자동 평가
