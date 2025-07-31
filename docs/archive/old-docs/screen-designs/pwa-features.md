# 📱 PWA 기능 명세서

## 📱 PWA 개요

**CupNote PWA**는 네이티브 앱과 같은 사용자 경험을 제공하면서 웹의 접근성을 유지하는 프로그레시브 웹 앱입니다.

## 🎯 PWA 핵심 목적

- **앱과 같은 경험**: 홈 화면 설치, 전체화면 실행
- **오프라인 지원**: 인터넷 없이도 기본 기능 사용 가능
- **빠른 로딩**: 캐싱을 통한 즉시 실행
- **푸시 알림**: 사용자 참여도 향상 (향후 기능)

## 🔧 PWA 구성 요소

### 1. **Web App Manifest**

```json
// public/manifest.json
{
  "name": "CupNote - 커피 테이스팅 저널",
  "short_name": "CupNote",
  "description": "당신만의 커피 테이스팅 여정을 기록하세요",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FFF8F0",
  "theme_color": "#7C5842",
  "orientation": "portrait-primary",
  "categories": ["food", "lifestyle", "productivity"],
  "lang": "ko-KR",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/home-screen.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "홈 화면"
    },
    {
      "src": "/screenshots/tasting-flow.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "테이스팅 플로우"
    }
  ],
  "shortcuts": [
    {
      "name": "빠른 테이스팅",
      "url": "/mode-selection",
      "description": "새로운 커피 테이스팅 시작",
      "icons": [
        {
          "src": "/icons/shortcut-tasting.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "내 기록",
      "url": "/records",
      "description": "커피 테이스팅 기록 보기",
      "icons": [
        {
          "src": "/icons/shortcut-records.png",
          "sizes": "192x192"
        }
      ]
    }
  ]
}
```

### 2. **Service Worker 전략**

#### **캐싱 전략**

```javascript
// sw.js 의사코드
const CACHE_VERSION = 'cupnote-v1.0.0'
const STATIC_CACHE = 'cupnote-static'
const DYNAMIC_CACHE = 'cupnote-dynamic'
const IMAGE_CACHE = 'cupnote-images'

// 캐싱 전략 매핑
const CACHING_STRATEGIES = {
  // 즉시 응답이 필요한 정적 자원
  '/': 'cache-first',
  '/manifest.json': 'cache-first',
  '/icons/': 'cache-first',

  // 앱 셸과 핵심 자원
  '/assets/': 'stale-while-revalidate',
  '/css/': 'stale-while-revalidate',
  '/js/': 'stale-while-revalidate',

  // API 데이터 (신선함이 중요)
  '/api/auth': 'network-first',
  '/api/records': 'network-first',
  '/api/stats': 'stale-while-revalidate',

  // 사용자 생성 콘텐츠
  '/api/profile': 'network-first',
  '/api/settings': 'network-first',

  // 외부 리소스
  'https://fonts.googleapis.com': 'stale-while-revalidate',
  'https://cdn.': 'cache-first',
}
```

#### **오프라인 대응**

```javascript
// 오프라인 시나리오별 처리
const OFFLINE_RESPONSES = {
  // 기본 오프라인 페이지
  navigation: '/offline.html',

  // API 실패 시 캐시된 데이터
  'api-records': 'cached-records-fallback',
  'api-stats': 'cached-stats-fallback',

  // 새 기록 생성 시 임시 저장
  'api-create': 'store-in-indexeddb',

  // 이미지 로딩 실패
  images: '/images/placeholder-coffee.png',
}
```

### 3. **설치 프롬프트 관리**

#### **설치 유도 전략**

```typescript
interface InstallPromptManager {
  // 설치 조건 확인
  checkInstallCriteria(): boolean {
    return {
      visitCount: >= 3,           // 3회 이상 방문
      timeSpent: >= 300,          // 5분 이상 사용
      recordsCreated: >= 1,       // 최소 1개 기록
      returningUser: true,        // 재방문 사용자
      notDeclinedRecently: true   // 최근 거절하지 않음
    }
  }

  // 설치 프롬프트 표시
  showInstallPrompt(): void {
    // 사용자 친화적 타이밍에 표시
    // 1. 첫 기록 완료 후
    // 2. 통계 화면 조회 시
    // 3. 3번째 방문 시
  }
}
```

#### **설치 프롬프트 UI**

```
┌─────────────────────────┐
│ 📱 앱으로 설치하기        │
│                        │
│ ☕ 더 빠른 접근         │
│ 📴 오프라인 사용 가능    │
│ 🔔 알림 받기 (향후)     │
│                        │
│ [   설치하기   ] [나중에] │
└─────────────────────────┘
```

### 4. **오프라인 데이터 관리**

#### **IndexedDB 스키마**

```typescript
interface OfflineStorage {
  // 오프라인 생성된 기록
  pendingRecords: {
    id: string // 임시 UUID
    data: TastingSession // 전체 세션 데이터
    timestamp: number // 생성 시간
    syncStatus: 'pending' | 'syncing' | 'failed'
  }[]

  // 캐시된 사용자 데이터
  cachedData: {
    userProfile: UserProfile
    recentRecords: CoffeeRecord[]
    userStats: UserStats
    lastSync: number
  }

  // 설정 및 선호도
  userSettings: {
    theme: string
    language: string
    offlineMode: boolean
    autoSync: boolean
  }
}
```

#### **동기화 전략**

```typescript
class OfflineSync {
  // 온라인 복구 시 자동 동기화
  async syncPendingData(): Promise<void> {
    const pending = await this.getPendingRecords()

    for (const record of pending) {
      try {
        await this.uploadRecord(record.data)
        await this.markAsSynced(record.id)
      } catch (error) {
        await this.markAsFailed(record.id, error)
      }
    }
  }

  // 백그라운드 동기화 (향후)
  async backgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('cupnote-data-sync')
    }
  }
}
```

### 5. **성능 최적화**

#### **앱 셸 모델**

```
App Shell (항상 캐시됨):
├── HTML 기본 구조
├── CSS 핵심 스타일
├── JavaScript 런타임
├── 네비게이션 구조
└── 오프라인 표시

Dynamic Content (동적 로딩):
├── 사용자 데이터
├── 커피 기록
├── 통계 정보
└── 설정 값
```

#### **Lighthouse 성능 목표**

```yaml
performance_targets:
  lighthouse_score: >= 90
  first_contentful_paint: <= 1.5s
  largest_contentful_paint: <= 2.5s
  cumulative_layout_shift: <= 0.1
  first_input_delay: <= 100ms

pwa_audit:
  installable: ✓
  splash_screen: ✓
  themed_address_bar: ✓
  offline_functionality: ✓
  manifest_validity: ✓
```

### 6. **브라우저별 최적화**

#### **iOS Safari 특별 처리**

```html
<!-- iOS 홈 화면 추가 최적화 -->
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="CupNote" />

<!-- iOS 아이콘 -->
<link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
<link
  rel="apple-touch-startup-image"
  href="/icons/launch-640x1136.png"
  media="(device-width: 320px) and (device-height: 568px)"
/>
```

#### **Android Chrome 설정**

```html
<!-- Android 테마 색상 -->
<meta name="theme-color" content="#7C5842" />
<meta name="msapplication-TileColor" content="#7C5842" />
<meta name="msapplication-TileImage" content="/icons/tile-144x144.png" />
```

### 7. **업데이트 관리**

#### **앱 업데이트 알림**

```
┌─────────────────────────┐
│ 🔄 새 버전 사용 가능     │
│                        │
│ • 새로운 기능 추가      │
│ • 성능 개선            │
│ • 버그 수정            │
│                        │
│ [  업데이트  ] [나중에]  │
└─────────────────────────┘
```

#### **점진적 업데이트**

```typescript
class AppUpdater {
  async checkForUpdates(): Promise<boolean> {
    const registration = await navigator.serviceWorker.ready
    await registration.update()
    return registration.waiting !== null
  }

  async applyUpdate(): Promise<void> {
    const registration = await navigator.serviceWorker.ready
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }
}
```

## 🔔 푸시 알림 (향후 기능)

### **알림 유형 설계**

```typescript
interface NotificationTypes {
  record_reminder: {
    title: '오늘 커피는 어땠나요?'
    body: '새로운 테이스팅을 기록해보세요'
    action: '/mode-selection'
    frequency: 'daily' | 'weekly'
  }

  achievement_unlock: {
    title: '새로운 배지 획득!'
    body: '${badge_name} 배지를 획득했습니다'
    action: '/stats'
    immediate: true
  }

  streak_reminder: {
    title: '연속 기록을 이어가세요'
    body: '${streak_count}일째 기록 중입니다'
    action: '/mode-selection'
    condition: 'streak >= 3'
  }
}
```

## 📊 PWA 분석 및 모니터링

### **핵심 지표 추적**

```typescript
interface PWAMetrics {
  installation: {
    install_prompt_shown: number
    install_prompt_accepted: number
    install_prompt_dismissed: number
    home_screen_installed: number
  }

  usage: {
    standalone_launches: number
    total_sessions: number
    offline_usage_time: number
    cache_hit_rate: number
  }

  performance: {
    app_shell_load_time: number
    offline_fallback_usage: number
    sync_success_rate: number
    update_adoption_rate: number
  }
}
```

## 🧪 PWA 테스트 전략

### **기능 테스트**

- [ ] 홈 화면 설치 동작
- [ ] 오프라인 모드 기능
- [ ] 캐시 전략 동작
- [ ] 백그라운드 동기화
- [ ] 앱 업데이트 프로세스

### **호환성 테스트**

- [ ] iOS Safari (12+)
- [ ] Android Chrome (70+)
- [ ] Samsung Internet
- [ ] Firefox Mobile
- [ ] Edge Mobile

### **성능 테스트**

- [ ] Lighthouse PWA 감사
- [ ] 오프라인 성능
- [ ] 메모리 사용량
- [ ] 배터리 사용량
- [ ] 네트워크 효율성

## 📋 구현 우선순위

### **Phase 1 (MVP)**

- Web App Manifest 설정
- 기본 Service Worker
- 오프라인 페이지
- 앱 설치 프롬프트

### **Phase 2 (핵심 기능)**

- 고급 캐싱 전략
- IndexedDB 오프라인 저장
- 백그라운드 동기화
- 앱 업데이트 관리

### **Phase 3 (고급 기능)**

- 푸시 알림 시스템
- 고급 분석 추적
- 네이티브 기능 통합
- A/B 테스트 지원
