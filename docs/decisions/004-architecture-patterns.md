# Decision: CupNote 아키텍처 패턴 선택

## DATE
2025-01-28

## CONTEXT
CupNote 프로젝트의 아키텍처 패턴을 결정. 고급 개발 패턴 가이드를 바탕으로 
프로젝트 규모(소규모)와 요구사항에 맞는 패턴 선택이 필요함.

## PROJECT_ANALYSIS
```
규모: 소규모 프로젝트 (1-3명, 3개월)
도메인: 개인 취향 기록 및 분석 (SaaS 유형)
사용자: 초기 수백명 → 향후 수천명
복잡도: 중간 (AI 추천, 개인화)
```

## OPTIONS_CONSIDERED

### 1. Monolithic Architecture (단일체)
- **Pros**: 
  - 개발 속도 빠름
  - 배포 단순함
  - 팀 규모에 적합
  - 디버깅 쉬움
- **Cons**: 
  - 확장성 제한
  - 부분 배포 어려움
  - 기술 스택 고정

### 2. Modular Monolith (모듈형 단일체)
- **Pros**: 
  - 단일체의 장점 + 모듈성
  - 향후 마이크로서비스 분리 가능
  - 도메인별 구분 명확
- **Cons**: 
  - 초기 설계 복잡
  - 모듈 경계 설정 어려움

### 3. Microservices (마이크로서비스)
- **Pros**: 
  - 높은 확장성
  - 기술 다양성
  - 독립적 배포
- **Cons**: 
  - 팀 규모 부적합
  - 운영 복잡도 높음
  - 개발 초기 오버헤드

## DECISION
**Modular Monolith** 선택

## REASONING
1. **점진적 확장**: MVP는 단일체로 시작, 필요시 서비스 분리
2. **도메인 분리**: 커피 데이터, 사용자 관리, AI 추천을 모듈로 구분
3. **팀 역량**: 소규모 팀에서 관리 가능한 복잡도
4. **기술 부채 최소화**: 과도한 엔지니어링 방지

## IMPLEMENTATION

### 모듈 구조
```typescript
// 도메인별 모듈 분리
src/
├── modules/
│   ├── auth/           # 사용자 인증/인가
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── types/
│   ├── coffee/         # 커피 데이터 관리
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── types/
│   ├── tasting/        # 테이스팅 기록
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── types/
│   ├── expression/     # 한국식 감각 표현
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   └── types/
│   └── recommendation/ # AI 추천 (향후)
│       ├── controllers/
│       ├── services/
│       ├── models/
│       └── types/
├── shared/            # 공통 모듈
│   ├── database/
│   ├── middleware/
│   ├── utils/
│   └── types/
└── app.ts
```

### 모듈 간 통신 규칙
```typescript
// WHY: 모듈 간 의존성 최소화 및 명확한 인터페이스
// PATTERN: Dependency Inversion Principle 적용

interface ModuleBoundary {
  // 모듈은 인터페이스를 통해서만 통신
  exports: PublicInterface;
  
  // 직접적인 모듈 import 금지
  // 대신 의존성 주입 사용
  dependencies: DependencyInterface[];
}

// 예시: Tasting 모듈이 Expression 모듈 사용
class TastingService {
  constructor(
    private expressionService: ExpressionServiceInterface
  ) {}
  
  async createTasting(data: TastingData) {
    // 한국식 표현 변환
    const expressions = await this.expressionService
      .convertToKorean(data.notes);
    
    return this.repository.create({
      ...data,
      koreanExpressions: expressions
    });
  }
}
```

### 확장 전략
```typescript
// Phase 1: Modular Monolith
const app = express();
app.use('/api/auth', authModule);
app.use('/api/coffee', coffeeModule);
app.use('/api/tasting', tastingModule);

// Phase 2: 필요시 서비스 분리
// 1. 가장 독립적인 모듈부터 (Expression)
// 2. 트래픽이 많은 모듈 (Tasting)
// 3. 특별한 요구사항이 있는 모듈 (AI Recommendation)
```

## CONSEQUENCES
- ✅ 빠른 MVP 개발 가능
- ✅ 명확한 도메인 경계
- ✅ 향후 마이크로서비스 분리 가능
- ✅ 팀 규모에 적합한 복잡도
- ❌ 초기 설계 시간 필요
- ❌ 모듈 경계 설정 어려움

## RELATED_PATTERNS
- Repository Pattern (데이터 접근)
- Dependency Injection (모듈 간 통신)
- Factory Pattern (모듈 생성)
- Observer Pattern (모듈 간 이벤트)

## RELATED_FILES
- docs/patterns/repository-pattern.md (예정)
- src/modules/ (구현 예정)
- docs/patterns/dependency-injection.md (예정)

## REVIEW_DATE
2025-04-28 (MVP 완료 후 아키텍처 재평가)