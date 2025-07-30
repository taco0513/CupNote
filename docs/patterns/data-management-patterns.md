# Pattern: CupNote 데이터 관리 패턴

## PURPOSE

CupNote의 복잡한 데이터 관계를 효율적으로 관리하기 위한 데이터 패턴 조합

## PATTERN_TYPE

Data Access and Management Patterns

## CONTEXT

CupNote는 다음과 같은 복잡한 데이터 관계를 가집니다:

- 사용자 ↔ 테이스팅 기록 (1:N)
- 커피 ↔ 테이스팅 기록 (1:N)
- 테이스팅 ↔ 감각 표현 (1:N)
- 사용자 ↔ 취향 프로필 (1:1)

## SELECTED_PATTERNS

### 1. Repository Pattern

```typescript
// WHY: 데이터 접근 로직과 비즈니스 로직 분리
// BENEFITS: 테스트 가능성, 유지보수성, 데이터베이스 교체 용이성

interface TastingRepository {
  create(tasting: CreateTastingDto): Promise<Tasting>
  findById(id: string): Promise<Tasting | null>
  findByUserId(userId: string): Promise<Tasting[]>
  update(id: string, data: UpdateTastingDto): Promise<Tasting>
  delete(id: string): Promise<void>

  // CupNote 특화 메서드
  findByDateRange(userId: string, start: Date, end: Date): Promise<Tasting[]>
  findByCoffeeId(coffeeId: string): Promise<Tasting[]>
  findByExpressions(expressions: string[]): Promise<Tasting[]>
}

class PrismaTastingRepository implements TastingRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateTastingDto): Promise<Tasting> {
    return this.prisma.tasting.create({
      data: {
        ...data,
        expressions: {
          create: data.expressions.map(expr => ({
            professionalTerm: expr.professional,
            koreanExpression: expr.korean,
            category: expr.category,
            intensity: expr.intensity,
          })),
        },
      },
      include: {
        coffee: true,
        expressions: true,
        user: {
          select: { id: true, name: true },
        },
      },
    })
  }

  async findByUserId(userId: string): Promise<Tasting[]> {
    // PATTERN: Query Optimization - 필요한 데이터만 선택
    return this.prisma.tasting.findMany({
      where: { userId },
      include: {
        coffee: {
          select: { name: true, roaster: true, origin: true },
        },
        expressions: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }
}
```

### 2. Unit of Work Pattern

```typescript
// WHY: 여러 Repository 작업을 하나의 트랜잭션으로 관리
// USE_CASE: 테이스팅 생성시 사용자 통계 업데이트, 커피 인기도 업데이트

interface UnitOfWork {
  tastingRepo: TastingRepository
  coffeeRepo: CoffeeRepository
  userStatsRepo: UserStatsRepository

  begin(): Promise<void>
  commit(): Promise<void>
  rollback(): Promise<void>
}

class PrismaUnitOfWork implements UnitOfWork {
  private transaction?: PrismaTransaction

  constructor(private prisma: PrismaClient) {}

  async begin() {
    this.transaction = await this.prisma.$begin()
  }

  async commit() {
    if (this.transaction) {
      await this.transaction.$commit()
    }
  }

  async rollback() {
    if (this.transaction) {
      await this.transaction.$rollback()
    }
  }

  get tastingRepo() {
    return new PrismaTastingRepository(this.transaction || this.prisma)
  }
}

// 사용 예시
class TastingService {
  constructor(private uow: UnitOfWork) {}

  async createTasting(data: CreateTastingDto): Promise<Tasting> {
    await this.uow.begin()

    try {
      // 1. 테이스팅 생성
      const tasting = await this.uow.tastingRepo.create(data)

      // 2. 사용자 통계 업데이트
      await this.uow.userStatsRepo.incrementTastingCount(data.userId)

      // 3. 커피 인기도 업데이트
      await this.uow.coffeeRepo.incrementTastingCount(data.coffeeId)

      await this.uow.commit()
      return tasting
    } catch (error) {
      await this.uow.rollback()
      throw error
    }
  }
}
```

### 3. Active Record Pattern (간단한 엔티티)

```typescript
// WHY: 간단한 엔티티는 Active Record로 빠른 개발
// USE_CASE: Coffee, User 등 단순한 CRUD 작업

class Coffee {
  constructor(
    public id: string,
    public name: string,
    public roaster: string,
    public origin: CoffeeOrigin,
    private prisma: PrismaClient
  ) {}

  // 자주 사용되는 쿼리를 메서드로 제공
  async getTastings(): Promise<Tasting[]> {
    return this.prisma.tasting.findMany({
      where: { coffeeId: this.id },
      include: { user: true, expressions: true },
    })
  }

  async getAverageScore(): Promise<number> {
    const result = await this.prisma.tasting.aggregate({
      where: { coffeeId: this.id },
      _avg: { overallScore: true },
    })
    return result._avg.overallScore || 0
  }

  async getPopularExpressions(): Promise<ExpressionStats[]> {
    // 이 커피와 관련된 인기 표현들
    return this.prisma.expression.groupBy({
      by: ['koreanExpression'],
      where: {
        tasting: { coffeeId: this.id },
      },
      _count: { koreanExpression: true },
      orderBy: { _count: { koreanExpression: 'desc' } },
      take: 10,
    })
  }

  async save(): Promise<Coffee> {
    const updated = await this.prisma.coffee.update({
      where: { id: this.id },
      data: {
        name: this.name,
        roaster: this.roaster,
        origin: this.origin,
      },
    })

    return new Coffee(updated.id, updated.name, updated.roaster, updated.origin, this.prisma)
  }
}
```

### 4. 캐싱 전략 패턴

```typescript
// WHY: 자주 조회되는 데이터의 성능 최적화
// TARGET: 커피 목록, 인기 표현, 사용자 통계

interface CacheStrategy {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  invalidate(pattern: string): Promise<void>
}

class RedisCacheStrategy implements CacheStrategy {
  constructor(private redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key)
    return cached ? JSON.parse(cached) : null
  }

  async set<T>(key: string, value: T, ttl = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value))
  }

  async invalidate(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}

// 캐시 적용 Repository 데코레이터
class CachedTastingRepository implements TastingRepository {
  constructor(
    private repository: TastingRepository,
    private cache: CacheStrategy
  ) {}

  async findByUserId(userId: string): Promise<Tasting[]> {
    const cacheKey = `user:${userId}:tastings`

    // 캐시에서 먼저 조회
    const cached = await this.cache.get<Tasting[]>(cacheKey)
    if (cached) {
      return cached
    }

    // 없으면 DB에서 조회 후 캐싱
    const tastings = await this.repository.findByUserId(userId)
    await this.cache.set(cacheKey, tastings, 1800) // 30분

    return tastings
  }

  async create(data: CreateTastingDto): Promise<Tasting> {
    const tasting = await this.repository.create(data)

    // 관련 캐시 무효화
    await this.cache.invalidate(`user:${data.userId}:*`)
    await this.cache.invalidate(`coffee:${data.coffeeId}:*`)

    return tasting
  }
}
```

### 5. 데이터 매퍼 패턴 (한국식 표현)

```typescript
// WHY: 복잡한 감각 표현 데이터의 변환 로직을 분리
// COMPLEXITY: 전문 용어 ↔ 한국식 표현 ↔ 사용자 친화적 표현

class ExpressionMapper {
  private readonly mappings: Map<string, KoreanExpression> = new Map()

  constructor() {
    this.initializeMappings()
  }

  // 전문 용어 → 한국식 표현
  toKorean(professional: string, intensity?: number): KoreanExpression {
    const base = this.mappings.get(professional.toLowerCase())
    if (!base) {
      return {
        korean: professional, // 매핑이 없으면 원본 유지
        category: 'other',
        intensity: intensity || 5,
        confidence: 0,
      }
    }

    return {
      ...base,
      intensity: intensity || base.intensity,
      confidence: 1, // 정확한 매핑
    }
  }

  // 한국식 표현 → 전문 용어 (검색용)
  toProfessional(korean: string): string[] {
    const matches: string[] = []

    for (const [professional, mapping] of this.mappings) {
      if (mapping.korean.includes(korean) || korean.includes(mapping.korean)) {
        matches.push(professional)
      }
    }

    return matches
  }

  // 사용자 레벨에 맞는 표현 추천
  recommendForUser(
    professional: string,
    userLevel: 'beginner' | 'intermediate' | 'expert'
  ): KoreanExpression {
    const base = this.toKorean(professional)

    switch (userLevel) {
      case 'beginner':
        return {
          ...base,
          korean: this.simplifyExpression(base.korean),
          explanation: this.addExplanation(base.korean),
        }
      case 'expert':
        return {
          ...base,
          professional: professional, // 전문 용어도 함께 제공
          relatedTerms: this.getRelatedTerms(professional),
        }
      default:
        return base
    }
  }

  private initializeMappings() {
    // 매핑 데이터 초기화
    this.mappings.set('citrus', {
      korean: '귤처럼 상큼한',
      category: 'acidity',
      intensity: 7,
      relatedExperience: '제주 감귤',
    })

    this.mappings.set('chocolate', {
      korean: '초콜릿처럼 달콤한',
      category: 'flavor',
      intensity: 6,
      relatedExperience: '다크 초콜릿',
    })

    // ... 더 많은 매핑
  }
}
```

## INTEGRATION_EXAMPLE

```typescript
// 전체 패턴이 통합된 서비스 예시
class TastingService {
  constructor(
    private uow: UnitOfWork,
    private cache: CacheStrategy,
    private expressionMapper: ExpressionMapper
  ) {}

  async createTasting(data: CreateTastingDto): Promise<TastingResponse> {
    // 1. 한국식 표현 변환
    const koreanExpressions = data.expressions.map(expr =>
      this.expressionMapper.recommendForUser(expr.professional, data.userLevel)
    )

    // 2. Unit of Work로 트랜잭션 처리
    await this.uow.begin()

    try {
      const tasting = await this.uow.tastingRepo.create({
        ...data,
        expressions: koreanExpressions,
      })

      // 통계 업데이트
      await this.uow.userStatsRepo.incrementTastingCount(data.userId)
      await this.uow.coffeeRepo.incrementTastingCount(data.coffeeId)

      await this.uow.commit()

      // 3. 캐시 무효화
      await this.cache.invalidate(`user:${data.userId}:*`)

      return this.mapToResponse(tasting)
    } catch (error) {
      await this.uow.rollback()
      throw error
    }
  }
}
```

## BENEFITS

- ✅ 명확한 데이터 접근 계층
- ✅ 복잡한 트랜잭션 관리
- ✅ 성능 최적화 (캐싱)
- ✅ 도메인 로직과 데이터 로직 분리

## GOTCHAS

- ⚠️ 패턴 남용시 복잡도 증가
- ⚠️ 캐시 일관성 관리 필요
- ⚠️ 트랜잭션 범위 신중하게 설정

## RELATED_FILES

- docs/decisions/004-architecture-patterns.md
- src/modules/\*/repositories/ (구현 예정)
- src/shared/database/ (구현 예정)
