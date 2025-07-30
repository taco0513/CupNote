# ResultView.vue

## 📋 개요

**목적**: 테이스팅 결과를 시각화하고 매치 스코어를 표시하는 최종 결과 페이지  
**위치**: `/src/views/tasting-flow/ResultView.vue`  
**라우터**: `/result`, `/demo/result`  
**작성일**: 2025-07-30

테이스팅 플로우의 마지막 단계(7단계)로, 사용자의 테이스팅 결과를 종합적으로 분석하고 로스터의 의도와 비교하여 매치 스코어를 시각화하는 핵심 결과 페이지입니다.

---

## 🎯 주요 기능

### 1. **매치 스코어 시각화** ⭐ 핵심 기능
- **전체 매치 스코어**: 종합 점수를 원형 차트로 표시
- **세부 카테고리 점수**: 향미, 감각, 개인 평가별 점수
- **CSS 애니메이션 기반**: 고급스러운 CSS 애니메이션 시각화
- **실시간 애니메이션**: 점수 표시 애니메이션 효과

### 2. **테이스팅 결과 요약**
- **선택한 향미**: 사용자가 선택한 향미 태그들
- **감각 표현**: 선택한 감각 표현 키워드들
- **개인 코멘트**: 사용자의 개인적인 느낌과 평가
- **로스터 노트 비교**: 로스터 의도와의 일치도

### 3. **데모 모드 지원**
- 데모 경로에서 미리 설정된 결과 데이터 표시
- 실제 모드와 동일한 차트 및 UI 제공
- 데모 완료 후 가입 유도 CTA

### 4. **결과 저장 및 공유**
- **Supabase 저장**: 테이스팅 기록을 데이터베이스에 저장
- **공유 기능**: 결과를 이미지나 링크로 공유
- **히스토리 연동**: 개인 테이스팅 히스토리에 추가

---

## 🔧 기술 명세

### Props
```typescript
// Props 없음 - 스토어에서 데이터 가져옴
```

### Events
```typescript
// 내부 이벤트만 사용, 부모 컴포넌트로 emit 없음
```

### Composables & Stores
```typescript
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'
import { useDemoStore } from '../../stores/demo'
import { useNotificationStore } from '../../stores/notification'
import Chart from 'chart.js/auto'

// 라우터 및 상태 관리
const router = useRouter()
const route = useRoute()
const coffeeRecordStore = useCoffeeRecordStore()
const demoStore = useDemoStore()
const notificationStore = useNotificationStore()

// 차트 관련
const chartCanvas = ref(null)
const chartInstance = ref(null)
```

### 주요 메서드
```typescript
const calculateMatchScore = () => {
  const userSelections = coffeeRecordStore.currentRecord
  const roasterNotes = userSelections.roaster_notes
  
  // 향미 매치 스코어 계산
  const flavorScore = calculateFlavorMatch(
    userSelections.unified_flavor,
    roasterNotes.expected_flavors
  )
  
  // 감각 매치 스코어 계산  
  const sensoryScore = calculateSensoryMatch(
    userSelections.sensory_expression,
    roasterNotes.expected_sensory
  )
  
  // 전체 매치 스코어 계산
  const totalScore = (flavorScore + sensoryScore) / 2
  
  return {
    total: Math.round(totalScore),
    flavor: Math.round(flavorScore),
    sensory: Math.round(sensoryScore)
  }
}

const createScoreVisual = (scores) => {
  // CSS 애니메이션 기반 점수 시각화
  const scoreElement = document.querySelector('.score-progress')
  
  if (scoreElement) {
    // CSS 변수를 통한 애니메이션 제어
    scoreElement.style.setProperty('--progress', `${scores.total}%`)
    
    // 점수에 따른 색상 클래스 적용
    const scoreClass = getScoreClass(scores.total)
    scoreElement.classList.add(scoreClass)
    
    // 애니메이션 트리거
    setTimeout(() => {
      scoreElement.classList.add('animate')
    }, 500)
  }
}

const saveResult = async () => {
  try {
    const isDemo = route.path.startsWith('/demo')
    
    if (!isDemo) {
      // 실제 모드에서만 저장
      await coffeeRecordStore.saveRecord()
      notificationStore.showSuccess(
        '테이스팅 결과가 저장되었습니다!',
        '💾 저장 완료'
      )
    }
  } catch (error) {
    notificationStore.showError(
      '저장 중 오류가 발생했습니다.',
      '❌ 저장 실패'
    )
  }
}
```

---

## 🛣️ 라우팅 정보

### 라우트 경로
```typescript
// 일반 모드
{
  path: '/result',
  name: 'result',
  component: ResultView,
  meta: { requiresAuth: true, step: 7 }
}

// 데모 모드
{
  path: '/demo/result',
  name: 'demo-result',
  component: ResultView,
  meta: { isDemo: true, step: 7 }
}
```

### 네비게이션 플로우
```
로스터 노트 (Step 6)
├── 일반 모드 → /result
└── 데모 모드 → /demo/result

결과 페이지 (Step 7)
├── 새로운 테이스팅 → /mode-selection
├── 홈으로 → /
├── 통계 보기 → /stats (일반 모드만)
└── 가입하기 → /auth (데모 모드만)
```

---

## 📱 UI/UX 구조

### 레이아웃 구조
```vue
<template>
  <div class="result-view">
    <!-- 헤더 -->
    <header class="result-header">
      <h1>🎉 테이스팅 완료!</h1>
      <p v-if="isDemo" class="demo-badge">데모 모드</p>
    </header>

    <!-- 매치 스코어 차트 -->
    <section class="match-score-section">
      <div class="score-chart">
        <canvas ref="chartCanvas"></canvas>
        <div class="score-overlay">
          <span class="score-number">{{ matchScores.total }}%</span>
          <span class="score-label">매치</span>
        </div>
      </div>
      
      <div class="score-details">
        <div class="score-item">
          <span class="score-category">향미</span>
          <span class="score-value">{{ matchScores.flavor }}%</span>
        </div>
        <div class="score-item">
          <span class="score-category">감각</span>
          <span class="score-value">{{ matchScores.sensory }}%</span>
        </div>
      </div>
    </section>

    <!-- 테이스팅 요약 -->
    <section class="tasting-summary">
      <h2>📝 테이스팅 요약</h2>
      
      <div class="summary-card">
        <h3>☕ 커피 정보</h3>
        <p><strong>카페:</strong> {{ coffeeInfo.cafe_name }}</p>
        <p><strong>커피:</strong> {{ coffeeInfo.coffee_name }}</p>
        <p><strong>원산지:</strong> {{ coffeeInfo.origin }}</p>
      </div>

      <div class="summary-card">
        <h3>🌸 선택한 향미</h3>
        <div class="flavor-tags">
          <span 
            v-for="flavor in selectedFlavors" 
            :key="flavor"
            class="flavor-tag"
          >
            {{ flavor }}
          </span>
        </div>
      </div>

      <div class="summary-card">
        <h3>✨ 감각 표현</h3>
        <div class="sensory-tags">
          <span 
            v-for="sensory in selectedSensory" 
            :key="sensory"
            class="sensory-tag"
          >
            {{ sensory }}
          </span>
        </div>
      </div>

      <div class="summary-card" v-if="personalComment">
        <h3>💭 개인 코멘트</h3>
        <p class="personal-comment">{{ personalComment }}</p>
      </div>
    </section>

    <!-- 액션 버튼들 -->
    <footer class="result-actions">
      <button 
        v-if="!isDemo"
        @click="saveResult" 
        class="btn-primary"
      >
        💾 결과 저장
      </button>
      
      <button 
        @click="startNewTasting" 
        class="btn-secondary"
      >
        🔄 새로운 테이스팅
      </button>
      
      <button 
        v-if="isDemo"
        @click="goToSignup" 
        class="btn-cta"
      >
        🚀 가입하고 기록 저장하기
      </button>
      
      <button 
        v-else
        @click="goToStats" 
        class="btn-outline"
      >
        📊 통계 보기
      </button>
    </footer>
  </div>
</template>
```

### 스타일링 특징
- **축하 분위기**: 밝고 긍정적인 색상과 이모지 사용
- **차트 중심**: 매치 스코어 차트를 가장 눈에 띄게 배치
- **카드 레이아웃**: 각 섹션을 카드 형태로 구분
- **CTA 강조**: 데모 모드에서 가입 유도 버튼 강조

---

## 🔄 최근 변경사항

### 2025-07-30: CSS 애니메이션 시각화 완료
```css
/* Before: 정적 점수 표시 */
.score-display { font-size: 2rem; }

/* After: 애니메이션 원형 차트 */
.score-progress {
  background: conic-gradient(
    var(--score-color) var(--progress),
    #E8D5C4 var(--progress)
  );
  animation: scoreRotate 1.5s ease-out;
}
```

**변경 이유**: 고급스러운 CSS 애니메이션으로 사용자 경험 향상

### 주요 개선사항
- ✅ CSS 애니메이션 시각화 구현
- ✅ 원형 차트 애니메이션 완성
- ✅ 점수별 색상 시스템 구축
- ✅ 데모 모드 지원 완료
- ✅ 결과 저장 기능 구현

---

## 📊 데이터 구조

### 매치 스코어 계산 로직
```typescript
interface MatchScore {
  total: number        // 전체 매치 스코어 (0-100)
  flavor: number       // 향미 매치 스코어 (0-100)
  sensory: number      // 감각 매치 스코어 (0-100)
  details: {
    matched_flavors: string[]    // 일치한 향미
    missed_flavors: string[]     // 놓친 향미
    matched_sensory: string[]    // 일치한 감각
    missed_sensory: string[]     // 놓친 감각
  }
}
```

### 결과 저장 데이터
```typescript
interface TastingResult {
  id: string
  user_id: string
  coffee_info: CoffeeInfo
  unified_flavor: string[]
  sensory_expression: string[]
  personal_comment: string
  roaster_notes: RoasterNotes
  match_scores: MatchScore
  created_at: string
  updated_at: string
}
```

### CSS 애니메이션 설정
```css
/* 원형 차트 애니메이션 */
.score-progress {
  background: conic-gradient(
    var(--score-color) var(--progress),
    #E8D5C4 var(--progress)
  );
  border-radius: 50%;
  animation: scoreRotate 1.5s ease-out;
}

@keyframes scoreRotate {
  from { --progress: 0%; }
  to { --progress: var(--final-progress); }
}

/* 점수별 색상 변수 */
.score-excellent { --score-color: linear-gradient(45deg, #FFD700, #FFA500); }
.score-great { --score-color: linear-gradient(45deg, #10B981, #059669); }
.score-good { --score-color: linear-gradient(45deg, #3B82F6, #1D4ED8); }
```

---

## 🎨 디자인 토큰

### 색상 팔레트
```css
/* 매치 스코어 색상 */
--color-match-excellent: #28A745;  /* 90-100% */
--color-match-good: #7C5842;       /* 70-89% */
--color-match-fair: #FFC107;       /* 50-69% */
--color-match-poor: #DC3545;       /* 0-49% */

/* 차트 색상 */
--color-chart-primary: #7C5842;
--color-chart-secondary: #E8D5C4;
--color-chart-background: #FFF8F0;

/* 태그 색상 */
--color-flavor-tag: #A0796A;
--color-sensory-tag: #8B4513;
```

### 타이포그래피
```css
/* 점수 표시 */
.score-number {
  font-size: 3rem;
  font-weight: 900;
  color: #7C5842;
}

/* 섹션 제목 */
.section-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

/* 태그 텍스트 */
.flavor-tag, .sensory-tag {
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 20px;
}
```

### 차트 애니메이션
```css
/* 차트 컨테이너 */
.score-chart {
  position: relative;
  width: 200px;
  height: 200px;
  margin: 0 auto;
}

/* 중앙 점수 오버레이 */
.score-overlay {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

/* 카드 스타일 */
.summary-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(124, 88, 66, 0.1);
}
```

---

## 🧪 테스트 시나리오

### 기본 동작 테스트
1. **매치 스코어 계산**: 올바른 점수 계산 및 표시
2. **차트 렌더링**: Chart.js 차트 정상 표시
3. **결과 요약**: 모든 테이스팅 데이터 정상 표시
4. **저장 기능**: Supabase에 결과 정상 저장

### 데모 모드 테스트
1. **데모 결과**: 미리 설정된 데모 결과 표시
2. **가입 유도**: 데모 완료 후 가입 CTA 표시
3. **저장 생략**: 데모 모드에서 저장 기능 비활성화

### 에러 케이스
1. **차트 로딩 실패**: Chart.js 로딩 실패 시 대체 UI
2. **저장 실패**: 네트워크 오류 시 에러 처리
3. **데이터 부재**: 필수 데이터 누락 시 처리

---

## 📋 TODO

### 🔥 High Priority
- [ ] **공유 기능**: 결과를 이미지/링크로 공유
- [ ] **성과 배지**: 높은 매치 스코어 시 배지 표시
- [ ] **추천 시스템**: 비슷한 커피 추천 기능

### 🟡 Medium Priority
- [ ] **상세 분석**: 항목별 세부 분석 페이지
- [ ] **비교 기능**: 이전 테이스팅과 비교
- [ ] **PDF 내보내기**: 결과를 PDF로 저장

### 🟢 Low Priority
- [ ] **소셜 공유**: SNS 연동 공유 기능
- [ ] **프린트 최적화**: 인쇄용 레이아웃
- [ ] **음성 피드백**: 결과 음성 안내

---

## 🔗 관련 파일

### 의존성
- `stores/coffeeRecord.ts` - 테이스팅 데이터 관리
- `stores/demo.ts` - 데모 결과 데이터
- `stores/notification.ts` - 알림 시스템
- `utils/matchScore.ts` - 매치 스코어 계산 로직
- `assets/main.css` - 애니메이션 및 시각화 스타일

### 연관 페이지
- `RoasterNotesView.vue` - 이전 페이지 (Step 6)
- `ModeSelectionView.vue` - 새 테이스팅 시작
- `StatsView.vue` - 통계 페이지
- `AuthView.vue` - 가입 페이지 (데모 모드)

### 컴포넌트
- `Chart.vue` - 차트 컴포넌트 (향후 분리 예정)
- `ScoreDisplay.vue` - 점수 표시 컴포넌트
- `TagCloud.vue` - 태그 표시 컴포넌트

---

## 📈 비즈니스 메트릭

### 핵심 지표
- **완주율**: 테이스팅 플로우 완료 비율 (목표: 85%)
- **저장율**: 결과 저장 버튼 클릭 비율 (목표: 90%)
- **재사용률**: 새로운 테이스팅 시작 비율 (목표: 60%)

### 데모 전환율
- **데모 완료율**: 데모 플로우 완료 비율 (목표: 70%)
- **가입 전환율**: 데모 완료 후 가입 비율 (목표: 25%)
- **데모 만족도**: 평균 매치 스코어 (목표: 75% 이상)

### 사용자 만족도
- **고득점 비율**: 80% 이상 매치 스코어 비율
- **재방문률**: 결과 확인 후 재방문 비율
- **공유율**: 결과 공유 기능 사용 비율

---

**📝 문서 끝**

*작성자: CupNote 개발팀*  
*최종 수정: 2025년 7월 30일*  
*버전: 1.0*