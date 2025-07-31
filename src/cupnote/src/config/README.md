# Config System 사용 가이드

이 폴더는 CupNote 앱의 모든 설정과 라벨을 중앙집중화하여 관리합니다.

## 주요 파일

### 1. `tasting-modes.config.ts`
- 4가지 모드(Quick, Cafe, HomeCafe, Pro)의 모든 설정
- 모드 이름, 라벨, 아이콘, 색상, 단계 수 등 관리
- 모드 이름을 변경하려면 이 파일만 수정하면 됩니다

### 2. `ui-labels.config.ts`
- UI에서 사용되는 모든 텍스트 라벨
- 네비게이션, 폼 필드, 상태 메시지 등
- 다국어 지원 시 이 파일을 확장하면 됩니다

### 3. `coffee-terms.config.ts`
- 커피 관련 전문 용어 관리
- 로스팅 레벨, 추출 방법, 분쇄도, 가공 방식 등
- 드롭다운 메뉴나 선택 옵션에서 사용

## 사용 예시

### 모드 정보 가져오기
```typescript
import { TASTING_MODES_CONFIG, getModeById } from '@/config'

// 특정 모드 정보
const cafeMode = getModeById('cafe')
console.log(cafeMode.labelKr) // "카페 모드"

// 모든 모드 목록
const allModes = getAllModes()
```

### UI 라벨 사용
```typescript
import { UI_LABELS, getLabel } from '@/config'

// 직접 접근
const saveButton = UI_LABELS.navigation.save // "저장"

// 헬퍼 함수 사용
const nextButton = getLabel('navigation', 'next') // "다음"
```

### 커피 용어 사용
```typescript
import { COFFEE_TERMS, getRoastLevelOptions } from '@/config'

// 로스팅 레벨 옵션
const roastOptions = getRoastLevelOptions()
// [{ id: 'light', label: '라이트 로스트', ... }, ...]

// 특정 용어 라벨
const methodLabel = getBrewMethodLabel('v60') // "V60"
```

## 새로운 설정 추가하기

1. 해당 config 파일에 새로운 항목 추가
2. 필요한 경우 타입 정의 업데이트
3. 헬퍼 함수 추가 (선택사항)
4. index.ts에서 export 확인

## 장점

- **일관성**: 앱 전체에서 동일한 라벨과 설정 사용
- **유지보수**: 한 곳에서 모든 텍스트와 설정 관리
- **타입 안전성**: TypeScript 자동완성과 타입 체크
- **확장성**: 새로운 모드나 언어 추가 용이

## 마이그레이션 가이드

기존 하드코딩된 텍스트를 config 시스템으로 전환:

```typescript
// Before
<button>다음</button>

// After
import { UI_LABELS } from '@/config'
<button>{UI_LABELS.navigation.next}</button>
```