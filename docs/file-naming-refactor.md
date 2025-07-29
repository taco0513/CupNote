# 파일명 일관성 정리 계획

## 현재 파일명 vs 문서 기준 파일명

### ✅ 이미 일치하는 파일
- `RoasterNotesView.vue` → 유지
- `SensoryExpressionView.vue` → 유지
- `ResultView.vue` → 유지

### 🔄 변경 필요한 파일
1. **CoffeeSetupView.vue** → `CoffeeInfoView.vue`
   - 모드 선택 부분 제거하고 커피 정보만 유지
   
2. **FlavorSelectionView.vue** → `UnifiedFlavorView.vue`
   - 문서명과 일치하도록 변경

3. **PersonalNotesView.vue** → `PersonalCommentView.vue`
   - 문서명과 일치하도록 변경

### 🆕 새로 생성할 파일
1. **ModeSelectionView.vue** (NEW)
   - CoffeeSetupView에서 모드 선택 부분 분리

2. **HomeCafeView.vue** (NEW)
   - HomeCafe 모드 전용 화면

3. **ExperimentalDataView.vue** (NEW)
   - Lab 모드 전용 실험 데이터 입력

4. **SensorySliderView.vue** (NEW)
   - Lab 모드 전용 감각 평가 슬라이더

## 디렉토리 구조

```
src/views/
├── tasting-flow/
│   ├── ModeSelectionView.vue      (NEW)
│   ├── CoffeeInfoView.vue         (RENAME from CoffeeSetupView)
│   ├── HomeCafeView.vue          (NEW)
│   ├── ExperimentalDataView.vue  (NEW)
│   ├── UnifiedFlavorView.vue     (RENAME from FlavorSelectionView)
│   ├── SensoryExpressionView.vue (KEEP)
│   ├── SensorySliderView.vue     (NEW)
│   ├── PersonalCommentView.vue   (RENAME from PersonalNotesView)
│   ├── RoasterNotesView.vue      (KEEP)
│   └── ResultView.vue            (KEEP)
```

## 라우팅 변경 계획

### 현재 라우팅
- `/coffee-setup` → 모드 선택 + 커피 정보
- `/flavor-selection` → 향미 선택
- `/sensory-expression` → 감각 표현
- `/personal-notes` → 개인 메모
- `/roaster-notes` → 로스터 노트
- `/result` → 결과

### 변경 후 라우팅
- `/mode-selection` → 모드 선택 (NEW)
- `/coffee-info` → 커피 정보
- `/home-cafe` → 홈카페 설정 (NEW)
- `/experimental-data` → 실험 데이터 (NEW)
- `/unified-flavor` → 향미 선택
- `/sensory-expression` → 감각 표현
- `/sensory-slider` → 감각 슬라이더 (NEW)
- `/personal-comment` → 개인 메모
- `/roaster-notes` → 로스터 노트
- `/result` → 결과

## 모드별 워크플로우

### Cafe Mode
1. Mode Selection → 2. Coffee Info → 3. Unified Flavor → 4. Sensory Expression → 5. Personal Comment → 6. Roaster Notes → 7. Result

### HomeCafe Mode
1. Mode Selection → 2. Coffee Info → 3. HomeCafe → 4. Unified Flavor → 5. Sensory Expression → 6. Personal Comment → 7. Roaster Notes → 8. Result

### Lab Mode
1. Mode Selection → 2. Coffee Info → 3. HomeCafe → 4. Experimental Data → 5. Unified Flavor → 6. Sensory Expression → 7. Sensory Slider → 8. Personal Comment → 9. Roaster Notes → 10. Result