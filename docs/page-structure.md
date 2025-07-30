# CupNote 페이지 구조 및 네비게이션 설계

## 📱 전체 앱 구조

### **화면 플로우 개요**

```
🏠 Mode Selection
    ↓ (Cafe/Brew/Lab 선택)
☕ Coffee Info
    ↓ (Cafe: 바로) ↓ (Brew/Lab: 추출 설정)
⚙️ Brew Settings (Brew/Lab Mode만)
    ↓ (Lab Mode만)
🔬 Experimental Data (Lab Mode만)
    ↓
🎯 Flavor Selection
    ↓ (Lab Mode만)
👅 Sensory Mouthfeel (Lab Mode만)
    ↓
💭 Sensory Expression
    ↓
📝 Personal Notes
    ↓
📖 Roaster Notes
    ↓
🎉 Result
```

## 📄 상세 페이지 구조

### **1. Mode Selection (모드 선택)**

- **ID**: `mode-selection`
- **Purpose**: 사용자 의도에 따른 테이스팅 모드 선택
- **Components**:
  - App Header (제목, 부제목)
  - 3개 Mode Cards (Cafe/Brew/Lab)
  - 각 카드: 아이콘, 제목, 설명, 소요시간
- **Navigation**: `selectMode(type)` → Coffee Info

### **2. Coffee Info (커피 정보)**

- **ID**: `coffee-info`
- **Purpose**: 기본 커피 정보 입력
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 29%)
  - 기본 정보: 카페명, 커피명, 온도선택
  - 상세 정보 (접힘): 원산지, 품종, 가공방식, 로스팅
- **Navigation**:
  - `goBack()` → Mode Selection
  - `nextFromCoffeeInfo()` → Brew Settings (Brew/Lab) | Flavor Selection (Cafe)

### **3. Brew Settings (추출 설정)**

- **ID**: `brew-settings`
- **Purpose**: Brew/Lab 모드 추출 설정
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 37%)
  - 드리퍼 선택 (6개 옵션)
  - 레시피 설정: 원두량 다이얼, 비율 프리셋, 물량 표시
  - 추출 타이머: 시작/완료/랩/리셋
  - 개인 레시피: 불러오기/저장
- **Navigation**:
  - `goBack()` → Coffee Info
  - `nextFromBrewSettings()` → Experimental Data (Lab) | Flavor Selection (Brew)

### **4. Experimental Data (실험 데이터)**

- **ID**: `experimental-data`
- **Purpose**: Lab 모드 전용 상세 실험 데이터
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 35%)
  - 추출 방법 선택 (4개)
  - 분쇄도 선택 (4단계)
  - 실험 변수: 물온도, 추출시간, TDS, 추출수율
- **Navigation**:
  - `goBack()` → Brew Settings
  - `nextFromExperimentalData()` → Flavor Selection

### **5. Flavor Selection (향미 선택)**

- **ID**: `flavor-selection`
- **Purpose**: 카테고리별 향미 태그 선택 (최대 5개)
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 50%)
  - 4개 카테고리: Fruity, Nutty, Chocolate, Floral
  - 선택 카운터 (0/5)
- **Navigation**:
  - `goBack()` → 이전 화면 (모드별 다름)
  - `nextFromFlavorSelection()` → Sensory Mouthfeel (Lab) | Sensory Expression (Cafe/Brew)

### **6. Sensory Mouthfeel (감각 평가)**

- **ID**: `sensory-mouthfeel`
- **Purpose**: Lab 모드 전용 6개 파라미터 정량 평가
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 52%)
  - 6개 슬라이더: Body, Acidity, Sweetness, Finish, Bitterness, Balance
  - 각 슬라이더: 라벨, 현재값, 최소/최대 설명
- **Navigation**:
  - `goBack()` → Flavor Selection
  - `nextFromSensoryMouthfeel()` → Sensory Expression

### **7. Sensory Expression (감각 표현)**

- **ID**: `sensory-expression`
- **Purpose**: 한국식 감각 표현 선택
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 62%)
  - 6개 탭: 산미, 단맛, 쓴맛, 바디, 애프터, 밸런스
  - 각 카테고리별 한국어 표현 옵션
- **Navigation**:
  - `goBack()` → 이전 화면 (모드별 다름)
  - `nextFromSensoryExpression()` → Personal Notes

### **8. Personal Notes (개인 메모)**

- **ID**: `personal-notes`
- **Purpose**: 개인적인 기록 및 메모
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 75%)
  - 8개 퀵 태그 (감정/경험 기반)
  - 자유 텍스트 영역 (200자 제한)
  - 글자 수 카운터
- **Navigation**:
  - `goBack()` → Sensory Expression
  - `nextFromPersonalNotes()` → Roaster Notes
  - `skipPersonalNotes()` → Roaster Notes

### **9. Roaster Notes (로스터 노트)**

- **ID**: `roaster-notes`
- **Purpose**: 공식 테이스팅 노트 입력 및 매칭
- **Components**:
  - Screen Header (뒤로가기, 제목, 진행률 87%)
  - Match Score 설명
  - 텍스트 입력 (200자)
  - 도움말 정보
- **Navigation**:
  - `goBack()` → Personal Notes
  - `submitTasting()` → Result
  - `skipRoasterNotes()` → Result

### **10. Result (결과 화면)**

- **ID**: `result`
- **Purpose**: 테이스팅 결과 표시 및 액션
- **Components**:
  - Screen Header (닫기, 제목)
  - 결과 카드: 커피명, 카페명, 선택 표현들
  - Match Score (원형 차트)
  - 액션 버튼: 새 기록, 공유
  - 성취 팝업 (첫 기록 등)
- **Navigation**:
  - `resetApp()` → Mode Selection
  - `shareResult()` → 공유 기능

## 🧭 네비게이션 패턴

### **공통 네비게이션 요소**

- **뒤로가기 버튼** (`←`): 모든 화면 (첫 화면 제외)
- **진행률 바**: 전체 과정 대비 현재 위치 표시
- **다음 버튼**: 필수 입력 완료 시 활성화

### **모드별 화면 플로우**

#### **Cafe Mode (간편 모드)**

```
Mode Selection → Coffee Info → Flavor Selection → Sensory Expression → Personal Notes → Roaster Notes → Result
```

- **건너뛰는 화면**: Brew Settings, Experimental Data, Sensory Mouthfeel
- **소요시간**: 3-5분

#### **Brew Mode (홈브루 모드)**

```
Mode Selection → Coffee Info → Brew Settings → Flavor Selection → Sensory Expression → Personal Notes → Roaster Notes → Result
```

- **건너뛰는 화면**: Experimental Data, Sensory Mouthfeel
- **소요시간**: 5-8분

#### **Lab Mode (전문가 모드)**

```
Mode Selection → Coffee Info → Brew Settings → Experimental Data → Flavor Selection → Sensory Mouthfeel → Sensory Expression → Personal Notes → Roaster Notes → Result
```

- **모든 화면 포함**
- **소요시간**: 8-12분

### **상태 관리**

- **현재 화면**: `.screen.active` 클래스로 표시
- **데이터 저장**: 각 단계별 JavaScript 객체에 저장
- **진행률 계산**: 모드별 총 단계 대비 현재 위치

### **반응형 설계**

- **모바일 컨테이너**: `.mobile-container`로 스마트폰 뷰포트 시뮬레이션
- **터치 최적화**: 버튼 크기, 간격 모바일 기준
- **스크롤 최적화**: 긴 화면은 세로 스크롤 지원

## 🎨 UI/UX 설계 원칙

- **단계별 진행**: 한 번에 하나의 작업만 집중
- **시각적 피드백**: 선택 상태, 진행률 명확 표시
- **직관적 아이콘**: 텍스트 없이도 이해 가능한 아이콘 사용
- **한국어 최적화**: 한국인 커피 문화에 맞는 용어 사용
