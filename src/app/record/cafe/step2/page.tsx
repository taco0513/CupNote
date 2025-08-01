'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowRight, 
  ArrowLeft, 
  Sparkles,
  Check,
  Coffee,
  MapPin,
  Thermometer
} from 'lucide-react'
import Navigation from '../../../../components/Navigation'

interface Step1Data {
  coffeeName: string
  roastery: string
  date: string
  mode: 'cafe' | 'homecafe'
}

interface CafeData {
  cafe_name: string
  coffee_name: string
  roastery: string
  price?: string
  temperature: 'hot' | 'iced'
  origin?: string
  variety?: string
  altitude?: string
  roast_level?: string
  processing?: string
}

// SCA Flavor Wheel 한국어 완전판 (9개 대분류, 85개 향미)
const SCA_FLAVOR_WHEEL = {
  fruity: {
    id: 'fruity',
    nameKo: '과일향/프루티',
    nameEn: 'Fruity',
    icon: '🍓',
    color: 'red',
    level2Items: {
      berry: {
        id: 'berry',
        nameKo: '베리류/딸기류',
        nameEn: 'Berry',
        level3Items: [
          { id: 'blackberry', nameKo: '블랙베리', nameEn: 'Blackberry', description: '진하고 달콤한 검은 베리' },
          { id: 'raspberry', nameKo: '라즈베리', nameEn: 'Raspberry', description: '새콤달콤한 붉은 베리' },
          { id: 'blueberry', nameKo: '블루베리', nameEn: 'Blueberry', description: '달콤하고 과즙이 많은 베리' },
          { id: 'strawberry', nameKo: '딸기', nameEn: 'Strawberry', description: '상큼하고 달콤한 붉은 베리' }
        ]
      },
      dried_fruit: {
        id: 'dried_fruit',
        nameKo: '건조 과일',
        nameEn: 'Dried Fruit',
        level3Items: [
          { id: 'raisin', nameKo: '건포도', nameEn: 'Raisin', description: '달콤하고 진한 말린 포도' },
          { id: 'prune', nameKo: '자두', nameEn: 'Prune', description: '부드럽고 달콤한 과일' }
        ]
      },
      other_fruit: {
        id: 'other_fruit',
        nameKo: '기타 과일',
        nameEn: 'Other Fruit',
        level3Items: [
          { id: 'coconut', nameKo: '코코넛', nameEn: 'Coconut', description: '고소하고 달콤한 열대 과일' },
          { id: 'cherry', nameKo: '체리', nameEn: 'Cherry', description: '달콤하고 진한 붉은 과일' },
          { id: 'pomegranate', nameKo: '석류', nameEn: 'Pomegranate', description: '새콤달콤한 붉은 과일' },
          { id: 'pineapple', nameKo: '파인애플', nameEn: 'Pineapple', description: '상큼하고 톡 쏘는 열대 과일' },
          { id: 'grape', nameKo: '포도', nameEn: 'Grape', description: '달콤하고 과즙이 많은 과일' },
          { id: 'apple', nameKo: '사과', nameEn: 'Apple', description: '상큼하고 아삭한 과일' },
          { id: 'peach', nameKo: '복숭아', nameEn: 'Peach', description: '부드럽고 달콤한 과일' },
          { id: 'pear', nameKo: '배', nameEn: 'Pear', description: '시원하고 달콤한 과일' }
        ]
      },
      citrus: {
        id: 'citrus',
        nameKo: '감귤향/시트러스',
        nameEn: 'Citrus',
        level3Items: [
          { id: 'grapefruit', nameKo: '자몽', nameEn: 'Grapefruit', description: '쌉싸름하고 상큼한 과일' },
          { id: 'orange', nameKo: '오렌지', nameEn: 'Orange', description: '달콤하고 상큼한 오렌지' },
          { id: 'lemon', nameKo: '레몬', nameEn: 'Lemon', description: '밝고 시큼한 노란 과일' },
          { id: 'lime', nameKo: '라임', nameEn: 'Lime', description: '시큼하고 청량한 과일' }
        ]
      }
    }
  },
  sour_fermented: {
    id: 'sour_fermented',
    nameKo: '신맛/발효',
    nameEn: 'Sour/Fermented',
    icon: '🍋',
    color: 'yellow',
    level2Items: {
      sour: {
        id: 'sour',
        nameKo: '신맛',
        nameEn: 'Sour',
        level3Items: [
          { id: 'sour_aromatics', nameKo: '신맛 아로마', nameEn: 'Sour Aromatics', description: '전반적인 신맛' },
          { id: 'acetic_acid', nameKo: '아세트산', nameEn: 'Acetic Acid', description: '식초 같은 신맛' },
          { id: 'butyric_acid', nameKo: '뷰티르산', nameEn: 'Butyric Acid', description: '버터 같은 발효 냄새' },
          { id: 'isovaleric_acid', nameKo: '이소발러산', nameEn: 'Isovaleric Acid', description: '치즈 같은 발효 냄새' },
          { id: 'citric_acid', nameKo: '구연산', nameEn: 'Citric Acid', description: '레몬 같은 상큼한 신맛' },
          { id: 'malic_acid', nameKo: '사과산', nameEn: 'Malic Acid', description: '사과 같은 부드러운 신맛' }
        ]
      },
      alcohol_fermented: {
        id: 'alcohol_fermented',
        nameKo: '알코올/발효',
        nameEn: 'Alcohol/Fermented',
        level3Items: [
          { id: 'winey', nameKo: '와인향', nameEn: 'Winey', description: '발효된 포도의 복합적인 맛' },
          { id: 'whiskey', nameKo: '위스키향', nameEn: 'Whiskey', description: '오크통 숙성의 깊은 맛' },
          { id: 'fermented', nameKo: '발효', nameEn: 'Fermented', description: '은은한 발효향' },
          { id: 'overripe', nameKo: '과숙', nameEn: 'Overripe', description: '지나치게 익은 과일향' }
        ]
      }
    }
  },
  green_vegetative: {
    id: 'green_vegetative',
    nameKo: '초록/식물성',
    nameEn: 'Green/Vegetative',
    icon: '🌿',
    color: 'green',
    level2Items: {
      olive_oil: {
        id: 'olive_oil',
        nameKo: '올리브 오일',
        nameEn: 'Olive Oil',
        level3Items: [
          { id: 'olive_oil', nameKo: '올리브 오일', nameEn: 'Olive Oil', description: '부드럽고 고소한 오일향' }
        ]
      },
      raw: {
        id: 'raw',
        nameKo: '생것',
        nameEn: 'Raw',
        level3Items: [
          { id: 'raw', nameKo: '생것', nameEn: 'Raw', description: '날것의 신선한 향' }
        ]
      },
      green_vegetative_herbs: {
        id: 'green_vegetative_herbs',
        nameKo: '허브/식물성',
        nameEn: 'Green/Vegetative',
        level3Items: [
          { id: 'under_ripe', nameKo: '덜 익은', nameEn: 'Under-ripe', description: '미성숙한 과일이나 채소향' },
          { id: 'peapod', nameKo: '완두콩 꼬투리', nameEn: 'Peapod', description: '신선한 콩과 식물향' },
          { id: 'fresh', nameKo: '신선한', nameEn: 'Fresh', description: '갓 딴 채소나 과일향' },
          { id: 'dark_green', nameKo: '진한 녹색', nameEn: 'Dark Green', description: '진한 잎채소향' },
          { id: 'vegetative', nameKo: '식물성', nameEn: 'Vegetative', description: '전반적인 식물향' },
          { id: 'hay_like', nameKo: '건초', nameEn: 'Hay-like', description: '말린 풀향' },
          { id: 'herb_like', nameKo: '허브', nameEn: 'Herb-like', description: '신선한 허브향' }
        ]
      },
      beany: {
        id: 'beany',
        nameKo: '콩비린내',
        nameEn: 'Beany',
        level3Items: [
          { id: 'beany', nameKo: '콩비린내', nameEn: 'Beany', description: '날콩의 비린내' }
        ]
      }
    }
  },
  other: {
    id: 'other',
    nameKo: '기타',
    nameEn: 'Other',
    icon: '📦',
    color: 'gray',
    level2Items: {
      papery_musty: {
        id: 'papery_musty',
        nameKo: '종이 냄새/곰팡이 냄새',
        nameEn: 'Papery/Musty',
        level3Items: [
          { id: 'stale', nameKo: '묵은', nameEn: 'Stale', description: '오래되고 낡은 냄새' },
          { id: 'cardboard', nameKo: '판지', nameEn: 'Cardboard', description: '골판지 같은 냄새' },
          { id: 'papery', nameKo: '종이', nameEn: 'Papery', description: '종이 냄새' },
          { id: 'woody', nameKo: '목재 냄새', nameEn: 'Woody', description: '나무 냄새' },
          { id: 'moldy_damp', nameKo: '곰팡이/습한', nameEn: 'Moldy/Damp', description: '습하고 곰팡이 난 냄새' },
          { id: 'moldy_dusty', nameKo: '곰팡이/먼지', nameEn: 'Moldy/Dusty', description: '먼지 낀 곰팡이 냄새' },
          { id: 'moldy_earthy', nameKo: '곰팡이/흙냄새', nameEn: 'Moldy/Earthy', description: '흙 같은 곰팡이 냄새' },
          { id: 'animalic', nameKo: '동물 냄새', nameEn: 'Animalic', description: '동물적인 냄새' },
          { id: 'meaty_brothy', nameKo: '고기/육수', nameEn: 'Meaty/Brothy', description: '고기나 육수 냄새' },
          { id: 'phenolic', nameKo: '페놀', nameEn: 'Phenolic', description: '약품 같은 화학물질 냄새' }
        ]
      },
      chemical: {
        id: 'chemical',
        nameKo: '화학물질 냄새',
        nameEn: 'Chemical',
        level3Items: [
          { id: 'bitter', nameKo: '쓴맛', nameEn: 'Bitter', description: '쓴 화학물질 맛' },
          { id: 'salty', nameKo: '짠맛', nameEn: 'Salty', description: '짠 맛' },
          { id: 'medicinal', nameKo: '약품 냄새', nameEn: 'Medicinal', description: '약품 같은 냄새' },
          { id: 'petroleum', nameKo: '석유', nameEn: 'Petroleum', description: '석유 냄새' },
          { id: 'skunky', nameKo: '스컹크', nameEn: 'Skunky', description: '스컹크 같은 냄새' },
          { id: 'rubber', nameKo: '고무 냄새', nameEn: 'Rubber', description: '고무 냄새' }
        ]
      }
    }
  },
  roasted: {
    id: 'roasted',
    nameKo: '로스팅',
    nameEn: 'Roasted',
    icon: '🔥',
    color: 'orange',
    level2Items: {
      pipe_tobacco: {
        id: 'pipe_tobacco',
        nameKo: '파이프 담배',
        nameEn: 'Pipe Tobacco',
        level3Items: [
          { id: 'pipe_tobacco', nameKo: '파이프 담배', nameEn: 'Pipe Tobacco', description: '파이프 담배향' }
        ]
      },
      tobacco: {
        id: 'tobacco',
        nameKo: '담배',
        nameEn: 'Tobacco',
        level3Items: [
          { id: 'tobacco', nameKo: '담배', nameEn: 'Tobacco', description: '일반 담배향' }
        ]
      },
      burnt_smoky: {
        id: 'burnt_smoky',
        nameKo: '탄내/스모키',
        nameEn: 'Burnt/Smoky',
        level3Items: [
          { id: 'acrid', nameKo: '신랄한', nameEn: 'Acrid', description: '톡 쏘는 탄내' },
          { id: 'ashy', nameKo: '재 냄새', nameEn: 'Ashy', description: '재처럼 타버린 냄새' },
          { id: 'smoky', nameKo: '연기', nameEn: 'Smoky', description: '그을린 나무나 스모키한 향' },
          { id: 'brown_roast', nameKo: '브라운 로스트', nameEn: 'Brown Roast', description: '진하게 로스팅한 향' }
        ]
      },
      cereal_bread: {
        id: 'cereal_bread',
        nameKo: '곡물 냄새/구운 빵 냄새',
        nameEn: 'Cereal/Bread',
        level3Items: [
          { id: 'grain', nameKo: '곡식', nameEn: 'Grain', description: '구운 곡물향' },
          { id: 'malt', nameKo: '맥아', nameEn: 'Malt', description: '구운 맥아향' }
        ]
      }
    }
  },
  spices: {
    id: 'spices',
    nameKo: '향신료',
    nameEn: 'Spices',
    icon: '🌶️',
    color: 'red',
    level2Items: {
      pungent: {
        id: 'pungent',
        nameKo: '자극적/펀전트',
        nameEn: 'Pungent',
        level3Items: [
          { id: 'pepper', nameKo: '후추', nameEn: 'Pepper', description: '톡 쏘는 검은 후추' }
        ]
      },
      pepper: {
        id: 'pepper',
        nameKo: '후추',
        nameEn: 'Pepper',
        level3Items: [
          { id: 'pepper', nameKo: '후추', nameEn: 'Pepper', description: '일반적인 후추향' }
        ]
      },
      brown_spice: {
        id: 'brown_spice',
        nameKo: '갈색 향신료',
        nameEn: 'Brown Spice',
        level3Items: [
          { id: 'anise', nameKo: '아니스', nameEn: 'Anise', description: '달콤하고 향긋한 향신료' },
          { id: 'nutmeg', nameKo: '육두구', nameEn: 'Nutmeg', description: '따뜻하고 달콤한 향신료' },
          { id: 'cinnamon', nameKo: '계피', nameEn: 'Cinnamon', description: '달콤하고 매운 향신료' },
          { id: 'clove', nameKo: '정향', nameEn: 'Clove', description: '진하고 따뜻한 향신료' }
        ]
      }
    }
  },
  nutty_cocoa: {
    id: 'nutty_cocoa',
    nameKo: '견과류/너티/코코아',
    nameEn: 'Nutty/Cocoa',
    icon: '🥜',
    color: 'amber',
    level2Items: {
      nutty: {
        id: 'nutty',
        nameKo: '견과류 냄새',
        nameEn: 'Nutty',
        level3Items: [
          { id: 'almond', nameKo: '아몬드', nameEn: 'Almond', description: '고소하고 부드러운 견과' },
          { id: 'hazelnut', nameKo: '헤이즐넛', nameEn: 'Hazelnut', description: '진하고 버터리한 견과' },
          { id: 'peanuts', nameKo: '땅콩', nameEn: 'Peanuts', description: '구수하고 친숙한 견과' }
        ]
      },
      chocolate: {
        id: 'chocolate',
        nameKo: '초콜릿향',
        nameEn: 'Chocolate',
        level3Items: [
          { id: 'chocolate', nameKo: '초콜릿', nameEn: 'Chocolate', description: '달콤하고 부드러운 초콜릿' },
          { id: 'dark_chocolate', nameKo: '다크초콜릿', nameEn: 'Dark Chocolate', description: '쌉싸름하고 진한 카카오' }
        ]
      }
    }
  },
  sweet: {
    id: 'sweet',
    nameKo: '단맛',
    nameEn: 'Sweet',
    icon: '🍯',
    color: 'amber',
    level2Items: {
      brown_sugar: {
        id: 'brown_sugar',
        nameKo: '캐러멜향/갈색설탕',
        nameEn: 'Brown Sugar/Caramel',
        level3Items: [
          { id: 'molasses', nameKo: '당밀', nameEn: 'Molasses', description: '진하고 끈적한 단맛' },
          { id: 'maple_syrup', nameKo: '메이플시럽', nameEn: 'Maple Syrup', description: '고소하고 달콤한 시럽' },
          { id: 'caramelized', nameKo: '캐러멜', nameEn: 'Caramelized', description: '구운 설탕의 달콤함' },
          { id: 'honey', nameKo: '꿀', nameEn: 'Honey', description: '부드럽고 자연스러운 단맛' }
        ]
      },
      vanilla: {
        id: 'vanilla',
        nameKo: '바닐라',
        nameEn: 'Vanilla',
        level3Items: [
          { id: 'vanilla', nameKo: '바닐라', nameEn: 'Vanilla', description: '크리미하고 부드러운 단맛' }
        ]
      },
      vanillin: {
        id: 'vanillin',
        nameKo: '바닐린',
        nameEn: 'Vanillin',
        level3Items: [
          { id: 'vanillin', nameKo: '바닐린', nameEn: 'Vanillin', description: '인공 바닐라향' }
        ]
      },
      overall_sweet: {
        id: 'overall_sweet',
        nameKo: '전반적 단맛',
        nameEn: 'Overall Sweet',
        level3Items: [
          { id: 'overall_sweet', nameKo: '전반적 단맛', nameEn: 'Overall Sweet', description: '전체적으로 달콤한 느낌' }
        ]
      },
      sweet_aromatics: {
        id: 'sweet_aromatics',
        nameKo: '달콤한 아로마',
        nameEn: 'Sweet Aromatics',
        level3Items: [
          { id: 'sweet_aromatics', nameKo: '달콤한 아로마', nameEn: 'Sweet Aromatics', description: '은은한 달콤함' }
        ]
      }
    }
  },
  floral: {
    id: 'floral',
    nameKo: '꽃향기/플로럴',
    nameEn: 'Floral',
    icon: '🌺',
    color: 'pink',
    level2Items: {
      black_tea: {
        id: 'black_tea',
        nameKo: '홍차',
        nameEn: 'Black Tea',
        level3Items: [
          { id: 'black_tea', nameKo: '홍차', nameEn: 'Black Tea', description: '은은하고 떫은 찻잎향' }
        ]
      },
      floral: {
        id: 'floral',
        nameKo: '꽃향기',
        nameEn: 'Floral',
        level3Items: [
          { id: 'chamomile', nameKo: '카모마일', nameEn: 'Chamomile', description: '부드럽고 편안한 꽃' },
          { id: 'rose', nameKo: '장미', nameEn: 'Rose', description: '우아하고 달콤한 꽃' },
          { id: 'jasmine', nameKo: '자스민', nameEn: 'Jasmine', description: '향긋하고 은은한 흰 꽃' }
        ]
      }
    }
  }
}

// 향미 선택 인터페이스 (기획 문서 기준)
interface FlavorChoice {
  level2: string  // Level 2 ID (필수)
  level3?: string[]  // Level 3 IDs (선택적)
}

interface FlavorSelection {
  selectedFlavors: FlavorChoice[]
  timestamp: Date
  selectionDuration: number
}

export default function CafeStep2Page() {
  const router = useRouter()
  
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null)
  const [cafeData, setCafeData] = useState<CafeData | null>(null)
  const [flavorSelections, setFlavorSelections] = useState<{[key: string]: any}>({})
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({})
  const [startTime] = useState(Date.now())

  useEffect(() => {
    // 이전 단계 데이터 불러오기
    const saved1 = sessionStorage.getItem('recordStep1')
    const savedCafe = sessionStorage.getItem('cafeStep1')
    
    if (saved1) {
      const data1 = JSON.parse(saved1)
      setStep1Data(data1)
      
      if (data1.mode !== 'cafe') {
        router.push('/mode-selection')
        return
      }
    } else {
      router.push('/mode-selection')
      return
    }
    
    if (savedCafe) {
      setCafeData(JSON.parse(savedCafe))
    } else {
      router.push('/record/cafe/step1')
      return
    }
  }, [router])

  // Level 2 선택/해제 로직 (기획 문서 기준)
  const handleLevel2Toggle = (categoryId: string, level2Id: string) => {
    const key = `${categoryId}-${level2Id}`
    
    setFlavorSelections(prev => {
      const current = prev[key] || { level2Selected: false, level3Selected: [] }
      const hasLevel3 = current.level3Selected.length > 0
      
      if (hasLevel3) {
        // Level 3가 선택된 경우: 모두 해제
        const newState = { ...prev }
        delete newState[key]
        return newState
      } else {
        // Level 3가 없는 경우: Level 2 토글
        return {
          ...prev,
          [key]: {
            ...current,
            level2Selected: !current.level2Selected,
            level3Selected: []
          }
        }
      }
    })
  }

  // Level 3 선택/해제 로직 (기획 문서 기준)
  const handleLevel3Toggle = (categoryId: string, level2Id: string, level3Id: string) => {
    const key = `${categoryId}-${level2Id}`
    
    setFlavorSelections(prev => {
      const current = prev[key] || { level2Selected: false, level3Selected: [] }
      const level3Selected = [...current.level3Selected]
      
      if (level3Selected.includes(level3Id)) {
        // Level 3 해제
        const newLevel3 = level3Selected.filter(id => id !== level3Id)
        
        if (newLevel3.length === 0) {
          // 모든 Level 3가 해제되면 Level 2도 해제
          const newState = { ...prev }
          delete newState[key]
          return newState
        } else {
          return {
            ...prev,
            [key]: {
              level2Selected: false, // Level 3가 있으면 Level 2는 비활성화
              level3Selected: newLevel3
            }
          }
        }
      } else {
        // Level 3 선택
        return {
          ...prev,
          [key]: {
            level2Selected: false, // Level 3가 있으면 Level 2는 비활성화
            level3Selected: [...level3Selected, level3Id]
          }
        }
      }
    })
  }

  // 카테고리 확장/축소
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  // 선택된 향미 표시용 함수
  const getSelectedFlavorsDisplay = () => {
    const selected: string[] = []
    
    Object.entries(flavorSelections).forEach(([key, selection]) => {
      const [categoryId, level2Id] = key.split('-')
      const category = SCA_FLAVOR_WHEEL[categoryId as keyof typeof SCA_FLAVOR_WHEEL]
      if (!category) return
      
      const level2Item = category.level2Items[level2Id as keyof typeof category.level2Items]
      if (!level2Item) return
      
      if (selection.level3Selected.length > 0) {
        // Level 3가 선택된 경우
        selection.level3Selected.forEach((level3Id: string) => {
          const level3Item = level2Item.level3Items?.find(item => item.id === level3Id)
          if (level3Item) {
            selected.push(level3Item.nameKo)
          }
        })
      } else if (selection.level2Selected) {
        // Level 2만 선택된 경우
        selected.push(level2Item.nameKo)
      }
    })
    
    return selected
  }

  // 저장용 데이터 구조 생성
  const getFlavorChoices = (): FlavorChoice[] => {
    const choices: FlavorChoice[] = []
    
    Object.entries(flavorSelections).forEach(([key, selection]) => {
      const [categoryId, level2Id] = key.split('-')
      
      if (selection.level3Selected.length > 0) {
        // Level 3가 선택된 경우
        choices.push({
          level2: level2Id,
          level3: selection.level3Selected
        })
      } else if (selection.level2Selected) {
        // Level 2만 선택된 경우
        choices.push({
          level2: level2Id
        })
      }
    })
    
    return choices
  }

  const handleNext = () => {
    const selectedFlavors = getFlavorChoices()
    
    // 기획 문서의 출력 데이터 구조
    const flavorSelection: FlavorSelection = {
      selectedFlavors,
      timestamp: new Date(),
      selectionDuration: Math.round((Date.now() - startTime) / 1000)
    }
    
    sessionStorage.setItem('cafeStep2', JSON.stringify(flavorSelection))
    router.push('/record/cafe/step3')
  }

  const handleBack = () => {
    router.push('/record/cafe/step1')
  }

  if (!step1Data || !cafeData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-blue-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        <Navigation showBackButton currentPage="record" />

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-800">향미 선택</h1>
            <div className="text-sm text-blue-600">2 / 4</div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-blue-200 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: '50%' }}
            ></div>
          </div>

          {/* 커피 정보 표시 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                ☕ 카페 모드
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium text-blue-800">{cafeData.coffee_name}</p>
              <p className="text-sm text-blue-600">{cafeData.cafe_name}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* 기획 문서의 헤더 구조 */}
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-blue-800 mb-2">어떤 향미가 느껴지나요?</h2>
            <p className="text-blue-600 mb-4">원하는 만큼 자유롭게 선택해주세요</p>
            
            {/* 기획 문서의 선택 카운터 (제한 없음) */}
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-4">
              <span className="text-sm font-medium text-blue-600">
                {getSelectedFlavorsDisplay().length}개 선택됨
              </span>
            </div>
          </div>

          {/* 카페 & 커피 정보 요약 (개선된 레이아웃) */}
          <div className="bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 py-4 border-b border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                <Coffee className="h-5 w-5 mr-2" />
                현재 기록 중인 커피
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* 주요 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">카페</p>
                    <p className="font-semibold text-gray-800">{cafeData.cafe_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-100 rounded-full">
                    <Coffee className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">로스터리</p>
                    <p className="font-semibold text-gray-800">{cafeData.roastery}</p>
                  </div>
                </div>
              </div>
              
              {/* 커피 상세 정보 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Thermometer className={`h-4 w-4 ${cafeData.temperature === 'hot' ? 'text-orange-500' : 'text-blue-500'}`} />
                  </div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">온도</p>
                  <p className="font-medium text-gray-800 capitalize">{cafeData.temperature}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-2">💰</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">가격</p>
                  <p className="font-medium text-gray-800">{cafeData.price || '-'}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-2">🌍</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">원산지</p>
                  <p className="font-medium text-gray-800 text-xs">{cafeData.origin || '-'}</p>
                </div>
                <div className="text-center">
                  <div className="text-lg mb-2">🔥</div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">로스팅</p>
                  <p className="font-medium text-gray-800 text-xs">{cafeData.roast_level || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* SCA Flavor Wheel 9개 대분류 구조 (Level 2/3 계층) */}
          <div className="space-y-4">
            {Object.entries(SCA_FLAVOR_WHEEL).map(([categoryId, category]) => {
              const isExpanded = expandedCategories[categoryId]
              const colorConfig = {
                red: {
                  bgColor: 'bg-red-50',
                  borderColor: 'border-red-100',
                  headerBg: 'from-red-50 to-red-100',
                  textColor: 'text-red-800',
                  buttonColor: 'border-red-500 bg-red-50 text-red-800'
                },
                yellow: {
                  bgColor: 'bg-yellow-50',
                  borderColor: 'border-yellow-100',
                  headerBg: 'from-yellow-50 to-yellow-100',
                  textColor: 'text-yellow-800',
                  buttonColor: 'border-yellow-500 bg-yellow-50 text-yellow-800'
                },
                green: {
                  bgColor: 'bg-green-50',
                  borderColor: 'border-green-100',
                  headerBg: 'from-green-50 to-green-100',
                  textColor: 'text-green-800',
                  buttonColor: 'border-green-500 bg-green-50 text-green-800'
                },
                gray: {
                  bgColor: 'bg-gray-50',
                  borderColor: 'border-gray-100',
                  headerBg: 'from-gray-50 to-gray-100',
                  textColor: 'text-gray-800',
                  buttonColor: 'border-gray-500 bg-gray-50 text-gray-800'
                },
                orange: {
                  bgColor: 'bg-orange-50',
                  borderColor: 'border-orange-100',
                  headerBg: 'from-orange-50 to-orange-100',
                  textColor: 'text-orange-800',
                  buttonColor: 'border-orange-500 bg-orange-50 text-orange-800'
                },
                amber: {
                  bgColor: 'bg-amber-50',
                  borderColor: 'border-amber-100',
                  headerBg: 'from-amber-50 to-amber-100',
                  textColor: 'text-amber-800',
                  buttonColor: 'border-amber-500 bg-amber-50 text-amber-800'
                },
                pink: {
                  bgColor: 'bg-pink-50',
                  borderColor: 'border-pink-100',
                  headerBg: 'from-pink-50 to-pink-100',
                  textColor: 'text-pink-800',
                  buttonColor: 'border-pink-500 bg-pink-50 text-pink-800'
                }
              }
              
              const config = colorConfig[category.color as keyof typeof colorConfig] || colorConfig.gray
              
              // 카테고리별 선택 개수 계산
              let selectedCount = 0
              Object.entries(category.level2Items).forEach(([level2Id, level2Item]) => {
                const key = `${categoryId}-${level2Id}`
                const selection = flavorSelections[key]
                if (selection) {
                  if (selection.level3Selected.length > 0) {
                    selectedCount += selection.level3Selected.length
                  } else if (selection.level2Selected) {
                    selectedCount += 1
                  }
                }
              })
              
              return (
                <div key={categoryId} className={`bg-white rounded-2xl shadow-sm border ${config.borderColor} overflow-hidden`}>
                  {/* 카테고리 헤더 */}
                  <button
                    onClick={() => toggleCategory(categoryId)}
                    className={`w-full bg-gradient-to-r ${config.headerBg} px-6 py-4 border-b ${config.borderColor} hover:opacity-90 transition-opacity`}
                  >
                    <div className="flex items-center justify-between">
                      <h3 className={`text-lg font-semibold ${config.textColor} flex items-center`}>
                        <span className="text-2xl mr-3">{category.icon}</span>
                        {category.nameKo}
                      </h3>
                      <div className="flex items-center space-x-3">
                        {selectedCount > 0 && (
                          <div className={`px-3 py-1 ${config.bgColor} ${config.textColor} rounded-full text-sm font-medium`}>
                            {selectedCount}개 선택
                          </div>
                        )}
                        <ArrowRight className={`h-5 w-5 ${config.textColor} transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </div>
                    </div>
                  </button>
                  
                  {/* Level 2 항목들 */}
                  {isExpanded && (
                    <div className="p-6 space-y-4">
                      {Object.entries(category.level2Items).map(([level2Id, level2Item]) => {
                        const key = `${categoryId}-${level2Id}`
                        const selection = flavorSelections[key] || { level2Selected: false, level3Selected: [] }
                        const hasLevel3Selected = selection.level3Selected.length > 0
                        const isLevel2Selected = selection.level2Selected
                        const isLevel2Disabled = hasLevel3Selected
                        
                        return (
                          <div key={level2Id} className="border border-gray-200 rounded-xl overflow-hidden">
                            {/* Level 2 버튼 */}
                            <button
                              onClick={() => handleLevel2Toggle(categoryId, level2Id)}
                              disabled={isLevel2Disabled}
                              className={`w-full p-4 text-left transition-all ${
                                isLevel2Selected || hasLevel3Selected
                                  ? hasLevel3Selected
                                    ? `${config.buttonColor} opacity-60` // Level 3가 있으면 회색으로
                                    : config.buttonColor
                                  : 'border-gray-200 hover:border-blue-300 text-gray-700 hover:bg-blue-50'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                  <div className={`w-5 h-5 border-2 rounded mr-3 flex items-center justify-center ${
                                    isLevel2Selected || hasLevel3Selected
                                      ? hasLevel3Selected
                                        ? 'border-gray-400 bg-gray-100'
                                        : 'border-blue-500 bg-blue-500'
                                      : 'border-gray-300'
                                  }`}>
                                    {(isLevel2Selected || hasLevel3Selected) && (
                                      <Check className={`h-3 w-3 ${hasLevel3Selected ? 'text-gray-600' : 'text-white'}`} />
                                    )}
                                  </div>
                                  <span className="font-medium">{level2Item.nameKo}</span>
                                </div>
                                {hasLevel3Selected && (
                                  <span className="text-sm text-gray-500">
                                    {selection.level3Selected.length}개 구체화됨
                                  </span>
                                )}
                              </div>
                            </button>
                            
                            {/* Level 3 항목들 (Level 2 선택 시 또는 Level 3가 선택된 경우 표시) */}
                            {(isLevel2Selected || hasLevel3Selected) && level2Item.level3Items && (
                              <div className="bg-gray-50 p-4 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-3">구체적으로 선택 (선택사항):</p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {level2Item.level3Items.map((level3Item) => {
                                    const isLevel3Selected = selection.level3Selected.includes(level3Item.id)
                                    
                                    return (
                                      <button
                                        key={level3Item.id}
                                        onClick={() => handleLevel3Toggle(categoryId, level2Id, level3Item.id)}
                                        className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                                          isLevel3Selected
                                            ? 'border-blue-500 bg-blue-50 text-blue-800'
                                            : 'border-gray-200 hover:border-blue-300 text-gray-600 hover:bg-blue-50'
                                        }`}
                                        title={level3Item.description}
                                      >
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{level3Item.nameKo}</span>
                                          {isLevel3Selected && (
                                            <Check className="h-3 w-3 ml-1 flex-shrink-0 text-blue-600" />
                                          )}
                                        </div>
                                      </button>
                                    )
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* 선택된 향미 프리뷰 (기획 문서 기준 - 제한 없음) */}
          {getSelectedFlavorsDisplay().length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-blue-800 flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    선택된 향미
                  </h4>
                  <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                    {getSelectedFlavorsDisplay().length}개
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-3">
                  {getSelectedFlavorsDisplay().map((flavorName, index) => (
                    <div
                      key={`${flavorName}-${index}`}
                      className="px-4 py-2 rounded-full text-sm font-medium border-2 bg-blue-100 text-blue-800 border-blue-200 animate-in fade-in duration-300"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <span>{flavorName}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 flex items-center">
                    <span className="mr-2">💡</span>
                    <strong>Tip:</strong> Level 2에서 기본 선택하고, 더 구체적으로 표현하고 싶을 때만 Level 3를 선택하세요.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 하단 버튼 (기획 문서 기준 - 제한 없음) */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-4 px-6 border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all text-lg font-medium flex items-center justify-center text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            이전
          </button>
          <button
            onClick={handleNext}
            className="flex-2 py-4 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-lg font-medium flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 (개선된 스타일) */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <div className="flex items-center space-x-2 text-sm text-blue-600">
              <span>다음 단계:</span>
              <span className="font-medium">한국어 감각 표현 (최대 18개)</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {/* 초보자 가이드 */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
            <h5 className="text-sm font-semibold text-green-800 mb-2">💡 처음이라면 이렇게 시작하세요</h5>
            <ul className="text-xs text-green-700 space-y-1 text-left">
              <li>• 가장 강하게 느껴지는 향 2-3개만 선택</li>
              <li>• 잘 모르겠다면 "과일향", "견과류", "단맛" 중에서 선택</li>
              <li>• 정답은 없어요! 본인이 느낀 그대로 선택하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}