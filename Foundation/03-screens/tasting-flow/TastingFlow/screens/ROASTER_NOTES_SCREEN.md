# RoasterNotesScreen - 로스터 노트 입력 화면

> 모든 TastingFlow 모드의 공통 로스터/생산자 노트 입력 화면, Match Score 계산의 핵심 데이터

## 📱 화면 개요

**구현 파일**: `[screens]/enhanced/RoasterNotesScreen`  
**역할**: 로스터/카페에서 제공한 공식 테이스팅 노트 입력 및 Match Score 계산
**소요시간**: 1-2분
**진행률**: Lab Mode 100% / Cafe&HomeCafe Mode 100%

## 🎯 기능 정의

### 기술적 목표
- Match Score 계산을 위한 전문가 노트 데이터 수집
- 사용자 평가와 전문가 노트 간 비교 분석 시스템
- 다국어 텍스트 처리 및 언어 감지 기능

### 핵심 기능
- **감각 능력 평가**: 전문가 노트 비교를 통한 객관적 평가
- **일치도 측정**: 0-100% 스코어로 정확도 수치화
- **차이점 분석**: 눈친 표현, 추가 발견 요소 식별

## 🏗️ UI/UX 구조

### 화면 레이아웃
```
Header: ProgressBar (100%) + "로스터 노트"
├── 안내 메시지
│   ├── "로스터나 카페에서 제공한 테이스팅 노트를 입력해주세요"
│   └── "여러분의 평가와 비교하여 Match Score를 계산합니다"
├── 노트 소스 선택
│   ├── 📦 로스터 공식 노트 (Roaster Official)
│   ├── ☕ 카페 큐핑 노트 (Cafe Cupping)  
│   ├── 🏆 대회 심사 노트 (Competition)
│   └── 📱 온라인 리뷰 (Online Review)
├── 메인 입력 영역
│   ├── 텍스트 에리어 (다중 라인)
│   │   ├── 플레이스홀더: "예) 딸기, 초콜릿, 꽃향기의 우아한 조화..."
│   │   ├── 글자 수 카운터: "45/300"
│   │   └── 언어 감지: 한국어/영어 자동 감지
│   └── 입력 지원 도구
│       ├── OCR 스캔 버튼 (카메라로 텍스트 인식) - Phase 2
│       ├── 음성 입력 버튼 - Phase 2
│       └── 자주 사용되는 전문 용어 버튼들
├── 실시간 Match Score 미리보기
│   ├── 계산 중... / 85% 일치 표시
│   ├── 일치하는 키워드 하이라이트
│   └── 차이점 간단 요약
├── 추가 정보 (선택사항)
│   ├── 로스터 정보
│   │   ├── 로스터 이름 (자동완성)
│   │   └── 로스팅 날짜 (날짜 선택)
│   ├── 구매 정보  
│   │   ├── 구매 장소
│   │   ├── 구매 가격 (원)
│   │   └── 포장 형태 (원두/드립백/캡슐)
│   └── 보관 정보
│       ├── 개봉일
│       └── 보관 방법
└── Footer: "완료" Button (로스터 노트 입력 시 활성화)
```

### 디자인 원칙
- **실시간 피드백**: 입력과 동시에 Match Score 계산 표시
- **학습 중심**: 차이점을 명확히 보여주는 교육적 인터페이스
- **전문성**: 로스터 노트의 전문성과 신뢰성 강조
- **선택적 상세**: 필수 입력은 최소화, 추가 정보는 선택사항

## 💾 데이터 처리

### 입력 데이터
```typescript
interface CompleteTastingData {
  // 모든 이전 단계 데이터 통합
  coffee_info: CoffeeInfo;
  selected_flavors: FlavorNote[];
  sensory_expressions: SensoryExpressions;
  personal_comment: PersonalComment;
  
  // 모드별 선택적 데이터
  homecafe_data?: HomeCafeData;
  experimental_data?: ExperimentalData;
  sensory_scores?: SensoryScores;
}
```

### 출력 데이터
```typescript
interface RoasterNotes {
  // 메인 노트
  notes_text: string;                      // 로스터 노트 원문 (최대 300자)
  notes_source: NotesSource;               // 노트 출처
  language_detected: 'ko' | 'en' | 'mixed'; // 감지된 언어
  
  // Match Score 계산 결과
  match_score: {
    overall_score: number;                 // 전체 일치도 (0-100%)
    category_scores: {                     // 카테고리별 일치도
      flavor_match: number;                // 향미 일치도
      sensory_match: number;               // 감각 표현 일치도
      overall_impression: number;          // 전체적 인상 일치도
    };
    matched_keywords: string[];            // 일치하는 키워드들
    missed_keywords: string[];             // 놓친 키워드들
    unique_user_expressions: string[];     // 사용자만 언급한 표현들
  };
  
  // 추가 정보 (선택사항)
  roaster_info?: {
    roaster_name: string;                  // 로스터명
    roasting_date?: Date;                  // 로스팅 날짜
    batch_number?: string;                 // 배치 번호
  };
  
  purchase_info?: {
    store_name?: string;                   // 구매처
    purchase_price?: number;               // 구매 가격 (원)
    package_type?: PackageType;            // 포장 형태
    purchase_date?: Date;                  // 구매일
  };
  
  storage_info?: {
    opened_date?: Date;                    // 개봉일
    storage_method?: StorageMethod;        // 보관 방법
  };
  
  // 메타데이터
  input_duration: number;                  // 입력 소요 시간 (초)
  created_at: Date;
}

enum NotesSource {
  ROASTER_OFFICIAL = 'roaster_official',   // 로스터 공식
  CAFE_CUPPING = 'cafe_cupping',           // 카페 큐핑
  COMPETITION = 'competition',             // 대회 심사
  ONLINE_REVIEW = 'online_review'          // 온라인 리뷰
}

enum PackageType {
  WHOLE_BEAN = 'whole_bean',               // 원두
  DRIP_BAG = 'drip_bag',                   // 드립백
  CAPSULE = 'capsule',                     // 캡슐
  GROUND = 'ground'                        // 분쇄원두
}

enum StorageMethod {
  FREEZER = 'freezer',                     // 냉동
  REFRIGERATOR = 'refrigerator',           // 냉장
  ROOM_TEMP = 'room_temperature',          // 실온
  AIRTIGHT = 'airtight_container'          // 밀폐용기
}
```

## 🔄 사용자 인터랙션

### 주요 액션
1. **노트 소스 선택**: 4가지 출처 중 하나 선택
2. **자유 텍스트 입력**: 다중 라인 텍스트 에리어에 노트 입력
3. **실시간 매칭**: 입력과 동시에 Match Score 계산 확인
4. **추가 정보**: 로스터, 구매, 보관 정보 선택적 입력
5. **OCR 스캔**: 카메라로 포장지 텍스트 인식 (Phase 2)

### 인터랙션 플로우
```
노트 소스 선택 → 텍스트 입력 → 실시간 매칭 확인 → 추가 정보 입력 → 완료
```

### 실시간 피드백
- **Match Score 계산**: 입력 즉시 일치도 계산 표시
- **키워드 하이라이트**: 일치하는 키워드 시각적 강조
- **차이점 안내**: 놓친 키워드나 추가 발견 표시

## 📊 Match Score 알고리즘

### 계산 방법론
3단계 비교 분석을 통한 종합 점수 계산:

#### 1. 향미 일치도 (Flavor Match) - 40%
```typescript
const calculateFlavorMatch = (
  userFlavors: FlavorNote[],
  roasterNotes: string
): number => {
  // 사용자 선택 향미와 로스터 노트 키워드 매칭
  const roasterKeywords = extractFlavorKeywords(roasterNotes);
  const directMatches = userFlavors.filter(flavor =>
    roasterKeywords.includes(flavor.name.toLowerCase())
  );
  
  // 직접 일치: 100%, 카테고리 일치: 70%, 연관 일치: 50%
  return calculateWeightedScore(directMatches, roasterKeywords);
};
```

#### 2. 감각 표현 일치도 (Sensory Match) - 40%
```typescript
const calculateSensoryMatch = (
  userExpressions: SensoryExpressions,
  roasterNotes: string
): number => {
  // 한국어 감각 표현과 로스터 노트의 영어/한국어 표현 매칭
  const expressionMapping = getExpressionMapping();
  const roasterSensoryTerms = extractSensoryTerms(roasterNotes);
  
  // 카테고리별 일치도 계산 후 가중 평균
  return calculateCategoryWeightedAverage(userExpressions, roasterSensoryTerms);
};
```

#### 3. 전체 인상 일치도 (Overall Impression) - 20%
```typescript
const calculateOverallMatch = (
  userComment: string,
  roasterNotes: string
): number => {
  // 감정 분석 및 전체적 평가 톤 비교
  const userSentiment = analyzeSentiment(userComment);
  const roasterSentiment = analyzeSentiment(roasterNotes);
  
  // 긍정/부정/중립 일치도 + 강도 일치도
  return compareSentimentAlignment(userSentiment, roasterSentiment);
};
```

### 종합 Match Score
```typescript
const calculateOverallMatchScore = (
  flavorMatch: number,
  sensoryMatch: number,
  overallMatch: number
): number => {
  return Math.round(
    flavorMatch * 0.4 + 
    sensoryMatch * 0.4 + 
    overallMatch * 0.2
  );
};
```

### Match Score 해석
- **90-100%**: 전문가 수준의 정확한 평가
- **80-89%**: 매우 우수한 감각 능력
- **70-79%**: 좋은 수준의 감각 능력
- **60-69%**: 평균적인 감각 능력
- **50-59%**: 감각 발달이 필요한 수준
- **50% 미만**: 추가 학습과 경험 필요

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **NotesSourceSelector**: 4가지 노트 출처 선택
- **RoasterNotesTextArea**: 300자 제한 다중 라인 입력
- **MatchScoreIndicator**: 실시간 일치도 표시
- **KeywordHighlighter**: 일치/불일치 키워드 시각화
- **AdditionalInfoForm**: 추가 정보 입력 폼
- **LanguageDetector**: 자동 언어 감지 표시

### Tamagui 스타일링
```typescript
const NotesTextArea = styled(TextArea, {
  minHeight: 100,
  maxHeight: 150,
  backgroundColor: '$background',
  borderRadius: '$3',
  padding: '$md',
  fontSize: '$3',
  lineHeight: '$3',
  borderWidth: 1,
  borderColor: '$borderColor',
  
  focusStyle: {
    borderColor: '$cupBlue',
    borderWidth: 2,
  },
});

const MatchScoreDisplay = styled(XStack, {
  backgroundColor: '$gray1',
  borderRadius: '$3',
  padding: '$md',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginVertical: '$sm',
  
  variants: {
    score: {
      high: {
        backgroundColor: '$green2',
        borderColor: '$green8',
        borderWidth: 1,
      },
      medium: {
        backgroundColor: '$yellow2',
        borderColor: '$yellow8',
        borderWidth: 1,
      },
      low: {
        backgroundColor: '$red2',
        borderColor: '$red8',
        borderWidth: 1,
      }
    }
  } as const,
});

const SourceButton = styled(Button, {
  backgroundColor: '$gray3',
  color: '$gray12',
  borderRadius: '$2',
  paddingHorizontal: '$sm',
  marginRight: '$xs',
  
  variants: {
    selected: {
      true: {
        backgroundColor: '$cupBlue',
        color: 'white',
      }
    }
  } as const,
});
```

## 📱 반응형 고려사항

### 텍스트 입력 최적화
- **키보드 처리**: 다국어 키보드 지원 (한/영)
- **자동 완성**: 자주 사용되는 전문 용어 제안
- **언어 전환**: 한/영 입력 자동 감지 및 전환

### 화면 레이아웃
- **작은 화면**: 추가 정보 섹션 접기/펼치기
- **큰 화면**: Match Score와 입력 영역 동시 표시
- **가로모드**: 입력과 결과를 좌우 분할 배치

## 🔗 네비게이션

### 이전 화면 (모든 모드 공통)
- **PersonalCommentScreen**: 개인 코멘트 입력 완료

### 다음 화면 (모든 모드 공통)
- **ResultScreen**: 최종 테이스팅 결과 화면

### 완료 조건
- 로스터 노트 입력 (필수)
- Match Score 계산 완료 (자동)

## 📈 성능 최적화

### 실시간 계산 최적화
```typescript
// 디바운싱으로 과도한 계산 방지
const debouncedCalculateMatchScore = useMemo(
  () => debounce((roasterNotes: string) => {
    const matchScore = calculateMatchScore(
      tastingData.selected_flavors,
      tastingData.sensory_expressions,
      tastingData.personal_comment,
      roasterNotes
    );
    setMatchScore(matchScore);
  }, 500), // 500ms 지연
  [tastingData]
);

// 키워드 추출 캐싱
const extractedKeywords = useMemo(() => {
  return extractKeywordsWithCache(roasterNotesText);
}, [roasterNotesText]);
```

### 언어 처리 최적화
- **언어 감지**: 경량 라이브러리로 실시간 언어 감지
- **키워드 매핑**: 한영 키워드 매핑 테이블 캐싱
- **텍스트 전처리**: 불필요한 문자 제거 및 정규화

## 🧪 테스트 시나리오

### 기능 테스트
1. **Match Score 정확성**: 알려진 테스트 케이스로 점수 검증
2. **실시간 계산**: 텍스트 입력 시 즉시 점수 업데이트
3. **언어 감지**: 한국어/영어/혼합 텍스트 정확한 감지
4. **키워드 매칭**: 동의어 및 관련어 정확한 매칭

### 정확성 테스트
1. **전문가 검증**: 실제 로스터 노트와 사용자 평가 비교
2. **일관성**: 동일 입력에 대한 일관된 결과
3. **언어 호환성**: 한영 혼합 텍스트 처리 정확도

### 사용성 테스트
1. **학습 효과**: Match Score를 통한 실제 감각 향상 측정
2. **피드백 품질**: 차이점 분석의 유용성 평가
3. **입력 편의성**: 로스터 노트 입력의 편리함

## 🚀 기술적 확장점

### 향후 개선사항
- **OCR API 연동**: 카메라 기반 텍스트 인식 시스템
- **STT 연동**: 음성-텍스트 변환 API 통합
- **다국어 처리**: 일본어, 중국어 등 추가 언어 지원
- **로스터 데이터베이스**: 공식 노트 데이터 API 연동

### 고급 기능
- **ML 모델 개선**: 머신러닝 기반 매칭 알고리즘 최적화
- **소셜 데이터**: 커뮤니티 테이스팅 노트 데이터 수집 및 공유
- **전문가 인증**: 큐핑 전문가 인증 시스템 및 데이터 검증
- **실시간 번역**: 다국어 번역 API 연동


---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: PERSONAL_COMMENT_SCREEN.md, RESULT_SCREEN.md, MATCH_SCORE_ALGORITHM.md  
**구현 상태**: ✅ 완료 (Match Score 핵심 기능)