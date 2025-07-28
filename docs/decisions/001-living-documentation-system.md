# Decision: Living Documentation System 도입

## DATE
2025-01-28

## CONTEXT
CupNote 프로젝트 개발을 시작하면서 AI(Claude)와의 효율적인 협업을 위한 문서화 시스템이 필요함.
프로젝트가 복잡해질수록 컨텍스트 유지가 어려워지는 문제를 사전에 방지하고자 함.

## OPTIONS_CONSIDERED
1. **전통적 문서화 (README, Wiki)**
   - Pros: 익숙한 방식, 표준적인 접근
   - Cons: 업데이트 지연, AI가 컨텍스트 파악 어려움

2. **코드 주석만 사용**
   - Pros: 코드와 가까움, 즉시 업데이트
   - Cons: 전체적인 맥락 파악 어려움, 검색 불편

3. **Living Documentation System**
   - Pros: AI 친화적, 실시간 업데이트, 컨텍스트 보존
   - Cons: 초기 설정 필요, 새로운 습관 형성 필요

## DECISION
**Living Documentation System** 선택

## REASONING
- AI와의 협업이 프로젝트 성공의 핵심 요소
- 5초 투자로 미래의 몇 시간을 절약
- 에러 해결 과정과 의사결정을 체계적으로 기록
- 팀 확장시 온보딩 시간 단축

## IMPLEMENTATION
```
CupNote/
├── docs/
│   ├── decisions/      # 이 파일처럼 결정사항 기록
│   ├── errors/         # 에러와 해결 과정
│   ├── patterns/       # 반복되는 패턴
│   ├── context/        # 파일별 설명
│   └── trace/          # 변경 이력
└── .claude/
    ├── project-context.md
    ├── current-focus.md
    └── learned-patterns.md
```

## CONSEQUENCES
- ✅ AI가 프로젝트 전체 맥락을 즉시 이해
- ✅ 과거 에러 해결 방법을 빠르게 찾기 가능
- ✅ 의사결정 과정이 투명하게 기록됨
- ❌ 개발자가 문서화 습관을 들여야 함
- ❌ 초기에 약간의 오버헤드 발생

## RELATED_FILES
- .claude/project-context.md - 프로젝트 전체 설명
- MASTER_PLAYBOOK/MASTER_PLAYBOOK/15_Living_Documentation/README.md - 가이드

## REVIEW_DATE
2025-04-28 (3개월 후 효과성 검토)