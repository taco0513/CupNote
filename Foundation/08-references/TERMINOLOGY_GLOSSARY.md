# Terminology Glossary - 용어 사전

> TastingFlow 시스템의 통일된 용어 정의

## 🎯 핵심 용어

### TastingFlow

- **정의**: CupNote의 핵심 커피 테이스팅 기록 워크플로우
- **구성**: 3-Tier 모드 시스템 (Cafe, HomeCafe, Lab)
- **목적**: 체계적인 커피 평가 및 기록

### 3-Tier Mode System

1. **Cafe Mode**: 카페 방문객용 간편 기록 (3-5분)
2. **HomeCafe Mode**: 홈브루잉 레시피 기록 (5-8분)
3. **Lab Mode**: 전문가용 상세 분석 (8-12분)

---

## 🏠 HomeCafe 관련 용어

### 다이얼 제어 시스템 (Dial Control System)

- **정의**: ± 1g 단위로 원두량을 정밀 조정하는 UI 컴포넌트
- **구성**: [-] 버튼 + 숫자 입력 + [+] 버튼
- **목적**: 바리스타급 정밀도 제공

### 비율 프리셋 (Ratio Presets)

- **정의**: 1:15 ~ 1:18 범위의 7개 고정 비율 버튼
- **옵션**: 1:15, 1:15.5, 1:16, 1:16.5, 1:17, 1:17.5, 1:18
- **특징**: 선택 시 물량 자동 계산

### 나의 커피 (My Coffee)

- **정의**: 개인 레시피 저장/불러오기 기능
- **저장 정보**: 원두량, 물량, 비율
- **저장 위치**: AsyncStorage (로컬 영구 저장)

### 5-Field 시스템

- **정의**: HomeCafe 모드의 간소화된 입력 필드
- **구성**: 드리퍼 → 레시피 → 다이얼 → 타이머 → 노트
- **이전**: 10개 이상의 복잡한 필드

### 드리퍼 종류 (Dripper Types)

- **지원 목록**: V60, Kalita Wave, Origami, Chemex, Fellow Stagg, April, Orea, Flower Dripper, Blue Bottle, Timemore Crystal Eye
- **총 10종**: 한국 시장 인기 드리퍼 중심

### 랩타임 (Lap Times)

- **정의**: 추출 과정을 5단계로 나눈 구간별 시간 기록
- **용도**: 정밀한 추출 프로파일 관리
- **단위**: 초(seconds)

---

## 🔬 Lab Mode 관련 용어

### 수치 평가 (Sensory Slider)

- **정의**: 6개 항목을 1-5점 슬라이더로 평가
- **항목**: Body, Acidity, Sweetness, Finish, Bitterness, Balance
- **추가**: Texture 선택 (Juicy/Soft/Round/Velvety)

### TDS (Total Dissolved Solids)

- **정의**: 총 용존 고형물 농도
- **단위**: % 또는 ppm
- **용도**: 추출 강도 측정

### 추출 수율 (Extraction Yield)

- **정의**: 원두에서 추출된 성분의 비율
- **단위**: %
- **이상 범위**: 18-22%

---

## 🇰🇷 한국어 감각 표현

### CATA (Check All That Apply)

- **정의**: SCA 2024 표준 감각 평가 방법론
- **특징**: 해당하는 모든 표현 선택 가능
- **제한**: 카테고리당 최대 3개

### 6개 카테고리

1. **산미 (Acidity)**: 신맛 관련 표현
2. **단맛 (Sweetness)**: 단맛 관련 표현
3. **쓴맛 (Bitterness)**: 쓴맛 관련 표현
4. **바디 (Body)**: 질감, 무게감 표현
5. **애프터 (Aftertaste)**: 후미, 여운 표현
6. **밸런스 (Balance)**: 전체적 조화 표현

### 44개 표현

- **총 개수**: 6개 카테고리 × 7개 표현 + 밸런스 7개 = 44개
- **특징**: 한국인에게 친숙한 표현 중심
- **예시**: 싱그러운, 발랄한, 톡 쏘는, 부드러운 등

---

## 📊 평가 지표

### Match Score

- **정의**: 사용자 선택과 로스터 노트 간 일치도
- **계산**: 직접 일치(100%), 유사 일치(70%), 연관 일치(50%)
- **표시**: 0-100% 진도바

### 진행률 (Progress)

- **정의**: TastingFlow 완성도 표시
- **계산**: 모드별 단계에 따른 백분율
- **예시**: Cafe Mode 7단계 = 14.3%/단계

---

## 💾 데이터 구조 용어

### CurrentTasting

- **정의**: 현재 진행 중인 테이스팅 세션 데이터
- **저장**: Zustand store (메모리)
- **생명주기**: 세션 시작 → 완료 → 저장

### Draft

- **정의**: 임시 저장된 미완성 테이스팅
- **저장**: AsyncStorage
- **용도**: 중단된 작업 복구

### TastingRecord

- **정의**: 완성된 테이스팅 기록
- **저장**: Realm (로컬) → Supabase (클라우드)
- **동기화**: 자동 백그라운드 동기화

---

## 🎨 UI/UX 용어

### FloatingButton

- **정의**: 화면 하단 고정 CTA 버튼
- **크기**: 전체 너비, 높이 56px
- **색상**: Primary ($cupBlue)

### ToggleButton

- **정의**: 선택/해제 가능한 토글 버튼
- **크기**: 88×36px (표준)
- **상태**: selected/unselected

### ToastContainer

- **정의**: 상단 안내 메시지 영역
- **스타일**: 연한 파란색 배경 ($cupBlueLight)
- **타이포**: 제목 15px, 부제목 14px

---

## 🔧 기술 용어

### Zustand

- **정의**: React 상태 관리 라이브러리
- **용도**: 전역 상태 관리
- **특징**: TypeScript 지원, 가벼움

### Tamagui

- **정의**: React Native UI 프레임워크
- **특징**: 성능 최적화, 디자인 토큰
- **문제**: TypeScript 타입 충돌 이슈

### Bridge Error

- **정의**: React Native ↔ Native 통신 오류
- **원인**: 타이밍 이슈, null 참조
- **해결**: BridgeDebugger, Safe call wrapper

### AsyncStorage

- **정의**: React Native 로컬 저장소
- **용도**: 설정, 임시 데이터, 레시피 저장
- **특징**: 키-값 저장, 비동기 API

---

## 🌐 비즈니스 용어

### MVP (Minimum Viable Product)

- **정의**: 최소 기능 제품
- **범위**: 3-Tier 모드 + 한국어 표현 + 기본 통계
- **상태**: 2025-07-27 완료

### Freemium

- **정의**: 기본 무료 + 프리미엄 유료 모델
- **무료**: Cafe Mode
- **유료**: HomeCafe, Lab Mode

### MAU (Monthly Active Users)

- **정의**: 월간 활성 사용자
- **목표**: 1년차 10,000명
- **측정**: 월 1회 이상 앱 실행

### 전환율 (Conversion Rate)

- **정의**: 무료→유료 전환 비율
- **목표**: 5-8%
- **계산**: 유료 사용자 ÷ 전체 사용자

---

**문서 버전**: 1.0
**최종 수정**: 2025-07-28
**용도**: 프로젝트 용어 통일 및 이해도 향상
