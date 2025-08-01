# 🔄 TastingFlow Migration Tracker

**Created**: 2025-01-31  
**Status**: In Progress  
**Target Completion**: 2025-02-23

## 📊 Migration Progress Dashboard

### Overall Progress: [██████░░░░] 20%

| Phase | Status | Progress | Owner | Deadline |
|-------|--------|----------|-------|----------|
| Planning & Analysis | ✅ Complete | 100% | Team | 2025-01-31 |
| Infrastructure Setup | 🟡 In Progress | 40% | Backend | 2025-02-02 |
| Screen Implementation | ⏳ Pending | 0% | Frontend | 2025-02-16 |
| Integration & Testing | ⏳ Pending | 0% | QA | 2025-02-23 |

---

## 🏷️ Naming Convention Changes

### Component Names
- [x] Identified all naming inconsistencies
- [ ] Update component file names
- [ ] Update import statements
- [ ] Update route definitions

### Storage Keys
- [ ] `recordStep1` → `tf_coffee_info`
- [ ] `recordStep2` → `tf_flavor_selection` 
- [ ] `cafeStep1` → `tf_cafe_coffee_info`
- [ ] `cafeStep2` → `tf_cafe_flavor_selection`

### Route Structure
```
OLD: /record/[mode]/step[n]
NEW: /tasting-flow/[mode]/[screen-name]

Examples:
- /record/cafe/step1 → /tasting-flow/cafe/coffee-info
- /record/cafe/step2 → /tasting-flow/cafe/flavor-selection
- /record/homecafe/step2 → /tasting-flow/homecafe/brew-setup
```

---

## 📁 File Tracking

### Files to Delete
- [x] `/src/app/record/lab/*` - Lab Mode 완전 제거 ✅
- [ ] `/src/config/lab-mode.config.ts` - Lab Mode 설정 제거 (파일 없음)

### Files to Update
- [x] `/src/config/tasting-modes.config.ts` - Lab Mode 제거 ✅
- [x] `/src/types/coffee.ts` - ProData interface 제거 ✅
- [x] `/src/app/mode-selection/page.tsx` - Lab Mode UI 제거 ✅
- [x] `/src/config/ui-labels.config.ts` - Lab Mode 라벨 제거 ✅
- [x] `/src/components/CoffeeList.tsx` - Lab Mode 표시 제거 ✅
- [x] `/src/components/OptimizedCoffeeList.tsx` - Lab Mode 표시 제거 ✅
- [x] `/src/app/coffee/[id]/page.tsx` - Lab Mode 섹션 제거 ✅
- [ ] `/src/app/record/cafe/step1/page.tsx` → `/src/app/tasting-flow/cafe/coffee-info/page.tsx`
- [ ] `/src/app/record/cafe/step2/page.tsx` → `/src/app/tasting-flow/cafe/flavor-selection/page.tsx`
- [ ] All navigation components using old route structure

### New Files to Create
- [ ] `/src/app/tasting-flow/` - New root directory
- [ ] `/src/components/tasting-flow/` - New component directory
- [ ] `/src/lib/match-score/` - Match Score system
- [ ] `/src/lib/achievements/` - Achievement system

### New Files Created
- [x] `/src/types/tasting-flow.types.ts` - 새로운 TastingFlow 타입 정의 ✅
- [x] `/src/config/feature-flags.config.ts` - Feature Flag 시스템 ✅
- [x] `/src/components/RouteGuard.tsx` - 라우트 리다이렉트 가드 ✅

---

## 🔍 Code Search & Replace Tasks

### Phase 1: Type Definitions
```typescript
// Search for:
mode: 'cafe' | 'homecafe' | 'pro'
mode: 'cafe' | 'homecafe' | 'lab'

// Replace with:
mode: 'cafe' | 'homecafe'
```

### Phase 2: Navigation Updates
```typescript
// Search for:
navigation.navigate('UnifiedFlavorScreen')
navigation.navigate('HomeCafeScreen')

// Replace with:
navigation.navigate('FlavorSelection')
navigation.navigate('BrewSetup')
```

### Phase 3: Storage Key Updates
```typescript
// Search for:
sessionStorage.getItem('recordStep1')
sessionStorage.setItem('recordStep1', ...)

// Replace with:
sessionStorage.getItem('tf_coffee_info')
sessionStorage.setItem('tf_coffee_info', ...)
```

---

## 📋 Documentation Update Checklist

### User-Facing Docs
- [ ] README.md - Update mode descriptions
- [ ] CLAUDE.md - Update project structure
- [ ] User Guide - Remove Lab Mode references

### Technical Docs
- [ ] API Documentation - Update endpoints
- [ ] Type Definitions - Update interfaces
- [ ] Component Documentation - Update prop types

### New Documentation
- [ ] Migration Guide for existing users
- [ ] Match Score System documentation
- [ ] Achievement System documentation

---

## 🚨 Breaking Change Notifications

### For Users
- [ ] In-app notification about Lab Mode deprecation
- [ ] Migration assistant for Lab Mode data
- [ ] Tutorial for new TastingFlow system

### For Developers
- [ ] Update CHANGELOG.md
- [ ] Create MIGRATION_GUIDE.md
- [ ] Update contributing guidelines

---

## 📈 Change Impact Analysis

### High Impact Areas
1. **Database Schema** - Lab Mode data migration
2. **User Sessions** - In-progress recordings
3. **Analytics** - Historical data consistency
4. **SEO** - URL structure changes

### Mitigation Strategies
1. **Database**: Migration script with rollback capability
2. **Sessions**: Grace period with dual support
3. **Analytics**: Mapping table for historical data
4. **SEO**: 301 redirects for old URLs

---

## ✅ Validation Checklist

### Pre-Deployment
- [ ] All old references removed
- [ ] All new terminology consistent
- [ ] All tests passing with new structure
- [ ] Documentation fully updated

### Post-Deployment
- [ ] Monitor error logs for missed references
- [ ] User feedback on new terminology
- [ ] Analytics tracking working correctly
- [ ] No 404 errors from old URLs

---

## 📝 Notes

- Lab Mode removal must be communicated 2 weeks in advance
- Keep backward compatibility for 30 days minimum
- Monitor user complaints about missing features
- Document all decisions in ADR (Architecture Decision Records)

**Last Updated**: 2025-01-31 by Claude Code