# Mode Selection Screen

## 🎯 화면 개요

사용자의 커피 기록 상황과 목적에 맞는 모드를 선택하는 첫 번째 화면입니다. 이 선택이 전체 TastingFlow 경험을 결정합니다.

### 화면 위치
- **라우팅**: `/mode-selection`
- **진입점**: 홈페이지 "새로운 기록 시작" 버튼
- **다음 화면**: `/record/step1?mode={selected}`

## 🏗️ 화면 구조

### Layout Architecture

```yaml
Header:
  - 로고 및 앱 타이틀
  - 뒤로가기 버튼 (홈으로)
  - 진행률: 준비 단계

Hero Section:
  - 메인 타이틀: "어떤 상황에서 커피를 마시셨나요?"
  - 서브 타이틀: "상황에 맞는 기록 방식을 추천드릴게요"

Mode Cards Grid:
  - 4개 모드 카드 (2x2 그리드)
  - 모바일: 1열, 태블릿+: 2열

Footer:
  - 데모 체험하기 링크
  - 이전 기록 빠른 보기
```

## 🎨 모드 카드 설계

### Cafe Mode Card

```yaml
Visual:
  - 아이콘: ☕ (커피컵)
  - 색상: Blue 계열 (#2563EB)
  - 배경: 카페 분위기 그라데이션

Content:
  - 제목: "카페 모드"
  - 설명: "카페에서 간단히 기록"
  - 소요시간: "3-5분"
  - 특징 태그: ["빠름", "간편", "직관적"]
  
Use Cases:
  - "점심 후 카페에서"
  - "친구와 만나서 커피 한 잔"
  - "새로운 카페 탐방"

Target User:
  - 커피 초보자
  - 간편한 기록을 원하는 사용자
  - 시간이 제한적인 상황
```

### Quick Mode Card

```yaml
Visual:
  - 아이콘: ⚡ (번개)
  - 색상: Orange 계열 (#EA580C)
  - 배경: 에너지틱한 그라데이션

Content:
  - 제목: "퀵 모드"
  - 설명: "1분 만에 빠른 평가"
  - 소요시간: "1-2분"
  - 특징 태그: ["초간편", "빠름", "즉석"]

Use Cases:
  - "출근길 테이크아웃"
  - "바쁜 상황에서 간단히"
  - "첫 인상만 남기고 싶을 때"

Target User:
  - 모든 사용자 (특히 바쁜 상황)
  - 최소 입력으로 기록하고 싶은 사용자
  - 커피 기록 초보자
```

### HomeCafe Mode Card

```yaml
Visual:
  - 아이콘: 🏠 (집 모양)
  - 색상: Green 계열 (#16A34A)
  - 배경: 홈카페 분위기 그라데이션

Content:
  - 제목: "홈카페 모드"
  - 설명: "집에서 내린 커피 + 레시피"
  - 소요시간: "5-8분"
  - 특징 태그: ["레시피", "실험", "학습"]
  
Use Cases:
  - "주말 오전 홈브루잉"
  - "새로운 원두 테스트"
  - "추출 실험하며"

Target User:
  - 홈브루어
  - 추출 실험을 즐기는 사용자
  - 레시피 관리가 필요한 사용자
```

### Pro Mode Card

```yaml
Visual:
  - 아이콘: 🔬 (현미경)
  - 색상: Purple 계열 (#9333EA)
  - 배경: 전문가 분위기 그라데이션

Content:
  - 제목: "프로 모드"
  - 설명: "전문적인 분석과 평가"
  - 소요시간: "8-12분"
  - 특징 태그: ["SCA 표준", "정밀", "전문적"]
  
Use Cases:
  - "원두 품질 평가"
  - "카페 메뉴 개발"
  - "큐그레이더 평가"

Target User:
  - 커피 전문가
  - 바리스타, 로스터
  - 품질 관리자
```

## 🔄 인터랙션 플로우

### 선택 과정

```mermaid
graph TD
    A[Mode Selection 진입] --> B[4개 모드 카드 표시]
    B --> C{사용자 터치/클릭}
    C --> D[카드 선택 확인 애니메이션]
    D --> E[모드 설명 팝업]
    E --> F{확인/취소}
    F -->|확인| G[해당 모드로 이동]
    F -->|취소| B
    G --> H{Quick Mode?}
    H -->|Yes| I[/record/quick]
    H -->|No| J[/record/step1?mode=selected]
```

### 모드 선택 확인 플로우

```typescript
// 모드 선택 시 확인 다이얼로그
const handleModeSelect = (mode: CoffeeMode) => {
  const confirmationContent = {
    cafe: {
      title: "카페 모드로 시작할게요!",
      description: "간단하고 빠르게 커피 경험을 기록해보세요.",
      expectedTime: "약 3-5분 소요"
    },
    homecafe: {
      title: "홈카페 모드로 시작할게요!",
      description: "추출 레시피와 맛을 함께 기록해보세요.",
      expectedTime: "약 5-8분 소요"
    },
    pro: {
      title: "프로 모드로 시작할게요!",
      description: "SCA 표준에 따른 전문적 평가를 진행합니다.",
      expectedTime: "약 8-12분 소요"
    }
  }
  
  showConfirmation(confirmationContent[mode])
}
```

## 📊 화면별 체크포인트 분석

### 7/29 체크포인트 반영 사항

#### 사용자 여정 최적화 (테이스팅플로우완성-2025-07-29)
- **직관적 모드 선택**: 3가지 추출 환경 명확 구분
- **단계별 가이드**: 각 모드별 소요시간과 특징 명시
- **스마트 추천**: 상황별 모드 추천 시스템

#### UI/UX 개선사항 (2025-07-29-17-00)
- **Progressive Disclosure**: 초보자부터 전문가까지 단계적 안내
- **감정적 연결**: 각 모드별 사용 상황 시나리오 제시
- **학습 중심**: 모드 선택이 곧 학습 경험의 시작

## 🎨 시각적 디자인

### 색상 시스템

```css
/* 모드별 브랜딩 색상 */
.cafe-mode {
  --primary: #2563EB;
  --accent: #DBEAFE;
  --gradient: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
}

.homecafe-mode {
  --primary: #16A34A;
  --accent: #DCFCE7;
  --gradient: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%);
}

.pro-mode {
  --primary: #9333EA;
  --accent: #F3E8FF;
  --gradient: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
}

/* 공통 커피 테마 */
.coffee-theme {
  --coffee-primary: #7C5842;
  --coffee-bg: #FFF8F0;
  --coffee-accent: #F5F0E8;
}
```

### 카드 디자인 시스템

```css
.mode-card {
  /* 기본 구조 */
  border-radius: 16px;
  padding: 2rem;
  min-height: 200px;
  
  /* 터치 최적화 */
  cursor: pointer;
  touch-action: manipulation;
  
  /* 인터랙션 */
  transition: all 0.2s ease;
  box-shadow: 0 2px 10px rgba(124, 88, 66, 0.1);
}

.mode-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.15);
}

.mode-card:active {
  transform: translateY(0);
}

/* 선택된 상태 */
.mode-card.selected {
  border: 2px solid var(--primary);
  box-shadow: 0 0 0 4px var(--accent);
}
```

## 📱 반응형 설계

### 브레이크포인트별 레이아웃

```css
/* Mobile First (320px~) */
.mode-selection-container {
  padding: 1rem;
}

.mode-cards-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

/* Tablet (768px~) */
@media (min-width: 768px) {
  .mode-cards-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

/* Desktop (1024px~) */
@media (min-width: 1024px) {
  .mode-selection-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .mode-cards-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}
```

## 🔧 기술 구현

### Next.js 컴포넌트 구조

```typescript
// app/mode-selection/page.tsx
export default function ModeSelectionPage() {
  const router = useRouter()
  const [selectedMode, setSelectedMode] = useState<CoffeeMode | null>(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const modes: Array<{
    id: CoffeeMode
    title: string
    description: string
    icon: string
    duration: string
    features: string[]
    color: string
  }> = [
    {
      id: 'cafe',
      title: '카페 모드',
      description: '카페에서 간단히 기록',
      icon: '☕',
      duration: '3-5분',
      features: ['빠름', '간편', '직관적'],
      color: 'blue'
    },
    // ... 다른 모드들
  ]

  const handleModeSelect = (mode: CoffeeMode) => {
    setSelectedMode(mode)
    setShowConfirmation(true)
  }

  const handleConfirm = () => {
    if (selectedMode) {
      router.push(`/record/step1?mode=${selectedMode}`)
    }
  }

  return (
    <div className="mode-selection-container">
      <Header title="모드 선택" />
      
      <div className="hero-section">
        <h1>어떤 상황에서 커피를 마시셨나요?</h1>
        <p>상황에 맞는 기록 방식을 추천드릴게요</p>
      </div>

      <div className="mode-cards-grid">
        {modes.map((mode) => (
          <ModeCard
            key={mode.id}
            mode={mode}
            selected={selectedMode === mode.id}
            onSelect={() => handleModeSelect(mode.id)}
          />
        ))}
      </div>

      {showConfirmation && (
        <ModeConfirmationModal
          mode={selectedMode!}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  )
}
```

## 📈 성과 지표

### UX 메트릭
- **선택 시간**: 평균 30초 이내
- **이탈률**: 5% 이하
- **모드별 선택 분포**: Cafe 60%, HomeCafe 30%, Pro 10%

### 기술 성능
- **로딩 시간**: <1초
- **인터랙션 응답**: <100ms
- **접근성**: WCAG 2.1 AA 준수

---

**📅 문서 생성**: 2025-07-31  
**체크포인트 기반**: 7/29 테이스팅플로우완성, 17:00 문서검토  
**구현 상태**: v1.0.0-rc Production Ready