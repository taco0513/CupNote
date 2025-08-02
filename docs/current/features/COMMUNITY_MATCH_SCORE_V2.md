# Community Match Score System v2.0

_최종 업데이트: 2025-08-02_

## 🎯 개요

TastingFlow v2.0에서 도입된 새로운 커뮤니티 기반 매치 점수 시스템입니다. 기존의 로스터 노트 의존 방식에서 벗어나 실제 사용자 데이터를 기반으로 한 커뮤니티 매칭을 제공합니다.

## 📊 점수 계산 로직

### **핵심 변경사항**

1. **등급 시스템 제거**: A+, A, B+, B, C 등급 표시 제거
2. **커뮤니티 기반 매칭**: 실제 사용자 데이터 기반 점수 계산
3. **Supabase 연동**: 실시간 커뮤니티 데이터 활용

### **점수 구성 요소**

```typescript
// 커뮤니티 기반 매치 점수 계산
const finalScore = Math.round(flavorScore * 0.7 + sensoryScore * 0.3)

// 향미 매칭 (70% 가중치)
const flavorScore = Math.min(100, (flavorMatches / flavorTotal) * 100 + 15)

// 감각표현 매칭 (30% 가중치)  
const sensoryScore = Math.min(100, (sensoryMatches / sensoryTotal) * 100 + 15)
```

### **매칭 기준**

- **향미 매칭**: 20% 이상의 사용자가 선택한 향미와 일치
- **감각 매칭**: 15% 이상의 사용자가 선택한 표현과 일치
- **기본 보너스**: 15점 (참여 독려)

## 💬 개인화 메시지 시스템

### **점수별 메시지**

```typescript
const generateCommunityMessage = (score: number, totalRecords: number) => {
  if (score >= 85) return `🎯 ${totalRecords}명의 다른 사용자들과 완벽한 공감!`
  if (score >= 75) return `⭐ 커뮤니티와 높은 일치도! 인기 특성들을 잘 포착하셨네요!`
  if (score >= 65) return `👥 커뮤니티와 어느 정도 공감해요.`
  if (score >= 50) return `🎨 독특한 관점! 남들과는 다른 특별한 매력을 발견하셨어요!`
  return `🌟 완전히 새로운 발견! 당신만의 독창적인 커피 경험이네요!`
}
```

## 🔄 시스템 아키텍처

### **데이터 플로우**

1. **사용자 선택** → 향미/감각표현 선택
2. **커뮤니티 데이터 조회** → Supabase RPC 호출
3. **매칭 분석** → 인기도 기반 점수 계산
4. **결과 표시** → 등급 없는 점수와 메시지 표시

### **Fallback 전략**

```typescript
try {
  // 새로운 커뮤니티 매치 시스템
  const communityScore = await calculateCommunityMatchScoreWithData(...)
} catch (error) {
  // 실패 시 레거시 시스템 사용
  const fallbackScore = calculateCommunityMatchScore(...)
}
```

## 🚀 주요 개선사항

### **v1.0에서 v2.0으로**

- **❌ 제거**: A+, A, B+, B, C 등급 시스템
- **✅ 추가**: 실시간 커뮤니티 데이터 기반 매칭
- **✅ 개선**: 더 정확한 매칭 알고리즘
- **✅ 향상**: 개인화된 메시지 시스템

### **UI/UX 변경사항**

```typescript
// Before (v1.0)
<div className="grade-display">
  <span className="text-2xl font-bold">{scoreInfo.grade}</span>
</div>

// After (v2.0)  
<div className="score-display">
  <span className="text-sm font-medium text-gray-600">점수</span>
</div>
```

## 📈 데이터 저장

### **커뮤니티 데이터 수집**

```typescript
// 향미 데이터 저장
const flavorData = userFlavors.map(flavor => ({
  coffee_record_id: recordId,
  flavor_name: flavor,
  level2_category: classifyFlavorCategory(flavor),
  level3_subcategory: flavor
}))

// 감각표현 데이터 저장
const sensoryData = userExpressions.map(expression => ({
  coffee_record_id: recordId,
  expression_name: expression,
  category: classifySensoryCategory(expression)
}))
```

## 🔮 향후 계획

1. **머신러닝 도입**: AI 기반 매칭 정확도 향상
2. **개인화 강화**: 사용자별 맞춤 가중치
3. **실시간 분석**: 트렌드 분석 및 인사이트 제공
4. **크로스 플랫폼**: 웹/모바일 동기화

## 📝 마이그레이션 노트

### **기존 사용자 영향**

- **UI 변경**: 등급 표시 → 점수 표시
- **메시지 변경**: 로스터 기반 → 커뮤니티 기반
- **데이터 호환**: 기존 기록 유지

### **개발자 가이드**

```typescript
// 새로운 API 사용법
import { getDefaultMatchScoreAsync } from '@/lib/match-score'

const matchScore = await getDefaultMatchScoreAsync(
  userFlavors,
  userExpressions, 
  coffeeName,
  roastery
)
```

## 🏷️ 변경 이력

- **2025-08-02**: 등급 시스템 완전 제거
- **2025-08-01**: 커뮤니티 기반 시스템 도입
- **2025-01-31**: TastingFlow v2.0 시스템 설계