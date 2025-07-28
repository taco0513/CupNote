# OnboardingScreen - 사용자 온보딩 화면

> 첫 사용자를 위한 앱 소개 및 초기 설정 가이드 시스템

## 📱 화면 개요

**구현 파일**: `[screens]/core/OnboardingScreen`  
**역할**: 신규 사용자 온보딩, 앱 핵심 기능 소개, 초기 설정  
**접근**: 앱 첫 실행시 자동 표시  
**특징**: 4단계 슬라이드 온보딩 + AsyncStorage 영구 저장

## 🎯 기능 정의

### 기술적 목표
- 신규 사용자의 앱 이해도를 높여 첫 사용 성공률 증대
- 핵심 기능(TastingFlow, 한국어 표현)에 대한 명확한 설명 제공
- 사용자 선호도 초기 설정을 통한 개인화 경험 시작

### 핵심 기능
- **4단계 온보딩**: 앱 소개 → TastingFlow → 한국어 표현 → 시작하기
- **상호작용 요소**: 실제 UI 컴포넌트를 활용한 미리보기
- **진행 상태 저장**: AsyncStorage를 통한 온보딩 완료 상태 추적
- **개인화 설정**: 초기 선호도 설정 (선택사항)

## 🏗️ UI/UX 구조

### 4단계 온보딩 플로우

#### **Step 1: 앱 소개**
```
배경: CupNote 브랜드 컬러 그라디언트
├── 앱 로고 + 애니메이션
├── "나만의 커피 취향을 발견하는 가장 쉬운 방법"
├── 핵심 가치 제안
│   ├── ☕ "한국인을 위한 44가지 맛 표현"
│   ├── 📊 "3가지 모드로 수준별 맞춤 기록"
│   └── 🎯 "전문가 노트와 비교하는 Match Score"
└── [다음] 버튼
```

#### **Step 2: TastingFlow 소개**
```
배경: 3-Tier 모드 시스템 시각화
├── "당신의 수준에 맞는 테이스팅"
├── 모드별 미리보기 카드
│   ├── 🏪 Cafe Mode
│   │   ├── "3-5분 간편 기록"
│   │   └── "카페에서 빠르게"
│   ├── 🏠 HomeCafe Mode  
│   │   ├── "5-8분 레시피 실험"
│   │   └── "다이얼 제어 + 비율 프리셋"
│   └── 🔬 Lab Mode
│       ├── "8-12분 전문 분석"
│       └── "SCA 표준 + 과학적 측정"
├── 인터랙티브 요소: 각 모드 카드 터치시 상세 설명
└── [다음] 버튼
```

#### **Step 3: 한국어 감각 표현**
```
배경: 44개 표현의 아름다운 타이포그래피
├── "한국인의 미각을 담은 표현들"
├── 카테고리별 표현 미리보기
│   ├── 🍋 산미: "싱그러운", "발랄한", "톡 쏘는"
│   ├── 🍯 단맛: "달콤한", "꿀 같은", "농밀한"  
│   ├── 🍫 쓴맛: "카카오 같은", "스모키한"
│   ├── 🥛 바디: "크리미한", "벨벳 같은"
│   ├── ✨ 애프터: "깔끔한", "길게 남는"
│   └── ⚖️ 밸런스: "조화로운", "부드러운"
├── 실제 선택 UI 미리보기 (인터랙티브)
└── [다음] 버튼
```

#### **Step 4: 시작하기 + 초기 설정**
```
배경: 성공적인 시작을 위한 따뜻한 디자인
├── "준비가 완료되었습니다!"
├── 초기 선호도 설정 (선택사항)
│   ├── "자주 방문하는 카페가 있나요?"
│   │   └── AutocompleteInput (카페명)
│   ├── "선호하는 커피 스타일은?"
│   │   └── ["연한 맛", "균형잡힌", "진한 맛"] 버튼
│   └── "홈카페를 하시나요?"
│       └── Toggle Switch
├── 알림 권한 요청
│   ├── "테이스팅 리마인더를 받으시겠어요?"
│   └── [허용] / [나중에] 버튼
└── [CupNote 시작하기] 버튼 (메인 CTA)
```

### 디자인 원칙
- **친근한 톤**: 딱딱한 설명보다 친근하고 따뜻한 메시지
- **시각적 매력**: 각 단계별 고유한 비주얼과 애니메이션
- **점진적 공개**: 한 번에 너무 많은 정보를 주지 않고 단계적 전달
- **실제 경험**: 실제 UI 컴포넌트를 미리보기로 제공

## 💾 데이터 처리

### 온보딩 상태 관리
```typescript
interface OnboardingState {
  // 진행 상태
  is_completed: boolean;
  current_step: number;                // 1-4
  completed_at?: Date;
  
  // 사용자 설정 (선택사항)
  initial_preferences?: InitialPreferences;
  
  // 메타데이터
  app_version: string;                 // 온보딩 버전 추적
  onboarding_duration: number;        // 완료까지 소요 시간 (초)
}

interface InitialPreferences {
  favorite_cafe?: string;
  coffee_style?: 'light' | 'balanced' | 'strong';
  has_home_cafe?: boolean;
  notification_enabled?: boolean;
}

// AsyncStorage 키
const ONBOARDING_KEY = '@cupnote:onboarding_completed';
const PREFERENCES_KEY = '@cupnote:initial_preferences';
```

### 상태 저장 및 확인
```typescript
const OnboardingService = {
  // 온보딩 완료 상태 확인
  async isCompleted(): Promise<boolean> {
    try {
      const data = await AsyncStorage.getItem(ONBOARDING_KEY);
      return data ? JSON.parse(data).is_completed : false;
    } catch (error) {
      console.warn('Failed to check onboarding status:', error);
      return false;
    }
  },

  // 온보딩 완료 처리
  async markCompleted(preferences?: InitialPreferences): Promise<void> {
    try {
      const onboardingData: OnboardingState = {
        is_completed: true,
        current_step: 4,
        completed_at: new Date(),
        initial_preferences: preferences,
        app_version: getAppVersion(),
        onboarding_duration: getOnboardingDuration()
      };
      
      await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(onboardingData));
      
      if (preferences) {
        await AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      }
    } catch (error) {
      console.error('Failed to save onboarding completion:', error);
    }
  },

  // 온보딩 재설정 (개발/테스트용)
  async reset(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([ONBOARDING_KEY, PREFERENCES_KEY]);
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }
};
```

## 🎨 UI 컴포넌트

### 핵심 컴포넌트
- **OnboardingContainer**: 전체 슬라이드 컨테이너
- **StepIndicator**: 진행 상태 점 표시
- **OnboardingSlide**: 개별 단계 슬라이드 컴포넌트
- **InteractivePreview**: 실제 UI 미리보기 컴포넌트
- **PreferenceSelector**: 초기 설정 입력 컴포넌트
- **AnimatedTransition**: 슬라이드 간 전환 애니메이션

### Tamagui 스타일링
```typescript
const OnboardingContainer = styled(YStack, {
  flex: 1,
  backgroundColor: '$background',
});

const SlideContainer = styled(YStack, {
  flex: 1,
  padding: '$xl',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '$lg',
});

const StepIndicator = styled(XStack, {
  position: 'absolute',
  top: '$lg',
  left: 0,
  right: 0,
  justifyContent: 'center',
  gap: '$sm',
});

const IndicatorDot = styled(Circle, {
  width: 10,
  height: 10,
  
  variants: {
    active: {
      true: {
        backgroundColor: '$cupBlue',
      },
      false: {
        backgroundColor: '$gray6',
      }
    }
  } as const,
});

const OnboardingTitle = styled(Text, {
  fontSize: '$8',
  fontWeight: 'bold',
  color: '$gray12',
  textAlign: 'center',
  lineHeight: '$8',
});

const OnboardingDescription = styled(Text, {
  fontSize: '$4',
  color: '$gray11',
  textAlign: 'center',
  lineHeight: '$4',
  maxWidth: 300,
});

const FeatureCard = styled(Card, {
  padding: '$lg',
  backgroundColor: '$gray1',
  borderRadius: '$4',
  borderWidth: 1,
  borderColor: '$gray6',
  alignItems: 'center',
  gap: '$md',
  minWidth: 280,
  
  pressStyle: {
    scale: 0.98,
    backgroundColor: '$gray2',
  },
  
  variants: {
    highlighted: {
      true: {
        borderColor: '$cupBlue',
        backgroundColor: '$blue1',
      }
    }
  } as const,
});

const NextButton = styled(Button, {
  backgroundColor: '$cupBlue',
  color: 'white',
  borderRadius: '$4',
  paddingHorizontal: '$xl',
  paddingVertical: '$md',
  fontSize: '$4',
  fontWeight: '600',
  minWidth: 200,
  
  variants: {
    final: {
      true: {
        backgroundColor: '$green8',
        fontSize: '$5',
        paddingVertical: '$lg',
      }
    }
  } as const,
});
```

## 🔄 사용자 인터랙션

### 네비게이션 플로우
```typescript
const OnboardingFlow = {
  // 슬라이드 이동
  nextSlide: () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      animateToNext();
    }
  },

  prevSlide: () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      animateToPrev();
    }
  },

  // 온보딩 완료
  completeOnboarding: async (preferences?: InitialPreferences) => {
    await OnboardingService.markCompleted(preferences);
    
    // 앱 메인 화면으로 이동
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
    
    // 완료 효과
    showCompletionToast();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  },

  // 건너뛰기
  skipOnboarding: async () => {
    await OnboardingService.markCompleted();
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  }
};
```

### 인터랙티브 요소
1. **모드 카드 터치**: 각 모드의 상세 설명 오버레이 표시
2. **감각 표현 미리보기**: 실제 선택 UI와 동일한 인터랙션
3. **초기 설정**: 실시간 입력 검증 및 자동완성
4. **진행 상태**: 스와이프 제스처로 이전/다음 이동 지원

## 📊 분석 및 개선

### 온보딩 성과 지표
```typescript
interface OnboardingAnalytics {
  completion_rate: number;             // 완료율 (%)
  average_duration: number;            // 평균 소요 시간 (초)
  step_dropout_rates: number[];        // 단계별 이탈률
  preference_selection_rate: number;   // 초기 설정 완료율
}

const trackOnboardingStep = (step: number, action: string) => {
  AnalyticsService.track('onboarding_step', {
    step,
    action, // 'view', 'next', 'back', 'skip'
    timestamp: new Date().toISOString(),
    duration_so_far: getElapsedTime()
  });
};
```

### A/B 테스트 지원
```typescript
const OnboardingVariants = {
  // 버전 A: 기본 4단계
  default: {
    steps: 4,
    features: ['intro', 'modes', 'expressions', 'setup']
  },
  
  // 버전 B: 간소화 3단계
  simplified: {
    steps: 3,
    features: ['intro', 'modes', 'setup']
  },
  
  // 버전 C: 상세 5단계  
  detailed: {
    steps: 5,
    features: ['intro', 'modes', 'expressions', 'features', 'setup']
  }
};
```

## 🔗 네비게이션

### 앱 시작 플로우
```typescript
const AppStartupFlow = () => {
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      const isCompleted = await OnboardingService.isCompleted();
      
      if (!isCompleted) {
        // 온보딩 필요
        navigation.navigate('Onboarding');
      } else {
        // 메인 앱으로 바로 이동
        navigation.navigate('MainTabs');
      }
    };
    
    checkOnboardingStatus();
  }, []);
};
```

### 온보딩 재시작
```typescript
// 설정에서 온보딩 다시 보기
const restartOnboarding = async () => {
  await OnboardingService.reset();
  navigation.navigate('Onboarding');
};
```

## 📈 성능 최적화

### 지연 로딩
```typescript
// 온보딩 이미지와 애니메이션 최적화
const LazyOnboardingAssets = {
  preloadImages: async () => {
    const images = [
      require('../assets/onboarding/step1.png'),
      require('../assets/onboarding/step2.png'),
      require('../assets/onboarding/step3.png'),
      require('../assets/onboarding/step4.png'),
    ];
    
    await Promise.all(images.map(Image.prefetch));
  },
  
  preloadAnimations: () => {
    // Lottie 애니메이션 미리 로딩
  }
};
```

### 메모리 관리
- 현재 단계의 컨텐츠만 렌더링
- 이전/다음 단계는 가상화로 처리
- 애니메이션 완료 후 자동 정리

## 🧪 테스트 시나리오

### 기능 테스트
1. **완전 플로우**: 1→2→3→4단계 모두 완료
2. **건너뛰기**: 각 단계에서 건너뛰기 동작
3. **뒒로 가기**: 이전 단계로 이동 정상 동작
4. **상태 저장**: 앱 종료 후 재시작시 온보딩 상태 유지

### 사용성 테스트
1. **첫 인상**: 사용자가 앱을 처음 봤을 때의 반응
2. **이해도**: 각 단계별 설명의 명확성
3. **완료율**: 실제 사용자의 온보딩 완료율
4. **만족도**: 온보딩 경험에 대한 전반적 만족도

### 에러 케이스
1. **저장 실패**: AsyncStorage 오류시 처리
2. **권한 거부**: 알림 권한 거부시 처리
3. **네트워크 오류**: 초기 데이터 로딩 실패시 처리

## 🚀 확장 가능성

### Phase 2 개선사항
- **개인화 온보딩**: 사용자 응답에 따른 맞춤형 플로우
- **비디오 가이드**: 실제 사용 예시 동영상 포함
- **소셜 연동**: 친구 초대 및 소셜 로그인 설정
- **위치 기반**: 주변 카페 자동 추천

### Phase 3 고급 기능
- **AI 큐레이션**: 사용자 프로필 기반 맞춤 추천
- **인터랙티브 튜토리얼**: 실제 앱 기능과 연동된 가이드
- **다국어 지원**: 영어, 일본어 등 다국어 온보딩
- **접근성 향상**: 음성 가이드, 고대비 모드 등

---

**문서 버전**: 1.0  
**최종 수정**: 2025-07-28  
**관련 문서**: HOME_SCREEN.md, MODE_SELECTION_SCREEN.md  
**구현 상태**: ✅ 완료 (4단계 온보딩 + AsyncStorage 영구 저장)