# 4단계 기록 플로우 상세 가이드

_최종 업데이트: 2025-01-30_

## 🎯 플로우 개요

CupNote의 기록 프로세스는 4단계로 나누어져 있어 사용자가 부담 없이 정보를 입력할 수 있습니다.

## 📱 전체 플로우

```
[모드 선택] → [Step 1: 기본 정보] → [Step 2: 모드별 상세] → [Step 3: 맛 평가] → [Step 4: 최종 검토] → [결과]
```

## 🔄 단계별 상세

### **Step 1: 기본 정보** (`/record/step1`)

#### 입력 필드

```typescript
interface Step1Data {
  coffeeName: string // 필수
  roastery: string // 선택
  date: string // 기본값: 오늘
  mode: 'cafe' | 'homecafe' | 'lab' // URL에서 전달
}
```

#### 주요 기능

- 커피 이름 입력 (필수)
- 로스터리/카페 이름
- 날짜 선택 (기본값: 오늘)
- 모드 표시 (선택된 모드)

#### 검증 로직

```typescript
const validateForm = () => {
  const newErrors: { [key: string]: string } = {}

  if (!formData.coffeeName.trim()) {
    newErrors.coffeeName = '커피 이름을 입력해주세요'
  }

  if (!formData.date) {
    newErrors.date = '날짜를 선택해주세요'
  }

  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

### **Step 2: 모드별 상세 설정** (`/record/step2`)

#### Cafe 모드 필드

```typescript
{
  origin?: string         // 원산지
  roastLevel?: string     // 로스팅 레벨
}
```

#### HomeCafe 모드 필드

```typescript
{
  brewMethod?: string     // 추출 방법
  grindSize?: string      // 분쇄도
  waterTemp?: string      // 물 온도
  brewTime?: string       // 추출 시간
  ratio?: string          // 커피:물 비율
}
```

#### Lab 모드 필드

```typescript
{
  variety?: string        // 품종
  process?: string        // 가공 방식
  altitude?: string       // 고도
  tds?: string           // TDS
  extraction?: string     // 추출 수율
}
```

### **Step 3: 맛 평가** (`/record/step3`)

#### 두 가지 모드

1. **간단 모드** (기본)
   - 5점 평점 시스템
   - 빠른 태그 선택
   - 간단한 메모

2. **상세 모드** (토글)
   - 향미 프로파일 선택
   - 한국식 맛 표현
   - 상세 텍스트 입력

#### 데이터 구조

```typescript
interface Step3Data {
  rating: number // 1-5
  isDetailMode: boolean // 모드 토글
  quickTags?: string[] // 간단 모드
  flavorProfile?: string[] // 상세 모드
  taste?: string // 텍스트 설명
}
```

### **Step 4: 최종 검토** (`/record/step4`)

#### 주요 기능

- 전체 입력 정보 요약
- 각 단계별 수정 가능
- 개인 메모 추가
- 사진 추가 (준비 중)

#### 데이터 통합

```typescript
const handleSubmit = () => {
  // 모든 단계 데이터 통합
  const completeRecord: CoffeeRecord = {
    ...step1Data,
    ...step2Data,
    ...step3Data,
    memo: formData.memo,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  // LocalStorage 저장
  LocalStorage.addRecord(completeRecord)

  // 결과 페이지로 이동
  router.push(`/result?id=${completeRecord.id}`)
}
```

## 💾 데이터 관리

### SessionStorage 활용

```typescript
// 각 단계에서 저장
sessionStorage.setItem('recordStep1', JSON.stringify(formData))

// 다음 단계에서 불러오기
const saved = sessionStorage.getItem('recordStep1')
if (saved) {
  const data = JSON.parse(saved)
  // 폼 초기값 설정
}
```

### 세션 정리

```typescript
// Step 4 제출 후
const clearSession = () => {
  sessionStorage.removeItem('recordStep1')
  sessionStorage.removeItem('recordStep2')
  sessionStorage.removeItem('recordStep3')
}
```

## 🎨 UI/UX 특징

### 진행률 표시

- Step 1: 25%
- Step 2: 50%
- Step 3: 75%
- Step 4: 100%

### 네비게이션

- 뒤로가기: 이전 단계로
- 다음: 다음 단계로 (검증 통과 시)
- 건너뛰기: 선택적 필드에서 가능

### 모바일 최적화

- 한 화면에 하나의 작업
- 큰 터치 타겟
- 부드러운 전환 효과
- 키보드 줌 방지

## 🔍 모드별 차이점

### Cafe 모드

- 가장 간단한 필드
- 3-5분 소요
- 기본 정보 위주

### HomeCafe 모드

- 추출 정보 추가
- 5-8분 소요
- 홈브루잉 특화

### Lab 모드

- 전문 정보 필요
- 10-15분 소요
- 상세 분석 가능

## 🚀 개선 계획

1. **자동 완성**: 이전 기록 기반
2. **템플릿 저장**: 자주 쓰는 설정
3. **음성 입력**: 메모 작성
4. **바코드 스캔**: 제품 정보
5. **AI 추천**: 맛 표현 도우미
