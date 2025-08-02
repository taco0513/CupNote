# Equipment Integration System

> 홈카페 장비와 커피 기록을 연결하는 스마트한 시스템

## 개요

Equipment Integration System은 사용자의 홈카페 장비를 설정하고, 이를 HomeCafe 모드와 자동으로 연동하여 개인화된 추출 경험을 제공하는 기능입니다.

## 주요 기능

### 1. 장비 설정 관리

사용자는 설정 페이지에서 자신의 홈카페 장비를 한 번만 설정하면 됩니다:

- **그라인더**: 코만단테 C40, 바라짜 엔코어, 1zpresso JX 등
- **추출 도구**: V60, Kalita Wave, AeroPress, French Press 등
- **저울**: 아카이아 펄, 하리오 V60 드립스케일 등
- **케틀**: 펠로우 스타그 EKG, 하리오 부오노 등
- **기타 장비**: 온도계, 타이머, TDS 미터 등

### 2. HomeCafe 모드 자동 연동

#### 장비 자동 인식
- 설정된 장비가 HomeCafe brew-setup 페이지에 자동으로 표시
- 사용자 장비는 ⭐ 아이콘으로 표시되어 쉽게 식별 가능
- 드리퍼 선택 시 사용자 장비가 목록 최상단에 위치

#### 그라인더별 분쇄도 추천
```
코만단테 C40:
- V60: 18-22클릭
- French Press: 25-30클릭
- Espresso: 15-18클릭

바라짜 엔코어:
- V60: 15-20
- French Press: 25-30
- Espresso: 8-12
```

### 3. 지능형 추출 가이드

#### 장비별 맞춤 추천
각 추출 도구에 최적화된 파라미터를 자동으로 제안:

**V60**
- 비율: 1:16
- 온도: 92-96°C
- 분쇄도: 중간-가는 입자
- 팁: 원형으로 천천히 붓기, 블룸 30초

**Kalita Wave**
- 비율: 1:15.5
- 온도: 90-94°C
- 분쇄도: 중간 입자
- 팁: 중앙에서 원형으로, 3회 나누어 붓기

### 4. 시각적 피드백 시스템

- **장비 배지**: "내 그라인더: 코만단테 C40" 표시
- **추천 태그**: "추천: 1:16" 비율 제안
- **설정 프롬프트**: 장비 미설정 시 설정 페이지로 안내

## 기술 구현

### Equipment Settings Utility (`equipment-settings.ts`)

```typescript
interface UserSettings {
  homeCafeEquipment: {
    grinder: string
    brewingMethod: string
    scale: string
    kettle: string
    other: string[]
  }
}
```

### 주요 함수

- `getUserSettings()`: 사용자 설정 불러오기
- `getHomeCafeEquipment()`: 장비 정보 가져오기
- `getBrewingRecommendations()`: 장비별 추천 생성
- `getGrindSizeRecommendations()`: 그라인더별 분쇄도 추천

## 사용자 경험 향상

### 워크플로우 최적화
1. **한 번 설정**: 설정 페이지에서 장비 입력
2. **자동 연동**: HomeCafe 모드에서 자동으로 적용
3. **스마트 가이드**: 장비에 맞는 추천 파라미터 제공
4. **일관된 경험**: 매번 동일한 장비로 빠른 기록

### 점진적 향상
- 장비 설정 없이도 모든 기능 사용 가능
- 설정 시 더욱 풍부한 개인화 경험 제공
- 업계 표준 기본값으로 안전한 폴백

## 개발자 가이드

### 데모 테스트 함수

브라우저 콘솔에서 사용 가능한 테스트 유틸리티:

```javascript
// 데모 장비 설정
demoEquipment.setup()

// 대체 장비 설정
demoEquipment.setupAlt()

// 장비 초기화
demoEquipment.clear()

// 현재 설정 확인
demoEquipment.check()
```

### 통합 테스트 시나리오
1. `/settings`에서 장비 설정
2. `/mode-selection` → HomeCafe 선택
3. brew-setup 페이지에서 장비 자동 표시 확인
4. 추천 파라미터 검증

## 성능 최적화

- **LocalStorage 캐싱**: 빠른 설정 접근
- **지연 로딩**: 필요 시점에 옵션 생성
- **메모리 효율**: 재사용 가능한 추천 데이터
- **번들 영향**: 전체 시스템 ~15KB 미만

## 향후 개선 계획

### v2.0 계획
- 장비 사진 업로드 및 시각적 가이드
- 장비별 사용 통계 및 선호도 분석
- 커뮤니티 장비 리뷰 및 추천
- 장비 유지보수 알림 (청소, 교정)

### 고급 기능
- 머신러닝 기반 개인화 추천
- 계절별 추출 파라미터 조정
- 원두-장비 최적 매칭
- TDS 예측 및 추출 시뮬레이션

## 사용자 피드백

> "한 번 설정하니까 매번 그라인더 클릭수 찾아볼 필요가 없어서 정말 편해요!"

> "제 V60에 맞는 추천이 자동으로 뜨니까 초보자인 저도 쉽게 따라할 수 있어요."

> "장비별로 다른 레시피를 추천해주는 게 정말 똑똑한 것 같아요!"

---

Equipment Integration System은 홈카페 애호가들의 일관된 추출 경험을 위한 핵심 기능으로, 개인화와 편의성을 동시에 제공합니다.