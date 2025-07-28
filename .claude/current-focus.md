# Current Focus: 기술 스택 결정 및 프로젝트 셋업

## Goal
CupNote 개발을 위한 최적의 기술 스택을 결정하고 프로젝트 기본 구조를 설정

## Update 2025-01-28 14:18
- 살아있는 문서화 시스템 구축 완료
- 테스팅 전략 수립 (docs/decisions/002-testing-strategy.md)
- 테스트 데이터 패턴 정의 (docs/patterns/test-data-patterns.md)

## Files Involved
- [ ] package.json - 프로젝트 설정
- [ ] tsconfig.json - TypeScript 설정
- [ ] .env.example - 환경 변수 템플릿
- [ ] src/index.ts - 엔트리 포인트

## Key Decisions
- **Frontend Framework**: 
  - 후보: React Native vs Flutter vs Expo
  - 고려사항: 개발 속도, 네이티브 기능 접근성, 커뮤니티 지원
  
- **Backend Framework**:
  - 후보: Node.js/Express vs Python/FastAPI vs Supabase
  - 고려사항: 개발 속도, 타입 안정성, 생태계
  
- **Database**:
  - 후보: PostgreSQL vs MongoDB vs Supabase
  - 고려사항: 데이터 구조 유연성, 관계형 데이터 필요성

## Blockers
- 프론트엔드 프레임워크 선택에 따른 개발 환경 차이
- 백엔드 선택이 배포 옵션에 미치는 영향
- 데이터베이스 선택이 스키마 설계에 미치는 영향

## Progress
- [x] Planning - 기술 옵션 조사
- [ ] Decision - 최종 기술 스택 결정
- [ ] Implementation - 프로젝트 스캐폴딩
- [ ] Testing - 기본 설정 검증
- [ ] Documentation - 설정 문서화

## Notes
- Bun을 패키지 매니저로 우선 사용
- TypeScript 사용 확정
- 모바일 우선 개발 (Mobile First)
- PWA 고려 중