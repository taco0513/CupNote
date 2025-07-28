# Development Challenges & Solutions - 개발 도전과 해결

> CupNote (구 CoffeeJournal) 개발 중 겪은 모든 문제와 해결 과정

## 🎢 개발 여정 타임라인

### Phase 1: 초기 구축 (2025-07-20 ~ 07-21)
- React Native 0.80 + TypeScript 프로젝트 생성
- 기본 구조 설계 및 초기 화면 개발
- Zustand 상태 관리 도입

### Phase 2: 기능 폭발 (2025-07-22 ~ 07-23)
- 40개 이상의 서비스 레이어 생성
- AI 코칭, OCR, 커뮤니티 기능 개발
- 복잡도 급증 및 관리 어려움 발생

### Phase 3: MVP 재정의 (2025-07-24)
- Feature Backlog 분리 (182→164 파일)
- 핵심 MVP 기능만 남기고 정리
- 베타 테스트 중심으로 피벗

### Phase 4: UI 대전환 (2025-07-25)
- Tamagui 대규모 마이그레이션 (31개 화면)
- TypeScript 타입 에러 폭발 (400+개)
- 성능은 개선, 개발 경험은 악화

### Phase 5: 안정화 (2025-07-26 ~ 07-27)
- TypeScript 에러 감소 (400→110개)
- HomeCafe UI 혁신 완성
- 문서화 및 Foundation 폴더 생성

---

## 🔥 주요 문제와 해결

### 1. React Native Bridge 에러 지옥

**증상**:
```
Cannot read property 'onRequestCategoryPreferencing' of null
Cannot read property 'apply' of undefined
```

**원인 분석**:
- Native 모듈과 JS 레이어 간 타이밍 이슈
- 컴포넌트 언마운트 후 콜백 실행
- Bridge 통신 중 null 참조

**해결책**:
```javascript
// BridgeDebugger 구현
const bridgeDebugger = {
  recentCalls: [],
  
  logCall(module, method, args) {
    this.recentCalls.push({
      module,
      method,
      args,
      timestamp: Date.now(),
      stack: new Error().stack
    });
    
    // 최근 50개만 유지
    if (this.recentCalls.length > 50) {
      this.recentCalls.shift();
    }
  },
  
  printRecentCalls() {
    console.log('=== Recent Bridge Calls ===');
    this.recentCalls.forEach(call => {
      console.log(`${call.module}.${call.method}`, call.args);
    });
  }
};

// Safe Bridge 호출
const safeBridgeCall = (module, method, ...args) => {
  try {
    bridgeDebugger.logCall(module, method, args);
    
    if (!global[module] || !global[module][method]) {
      console.warn(`Bridge method not found: ${module}.${method}`);
      return null;
    }
    
    return global[module][method](...args);
  } catch (error) {
    console.error(`Bridge error in ${module}.${method}:`, error);
    return null;
  }
};
```

**교훈**: Bridge 에러는 디버깅이 어렵기 때문에 로깅 시스템 필수

---

### 2. TypeScript + Tamagui 타입 충돌

**증상**:
```
'Button' cannot be used as a JSX component.
Its type 'ComponentType<ButtonProps>' is not a valid JSX element type.
```

**시도한 해결책들** (실패):
1. `@types/react` 버전 맞추기
2. tsconfig.json paths 설정
3. node_modules 재설치
4. yarn resolutions (부분 성공)

**최종 해결**:
```json
// package.json
"resolutions": {
  "@types/react": "18.2.79",
  "@types/react-native": "0.73.0"
}

// tsconfig.json
{
  "compilerOptions": {
    "skipLibCheck": true, // 임시 방편
    "types": ["react", "react-native"]
  }
}
```

**교훈**: 
- 타입 정의 충돌은 근본적 해결이 어려움
- UI 라이브러리는 신중히 선택
- 검증된 조합 사용 권장

---

### 3. 상태 관리 순환 참조

**증상**:
```
Maximum call stack size exceeded
Circular dependency detected
```

**원인**:
- Store A가 Store B 참조
- Store B가 Store A 참조
- 40개 이상의 store가 서로 얽힘

**해결책**:
```javascript
// 이벤트 기반 통신으로 변경
import { EventEmitter } from 'events';

class StoreEventBus extends EventEmitter {
  emitStoreUpdate(storeName: string, data: any) {
    this.emit(`${storeName}:update`, data);
  }
}

export const storeEventBus = new StoreEventBus();

// Store에서 직접 참조 대신 이벤트 사용
const useAuthStore = create((set) => ({
  login: () => {
    // 직접 참조 X
    // useTastingStore.getState().clearData();
    
    // 이벤트 방식 O
    storeEventBus.emitStoreUpdate('auth', { loggedIn: true });
  }
}));
```

**교훈**: 전역 상태는 최소화하고 단방향 데이터 흐름 유지

---

### 4. Metro Bundler 캐시 문제

**증상**:
```
Error: Unable to resolve module './SomeComponent'
Module not found: Can't resolve...
```

**완벽한 리셋 스크립트**:
```bash
#!/bin/bash
# reset-project.sh

echo "🧹 Cleaning everything..."

# 1. 모든 캐시 삭제
rm -rf node_modules
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# 2. iOS 관련 정리
cd ios
rm -rf Pods
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData
pod deintegrate

# 3. Android 관련 정리
cd ../android
rm -rf .gradle
rm -rf build
rm -rf app/build

# 4. 재설치
cd ..
npm install
cd ios && pod install
cd ..

# 5. Metro 재시작
npm start -- --reset-cache

echo "✅ All clean! Try building again."
```

**교훈**: 캐시 문제는 완전 초기화가 답

---

### 5. 성능 저하 문제

**증상**:
- 리스트 스크롤 버벅임
- 화면 전환 지연
- 메모리 사용량 증가

**분석 도구**:
```javascript
// 성능 모니터링 HOC
const withPerformanceMonitor = (Component: React.FC, name: string) => {
  return (props: any) => {
    const renderStart = performance.now();
    
    useEffect(() => {
      const renderEnd = performance.now();
      const renderTime = renderEnd - renderStart;
      
      if (renderTime > 16.67) { // 60fps 기준
        console.warn(`Slow render in ${name}: ${renderTime.toFixed(2)}ms`);
      }
      
      // 메모리 사용량 체크
      if (global.performance && global.performance.memory) {
        const memoryMB = global.performance.memory.usedJSHeapSize / 1048576;
        if (memoryMB > 100) {
          console.warn(`High memory usage: ${memoryMB.toFixed(2)}MB`);
        }
      }
    });
    
    return <Component {...props} />;
  };
};
```

**최적화 적용**:
```javascript
// 1. React.memo 적극 활용
export const TastingCard = React.memo(({ tasting }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.tasting.id === nextProps.tasting.id;
});

// 2. useMemo/useCallback 활용
const MemoizedExpensiveComponent = () => {
  const expensiveValue = useMemo(() => {
    return calculateExpensiveValue();
  }, [dependency]);
  
  const stableCallback = useCallback(() => {
    doSomething();
  }, []);
};

// 3. 가상화 리스트 사용
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={data}
  renderItem={renderItem}
  estimatedItemSize={100}
  // FlatList 대비 10배 성능
/>
```

---

### 6. 개발자 경험 개선

**문제**: 
- 에러 추적 어려움
- 디버깅 도구 부족
- 반복 작업 많음

**해결책 모음**:
```javascript
// 1. 글로벌 에러 핸들러
ErrorUtils.setGlobalHandler((error, isFatal) => {
  console.error('Global error:', error);
  
  // 개발 환경에서 상세 정보
  if (__DEV__) {
    Alert.alert(
      'Error',
      `${error.message}\n\nStack:\n${error.stack}`,
      [{ text: 'OK' }]
    );
  }
});

// 2. 개발자 도구 패널
const DevPanel = () => {
  if (!__DEV__) return null;
  
  return (
    <View style={styles.devPanel}>
      <Button title="Clear Storage" onPress={clearAllStorage} />
      <Button title="Show Bridge Calls" onPress={showBridgeCalls} />
      <Button title="Performance Stats" onPress={showPerfStats} />
    </View>
  );
};

// 3. 콘솔 명령어 추가
global.dev = {
  clearStorage: () => AsyncStorage.clear(),
  showStores: () => console.log(getAllStoreStates()),
  mockData: () => createMockData(),
  bridge: bridgeDebugger
};
```

---

## 💡 베스트 프랙티스

### 1. 프로젝트 구조
```
src/
├── components/     # 재사용 컴포넌트
│   ├── common/    # 공통 컴포넌트
│   └── domain/    # 도메인별 컴포넌트
├── screens/       # 화면 컴포넌트
├── services/      # 비즈니스 로직
├── stores/        # 상태 관리
├── hooks/         # 커스텀 훅
├── utils/         # 유틸리티
└── types/         # TypeScript 타입
```

### 2. 에러 방지 체크리스트
- [ ] Bridge 호출은 항상 try-catch로 감싸기
- [ ] 컴포넌트 언마운트 시 cleanup
- [ ] 비동기 작업은 취소 가능하게
- [ ] 타입 정의는 명시적으로
- [ ] 메모리 누수 주의

### 3. 성능 체크리스트
- [ ] 큰 리스트는 가상화
- [ ] 이미지는 최적화
- [ ] 불필요한 리렌더링 방지
- [ ] 애니메이션은 useNativeDriver
- [ ] 번들 사이즈 모니터링

---

## 🎯 결론

### 성공 요인
1. **단순함 유지**: 복잡한 기능보다 안정성
2. **점진적 개선**: Big Bang 변경 피하기
3. **사용자 중심**: 기술보다 가치
4. **팀워크**: 혼자 해결하려 하지 않기

### 실패 요인
1. **과도한 기능**: MVP 범위 초과
2. **기술 부채**: 임시방편 누적
3. **테스트 부족**: 수동 테스트 의존
4. **문서 부재**: 왜 그렇게 했는지 기록 없음

### 다시 한다면
1. **Expo 사용**: 설정 지옥 회피
2. **검증된 스택**: NativeWind + React Query
3. **TDD 접근**: 테스트 먼저
4. **단계별 출시**: 작게 시작해서 키우기

---

**마지막 조언**: 
> "완벽한 코드는 없다. 작동하는 코드가 있을 뿐이다."
> 
> 너무 완벽을 추구하다 지치지 마세요.
> 사용자가 만족하면 그게 최고의 코드입니다.

화이팅! 🚀

---

**문서 버전**: 1.0
**최종 수정**: 2025-07-28
**작성자**: 살아남은 개발자들