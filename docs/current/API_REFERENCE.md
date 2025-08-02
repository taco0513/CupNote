# CupNote API 레퍼런스

## 📋 목차
1. [개요](#개요)
2. [Supabase 서비스](#supabase-서비스)
3. [매치 스코어 시스템](#매치-스코어-시스템)
4. [성취 시스템](#성취-시스템)
5. [스토리지 시스템](#스토리지-시스템)
6. [유틸리티 함수](#유틸리티-함수)
7. [Context API](#context-api)
8. [커스텀 훅](#커스텀-훅)

## 📖 개요

CupNote의 API는 크게 다음과 같이 구성됩니다:
- **Supabase 통합**: 데이터베이스 및 인증
- **로컬 스토리지**: 오프라인 지원
- **비즈니스 로직**: 매치 스코어, 성취 시스템
- **React Context**: 전역 상태 관리
- **커스텀 훅**: 재사용 가능한 로직

## 🗄️ Supabase 서비스

### supabase.ts
**경로**: `src/lib/supabase.ts`
**용도**: Supabase 클라이언트 초기화

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

### supabase-service.ts
**경로**: `src/lib/supabase-service.ts`
**용도**: 커피 기록 CRUD 작업

```typescript
// 커피 기록 생성
export async function createCoffeeRecord(
  record: Omit<CoffeeRecord, 'id' | 'created_at'>
): Promise<CoffeeRecord>

// 커피 기록 조회
export async function getCoffeeRecords(
  userId: string,
  options?: {
    limit?: number
    offset?: number
    orderBy?: string
  }
): Promise<CoffeeRecord[]>

// 커피 기록 업데이트
export async function updateCoffeeRecord(
  id: string,
  updates: Partial<CoffeeRecord>
): Promise<CoffeeRecord>

// 커피 기록 삭제
export async function deleteCoffeeRecord(id: string): Promise<void>
```

### supabase-storage.ts
**경로**: `src/lib/supabase-storage.ts`
**용도**: 통합 스토리지 관리 (온라인/오프라인)

```typescript
export const SupabaseStorage = {
  // 레코드 저장 (온라인/오프라인 자동 처리)
  saveRecord: async (record: CoffeeRecord): Promise<CoffeeRecord>
  
  // 레코드 조회
  getRecords: async (userId?: string): Promise<CoffeeRecord[]>
  
  // 레코드 업데이트
  updateRecord: async (id: string, updates: Partial<CoffeeRecord>): Promise<void>
  
  // 레코드 삭제
  deleteRecord: async (id: string): Promise<void>
  
  // 동기화 상태 확인
  getSyncStatus: async (): Promise<SyncStatus>
}
```

### supabase-image-service.ts
**경로**: `src/lib/supabase-image-service.ts`
**용도**: 이미지 업로드 및 관리

```typescript
// 이미지 업로드
export async function uploadImage(
  file: File,
  options?: {
    bucket?: string
    folder?: string
    resize?: { width: number; height: number }
  }
): Promise<ImageUploadResult>

// 썸네일 생성
export async function generateThumbnail(
  imageUrl: string,
  size: 'sm' | 'md' | 'lg'
): Promise<string>

// 이미지 삭제
export async function deleteImage(url: string): Promise<void>

// 이미지 URL 생성
export function getPublicUrl(path: string): string
```

## 🎯 매치 스코어 시스템

### match-score.ts
**경로**: `src/lib/match-score.ts`
**용도**: 사용자 선택과 로스터 노트 매칭

```typescript
// 매치 스코어 계산 (Enhanced v2.0)
export function calculateMatchScore(
  userFlavors: string[],
  userExpressions: string[],
  roasterNote: string,
  useEnhanced: boolean = true
): MatchScoreResult

interface MatchScoreResult {
  finalScore: number       // 0-100
  flavorScore: number      // 0-100
  sensoryScore: number     // 0-100
  message: string          // 피드백 메시지
  matchedFlavors: string[] // 매칭된 향미
  matchedSensory: string[] // 매칭된 감각
  roasterNote: string      // 원본 로스터 노트
}
```

### fuzzy-matching.ts
**경로**: `src/lib/fuzzy-matching.ts`
**용도**: 퍼지 매칭 및 한글 음성학적 유사도

```typescript
// 전체 유사도 계산
export function calculateOverallSimilarity(
  keyword: string,
  userSelection: string,
  roasterNote?: string
): FuzzyMatchResult

// 한글 음성학적 유사도
export function calculateKoreanPhoneticSimilarity(
  str1: string,
  str2: string
): number

// 텍스트 정규화
export function normalizeText(text: string): string
```

### enhanced-dictionaries.ts
**경로**: `src/lib/enhanced-dictionaries.ts`
**용도**: 향미 및 감각 프로필 사전

```typescript
export interface FlavorProfile {
  primary: string[]    // 직접 매칭 (1.0)
  related: string[]    // 관련 향미 (0.8)
  similar: string[]    // 유사 향미 (0.6)
  opposite: string[]   // 반대 향미 (-0.3)
  intensity: number    // 향미 강도 (1-5)
  categories: string[] // 카테고리
  confidence: number   // 매칭 신뢰도
}

// 40+ 향미 프로필
export const ENHANCED_FLAVOR_PROFILES: Record<string, FlavorProfile>

// 25+ 감각 프로필
export const ENHANCED_SENSORY_PROFILES: Record<string, SensoryProfile>
```

### community-match.ts
**경로**: `src/lib/community-match.ts`
**용도**: 커뮤니티 기반 매칭 점수

```typescript
// 커뮤니티 데이터 기반 점수 계산
export async function calculateCommunityScore(
  coffeeInfo: {
    roastery: string
    coffeeName: string
    origin?: string
  }
): Promise<number>

// 커뮤니티 평균 조회
export async function getCommunityAverage(
  filters: CommunityFilters
): Promise<CommunityStats>
```

## 🏆 성취 시스템

### achievements.ts
**경로**: `src/lib/achievements.ts`
**용도**: 성취 시스템 로직

```typescript
export class AchievementSystem {
  // 사용자 통계 계산
  static calculateUserStats(records: CoffeeRecord[]): UserStats
  
  // 성취 체크 및 업데이트
  static checkAchievements(
    records: CoffeeRecord[],
    newRecord?: CoffeeRecord
  ): Achievement[]
  
  // 레벨 계산
  static calculateLevel(points: number): UserLevel
  
  // 연속 기록 계산
  static calculateStreaks(records: CoffeeRecord[]): StreakInfo
}

// 기본 성취 목록 (16개)
export const DEFAULT_ACHIEVEMENTS: Achievement[]

// 레벨 시스템 (10 레벨)
export const LEVEL_SYSTEM: LevelInfo[]
```

### supabase-achievements.ts
**경로**: `src/lib/supabase-achievements.ts`
**용도**: 성취 데이터베이스 연동

```typescript
// 성취 달성 체크 및 저장
export async function checkAndUnlockAchievements(
  userId: string,
  newTasting?: TastingSession
): Promise<AchievementUnlock[]>

// 사용자 성취 조회
export async function getUserAchievements(
  userId: string
): Promise<UserAchievements>

// 성취 진행도 업데이트
export async function updateAchievementProgress(
  userId: string,
  achievementId: string,
  progress: number
): Promise<void>
```

## 💾 스토리지 시스템

### offline-storage.ts
**경로**: `src/lib/offline-storage.ts`
**용도**: IndexedDB 기반 오프라인 스토리지

```typescript
export const offlineStorage = {
  // 레코드 저장
  saveRecord: async (record: CoffeeRecord): Promise<void>
  
  // 레코드 조회
  getRecords: async (userId: string): Promise<CoffeeRecord[]>
  
  // 레코드 업데이트
  updateRecord: async (id: string, updates: Partial<CoffeeRecord>): Promise<void>
  
  // 레코드 삭제
  deleteRecord: async (id: string): Promise<void>
  
  // 전체 삭제
  clear: async (): Promise<void>
}
```

### offline-sync.ts
**경로**: `src/lib/offline-sync.ts`
**용도**: 온라인/오프라인 데이터 동기화

```typescript
// 동기화 실행
export async function syncOfflineData(
  userId: string
): Promise<SyncResult>

// 동기화 상태 확인
export function getSyncStatus(): SyncStatus

// 충돌 해결
export async function resolveConflicts(
  localData: CoffeeRecord[],
  remoteData: CoffeeRecord[]
): Promise<CoffeeRecord[]>
```

### cache-service.ts
**경로**: `src/lib/cache-service.ts`
**용도**: 2단계 캐싱 시스템

```typescript
export class CacheService {
  // 캐시 설정
  static async set(key: string, data: any, ttl?: number): Promise<void>
  
  // 캐시 조회
  static async get<T>(key: string): Promise<T | null>
  
  // 캐시 삭제
  static async delete(key: string): Promise<void>
  
  // 캐시 초기화
  static async clear(): Promise<void>
  
  // 캐시 통계
  static getStats(): CacheStats
}
```

## 🛠️ 유틸리티 함수

### flavorData.ts
**경로**: `src/lib/flavorData.ts`
**용도**: 향미 및 감각 데이터 정의

```typescript
// 향미 카테고리
export const FLAVOR_CATEGORIES = {
  fruity: ['베리', '시트러스', '열대과일', ...],
  nutty: ['아몬드', '헤이즐넛', '땅콩', ...],
  chocolate: ['다크초콜릿', '밀크초콜릿', '코코아', ...],
  // ... 더 많은 카테고리
}

// 감각 표현
export const SENSORY_EXPRESSIONS = {
  mouthfeel: ['부드러운', '크리미한', '실키한', ...],
  acidity: ['밝은', '생생한', '과일산미', ...],
  sweetness: ['달콤한', '꿀같은', '캐러멜', ...],
  // ... 더 많은 표현
}
```

### query-optimizer.ts
**경로**: `src/lib/query-optimizer.ts`
**용도**: 데이터베이스 쿼리 최적화

```typescript
// 쿼리 최적화
export function optimizeQuery(
  query: SupabaseQuery,
  options: QueryOptions
): OptimizedQuery

// 페이지네이션 헬퍼
export function getPaginationParams(
  page: number,
  pageSize: number
): PaginationParams

// 필터 최적화
export function optimizeFilters(
  filters: FilterOptions
): OptimizedFilters
```

### error-handler.ts
**경로**: `src/lib/error-handler.ts`
**용도**: 통합 에러 처리

```typescript
// 에러 처리
export function handleError(
  error: unknown,
  context?: ErrorContext
): ErrorResult

// 에러 로깅
export function logError(
  error: Error,
  severity: 'low' | 'medium' | 'high' | 'critical'
): void

// 사용자 친화적 메시지 변환
export function getErrorMessage(error: unknown): string
```

## 🌐 Context API

### AuthContext.tsx
**경로**: `src/contexts/AuthContext.tsx`
**용도**: 인증 상태 관리

```typescript
interface AuthContextValue {
  user: User | null
  loading: boolean
  error: Error | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, username: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
}

// 사용법
const { user, signIn, signOut } = useAuth()
```

### NotificationContext.tsx
**경로**: `src/contexts/NotificationContext.tsx`
**용도**: 알림 시스템

```typescript
interface NotificationContextValue {
  notifications: Notification[]
  addNotification: (notification: NotificationInput) => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

// 사용법
const { addNotification } = useNotification()
addNotification({
  type: 'success',
  title: '저장 완료',
  message: '커피 기록이 저장되었습니다'
})
```

### ThemeContext.tsx
**경로**: `src/contexts/ThemeContext.tsx`
**용도**: 테마 관리 (Light mode only)

```typescript
interface ThemeContextValue {
  theme: 'light'
  isDark: false
  toggleTheme: () => void // No-op in v1.0
}
```

## 🪝 커스텀 훅

### useFormValidation.ts
**경로**: `src/hooks/useFormValidation.ts`
**용도**: 폼 유효성 검사

```typescript
interface UseFormValidationOptions {
  rules: ValidationRules
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
}

export function useFormValidation<T>(
  initialValues: T,
  options: UseFormValidationOptions
): {
  values: T
  errors: Partial<Record<keyof T, string>>
  isValid: boolean
  handleChange: (name: keyof T, value: any) => void
  handleBlur: (name: keyof T) => void
  validateAll: () => boolean
  reset: () => void
}
```

### useNetworkStatus.ts
**경로**: `src/hooks/useNetworkStatus.ts`
**용도**: 네트워크 상태 감지

```typescript
export function useNetworkStatus(): {
  isOnline: boolean
  isSlowConnection: boolean
  connectionType: string | undefined
  effectiveType: string | undefined
}
```

### usePerformanceMonitor.ts
**경로**: `src/hooks/usePerformanceMonitor.ts`
**용도**: 성능 모니터링

```typescript
export function usePerformanceMonitor(
  componentName: string
): {
  metrics: PerformanceMetrics
  startMeasure: (label: string) => void
  endMeasure: (label: string) => void
  logMetrics: () => void
}
```

### usePerformanceMonitorAdvanced.ts
**경로**: `src/hooks/usePerformanceMonitorAdvanced.ts`
**용도**: 고급 성능 모니터링

```typescript
export function usePerformanceMonitorAdvanced(
  options: PerformanceMonitorOptions
): {
  metrics: DetailedMetrics
  webVitals: WebVitalsMetrics
  customMetrics: Map<string, number>
  reportPerformance: () => Promise<void>
}
```

## 🔗 API 호출 예시

### 커피 기록 생성
```typescript
import { SupabaseStorage } from '@/lib/supabase-storage'

const newRecord = await SupabaseStorage.saveRecord({
  roastery: '블루보틀',
  coffeeName: '벨라 도노반',
  rating: 4.5,
  flavors: ['초콜릿', '캐러멜', '견과류'],
  // ... 기타 필드
})
```

### 매치 스코어 계산
```typescript
import { calculateMatchScore } from '@/lib/match-score'

const result = calculateMatchScore(
  ['초콜릿', '캐러멜'],
  ['부드러운', '달콤한'],
  '다크 초콜릿과 캐러멜의 달콤함'
)
console.log(result.finalScore) // 85-95
```

### 성취 체크
```typescript
import { checkAndUnlockAchievements } from '@/lib/supabase-achievements'

const newAchievements = await checkAndUnlockAchievements(
  userId,
  newTastingSession
)
```

## 📚 관련 문서

- [개발 환경 설정](./DEVELOPMENT_SETUP.md)
- [컴포넌트 가이드](./COMPONENTS_GUIDE.md)
- [데이터베이스 스키마](./DATABASE_SCHEMA.md)