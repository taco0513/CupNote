# Lab Mode Workflow - 랩 모드 워크플로우

> 전문적인 커피 분석과 과학적 측정을 위한 9단계 워크플로우

## 📱 워크플로우 개요

**목적**: 전문가 수준의 체계적 커피 분석 및 과학적 데이터 수집  
**대상**: 커피 전문가, 바리스타, 큐핑 참가자  
**소요시간**: 8-12분  
**특징**: SCA 표준 준수, 정량적 평가, 과학적 데이터 수집

## 🔄 9단계 워크플로우

### 1단계: ModeSelectionScreen
```
진입 → Lab Mode 선택 → 다음
```
- **입력**: 모드 선택 (Lab)
- **특징**: 전문가 모드 안내 및 주의사항 표시
- **소요시간**: 10초
- **다음 화면**: CoffeeInfoScreen

### 2단계: CoffeeInfoScreen  
```
커피정보 → 상세 원두 데이터 → 추출 조건 → 다음
```
- **필수 입력**: 커피명, 원산지, 농장, 품종, 가공방식, 로스팅 레벨, 로스팅 날짜
- **Lab 특징**: 모든 필드가 필수, 정확한 추적을 위한 상세 정보
- **추가 정보**: 
  - 고도 (masl)
  - 프로세싱 상세 (washed, natural, honey 등)
  - 로스터 정보
- **소요시간**: 2-3분
- **다음 화면**: ExperimentalDataScreen

### 3단계: ExperimentalDataScreen ⭐ **Lab 전용 화면**
```
과학적 측정 데이터 입력 → 추출 조건 기록 → TDS/수율 계산 → 다음  
```
- **TDS 측정**: 굴절계로 측정한 Total Dissolved Solids (%)
- **추출 수율**: 자동 계산 또는 직접 입력 (%)
- **추출 조건**:
  - 원두량 정밀 측정 (0.1g 단위)
  - 물량 정밀 측정 (1ml 단위)
  - 물온도 (±1°C)
  - 추출 시간 (초 단위)
  - 분쇄도 설정 (그라인더별 눈금)
- **환경 조건**: 실온, 습도, 기압 (선택사항)
- **소요시간**: 2-3분
- **다음 화면**: HomeCafeScreen (드리퍼 정보 필요시) 또는 UnifiedFlavorScreen

### 4단계: HomeCafeScreen (선택적)
```
추출 기구 정보 → 정밀 레시피 → 다음
```
- **조건부 표시**: 드립 추출 방식인 경우만 표시
- **Lab 특징**: 모든 변수를 정밀하게 기록
- **추출 기구**: 드리퍼 종류, 필터 종류, 그라인더 모델
- **푸어링 패턴**: 센터/스파이럴/펄스 등 상세 기록
- **소요시간**: 60-90초
- **다음 화면**: UnifiedFlavorScreen

### 5단계: UnifiedFlavorScreen
```
SCA 향미휠 기반 향미 선택 (무제한) → 다음  
```
- **입력**: 향미 선택 (Lab 모드는 개수 제한 없음)
- **Lab 특징**: 
  - SCA 향미휠 전체 카테고리 지원
  - 향미 강도 표시 (1-5 scale)
  - 향미 순서 기록 (첫인상 → 여운 순서)
- **전문 도구**: 큐핑 스푼 사용법 가이드
- **소요시간**: 3-4분
- **다음 화면**: SensorySliderScreen

### 6단계: SensorySliderScreen ⭐ **Lab 전용 화면**
```
SCA 표준 6개 항목 수치 평가 (6-10점) → 다음
```
- **평가 항목**: 
  - **Fragrance/Aroma** (향): 6.0-10.0 (0.25 단위)
  - **Flavor** (맛): 6.0-10.0
  - **Aftertaste** (여운): 6.0-10.0  
  - **Acidity** (산미): 6.0-10.0
  - **Body** (바디): 6.0-10.0
  - **Balance** (밸런스): 6.0-10.0
- **총점 계산**: 6개 항목 합계 + Overall Score (최대 100점)
- **시각화**: 실시간 레이더 차트 표시
- **소요시간**: 2-3분  
- **다음 화면**: SensoryExpressionScreen

### 7단계: SensoryExpressionScreen
```
한국어 감각 표현 선택 → 전문가 노트 작성 → 다음
```
- **입력**: 한국어 감각 표현 (6개 카테고리, 44개 표현)
- **Lab 특징**: 수치 평가를 언어로 보완하는 역할
- **전문가 모드**: 카테고리당 제한 없음 (vs 일반모드 3개)
- **큐핑 노트**: 전문 용어와 한국어 표현 병행 표시
- **소요시간**: 2-3분
- **다음 화면**: PersonalCommentScreen

### 8단계: PersonalCommentScreen
```
큐핑 노트 작성 → 분석적 코멘트 → 다음
```
- **입력**: 전문가 수준 큐핑 노트 (500자까지)
- **Lab 특징**: 
  - 구조화된 노트 템플릿 제공
  - 첫인상 → 전개 → 여운 순서로 기록
  - 결함 (defects) 기록 섹션
- **분석 도구**:
  - 온도별 맛 변화 추적
  - 시간별 추출 특성 변화
  - 다른 샘플과의 비교 노트
- **소요시간**: 2-3분
- **다음 화면**: RoasterNotesScreen

### 9단계: RoasterNotesScreen
```
전문가 노트 비교 → 고급 Match Score 계산 → 완료
```
- **입력**: 로스터/큐핑 전문가의 공식 노트
- **Lab 특징**:
  - 수치 점수와 언어 표현 모두 비교
  - 전문 용어 매칭 정확도 계산
  - 캘리브레이션 점수 (다른 전문가와의 일치도)
- **고급 분석**: 향미 프로파일 그래프 매칭
- **소요시간**: 1-2분
- **다음 화면**: ResultScreen

### 10단계: ResultScreen
```
종합 분석 결과 → 전문가 리포트 → 데이터 내보내기 → 완료
```
- **Lab 특화 결과**:
  - 상세 레이더 차트 (6개 항목)
  - TDS vs 수율 산점도 그래프
  - 전문가 수준 캘리브레이션 점수
  - 큐핑 폼 표준 양식 출력
- **데이터 내보내기**: CSV, PDF 리포트 생성
- **소요시간**: 3-5분

## 🚫 건너뛰는 화면 없음

Lab Mode는 **완전한 워크플로우**를 사용하여 모든 화면을 거칩니다:
- **ExperimentalDataScreen**: 과학적 데이터 수집
- **SensorySliderScreen**: 정량적 수치 평가
- **모든 화면 순차 진행**: 전문성과 정확성을 위해 생략 없음

## 💾 데이터 수집 명세

### 전문가급 데이터 모델
```typescript
interface LabModeData {
  // 기본 정보 (모든 필드 필수)
  mode: 'lab';
  coffee_name: string;
  origin: string;
  farm?: string;
  variety: string;
  processing: ProcessingMethod;
  roast_level: RoastLevel;
  roast_date: Date;
  altitude?: number;                    // masl
  roaster_info?: RoasterInfo;
  
  // 과학적 측정 데이터
  experimental_data: ExperimentalData;
  
  // 드리퍼/추출 정보 (해당하는 경우)
  homecafe_data?: HomeCafeData;
  
  // 정량적 평가 (SCA 표준)
  sensory_scores: SensoryScores;
  
  // 정성적 평가
  selected_flavors: FlavorNote[];       // 개수 제한 없음
  sensory_expressions: SensoryExpressions;
  
  // 전문가 노트
  cupping_notes: CuppingNotes;
  roaster_notes?: string;
  
  // 고급 분석 결과
  match_score?: AdvancedMatchScore;
  calibration_score?: CalibrationScore;
}

interface ExperimentalData {
  // 기본 측정값
  coffee_dose: number;                  // 원두량 (g, 0.1g 단위)
  water_dose: number;                   // 물량 (ml, 1ml 단위)
  water_temp: number;                   // 물온도 (°C, 0.5°C 단위)
  brew_time: number;                    // 추출시간 (초)
  
  // TDS 및 수율
  tds_measurement: number;              // TDS (%, 0.01% 단위)
  extraction_yield: number;             // 추출 수율 (%, 자동 계산)
  
  // 분쇄 정보
  grinder_model?: string;
  grind_setting?: string;               // 그라인더별 눈금
  grind_size_description?: string;      // coarse/medium/fine
  
  // 환경 조건 (선택사항)
  room_temperature?: number;            // 실온 (°C)
  humidity?: number;                    // 습도 (%)
  atmospheric_pressure?: number;        // 기압 (hPa)
  
  // 추출 패턴 (드립인 경우)
  bloom_time?: number;                  // 블룸 시간 (초)
  pour_pattern?: PourPattern[];         // 푸어링 패턴 배열
  total_pours?: number;                 // 총 푸어링 횟수
}

interface SensoryScores {
  fragrance_aroma: number;              // 6.0-10.0
  flavor: number;                       // 6.0-10.0
  aftertaste: number;                   // 6.0-10.0
  acidity: number;                      // 6.0-10.0
  body: number;                         // 6.0-10.0
  balance: number;                      // 6.0-10.0
  overall: number;                      // 6.0-10.0
  total_score: number;                  // 자동 계산 (최대 70점)
  final_score: number;                  // Overall 포함 총점 (최대 100점)
  
  // 결함 점수 (있는 경우)
  defects?: Defect[];
  uniformity?: number;                  // 10점 만점
  clean_cup?: number;                   // 10점 만점
  sweetness?: number;                   // 10점 만점
}

interface CuppingNotes {
  first_impression: string;             // 첫인상
  flavor_development: string;           // 맛의 전개
  finish_notes: string;                 // 피니시/여운
  temperature_notes?: string;           // 온도별 변화
  defects_noted?: string;               // 발견된 결함
  comparative_notes?: string;           // 다른 샘플과 비교
  overall_assessment: string;           // 종합 평가
}

interface PourPattern {
  pour_number: number;                  // 1차, 2차 등
  start_time: number;                   // 시작 시간 (초)
  end_time: number;                     // 종료 시간 (초)
  water_amount: number;                 // 해당 푸어의 물량 (ml)
  technique: PourTechnique;             // 중심/나선/펄스 등
  target_weight: number;                // 목표 누적 중량 (g)
}
```

### 고급 분석 결과
```typescript
interface AdvancedMatchScore {
  overall_score: number;                // 전체 일치도 (%)
  
  // 세부 매칭 점수
  flavor_matching: number;              // 향미 매칭 (%)
  intensity_matching: number;           // 강도 매칭 (%)
  descriptor_accuracy: number;          // 표현 정확도 (%)
  
  // 전문가 평가
  professional_level: ProfessionalLevel; // NOVICE/INTERMEDIATE/ADVANCED/EXPERT
  calibration_notes: string[];          // 캘리브레이션 피드백
  
  // 개선 영역
  improvement_areas: ImprovementArea[];
  strengths: string[];                  // 강점 영역
}

interface CalibrationScore {
  reference_score: number;              // 기준 점수
  user_score: number;                   // 사용자 점수
  deviation: number;                    // 편차
  consistency_rating: number;           // 일관성 점수 (1-5)
  bias_analysis: BiasAnalysis;          // 편향 분석
}

enum ProfessionalLevel {
  NOVICE = 'novice',                    // 입문자 (Match Score < 60%)
  INTERMEDIATE = 'intermediate',        // 중급자 (60-75%)
  ADVANCED = 'advanced',                // 고급자 (75-90%)
  EXPERT = 'expert'                     // 전문가 (90%+)
}
```

## 🔄 네비게이션 로직

### 순차적 전체 워크플로우
```typescript
const getLabModeNavigation = (currentScreen: string): string => {
  const labWorkflow = [
    'ModeSelection',
    'CoffeeInfo',
    'ExperimentalData',    // Lab 모드 필수
    'HomeCafe',            // 드립 추출인 경우
    'UnifiedFlavor',
    'SensorySlider',       // Lab 모드 필수
    'SensoryExpression',
    'PersonalComment',
    'RoasterNotes',
    'Result'
  ];
  
  const currentIndex = labWorkflow.indexOf(currentScreen);
  return labWorkflow[currentIndex + 1];
};

// 조건부 HomeCafe 화면 처리
const shouldShowHomeCafeScreen = (extractionMethod: string): boolean => {
  const dripMethods = ['v60', 'kalita', 'chemex', 'origami', 'clever'];
  return dripMethods.includes(extractionMethod.toLowerCase());
};
```

### 진행률 계산 (정밀)
```typescript
const getLabModeProgress = (currentScreen: string, includeHomeCafe: boolean): number => {
  let screens = [
    'ModeSelection',       // 10%
    'CoffeeInfo',          // 20%
    'ExperimentalData',    // 30%
    'UnifiedFlavor',       // 40%  (HomeCafe 없는 경우)
    'SensorySlider',       // 50%
    'SensoryExpression',   // 60%
    'PersonalComment',     // 70%
    'RoasterNotes',        // 80%
    'Result'               // 100%
  ];
  
  if (includeHomeCafe) {
    // HomeCafe 포함시 진행률 재계산
    screens = [
      'ModeSelection',     // 10%
      'CoffeeInfo',        // 20%
      'ExperimentalData',  // 30%
      'HomeCafe',          // 40%
      'UnifiedFlavor',     // 50%
      'SensorySlider',     // 60%
      'SensoryExpression', // 70%
      'PersonalComment',   // 80%
      'RoasterNotes',      // 90%
      'Result'             // 100%
    ];
  }
  
  const currentIndex = screens.indexOf(currentScreen);
  return Math.round(((currentIndex + 1) / screens.length) * 100);
};
```

## 📊 SCA 표준 준수

### 큐핑 프로토콜 기반
```typescript
// SCA 큐핑 점수 계산
const calculateSCAScore = (scores: SensoryScores): SCAScoreBreakdown => {
  const attributeTotal = 
    scores.fragrance_aroma + 
    scores.flavor + 
    scores.aftertaste + 
    scores.acidity + 
    scores.body + 
    scores.balance;
    
  const finalScore = attributeTotal + scores.overall;
  
  return {
    attribute_total: attributeTotal,      // 최대 60점
    overall_score: scores.overall,        // 최대 10점
    final_score: finalScore,              // 최대 70점
    scaled_score: (finalScore / 70) * 100, // 100점 환산
    grade: getSCAGrade(finalScore)
  };
};

const getSCAGrade = (score: number): SCAGrade => {
  if (score >= 90) return 'OUTSTANDING';
  if (score >= 85) return 'EXCELLENT';
  if (score >= 80) return 'VERY_GOOD';
  if (score >= 75) return 'GOOD';
  if (score >= 70) return 'FAIR';
  return 'BELOW_STANDARD';
};
```

### TDS 및 수율 계산
```typescript
const calculateExtractionYield = (
  coffeeDose: number,      // g
  waterDose: number,       // ml  
  tds: number             // %
): ExtractionCalculation => {
  // 브루 스트렝스 계산
  const brewStrength = tds;
  
  // 추출 수율 계산 (SCA 공식)
  const extractionYield = (brewStrength * waterDose) / (coffeeDose * 10);
  
  // 최적 범위 체크
  const strengthOptimal = brewStrength >= 1.15 && brewStrength <= 1.35;
  const yieldOptimal = extractionYield >= 18 && extractionYield <= 22;
  
  return {
    brew_strength: brewStrength,
    extraction_yield: extractionYield,
    strength_optimal: strengthOptimal,
    yield_optimal: yieldOptimal,
    overall_optimal: strengthOptimal && yieldOptimal,
    recommendations: generateExtractionAdvice(brewStrength, extractionYield)
  };
};
```

## 🔬 고급 분석 도구

### 레이더 차트 시각화
```typescript
const RadarChartComponent = ({ scores }: { scores: SensoryScores }) => {
  const data = [
    { attribute: 'Aroma', value: scores.fragrance_aroma, fullMark: 10 },
    { attribute: 'Flavor', value: scores.flavor, fullMark: 10 },
    { attribute: 'Aftertaste', value: scores.aftertaste, fullMark: 10 },
    { attribute: 'Acidity', value: scores.acidity, fullMark: 10 },
    { attribute: 'Body', value: scores.body, fullMark: 10 },
    { attribute: 'Balance', value: scores.balance, fullMark: 10 }
  ];
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="attribute" />
        <PolarRadiusAxis angle={0} domain={[6, 10]} />
        <Radar
          name="Score"
          dataKey="value"
          stroke="#8884d8"
          fill="#8884d8"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
};
```

### TDS vs 수율 산점도
```typescript
const ExtractionChart = ({ tds, yield }: { tds: number, yield: number }) => {
  return (
    <YStack alignItems="center" space="$3">
      <Text fontSize="$4" fontWeight="bold">추출 분석</Text>
      
      {/* 최적 구간 표시 */}
      <XStack space="$4">
        <YStack alignItems="center">
          <Text fontSize="$2" color="$gray11">TDS</Text>
          <Text 
            fontSize="$5" 
            fontWeight="bold"
            color={tds >= 1.15 && tds <= 1.35 ? '$green10' : '$orange10'}
          >
            {tds.toFixed(2)}%
          </Text>
          <Text fontSize="$1" color="$gray10">최적: 1.15-1.35%</Text>
        </YStack>
        
        <YStack alignItems="center">
          <Text fontSize="$2" color="$gray11">수율</Text>
          <Text 
            fontSize="$5" 
            fontWeight="bold"
            color={yield >= 18 && yield <= 22 ? '$green10' : '$orange10'}
          >
            {yield.toFixed(1)}%
          </Text>
          <Text fontSize="$1" color="$gray10">최적: 18-22%</Text>
        </YStack>
      </XStack>
      
      {/* 추출 가이드 */}
      <Card padding="$3" backgroundColor="$blue1">
        <Text fontSize="$2" color="$blue11">
          {getExtractionAdvice(tds, yield)}
        </Text>
      </Card>
    </YStack>
  );
};
```

## 🧪 테스트 시나리오

### 전문가 큐핑 시나리오
1. **Lab Mode 선택**: 전문가 모드 주의사항 확인
2. **상세 커피 정보**: 
   - 에티오피아 게뎁 G1
   - 농장: 워카 쿠프
   - 품종: 에티오피아 헤이룸
   - 가공: 내추럴
   - 로스팅: 2025.07.20 (미디엄 라이트)
3. **실험 데이터**:
   - 원두: 18.0g
   - 물: 300ml
   - 온도: 93°C
   - 시간: 4분
   - TDS: 1.28%
   - 수율: 21.3% (자동 계산)
4. **수치 평가**: 각 항목 8.0-8.5점 입력
5. **향미 선택**: Berry, Floral, Wine-like, Dark Chocolate 등 8개
6. **감각 표현**: 각 카테고리에서 자유롭게 선택
7. **큐핑 노트**: 전문적인 구조화된 노트 작성
8. **결과**: 종합 85.5점, SCA Grade 'EXCELLENT'

**예상 소요시간**: 10-12분

### 비교 큐핑 시나리오  
1. 동일한 원두로 로스팅 레벨만 다른 3개 샘플
2. 각각 Lab Mode로 연속 평가
3. 결과 화면에서 3개 샘플 레이더 차트 비교
4. 로스팅 레벨에 따른 특성 변화 분석

### 캘리브레이션 테스트
1. 큐핑 대회 표준 샘플 사용
2. 공식 점수와 비교하여 캘리브레이션 점수 계산
3. 편향 분석 및 개선 영역 제시

## 🎯 전문성 목표

### 정확성
- **SCA 표준**: 국제 표준 큐핑 프로토콜 완전 준수
- **과학적 측정**: TDS, 수율 등 정량적 데이터 기반 분석  
- **일관성**: 반복 측정시 일관된 결과 도출

### 교육적 가치
- **전문 지식**: 큐핑 방법론과 평가 기준 학습
- **캘리브레이션**: 다른 전문가와의 비교를 통한 실력 향상
- **데이터 해석**: 과학적 데이터의 의미와 활용법 이해

### 전문가 인증
- **큐핑 폼**: 표준 큐핑 폼 형태로 결과 출력
- **포트폴리오**: 전문가급 큐핑 기록 축적
- **자격 대비**: Q Grader 등 전문 자격 취득 대비

## 🚀 확장 가능성

### Phase 2 전문 기능
- **블라인드 큐핑**: 정보 숨김 모드로 편향 없는 평가
- **팀 큐핑**: 여러 큐퍼와 실시간 협업 큐핑
- **AI 분석**: 축적된 데이터 기반 개인 편향 분석
- **인증 연동**: Q Grader 등 공식 인증과 연동

### Phase 3 고급 도구
- **스펙트럼 분석**: 향미 성분의 과학적 분석
- **생두 추적**: Farm to Cup 전체 여정 추적
- **클라이밋 매핑**: 기후와 맛의 상관관계 분석

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: EXPERIMENTAL_DATA_SCREEN.md, SENSORY_SLIDER_SCREEN.md, SCA_STANDARDS.md  
**구현 상태**: ✅ 완료 (전문가급 큐핑 시스템)