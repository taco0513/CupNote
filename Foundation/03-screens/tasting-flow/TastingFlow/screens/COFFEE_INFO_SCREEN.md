# CoffeeInfoScreen - 커피 정보 입력 화면

> 모든 TastingFlow 모드의 공통 기본 정보 입력 화면

## 📱 화면 개요

**구현 파일**: `[screens]/tasting/CoffeeInfoScreen`
**역할**: 커피 기본 정보 수집 (카페명, 커피명, 온도, 선택 정보)
**소요시간**: 1-2분
**진행률**: 29% (전체 TastingFlow 중)

## 🎯 기능 정의

### 기술적 목표

- 테이스팅 기록의 기본 메타데이터 수집
- 자동완성 기능을 통한 입력 효율성 향상
- 일관된 데이터 품질 확보

### 핵심 기능

- 빠르고 정확한 정보 입력 인터페이스
- 이전 기록 기반 자동완성 시스템
- 필수/선택 정보 구분을 통한 UX 최적화

## 🏗️ UI/UX 구조

### 화면 레이아웃

```
Header: ProgressBar (29%) + "커피 정보"
├── 필수 정보 섹션
│   ├── 카페/로스터 이름 (AutocompleteInput)
│   ├── 커피 이름 (AutocompleteInput)
│   └── 온도 선택 (Hot/Iced Toggle)
├── 선택 정보 섹션 (접기/펼치기)
│   ├── 원산지 (Input)
│   ├── 품종 (Input)
│   ├── 가공방식 (Input)
│   └── 로스팅 레벨 (Input)
└── Footer: "다음" Button (플로팅)
```

### 디자인 원칙

- **정보 위계**: 필수 정보 우선 표시, 선택 정보는 폴더블
- **자동완성**: 기존 데이터 기반 스마트 제안
- **시각적 구분**: 필수/선택 영역 명확한 구분
- **진행 표시**: 상단 ProgressBar로 전체 진행상황 안내

## 💾 데이터 처리

### 입력 데이터

```typescript
interface ModeSelection {
  mode: 'cafe' | 'home_cafe' | 'lab'
}
```

### 출력 데이터

```typescript
interface CoffeeInfo {
  // 필수 정보
  cafe_name: string // 카페/로스터 이름
  coffee_name: string // 커피 이름
  temperature: 'hot' | 'iced' // 온도

  // 선택 정보
  origin?: string // 원산지
  variety?: string // 품종
  processing?: string // 가공방식
  roast_level?: string // 로스팅 레벨

  // 메타데이터
  timestamp: Date
  mode: TastingMode
}
```

### 데이터 소스

- **RealmService**: 로컬 자동완성 데이터
- **SupabaseSearch**: 클라우드 기반 커피/로스터 검색
- **UserHistory**: 사용자 입력 기록

## 🔄 사용자 인터랙션

### 주요 액션

1. **자동완성 선택**: 드롭다운에서 기존 데이터 선택
2. **수동 입력**: 새로운 정보 직접 입력
3. **온도 토글**: Hot/Iced 선택
4. **선택정보 토글**: 추가 정보 섹션 펼치기/접기
5. **다음 버튼**: 다음 화면으로 이동

### 인터랙션 플로우

```
정보 입력 → 자동완성 확인 → 필수 정보 검증 → 다음 화면 이동
```

### 유효성 검증

- **필수 필드**: 카페명, 커피명 비어있음 체크
- **문자 제한**: 각 필드별 최대 길이 검증
- **중복 검사**: 동일한 커피 중복 기록 방지 (선택사항)

## 📊 자동완성 시스템

### 로컬 데이터 (RealmService)

```typescript
// 사용자 기록 기반 제안
const suggestions = await RealmService.getFrequentEntries({
  field: 'cafe_name',
  limit: 5,
  user_id: currentUser.id,
})
```

### 클라우드 데이터 (Supabase)

```typescript
// 전체 사용자 데이터 기반 제안
const roasters = await searchRoasters(query)
const coffees = await searchCoffees(roaster_id, query)
```

### 하이브리드 접근

1. **로컬 우선**: 사용자 기록 우선 표시
2. **클라우드 보완**: 로컬 데이터 부족 시 클라우드 검색
3. **오프라인 지원**: 네트워크 없어도 로컬 데이터로 동작

## 🎨 UI 컴포넌트

### 핵심 컴포넌트

- **AutocompleteInput**: 자동완성 입력 필드
- **ToggleButton**: Hot/Iced 온도 선택
- **CollapsibleSection**: 선택정보 접기/펼치기
- **ProgressBar**: 상단 진행 표시
- **FloatingButton**: 하단 다음 버튼

### Tamagui 스타일링

```typescript
const Container = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
})

const ToastContainer = styled(YStack, {
  paddingHorizontal: '$md',
  paddingVertical: '$sm',
  backgroundColor: '$gray2',
})
```

## 📱 반응형 고려사항

### 키보드 처리

- **KeyboardAvoidingView**: iOS/Android 키보드 대응
- **ScrollView**: 키보드 표시 시 스크롤 가능
- **Focus Management**: 다음 필드 자동 이동

### 화면 크기별 대응

- **작은 화면**: 선택정보 기본 접힌 상태
- **큰 화면**: 모든 정보 펼친 상태로 표시
- **가로모드**: 2열 배치 고려

## 🔗 네비게이션

### 이전 화면

- **ModeSelectionScreen**: 모드 선택 완료 후 진입

### 다음 화면 (모드별 분기)

- **Cafe Mode**: `UnifiedFlavorScreen`
- **HomeCafe Mode**: `HomeCafeScreen`
- **Lab Mode**: `ExperimentalDataScreen`

### 네비게이션 로직

```typescript
const handleNext = () => {
  const { mode } = tastingStore
  switch (mode) {
    case 'cafe':
      navigation.navigate('UnifiedFlavor')
      break
    case 'home_cafe':
      navigation.navigate('HomeCafe')
      break
    case 'lab':
      navigation.navigate('ExperimentalData')
      break
  }
}
```

## 📈 성능 최적화

### 자동완성 최적화

- **Debouncing**: 300ms 지연으로 과도한 검색 방지
- **Caching**: 최근 검색 결과 캐싱
- **Lazy Loading**: 스크롤 시 추가 결과 로딩

### 메모리 관리

- **컴포넌트 언마운트**: 검색 상태 정리
- **이미지 최적화**: 커피 이미지 지연 로딩

## 🧪 테스트 시나리오

### 기능 테스트

1. **자동완성**: 입력 시 적절한 제안 표시
2. **필수 검증**: 빈 필드로 다음 버튼 클릭 시 에러
3. **모드 분기**: 선택된 모드에 따른 올바른 네비게이션

### 사용성 테스트

1. **첫 사용자**: 자동완성 없이도 원활한 입력
2. **재방문자**: 이전 기록 기반 빠른 완성
3. **오프라인**: 네트워크 없이도 기본 기능 동작

### 성능 테스트

1. **응답 속도**: 자동완성 제안 300ms 이내
2. **메모리 사용량**: 장시간 사용 시 메모리 누수 없음

## 🚀 기술적 확장점

### 향후 개선사항

- **사진 첨부**: 커피/카페 이미지 업로드 기능
- **위치 서비스**: GPS API 기반 위치 자동 감지
- **바코드 스캔**: QR/바코드 스캐너 API 연동

### 고급 기능

- **OCR 연동**: 텍스트 인식 API 통합
- **데이터 연동**: 외부 커피 데이터베이스 API 연결
- **추천 시스템**: 머신러닝 기반 추천 알고리즘

## 🐛 알려진 이슈

### 현재 제한사항

- 자동완성 데이터 품질 의존성
- 오프라인 시 제한된 제안
- 길고 복잡한 커피명 UI 최적화 필요

### 해결 예정

- 사용자 피드백 기반 데이터 품질 개선
- 로컬 캐시 확장
- 긴 텍스트 처리 UI 개선

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: MODE_SELECTION_SCREEN.md, HOMECAFE_SCREEN.md  
**구현 상태**: ✅ 완료
