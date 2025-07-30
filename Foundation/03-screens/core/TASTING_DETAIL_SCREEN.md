# TastingDetailScreen - 테이스팅 상세 조회 화면

> 저장된 테이스팅 기록의 상세 정보를 표시하고 관리하는 화면

## 📱 화면 개요

**구현 파일**: `[screens]/journal/TastingDetailScreen`  
**역할**: 특정 테이스팅 기록의 모든 데이터 표시, 수정/삭제 관리  
**접근**: Journal 화면에서 개별 기록 선택시 이동  
**특징**: 모드별 차별화된 상세 표시 + 편집 기능

## 🎯 기능 정의

### 기술적 목표

- 저장된 테이스팅 기록의 완전한 정보 표시 및 사용자 편의성 제공
- 모드별(Cafe/HomeCafe/Lab) 특화된 데이터 시각화 시스템
- 기록 수정, 삭제, 공유 등 관리 기능의 통합 제공

### 핵심 기능

- **완전한 데이터 표시**: 테이스팅 기록의 모든 필드 구조화된 표시
- **모드별 특화 뷰**: 각 모드의 특성에 맞는 정보 레이아웃
- **인터랙티브 요소**: 향미/표현 재선택, Match Score 상세 분석
- **기록 관리**: 편집, 삭제, 즐겨찾기, 공유 기능

## 🏗️ UI/UX 구조

### 화면 레이아웃 (스크롤 가능)

```
Header: 커피명 + 날짜 + 모드 배지 + [...] 메뉴
├── 기본 정보 카드
│   ├── 📷 커피 사진 (있는 경우)
│   ├── ☕ 커피명: "에티오피아 예가체프"
│   ├── 🏪 카페명: "블루보틀 서울" (Cafe Mode)
│   ├── 🌍 원산지: "에티오피아 > 예가체프"
│   ├── 🔥 로스팅: "미디엄 라이트"
│   ├── 🌡️ 온도: "Hot"
│   └── 📅 기록일: "2025.07.28 14:30"
├── 모드별 특화 정보
│   ├── 🏠 HomeCafe Mode 전용
│   │   ├── 드리퍼: V60
│   │   ├── 레시피: 20g : 320ml (1:16)
│   │   ├── 물온도: 92°C
│   │   ├── 추출시간: 3분 30초
│   │   └── 분쇄도: Medium
│   └── 🔬 Lab Mode 전용
│       ├── TDS: 1.28%
│       ├── 추출수율: 21.3%
│       ├── SCA 점수: 85.5/100
│       └── 레이더 차트 (6개 항목)
├── 향미 프로파일
│   ├── 🎯 선택된 향미 (5개)
│   │   └── [Strawberry] [Chocolate] [Caramel] [Citrus] [Floral]
│   └── 💭 감각 표현 (8개, 카테고리별)
│       ├── 산미: 싱그러운, 발랄한
│       ├── 단맛: 달콤한, 꿀 같은
│       ├── 바디: 크리미한, 벨벳 같은
│       └── 애프터: 깔끔한, 길게 남는 (+ 2개 더)
├── Match Score 분석 (있는 경우)
│   ├── 💯 전체 점수: 88%
│   ├── 📊 세부 분석
│   │   ├── 향미 매칭: 92%
│   │   ├── 표현 정확도: 85%
│   │   └── 일관성: 87%
│   ├── 🎯 강점: "향미 감지 뛰어남"
│   ├── 💡 개선점: "바디감 더 주의깊게"
│   └── 📝 로스터 노트 원문 표시
├── 개인 평가 및 코멘트
│   ├── 📝 개인 코멘트
│   │   └── "아침에 마시기 좋은 부드러운 맛. 베리 향이 특히 인상적이었고..."
│   ├── 🔬 실험 노트 (HomeCafe/Lab)
│   │   ├── 특이사항: "블룸이 평소보다 활발했음"
│   │   ├── 다음번 시도: "분쇄도를 조금 더 굵게"
│   │   └── 만족도: ⭐⭐⭐⭐⚪ (4/5)
│   └── 🏷️ 태그 (자동/수동)
│       └── #아침커피 #에티오피아 #과일향 #추천
├── 성장 인사이트 (개인화)
│   ├── 📈 개인 기록
│   │   ├── 이 카페에서 #{n}번째 방문
│   │   ├── 평균 Match Score보다 +{n}% 높음
│   │   └── 선호 패턴과 85% 일치
│   ├── 💡 맞춤 추천
│   │   └── "비슷한 맛: 과테말라 안티구아 추천"
│   └── 🎯 성취 연결
│       └── "이 테이스팅으로 'Flavor Hunter' 배지 획득!"
├── 관련 기록 (있는 경우)
│   ├── 🔄 같은 커피: 2회 더 기록됨
│   ├── 🏪 같은 카페: 12회 방문 기록
│   └── 🌍 같은 원산지: 8개 다른 원두
└── 액션 버튼 영역
    ├── 📝 [편집] - 기록 수정
    ├── ⭐ [즐겨찾기] - 특별 표시
    ├── 📱 [공유] - SNS 공유
    ├── 📊 [비교] - 다른 기록과 비교
    ├── 🗑️ [삭제] - 기록 삭제
    └── 🔄 [다시 방문] - 같은 설정으로 새 테이스팅
```

### 모드별 차별화 표시

#### Cafe Mode 특화

```
간소화된 정보 중심
├── 기본 커피 정보
├── 향미 + 감각 표현 (핵심)
├── Match Score (간단)
└── 개인 코멘트
```

#### HomeCafe Mode 특화

```
레시피 중심 표시
├── 상세 추출 레시피
├── 장비 정보 (드리퍼, 그라인더)
├── 실험 노트
├── 성공/실패 분석
└── 다음 시도 제안
```

#### Lab Mode 특화

```
전문 분석 데이터 중심
├── 과학적 측정값 (TDS, 수율)
├── SCA 표준 점수 + 레이더 차트
├── 상세 큐핑 노트
├── 캘리브레이션 점수
└── 전문가 수준 인사이트
```

## 💾 데이터 처리

### 입력 데이터 (완전한 테이스팅 기록)

```typescript
interface TastingDetailData {
  // 기본 정보
  tasting_record: CompleteTastingRecord

  // 관련 데이터
  related_records?: RelatedRecord[]
  cafe_history?: CafeHistory
  personal_insights?: PersonalInsights

  // 사용자 권한
  can_edit: boolean
  can_delete: boolean

  // 메타데이터
  view_count: number
  last_viewed: Date
}

interface RelatedRecord {
  id: string
  type: 'same_coffee' | 'same_cafe' | 'same_origin'
  title: string
  date: Date
  thumbnail_data?: string
  match_score?: number
}

interface PersonalInsights {
  // 개인 패턴 분석
  visit_rank: number // 이 카페에서 n번째
  score_percentile: number // 개인 평균 대비 백분위
  preference_match: number // 선호 패턴 일치도 (%)

  // 추천
  similar_recommendations: string[] // 비슷한 커피 추천
  next_experiment?: string // 다음 실험 제안

  // 성취 연결
  achievement_earned?: Achievement // 이 기록으로 획득한 성취
  progress_contribution?: string // 진행 중인 성취에 기여
}
```

### 상세 표시 데이터 변환

```typescript
const transformTastingDetail = (record: CompleteTastingRecord): TastingDetailDisplay => {
  return {
    // 기본 정보 정리
    basic_info: {
      coffee_name: record.coffee_info.coffee_name,
      cafe_name: record.coffee_info.cafe_name,
      origin: formatOrigin(record.coffee_info.origin),
      roast_level: record.coffee_info.roast_level,
      temperature: record.coffee_info.temperature,
      recorded_at: formatDate(record.created_at),
      mode_badge: {
        text: record.mode.toUpperCase(),
        color: getModeColor(record.mode),
      },
    },

    // 모드별 특화 데이터
    mode_specific: getModeSpecificData(record),

    // 향미 프로파일
    flavor_profile: {
      selected_flavors: record.selected_flavors.map(formatFlavorChip),
      sensory_expressions: formatSensoryExpressions(record.sensory_expressions),
      flavor_intensity: calculateFlavorIntensity(record.selected_flavors),
    },

    // Match Score 상세 분석
    match_analysis: record.roaster_notes?.match_score
      ? formatMatchScore(record.roaster_notes.match_score)
      : null,

    // 개인 평가
    personal_evaluation: {
      comment: record.personal_comment?.comment,
      experiment_notes: record.personal_comment?.experiment_notes,
      satisfaction: record.sensory_scores?.overall,
      tags: extractTags(record),
    },
  }
}
```

## 🎨 UI 컴포넌트

### 핵심 컴포넌트

- **DetailHeader**: 커피명, 날짜, 모드 배지가 포함된 헤더
- **BasicInfoCard**: 기본 커피 정보 카드
- **ModeSpecificSection**: 모드별 특화 정보 표시
- **FlavorProfileCard**: 향미와 감각 표현 시각화
- **MatchScoreAnalysis**: Match Score 상세 분석 컴포넌트
- **PersonalEvaluationCard**: 개인 평가 카드
- **RelatedRecords**: 관련 기록 목록
- **ActionButtonRow**: 하단 액션 버튼들
- **DetailModal**: 편집/삭제 등 모달 창

### Tamagui 스타일링

```typescript
const DetailContainer = styled(ScrollView, {
  flex: 1,
  backgroundColor: '$background',
})

const DetailHeader = styled(XStack, {
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '$md',
  borderBottomWidth: 1,
  borderBottomColor: '$gray6',
})

const InfoCard = styled(Card, {
  margin: '$md',
  padding: '$lg',
  backgroundColor: '$gray1',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$gray6',
})

const SectionTitle = styled(Text, {
  fontSize: '$5',
  fontWeight: 'bold',
  color: '$gray12',
  marginBottom: '$md',
})

const FlavorChip = styled(Card, {
  paddingHorizontal: '$sm',
  paddingVertical: '$xs',
  backgroundColor: '$blue2',
  borderRadius: '$2',
  marginRight: '$xs',
  marginBottom: '$xs',

  variants: {
    category: {
      fruity: { backgroundColor: '$red2', borderColor: '$red8' },
      nutty: { backgroundColor: '$orange2', borderColor: '$orange8' },
      chocolate: { backgroundColor: '$brown2', borderColor: '$brown8' },
      floral: { backgroundColor: '$pink2', borderColor: '$pink8' },
      spicy: { backgroundColor: '$yellow2', borderColor: '$yellow8' },
      other: { backgroundColor: '$gray2', borderColor: '$gray8' },
    },
  } as const,
})

const MatchScoreCard = styled(Card, {
  backgroundColor: '$green1',
  borderWidth: 2,
  borderColor: '$green8',
  padding: '$lg',
  borderRadius: '$4',

  variants: {
    score: {
      excellent: { backgroundColor: '$green1', borderColor: '$green8' },
      good: { backgroundColor: '$blue1', borderColor: '$blue8' },
      fair: { backgroundColor: '$yellow1', borderColor: '$yellow8' },
      poor: { backgroundColor: '$orange1', borderColor: '$orange8' },
    },
  } as const,
})

const ActionButton = styled(Button, {
  flex: 1,
  borderRadius: '$3',
  marginHorizontal: '$xs',

  variants: {
    variant: {
      primary: { backgroundColor: '$cupBlue', color: 'white' },
      secondary: { backgroundColor: '$gray5', color: '$gray12' },
      danger: { backgroundColor: '$red8', color: 'white' },
    },
  } as const,
})
```

## 🔄 사용자 인터랙션

### 주요 액션

1. **편집하기**: 원본 TastingFlow로 이동하여 데이터 수정
2. **즐겨찾기**: 특별한 기록으로 표시/해제
3. **공유하기**: 기록을 이미지나 텍스트로 SNS 공유
4. **비교하기**: 다른 테이스팅 기록과 나란히 비교
5. **삭제하기**: 확인 후 영구 삭제
6. **다시 방문**: 같은 설정으로 새로운 테이스팅 시작

### 인터랙션 플로우

```
상세 조회 → 정보 확인 → 액션 선택 → [편집/공유/삭제] → 결과 처리
```

### 편집 플로우

```typescript
const handleEdit = async () => {
  // 기존 데이터를 TastingFlow에 프리로드
  const editableData = convertToEditableFormat(tastingRecord)

  navigation.navigate('TastingFlow', {
    screen: 'ModeSelection',
    params: {
      editMode: true,
      existingData: editableData,
      recordId: tastingRecord.id,
    },
  })
}
```

### 공유 시스템

```typescript
const ShareFormats = {
  // 이미지 공유 (Instagram, Twitter)
  image: async (record: TastingRecord) => {
    const imageData = await generateShareImage(record)
    return Share.open({
      type: 'image/png',
      filename: `cupnote-${record.coffee_name}.png`,
      url: imageData,
    })
  },

  // 텍스트 공유 (카카오톡, 메시지)
  text: async (record: TastingRecord) => {
    const message = formatShareText(record)
    return Share.open({
      message,
      title: `CupNote - ${record.coffee_name}`,
    })
  },

  // 링크 공유 (딥링크)
  link: async (record: TastingRecord) => {
    const deepLink = `cupnote://tasting/${record.id}`
    return Share.open({
      url: deepLink,
      message: `내 커피 테이스팅 기록을 확인해보세요!`,
    })
  },
}
```

## 📊 관련 기록 시스템

### 관련 기록 탐색

```typescript
const findRelatedRecords = async (record: TastingRecord): Promise<RelatedRecord[]> => {
  const related = []

  // 같은 커피
  const sameCoffee = await TastingService.findByCoffee(
    record.coffee_info.coffee_name,
    record.coffee_info.origin
  )
  related.push(...sameCoffee.slice(0, 3))

  // 같은 카페
  const sameCafe = await TastingService.findByCafe(record.coffee_info.cafe_name)
  related.push(...sameCafe.slice(0, 3))

  // 같은 원산지
  const sameOrigin = await TastingService.findByOrigin(record.coffee_info.origin)
  related.push(...sameOrigin.slice(0, 3))

  return related.filter(r => r.id !== record.id)
}
```

### 비교 기능

```typescript
const CompareTastings = {
  // 두 기록 비교
  compare: (record1: TastingRecord, record2: TastingRecord) => {
    return {
      flavor_overlap: calculateFlavorOverlap(record1.selected_flavors, record2.selected_flavors),
      expression_similarity: calculateExpressionSimilarity(
        record1.sensory_expressions,
        record2.sensory_expressions
      ),
      score_difference: Math.abs((record1.match_score || 0) - (record2.match_score || 0)),
      preference_evolution: analyzePreferenceEvolution(record1, record2),
    }
  },

  // 시간순 진화 분석
  analyzeEvolution: (records: TastingRecord[]) => {
    const sorted = records.sort((a, b) => a.created_at.getTime() - b.created_at.getTime())
    return {
      flavor_preference_trends: analyzeFlavurTrends(sorted),
      skill_improvement: analyzeSkillImprovement(sorted),
      consistency_score: calculateConsistency(sorted),
    }
  },
}
```

## 🔗 네비게이션

### 이전 화면

- **JournalScreen**: 저널 목록에서 선택
- **SearchScreen**: 검색 결과에서 선택
- **HomeScreen**: 최근 기록에서 선택

### 다음 화면 (사용자 선택)

- **TastingFlow**: 편집 모드로 이동
- **ComparisonScreen**: 다른 기록과 비교
- **ShareModal**: 공유 옵션 선택
- **DeleteConfirmModal**: 삭제 확인
- **RelatedRecordsScreen**: 관련 기록 더보기

### 딥링크 지원

```typescript
// 특정 테이스팅 기록으로 직접 이동
cupnote://tasting/{tasting_id}

// 편집 모드로 바로 이동
cupnote://tasting/{tasting_id}/edit

// 비교 모드로 이동
cupnote://compare/{tasting_id1}/{tasting_id2}
```

## 📈 성능 최적화

### 데이터 로딩 전략

```typescript
const useTastingDetail = (tastingId: string) => {
  const [detail, setDetail] = useState<TastingDetailData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      // 1. 기본 데이터 즉시 로딩
      const basicData = await TastingService.getById(tastingId)
      setDetail({ ...basicData, related_records: [], personal_insights: null })
      setLoading(false)

      // 2. 관련 데이터 백그라운드 로딩
      const [related, insights] = await Promise.all([
        findRelatedRecords(basicData),
        generatePersonalInsights(basicData),
      ])

      setDetail(prev => ({ ...prev!, related_records: related, personal_insights: insights }))
    }

    loadData()
  }, [tastingId])

  return { detail, loading }
}
```

### 이미지 처리 최적화

- **지연 로딩**: 스크롤시 이미지 로딩
- **캐싱**: 한 번 로딩한 이미지는 메모리 캐시
- **압축**: 상세 화면용 중간 해상도 이미지 사용

## 🧪 테스트 시나리오

### 기능 테스트

1. **완전한 데이터 표시**: 모든 필드가 올바르게 표시
2. **모드별 차별화**: 각 모드에 맞는 정보만 표시
3. **편집 기능**: 편집 후 변경사항 정확히 반영
4. **삭제 기능**: 삭제 후 목록에서 제거됨

### 사용성 테스트

1. **정보 접근성**: 중요한 정보를 쉽게 찾을 수 있는지
2. **액션 명확성**: 각 버튼의 기능이 명확한지
3. **공유 편의성**: 공유 기능이 직관적인지

### 성능 테스트

1. **로딩 속도**: 상세 화면 로딩시간 <2초
2. **메모리 사용**: 이미지 포함시 메모리 효율성
3. **스크롤 성능**: 긴 상세 내용 스크롤 부드러움

## 🚀 확장 가능성

### Phase 2 개선사항

- **상세 분석**: 더 깊이 있는 개인 패턴 분석
- **AI 추천**: 기록 기반 맞춤 커피 추천
- **소셜 기능**: 다른 사용자와 기록 공유 및 비교
- **데이터 시각화**: 시간별, 카페별 트렌드 차트

### Phase 3 고급 기능

- **AR 체험**: 증강현실로 커피 정보 표시
- **음성 메모**: 음성으로 추가 코멘트 녹음
- **위치 연동**: 카페 위치 및 주변 정보 자동 추가
- **전문가 연결**: 전문가의 피드백 요청 기능

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: JOURNAL_SCREEN.md, TastingFlow/RESULT_SCREEN.md  
**구현 상태**: ✅ 완료 (모드별 차별화 + 완전한 관리 기능)
