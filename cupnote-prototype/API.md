# CupNote API Documentation

## 📋 Overview

CupNote 프로토타입의 내부 API 및 데이터 구조 명세서입니다.

## 🏗️ Architecture

### Global State Management
```javascript
// Main application state
const appState = {
  currentScreen: string,
  selectedMode: 'cafe' | 'brew' | 'lab',
  coffeeInfo: CoffeeInfo,
  brewSettings: BrewSettings,
  brewTimer: BrewTimer,
  labData: LabData,
  sensorySliders: SensorySliders,
  selectedFlavors: string[],
  selectedExpressions: SensoryExpressions,
  personalNote: string,
  roasterNote: string
}
```

## 📊 Data Models

### CoffeeInfo
```typescript
interface CoffeeInfo {
  cafeName: string;           // 카페 이름
  coffeeName: string;         // 커피 이름  
  temperature: 'hot' | 'iced'; // 온도
  origin?: string;            // 원산지
  variety?: string;           // 품종
  processing?: string;        // 가공방식
  roastLevel?: string;        // 로스팅 레벨
}
```

### BrewSettings
```typescript
interface BrewSettings {
  dripper: string;            // 드리퍼 종류 (v60, kalita, chemex, etc.)
  coffeeAmount: number;       // 원두량 (g)
  waterAmount: number;        // 물량 (ml)
  ratio: number;              // 비율 (15-18)
}
```

### BrewTimer
```typescript
interface BrewTimer {
  isRunning: boolean;         // 타이머 실행 상태
  startTime: number | null;   // 시작 시간 (timestamp)
  elapsed: number;            // 경과 시간 (ms)
  totalTime: number;          // 총 시간 (ms)
  laps: LapRecord[];          // 랩 기록들
}

interface LapRecord {
  number: number;             // 랩 번호 (1, 2, 3...)
  totalTime: number;          // 총 경과 시간 (ms)
  lapTime: number;            // 구간 시간 (ms)
  label: string;              // 한국어 라벨 ("뜸들이기", "1차 추출" 등)
}
```

### LabData
```typescript
interface LabData {
  brewMethod: string;         // 추출 방법
  grindSize: string;          // 분쇄도 (coarse, medium, fine, extra-fine)
  waterTemp: number;          // 물 온도 (°C)
  totalBrewTime: number;      // 총 추출 시간 (초)
  tds: number;                // TDS 값 (%)
  extractionYield: number;    // 추출 수율 (%)
}
```

### SensorySliders
```typescript
interface SensorySliders {
  body: number;               // 바디감 (0-100)
  acidity: number;            // 산미 (0-100)
  sweetness: number;          // 단맛 (0-100)
  finish: number;             // 피니시 (0-100)
  bitterness: number;         // 쓴맛 (0-100)
  balance: number;            // 균형감 (0-100)
}
```

### SensoryExpressions
```typescript
interface SensoryExpressions {
  acidity: string[];          // 산미 표현 (최대 3개)
  sweetness: string[];        // 단맛 표현 (최대 3개)
  bitterness: string[];       // 쓴맛 표현 (최대 3개)
  body: string[];             // 바디 표현 (최대 3개)
  aftertaste: string[];       // 애프터테이스트 표현 (최대 3개)
  balance: string[];          // 밸런스 표현 (최대 3개)
}
```

## 🔄 Navigation Flow

### Screen Flow Objects
```javascript
// Cafe Mode: 7 screens
const cafeScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'flavor-selection': 'coffee-info',
  'sensory-expression': 'flavor-selection',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};

// Brew Mode: 8 screens
const brewScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'brew-settings': 'coffee-info',
  'flavor-selection': 'brew-settings',
  'sensory-expression': 'flavor-selection',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};

// Lab Mode: 10 screens
const labScreenFlow = {
  'mode-selection': null,
  'coffee-info': 'mode-selection',
  'brew-settings': 'coffee-info',
  'experimental-data': 'brew-settings',
  'flavor-selection': 'experimental-data',
  'sensory-mouthfeel': 'flavor-selection',
  'sensory-expression': 'sensory-mouthfeel',
  'personal-notes': 'sensory-expression',
  'roaster-notes': 'personal-notes',
  'result': 'roaster-notes'
};
```

## 🎯 Core Functions

### Navigation
```javascript
// Screen switching
function switchScreen(screenId: string): void

// Back navigation
function goBack(): void

// Get current screen flow based on mode
function getCurrentScreenFlow(): ScreenFlow
```

### Timer Functions
```javascript
// Timer controls
function startBrewTimer(): void
function pauseBrewTimer(): void
function resumeBrewTimer(): void
function stopBrewTimer(): void
function resetBrewTimer(): void

// Lap recording
function recordLap(): void
function getLapLabel(lapNumber: number): string
function addLapToDisplay(lap: LapRecord): void

// Timer utilities
function updateTimerDisplay(): void
function formatTime(seconds: number): string
```

### Data Management
```javascript
// Recipe management
function savePersonalRecipe(): void
function loadPersonalRecipe(): void

// Form data collection
function nextFromCoffeeInfo(): void
function nextFromBrewSettings(): void
function nextFromFlavorSelection(): void
function nextFromSensoryExpression(): void
function nextFromPersonalNotes(): void

// Result calculation
function calculateMatchScore(): number
function showResult(): void
```

### Sensory System
```javascript
// Flavor selection
function toggleFlavor(element: HTMLElement): void

// Sensory expressions
function loadSensoryOptions(category: string): void
function toggleExpression(category: string, expression: string, element: HTMLElement): void

// Lab Mode sliders
function updateSlider(parameter: string, value: string): void
```

## 🗃️ Local Storage

### Storage Keys
```javascript
const STORAGE_KEYS = {
  personalRecipe: 'personalRecipe',        // 개인 레시피 저장
  tastingHistory: 'tastingHistory',        // 테이스팅 기록 (Phase 2)
  userPreferences: 'userPreferences'       // 사용자 설정 (Phase 2)
};
```

### Personal Recipe Storage
```typescript
interface PersonalRecipe {
  dripper: string;
  coffeeAmount: number;
  waterAmount: number;
  ratio: number;
  savedAt: string;                         // ISO timestamp
}

// Usage
localStorage.setItem('personalRecipe', JSON.stringify(recipe));
const recipe = JSON.parse(localStorage.getItem('personalRecipe'));
```

## 🎨 UI Components

### Sensory Options
```javascript
// Korean sensory expressions by category
const sensoryExpressions = {
  acidity: ['싱그러운', '발랄한', '톡 쏘는', '상큼한', '과일 같은', '와인 같은', '시트러스 같은'],
  sweetness: ['농밀한', '달콤한', '꿀 같은', '캐러멜 같은', '설탕 같은', '당밀 같은', '메이플 시럽 같은'],
  bitterness: ['스모키한', '카카오 같은', '허브 느낌의', '고소한', '견과류 같은', '다크 초콜릿 같은', '로스티한'],
  body: ['크리미한', '벨벳 같은', '묵직한', '가벼운', '실키한', '오일리한', '물 같은'],
  aftertaste: ['깔끔한', '길게 남는', '산뜻한', '여운이 좋은', '드라이한', '달콤한 여운의', '복합적인'],
  balance: ['조화로운', '부드러운', '자연스러운', '복잡한', '단순한', '안정된', '역동적인']
};
```

### Progress Tracking
```javascript
// Progress percentages by screen
const progressPercentages = {
  'mode-selection': 14,
  'coffee-info': 29,
  'brew-settings': 37,
  'experimental-data': 35,
  'flavor-selection': 43,
  'sensory-mouthfeel': 52,
  'sensory-expression': 57,
  'personal-notes': 71,
  'roaster-notes': 86,
  'result': 100
};
```

## ⚡ Performance Considerations

### Memory Management
- Global state object는 단일 인스턴스로 관리
- Timer interval은 적절히 cleanup
- DOM 이벤트 리스너는 중복 방지

### Optimization Patterns
```javascript
// Efficient DOM querying
const elements = {
  timerDisplay: document.getElementById('timer-display'),
  lapList: document.getElementById('lap-list'),
  // ... cache frequently used elements
};

// Debounced user input
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

## 🔮 Future API Extensions

### Phase 2: PWA Features
```typescript
// Service Worker API
interface PWAFeatures {
  offline: boolean;
  caching: CacheStrategy;
  notifications: NotificationConfig;
}
```

### Phase 3: Advanced Features
```typescript
// Photo upload
interface Photo {
  id: string;
  url: string;
  timestamp: string;
  tastingId: string;
}

// Social sharing
interface ShareData {
  coffee: string;
  score: number;
  expressions: string[];
  photo?: string;
}
```

---

**API Version**: 1.0.0  
**Last Updated**: 2025-07-28  
**Compatibility**: CupNote Prototype v1.0.0