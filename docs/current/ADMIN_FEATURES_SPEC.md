# 관리자 대시보드 기능 상세 명세서

## 📋 목차
1. [시스템 대시보드](#시스템-대시보드)
2. [사용자 관리](#사용자-관리)
3. [커피 기록 관리](#커피-기록-관리)
4. [성능 모니터링](#성능-모니터링)
5. [피드백 관리](#피드백-관리)
6. [데이터 관리](#데이터-관리)
7. [시스템 설정](#시스템-설정)

---

## 🏠 시스템 대시보드

**URL**: `/admin`
**목적**: CupNote 플랫폼의 전체 현황을 한눈에 파악

### 주요 지표 카드

#### 1. 사용자 통계
```typescript
interface UserMetrics {
  total_users: number          // 총 가입자 수
  active_users_today: number   // 오늘 활성 사용자
  new_users_today: number      // 오늘 신규 가입자
  retention_rate: number       // 사용자 유지율 (7일)
  growth_rate: number          // 성장률 (월간)
}
```

**UI 구성**:
```tsx
<MetricCard
  title="총 사용자"
  value={userMetrics.total_users}
  change={userMetrics.growth_rate}
  trend="up"
  icon={<Users />}
/>
```

#### 2. 커피 기록 통계
```typescript
interface RecordMetrics {
  total_records: number        // 총 기록 수
  records_today: number        // 오늘 기록 수
  avg_records_per_user: number // 사용자당 평균 기록
  mode_distribution: {         // 모드별 분포
    cafe: number
    homecafe: number
    lab: number
  }
  popular_origin: string       // 인기 원산지
}
```

#### 3. 시스템 성능
```typescript
interface SystemMetrics {
  response_time: number        // 평균 응답 시간 (ms)
  error_rate: number           // 오류율 (%)
  uptime: number               // 가동 시간 (%)
  database_size: string        // 데이터베이스 크기
  storage_used: string         // 스토리지 사용량
}
```

### 실시간 활동 피드

#### 최근 활동 목록
```typescript
interface ActivityItem {
  id: string
  type: 'user_signup' | 'record_created' | 'feedback_submitted' | 'error_occurred'
  user_id?: string
  user_name?: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}
```

**활동 타입별 표시**:
- 🆕 신규 사용자 가입
- ☕ 새로운 커피 기록
- 💬 피드백 제출
- ⚠️ 시스템 오류
- 🔧 시스템 설정 변경

### 알림 및 경고

#### 시스템 알림
```typescript
interface SystemAlert {
  id: string
  level: 'info' | 'warning' | 'error' | 'critical'
  title: string
  message: string
  action?: {
    label: string
    url: string
  }
  auto_dismiss: boolean
  created_at: string
}
```

**알림 우선순위**:
1. **Critical**: 시스템 장애, 보안 위협
2. **Error**: 기능 오류, 데이터 손실
3. **Warning**: 성능 저하, 용량 부족
4. **Info**: 업데이트, 정기 알림

---

## 👥 사용자 관리

**URL**: `/admin/users`
**목적**: 사용자 계정 및 활동 관리

### 사용자 목록

#### 필터링 옵션
```typescript
interface UserFilters {
  status: 'all' | 'active' | 'inactive' | 'suspended'
  role: 'all' | 'admin' | 'user'
  registration_date: {
    from: string
    to: string
  }
  activity_level: 'all' | 'high' | 'medium' | 'low' | 'none'
  search_query: string
}
```

#### 사용자 데이터 구조
```typescript
interface AdminUserView {
  id: string
  email: string
  username: string
  avatar_url?: string
  role: 'admin' | 'user'
  status: 'active' | 'suspended' | 'deleted'
  created_at: string
  last_sign_in_at?: string
  email_confirmed_at?: string
  
  // 통계 정보
  stats: {
    total_records: number
    last_record_date?: string
    favorite_mode: 'cafe' | 'homecafe' | 'lab'
    avg_rating: number
    total_photos: number
  }
  
  // 활동 지표
  activity: {
    login_count: number
    records_this_month: number
    engagement_score: number
  }
}
```

### 사용자 상세 페이지

**URL**: `/admin/users/[id]`

#### 기본 정보 탭
- 프로필 정보 및 수정
- 계정 상태 관리
- 권한 설정
- 로그인 이력

#### 활동 내역 탭
```typescript
interface UserActivity {
  login_history: Array<{
    timestamp: string
    ip_address: string
    user_agent: string
    success: boolean
  }>
  
  record_history: Array<{
    id: string
    mode: string
    coffee_name: string
    rating: number
    created_at: string
  }>
  
  feedback_history: Array<{
    id: string
    type: string
    message: string
    status: string
    created_at: string
  }>
}
```

#### 통계 탭
- 기록 생성 패턴 (시간대별, 요일별)
- 선호 커피 타입 분석
- 평점 분포
- 사진 업로드 현황

### 일괄 작업

#### 사용자 관리 액션
```typescript
interface BulkUserActions {
  suspend_users: (userIds: string[], reason: string) => Promise<void>
  activate_users: (userIds: string[]) => Promise<void>
  send_notification: (userIds: string[], message: NotificationData) => Promise<void>
  export_users: (filters: UserFilters) => Promise<Blob>
  update_role: (userIds: string[], role: 'admin' | 'user') => Promise<void>
}
```

---

## ☕ 커피 기록 관리

**URL**: `/admin/records`
**목적**: 모든 사용자의 커피 기록 통합 관리

### 기록 목록 및 필터링

#### 필터 옵션
```typescript
interface RecordFilters {
  mode: 'all' | 'cafe' | 'homecafe' | 'lab'
  date_range: {
    from: string
    to: string
  }
  rating_range: {
    min: number
    max: number
  }
  origin_country: string[]
  roaster: string[]
  has_photo: boolean
  user_id?: string
  reported: boolean
}
```

#### 기록 관리 뷰
```typescript
interface AdminRecordView {
  id: string
  user: {
    id: string
    username: string
    email: string
  }
  mode: 'cafe' | 'homecafe' | 'lab'
  coffee_info: {
    name: string
    roaster?: string
    origin?: string
    processing?: string
  }
  rating: number
  notes: string
  photos: string[]
  created_at: string
  updated_at: string
  
  // 관리자 전용 필드
  admin_notes?: string
  flagged: boolean
  flag_reason?: string
  moderation_status: 'approved' | 'pending' | 'rejected'
}
```

### 콘텐츠 모더레이션

#### 신고 시스템
```typescript
interface ContentReport {
  id: string
  record_id: string
  reporter_id: string
  reason: 'spam' | 'inappropriate' | 'fake' | 'other'
  description: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
  reviewed_by?: string
  reviewed_at?: string
  action_taken?: string
}
```

#### 모더레이션 워크플로우
1. **자동 필터링**: AI/ML 기반 부적절한 콘텐츠 감지
2. **사용자 신고**: 커뮤니티 기반 신고 시스템
3. **관리자 검토**: 수동 검토 및 조치
4. **조치 실행**: 경고, 삭제, 계정 제재

### 데이터 분석

#### 트렌드 분석
```typescript
interface RecordTrends {
  popular_origins: Array<{
    country: string
    count: number
    growth_rate: number
  }>
  
  trending_roasters: Array<{
    name: string
    avg_rating: number
    record_count: number
  }>
  
  flavor_patterns: Array<{
    flavor: string
    frequency: number
    avg_rating: number
  }>
  
  seasonal_trends: Array<{
    month: string
    record_count: number
    avg_rating: number
  }>
}
```

---

## 📊 성능 모니터링

**URL**: `/admin/analytics`
**목적**: 시스템 성능 및 사용자 행동 분석

### 웹 성능 지표

#### Core Web Vitals
```typescript
interface WebVitals {
  lcp: number  // Largest Contentful Paint
  fid: number  // First Input Delay  
  cls: number  // Cumulative Layout Shift
  fcp: number  // First Contentful Paint
  ttfb: number // Time to First Byte
}
```

#### 페이지별 성능
```typescript
interface PagePerformance {
  route: string
  avg_load_time: number
  bounce_rate: number
  conversion_rate: number
  error_rate: number
  traffic_volume: number
}
```

### 데이터베이스 성능

#### 쿼리 분석
```typescript
interface QueryAnalytics {
  slow_queries: Array<{
    query: string
    avg_duration: number
    frequency: number
    table: string
  }>
  
  connection_stats: {
    active_connections: number
    max_connections: number
    connection_errors: number
  }
  
  storage_stats: {
    database_size: string
    table_sizes: Record<string, string>
    growth_rate: number
  }
}
```

### 오류 추적

#### 오류 분류
```typescript
interface ErrorTracking {
  javascript_errors: Array<{
    message: string
    stack_trace: string
    frequency: number
    user_agents: string[]
    first_seen: string
    last_seen: string
  }>
  
  api_errors: Array<{
    endpoint: string
    status_code: number
    error_rate: number
    avg_response_time: number
  }>
  
  database_errors: Array<{
    error_type: string
    query: string
    frequency: number
    impact_score: number
  }>
}
```

### 사용자 행동 분석

#### 사용자 여정
```typescript
interface UserJourney {
  funnel_analytics: {
    registration: number
    first_record: number
    second_record: number
    monthly_active: number
  }
  
  feature_usage: Record<string, {
    usage_count: number
    unique_users: number
    avg_session_time: number
  }>
  
  retention_cohorts: Array<{
    cohort_month: string
    users: number
    retention_rates: number[]
  }>
}
```

---

## 💬 피드백 관리

**URL**: `/admin/feedback`
**목적**: 사용자 피드백 및 지원 요청 관리

### 피드백 분류 시스템

#### 피드백 타입
```typescript
interface FeedbackCategory {
  bug_report: {
    severity: 'low' | 'medium' | 'high' | 'critical'
    reproducible: boolean
    browser: string
    device: string
  }
  
  feature_request: {
    priority: 'low' | 'medium' | 'high'
    votes: number
    effort_estimate: 'small' | 'medium' | 'large'
  }
  
  general_feedback: {
    sentiment: 'positive' | 'neutral' | 'negative'
    category: 'ui' | 'performance' | 'content' | 'other'
  }
  
  support_request: {
    urgency: 'low' | 'medium' | 'high'
    category: 'account' | 'technical' | 'billing' | 'other'
  }
}
```

### 피드백 워크플로우

#### 상태 관리
```typescript
interface FeedbackStatus {
  status: 'new' | 'triaged' | 'in_progress' | 'resolved' | 'closed'
  assigned_to?: string
  priority: 'p1' | 'p2' | 'p3' | 'p4'
  tags: string[]
  resolution?: {
    type: 'fixed' | 'wont_fix' | 'duplicate' | 'invalid'
    description: string
    version?: string
  }
}
```

#### 자동 분류 시스템
```typescript
interface AutoClassification {
  sentiment_analysis: {
    score: number  // -1 (negative) to 1 (positive)
    confidence: number
  }
  
  category_prediction: {
    category: string
    confidence: number
  }
  
  priority_suggestion: {
    priority: 'low' | 'medium' | 'high'
    reasoning: string
  }
}
```

### 응답 템플릿

#### 사전 정의된 응답
```typescript
interface ResponseTemplate {
  id: string
  name: string
  category: string
  subject: string
  body: string
  variables: string[]  // {user_name}, {issue_type} 등
  auto_close: boolean
}
```

### 피드백 분석

#### 트렌드 분석
```typescript
interface FeedbackTrends {
  volume_by_type: Record<string, number>
  sentiment_trends: Array<{
    date: string
    positive: number
    neutral: number
    negative: number
  }>
  
  common_issues: Array<{
    issue: string
    frequency: number
    trend: 'increasing' | 'stable' | 'decreasing'
  }>
  
  resolution_metrics: {
    avg_response_time: number
    avg_resolution_time: number
    satisfaction_score: number
  }
}
```

---

## 🗄️ 데이터 관리

**URL**: `/admin/data`
**목적**: 플랫폼 기초 데이터 관리 (카페, 로스터리, 커피 정보)

### 카페 데이터 관리

**URL**: `/admin/data/cafes`

#### 카페 정보 구조
```typescript
interface CafeData {
  id: string
  name: string
  name_en?: string
  address: {
    street: string
    city: string
    state: string
    country: string
    postal_code: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  contact: {
    phone?: string
    email?: string
    website?: string
    instagram?: string
  }
  hours: Array<{
    day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
    open: string
    close: string
    closed: boolean
  }>
  features: string[]  // ['wifi', 'outdoor_seating', 'roasts_on_site']
  photos: string[]
  verified: boolean
  created_at: string
  updated_at: string
  
  // 관리자 전용
  admin_notes?: string
  source: 'user_submission' | 'admin_added' | 'api_import'
  status: 'active' | 'pending' | 'inactive'
}
```

#### 카페 관리 기능
- 신규 카페 등록
- 기존 카페 정보 수정
- 사용자 제출 카페 승인/거부
- 일괄 데이터 가져오기/내보내기
- 중복 카페 병합

### 로스터리 데이터 관리

**URL**: `/admin/data/roasters`

#### 로스터리 정보 구조
```typescript
interface RoasterData {
  id: string
  name: string
  name_en?: string
  description?: string
  established?: number
  
  location: {
    city: string
    state?: string
    country: string
  }
  
  contact: {
    website?: string
    email?: string
    phone?: string
    social_media?: {
      instagram?: string
      facebook?: string
      twitter?: string
    }
  }
  
  specialties: string[]  // ['single_origin', 'espresso_blend', 'decaf']
  certifications: string[]  // ['organic', 'fair_trade', 'rainforest_alliance']
  
  logo_url?: string
  photos: string[]
  
  // 통계
  stats: {
    total_beans: number
    avg_rating: number
    review_count: number
  }
  
  verified: boolean
  featured: boolean
  created_at: string
  updated_at: string
}
```

### 커피 원두 데이터 관리

**URL**: `/admin/data/coffees`

#### 원두 정보 구조
```typescript
interface CoffeeData {
  id: string
  name: string
  roaster_id: string
  roaster_name: string
  
  origin: {
    country: string
    region?: string
    farm?: string
    altitude?: string
    coordinates?: {
      lat: number
      lng: number
    }
  }
  
  processing: {
    method: 'washed' | 'natural' | 'honey' | 'semi_washed' | 'other'
    details?: string
  }
  
  varieties: string[]  // ['bourbon', 'typica', 'gesha']
  harvest_year?: number
  
  roast: {
    level: 'light' | 'medium_light' | 'medium' | 'medium_dark' | 'dark'
    date?: string
    notes?: string
  }
  
  flavor_profile: {
    primary_flavors: string[]
    secondary_flavors: string[]
    acidity: number  // 1-5
    body: number     // 1-5
    sweetness: number // 1-5
  }
  
  brewing_recommendations: {
    methods: string[]  // ['espresso', 'pour_over', 'french_press']
    grind_size?: string
    water_temp?: string
    notes?: string
  }
  
  price?: {
    amount: number
    currency: string
    size: string  // '250g', '12oz'
  }
  
  photos: string[]
  availability: 'available' | 'limited' | 'sold_out' | 'discontinued'
  
  // 통계 및 관리
  stats: {
    record_count: number
    avg_rating: number
    popularity_score: number
  }
  
  verified: boolean
  featured: boolean
  created_at: string
  updated_at: string
}
```

### 데이터 품질 관리

#### 중복 제거
```typescript
interface DuplicateDetection {
  similarity_threshold: number
  potential_duplicates: Array<{
    items: Array<{id: string, name: string}>
    similarity_score: number
    suggested_action: 'merge' | 'keep_separate'
  }>
}
```

#### 데이터 검증
```typescript
interface DataValidation {
  missing_fields: Array<{
    id: string
    missing: string[]
    severity: 'warning' | 'error'
  }>
  
  invalid_data: Array<{
    id: string
    field: string
    value: any
    reason: string
  }>
  
  quality_score: {
    completeness: number  // 0-100
    accuracy: number      // 0-100
    consistency: number   // 0-100
  }
}
```

---

## ⚙️ 시스템 설정

**URL**: `/admin/settings`
**목적**: 플랫폼 전체 설정 및 운영 도구

### 공지사항 관리

#### 공지사항 구조
```typescript
interface Announcement {
  id: string
  title: string
  content: string
  type: 'maintenance' | 'feature' | 'important' | 'general'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  
  targeting: {
    all_users: boolean
    user_segments?: string[]  // ['new_users', 'active_users', 'premium_users']
    specific_users?: string[]
  }
  
  display: {
    position: 'banner' | 'modal' | 'notification'
    dismissible: boolean
    auto_dismiss_after?: number  // minutes
  }
  
  scheduling: {
    start_date: string
    end_date?: string
    timezone: string
  }
  
  status: 'draft' | 'scheduled' | 'active' | 'expired'
  created_by: string
  created_at: string
  updated_at: string
  
  // 성과 지표
  metrics: {
    views: number
    clicks: number
    dismissals: number
    engagement_rate: number
  }
}
```

### 피처 플래그 관리

#### 피처 플래그 시스템
```typescript
interface FeatureFlag {
  key: string
  name: string
  description: string
  enabled: boolean
  
  targeting: {
    percentage: number  // 0-100
    user_segments?: string[]
    specific_users?: string[]
    exclude_users?: string[]
  }
  
  conditions: {
    environment?: string[]
    date_range?: {
      start: string
      end: string
    }
    user_properties?: Record<string, any>
  }
  
  variations?: Array<{
    key: string
    value: any
    percentage: number
  }>
  
  metrics: {
    enabled_users: number
    conversion_rate?: number
    custom_metrics?: Record<string, number>
  }
  
  created_by: string
  created_at: string
  updated_at: string
}
```

### API 키 및 연동 관리

#### 외부 서비스 연동
```typescript
interface ExternalIntegration {
  service: string
  api_key: string
  endpoint: string
  status: 'active' | 'inactive' | 'error'
  
  configuration: Record<string, any>
  
  usage_stats: {
    requests_today: number
    requests_this_month: number
    rate_limit: number
    error_count: number
  }
  
  last_sync: string
  created_at: string
  updated_at: string
}
```

### 시스템 유지보수

#### 유지보수 모드
```typescript
interface MaintenanceMode {
  enabled: boolean
  message: string
  estimated_duration?: string
  bypass_ips?: string[]  // 관리자 IP 우회
  
  scheduled: {
    start_time: string
    end_time: string
    timezone: string
  }
  
  affected_services: string[]
  created_by: string
}
```

#### 백업 및 복원
```typescript
interface BackupSystem {
  automatic_backups: {
    enabled: boolean
    frequency: 'daily' | 'weekly' | 'monthly'
    retention_days: number
    storage_location: string
  }
  
  backup_history: Array<{
    id: string
    type: 'automatic' | 'manual'
    size: string
    created_at: string
    status: 'completed' | 'failed' | 'in_progress'
    download_url?: string
  }>
  
  restore_points: Array<{
    id: string
    description: string
    created_at: string
    database_version: string
  }>
}
```

### 보안 설정

#### 보안 정책
```typescript
interface SecuritySettings {
  password_policy: {
    min_length: number
    require_uppercase: boolean
    require_lowercase: boolean
    require_numbers: boolean
    require_symbols: boolean
    password_history: number
  }
  
  session_management: {
    max_session_duration: number  // hours
    concurrent_sessions: number
    require_reauth_for_sensitive: boolean
  }
  
  rate_limiting: {
    login_attempts: {
      max_attempts: number
      window_minutes: number
      lockout_duration: number
    }
    api_calls: {
      per_minute: number
      per_hour: number
    }
  }
  
  ip_filtering: {
    whitelist: string[]
    blacklist: string[]
    geo_blocking: string[]  // country codes
  }
}
```

---

## 🔍 검색 및 필터링

### 통합 검색 시스템

#### 검색 범위
```typescript
interface SearchScope {
  users: {
    fields: ['email', 'username', 'name']
    filters: ['status', 'role', 'created_date']
  }
  
  records: {
    fields: ['coffee_name', 'roaster', 'notes', 'origin']
    filters: ['mode', 'rating', 'date', 'user']
  }
  
  feedback: {
    fields: ['message', 'user_email', 'category']
    filters: ['status', 'type', 'priority', 'date']
  }
  
  system_logs: {
    fields: ['message', 'user', 'action']
    filters: ['level', 'date', 'category']
  }
}
```

### 고급 필터링

#### 동적 필터 시스템
```typescript
interface DynamicFilter {
  field: string
  operator: 'equals' | 'contains' | 'starts_with' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in'
  value: any
  condition: 'AND' | 'OR'
}

interface FilterGroup {
  filters: DynamicFilter[]
  condition: 'AND' | 'OR'
  nested_groups?: FilterGroup[]
}
```

---

## 📱 모바일 관리

### 반응형 관리자 인터페이스

#### 모바일 우선 기능
- 핵심 지표 대시보드
- 긴급 알림 관리
- 사용자 검색 및 기본 작업
- 피드백 확인 및 응답
- 시스템 상태 모니터링

#### 터치 최적화
- 큰 터치 타겟 (최소 44px)
- 스와이프 제스처 지원
- 풀 스크린 모달
- 간편한 네비게이션

---

## 🔔 알림 시스템

### 실시간 알림

#### 알림 타입
```typescript
interface AdminNotification {
  id: string
  type: 'system' | 'user' | 'content' | 'security'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  title: string
  message: string
  
  channels: Array<'web' | 'email' | 'slack' | 'sms'>
  
  target_admins: string[]  // 특정 관리자만 대상
  
  action?: {
    type: 'url' | 'function'
    value: string
  }
  
  read_by: Array<{
    admin_id: string
    read_at: string
  }>
  
  auto_dismiss: boolean
  expires_at?: string
  created_at: string
}
```

### 알림 설정

#### 개인별 알림 설정
```typescript
interface AdminNotificationSettings {
  admin_id: string
  
  email_notifications: {
    enabled: boolean
    frequency: 'immediate' | 'hourly' | 'daily'
    types: string[]
  }
  
  web_notifications: {
    enabled: boolean
    sound: boolean
    types: string[]
  }
  
  quiet_hours: {
    enabled: boolean
    start_time: string
    end_time: string
    timezone: string
  }
}
```

---

이 문서는 CupNote 관리자 대시보드의 모든 기능에 대한 상세한 명세를 제공합니다. 각 기능은 사용자 친화적이면서도 강력한 관리 도구를 제공하여 플랫폼의 효율적인 운영을 지원합니다.

**마지막 업데이트**: 2025-08-03
**문서 버전**: v1.0.0
**담당자**: CupNote 개발팀