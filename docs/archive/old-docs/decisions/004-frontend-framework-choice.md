# Frontend Framework 선택: Vue.js vs React

**날짜**: 2025-01-28  
**작성자**: AI Assistant  
**상태**: 검토 중

## 📊 프로젝트 특성 분석

### 현재 프로토타입

- **언어**: Vanilla JavaScript
- **구조**: 단일 HTML 파일 (690줄)
- **상태 관리**: 전역 변수 (currentData, selectedFlavors 등)
- **스타일**: CSS Design Tokens + Components
- **화면 전환**: DOM 조작 방식

### CupNote 요구사항

1. **다단계 폼** (8개 화면)
2. **복잡한 상태 관리** (테이스팅 데이터)
3. **오프라인 우선**
4. **모바일 최적화**
5. **한국어 중심**

## 🔍 Vue.js vs React 비교

### Vue.js 3

**장점**:

- ✅ **학습 곡선 완만**: HTML/CSS/JS 구조와 유사
- ✅ **템플릿 문법**: 프로토타입 HTML 구조 재사용 용이
- ✅ **한국 커뮤니티 활발**: 한국어 자료 풍부
- ✅ **Composition API**: React Hooks와 유사한 로직 재사용
- ✅ **번들 크기 작음**: ~34KB (React ~45KB)
- ✅ **양방향 바인딩**: 폼 처리 간편

**단점**:

- ❌ 생태계가 React보다 작음
- ❌ 기업 채용 시장 작음
- ❌ Capacitor 예제 적음

### React 18

**장점**:

- ✅ **거대한 생태계**: 라이브러리/컴포넌트 풍부
- ✅ **Capacitor 지원 우수**: 공식 문서 많음
- ✅ **TypeScript 지원 완벽**
- ✅ **기업 표준**: 취업/협업 유리
- ✅ **React Native 전환 가능성**

**단점**:

- ❌ 학습 곡선 가파름
- ❌ 보일러플레이트 코드 많음
- ❌ 번들 크기 큼
- ❌ 프로토타입 재사용 어려움

## 💡 프로토타입 코드 분석

### 현재 구조

```javascript
// 전역 상태
let currentMode = null
let currentData = {
  coffeeInfo: {},
  brewSettings: {},
  selectedFlavors: [],
  sensoryExpressions: {},
  // ...
}

// 화면 전환
function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
  document.getElementById(screenId).classList.add('active')
}
```

### Vue.js로 변환 시

```vue
<template>
  <div class="screen" v-if="currentScreen === 'mode-selection'">
    <!-- 기존 HTML 구조 그대로 활용 -->
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const currentMode = ref(null)
const currentData = reactive({
  coffeeInfo: {},
  brewSettings: {},
  selectedFlavors: [],
  sensoryExpressions: {},
})

const showScreen = screenId => {
  currentScreen.value = screenId
}
</script>
```

### React로 변환 시

```jsx
import { useState } from 'react'

function App() {
  const [currentMode, setCurrentMode] = useState(null)
  const [currentData, setCurrentData] = useState({
    coffeeInfo: {},
    brewSettings: {},
    selectedFlavors: [],
    sensoryExpressions: {},
  })

  // JSX로 완전 재작성 필요
  return (
    <div className="mobile-container">
      {currentScreen === 'mode-selection' && <ModeSelection />}
    </div>
  )
}
```

## 🎯 CupNote에 최적화된 선택

### 추천: Vue.js 3

**핵심 이유**:

1. **프로토타입 재사용성 높음**
   - HTML 구조 90% 재사용 가능
   - CSS는 100% 재사용
   - JS 로직 리팩토링 최소화

2. **개발 속도**
   - 3주 MVP 일정에 적합
   - 학습 시간 최소화
   - 빠른 프로토타이핑

3. **한국 시장 적합**
   - 한국 개발자 커뮤니티 활발
   - 한국어 문서/튜토리얼 풍부
   - 유지보수 인력 확보 용이

4. **폼 중심 앱에 최적**
   - v-model로 양방향 바인딩
   - 폼 검증 간편
   - 상태 관리 직관적

5. **번들 크기**
   - PWA에서 중요한 초기 로딩 속도
   - Vue 3: ~34KB
   - React: ~45KB

## 📋 최종 기술 스택

```yaml
Frontend:
  - Framework: Vue.js 3.4
  - State: Pinia (Vuex 5)
  - Router: Vue Router 4
  - UI: Custom Components (프로토타입 기반)
  - Build: Vite 5
  - Lang: JavaScript (TypeScript는 Phase 2)

PWA:
  - Vite PWA Plugin
  - Workbox
  - IndexedDB (Dexie.js)

Mobile:
  - Capacitor 5
  - iOS/Android 빌드
```

## 🚀 실행 계획

### 즉시 실행 (오늘)

```bash
# Vue 프로젝트 생성
npm create vue@latest cupnote-app

# 선택 옵션:
# - TypeScript: No (Phase 1은 JS)
# - JSX: No
# - Vue Router: Yes
# - Pinia: Yes
# - Vitest: Yes
# - ESLint: Yes
# - Prettier: Yes
```

### 프로토타입 마이그레이션 (Day 1-2)

1. `index.html` → Vue 컴포넌트로 분리
2. 전역 상태 → Pinia store
3. DOM 조작 → Vue 반응형
4. 이벤트 핸들러 → Vue methods

## ✅ 결정

**Vue.js 3**를 선택하여 빠른 MVP 개발과 프로토타입 자산 최대 활용을 추구합니다.
