// 미리 정의된 튜토리얼들

export const TUTORIALS = {
  // 첫 방문자를 위한 온보딩 튜토리얼
  ONBOARDING: {
    id: 'onboarding',
    name: '시작하기',
    autoStart: true,
    conditions: {
      pathname: '/',
      userType: 'new' as const,
      maxCompletions: 1
    },
    steps: [
      {
        id: 'welcome',
        target: '.hero-section, h1',
        title: '환영합니다! ☕',
        content: 'CupNote에 오신 것을 환영합니다! 나만의 커피 여정을 기록해보세요.',
        placement: 'bottom' as const,
        skipable: false
      },
      {
        id: 'signup',
        target: '[data-testid="signup-button"], .signup-button',
        title: '계정 만들기',
        content: '먼저 계정을 만들어서 커피 기록을 저장해보세요.',
        placement: 'top' as const,
        action: 'click' as const
      },
      {
        id: 'features',
        target: '.features-section, .feature-cards',
        title: '주요 기능',
        content: '커피 기록, 성장 추적, 성취 시스템 등 다양한 기능을 제공합니다.',
        placement: 'top' as const
      }
    ]
  },

  // 모드 선택 튜토리얼
  MODE_SELECTION: {
    id: 'mode-selection',
    name: '모드 선택 가이드',
    autoStart: true,
    conditions: {
      pathname: '/mode-selection',
      maxCompletions: 2
    },
    steps: [
      {
        id: 'mode-intro',
        target: '.mode-selection-header, h1',
        title: '기록 모드 선택',
        content: '상황에 맞는 기록 모드를 선택해보세요. 각 모드는 다른 경험을 제공합니다.',
        placement: 'bottom' as const
      },
      {
        id: 'cafe-mode',
        target: '[data-mode="cafe"], .cafe-mode-card',
        title: '카페 모드 ☕',
        content: '카페에서 마신 커피를 빠르게 기록할 수 있습니다. (5-7분 소요)',
        placement: 'bottom' as const,
        action: 'hover' as const
      },
      {
        id: 'homecafe-mode',
        target: '[data-mode="homecafe"], .homecafe-mode-card',
        title: '홈카페 모드 🏠',
        content: '집에서 내린 커피의 레시피와 맛을 상세히 기록할 수 있습니다. (8-12분 소요)',
        placement: 'bottom' as const,
        action: 'hover' as const
      },
      {
        id: 'choose-mode',
        target: '.mode-cards',
        title: '모드 선택하기',
        content: '지금 상황에 맞는 모드를 선택해서 첫 번째 커피를 기록해보세요!',
        placement: 'top' as const,
        action: 'click' as const
      }
    ]
  },

  // 카페 모드 튜토리얼
  CAFE_FLOW: {
    id: 'cafe-flow',
    name: '카페 모드 가이드',
    autoStart: true,
    conditions: {
      pathname: '/tasting-flow/cafe/coffee-info',
      maxCompletions: 1
    },
    steps: [
      {
        id: 'coffee-info-intro',
        target: '.coffee-info-form, .form-container',
        title: '커피 정보 입력',
        content: '마신 커피의 기본 정보를 입력해주세요. 필수 항목만 입력해도 괜찮습니다.',
        placement: 'top' as const
      },
      {
        id: 'cafe-name',
        target: '[name="cafeName"], .cafe-name-input',
        title: '카페명',
        content: '어떤 카페에서 마셨나요? 정확하지 않아도 괜찮습니다.',
        placement: 'bottom' as const,
        action: 'input' as const
      },
      {
        id: 'coffee-name',
        target: '[name="coffeeName"], .coffee-name-input',
        title: '커피명',
        content: '마신 커피의 이름을 입력해주세요.',
        placement: 'bottom' as const,
        action: 'input' as const
      },
      {
        id: 'next-step',
        target: '.next-button, [data-testid="next-step"]',
        title: '다음 단계로',
        content: '기본 정보를 입력했다면 다음 단계로 넘어가세요.',
        placement: 'top' as const,
        action: 'click' as const
      }
    ]
  },

  // 맛 선택 튜토리얼
  FLAVOR_SELECTION: {
    id: 'flavor-selection',
    name: '맛 선택 가이드',
    autoStart: true,
    conditions: {
      pathname: '/tasting-flow/cafe/flavor-selection',
      maxCompletions: 1
    },
    steps: [
      {
        id: 'flavor-intro',
        target: '.flavor-wheel, .flavor-grid',
        title: '맛 선택하기',
        content: '커피에서 느낀 맛을 선택해보세요. 정답은 없습니다. 본인이 느낀 대로 선택하면 됩니다.',
        placement: 'top' as const
      },
      {
        id: 'flavor-categories',
        target: '.flavor-categories, .category-tabs',
        title: '맛 카테고리',
        content: '과일, 꽃, 견과류 등 다양한 카테고리에서 맛을 선택할 수 있습니다.',
        placement: 'bottom' as const
      },
      {
        id: 'flavor-intensity',
        target: '.intensity-slider, .flavor-intensity',
        title: '강도 조절',
        content: '선택한 맛의 강도를 조절할 수 있습니다.',
        placement: 'top' as const,
        action: 'click' as const
      },
      {
        id: 'multiple-selection',
        target: '.selected-flavors, .flavor-chips',
        title: '여러 맛 선택',
        content: '여러 개의 맛을 선택할 수 있습니다. 복합적인 맛을 표현해보세요.',
        placement: 'bottom' as const
      }
    ]
  },

  // 결과 페이지 튜토리얼
  RESULT_PAGE: {
    id: 'result-page',
    name: '결과 확인',
    autoStart: true,
    conditions: {
      pathname: '/tasting-flow/cafe/result',
      maxCompletions: 1
    },
    steps: [
      {
        id: 'match-score',
        target: '.match-score-display, .score-card',
        title: 'Match Score',
        content: '로스터의 설명과 당신의 선택이 얼마나 일치하는지 보여주는 점수입니다.',
        placement: 'bottom' as const
      },
      {
        id: 'comparison',
        target: '.flavor-comparison, .comparison-section',
        title: '맛 비교',
        content: '로스터가 설명한 맛과 당신이 선택한 맛을 비교해볼 수 있습니다.',
        placement: 'top' as const
      },
      {
        id: 'save-record',
        target: '.save-button, [data-testid="save-record"]',
        title: '기록 저장',
        content: '완성된 기록을 저장해서 나중에 다시 볼 수 있습니다.',
        placement: 'top' as const,
        action: 'click' as const
      },
      {
        id: 'next-coffee',
        target: '.new-record-button, .continue-button',
        title: '다음 커피',
        content: '첫 번째 기록을 완성했습니다! 다른 커피도 기록해보세요.',
        placement: 'top' as const
      }
    ]
  },

  // 홈카페 모드 특별 기능 (브루 설정)
  BREW_SETUP: {
    id: 'brew-setup',
    name: '브루 설정 가이드',
    autoStart: true,
    conditions: {
      pathname: '/tasting-flow/homecafe/brew-setup',
      maxCompletions: 1
    },
    steps: [
      {
        id: 'brew-intro',
        target: '.brew-setup-form',
        title: '추출 설정',
        content: '홈카페 모드에서는 상세한 추출 정보를 기록할 수 있습니다.',
        placement: 'top' as const
      },
      {
        id: 'dripper-selection',
        target: '.dripper-selector, [name="dripper"]',
        title: '드리퍼 선택',
        content: '사용한 드리퍼를 선택해주세요.',
        placement: 'bottom' as const,
        action: 'click' as const
      },
      {
        id: 'coffee-amount',
        target: '[name="coffeeAmount"], .coffee-amount-input',
        title: '원두량',
        content: '사용한 원두의 양을 그램 단위로 입력해주세요.',
        placement: 'bottom' as const,
        action: 'input' as const
      },
      {
        id: 'water-amount',
        target: '[name="waterAmount"], .water-amount-input',
        title: '물의 양',
        content: '사용한 물의 양을 ml 단위로 입력해주세요. 비율이 자동으로 계산됩니다.',
        placement: 'bottom' as const,
        action: 'input' as const
      },
      {
        id: 'timer-feature',
        target: '.brew-timer, .timer-section',
        title: '브루 타이머',
        content: '추출 시간을 측정하고 기록할 수 있습니다.',
        placement: 'top' as const
      }
    ]
  },

  // 기능 발견 튜토리얼
  FEATURE_DISCOVERY: {
    id: 'feature-discovery',
    name: '숨겨진 기능들',
    autoStart: false, // 수동으로 시작
    steps: [
      {
        id: 'mobile-nav',
        target: '[data-testid="mobile-navigation"]',
        title: '하단 네비게이션',
        content: '홈, 성취, 새 기록, 통계, 설정 등 주요 기능에 빠르게 접근할 수 있습니다.',
        placement: 'top' as const
      },
      {
        id: 'achievements',
        target: '[href="/achievements"]',
        title: '성취 시스템',
        content: '다양한 성취를 달성하며 커피 여정을 더욱 재미있게 만들어보세요.',
        placement: 'top' as const,
        action: 'hover' as const
      },
      {
        id: 'stats',
        target: '[href="/stats"]',
        title: '통계 확인',
        content: '당신의 커피 취향과 성장 과정을 시각적으로 확인할 수 있습니다.',
        placement: 'top' as const,
        action: 'hover' as const
      },
      {
        id: 'offline-sync',
        target: '.sync-status, .network-status',
        title: '오프라인 지원',
        content: '인터넷이 없어도 기록할 수 있고, 연결되면 자동으로 동기화됩니다.',
        placement: 'bottom' as const
      }
    ]
  }
} as const

export type TutorialId = keyof typeof TUTORIALS