# Pattern: CupNote 보안 패턴

## PURPOSE

CupNote의 사용자 데이터와 시스템을 보호하기 위한 종합적인 보안 패턴

## PATTERN_TYPE

Security and Authentication Patterns

## SELECTED_PATTERNS

### 1. JWT Authentication Pattern

```typescript
// WHY: Stateless 인증으로 확장성 확보, 모바일 앱 친화적
// PATTERN: Access Token + Refresh Token 조합

interface JWTPayload {
  sub: string // 사용자 ID
  email: string // 이메일
  role: UserRole // 사용자 역할
  iat: number // 발급 시간
  exp: number // 만료 시간
  jti: string // JWT ID (토큰 무효화용)
}

interface TokenPair {
  accessToken: string // 15분 유효
  refreshToken: string // 7일 유효
}

class JWTService {
  private readonly accessTokenSecret: string
  private readonly refreshTokenSecret: string
  private readonly redis: Redis

  constructor() {
    this.accessTokenSecret = process.env.JWT_ACCESS_SECRET!
    this.refreshTokenSecret = process.env.JWT_REFRESH_SECRET!
    this.redis = new Redis(process.env.REDIS_URL!)
  }

  async generateTokenPair(user: User): Promise<TokenPair> {
    const jti = crypto.randomUUID()

    // Access Token (15분)
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        jti,
      },
      this.accessTokenSecret,
      { expiresIn: '15m' }
    )

    // Refresh Token (7일)
    const refreshToken = jwt.sign(
      {
        sub: user.id,
        jti,
        type: 'refresh',
      },
      this.refreshTokenSecret,
      { expiresIn: '7d' }
    )

    // Redis에 Refresh Token 저장 (무효화 가능하도록)
    await this.redis.setex(
      `refresh_token:${user.id}:${jti}`,
      7 * 24 * 60 * 60, // 7일
      refreshToken
    )

    return { accessToken, refreshToken }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, this.refreshTokenSecret) as any

      // Redis에서 토큰 확인
      const storedToken = await this.redis.get(`refresh_token:${decoded.sub}:${decoded.jti}`)

      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token')
      }

      // 기존 토큰 무효화
      await this.revokeToken(decoded.sub, decoded.jti)

      // 새 토큰 발급
      const user = await this.userService.findById(decoded.sub)
      return this.generateTokenPair(user)
    } catch (error) {
      throw new ApiError(
        ErrorCodes.TOKEN_EXPIRED,
        '토큰이 만료되었습니다. 다시 로그인해주세요.',
        401
      )
    }
  }

  async revokeToken(userId: string, jti: string): Promise<void> {
    await this.redis.del(`refresh_token:${userId}:${jti}`)
  }

  async revokeAllTokens(userId: string): Promise<void> {
    const keys = await this.redis.keys(`refresh_token:${userId}:*`)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }
}
```

### 2. Authorization Pattern (RBAC)

```typescript
// WHY: 역할 기반 접근 제어로 세밀한 권한 관리
// PATTERN: Role-Based Access Control

enum UserRole {
  USER = 'user',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}

enum Permission {
  // 테이스팅 관련
  CREATE_TASTING = 'create:tasting',
  READ_OWN_TASTING = 'read:own_tasting',
  READ_ALL_TASTING = 'read:all_tasting',
  UPDATE_OWN_TASTING = 'update:own_tasting',
  DELETE_OWN_TASTING = 'delete:own_tasting',

  // 커피 관리
  CREATE_COFFEE = 'create:coffee',
  READ_COFFEE = 'read:coffee',
  UPDATE_COFFEE = 'update:coffee',
  DELETE_COFFEE = 'delete:coffee',

  // 사용자 관리
  READ_OWN_PROFILE = 'read:own_profile',
  UPDATE_OWN_PROFILE = 'update:own_profile',
  READ_USER_PROFILE = 'read:user_profile',

  // 관리 기능
  MODERATE_CONTENT = 'moderate:content',
  MANAGE_USERS = 'manage:users',
  VIEW_ANALYTICS = 'view:analytics',
}

const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.USER]: [
    Permission.CREATE_TASTING,
    Permission.READ_OWN_TASTING,
    Permission.UPDATE_OWN_TASTING,
    Permission.DELETE_OWN_TASTING,
    Permission.READ_COFFEE,
    Permission.READ_OWN_PROFILE,
    Permission.UPDATE_OWN_PROFILE,
  ],

  [UserRole.MODERATOR]: [
    ...rolePermissions[UserRole.USER],
    Permission.READ_ALL_TASTING,
    Permission.CREATE_COFFEE,
    Permission.UPDATE_COFFEE,
    Permission.MODERATE_CONTENT,
    Permission.READ_USER_PROFILE,
  ],

  [UserRole.ADMIN]: [
    ...rolePermissions[UserRole.MODERATOR],
    Permission.DELETE_COFFEE,
    Permission.MANAGE_USERS,
    Permission.VIEW_ANALYTICS,
  ],
}

// 권한 검사 데코레이터
const RequirePermission = (permission: Permission) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const user = this.getCurrentUser() // 컨텍스트에서 사용자 정보 가져오기

      if (!user) {
        throw new ApiError(ErrorCodes.UNAUTHORIZED, '인증이 필요합니다.', 401)
      }

      const userPermissions = rolePermissions[user.role] || []

      if (!userPermissions.includes(permission)) {
        throw new ApiError(ErrorCodes.FORBIDDEN, '권한이 없습니다.', 403)
      }

      return originalMethod.apply(this, args)
    }
  }
}

// 리소스 소유권 검사
const RequireOwnership = (resourceType: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const user = this.getCurrentUser()
      const resourceId = args[0] // 첫 번째 인자가 리소스 ID라고 가정

      const resource = await this.getResource(resourceType, resourceId)

      if (resource.userId !== user.id && user.role !== UserRole.ADMIN) {
        throw new ApiError(ErrorCodes.FORBIDDEN, '해당 리소스에 접근할 권한이 없습니다.', 403)
      }

      return originalMethod.apply(this, args)
    }
  }
}
```

### 3. Input Sanitization Pattern

```typescript
// WHY: XSS, SQL Injection 등 주입 공격 방지
// PATTERN: Layered sanitization and validation

import DOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'

class InputSanitizer {
  private readonly window = new JSDOM('').window
  private readonly purify = DOMPurify(this.window)

  // HTML 태그 제거 및 XSS 방지
  sanitizeHtml(input: string): string {
    if (!input) return ''

    // 기본적인 HTML 태그 허용 안함
    return this.purify.sanitize(input, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    })
  }

  // 텍스트 필드 정화 (테이스팅 노트용)
  sanitizeText(input: string): string {
    if (!input) return ''

    return input
      .trim()
      .replace(/[<>]/g, '') // HTML 태그 관련 문자 제거
      .replace(/javascript:/gi, '') // JavaScript 프로토콜 제거
      .replace(/on\w+=/gi, '') // 이벤트 핸들러 제거
      .substring(0, 1000) // 길이 제한
  }

  // 검색 쿼리 정화
  sanitizeSearchQuery(query: string): string {
    if (!query) return ''

    return query
      .trim()
      .replace(/[<>'"]/g, '') // 특수 문자 제거
      .replace(/\s+/g, ' ') // 연속 공백 정리
      .substring(0, 100)
  }

  // 파일명 정화
  sanitizeFilename(filename: string): string {
    if (!filename) return ''

    return filename
      .replace(/[^a-zA-Z0-9가-힣.\-_]/g, '') // 안전한 문자만 허용
      .replace(/\.+/g, '.') // 연속 점 제거
      .substring(0, 255)
  }
}

// 미들웨어로 자동 적용
const sanitizeMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const sanitizer = new InputSanitizer()

  // body 데이터 정화
  if (req.body) {
    req.body = sanitizeObject(req.body, sanitizer)
  }

  // query 파라미터 정화
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = sanitizer.sanitizeSearchQuery(req.query[key] as string)
      }
    }
  }

  next()
}

function sanitizeObject(obj: any, sanitizer: InputSanitizer): any {
  if (typeof obj === 'string') {
    return sanitizer.sanitizeText(obj)
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, sanitizer))
  }

  if (typeof obj === 'object' && obj !== null) {
    const sanitized: any = {}
    for (const key in obj) {
      sanitized[key] = sanitizeObject(obj[key], sanitizer)
    }
    return sanitized
  }

  return obj
}
```

### 4. Password Security Pattern

```typescript
// WHY: 안전한 비밀번호 저장 및 검증
// PATTERN: bcrypt + salt + password policy

import bcrypt from 'bcryptjs'

class PasswordService {
  private readonly saltRounds = 12 // 충분히 높은 cost factor

  // 비밀번호 정책 검사
  validatePasswordPolicy(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다.')
    }

    if (password.length > 128) {
      errors.push('비밀번호는 128자 이하여야 합니다.')
    }

    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다.')
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다.')
    }

    if (!/[0-9]/.test(password)) {
      errors.push('숫자를 포함해야 합니다.')
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('특수문자를 포함해야 합니다.')
    }

    // 일반적인 비밀번호 패턴 검사
    const commonPatterns = [/password/i, /123456/, /qwerty/i, /admin/i, /letmein/i]

    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('너무 흔한 비밀번호입니다.')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  // 비밀번호 해싱
  async hashPassword(password: string): Promise<string> {
    const validation = this.validatePasswordPolicy(password)

    if (!validation.valid) {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        '비밀번호 정책을 만족하지 않습니다.',
        400,
        validation.errors
      )
    }

    return bcrypt.hash(password, this.saltRounds)
  }

  // 비밀번호 검증
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hashedPassword)
    } catch (error) {
      return false
    }
  }

  // 비밀번호 강도 측정
  measurePasswordStrength(password: string): {
    score: number // 0-100
    level: 'weak' | 'fair' | 'good' | 'strong'
    suggestions: string[]
  } {
    let score = 0
    const suggestions: string[] = []

    // 길이 점수
    if (password.length >= 8) score += 25
    else suggestions.push('최소 8자 이상으로 설정하세요.')

    if (password.length >= 12) score += 10
    if (password.length >= 16) score += 10

    // 문자 종류 점수
    if (/[a-z]/.test(password)) score += 10
    else suggestions.push('소문자를 포함하세요.')

    if (/[A-Z]/.test(password)) score += 10
    else suggestions.push('대문자를 포함하세요.')

    if (/[0-9]/.test(password)) score += 10
    else suggestions.push('숫자를 포함하세요.')

    if (/[^a-zA-Z0-9]/.test(password)) score += 15
    else suggestions.push('특수문자를 포함하세요.')

    // 패턴 다양성 점수
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.7) score += 10

    // 반복 패턴 감점
    if (/(.)\1{2,}/.test(password)) score -= 10
    if (/012|123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) {
      score -= 10
    }

    let level: 'weak' | 'fair' | 'good' | 'strong'
    if (score < 30) level = 'weak'
    else if (score < 60) level = 'fair'
    else if (score < 80) level = 'good'
    else level = 'strong'

    return { score: Math.max(0, Math.min(100, score)), level, suggestions }
  }
}
```

### 5. Rate Limiting & DDoS Protection

```typescript
// WHY: 무차별 대입 공격 및 DDoS 공격 방지
// PATTERN: Sliding window + adaptive throttling

interface RateLimitRule {
  windowMs: number
  maxRequests: number
  blockDurationMs: number
  message: string
}

class AdvancedRateLimiter {
  private redis: Redis

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL!)
  }

  // 엔드포인트별 제한 설정
  private readonly rules: Record<string, RateLimitRule> = {
    // 로그인 시도 (매우 엄격)
    'POST:/api/auth/login': {
      windowMs: 15 * 60 * 1000, // 15분
      maxRequests: 5,
      blockDurationMs: 60 * 60 * 1000, // 1시간 블록
      message: '로그인 시도가 너무 많습니다. 1시간 후 다시 시도해주세요.',
    },

    // 회원가입 (중간)
    'POST:/api/auth/register': {
      windowMs: 60 * 60 * 1000, // 1시간
      maxRequests: 3,
      blockDurationMs: 24 * 60 * 60 * 1000, // 24시간 블록
      message: '회원가입 시도가 너무 많습니다. 24시간 후 다시 시도해주세요.',
    },

    // 테이스팅 생성 (일반)
    'POST:/api/tastings': {
      windowMs: 60 * 1000, // 1분
      maxRequests: 10,
      blockDurationMs: 5 * 60 * 1000, // 5분 블록
      message: '테이스팅 생성이 너무 빠릅니다. 잠시 후 다시 시도해주세요.',
    },
  }

  async checkRateLimit(
    identifier: string, // IP 또는 사용자 ID
    endpoint: string,
    req: Request
  ): Promise<{ allowed: boolean; resetTime?: number; message?: string }> {
    const rule = this.rules[endpoint]
    if (!rule) return { allowed: true }

    const key = `rate_limit:${endpoint}:${identifier}`
    const blockKey = `blocked:${endpoint}:${identifier}`

    // 블록 상태 확인
    const isBlocked = await this.redis.get(blockKey)
    if (isBlocked) {
      const resetTime = await this.redis.ttl(blockKey)
      return {
        allowed: false,
        resetTime: Date.now() + resetTime * 1000,
        message: rule.message,
      }
    }

    // 현재 요청 수 확인
    const current = await this.redis.incr(key)

    if (current === 1) {
      // 첫 요청이면 TTL 설정
      await this.redis.pexpire(key, rule.windowMs)
    }

    if (current > rule.maxRequests) {
      // 제한 초과시 블록 설정
      await this.redis.psetex(blockKey, rule.blockDurationMs, '1')

      // 의심스러운 활동 로깅
      this.logSuspiciousActivity(identifier, endpoint, current, req)

      return {
        allowed: false,
        resetTime: Date.now() + rule.blockDurationMs,
        message: rule.message,
      }
    }

    return { allowed: true }
  }

  private async logSuspiciousActivity(
    identifier: string,
    endpoint: string,
    requestCount: number,
    req: Request
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      identifier,
      endpoint,
      requestCount,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      headers: req.headers,
      severity: requestCount > 50 ? 'HIGH' : 'MEDIUM',
    }

    // 로그 저장 (실제로는 전용 로깅 시스템 사용)
    console.warn('Suspicious activity detected:', logData)

    // 높은 위험도면 자동 차단 시간 연장
    if (requestCount > 100) {
      const extendedBlockKey = `extended_block:${identifier}`
      await this.redis.psetex(extendedBlockKey, 24 * 60 * 60 * 1000, '1') // 24시간
    }
  }
}

// 미들웨어 적용
const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const limiter = new AdvancedRateLimiter()
  const identifier = req.user?.id || req.ip
  const endpoint = `${req.method}:${req.route?.path || req.path}`

  const result = await limiter.checkRateLimit(identifier, endpoint, req)

  if (!result.allowed) {
    return res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: result.message,
        details: {
          resetTime: result.resetTime,
        },
      },
    })
  }

  next()
}
```

### 6. Data Encryption Pattern

```typescript
// WHY: 민감한 데이터 보호 (PII, 개인 취향 정보)
// PATTERN: AES-256-GCM encryption for sensitive fields

import crypto from 'crypto'

class EncryptionService {
  private readonly algorithm = 'aes-256-gcm'
  private readonly keyLength = 32 // 256 bits
  private readonly ivLength = 16 // 128 bits
  private readonly tagLength = 16 // 128 bits

  private readonly masterKey: Buffer

  constructor() {
    const key = process.env.ENCRYPTION_KEY
    if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required')
    }
    this.masterKey = Buffer.from(key, 'hex')
  }

  // 데이터 암호화
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength)
    const cipher = crypto.createCipher(this.algorithm, this.masterKey, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const tag = cipher.getAuthTag()

    // IV + Tag + Encrypted data 형태로 저장
    return iv.toString('hex') + tag.toString('hex') + encrypted
  }

  // 데이터 복호화
  decrypt(encryptedData: string): string {
    const iv = Buffer.from(encryptedData.slice(0, this.ivLength * 2), 'hex')
    const tag = Buffer.from(
      encryptedData.slice(this.ivLength * 2, (this.ivLength + this.tagLength) * 2),
      'hex'
    )
    const encrypted = encryptedData.slice((this.ivLength + this.tagLength) * 2)

    const decipher = crypto.createDecipher(this.algorithm, this.masterKey, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  }

  // 해시 (검색 가능한 형태)
  hash(data: string): string {
    return crypto.createHmac('sha256', this.masterKey).update(data).digest('hex')
  }
}

// 민감한 필드 자동 암호화 데코레이터
function Encrypted(target: any, propertyKey: string) {
  const encryptionService = new EncryptionService()

  // getter
  Object.defineProperty(target, propertyKey, {
    get: function () {
      const encryptedValue = this[`_${propertyKey}`]
      return encryptedValue ? encryptionService.decrypt(encryptedValue) : null
    },

    // setter
    set: function (value: string) {
      this[`_${propertyKey}`] = value ? encryptionService.encrypt(value) : null
    },

    enumerable: true,
    configurable: true,
  })
}

// 사용 예시
class User {
  public id: string
  public email: string

  @Encrypted
  public personalNotes: string // 개인 메모 (암호화)

  @Encrypted
  public preferences: string // 사용자 취향 정보 (암호화)

  // 내부 저장용 (실제로는 암호화된 데이터)
  private _personalNotes: string
  private _preferences: string
}
```

## INTEGRATION_EXAMPLE

```typescript
// 모든 보안 패턴이 적용된 인증 컨트롤러
@Controller('/api/auth')
@UseMiddleware(rateLimitMiddleware)
@UseMiddleware(sanitizeMiddleware)
export class AuthController {
  constructor(
    private jwtService: JWTService,
    private passwordService: PasswordService,
    private encryptionService: EncryptionService
  ) {}

  @Post('/login')
  @RateLimit({ endpoint: 'POST:/api/auth/login' })
  async login(@Body() credentials: LoginDto, @Req() req: Request): Promise<ApiResponse<TokenPair>> {
    // 1. 입력 검증 및 정화 (미들웨어에서 처리됨)

    // 2. 사용자 조회
    const user = await this.userService.findByEmail(credentials.email)
    if (!user) {
      throw new ApiError(ErrorCodes.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    // 3. 비밀번호 검증
    const isValidPassword = await this.passwordService.verifyPassword(
      credentials.password,
      user.hashedPassword
    )

    if (!isValidPassword) {
      // 실패 로그 (보안 감사용)
      this.logFailedLogin(user.email, req.ip, req.get('User-Agent'))

      throw new ApiError(ErrorCodes.UNAUTHORIZED, '이메일 또는 비밀번호가 올바르지 않습니다.', 401)
    }

    // 4. 토큰 발급
    const tokens = await this.jwtService.generateTokenPair(user)

    // 5. 성공 로그
    this.logSuccessfulLogin(user.id, req.ip)

    return {
      success: true,
      data: tokens,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    }
  }

  @Post('/register')
  @RateLimit({ endpoint: 'POST:/api/auth/register' })
  async register(@Body() userData: RegisterDto): Promise<ApiResponse<User>> {
    // 1. 비밀번호 정책 검증
    const passwordStrength = this.passwordService.measurePasswordStrength(userData.password)

    if (passwordStrength.level === 'weak') {
      throw new ApiError(
        ErrorCodes.VALIDATION_ERROR,
        '비밀번호가 너무 약합니다.',
        400,
        passwordStrength.suggestions
      )
    }

    // 2. 비밀번호 해싱
    const hashedPassword = await this.passwordService.hashPassword(userData.password)

    // 3. 사용자 생성 (민감한 데이터는 자동 암호화됨)
    const user = await this.userService.create({
      ...userData,
      hashedPassword,
      role: UserRole.USER,
    })

    return {
      success: true,
      data: user,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0',
      },
    }
  }

  private logFailedLogin(email: string, ip: string, userAgent?: string) {
    // 보안 감사 로그
    console.warn('Failed login attempt:', {
      email: this.encryptionService.hash(email), // 이메일은 해시로 저장
      ip,
      userAgent,
      timestamp: new Date().toISOString(),
    })
  }

  private logSuccessfulLogin(userId: string, ip: string) {
    console.info('Successful login:', {
      userId,
      ip,
      timestamp: new Date().toISOString(),
    })
  }
}
```

## BENEFITS

- ✅ 다층 보안 방어
- ✅ 개인정보 보호
- ✅ 무차별 공격 방지
- ✅ 감사 추적 가능

## GOTCHAS

- ⚠️ 성능 오버헤드 고려
- ⚠️ 키 관리 중요
- ⚠️ 과도한 제한은 UX 저해

## RELATED_FILES

- docs/patterns/api-design-patterns.md
- docs/decisions/004-architecture-patterns.md
- src/modules/auth/ (구현 예정)
