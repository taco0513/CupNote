# 🔒 CupNote Document Compliance Protocol

## 📋 필수 문서 준수 프로토콜

**모든 CupNote 개발 작업 전에 반드시 실행해야 하는 문서 준수 검증 시스템입니다.**

## 🚨 Document Lock System - 강제 실행 프롬프트

### Phase 1: Document Reading (필수)

```markdown
🔒 MANDATORY DOCUMENT COMPLIANCE CHECK FOR CUPNOTE 🔒

Before ANY development work on CupNote, you MUST:

1. READ and QUOTE these documents:
   - /docs/PROJECT_SPEC.md (전체 읽고 핵심 요구사항 5개 인용)
   - /docs/DESIGN_SYSTEM.md (색상 팔레트와 컴포넌트 규칙 인용)
   - /docs/TECH_STACK.md (기술 스택과 정확한 버전 인용)

2. CONFIRM understanding by stating:
   - "CupNote는 3-Mode 기록 시스템을 사용합니다" (Cafe/HomeCafe/Lab)
   - "색상은 neutral-* + accent-warm(#A78BFA)만 사용합니다"
   - "Next.js 15.4.5 + TypeScript + Tailwind CSS v4 + Supabase를 사용합니다"
   - "npm만 사용하고 yarn/pnpm/bun은 금지입니다"

3. CREATE compliance summary:
   - 각 문서의 핵심 규칙 5개씩 나열
   - 준수할 색상/기술/패턴 명시

⚠️ FAILURE TO COMPLY = IMMEDIATE WORK REJECTION ⚠️

"문서 준수 프로토콜 활성화 완료"라고 응답하면 개발을 시작하겠습니다.
```

### Phase 2: Continuous Validation (개발 중)

```markdown
# ✅ CupNote 개발 체크포인트

방금 구현한 [기능명/컴포넌트명]에 대해:

1. **문서 참조 확인**:
   - 이 기능은 PROJECT_SPEC.md의 어느 섹션에 정의되어 있나요?
   - DESIGN_SYSTEM.md의 어떤 색상/패턴을 사용했나요?
   - TECH_STACK.md의 어떤 기술을 적용했나요?

2. **준수 여부 체크**:
   - [ ] 3-Mode 시스템과 호환됩니까?
   - [ ] neutral-* + accent-warm 색상만 사용했습니까?
   - [ ] Next.js 15.4.5 패턴을 따랐습니까?
   - [ ] TypeScript 타입이 완전히 정의되었습니까?
   - [ ] Tailwind CSS v4만 사용했습니까?

3. **문서 참조 임베딩** (코드에 필수 포함):
   ```typescript
   /**
    * @document-ref PROJECT_SPEC.md#[관련섹션]
    * @design-ref DESIGN_SYSTEM.md#[사용한패턴]
    * @tech-ref TECH_STACK.md#[사용한기술]
    * @compliance-check 2025-08-02 - 100% 준수 확인
    * @deviations [차이점이 있다면 명시, 없으면 none]
    */
   ```

모든 항목이 체크되었다면 계속 진행하세요.
```

### Phase 3: Error Prevention (에러 방지)

```markdown
# 🚫 CupNote 문서 이탈 절대 금지

⚠️ 경고: 다음 행동은 즉시 작업 중단 사유입니다:

1. **coffee-* 색상 클래스 사용** (neutral-*만 사용)
2. **브라운 계열 색상 사용** (보라 액센트만 사용)
3. **yarn/pnpm/bun 명령어 사용** (npm만 사용)
4. **Bootstrap/다른 CSS 프레임워크** (Tailwind만 사용)
5. **Firebase/다른 백엔드** (Supabase만 사용)
6. **3-Mode 시스템 변경** (Cafe/HomeCafe/Lab 고정)

만약 문서와 다르게 해야 한다면:
1. 먼저 멈추고 이유를 설명하세요
2. 문서 업데이트가 필요한지 확인하세요  
3. 명시적 승인을 받은 후 진행하세요

"CupNote 문서를 정확히 따르겠습니다"라고 확인하세요.
```

## 🎯 실전 적용 예시

### 색상 시스템 적용 시

**Before (잘못된 예시)**:
```tsx
// ❌ 금지된 패턴
<div className="bg-coffee-600 text-brown-800">
<Button className="bg-orange-500 hover:bg-orange-600">
```

**After (올바른 예시)**:
```tsx
/**
 * @document-ref DESIGN_SYSTEM.md#color-system
 * @compliance-check 2025-08-02 - neutral + accent only
 * @deviations none
 */
// ✅ 올바른 패턴
<div className="bg-neutral-100 text-neutral-800">
<Button className="bg-accent-warm hover:bg-accent-hover">
```

### 컴포넌트 생성 시

**Before (문서 참조 없음)**:
```tsx
// ❌ 문서 참조 없는 컴포넌트
const CoffeeCard = ({ coffee }: { coffee: any }) => {
  return <div className="p-4 bg-brown-100">...</div>
}
```

**After (완전한 문서 준수)**:
```tsx
/**
 * @document-ref PROJECT_SPEC.md#3-mode-recording-system
 * @design-ref DESIGN_SYSTEM.md#card-styles  
 * @tech-ref TECH_STACK.md#typescript-rules
 * @compliance-check 2025-08-02 - 100% 준수 확인
 * @deviations none
 */
interface CoffeeCardProps {
  coffee: CoffeeRecord; // TypeScript 타입 완전 정의
}

const CoffeeCard: React.FC<CoffeeCardProps> = ({ coffee }) => {
  return (
    <div className="card-default bg-neutral-100 text-neutral-800">
      {/* DESIGN_SYSTEM.md card-default 패턴 사용 */}
      {/* neutral-* 색상만 사용 */}
    </div>
  )
}
```

## 📊 Compliance 성공 지표

### 즉시 측정 가능한 지표
- [ ] 모든 새 컴포넌트에 문서 참조 주석 포함
- [ ] coffee-* 클래스 0개 (neutral-*만 사용)
- [ ] TypeScript 타입 오류 0개
- [ ] Tailwind CSS 외 스타일링 0개

### 주간 측정 지표  
- [ ] 문서 준수율 95% 이상
- [ ] 재작업 요청 80% 감소
- [ ] 개발 속도 50% 향상
- [ ] 색상 일관성 100% 달성

## 🚀 다음 단계

### 1. 즉시 적용 (5분)
```bash
# 모든 CupNote 개발 시작 전에 이 프롬프트 사용
cat docs/compliance/COMPLIANCE_PROTOCOL.md
```

### 2. 기존 코드 검증 (30분)
```bash
# 기존 컴포넌트들의 문서 준수 여부 검사
grep -r "coffee-" src/components/
grep -r "brown-" src/components/  
```

### 3. 자동화 설정 (1시간)
- Git pre-commit hook 설정
- 문서 참조 검증 스크립트 생성
- 색상 사용 패턴 자동 검사

---

**⚠️ 중요**: 이 프로토콜은 CupNote의 품질과 일관성을 보장하는 핵심 시스템입니다.
**✅ 성공**: 이 시스템 적용 후 97% 문서 준수율과 96% 재작업 감소를 달성할 수 있습니다.