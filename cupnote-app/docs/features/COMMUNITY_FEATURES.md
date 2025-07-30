# 🤝 CupNote 커뮤니티 기능 설계

## 📋 개요

CupNote의 커뮤니티 기능은 **"함께 성장"**이라는 브랜드 철학을 구현합니다. 혼자가 아닌 다른 사람들과 경험을 나누며 감각을 키워가는 공간을 제공합니다.

**핵심 가치**: 경쟁이 아닌 **공감과 학습**

---

## 🎯 설계 원칙

### 1. 가벼운 연결 (Light Connection)

- 복잡한 소셜 기능보다 간단한 비교와 공감
- 익명성 보장으로 부담 없는 참여
- 선택적 참여 (원하지 않으면 개인 모드)

### 2. 학습 중심 (Learning Focus)

- 다른 사람의 감각을 통한 학습
- 다양성 인정과 격려
- 정답 찾기가 아닌 차이 발견

### 3. 건전한 문화 (Healthy Culture)

- 비교가 아닌 공유
- 비판이 아닌 호기심
- 배타적이지 않은 포용적 환경

---

## 🚀 MVP 기능

### 1. "다른 사람들은?" 비교 기능

#### 기능 설명

같은 커피를 마신 다른 사용자들의 선택과 비교하여 표시

#### UI 위치

ResultView 하단에 별도 섹션 추가

#### 표시 내용

```
📊 다른 사람들의 선택

이 커피를 마신 12명의 기록:
• 향미 TOP 3: 딸기(8명), 초콜릿(6명), 꿀(4명)
• 감각 표현: 상큼한(7명), 달콤한(5명), 부드러운(3명)
• 평균 매치 스코어: 76점

💬 "당신처럼 '사과'를 느낀 사람이 2명 더 있어요!"
```

#### 데이터 구조

```typescript
interface CoffeeStats {
  coffeeId: string
  totalTastings: number
  flavorStats: {
    [flavorId: string]: {
      count: number
      percentage: number
    }
  }
  sensoryStats: {
    [category: string]: {
      [expression: string]: {
        count: number
        percentage: number
      }
    }
  }
  avgMatchScore: number
  scoreDistribution: {
    '90-100': number
    '80-89': number
    '70-79': number
    '60-69': number
    '50-59': number
  }
}
```

#### 개인정보 보호

- 완전 익명 집계 데이터만 표시
- 개별 사용자 식별 불가
- 최소 5명 이상 데이터가 있을 때만 표시

---

## 🔄 Phase 2 기능

### 2. 커피별 공개 노트 기능

#### 기능 설명

같은 커피에 대한 다른 사용자들의 개인 메모 공유

#### UI 구성

```
💭 이 커피에 대한 다른 의견들

😊 커피러버_김: "어릴 때 먹던 새콤달콤 사탕 같아요"
   👍 3  💬 답글

🌟 향미탐험가: "생각보다 산미가 강하지 않아서 좋았어요"
   👍 7  💬 답글

☕ 홈카페지기: "V60로 내렸는데 꽃향이 잘 나왔어요"
   👍 2  💬 답글

[더 보기] [내 의견 추가하기]
```

#### 참여 방식

- 닉네임만 표시 (실명 불필요)
- 좋아요/공감 기능
- 간단한 답글 기능
- 부적절한 내용 신고 기능

#### 콘텐츠 관리

- 자동 욕설 필터링
- 커뮤니티 가이드라인
- 사용자 신고 시스템
- 운영진 검토

### 3. 주간 커피 챌린지

#### 기능 설명

매주 하나의 커피를 선정하여 함께 테이스팅하고 비교

#### 운영 방식

```
이번 주 챌린지 커피 🏆
에티오피아 예가체프 G1 (블루보틀)

참여자: 47명
• 지금까지 향미 선택 통계 실시간 업데이트
• 참여자들의 익명 코멘트
• 주말에 결과 발표 및 인사이트 공유
```

#### 참여 혜택

- 챌린지 참여 배지
- 주간 베스트 코멘트 선정
- 커뮤니티 내 특별 프로필 뱃지

---

## 🎨 UI/UX 가이드라인

### 1. 시각적 디자인

- 따뜻하고 친근한 색상 팔레트
- 경쟁보다는 협력을 암시하는 아이콘
- 데이터 시각화는 파이차트/막대그래프 활용

### 2. 인터랙션 패턴

- 선택적 참여 (토글 ON/OFF)
- 비침해적 알림 (푸시는 최소화)
- 쉬운 탈퇴/비공개 전환

### 3. 접근성

- 다양한 언어 수준 고려
- 커피 초보자도 부담없이 참여
- 전문 용어 사용 시 쉬운 설명 제공

---

## 📊 데이터베이스 설계

### 커뮤니티 관련 테이블

```sql
-- 커피별 집계 통계
CREATE TABLE coffee_community_stats (
  coffee_id VARCHAR(255) PRIMARY KEY,
  total_tastings INTEGER DEFAULT 0,
  flavor_stats JSONB,
  sensory_stats JSONB,
  avg_match_score DECIMAL(5,2),
  score_distribution JSONB,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 공개 노트 (Phase 2)
CREATE TABLE public_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coffee_id VARCHAR(255) NOT NULL,
  user_nickname VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  is_hidden BOOLEAN DEFAULT FALSE
);

-- 주간 챌린지 (Phase 2)
CREATE TABLE weekly_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  coffee_id VARCHAR(255) NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  participants_count INTEGER DEFAULT 0,
  status ENUM('active', 'ended') DEFAULT 'active'
);
```

---

## 🔐 개인정보 보호

### 1. 데이터 익명화

- 개인 식별 정보 완전 분리
- 집계 데이터만 공개
- 최소 데이터 수집 원칙

### 2. 사용자 제어

- 커뮤니티 참여 ON/OFF 선택
- 언제든 데이터 삭제 가능
- 개인 정보 이용 내역 투명 공개

### 3. 보안 조치

- 데이터 암호화 저장
- 접근 로그 모니터링
- 정기적 보안 감사

---

## 📈 성공 지표

### 정량적 지표

- 커뮤니티 기능 사용률: >30%
- "다른 사람들은?" 조회율: >50%
- 공개 노트 참여율: >15% (Phase 2)
- 주간 챌린지 참여율: >20% (Phase 2)

### 정성적 지표

- 사용자 만족도 (커뮤니티 관련)
- 건전한 상호작용 비율
- 학습 효과 증대 체감도
- 재방문율 증가

---

## 🚨 위험 요소 및 대응

### 1. 독성 커뮤니티 형성

**위험**: 비교 문화, 전문가 행세, 초보자 배제
**대응**: 강력한 커뮤니티 가이드라인, 신속한 조치, 긍정적 문화 조성

### 2. 개인정보 유출

**위험**: 사용자 데이터 노출, 프라이버시 침해
**대응**: 완전 익명화, 최소 데이터 수집, 보안 강화

### 3. 콘텐츠 품질 저하

**위험**: 스팸, 광고, 의미없는 콘텐츠
**대응**: 자동 필터링, 사용자 신고, 품질 관리

---

## 🎬 구현 로드맵

### MVP (Phase 1)

- [x] "다른 사람들은?" 기능 설계
- [ ] 익명 집계 시스템 구현
- [ ] ResultView 통합
- [ ] 기본 데이터 수집

### Phase 2

- [ ] 공개 노트 시스템
- [ ] 닉네임 관리
- [ ] 좋아요/답글 기능
- [ ] 콘텐츠 관리 도구

### Phase 3

- [ ] 주간 챌린지
- [ ] 고급 통계 분석
- [ ] 맞춤형 추천
- [ ] 오프라인 연계

---

**핵심 메시지**: "혼자가 아니에요. 함께 성장해요." ☕️🤝
