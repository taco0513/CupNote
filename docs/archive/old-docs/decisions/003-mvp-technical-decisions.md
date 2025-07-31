# MVP 기술 결정사항

**날짜**: 2025-01-28  
**작성자**: AI Assistant + User  
**상태**: 확정

## 📋 결정 사항 요약

### 1. 기술 스택: PWA + Capacitor

**결정**: React Native 대신 PWA + Capacitor 선택

**이유**:

- 웹 기술(HTML/CSS/JS) 일관성 유지
- 프로토타입 코드 재사용 가능
- 향후 태블릿/웹 확장 용이
- 단일 코드베이스로 iOS/Android 동시 지원

**구현 전략**:

1. PWA 마스터 버전 개발
2. Capacitor로 iOS 앱 빌드
3. TestFlight 배포
4. Android는 Phase 2에서 진행

### 2. MVP 범위: 8개 화면 유지

**결정**: 현재 프로토타입의 8개 화면 모두 MVP에 포함

**이유**:

- 모든 화면이 핵심 사용자 경험에 필수적
- 사용자 여정의 완결성 보장
- 차별화된 기능 제공

**화면 목록**:

1. Mode Select
2. Coffee Info
3. Brew Settings (HomeCafe)
4. Experimental Data (Lab)
5. Flavor Notes
6. Sensory Expression
7. Personal Comment
8. Roaster Notes + Result

### 3. 백엔드: Supabase + 커스텀 오프라인 레이어

**결정**: 직접 구현 대신 Supabase 사용

**이유**:

- 빠른 MVP 개발 (2주 단축)
- 내장된 인증 시스템
- 실시간 동기화 지원
- 확장 가능한 인프라

**커스터마이징**:

- 커스텀 오프라인 동기화 레이어 추가
- IndexedDB + Service Worker 통합
- 충돌 해결 로직 구현

### 4. Match Score: 동적 레벨 시스템

**결정**: 사용자 입력에 따라 Level 1 또는 2 자동 적용

**이유**:

- 사용자 선택권 보장 (감각 표현 스킵 가능)
- 빠른 기록과 상세 기록 모두 지원
- 공정한 평가 (입력한 것만 평가)
- 점진적 학습 유도

**구현 세부사항**:

- 감각 표현 스킵 → Level 1 (향미만)
- 감각 표현 입력 → Level 2 (향미 50% + 감각 50%)
- 30개 주요 향미 매핑
- 6가지 감각 카테고리
- 결과 화면에서 적용된 레벨 표시

### 5. Todo App 패턴 활용

**결정**: Master Playbook의 Todo App 패턴 수정 적용

**적용 항목**:

- JWT 인증 시스템
- 다단계 폼 관리 (8개 화면)
- 오프라인 우선 동기화
- PWA 설정 파일

**수정 사항**:

- 단일 항목 → 다단계 마법사 형태
- 텍스트 입력 → 복잡한 선택 UI
- 단순 동기화 → 충돌 해결 로직

## 📊 기술 스택 상세

### Frontend

```
- Framework: Vue.js 3 or React (TBD)
- UI: Tamagui (React) or Vuetify (Vue)
- State: Pinia (Vue) or Zustand (React)
- PWA: Workbox + Vite PWA Plugin
- Mobile: Capacitor
```

### Backend

```
- Platform: Supabase
- Database: PostgreSQL
- Auth: Supabase Auth (JWT)
- Storage: Supabase Storage
- Custom: Edge Functions (오프라인 동기화)
```

### 오프라인 전략

```
- Local DB: IndexedDB (Dexie.js)
- Sync: Custom sync engine
- Cache: Service Worker (Workbox)
- Conflict: Last-write-wins + manual
```

## 🚀 구현 우선순위

### Week 1: 기초 설정

1. PWA 프로젝트 초기화
2. Supabase 프로젝트 생성
3. 인증 시스템 구현
4. 오프라인 DB 설정

### Week 2: 핵심 기능

1. 8개 화면 UI 구현
2. 다단계 폼 로직
3. Match Score Level 2
4. 한국어 표현 매핑

### Week 3: 완성 및 배포

1. 오프라인 동기화
2. Capacitor iOS 빌드
3. TestFlight 배포
4. 버그 수정

## 📝 위험 요소 및 대응

### 위험 1: 오프라인 동기화 복잡도

- **대응**: 초기엔 단순 동기화, 점진적 개선

### 위험 2: Match Score 정확도

- **대응**: 베타 테스트로 매핑 테이블 개선

### 위험 3: PWA 성능

- **대응**: 코드 스플리팅, 이미지 최적화

## ✅ 최종 확인

모든 결정사항이 다음 기준을 충족함:

- ✅ 3주 내 구현 가능
- ✅ 확장 가능한 구조
- ✅ 사용자 가치 제공
- ✅ 기술적 리스크 관리

---

**다음 단계**: 프로젝트 초기화 및 Week 1 작업 시작
