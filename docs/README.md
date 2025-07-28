# CupNote Living Documentation

이 디렉토리는 CupNote 프로젝트의 살아있는 문서화 시스템입니다.

## 📂 구조

```
docs/
├── decisions/      # 아키텍처 및 기술 결정사항
├── errors/         # 에러 로그 및 해결 과정
├── patterns/       # 재사용 가능한 코드 패턴
├── context/        # 파일별 상세 컨텍스트
├── trace/          # 코드 변경 이력 추적
└── living-doc-helper.sh  # 문서화 헬퍼 스크립트
```

## 🚀 빠른 시작

### 1. 헬퍼 스크립트 로드
```bash
source docs/living-doc-helper.sh
```

### 2. 주요 명령어

#### 새 기능 시작
```bash
start_feature "커피 테이스팅 기록" "사용자가 커피 테이스팅 노트를 작성하고 저장하는 기능"
```

#### 에러 기록
```bash
log_error "TypeError: Cannot read property 'name' of undefined" "src/services/coffee.service.ts"
```

#### 해결책 기록
```bash
solved_error "null 체크 추가로 해결" "사용자 입력은 항상 검증 필요"
```

#### 결정사항 기록
```bash
record_decision "프론트엔드 프레임워크 선택" "React Native vs Flutter 중 선택 필요"
```

#### Claude 세션 시작
```bash
claude_start
```

#### 문서화 품질 체크
```bash
check_docs
```

## 📝 문서화 규칙

### 코드 주석
```typescript
// WHY: 비즈니스 요구사항이나 기술적 이유
// TRIED: 시도했던 다른 방법들
// CONTEXT: 관련 문서나 파일 참조
// GOTCHAS: 주의사항
```

### 파일 헤더
```typescript
// PURPOSE: 이 파일의 주요 목적
// ARCHITECTURE: 시스템 내 위치 (Controller, Service, Model 등)
// RELATED: 관련된 다른 파일들
// GOTCHAS: 특별히 주의할 점
```

## 🤖 AI 협업 팁

1. **항상 컨텍스트 포함하기**
   ```
   "이 에러를 해결해줘 @docs/errors/2025-01.md @src/services/coffee.service.ts"
   ```

2. **학습 내용 기록하기**
   - 문제 해결 후 `.claude/learned-patterns.md`에 추가
   - 패턴 발견시 `docs/patterns/`에 문서화

3. **정기적인 품질 체크**
   - 매주 `check_docs` 실행
   - 70% 이상 유지 목표

## 💡 Best Practices

1. **즉시 기록**: 나중에 하면 잊어버림
2. **5초 투자**: 간단하게라도 기록
3. **컨텍스트 중심**: WHY가 가장 중요
4. **에러는 자산**: 실패 경험도 문서화
5. **패턴 추출**: 반복되는 것은 패턴으로

## 🔗 관련 문서

- [프로젝트 컨텍스트](../.claude/project-context.md)
- [현재 작업 포커스](../.claude/current-focus.md)
- [학습된 패턴](../.claude/learned-patterns.md)