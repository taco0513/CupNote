# Cafe Mode Workflow - 카페 모드 워크플로우

> 카페 방문 시 간편한 커피 테이스팅 기록을 위한 7단계 워크플로우

## 📱 워크플로우 개요

**목적**: 카페에서 커피를 마시며 빠르고 간편하게 테이스팅 기록  
**대상**: 카페 방문자, 커피 입문자  
**소요시간**: 3-5분  
**특징**: 필수 정보만 수집, 복잡한 설정 제외

## 🔄 7단계 워크플로우

### 1단계: ModeSelectionScreen
```
진입 → Cafe Mode 선택 → 다음
```
- **입력**: 모드 선택 (Cafe)
- **소요시간**: 5초
- **다음 화면**: CoffeeInfoScreen

### 2단계: CoffeeInfoScreen  
```
카페정보 → 커피정보 → 온도선택 → 다음
```
- **필수 입력**: 카페명, 커피명, 온도(Hot/Iced)
- **선택 입력**: 원산지, 품종, 가공방식, 로스팅 레벨
- **소요시간**: 30-60초
- **다음 화면**: UnifiedFlavorScreen

### 3단계: UnifiedFlavorScreen
```
카테고리 탐색 → 향미 선택 (최대 5개) → 다음  
```
- **입력**: 향미 선택 (최대 5개)
- **카테고리**: Fruity, Nutty, Chocolate, Spicy, Floral, Other
- **소요시간**: 60-90초
- **다음 화면**: SensoryExpressionScreen

### 4단계: SensoryExpressionScreen
```
카테고리별 감각 표현 선택 (최대 3개/카테고리) → 다음
```
- **입력**: 한국어 감각 표현 (6개 카테고리, 44개 표현)
- **제한**: 카테고리당 최대 3개
- **소요시간**: 60-120초
- **다음 화면**: PersonalCommentScreen

### 5단계: PersonalCommentScreen
```
개인 코멘트 작성 (선택사항) → 다음
```
- **입력**: 자유 텍스트 (최대 200자)
- **보조도구**: 빠른 표현, 감정 태그
- **소요시간**: 30-60초
- **다음 화면**: RoasterNotesScreen

### 6단계: RoasterNotesScreen
```
로스터 노트 입력 → Match Score 계산 → 완료
```
- **입력**: 로스터/카페 제공 테이스팅 노트
- **처리**: 실시간 Match Score 계산
- **소요시간**: 30-60초
- **다음 화면**: ResultScreen

### 7단계: ResultScreen
```
결과 확인 → 저장 완료 → 홈으로
```
- **표시**: 커피 정보, 선택한 향미/표현, Match Score
- **액션**: 공유, 즐겨찾기, 홈 복귀
- **소요시간**: 30-60초

## 🚫 제외되는 화면들

### HomeCafeScreen - 건너뛰기
- **이유**: 카페에서는 추출 레시피 정보 불필요
- **대신**: CoffeeInfoScreen에서 바로 UnifiedFlavorScreen으로

### ExperimentalDataScreen - 건너뛰기  
- **이유**: 과학적 측정 데이터 수집 불가
- **대신**: CoffeeInfoScreen에서 바로 UnifiedFlavorScreen으로

### SensorySliderScreen - 건너뛰기
- **이유**: 정밀한 수치 평가보다 직관적 표현 우선
- **대신**: UnifiedFlavorScreen에서 바로 SensoryExpressionScreen으로

## 💾 데이터 수집 명세

### 필수 데이터
```typescript
interface CafeModeData {
  // 기본 정보
  mode: 'cafe';
  cafe_name: string;
  coffee_name: string; 
  temperature: 'hot' | 'iced';
  
  // 향미 & 감각
  selected_flavors: FlavorNote[];        // 최대 5개
  sensory_expressions: SensoryExpressions; // 6개 카테고리
  
  // 코멘트
  personal_comment?: string;             // 선택사항
  roaster_notes?: string;               // Match Score 계산용
  
  // 계산 결과
  match_score?: MatchScore;             // 로스터 노트 있는 경우
}
```

### 선택적 데이터
```typescript
interface CafeModeOptionalData {
  // 커피 상세 정보
  origin?: string;
  variety?: string;
  processing?: string;
  roast_level?: string;
  
  // 컨텍스트
  location?: LocationData;
  companion?: CompanionType;
  mood?: string;
}
```

## 🔄 네비게이션 로직

### 조건부 네비게이션
```typescript
const navigateFromCoffeeInfo = () => {
  const { mode } = tastingStore;
  
  if (mode === 'cafe') {
    // HomeCafe, ExperimentalData 화면 건너뛰기
    navigation.navigate('UnifiedFlavor');
  }
};

const navigateFromUnifiedFlavor = () => {
  const { mode } = tastingStore;
  
  if (mode === 'cafe') {
    // SensorySlider 화면 건너뛰기  
    navigation.navigate('SensoryExpression');
  }
};
```

### 진행률 계산
```typescript
const getCafeModeProgress = (currentScreen: string): number => {
  const screens = [
    'ModeSelection',     // 14%
    'CoffeeInfo',       // 29%
    'UnifiedFlavor',    // 43%
    'SensoryExpression', // 57%
    'PersonalComment',   // 71%
    'RoasterNotes',     // 86%
    'Result'            // 100%
  ];
  
  const currentIndex = screens.indexOf(currentScreen);
  return Math.round(((currentIndex + 1) / screens.length) * 100);
};
```

## ⚡ 성능 최적화

### 빠른 완료를 위한 최적화
- **자동완성**: 카페명, 커피명 자동완성으로 입력 시간 단축
- **기본값**: 온도 Hot 기본 선택
- **스킵 가능**: 선택 정보들은 모두 스킵 가능
- **원터치**: 자주 사용하는 향미/표현 상단 배치

### 메모리 최적화
- **지연 로딩**: 사용하지 않는 HomeCafe/Lab 컴포넌트 로딩 안함
- **캐시**: 이전 입력 기록 캐시로 빠른 재입력 지원
- **가비지 컬렉션**: 사용하지 않는 화면 상태 정리

## 🧪 테스트 시나리오

### 기본 시나리오 - 완전 입력
1. Cafe Mode 선택
2. 카페명: "블루보틀 서울" 입력
3. 커피명: "에스프레소 블렌드" 입력  
4. 온도: Hot 선택
5. 향미: Chocolate, Caramel, Nutty 선택
6. 감각 표현: 각 카테고리에서 1-2개씩 선택
7. 개인 코멘트: "아침에 마시기 좋다" 입력
8. 로스터 노트: "다크 초콜릿, 캐러멜" 입력
9. 결과 확인 후 저장

**예상 소요시간**: 4-5분

### 최소 입력 시나리오
1. Cafe Mode 선택
2. 카페명, 커피명, 온도만 입력
3. 향미 1-2개만 선택
4. 감각 표현 3-4개만 선택
5. 코멘트, 로스터 노트 건너뛰기
6. 결과 저장

**예상 소요시간**: 2-3분

### 에러 케이스
- **필수 정보 누락**: 카페명/커피명 미입력 시 경고
- **네트워크 오류**: 오프라인에서도 정상 동작
- **중간 이탈**: 임시 저장으로 데이터 보존

## 🎯 사용자 경험 목표

### 편의성
- **빠른 완료**: 5분 이내 완료 가능
- **직관적 UI**: 설명 없이도 사용 가능
- **실수 방지**: 필수 항목만 최소화

### 정확성  
- **자동완성**: 입력 실수 방지
- **실시간 검증**: 입력 즉시 유효성 검사
- **Match Score**: 평가 정확도 피드백

### 만족감
- **즉시 피드백**: 각 단계별 진행률 표시
- **성취감**: 완료 시 축하 메시지
- **연결감**: 다음 테이스팅 유도

## 🔧 기술적 제약사항

### 화면 분기 처리
- **조건부 렌더링**: 모드에 따른 화면 건너뛰기 처리
- **상태 관리**: 건너뛴 화면의 데이터는 undefined 유지
- **네비게이션**: 올바른 다음 화면으로 이동

### 데이터 일관성
- **타입 안전성**: CafeModeData 인터페이스 준수
- **필드 검증**: 필수/선택 필드 구분
- **저장 형식**: 다른 모드와 호환 가능한 데이터 구조

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: MODE_SELECTION_SCREEN.md, HOMECAFE_MODE_WORKFLOW.md, LAB_MODE_WORKFLOW.md  
**구현 상태**: ✅ 완료