/**
 * Test data fixtures for CupNote E2E tests
 */

export const TestUsers = {
  validUser: {
    email: 'test@cupnote.com',
    password: 'TestPassword123!',
    username: 'TestUser'
  },
  
  adminUser: {
    email: 'admin@cupnote.com',
    password: 'AdminPassword123!',
    username: 'AdminUser'
  },
  
  premiumUser: {
    email: 'premium@cupnote.com',
    password: 'PremiumPassword123!',
    username: 'PremiumUser'
  }
}

export const CoffeeData = {
  basicCoffee: {
    mode: 'cafe' as const,
    coffeeInfo: {
      name: 'Ethiopian Yirgacheffe',
      roastery: 'Blue Bottle Coffee',
      origin: 'Ethiopia',
      roastLevel: 'Light',
      brewMethod: 'V60',
      price: '28000'
    },
    roasterNote: 'Bright citrus notes with floral undertones. Light body with clean finish.',
    personalTasting: {
      taste: 'Sweet and bright with lemon and bergamot notes. Very clean.',
      memo: 'Perfect for morning brewing. Will definitely buy again.',
      rating: 5,
      matchScore: 92
    }
  },

  homeCafeCoffee: {
    mode: 'homecafe' as const,
    coffeeInfo: {
      name: 'Colombian Huila',
      roastery: 'Local Roastery',
      origin: 'Colombia',
      roastLevel: 'Medium',
      brewMethod: 'French Press',
      price: '22000',
      brewTime: '4:00',
      waterTemp: '92',
      grindSize: 'Coarse'
    },
    roasterNote: 'Chocolate and caramel sweetness with balanced acidity.',
    personalTasting: {
      taste: 'Rich chocolate notes with a hint of orange zest.',
      memo: 'Great for weekend morning brewing sessions.',
      rating: 4,
      matchScore: 85
    }
  },

  labCoffee: {
    mode: 'lab' as const,
    coffeeInfo: {
      name: 'Panama Geisha',
      roastery: 'Specialty Lab',
      origin: 'Panama',
      roastLevel: 'Light+',
      brewMethod: 'V60',
      price: '85000',
      brewTime: '2:30',
      waterTemp: '93',
      grindSize: 'Medium-Fine',
      coffeeAmount: '22',
      waterAmount: '350',
      tds: '1.35',
      extractionYield: '20.5'
    },
    roasterNote: 'Exceptional clarity with jasmine florals and tropical fruit complexity.',
    personalTasting: {
      taste: 'Incredible jasmine and tropical fruit notes. Very complex and clean.',
      memo: 'One of the best Geishas I\'ve tasted. Worth the premium price.',
      rating: 5,
      matchScore: 95
    }
  },

  budgetCoffee: {
    mode: 'cafe' as const,
    coffeeInfo: {
      name: 'House Blend',
      roastery: 'Cafe Local',
      origin: 'Brazil',
      roastLevel: 'Medium-Dark',
      brewMethod: 'Espresso',
      price: '15000'
    },
    roasterNote: 'Balanced and approachable with nutty and chocolate notes.',
    personalTasting: {
      taste: 'Nutty and chocolatey. Good daily drinker.',
      memo: 'Solid espresso base. Good value for money.',
      rating: 3,
      matchScore: 70
    }
  }
}

export const SearchQueries = {
  popular: [
    'Ethiopian',
    'Blue Bottle',
    'V60',
    'Light roast',
    'citrus',
    'chocolate'
  ],
  
  specific: [
    'Ethiopian Yirgacheffe Blue Bottle',
    'Colombia French Press',
    'Panama Geisha V60',
    'Medium roast espresso'
  ],
  
  empty: [
    '',
    '   ',
    'NonExistentCoffee12345',
    'zzzzzzzzz'
  ],
  
  special: [
    'café',
    '에티오피아',
    'コーヒー',
    '!@#$%^&*()',
    'very long search query that goes on and on and should test the limits of the search functionality'
  ]
}

export const FlavorTags = {
  fruity: ['citrus', 'berry', 'apple', 'tropical', 'stone fruit'],
  sweet: ['caramel', 'vanilla', 'honey', 'brown sugar', 'maple'],
  nutty: ['almond', 'hazelnut', 'walnut', 'peanut', 'pecan'],
  spicy: ['cinnamon', 'nutmeg', 'clove', 'cardamom', 'black pepper'],
  floral: ['jasmine', 'rose', 'lavender', 'bergamot', 'elderflower'],
  earthy: ['cedar', 'tobacco', 'leather', 'mushroom', 'soil'],
  roasted: ['dark chocolate', 'cocoa', 'roasted nuts', 'toast', 'smoke']
}

export const Achievements = {
  milestone: [
    {
      id: 'first-record',
      title: '첫 기록',
      description: '첫 번째 커피를 기록했어요!',
      requiredRecords: 1
    },
    {
      id: 'coffee-lover',
      title: '커피 애호가',
      description: '10개의 커피를 기록했어요',
      requiredRecords: 10
    },
    {
      id: 'coffee-expert',
      title: '커피 전문가',
      description: '50개의 커피를 기록했어요',
      requiredRecords: 50
    }
  ],
  
  exploration: [
    {
      id: 'world-explorer',
      title: '세계 탐험가',
      description: '10개 이상의 다른 원산지 커피를 마셨어요',
      requiredOrigins: 10
    },
    {
      id: 'roastery-hopper',
      title: '로스터리 탐방가',
      description: '5개 이상의 다른 로스터리를 방문했어요',
      requiredRoasteries: 5
    }
  ],
  
  quality: [
    {
      id: 'perfectionist',
      title: '완벽주의자',
      description: '5점 만점을 10번 받았어요',
      requiredFiveStars: 10
    },
    {
      id: 'quality-seeker',
      title: '품질 추구자',
      description: '평균 평점이 4점 이상이에요',
      requiredAverageRating: 4.0
    }
  ]
}

export const Origins = [
  'Ethiopia',
  'Colombia',
  'Brazil',
  'Kenya',
  'Guatemala',
  'Costa Rica',
  'Panama',
  'Jamaica',
  'Yemen',
  'Peru',
  'Honduras',
  'El Salvador',
  'Nicaragua',
  'Ecuador',
  'Bolivia'
]

export const Roasteries = [
  'Blue Bottle Coffee',
  'Stumptown Coffee',
  'Intelligentsia',
  'Counter Culture',
  'Ritual Coffee',
  'Four Barrel Coffee',
  'La Colombe',
  'Verve Coffee',
  'George Howell Coffee',
  'Sweet Maria\'s',
  '로컬 로스터리',
  '스페셜티 로스터리',
  '카페 로스터리'
]

export const BrewMethods = [
  'V60',
  'Chemex',
  'French Press',
  'AeroPress',
  'Espresso',
  'Cold Brew',
  'Siphon',
  'Moka Pot',
  'Kalita Wave',
  'Clever Dripper'
]

export const RoastLevels = [
  'Light',
  'Light+',
  'Medium-Light',
  'Medium',
  'Medium+',
  'Medium-Dark',
  'Dark',
  'Dark+'
]

export const TestScenarios = {
  quickRecord: {
    name: 'Quick Test Coffee',
    roastery: 'Quick Roastery',
    origin: 'Brazil',
    roastLevel: 'Medium',
    brewMethod: 'V60',
    roasterNote: 'Quick test note',
    taste: 'Quick taste',
    memo: 'Quick memo',
    rating: 3
  },
  
  detailedRecord: {
    name: 'Detailed Test Coffee Premium Single Origin Micro-lot',
    roastery: 'Detailed Premium Specialty Coffee Roastery with Long Name',
    origin: 'Ethiopia',
    roastLevel: 'Light',
    brewMethod: 'V60',
    price: '45000',
    roasterNote: 'This is a very detailed roaster note that includes comprehensive information about the coffee including processing method, farm details, altitude, varietals, and expected flavor profile with tasting notes and brewing recommendations.',
    taste: 'Incredibly complex taste profile with bright citrus acidity, floral jasmine notes, tropical fruit sweetness, and a clean lingering finish that evolves as it cools.',
    memo: 'This is a detailed memo about the coffee experience including brewing parameters, personal thoughts, comparison to other coffees, and detailed notes about the experience.',
    rating: 5,
    matchScore: 93
  },
  
  multipleRecordsBatch: Array.from({ length: 20 }, (_, i) => ({
    name: `Batch Coffee ${i + 1}`,
    roastery: `Batch Roastery ${Math.ceil((i + 1) / 5)}`,
    origin: Origins[i % Origins.length],
    roastLevel: RoastLevels[i % RoastLevels.length],
    brewMethod: BrewMethods[i % BrewMethods.length],
    roasterNote: `Batch roaster note ${i + 1}`,
    taste: `Batch taste note ${i + 1}`,
    memo: `Batch memo ${i + 1}`,
    rating: (i % 5) + 1 // Ratings from 1-5
  }))
}

export const ErrorScenarios = {
  networkErrors: [
    { status: 400, message: 'Bad Request' },
    { status: 401, message: 'Unauthorized' },
    { status: 403, message: 'Forbidden' },
    { status: 404, message: 'Not Found' },
    { status: 500, message: 'Internal Server Error' },
    { status: 502, message: 'Bad Gateway' },
    { status: 503, message: 'Service Unavailable' },
    { status: 504, message: 'Gateway Timeout' }
  ],
  
  validationErrors: [
    { field: 'coffeeName', value: '', error: '커피명을 입력해주세요' },
    { field: 'roastery', value: '', error: '로스터리를 입력해주세요' },
    { field: 'origin', value: '', error: '원산지를 입력해주세요' },
    { field: 'email', value: 'invalid-email', error: '유효한 이메일 주소를 입력해주세요' },
    { field: 'password', value: '123', error: '비밀번호는 최소 6자 이상이어야 합니다' },
    { field: 'username', value: 'a', error: '사용자명은 최소 2자 이상이어야 합니다' }
  ]
}

export const PerformanceThresholds = {
  pageLoad: {
    good: 2000,
    acceptable: 4000,
    poor: 6000
  },
  
  interaction: {
    good: 100,
    acceptable: 300,
    poor: 500
  },
  
  search: {
    good: 500,
    acceptable: 1000,
    poor: 2000
  },
  
  save: {
    good: 1000,
    acceptable: 3000,
    poor: 5000
  }
}

export const AccessibilityChecks = {
  requiredAriaLabels: [
    { selector: 'input[type="email"]', label: '이메일' },
    { selector: 'input[type="password"]', label: '비밀번호' },
    { selector: 'input[name="coffeeName"]', label: '커피명' },
    { selector: 'button[type="submit"]', label: '제출' }
  ],
  
  headingHierarchy: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
  ],
  
  colorContrast: {
    normal: 4.5,
    large: 3.0
  }
}

export const MobileDevices = {
  iPhone: {
    width: 375,
    height: 667,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)'
  },
  
  Android: {
    width: 360,
    height: 640,
    userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G981B)'
  },
  
  iPad: {
    width: 768,
    height: 1024,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_0 like Mac OS X)'
  }
}