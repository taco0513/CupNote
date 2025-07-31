# PersonalCommentScreen - 개인 코멘트 입력 화면

> 모든 TastingFlow 모드의 공통 개인 메모 입력 화면, 사용자만의 경험과 생각 기록

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/PersonalCommentScreen`  
**역할**: 자유형식 개인 코멘트 및 메모 작성 (최대 200자)
**소요시간**: 1-2분
**진행률**: Lab Mode 94% / Cafe&HomeCafe Mode 86%

## 🎯 기능 정의

### 기술적 목표

- 정량적 데이터를 정성적 데이터로 보완하는 시스템
- 자유 형식 텍스트 입력 및 처리 기능
- 개인화된 커피 경험 데이터 축적

### 핵심 기능

- **자유 텍스트 입력**: 구조화되지 않은 개인적 경험 기록
- **지원 도구**: 빠른 입력을 위한 보조 인터페이스
- **맥락 데이터**: 시간, 상황 등 기억 보조 정보 추적

## 🏗️ UI/UX 구조

### 화면 레이아웃

```
Header: ProgressBar + "개인 코멘트"
├── 안내 메시지
│   ├── "이 커피에 대한 개인적인 생각을 자유롭게 적어보세요"
│   └── "특별한 순간이나 느낌을 기록해두면 좋은 추억이 됩니다"
├── 메인 입력 영역
│   ├── 텍스트 에리어 (다중 라인)
│   │   ├── 플레이스홀더: "예) 아침에 마시기 좋은 부드러운 맛이었다..."
│   │   ├── 글자 수 카운터: "15/200"
│   │   └── 키보드 타입: 기본 텍스트
│   └── 입력 도구
│       ├── 텍스트 서식 도구 (굵게, 기울임) - Phase 2
│       └── 음성 입력 버튼 - Phase 2
├── 빠른 입력 도구
│   ├── 자주 사용하는 표현 (선택사항)
│   │   ├── "아침에 좋을 것 같다"
│   │   ├── "다시 마시고 싶다"
│   │   ├── "친구에게 추천하고 싶다"
│   │   ├── "특별한 날에 어울린다"
│   │   └── "집중할 때 좋을 것 같다"
│   └── 감정 태그 (선택사항)
│       ├── 😊 만족  😍 최고  😌 편안함
│       ├── 🤔 흥미로움  😋 맛있음  ✨ 특별함
│       └── 💭 생각나는  🎯 집중  ☕ 일상
├── 컨텍스트 정보 (자동 기록)
│   ├── 작성 시간: "오후 2:30"
│   ├── 위치: "홍대 ○○카페" (위치 권한 있는 경우)
│   └── 동행: "혼자" / "친구와" (선택 입력)
└── Footer: "다음" Button (항상 활성화, 빈 내용도 허용)
```

### 디자인 원칙

- **자유도 우선**: 필수 입력 없이 완전 선택사항
- **직관적 도구**: 빠른 입력을 위한 보조 도구 제공
- **감정 중심**: 논리적 분석보다 감정적 기록 우선
- **컨텍스트 보존**: 시간, 장소 등 기억을 돕는 정보 자동 기록

## 💾 데이터 처리

### 입력 데이터

```typescript
interface PreviousScreenData {
  // 모든 모드 공통
  coffee_info: CoffeeInfo
  selected_flavors: FlavorNote[]
  sensory_expressions: SensoryExpressions

  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData
  experimental_data?: ExperimentalData
  sensory_scores?: SensoryScores
}
```

### 출력 데이터

```typescript
interface PersonalComment {
  // 주요 코멘트
  comment_text: string // 메인 텍스트 (최대 200자)

  // 선택적 입력
  quick_expressions?: string[] // 빠른 표현 선택
  emotion_tags?: EmotionTag[] // 감정 태그 선택
  context_info?: ContextInfo // 컨텍스트 정보

  // 메타데이터
  writing_duration: number // 작성 소요 시간 (초)
  character_count: number // 실제 글자 수
  created_at: Date
  last_modified?: Date // 수정된 경우
}

interface ContextInfo {
  time_of_day: 'morning' | 'afternoon' | 'evening' | 'night'
  location?: {
    name: string // 장소명 (GPS 기반)
    coordinates?: [number, number] // 좌표 (선택)
  }
  companion?: 'alone' | 'with_friends' | 'with_family' | 'date' | 'business'
  mood_before?: string // 마시기 전 기분
  occasion?: string // 특별한 경우
}

enum EmotionTag {
  SATISFIED = '😊', // 만족
  AMAZING = '😍', // 최고
  COMFORTABLE = '😌', // 편안함
  INTERESTING = '🤔', // 흥미로움
  DELICIOUS = '😋', // 맛있음
  SPECIAL = '✨', // 특별함
  MEMORABLE = '💭', // 생각나는
  FOCUSED = '🎯', // 집중
  DAILY = '☕', // 일상
}
```

### 자동 수집 데이터

```typescript
const autoContextData = {
  time_of_day: getTimeOfDay(), // 현재 시간 기반
  device_info: getDeviceInfo(), // 디바이스 정보
  session_duration: getSessionDuration(), // 앱 사용 시간
  previous_ratings: getPreviousRatings(), // 이전 평가와 비교
}
```

## 🔄 사용자 인터랙션

### 주요 액션

1. **자유 텍스트 입력**: 다중 라인 텍스트 에리어에 자유 작성
2. **빠른 표현 선택**: 미리 정의된 표현 중 선택 (복수 가능)
3. **감정 태그 선택**: 9개 감정 이모지 중 선택 (복수 가능)
4. **컨텍스트 입력**: 동행, 상황 등 추가 정보 입력
5. **음성 입력**: 음성을 텍스트로 변환 (Phase 2)

### 인터랙션 플로우

```
화면 진입 → 자유 텍스트 작성 → 보조 도구 활용 → 컨텍스트 추가 → 다음 화면
```

### 입력 지원 기능

- **글자 수 카운터**: 실시간 200/200 표시
- **자동 저장**: 10초마다 드래프트 자동 저장
- **키보드 최적화**: 텍스트 입력에 최적화된 키보드 타입
- **실수 방지**: 뒤로가기 시 내용 손실 경고

## 📝 빠른 입력 도구

### 자주 사용하는 표현 (8개)

한국인의 커피 평가 패턴 분석 기반 선정:

```typescript
const QUICK_EXPRESSIONS = [
  '아침에 좋을 것 같다', // 시간대 추천
  '다시 마시고 싶다', // 재구매 의향
  '친구에게 추천하고 싶다', // 추천 의향
  '특별한 날에 어울린다', // 특별함
  '집중할 때 좋을 것 같다', // 기능적 용도
  '편안한 느낌이다', // 감정적 반응
  '새로운 경험이었다', // 신선함
  '기대보다 좋았다', // 기대치 비교
]
```

### 감정 태그 시스템 (9개)

```typescript
const EMOTION_TAGS = {
  positive: ['😊', '😍', '😋', '✨'], // 긍정적
  neutral: ['🤔', '💭', '☕'], // 중립적
  functional: ['🎯', '😌'], // 기능적
}
```

## 🎨 UI 컴포넌트

### 핵심 컴포넌트

- **MultiLineTextInput**: 200자 제한 다중 라인 입력
- **CharacterCounter**: 실시간 글자 수 표시
- **QuickExpressionChips**: 빠른 표현 선택 버튼들
- **EmotionTagSelector**: 감정 이모지 선택 그리드
- **ContextInfoForm**: 컨텍스트 정보 입력 폼
- **AutoSaveIndicator**: 자동 저장 상태 표시

### Tamagui 스타일링

```typescript
const CommentTextArea = styled(TextArea, {
  minHeight: 120,
  maxHeight: 200,
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$md',
  fontSize: '$4',
  lineHeight: '$4',
  borderWidth: 1,
  borderColor: '$borderColor',

  focusStyle: {
    borderColor: '$cupBlue',
    borderWidth: 2,
  },

  placeholderTextColor: '$placeholderColor',
})

const QuickExpressionChip = styled(Button, {
  size: '$2',
  backgroundColor: '$gray2',
  color: '$gray11',
  borderRadius: '$6',
  paddingHorizontal: '$sm',
  marginRight: '$xs',
  marginBottom: '$xs',

  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue',
        color: 'white',
      },
    },
  } as const,

  pressStyle: {
    scale: 0.98,
  },
})

const EmotionTag = styled(Button, {
  width: 48,
  height: 48,
  borderRadius: '$3',
  backgroundColor: '$gray1',

  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue20',
        borderWidth: 2,
        borderColor: '$cupBlue',
        scale: 1.1,
      },
    },
  } as const,

  pressStyle: {
    scale: 0.95,
  },

  animation: 'bouncy',
})
```

## 📱 반응형 고려사항

### 키보드 처리

- **KeyboardAvoidingView**: 키보드 표시 시 입력 영역 보장
- **자동 스크롤**: 키보드로 가려진 영역 자동 스크롤
- **완료 버튼**: 키보드 완료 버튼으로 입력 완료

### 화면 크기별 최적화

- **작은 화면**: 빠른 입력 도구 최소화 표시
- **큰 화면**: 모든 도구 펼쳐서 표시
- **가로모드**: 입력 영역 확장, 도구는 측면 배치

## 🔗 네비게이션

### 이전 화면 (모든 모드 공통)

- **SensoryExpressionScreen**: 한국어 감각 표현 완료

### 다음 화면 (모든 모드 공통)

- **RoasterNotesScreen**: 로스터 노트 입력

### 데이터 전달

모든 이전 단계 데이터 + 개인 코멘트를 다음 화면으로 전달

## 📈 성능 최적화

### 텍스트 입력 최적화

```typescript
// 디바운싱으로 자동 저장 최적화
const debouncedAutoSave = useMemo(
  () =>
    debounce((text: string) => {
      saveDraft(text)
      setAutoSaveStatus('saved')
    }, 10000), // 10초마다 자동 저장
  []
)

// 글자 수 카운터 최적화
const characterCount = useMemo(() => {
  return commentText.length
}, [commentText])

// 메모리 누수 방지
useEffect(() => {
  return () => {
    debouncedAutoSave.cancel()
  }
}, [debouncedAutoSave])
```

### 상태 관리

- **로컬 상태**: 입력 중인 텍스트는 컴포넌트 로컬 상태로 관리
- **자동 저장**: 주기적으로 AsyncStorage에 드래프트 저장
- **메모리 효율**: 불필요한 렌더링 방지

## 🧪 테스트 시나리오

### 기능 테스트

1. **글자 수 제한**: 200자 초과 입력 시 제한 동작
2. **자동 저장**: 10초 간격 드래프트 저장 확인
3. **데이터 복구**: 앱 종료 후 재실행 시 드래프트 복구
4. **빠른 입력**: 선택된 표현들이 텍스트에 올바르게 추가

### 사용성 테스트

1. **입력 편의성**: 키보드 표시/숨김 시 UI 적절성
2. **도구 활용도**: 빠른 입력 도구 사용 빈도 및 만족도
3. **감정 표현**: 감정 태그를 통한 만족도 향상 정도

### 성능 테스트

1. **입력 응답성**: 텍스트 입력 시 지연 없는 반응
2. **메모리 사용량**: 장시간 입력 시 메모리 사용량 안정성
3. **자동 저장**: 주기적 저장으로 인한 성능 영향 없음

## 🚀 기술적 확장점

### 향후 개선사항

- **STT 연동**: 음성-텍스트 변환 API 연동
- **마크다운 지원**: 텍스트 서식 및 스타일링 기능
- **미디어 첨부**: 이미지/오디오 파일 첨부 시스템
- **템플릿 시스템**: 자주 사용하는 패턴 자동 수집 및 제안

### 고급 기능

- **패턴 분석**: 머신러닝 기반 코멘트 패턴 분석
- **감정 분석**: NLP 기반 텍스트 감정 분석
- **소셜 연동**: SNS API 통합 공유 시스템
- **전문 검색**: 텍스트 인덱싱 및 고급 검색 기능

## 🔒 프라이버시 고려사항

### 데이터 보호

- **로컬 우선**: 민감한 개인 코멘트는 로컬 저장 우선
- **암호화**: 중요한 개인 정보는 암호화 저장
- **선택적 동시화**: 사용자 선택에 따른 클라우드 동기화

### 사용자 제어

- **삭제 권한**: 언제든 개인 코멘트 삭제 가능
- **편집 기능**: 작성 후에도 자유로운 수정 허용
- **공개 범위**: 개인/공개 설정 선택 (Phase 3)

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: SENSORY_EXPRESSION_SCREEN.md, ROASTER_NOTES_SCREEN.md  
**구현 상태**: ✅ 완료
