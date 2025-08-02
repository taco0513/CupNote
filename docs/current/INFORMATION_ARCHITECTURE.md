# Information Architecture (IA) Guide

## Overview

CupNote's Information Architecture has been optimized based on user behavior analysis and data relationships. This guide documents the current IA structure, design decisions, and implementation patterns.

## Core IA Principles

### 1. Data-Driven Grouping
Features are grouped based on their underlying data relationships rather than arbitrary categorization.

**Before**: Separate "기록 목록" and "통계" sections
**After**: Unified "내 기록" with tabbed interface

**Rationale**: Both features consume the same data source (coffee records) and serve complementary purposes in the user's coffee journey.

### 2. Usage Frequency Optimization
Navigation order reflects actual user behavior patterns and task frequency.

**Mobile Tab Order**: `[홈] [내 기록] [작성] [성취] [설정]`

**Frequency Analysis**:
1. **홈** (Home) - Primary entry point
2. **내 기록** (My Records) - Most frequent task (checking/analyzing records)
3. **작성** (Create) - Central action (highlighted with special styling)
4. **성취** (Achievements) - Secondary engagement feature
5. **설정** (Settings) - Utility/configuration

### 3. Cognitive Load Reduction
Minimize decision fatigue by reducing navigation options and clarifying feature purposes.

**Improvements**:
- Reduced mobile tabs from 6 to 5
- Eliminated confusing dual-purpose navigation
- Clear feature boundaries and purposes

## Navigation Structure

### Primary Navigation (Desktop)
```
CupNote
├── 홈 (Home)
├── 내 기록 (My Records) ← Unified records & analytics
├── 작성 (Create Record)
├── 성취 (Achievements)
└── 설정 (Settings)
```

### Mobile Bottom Navigation
```
[🏠] [📊] [➕] [🏆] [⚙️]
홈    내기록  작성   성취   설정
```

### Secondary Navigation (Tabs)
```
내 기록 (My Records)
├── 목록 (List) - Individual coffee records
└── 분석 (Analytics) - Statistics and insights
```

## URL Structure

### Primary Routes
- `/` - Home dashboard
- `/my-records` - Unified records page (default: list tab)
- `/my-records?tab=stats` - Analytics tab
- `/mode-selection` - Create new record
- `/achievements` - Achievement system
- `/settings` - User preferences

### Legacy Route Handling
```typescript
// Backward compatibility maintained
/records → /my-records (redirect)
/stats → /my-records?tab=stats (redirect)
```

### Tasting Flow Routes
```
/tasting-flow/[mode]/
├── coffee-info - Basic coffee information
├── personal-notes - Personal tasting notes
├── flavor-selection - Flavor profiling
├── sensory-expression - Sensory evaluation
├── brew-setup - Brewing parameters (HomeCafe mode)
├── sensory-mouthfeel - Mouthfeel assessment
└── result - Final results and scoring
```

## Information Hierarchy

### Level 1: Core Functions
- **Home**: Dashboard with recent activity and quick actions
- **My Records**: Complete record management and analysis
- **Create**: New record creation workflows

### Level 2: Engagement & Utility
- **Achievements**: Gamification and progress tracking
- **Settings**: User preferences and configuration

### Level 3: Context-Specific
- **Tasting Flows**: Step-by-step record creation
- **Record Details**: Individual record view and editing
- **Profile Management**: User account settings

## Content Organization Patterns

### Dashboard (Home)
```
Header (Welcome + Quick Stats)
├── Recent Coffee Records (Preview)
├── Quick Actions (Create Record)
├── Achievement Highlights
└── Statistics Summary
```

### My Records (Tabbed Interface)
```
Tab Navigation [목록 | 분석]

목록 Tab:
├── Search & Filters
├── Record List (Paginated)
├── Bulk Actions
└── Export Options

분석 Tab:
├── Overview Statistics
├── Trend Analysis
├── Pattern Recognition
└── Export/Share Options
```

### Settings (Grouped Configuration)
```
개인 설정 (Personal)
├── Display Name
└── HomeCafe Equipment Setup

앱 설정 (Application)
├── Auto-save Settings
├── Display Preferences
└── Data Management
```

## User Flow Optimization

### Primary User Journeys

**1. Record Creation Flow**
```
Home → Create → Mode Selection → Tasting Flow → Result → My Records
```

**2. Record Review Flow**
```
Home → My Records → [List View] → Individual Record → Edit/Share
```

**3. Analysis Flow**
```
Home → My Records → [Analytics Tab] → Insights → Export
```

**4. Achievement Flow**
```
Home → Achievements → Progress Review → Goal Setting
```

### Cross-Flow Integration
- **Quick Actions**: Home page shortcuts to frequent tasks
- **Contextual Navigation**: Related actions available from any page
- **Progress Continuity**: Save and resume tasting flows

## Data Relationships

### Core Entities
```
User
├── Coffee Records
│   ├── Basic Info (cafe, roaster, bean)
│   ├── Tasting Notes (flavors, scores, comments)
│   ├── Brewing Data (method, parameters)
│   └── Metadata (date, location, photos)
├── Equipment Setup
│   ├── Grinder, Scale, Kettle, Brewing Tools
│   └── Additional Equipment List
├── Achievements
│   ├── Progress Tracking
│   └── Unlocked Badges
└── Preferences
    ├── Display Settings
    └── App Configuration
```

### Information Flow
```
Create Record → Store Data → Generate Analytics → Update Achievements
     ↓              ↓              ↓                ↓
Tasting Flow → My Records → Statistics → Progress Tracking
```

## Mobile IA Considerations

### Thumb-Friendly Navigation
- **Primary Zone**: Most used features (Home, My Records, Create)
- **Secondary Zone**: Occasional features (Achievements, Settings)
- **Central Highlight**: Create action emphasized with special styling

### Progressive Disclosure
- **Level 1**: Essential navigation (5 main tabs)
- **Level 2**: Context tabs (List/Analytics within My Records)
- **Level 3**: Detailed views (Individual records, detailed settings)

### Context Preservation
- **Tab State**: Analytics tab state preserved via URL parameters
- **Form State**: Tasting flow progress auto-saved
- **Navigation State**: Return to previous context after deep actions

## Accessibility & Usability

### Clear Feature Boundaries
- **My Records**: All record-related functionality in one place
- **Create**: Dedicated creation workflows
- **Achievements**: Gamification and motivation separate from core functionality

### Logical Grouping
- **Data Management**: Records and analytics grouped by data relationship
- **User Configuration**: All preferences centralized in Settings
- **Equipment Setup**: Context-aware placement in Personal settings

### Error Prevention
- **Clear Labels**: Descriptive navigation labels
- **Consistent Patterns**: Similar actions behave similarly
- **Contextual Help**: Inline guidance for complex features

## Performance Implications

### Route Optimization
- **Static Routes**: Pre-rendered pages for better performance
- **Dynamic Routes**: Efficient parameter handling for tasting flows
- **Prefetching**: Strategic prefetching of likely next pages

### Data Loading
- **Progressive Loading**: Load essential content first
- **Tab-Based Loading**: Only load active tab content
- **Caching**: Intelligent caching for frequently accessed data

## Future IA Considerations

### Scalability Planning
- **Community Features**: Prepare IA for social features in v2.0
- **Advanced Analytics**: Structure for more complex data analysis
- **Multi-Device**: Consider cross-device experience optimization

### User Growth Adaptation
- **Onboarding**: IA that guides new users naturally
- **Power Users**: Advanced features accessible without cluttering basic flows
- **Personalization**: Adaptive IA based on user behavior patterns

---

This IA structure provides a foundation for intuitive navigation while maintaining flexibility for future feature expansion.