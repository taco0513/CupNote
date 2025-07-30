# CupNote 컴포넌트 구조

## 📁 디렉토리 구조

```
components/
├── base/           # 기본 UI 요소 (Button, Input, Card 등)
├── layout/         # 레이아웃 컴포넌트 (Header, Footer, Container 등)
├── common/         # 공통 사용 컴포넌트 (Modal, Toast, Loading 등)
├── features/       # 기능별 컴포넌트
│   ├── auth/      # 인증 관련
│   ├── tasting/   # 테이스팅 관련
│   ├── stats/     # 통계 관련
│   └── profile/   # 프로필 관련
└── icons/         # 아이콘 컴포넌트

## 🎯 컴포넌트 작성 원칙

1. **Single Responsibility**: 하나의 컴포넌트는 하나의 책임만
2. **Props Interface**: 명확한 Props 정의와 타입 검증
3. **Composition**: 상속보다 조합 선호
4. **Token First**: 디자인 토큰 우선 사용
5. **Accessibility**: ARIA 속성 필수 적용

## 📝 네이밍 컨벤션

- **Base Components**: `Base[ComponentName].vue`
- **Feature Components**: `[Feature][ComponentName].vue`
- **Layout Components**: `The[ComponentName].vue`
- **Single Instance**: `The[ComponentName].vue`
```
