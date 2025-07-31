# TastingFlow Master Documentation

CupNote의 테이스팅 플로우 시스템 종합 문서입니다.

## 📂 문서 구조

```
docs/tastingflow/
├── README.md                 # 이 파일
├── overview.md              # 시스템 전체 개요
├── user-journey.md          # 사용자 여정 및 플로우
├── screen-architecture.md   # 화면 아키텍처
├── modes/                   # 모드별 상세 문서
│   ├── cafe-mode.md        # 카페 모드
│   ├── homecafe-mode.md    # 홈카페 모드
│   └── pro-mode.md         # 프로 모드
├── screens/                 # 화면별 상세 문서
│   ├── mode-selection.md   # 모드 선택 화면
│   ├── coffee-info.md      # 커피 정보 입력
│   ├── taste-evaluation.md # 맛 평가 화면
│   └── result.md          # 결과 화면
└── implementation/         # 구현 가이드
    ├── routing.md          # 라우팅 구조
    ├── data-flow.md        # 데이터 흐름
    └── state-management.md # 상태 관리
```

## 🎯 시스템 개요

### 핵심 목표
- **개인화된 커피 기록**: 각자의 언어로 커피 맛 기록
- **모드 기반 유연성**: 상황에 맞는 기록 방식 제공
- **학습과 성장**: 커피 감각 향상 지원

### 4가지 모드

| 모드 | 목적 | 소요시간 | 대상 사용자 |
|------|------|----------|-------------|
| **⚡ Quick** | 1분 만에 빠른 평가 | 1-2분 | 바쁜 상황에서 간단히 기록하고 싶은 모든 사용자 |
| **☕ Cafe** | 카페에서 간편 기록 | 3-5분 | 커피 초보자, 간편 기록 원하는 사용자 |
| **🏠 HomeCafe** | 홈브루잉 + 레시피 관리 | 5-8분 | 홈브루어, 추출 실험 사용자 |
| **🔬 Pro** | 전문적 분석 평가 | 8-12분 | 커피 전문가, 바리스타, 로스터 |

## 📱 통합 플로우 (4단계 구현)

모든 모드는 동일한 4단계 구조를 따르지만, 각 단계별 내용이 모드에 따라 차별화됩니다.

### Step 1: 모드 선택 + 커피 인포 (25%)
- **라우팅**: `/mode-selection` → `/record/step1`
- **공통**: 모드 선택, 커피 이름, 날짜
- **차별화**: 모드별 필수/선택 정보 다름

### Step 2: 추출/맛 설정 (50%)
- **라우팅**: `/record/step2`
- **Cafe**: 간단한 맛 기록
- **HomeCafe**: 추출 레시피 설정 (4개 드리퍼)
- **Pro**: SCA 표준 측정 + 추출 프로토콜

### Step 3: 감각 표현 (75%)
- **라우팅**: `/record/step3`
- **공통**: 한국어 감각 표현 (6개 카테고리)
- **차별화**: 맛 평가 깊이 다름

### Step 4: 개인 노트 + 완료 (100%)
- **라우팅**: `/record/step4`
- **공통**: 개인 메모, 로스터 노트
- **차별화**: 결과 화면 및 저장 데이터 구조

## 🏗️ 아키텍처 특징

### 진행률 기반 UX
- **25% → 50% → 75% → 100%**: 명확한 진행 상황 표시
- **뒤로가기 지원**: 모든 단계에서 이전 단계 수정 가능
- **세션 저장**: sessionStorage로 단계별 데이터 임시 저장

### 모드별 차별화
- **라우팅**: 동일한 Step 구조, 모드별 내용 분기
- **데이터 구조**: 모드별 타입 시스템 적용
- **UI/UX**: 모드별 특화된 인터페이스

### 데이터 흐름
```
Mode Selection → Coffee Info → Mode-Specific Step2 → Unified Step3 → Step4 Result
     ↓              ↓              ↓                    ↓              ↓
sessionStorage → sessionStorage → sessionStorage → sessionStorage → Supabase
```

## 📊 v1.0.0-rc 구현 현황

### ✅ 완료된 기능
- [x] **4가지 모드 시스템** 설계 및 구현 완료
- [x] 4단계 통합 플로우 구현 (Quick Mode는 단일 페이지)
- [x] **Quick Mode**: 1-2분 초간편 기록 시스템
- [x] **Cafe Mode**: 7단계 → 4단계 구현 변경
- [x] **HomeCafe Mode**: 4개 드리퍼 + 레시피 관리 시스템
- [x] **Pro Mode**: SCA 표준 필드 추가
- [x] 모드별 차별화된 UI/UX
- [x] sessionStorage + Supabase 이중 저장

### 🔄 v2.0 계획
- [ ] 커뮤니티 커핑 기능
- [ ] AI 기반 맛 분석
- [ ] 소셜 공유 기능
- [ ] 고급 통계 및 분석

## 📚 주요 문서

1. **[시스템 전체 개요](./overview.md)** - TastingFlow 시스템 철학과 설계 원칙
2. **[사용자 여정](./user-journey.md)** - 모드별 사용자 경험 플로우
3. **[화면 아키텍처](./screen-architecture.md)** - 화면 구조 및 네비게이션
4. **[모드별 가이드](./modes/)** - Cafe, HomeCafe, Pro 모드 상세 문서
5. **[구현 가이드](./implementation/)** - 개발자를 위한 기술 문서

## 🎯 핵심 설계 원칙

### 1. Progressive Disclosure
- 초보자부터 전문가까지 단계적 정보 제공
- 복잡도에 따른 UI 계층화

### 2. 개인화
- 사용자별 맞춤 경험
- 개인 언어와 표현 존중

### 3. 학습 지향
- 단순 기록을 넘어 커피 감각 향상
- 긍정적 피드백과 성장 추적

### 4. 유연성
- 모드 간 자유로운 전환
- 선택적 입력과 건너뛰기 허용

---

**📅 최종 업데이트**: 2025-07-31  
**버전**: v1.0.0-rc  
**상태**: Production Ready