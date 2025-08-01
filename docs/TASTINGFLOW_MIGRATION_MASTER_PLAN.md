# 🚀 TastingFlow Migration Master Plan

**Version**: 1.0.0  
**Created**: 2025-01-31  
**Status**: Active  
**Estimated Duration**: 4 weeks (160 hours)

---

## 🎯 Executive Summary

CupNote의 핵심 테이스팅 시스템을 완전히 재설계하여 더 직관적이고 체계적인 사용자 경험을 제공하는 대규모 마이그레이션 프로젝트입니다.

### Key Changes
- **3-Mode → 2-Mode System**: Lab Mode 제거, HomeCafe Mode 강화
- **Step-based → Screen-based Flow**: 더 명확한 사용자 여정
- **Match Score System**: 70% 향미 + 30% 감각 매칭 알고리즘
- **Achievement System**: 16개 배지 기반 게이미피케이션
- **SCA Flavor Wheel**: 30개 → 85개 향미로 확장

---

## 📊 Detailed Migration Matrix

### Phase 0: Pre-Migration Preparation (Day -7 to Day 0)

#### 0.1 Codebase Analysis & Inventory
```typescript
// 전체 코드베이스 스캔 스크립트
const migrationInventory = {
  filesToUpdate: [],
  filesToDelete: [],
  filesToCreate: [],
  referencesToUpdate: {
    imports: [],
    routes: [],
    storage: [],
    types: []
  }
}

// 자동화된 의존성 분석
npm run analyze:dependencies
npm run find:lab-mode-references
npm run find:step-based-routes
```

#### 0.2 Backup & Rollback Strategy
```bash
# 1. Full database backup
pg_dump cupnote_prod > backup_$(date +%Y%m%d).sql

# 2. Code snapshot
git tag pre-migration-v1.0.0
git push origin pre-migration-v1.0.0

# 3. Feature flag setup
FEATURE_FLAG_NEW_TASTING_FLOW=false
FEATURE_FLAG_LEGACY_SUPPORT=true
```

#### 0.3 Communication Plan
- **Day -7**: 사용자 공지 (Lab Mode 종료 안내)
- **Day -3**: 개발팀 전체 미팅
- **Day -1**: 최종 체크리스트 검토

---

## 🏗️ Phase 1: Infrastructure & Foundation (Week 1)

### Day 1-2: Core Type System Overhaul

#### 1.1 Remove Lab Mode from Type System
```typescript
// OLD: src/types/tasting.types.ts
export type TastingMode = 'cafe' | 'homecafe' | 'lab'

// NEW: src/types/tasting-flow.types.ts
export type TastingMode = 'cafe' | 'homecafe'

// Migration type for backward compatibility
export type LegacyTastingMode = TastingMode | 'lab'
```

#### 1.2 New Data Structure Implementation
```typescript
// src/types/tasting-flow.types.ts
export interface TastingFlowData {
  // Metadata
  id: string
  userId: string
  mode: TastingMode
  createdAt: Date
  completedAt?: Date
  
  // Flow Data
  coffeeInfo: CoffeeInfoData
  brewSetup?: BrewSetupData // HomeCafe only
  flavorSelection: FlavorSelectionData
  sensoryExpression: SensoryExpressionData
  sensoryMouthfeel?: SensoryMouthFeelData
  personalNotes: PersonalNotesData
  
  // Computed Results
  matchScore?: MatchScoreResult
  achievements?: AchievementProgress[]
}

// Detailed sub-interfaces
export interface CoffeeInfoData {
  // Cafe Mode
  cafeName?: string
  
  // Common fields
  coffeeName: string
  roastery: string
  temperature: 'hot' | 'iced'
  
  // Optional details
  origin?: string
  variety?: string
  altitude?: string
  roastLevel?: string
  processing?: string
  
  // Metadata
  inputTimestamp: Date
  completionTime: number // seconds
}
```

### Day 3-4: Match Score System Implementation

#### 1.3 Match Score Algorithm
```typescript
// src/lib/match-score/algorithm.ts
export class MatchScoreCalculator {
  private readonly FLAVOR_WEIGHT = 0.7
  private readonly SENSORY_WEIGHT = 0.3
  
  private readonly FLAVOR_MATCHING_TABLE = {
    'citrus': ['오렌지', '레몬', '라임', '자몽', '시트러스'],
    'berry': ['딸기', '블루베리', '라즈베리', '베리류'],
    'chocolate': ['초콜릿향', '다크초콜릿', '밀크초콜릿'],
    // ... 85 flavor mappings
  }
  
  calculate(
    userFlavors: string[],
    userSensory: SensoryExpressionData,
    roasterNote: string
  ): MatchScoreResult {
    const flavorScore = this.calculateFlavorMatching(userFlavors, roasterNote)
    const sensoryScore = this.calculateSensoryMatching(userSensory, roasterNote)
    
    const finalScore = Math.round(
      flavorScore * this.FLAVOR_WEIGHT + 
      sensoryScore * this.SENSORY_WEIGHT
    )
    
    return {
      finalScore,
      flavorScore,
      sensoryScore,
      matchedFlavors: this.findMatchedFlavors(userFlavors, roasterNote),
      matchedSensory: this.findMatchedSensory(userSensory, roasterNote),
      message: this.generateMessage(finalScore)
    }
  }
}
```

### Day 5-7: Achievement System Architecture

#### 1.4 Achievement Engine
```typescript
// src/lib/achievements/engine.ts
export class AchievementEngine {
  private readonly ACHIEVEMENTS = {
    // Beginner (Bronze)
    FIRST_TASTE: {
      id: 'first_taste',
      name: '첫 한 모금',
      description: '첫 테이스팅 완료',
      condition: (stats) => stats.totalTastings >= 1,
      points: 10
    },
    // ... 16 achievements total
  }
  
  checkAchievements(
    userStats: UserStatistics,
    newTasting: TastingFlowData
  ): AchievementUnlock[] {
    const newAchievements = []
    
    for (const [key, achievement] of Object.entries(this.ACHIEVEMENTS)) {
      if (!userStats.unlockedAchievements.includes(achievement.id)) {
        if (achievement.condition(userStats, newTasting)) {
          newAchievements.push({
            achievement,
            unlockedAt: new Date(),
            triggerTasting: newTasting.id
          })
        }
      }
    }
    
    return newAchievements
  }
}
```

---

## 🖥️ Phase 2: Screen Implementation (Week 2)

### Day 8-9: Navigation System Overhaul

#### 2.1 New Route Structure
```typescript
// src/app/tasting-flow/route-config.ts
export const TASTING_FLOW_ROUTES = {
  cafe: {
    base: '/tasting-flow/cafe',
    screens: {
      coffeeInfo: '/tasting-flow/cafe/coffee-info',
      flavorSelection: '/tasting-flow/cafe/flavor-selection',
      sensoryExpression: '/tasting-flow/cafe/sensory-expression',
      sensoryMouthfeel: '/tasting-flow/cafe/sensory-mouthfeel',
      personalNotes: '/tasting-flow/cafe/personal-notes',
      result: '/tasting-flow/cafe/result'
    }
  },
  homecafe: {
    base: '/tasting-flow/homecafe',
    screens: {
      coffeeInfo: '/tasting-flow/homecafe/coffee-info',
      brewSetup: '/tasting-flow/homecafe/brew-setup',
      // ... same as cafe after brew-setup
    }
  }
}
```

#### 2.2 Progressive Migration Strategy
```typescript
// src/lib/navigation/migration-router.ts
export class MigrationRouter {
  private readonly OLD_TO_NEW_MAPPING = {
    '/record/cafe/step1': '/tasting-flow/cafe/coffee-info',
    '/record/cafe/step2': '/tasting-flow/cafe/flavor-selection',
    '/record/lab': '/tasting-flow/homecafe', // Lab → HomeCafe redirect
    // ...
  }
  
  navigate(path: string): void {
    // Check if feature flag is enabled
    if (process.env.FEATURE_FLAG_NEW_TASTING_FLOW === 'true') {
      const newPath = this.OLD_TO_NEW_MAPPING[path] || path
      router.push(newPath)
    } else {
      // Keep old navigation during migration
      router.push(path)
    }
  }
}
```

### Day 10-11: TF_Screen_CoffeeInfo Implementation

#### 2.3 Cascade Autocomplete System
```typescript
// src/components/tasting-flow/coffee-info/CascadeAutocomplete.tsx
export const CascadeAutocomplete = ({ mode }: { mode: TastingMode }) => {
  const [searchStage, setSearchStage] = useState<'cafe' | 'roaster' | 'coffee'>('cafe')
  const [selections, setSelections] = useState({
    cafe: null,
    roaster: null,
    coffee: null
  })
  
  // Supabase real-time search
  const searchCafes = async (query: string) => {
    const { data } = await supabase
      .from('cafes')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(10)
    return data
  }
  
  // Filter roasters based on selected cafe
  const searchRoasters = async (cafeId: string, query: string) => {
    const { data } = await supabase
      .from('cafe_roasters')
      .select('roaster:roasters(*)')
      .eq('cafe_id', cafeId)
      .ilike('roaster.name', `%${query}%`)
    return data.map(item => item.roaster)
  }
  
  // Progressive disclosure UI
  return (
    <div className="space-y-4">
      {mode === 'cafe' && (
        <AutocompleteField
          label="카페명"
          onSearch={searchCafes}
          onSelect={(cafe) => {
            setSelections({ ...selections, cafe })
            setSearchStage('roaster')
          }}
        />
      )}
      
      {searchStage !== 'cafe' && (
        <AutocompleteField
          label="로스터리"
          onSearch={(q) => searchRoasters(selections.cafe?.id, q)}
          onSelect={(roaster) => {
            setSelections({ ...selections, roaster })
            setSearchStage('coffee')
          }}
        />
      )}
      
      {/* ... coffee selection */}
    </div>
  )
}
```

### Day 12-14: TF_Screen_FlavorSelection with SCA Wheel

#### 2.4 Complete SCA Flavor Wheel Implementation
```typescript
// src/components/tasting-flow/flavor-selection/FlavorWheel.tsx
export const FlavorWheel = () => {
  const [selections, setSelections] = useState<FlavorChoice[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Level 2/3 selection logic
  const handleLevel2Toggle = (categoryId: string, level2Id: string) => {
    const existing = selections.find(s => s.level2 === level2Id)
    
    if (existing?.level3?.length) {
      // If level3 exists, clear all
      setSelections(selections.filter(s => s.level2 !== level2Id))
    } else if (existing) {
      // Toggle off level2
      setSelections(selections.filter(s => s.level2 !== level2Id))
    } else {
      // Add level2
      setSelections([...selections, { level2: level2Id }])
    }
  }
  
  const handleLevel3Toggle = (categoryId: string, level2Id: string, level3Id: string) => {
    const existing = selections.find(s => s.level2 === level2Id)
    
    if (!existing) {
      // Create new with level3
      setSelections([...selections, { level2: level2Id, level3: [level3Id] }])
    } else if (existing.level3?.includes(level3Id)) {
      // Remove level3
      const newLevel3 = existing.level3.filter(id => id !== level3Id)
      if (newLevel3.length === 0) {
        // Remove entire selection if no level3 left
        setSelections(selections.filter(s => s.level2 !== level2Id))
      } else {
        setSelections(selections.map(s => 
          s.level2 === level2Id ? { ...s, level3: newLevel3 } : s
        ))
      }
    } else {
      // Add level3
      setSelections(selections.map(s => 
        s.level2 === level2Id 
          ? { ...s, level3: [...(s.level3 || []), level3Id] }
          : s
      ))
    }
  }
  
  return (
    <div className="space-y-4">
      {/* Search bar for 85 flavors */}
      <FlavorSearch onSelect={handleQuickSelect} />
      
      {/* 9 Category cards */}
      {Object.entries(SCA_FLAVOR_WHEEL).map(([categoryId, category]) => (
        <FlavorCategoryCard
          key={categoryId}
          category={category}
          isExpanded={expandedCategories.has(categoryId)}
          onToggle={() => toggleCategory(categoryId)}
          selections={selections}
          onLevel2Toggle={(l2) => handleLevel2Toggle(categoryId, l2)}
          onLevel3Toggle={(l2, l3) => handleLevel3Toggle(categoryId, l2, l3)}
        />
      ))}
      
      {/* Selection summary */}
      <FlavorSelectionSummary selections={selections} />
    </div>
  )
}
```

---

## 🔧 Phase 3: Advanced Features (Week 3)

### Day 15-16: TF_Screen_BrewSetup for HomeCafe

#### 3.1 Brewing Recipe System
```typescript
// src/components/tasting-flow/brew-setup/BrewingRecipe.tsx
export const BrewingRecipe = () => {
  const [recipe, setRecipe] = useState<BrewRecipe>({
    dripper: 'v60',
    ratio: '1:16',
    coffeeAmount: 20,
    waterAmount: 320, // auto-calculated
    temperature: 93,
    grindSetting: '',
    bloomTime: 30,
    totalTime: 0,
    notes: ''
  })
  
  // Real-time timer integration
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'paused'>('idle')
  const [elapsedTime, setElapsedTime] = useState(0)
  
  // Recipe presets
  const RATIO_PRESETS = [
    { value: '1:15', label: '진한 맛', coffee: 20, water: 300 },
    { value: '1:15.5', label: '', coffee: 20, water: 310 },
    { value: '1:16', label: '균형', coffee: 20, water: 320 },
    { value: '1:16.5', label: '', coffee: 20, water: 330 },
    { value: '1:17', label: '순한 맛', coffee: 20, water: 340 },
    { value: '1:17.5', label: '', coffee: 20, water: 350 },
    { value: '1:18', label: '가벼운 맛', coffee: 20, water: 360 }
  ]
  
  return (
    <div className="space-y-6">
      {/* Dripper selection */}
      <DripperSelector value={recipe.dripper} onChange={handleDripperChange} />
      
      {/* Ratio calculator with presets */}
      <RatioCalculator 
        presets={RATIO_PRESETS}
        value={recipe}
        onChange={handleRatioChange}
      />
      
      {/* Integrated timer */}
      <BrewingTimer
        state={timerState}
        elapsed={elapsedTime}
        onStart={startTimer}
        onPause={pauseTimer}
        onLap={recordLap}
      />
      
      {/* Recipe save/load */}
      <RecipeManager
        currentRecipe={recipe}
        onSave={saveToMyRecipes}
        onLoad={loadFromMyRecipes}
      />
    </div>
  )
}
```

### Day 17-18: Korean Sensory Expression System

#### 3.2 44 Expression CATA System
```typescript
// src/components/tasting-flow/sensory-expression/KoreanExpressions.tsx
export const KoreanExpressions = () => {
  const [selections, setSelections] = useState<SensorySelections>({
    acidity: [],
    sweetness: [],
    bitterness: [],
    body: [],
    aftertaste: [],
    balance: []
  })
  
  const KOREAN_EXPRESSIONS = {
    acidity: {
      name: '산미',
      icon: '🍋',
      color: 'yellow',
      expressions: [
        { id: 'fresh', text: '싱그러운', hint: '상쾌하고 생기있는' },
        { id: 'bright', text: '발랄한', hint: '밝고 경쾌한' },
        { id: 'tangy', text: '톡 쏘는', hint: '자극적이고 선명한' },
        { id: 'refreshing', text: '상큼한', hint: '청량하고 시원한' },
        { id: 'fruity', text: '과일 같은', hint: '과일의 산미' },
        { id: 'winey', text: '와인 같은', hint: '복합적인 산미' },
        { id: 'citrusy', text: '시트러스 같은', hint: '감귤류의 산미' }
      ]
    },
    // ... 5 more categories
  }
  
  const handleToggle = (category: string, expressionId: string) => {
    const current = selections[category] || []
    
    if (current.includes(expressionId)) {
      // Remove
      setSelections({
        ...selections,
        [category]: current.filter(id => id !== expressionId)
      })
    } else if (current.length < 3) {
      // Add (max 3 per category)
      setSelections({
        ...selections,
        [category]: [...current, expressionId]
      })
    } else {
      // Show toast: "카테고리당 최대 3개까지 선택 가능합니다"
      showMaxSelectionToast()
    }
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(KOREAN_EXPRESSIONS).map(([categoryId, category]) => (
        <ExpressionCategory
          key={categoryId}
          category={category}
          selections={selections[categoryId]}
          onToggle={(exprId) => handleToggle(categoryId, exprId)}
          maxSelections={3}
        />
      ))}
      
      {/* Real-time selection summary */}
      <SelectionSummary
        selections={selections}
        totalSelected={Object.values(selections).flat().length}
        maxTotal={18}
      />
    </div>
  )
}
```

### Day 19-21: Result Screen with Match Score

#### 3.3 Comprehensive Result Display
```typescript
// src/components/tasting-flow/result/ResultScreen.tsx
export const ResultScreen = () => {
  const tastingData = useTastingFlowData()
  const [matchScore, setMatchScore] = useState<MatchScoreResult>()
  const [achievements, setAchievements] = useState<AchievementUnlock[]>([])
  const [roasterNote, setRoasterNote] = useState('')
  
  // Calculate match score when roaster note is provided
  const calculateMatchScore = async () => {
    if (!roasterNote) return
    
    const calculator = new MatchScoreCalculator()
    const result = calculator.calculate(
      extractFlavors(tastingData.flavorSelection),
      tastingData.sensoryExpression,
      roasterNote
    )
    
    setMatchScore(result)
    
    // Trigger achievement check
    const engine = new AchievementEngine()
    const userStats = await getUserStatistics()
    const newAchievements = engine.checkAchievements(userStats, tastingData)
    setAchievements(newAchievements)
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Coffee summary */}
      <CoffeeSummaryCard data={tastingData.coffeeInfo} />
      
      {/* Roaster note input */}
      <RoasterNoteInput
        value={roasterNote}
        onChange={setRoasterNote}
        onSubmit={calculateMatchScore}
      />
      
      {/* Match score display */}
      {matchScore && (
        <MatchScoreDisplay
          score={matchScore}
          userFlavors={extractFlavors(tastingData.flavorSelection)}
          roasterNote={roasterNote}
        />
      )}
      
      {/* Personal tasting summary */}
      <PersonalTastingSummary data={tastingData} />
      
      {/* Achievement notifications */}
      {achievements.length > 0 && (
        <AchievementNotifications
          achievements={achievements}
          onDismiss={() => setAchievements([])}
        />
      )}
      
      {/* Action buttons */}
      <ResultActions
        onShare={handleShare}
        onSaveRecipe={handleSaveRecipe}
        onNewTasting={handleNewTasting}
      />
    </div>
  )
}
```

---

## 🔄 Phase 4: Migration & Integration (Week 4)

### Day 22-23: Data Migration System

#### 4.1 Lab Mode to HomeCafe Migration
```typescript
// src/lib/migration/lab-to-homecafe.ts
export class LabModeDataMigration {
  async migrateUserData(userId: string): Promise<MigrationResult> {
    const results = {
      success: 0,
      failed: 0,
      errors: []
    }
    
    try {
      // 1. Fetch all lab mode records
      const { data: labRecords } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('user_id', userId)
        .eq('mode', 'lab')
      
      // 2. Transform each record
      for (const labRecord of labRecords) {
        try {
          const homecafeRecord = this.transformLabToHomecafe(labRecord)
          
          // 3. Insert new record
          const { error } = await supabase
            .from('coffee_records')
            .insert(homecafeRecord)
          
          if (!error) {
            // 4. Mark old record as migrated
            await supabase
              .from('coffee_records')
              .update({ migrated: true, migrated_to: homecafeRecord.id })
              .eq('id', labRecord.id)
            
            results.success++
          } else {
            throw error
          }
        } catch (err) {
          results.failed++
          results.errors.push({ recordId: labRecord.id, error: err })
        }
      }
      
      // 5. Update user preferences
      await this.updateUserPreferences(userId)
      
      return results
    } catch (error) {
      throw new MigrationError('Failed to migrate lab mode data', error)
    }
  }
  
  private transformLabToHomecafe(labRecord: any): any {
    return {
      ...labRecord,
      mode: 'homecafe',
      brew_setup: {
        dripper: 'v60', // Default dripper for lab mode
        ratio: '1:16',
        coffeeAmount: labRecord.coffee_amount || 20,
        waterAmount: labRecord.water_amount || 320,
        temperature: labRecord.brew_temperature || 93,
        grindSetting: labRecord.grind_size || '',
        bloomTime: 30,
        totalTime: labRecord.brew_time || 0
      },
      // Preserve all other data
      migrated_from_lab: true,
      migration_date: new Date()
    }
  }
}
```

#### 4.2 Storage Key Migration
```typescript
// src/lib/migration/storage-migration.ts
export class StorageMigration {
  private readonly KEY_MAPPING = {
    'recordStep1': 'tf_coffee_info',
    'recordStep2': 'tf_flavor_selection',
    'recordStep3': 'tf_sensory_expression',
    'recordStep4': 'tf_sensory_mouthfeel',
    'recordStep5': 'tf_personal_notes',
    'cafeStep1': 'tf_cafe_coffee_info',
    'cafeStep2': 'tf_cafe_flavor_selection',
    'homecafeStep1': 'tf_homecafe_coffee_info',
    'homecafeStep2': 'tf_homecafe_brew_setup'
  }
  
  migrateSessionStorage(): void {
    // 1. Backup current data
    const backup = {}
    for (const oldKey of Object.keys(this.KEY_MAPPING)) {
      const value = sessionStorage.getItem(oldKey)
      if (value) {
        backup[oldKey] = value
      }
    }
    
    // 2. Store backup
    sessionStorage.setItem('migration_backup', JSON.stringify(backup))
    
    // 3. Migrate to new keys
    for (const [oldKey, newKey] of Object.entries(this.KEY_MAPPING)) {
      const value = sessionStorage.getItem(oldKey)
      if (value) {
        sessionStorage.setItem(newKey, value)
        // Keep old key during transition period
        if (!process.env.FEATURE_FLAG_REMOVE_OLD_KEYS) {
          console.log(`Migrated ${oldKey} → ${newKey}`)
        } else {
          sessionStorage.removeItem(oldKey)
        }
      }
    }
  }
}
```

### Day 24-25: Testing & Validation

#### 4.3 Comprehensive Test Suite
```typescript
// src/__tests__/migration/full-flow.test.ts
describe('TastingFlow Migration Tests', () => {
  describe('Lab Mode Migration', () => {
    it('should successfully migrate lab records to homecafe', async () => {
      // Setup
      const userId = 'test-user-123'
      const labRecord = createMockLabRecord()
      
      // Execute
      const migration = new LabModeDataMigration()
      const result = await migration.migrateUserData(userId)
      
      // Verify
      expect(result.success).toBe(1)
      expect(result.failed).toBe(0)
      
      // Check transformed data
      const { data: newRecord } = await supabase
        .from('coffee_records')
        .select('*')
        .eq('migrated_from_lab', true)
        .single()
      
      expect(newRecord.mode).toBe('homecafe')
      expect(newRecord.brew_setup).toBeDefined()
      expect(newRecord.brew_setup.dripper).toBe('v60')
    })
  })
  
  describe('Route Migration', () => {
    it('should redirect old routes to new ones', () => {
      const router = new MigrationRouter()
      
      // Test cafe mode
      router.navigate('/record/cafe/step1')
      expect(mockRouter.push).toHaveBeenCalledWith('/tasting-flow/cafe/coffee-info')
      
      // Test lab mode redirect
      router.navigate('/record/lab')
      expect(mockRouter.push).toHaveBeenCalledWith('/tasting-flow/homecafe')
    })
  })
  
  describe('Storage Migration', () => {
    it('should migrate all session storage keys', () => {
      // Setup old data
      sessionStorage.setItem('recordStep1', JSON.stringify({ coffeeName: 'Test' }))
      
      // Execute migration
      const migration = new StorageMigration()
      migration.migrateSessionStorage()
      
      // Verify
      expect(sessionStorage.getItem('tf_coffee_info')).toBe('{"coffeeName":"Test"}')
      expect(sessionStorage.getItem('migration_backup')).toBeDefined()
    })
  })
})
```

### Day 26-27: Performance Optimization

#### 4.4 Code Splitting & Lazy Loading
```typescript
// src/app/tasting-flow/[mode]/layout.tsx
import dynamic from 'next/dynamic'

// Lazy load heavy components
const FlavorWheel = dynamic(
  () => import('@/components/tasting-flow/flavor-selection/FlavorWheel'),
  { 
    loading: () => <FlavorWheelSkeleton />,
    ssr: false // Client-side only for interactivity
  }
)

const MatchScoreCalculator = dynamic(
  () => import('@/lib/match-score/Calculator'),
  { ssr: false }
)

// Preload critical data
export async function generateStaticParams() {
  return [
    { mode: 'cafe' },
    { mode: 'homecafe' }
  ]
}

// Optimize bundle size
export const config = {
  unstable_excludeFiles: [
    'node_modules/@sentry/**',
    'node_modules/moment/**' // Use date-fns instead
  ]
}
```

### Day 28: Deployment & Monitoring

#### 4.5 Phased Rollout Strategy
```typescript
// src/lib/feature-flags/rollout.ts
export class PhasedRollout {
  private readonly ROLLOUT_PHASES = [
    { percentage: 5, startDate: '2025-02-24', name: 'Alpha testers' },
    { percentage: 20, startDate: '2025-02-26', name: 'Beta users' },
    { percentage: 50, startDate: '2025-02-28', name: 'Half rollout' },
    { percentage: 100, startDate: '2025-03-03', name: 'Full rollout' }
  ]
  
  isUserInRollout(userId: string): boolean {
    const userHash = this.hashUserId(userId)
    const currentDate = new Date()
    
    for (const phase of this.ROLLOUT_PHASES) {
      if (currentDate >= new Date(phase.startDate)) {
        if (userHash <= phase.percentage) {
          return true
        }
      }
    }
    
    return false
  }
  
  private hashUserId(userId: string): number {
    // Consistent hash to ensure same users stay in same group
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i)
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash) % 100
  }
}
```

#### 4.6 Monitoring & Analytics
```typescript
// src/lib/monitoring/migration-metrics.ts
export class MigrationMetrics {
  trackMigrationEvent(event: MigrationEvent): void {
    // Send to analytics
    analytics.track('migration_event', {
      type: event.type,
      oldPath: event.oldPath,
      newPath: event.newPath,
      userId: event.userId,
      timestamp: new Date(),
      success: event.success,
      errorMessage: event.error?.message
    })
    
    // Log to monitoring
    if (!event.success) {
      Sentry.captureException(event.error, {
        tags: {
          migration: true,
          phase: 'tasting-flow',
          severity: 'high'
        },
        extra: event
      })
    }
  }
  
  generateMigrationReport(): MigrationReport {
    return {
      totalUsers: this.getTotalUsers(),
      migratedUsers: this.getMigratedUsers(),
      successRate: this.getSuccessRate(),
      commonErrors: this.getTopErrors(),
      performanceImpact: this.getPerformanceMetrics(),
      userFeedback: this.getUserFeedbackSummary()
    }
  }
}
```

---

## 📋 Post-Migration Checklist

### Technical Validation
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance metrics within acceptable range
- [ ] No increase in error rates
- [ ] Database integrity maintained
- [ ] All feature flags working correctly

### User Experience Validation
- [ ] Smooth transition for existing users
- [ ] No data loss reported
- [ ] Positive user feedback (>80% satisfaction)
- [ ] Support tickets under control

### Documentation Updates
- [ ] README.md updated
- [ ] API documentation current
- [ ] User guides revised
- [ ] Developer documentation complete
- [ ] CHANGELOG.md updated

### Rollback Readiness
- [ ] Rollback plan tested
- [ ] Database backups verified
- [ ] Feature flags can disable new system
- [ ] Old code paths still functional

---

## 🎯 Success Metrics

### Technical KPIs
- **Migration Success Rate**: >99.5%
- **Performance**: <100ms increase in load time
- **Error Rate**: <0.1% increase
- **Test Coverage**: >80% maintained

### Business KPIs
- **User Retention**: No decrease
- **Feature Adoption**: >70% using new flow within 30 days
- **Support Tickets**: <20% increase during migration
- **User Satisfaction**: >4.5/5 rating

### Development KPIs
- **Code Quality**: Maintainability index improved
- **Technical Debt**: Reduced by removing Lab Mode
- **Development Velocity**: Increased by 20% post-migration
- **Documentation Coverage**: 100% for new features

---

## 🚨 Risk Mitigation

### High-Risk Areas
1. **Data Loss**: Triple backup strategy
2. **Performance Degradation**: Continuous monitoring
3. **User Confusion**: In-app tutorials and guides
4. **Breaking Changes**: Gradual rollout with fallbacks

### Contingency Plans
1. **Rollback Trigger**: Error rate >1% or performance degradation >200ms
2. **Communication Plan**: Pre-written user communications
3. **Support Escalation**: Dedicated migration support team
4. **Emergency Fixes**: Pre-approved overtime for critical issues

---

## 📅 Timeline Summary

**Total Duration**: 28 days (4 weeks)

- **Week 1**: Infrastructure & Foundation (40 hours)
- **Week 2**: Screen Implementation (40 hours)
- **Week 3**: Advanced Features (40 hours)
- **Week 4**: Migration & Integration (40 hours)

**Key Milestones**:
- Day 7: Infrastructure complete
- Day 14: Basic flow working
- Day 21: All features implemented
- Day 28: Full migration complete

---

## 🎉 Conclusion

This comprehensive migration plan transforms CupNote's tasting system into a more intuitive, feature-rich, and maintainable platform. By following this detailed roadmap, we ensure a smooth transition that enhances user experience while maintaining system stability.

**Remember**: The key to successful migration is meticulous planning, thorough testing, and gradual rollout with constant monitoring.

---

**Document Version**: 1.0.0  
**Last Updated**: 2025-01-31  
**Next Review**: 2025-02-07