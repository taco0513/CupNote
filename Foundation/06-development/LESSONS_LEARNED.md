# Lessons Learned - 프로젝트 회고록

> 다음 개발자에게: 우리가 겪은 고통을 반복하지 마세요 🙏

## 🚨 우리가 겪은 주요 문제들

### 1. TypeScript 타입 지옥 (400+ 에러)

**문제 상황**:
```
- React Native 0.80 + Tamagui 조합에서 JSX 타입 충돌
- @types/react 버전 미스매치로 인한 대규모 타입 에러
- 400개 이상의 TypeScript 에러 발생
- 빌드는 되지만 타입 체크 실패
```

**근본 원인**:
```
1. 여러 라이브러리가 서로 다른 React 타입 정의 참조
2. Tamagui가 자체 React 타입을 export하면서 충돌
3. node_modules에 중복된 @types/react 버전들
4. React Native 0.80의 새로운 타입 시스템과 호환성 문제
```

**우리의 시도** (실패한 것들):
```json
// package.json resolutions - 부분적 해결
"resolutions": {
  "@types/react": "18.2.79",
  "@types/react-native": "0.73.0"
}

// tsconfig.json paths - 효과 없음
"paths": {
  "react": ["./node_modules/@types/react"]
}
```

**만약 다시 한다면**:
```
1. 처음부터 Expo 사용 (의존성 관리 자동화)
2. UI 라이브러리는 React Native 공식 지원 확인 후 선택
3. 타입 버전 고정 및 yarn resolutions 적극 활용
4. 점진적 마이그레이션 (한번에 31개 화면 이전 X)
```

---

### 2. Tamagui 마이그레이션 재앙

**문제 상황**:
```
- 31개 화면을 한번에 Tamagui로 마이그레이션
- 기존 코드와의 호환성 문제
- 성능은 개선되었지만 타입 에러 폭발
- 디버깅 지옥
```

**근본 원인**:
```
1. Big Bang 마이그레이션 접근법
2. Tamagui 문서 부족 및 엣지 케이스 미고려
3. 기존 컴포넌트와의 스타일 충돌
4. 테스트 없이 대규모 변경
```

**만약 다시 한다면**:
```
1. 한 화면씩 점진적 마이그레이션
2. 마이그레이션 전 충분한 PoC
3. 대안 고려: NativeWind (Tailwind for RN)
4. 커스텀 디자인 시스템 구축 고려
```

---

### 3. 상태 관리 복잡도 폭발

**문제 상황**:
```
- Zustand store 40개 이상 생성
- 순환 의존성 문제
- 상태 동기화 이슈
- 디버깅 어려움
```

**근본 원인**:
```
1. 도메인별 분리 과도하게 진행
2. Store 간 의존성 관리 실패
3. 전역 상태 남용
4. 로컬 상태로 충분한 것도 전역화
```

**만약 다시 한다면**:
```
1. 최소한의 전역 상태 (auth, user 정도)
2. React Query로 서버 상태 관리
3. 로컬 상태 우선 사용
4. Jotai 같은 atomic 상태 관리 고려
```

---

### 4. React Native Bridge 에러

**문제 상황**:
```
- "Cannot read property 'onRequestCategoryPreferencing' of null"
- 간헐적 크래시
- 재현 어려운 버그
- 사용자 경험 악화
```

**근본 원인**:
```
1. Bridge 통신 타이밍 이슈
2. 컴포넌트 언마운트 후 콜백 실행
3. 에러 경계 미설정
4. 비동기 처리 미흡
```

**해결 방법**:
```javascript
// Bridge 디버거 구현
const bridgeDebugger = {
  calls: [],
  logCall: (method, args) => {
    this.calls.push({ method, args, timestamp: Date.now() });
  }
};

// 안전한 Bridge 호출
const safeBridgeCall = (method, ...args) => {
  try {
    if (bridge && bridge[method]) {
      return bridge[method](...args);
    }
  } catch (error) {
    console.error('Bridge error:', error);
  }
};
```

---

### 5. Metro Bundler 미스터리

**문제 상황**:
```
- "Unable to resolve module" 무한 반복
- 캐시 클리어해도 해결 안됨
- 빌드 시간 급증
- Hot reload 작동 안함
```

**해결 방법**:
```bash
# 완전 초기화 스크립트
rm -rf node_modules
rm -rf ios/Pods
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf /tmp/metro-*
cd ios && pod deintegrate && pod install
npm install
npm start -- --reset-cache
```

---

## 🎯 핵심 교훈

### 1. 기술 스택 선택
```
❌ 하지 말 것:
- 최신/실험적 기술 스택 조합
- 문서 부족한 라이브러리
- 커뮤니티 작은 도구

✅ 해야 할 것:
- 검증된 조합 사용
- 공식 지원 확인
- 대안 항상 준비
```

### 2. 프로젝트 구조
```
❌ 하지 말 것:
- 과도한 추상화
- 너무 많은 파일 분리
- 복잡한 폴더 구조

✅ 해야 할 것:
- KISS 원칙
- 도메인 중심 구조
- 점진적 복잡도 증가
```

### 3. 개발 프로세스
```
❌ 하지 말 것:
- Big Bang 변경
- 테스트 없는 리팩토링
- 한번에 여러 문제 해결

✅ 해야 할 것:
- 작은 단위 변경
- 지속적 통합
- 하나씩 해결
```

---

## 💊 즉시 적용 가능한 해결책

### 1. 프로젝트 시작 템플릿
```bash
# Expo 기반 시작 (강력 추천)
npx create-expo-app --template

# 필수 설정
- TypeScript strict mode
- ESLint + Prettier
- Husky pre-commit hooks
- 절대 경로 설정
```

### 2. 추천 기술 스택
```
UI: NativeWind (Tailwind for RN) or Gluestack UI
상태 관리: Jotai + React Query
네비게이션: React Navigation 6
폼: React Hook Form
스토리지: MMKV
API: tRPC or GraphQL
테스트: Jest + React Native Testing Library
```

### 3. 필수 개발 도구
```
- Reactotron (디버깅)
- Flipper (네트워크 검사)
- React DevTools
- TypeScript Error Translator (VS Code)
```

---

## 🙏 다음 개발자에게

### 시작하기 전에
1. **2주간 PoC 기간** 가져가세요
2. **핵심 기능 1개**만 완벽하게 구현
3. **기술 스택 검증** 철저히
4. **팀원과 충분한 논의**

### 개발 중에
1. **매일 작은 성공** 만들기
2. **문제 발생시 즉시 공유**
3. **돌아가는 길이 지름길**
4. **완벽보다 완성**

### 막힐 때
1. **1시간 이상 삽질 금지**
2. **대안 항상 고려**
3. **롤백 두려워 말기**
4. **도움 요청은 용기**

---

## 🎬 마지막으로

우리는 많은 시행착오를 겪었지만, 결국 작동하는 앱을 만들었습니다.
당신도 할 수 있습니다. 

단지 우리처럼 고생하지 마세요 😅

**Remember**:
- 심플하게 시작하세요
- 검증된 것을 사용하세요
- 사용자를 먼저 생각하세요
- 즐기면서 개발하세요

화이팅! 🚀

---

**작성일**: 2025-07-28
**작성자**: 고통받은 개발자들
**다음 개발자**: 행운을 빕니다 🍀