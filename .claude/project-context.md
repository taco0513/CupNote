# Project Context for Claude

## What This Project Does

CupNote는 커피 테이스팅 경험을 기록하고 관리하는 모바일 애플리케이션입니다.
사용자가 커피의 맛과 향을 한국식 감각 표현으로 쉽게 기록할 수 있도록 돕습니다.

## Architecture Overview

- **Frontend**: React Native 또는 Flutter (미정)
- **Backend**: Node.js/Express 또는 Python/FastAPI (미정)
- **Database**: PostgreSQL 또는 MongoDB (미정)
- **Authentication**: JWT + Refresh Token
- **State Management**: Context API 또는 Redux/Zustand (미정)

## Key Technologies

- Framework: [결정 필요]
- Database: [결정 필요]
- Auth: JWT 기반 인증
- Deployment: [결정 필요]
- Package Manager: Bun (우선) → npm/yarn/pnpm

## Important Patterns

- **한국식 감각 표현 시스템**: 전통적인 커피 용어를 한국인에게 친숙한 표현으로 변환
- **성취 시스템**: 게이미피케이션을 통한 사용자 참여 유도
- **모드 시스템**: 카페/홈카페/실험실 모드로 다양한 사용 환경 지원

## Common Gotchas

- 커피 전문 용어와 일반 사용자 이해도 간의 균형
- 다양한 추출 방법에 대한 유연한 데이터 모델 필요
- 사용자별 맞춤형 감각 표현 제공의 복잡성

## File Organization

```
CupNote/
├── Foundation/          # 기획 문서 및 설계
│   ├── 00-why/         # 프로젝트 배경 및 목적
│   ├── 02-features/    # 기능 명세서
│   ├── 03-screens/     # 화면 설계 문서
│   └── 08-references/  # 참고 자료
├── cupnote-prototype/   # HTML/CSS/JS 프로토타입
├── docs/               # 살아있는 문서화
│   ├── decisions/      # 아키텍처 및 기술 결정사항
│   ├── errors/         # 에러 로그 및 해결 과정
│   ├── patterns/       # 코드 패턴 문서
│   ├── context/        # 파일별 컨텍스트
│   └── trace/          # 코드 변경 이력
└── .claude/            # AI 협업용 컨텍스트
```

## Current Status

- ✅ 프로젝트 기획 완료
- ✅ 프로토타입 구현
- ✅ 개발 환경 설정
- ✅ 살아있는 문서화 시스템 구축
- 🎯 기술 스택 결정 필요
- 🎯 첫 기능 구현 시작 예정

## Next Steps

1. 기술 스택 최종 결정
2. 프로젝트 스캐폴딩
3. 커피 테이스팅 기록 기능 구현
4. 한국식 감각 표현 시스템 구현

## Related Documents

- /Foundation/00-why/WHY_CUPNOTE.md - 프로젝트 배경
- /Foundation/02-features/KOREAN_SENSORY_SYSTEM.md - 핵심 기능
- /Foundation/03-screens/ - 화면 설계
- /cupnote-prototype/ - 작동하는 프로토타입
