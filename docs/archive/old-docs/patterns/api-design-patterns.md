# Pattern: CupNote API 설계 패턴

## PURPOSE

CupNote의 RESTful API 설계를 위한 일관되고 확장 가능한 패턴

## PATTERN_TYPE

API Design and Interface Patterns

## SELECTED_PATTERNS

### 1. RESTful API Pattern

```typescript
// WHY: 표준화된 API 설계로 직관적이고 예측가능한 인터페이스 제공
// STRUCTURE: Resource-based URLs with HTTP verbs

// 기본 리소스 구조
const apiRoutes = {
  // 사용자 관리
  'POST   /api/auth/register': 'User registration',
  'POST   /api/auth/login': 'User login',
  'POST   /api/auth/refresh': 'Token refresh',
  'DELETE /api/auth/logout': 'User logout',

  // 사용자 프로필
  'GET    /api/users/me': 'Get current user profile',
  'PUT    /api/users/me': 'Update user profile',
  'GET    /api/users/me/stats': 'Get user statistics',

  // 커피 관리
  'GET    /api/coffees': 'List coffees with pagination',
  'POST   /api/coffees': 'Create new coffee',
  'GET    /api/coffees/:id': 'Get coffee details',
  'PUT    /api/coffees/:id': 'Update coffee',
  'DELETE /api/coffees/:id': 'Delete coffee',

  // 테이스팅 기록
  'GET    /api/tastings': 'List user tastings',
  'POST   /api/tastings': 'Create tasting record',
  'GET    /api/tastings/:id': 'Get tasting details',
  'PUT    /api/tastings/:id': 'Update tasting',
  'DELETE /api/tastings/:id': 'Delete tasting',

  // 감각 표현
  'GET    /api/expressions': 'List available expressions',
  'GET    /api/expressions/recommend': 'Get expression recommendations',
  'POST   /api/expressions/convert': 'Convert professional terms to Korean',

  // 중첩 리소스 (관계 표현)
  'GET    /api/coffees/:id/tastings': 'Get tastings for specific coffee',
  'GET    /api/users/me/tastings': 'Get current user tastings',
  'GET    /api/tastings/:id/expressions': 'Get expressions for tasting',
}
```

### 2. API Response Pattern

```typescript
// WHY: 일관된 응답 형태로 클라이언트 개발 편의성 향상
// PATTERN: Envelope pattern with metadata

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: any
  }
  meta?: {
    pagination?: PaginationMeta
    timestamp: string
    version: string
  }
}

// 성공 응답 예시
const tastingListResponse: ApiResponse<Tasting[]> = {
  success: true,
  data: [
    {
      id: 'tasting-123',
      coffeeId: 'coffee-456',
      coffee: {
        name: '브라질 산토스',
        roaster: '테스트 로스터리',
      },
      overallScore: 8.5,
      expressions: [
        {
          professional: 'chocolate',
          korean: '초콜릿처럼 달콤한',
          category: 'flavor',
          intensity: 7,
        },
      ],
      createdAt: '2025-01-28T14:30:00Z',
    },
  ],
  meta: {
    pagination: {
      page: 1,
      limit: 20,
      total: 45,
      totalPages: 3,
    },
    timestamp: '2025-01-28T14:30:00Z',
    version: '1.0',
  },
}

// 에러 응답 예시
const errorResponse: ApiResponse<null> = {
  success: false,
  error: {
    code: 'TASTING_NOT_FOUND',
    message: '테이스팅 기록을 찾을 수 없습니다.',
    details: {
      tastingId: 'invalid-id',
      userId: 'user-123',
    },
  },
  meta: {
    timestamp: '2025-01-28T14:30:00Z',
    version: '1.0',
  },
}
```

### 3. Query Parameter Pattern

```typescript
// WHY: 복잡한 필터링, 정렬, 페이징을 표준화된 방식으로 처리
// PATTERN: Standardized query parameters

interface QueryParams {
  // 페이징
  page?: number // 페이지 번호 (1부터 시작)
  limit?: number // 페이지당 항목 수 (기본 20, 최대 100)

  // 정렬
  sort?: string // 정렬 필드 (예: createdAt, overallScore)
  order?: 'asc' | 'desc' // 정렬 방향

  // 필터링
  search?: string // 전체 텍스트 검색
  dateFrom?: string // 시작 날짜 (ISO 8601)
  dateTo?: string // 종료 날짜
  minScore?: number // 최소 점수
  maxScore?: number // 최대 점수

  // CupNote 특화 필터
  roaster?: string // 로스터 필터
  origin?: string // 원산지 필터
  expressions?: string // 감각 표현 필터 (쉼표 구분)
  mode?: 'cafe' | 'homecafe' | 'lab' // 테이스팅 모드
}

// 사용 예시
const queryExamples = {
  // 최근 2주간 높은 점수 테이스팅
  'GET /api/tastings?dateFrom=2025-01-14&minScore=8&sort=createdAt&order=desc': {},

  // 브라질 커피 검색
  'GET /api/coffees?search=브라질&origin=brazil&page=1&limit=10': {},

  // 달콤한 표현이 포함된 테이스팅
  'GET /api/tastings?expressions=달콤한,초콜릿&sort=overallScore&order=desc': {},
}
```

### 4. API Versioning Pattern

```typescript
// WHY: API 변경시 하위 호환성 유지
// PATTERN: URL 경로 기반 버전 관리

const versioningStrategy = {
  // v1 (초기 버전)
  baseUrl: '/api/v1',

  routes: {
    'GET /api/v1/tastings': 'Original tasting format',
    'POST /api/v1/tastings': 'Basic tasting creation',
  },

  // v2 (확장 버전 - 향후)
  futureVersions: {
    'GET /api/v2/tastings': 'Enhanced with AI recommendations',
    'POST /api/v2/tastings': 'With automatic expression conversion',
  },
}

// 버전별 응답 형태
interface V1TastingResponse {
  id: string
  overallScore: number
  notes: string
  expressions: string[] // 단순 배열
}

interface V2TastingResponse extends V1TastingResponse {
  aiRecommendations: string[]
  confidence: number
  expressions: ExpressionDetail[] // 상세 객체 배열
}
```

### 5. Error Handling Pattern

```typescript
// WHY: 체계적인 에러 처리로 클라이언트 개발 효율성 향상
// PATTERN: Hierarchical error codes with meaningful messages

enum ErrorCodes {
  // 인증 에러 (4xx)
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // 검증 에러 (4xx)
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // 리소스 에러 (4xx)
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  TASTING_NOT_FOUND = 'TASTING_NOT_FOUND',
  COFFEE_NOT_FOUND = 'COFFEE_NOT_FOUND',

  // 비즈니스 로직 에러 (4xx)
  DUPLICATE_TASTING = 'DUPLICATE_TASTING',
  INVALID_TASTING_MODE = 'INVALID_TASTING_MODE',
  EXPRESSION_NOT_SUPPORTED = 'EXPRESSION_NOT_SUPPORTED',

  // 서버 에러 (5xx)
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
}

class ApiError extends Error {
  constructor(
    public code: ErrorCodes,
    public message: string,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toResponse(): ApiResponse<null> {
    return {
      success: false,
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    }
  }
}

// 에러 처리 미들웨어
const errorHandler = (error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ApiError) {
    return res.status(error.statusCode).json(error.toResponse())
  }

  // 예상치 못한 에러
  const unexpectedError = new ApiError(
    ErrorCodes.INTERNAL_SERVER_ERROR,
    '예상치 못한 오류가 발생했습니다.',
    500,
    process.env.NODE_ENV === 'development' ? error.stack : undefined
  )

  res.status(500).json(unexpectedError.toResponse())
}
```

### 6. Request Validation Pattern

```typescript
// WHY: 입력 데이터 검증을 체계적으로 처리
// PATTERN: Schema-based validation with detailed error messages

import { z } from 'zod'

// 테이스팅 생성 스키마
const createTastingSchema = z.object({
  coffeeId: z.string().uuid('유효한 커피 ID를 입력해주세요'),
  mode: z.enum(['cafe', 'homecafe', 'lab'], {
    errorMap: () => ({ message: '유효한 테이스팅 모드를 선택해주세요' }),
  }),
  overallScore: z
    .number()
    .min(1, '점수는 1 이상이어야 합니다')
    .max(10, '점수는 10 이하여야 합니다'),

  // 선택적 필드들
  notes: z.string().max(1000, '노트는 1000자 이하여야 합니다').optional(),

  expressions: z
    .array(
      z.object({
        professional: z.string(),
        korean: z.string(),
        category: z.enum(['aroma', 'taste', 'texture', 'aftertaste']),
        intensity: z.number().min(1).max(10),
      })
    )
    .max(20, '표현은 최대 20개까지 가능합니다'),

  // 모드별 추가 필드
  brewingDetails: z
    .object({
      method: z.string(),
      dose: z.number().positive(),
      water: z.number().positive(),
      temperature: z.number().min(80).max(100),
      time: z.string().regex(/^\d{1,2}:\d{2}$/, '시간은 MM:SS 형식이어야 합니다'),
    })
    .optional(),

  location: z.string().max(100).optional(),
})

// 검증 미들웨어
const validateRequest = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationError = new ApiError(
          ErrorCodes.VALIDATION_ERROR,
          '입력 데이터가 올바르지 않습니다.',
          400,
          error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            value: err.input,
          }))
        )

        return res.status(400).json(validationError.toResponse())
      }
      next(error)
    }
  }
}

// 사용 예시
app.post('/api/v1/tastings', validateRequest(createTastingSchema), tastingController.create)
```

### 7. API Rate Limiting Pattern

```typescript
// WHY: API 남용 방지 및 서버 보호
// PATTERN: Sliding window rate limiting

interface RateLimitConfig {
  windowMs: number // 시간 윈도우 (밀리초)
  max: number // 최대 요청 수
  message: string // 제한시 메시지
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

const rateLimitConfigs = {
  // 일반 API
  general: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 100,
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  },

  // 인증 관련 (더 엄격)
  auth: {
    windowMs: 15 * 60 * 1000, // 15분
    max: 5,
    message: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.',
  },

  // 데이터 생성 (중간)
  create: {
    windowMs: 60 * 1000, // 1분
    max: 10,
    message: '생성 요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  },
}

// 사용자별 다른 제한
const getUserRateLimit = (user: User): RateLimitConfig => {
  if (user.isPremium) {
    return {
      windowMs: 15 * 60 * 1000,
      max: 500, // 프리미엄 사용자는 더 많은 요청 허용
      message: '프리미엄 사용자 요청 한도에 도달했습니다.',
    }
  }

  return rateLimitConfigs.general
}
```

## INTEGRATION_EXAMPLE

```typescript
// 전체 패턴이 적용된 컨트롤러 예시
class TastingController {
  constructor(
    private tastingService: TastingService,
    private expressionService: ExpressionService
  ) {}

  @Get('/api/v1/tastings')
  @UseGuards(AuthGuard)
  @RateLimit(rateLimitConfigs.general)
  async getTastings(
    @Query() query: QueryParams,
    @CurrentUser() user: User
  ): Promise<ApiResponse<Tasting[]>> {
    try {
      const { data, total } = await this.tastingService.findByUser(user.id, query)

      return {
        success: true,
        data,
        meta: {
          pagination: {
            page: query.page || 1,
            limit: query.limit || 20,
            total,
            totalPages: Math.ceil(total / (query.limit || 20)),
          },
          timestamp: new Date().toISOString(),
          version: '1.0',
        },
      }
    } catch (error) {
      throw new ApiError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        '테이스팅 목록을 가져오는데 실패했습니다.',
        500
      )
    }
  }

  @Post('/api/v1/tastings')
  @UseGuards(AuthGuard)
  @RateLimit(rateLimitConfigs.create)
  @ValidateRequest(createTastingSchema)
  async createTasting(
    @Body() data: CreateTastingDto,
    @CurrentUser() user: User
  ): Promise<ApiResponse<Tasting>> {
    const tasting = await this.tastingService.create({
      ...data,
      userId: user.id,
    })

    return {
      success: true,
      data: tasting,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    }
  }
}
```

## BENEFITS

- ✅ 일관된 API 인터페이스
- ✅ 명확한 에러 처리
- ✅ 확장 가능한 구조
- ✅ 클라이언트 개발 편의성

## GOTCHAS

- ⚠️ 과도한 중첩 리소스 피하기
- ⚠️ 응답 크기 최적화 필요
- ⚠️ Rate limiting 설정 신중하게

## RELATED_FILES

- docs/decisions/004-architecture-patterns.md
- docs/patterns/data-management-patterns.md
- src/modules/\*/controllers/ (구현 예정)
