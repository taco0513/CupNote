# CupNote 네비게이션 플로우

## 모드별 테이스팅 플로우

### 🏪 Cafe Mode (3-5분)
```
1. Mode Selection (/mode-selection)
   ↓
2. Coffee Info (/coffee-info) - 25%
   ↓
3. Unified Flavor (/unified-flavor) - 50%
   ↓
4. Sensory Expression (/sensory-expression) - 70%
   ↓
5. Personal Comment (/personal-comment) - 85%
   ↓
6. Roaster Notes (/roaster-notes) - 95%
   ↓
7. Result (/result) - 100%
```

### 🏠 HomeCafe Mode (5-8분)
```
1. Mode Selection (/mode-selection)
   ↓
2. Coffee Info (/coffee-info) - 20%
   ↓
3. HomeCafe (/home-cafe) - 43%
   ↓
4. Unified Flavor (/unified-flavor) - 60%
   ↓
5. Sensory Expression (/sensory-expression) - 75%
   ↓
6. Personal Comment (/personal-comment) - 85%
   ↓
7. Roaster Notes (/roaster-notes) - 95%
   ↓
8. Result (/result) - 100%
```

### 🎯 Pro Mode (8-12분)
```
1. Mode Selection (/mode-selection)
   ↓
2. Coffee Info (/coffee-info) - 15%
   ↓
3. HomeCafe (/home-cafe) - 29%
   ↓
4. Pro Brewing (/pro-brewing) - 43%
   ↓
5. Unified Flavor (/unified-flavor) - 57%
   ↓
6. Sensory Expression (/sensory-expression) - 71%
   ↓
7. Sensory Slider (/sensory-slider) - 86%
   ↓
8. Personal Comment (/personal-comment) - 92%
   ↓
9. Roaster Notes (/roaster-notes) - 97%
   ↓
10. Result (/result) - 100%
```

## 네비게이션 규칙

### 조건부 화면 표시
- **HomeCafe Screen**: `homecafe` 또는 `pro` 모드에서만 표시
- **Pro Brewing**: `pro` 모드에서만 표시
- **Sensory Slider**: `pro` 모드에서만 표시

### 뒤로가기 규칙
- 각 화면에서 이전 화면으로 돌아갈 수 있음
- Mode Selection으로 돌아가면 모든 데이터 초기화 필요

### 진행률 계산
- 각 모드별로 총 화면 수가 다름
- Cafe Mode: 7개 화면
- HomeCafe Mode: 8개 화면
- Pro Mode: 10개 화면

## 구현 상태 체크리스트

### ✅ 구현 완료
- [x] Mode Selection View (Lab → Pro 리브랜딩 완료)
- [x] Coffee Info View
- [x] HomeCafe View
- [x] Pro Brewing View (ExperimentalDataView → ProBrewingView)
- [x] Unified Flavor View
- [x] Sensory Expression View
- [x] Sensory Slider View
- [x] Personal Comment View
- [x] Roaster Notes View
- [x] Result View

### ✅ 파일명 변경 완료
- [x] CoffeeSetupView → CoffeeInfoView
- [x] FlavorSelectionView → UnifiedFlavorView
- [x] PersonalNotesView → PersonalCommentView
- [x] ExperimentalDataView → ProBrewingView

### ✅ 라우팅 업데이트 완료
- [x] Lab → Pro 경로 변경 (/experimental-data → /pro-brewing)
- [x] Result 경로 변경 (/tasting-result → /result)
- [x] 레거시 경로 리다이렉트 설정
- [x] 컴포넌트 내 경로 참조 업데이트

### 📝 추가 개선사항
- [ ] Navigation guard로 모드 선택 여부 체크
- [ ] 진행 중인 세션 복구 기능
- [ ] 데이터 유효성 검사 강화