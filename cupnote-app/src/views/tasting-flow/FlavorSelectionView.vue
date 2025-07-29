<template>
  <div class="flavor-selection-view">
    <!-- Header -->
    <header class="flavor-header">
      <h1 class="flavor-title">
        🍓 어떤 향미가 느껴지나요?
      </h1>
      <p class="flavor-subtitle">
        커피에서 느낀 주요 향미를 선택해주세요
      </p>
    </header>

    <!-- Search Bar -->
    <section class="search-section">
      <div class="search-input-container">
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="🔍 향미 검색... (예: 딸기, 초콜릿)"
        />
        <button
          v-if="searchQuery"
          @click="clearSearch"
          class="clear-search-btn"
        >
          ✕
        </button>
      </div>
    </section>

    <!-- Popular Flavors -->
    <section v-if="!searchQuery" class="popular-section">
      <h3 class="section-title">⭐ 자주 선택되는 향미</h3>
      <div class="popular-flavors">
        <button
          v-for="popular in popularFlavors"
          :key="popular.id"
          :class="['popular-btn', { selected: isFlavorSelected(popular) }]"
          @click="toggleFlavor(popular)"
        >
          {{ popular.name }}
        </button>
      </div>
    </section>

    <!-- Flavor Categories -->
    <section class="categories-section">
      <div v-if="searchQuery" class="search-results">
        <h3 class="section-title">🔍 검색 결과</h3>
        <div v-if="searchResults.length === 0" class="no-results">
          검색 결과가 없습니다
        </div>
        <div v-else class="search-results-list">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="search-result-item"
          >
            <label class="flavor-checkbox">
              <input
                type="checkbox"
                :checked="isFlavorSelected(result)"
                @change="toggleFlavor(result)"
              />
              <span class="checkbox-custom"></span>
              <span class="flavor-name">{{ result.name }}</span>
              <span class="flavor-category">{{ result.categoryName }}</span>
            </label>
          </div>
        </div>
      </div>

      <div v-else class="flavor-categories">
        <div
          v-for="category in flavorCategories"
          :key="category.id"
          class="flavor-category"
        >
          <button
            class="category-header"
            @click="toggleCategory(category.id)"
          >
            <span class="category-icon">{{ category.icon }}</span>
            <span class="category-name">{{ category.name }}</span>
            <span class="category-count">({{ getSelectedCountInCategory(category) }})</span>
            <span class="expand-icon">{{ expandedCategories.includes(category.id) ? '▼' : '▶' }}</span>
          </button>

          <div
            v-show="expandedCategories.includes(category.id)"
            class="category-content"
          >
            <div
              v-for="level2 in category.level2Items"
              :key="level2.id"
              class="level2-group"
            >
              <div class="level2-header">
                <label class="flavor-checkbox level2-checkbox">
                  <input
                    type="checkbox"
                    :checked="isLevel2Selected(level2)"
                    :disabled="hasSelectedLevel3(level2)"
                    @change="toggleLevel2(level2)"
                  />
                  <span :class="['checkbox-custom', { disabled: hasSelectedLevel3(level2) }]"></span>
                  <span :class="['flavor-name', { disabled: hasSelectedLevel3(level2) }]">
                    {{ level2.name }}
                  </span>
                </label>
                <button
                  v-if="level2.level3Items && level2.level3Items.length > 0"
                  type="button"
                  class="expand-level3-btn"
                  @click="toggleLevel3Section(level2.id)"
                >
                  {{ expandedLevel3.includes(level2.id) ? '▲' : '▼' }}
                </button>
              </div>

              <!-- Level 3 Items -->
              <div
                v-if="level2.level3Items && level2.level3Items.length > 0"
                v-show="expandedLevel3.includes(level2.id)"
                class="level3-section"
              >
                <div class="level3-items">
                  <label
                    v-for="level3 in level2.level3Items"
                    :key="level3.id"
                    class="flavor-checkbox level3-checkbox"
                  >
                    <input
                      type="checkbox"
                      :checked="isLevel3Selected(level3)"
                      @change="toggleLevel3(level3, level2)"
                    />
                    <span class="checkbox-custom small"></span>
                    <span class="flavor-name">{{ level3.name }}</span>
                    <span v-if="level3.description" class="flavor-description">
                      {{ level3.description }}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Selected Flavors Summary -->
    <section class="selected-section">
      <div class="selected-header">
        <h3 class="selected-title">선택한 향미 ({{ selectedFlavors.length }}개)</h3>
        <button
          v-if="selectedFlavors.length > 0"
          @click="clearAllSelections"
          class="clear-all-btn"
        >
          모두 지우기
        </button>
      </div>
      <div class="selected-flavors">
        <div
          v-for="flavor in selectedFlavors"
          :key="flavor.id"
          class="selected-flavor-tag"
        >
          <span class="selected-flavor-name">{{ flavor.name }}</span>
          <button
            @click="removeFlavor(flavor)"
            class="remove-flavor-btn"
          >
            ✕
          </button>
        </div>
        <div v-if="selectedFlavors.length === 0" class="no-selection">
          아직 선택한 향미가 없습니다
        </div>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <div class="help-card">
        <h4 class="help-title">💡 처음이라면 이렇게 시작해보세요</h4>
        <ul class="help-list">
          <li>가장 강하게 느껴지는 향 2-3개만 선택</li>
          <li>잘 모르겠다면 "초콜릿", "견과류", "과일향" 중에서 선택</li>
          <li>정답은 없어요! 본인이 느낀 그대로 선택하세요</li>
        </ul>
      </div>
    </section>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <button type="button" class="btn-secondary" @click="$router.go(-1)">
        이전
      </button>
      <button
        type="button"
        class="btn-primary"
        :disabled="selectedFlavors.length === 0"
        @click="handleNext"
      >
        다음 단계 ({{ selectedFlavors.length }})
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCoffeeRecordStore } from '../../stores/coffeeRecord'

const router = useRouter()
const coffeeRecordStore = useCoffeeRecordStore()

// State
const searchQuery = ref('')
const expandedCategories = ref(['fruity']) // 과일향은 기본 열림
const expandedLevel3 = ref([])
const selectedFlavorIds = ref([])

// Search
const searchResults = computed(() => {
  if (!searchQuery.value.trim()) return []
  
  const query = searchQuery.value.toLowerCase()
  const results = []
  
  flavorCategories.value.forEach(category => {
    category.level2Items.forEach(level2 => {
      // Level 2 검색
      if (level2.name.toLowerCase().includes(query)) {
        results.push({
          id: level2.id,
          name: level2.name,
          type: 'level2',
          categoryName: category.name,
          parentLevel2: null
        })
      }
      
      // Level 3 검색
      if (level2.level3Items) {
        level2.level3Items.forEach(level3 => {
          if (level3.name.toLowerCase().includes(query)) {
            results.push({
              id: level3.id,
              name: level3.name,
              type: 'level3',
              categoryName: category.name,
              parentLevel2: level2
            })
          }
        })
      }
    })
  })
  
  return results
})

// SCA Flavor Wheel 85개 향미 완전 데이터
const flavorCategories = ref([
  {
    id: 'fruity',
    name: '과일향/프루티',
    icon: '🍓',
    level2Items: [
      {
        id: 'berry',
        name: '베리류',
        level3Items: [
          { id: 'blackberry', name: '블랙베리', description: '진하고 달콤한 검은 베리' },
          { id: 'raspberry', name: '라즈베리', description: '새콤달콤한 붉은 베리' },
          { id: 'blueberry', name: '블루베리', description: '달콤하고 과즙이 많은 베리' },
          { id: 'strawberry', name: '딸기', description: '상큼하고 달콤한 붉은 베리' }
        ]
      },
      {
        id: 'dried-fruit',
        name: '건조 과일',
        level3Items: [
          { id: 'raisin', name: '건포도', description: '달콤하고 진한 건조 포도' },
          { id: 'prune', name: '자두', description: '단단하고 깊은 맛의 건조 자두' },
          { id: 'fig', name: '무화과', description: '부드럽고 꿀 같은 건조 과일' },
          { id: 'date', name: '대추야자', description: '끈적하고 달콤한 열매' }
        ]
      },
      {
        id: 'citrus',
        name: '시트러스',
        level3Items: [
          { id: 'grapefruit', name: '자몽', description: '쌉싸름하고 상큼한 과일' },
          { id: 'orange', name: '오렌지', description: '달콤하고 상큼한 오렌지' },
          { id: 'lemon', name: '레몬', description: '밝고 시큼한 노란 과일' },
          { id: 'lime', name: '라임', description: '시큼하고 청량한 과일' }
        ]
      },
      {
        id: 'other-fruit',
        name: '기타 과일',
        level3Items: [
          { id: 'coconut', name: '코코넛', description: '고소하고 달콤한 열대 과일' },
          { id: 'cherry', name: '체리', description: '새콤달콤한 빨간 과일' },
          { id: 'apple', name: '사과', description: '상큼하고 깔끔한 과일' },
          { id: 'peach', name: '복숭아', description: '부드럽고 달콤한 과일' },
          { id: 'pear', name: '배', description: '시원하고 달콤한 과일' },
          { id: 'grape', name: '포도', description: '달콤하고 과즙이 풍부한 과일' },
          { id: 'pineapple', name: '파인애플', description: '달콤하고 상큼한 열대 과일' }
        ]
      }
    ]
  },
  {
    id: 'sweet',
    name: '단맛',
    icon: '🍯',
    level2Items: [
      {
        id: 'caramel',
        name: '캐러멜향',
        level3Items: [
          { id: 'molasses', name: '당밀', description: '진하고 끈적한 단맛' },
          { id: 'maple-syrup', name: '메이플시럽', description: '고소하고 달콤한 시럽' },
          { id: 'caramel', name: '캐러멜', description: '구운 설탕의 달콤함' },
          { id: 'honey', name: '꿀', description: '부드럽고 자연스러운 단맛' }
        ]
      },
      {
        id: 'vanilla',
        name: '바닐라',
        level3Items: [
          { id: 'vanilla', name: '바닐라', description: '부드럽고 크리미한 향신료' }
        ]
      },
      {
        id: 'overall-sweet',
        name: '전반적 단맛',
        level3Items: [
          { id: 'brown-sugar', name: '흑설탕', description: '깊고 복합적인 단맛' },
          { id: 'raw-sugar', name: '원당', description: '자연스럽고 깔끔한 단맛' }
        ]
      }
    ]
  },
  {
    id: 'nutty-cocoa',
    name: '견과류/초콜릿',
    icon: '🥜',
    level2Items: [
      {
        id: 'nuts',
        name: '견과류',
        level3Items: [
          { id: 'almond', name: '아몬드', description: '고소하고 부드러운 견과' },
          { id: 'hazelnut', name: '헤이즐넛', description: '진하고 버터리한 견과' },
          { id: 'peanut', name: '땅콩', description: '구수하고 친숙한 견과' },
          { id: 'walnut', name: '호두', description: '쌉싸름하고 기름진 견과' },
          { id: 'pecan', name: '피칸', description: '부드럽고 달콤한 견과' }
        ]
      },
      {
        id: 'chocolate',
        name: '초콜릿향',
        level3Items: [
          { id: 'dark-chocolate', name: '다크 초콜릿', description: '진하고 쌉싸름한 초콜릿' },
          { id: 'milk-chocolate', name: '밀크 초콜릿', description: '부드럽고 달콤한 초콜릿' }
        ]
      },
      {
        id: 'cocoa',
        name: '코코아',
        level3Items: [
          { id: 'cocoa-powder', name: '코코아 파우더', description: '건조하고 쌉싸름한 코코아' }
        ]
      }
    ]
  },
  {
    id: 'spices',
    name: '향신료',
    icon: '🌶️',
    level2Items: [
      {
        id: 'pungent',
        name: '자극적인 향신료',
        level3Items: [
          { id: 'pepper', name: '후추', description: '날카롭고 자극적인 향신료' },
          { id: 'chili', name: '고추', description: '매콤하고 뜨거운 향신료' }
        ]
      },
      {
        id: 'warm-spices',
        name: '따뜻한 향신료',
        level3Items: [
          { id: 'cinnamon', name: '계피', description: '따뜻하고 달콤한 향신료' },
          { id: 'nutmeg', name: '육두구', description: '진하고 향긋한 향신료' },
          { id: 'clove', name: '정향', description: '강하고 향긋한 향신료' },
          { id: 'cardamom', name: '카다몬', description: '상큼하고 향긋한 향신료' },
          { id: 'ginger', name: '생강', description: '자극적이고 따뜻한 향신료' }
        ]
      }
    ]
  },
  {
    id: 'roasted',
    name: '로스팅 향',
    icon: '🔥',
    level2Items: [
      {
        id: 'cereal',
        name: '곡물향',
        level3Items: [
          { id: 'wheat', name: '밀', description: '고소하고 담백한 곡물' },
          { id: 'toast', name: '토스트', description: '구운 빵의 고소한 향' },
          { id: 'biscuit', name: '비스킷', description: '바삭하고 고소한 과자' },
          { id: 'graham', name: '그레이엄', description: '통밀의 구수한 향' }
        ]
      },
      {
        id: 'burnt',
        name: '탄 향',
        level3Items: [
          { id: 'burnt-sugar', name: '탄 설탕', description: '쌉싸름한 캐러멜 향' },
          { id: 'charcoal', name: '숯', description: '스모키하고 건조한 향' }
        ]
      },
      {
        id: 'tobacco',
        name: '담배향',
        level3Items: [
          { id: 'tobacco', name: '담배', description: '깊고 스모키한 향' }
        ]
      },
      {
        id: 'pipe-tobacco',
        name: '파이프 담배',
        level3Items: [
          { id: 'pipe-tobacco', name: '파이프 담배', description: '달콤하고 향긋한 담배' }
        ]
      }
    ]
  },
  {
    id: 'vegetative',
    name: '식물성',
    icon: '🌿',
    level2Items: [
      {
        id: 'olive-oil',
        name: '올리브 오일',
        level3Items: [
          { id: 'olive-oil', name: '올리브 오일', description: '부드럽고 기름진 식물성 오일' }
        ]
      },
      {
        id: 'raw',
        name: '날것의',
        level3Items: [
          { id: 'green-vegetable', name: '녹색 채소', description: '신선하고 풀냄새 나는' },
          { id: 'under-ripe', name: '덜 익은', description: '생생하고 풋내 나는' }
        ]
      },
      {
        id: 'hay-like',
        name: '건초 같은',
        level3Items: [
          { id: 'hay', name: '건초', description: '건조하고 풀 냄새 나는' },
          { id: 'herb-like', name: '허브 같은', description: '향긋하고 약초 향의' }
        ]
      },
      {
        id: 'fresh',
        name: '신선한',
        level3Items: [
          { id: 'fresh-herb', name: '신선한 허브', description: '생생하고 상쾌한 허브' }
        ]
      }
    ]
  },
  {
    id: 'other',
    name: '기타',
    icon: '🔗',
    level2Items: [
      {
        id: 'paper-musty',
        name: '종이/곰팡이 냄새',
        level3Items: [
          { id: 'stale', name: '쿰쿰한', description: '오래되고 탁한 냄새' },
          { id: 'cardboard', name: '골판지', description: '건조하고 먼지 같은' },
          { id: 'papery', name: '종이', description: '건조하고 평면적인' },
          { id: 'woody', name: '나무', description: '목재 같은 건조한 향' },
          { id: 'moldy', name: '곰팡이', description: '습하고 썩은 냄새' },
          { id: 'musty', name: '눅눅한', description: '습기 있고 곰팡이 냄새' }
        ]
      },
      {
        id: 'chemical',
        name: '화학적',
        level3Items: [
          { id: 'petroleum', name: '석유', description: '화학적이고 자극적인' },
          { id: 'medicinal', name: '약품', description: '의약품 같은 화학 냄새' },
          { id: 'skunky', name: '스컹크', description: '불쾌하고 자극적인' }
        ]
      }
    ]
  },
  {
    id: 'sour',
    name: '신맛',
    icon: '🍋',
    level2Items: [
      {
        id: 'sour',
        name: '신맛',
        level3Items: [
          { id: 'sour', name: '신맛', description: '자극적이고 신 맛' },
          { id: 'vinegar', name: '식초', description: '강하고 찌르는 신맛' }
        ]
      },
      {
        id: 'alcohol-fermented',
        name: '알코올/발효',
        level3Items: [
          { id: 'winey', name: '와인 같은', description: '발효된 포도주 향' },
          { id: 'whiskey', name: '위스키', description: '강한 알코올 향' },
          { id: 'fermented', name: '발효된', description: '숙성되고 복합적인' },
          { id: 'overripe', name: '과숙된', description: '너무 익어서 발효된' }
        ]
      }
    ]
  },
  {
    id: 'green',
    name: '그린/허브',
    icon: '🌱',
    level2Items: [
      {
        id: 'olive-oil',
        name: '올리브 오일',
        level3Items: [
          { id: 'olive-oil', name: '올리브 오일', description: '부드럽고 기름진 식물성 오일' }
        ]
      },
      {
        id: 'raw',
        name: '날것의',
        level3Items: [
          { id: 'green-vegetable', name: '녹색 채소', description: '신선하고 풀냄새 나는' },
          { id: 'under-ripe', name: '덜 익은', description: '생생하고 풋내 나는' }
        ]
      },
      {
        id: 'hay-like',
        name: '건초 같은',
        level3Items: [
          { id: 'hay', name: '건초', description: '건조하고 풀 냄새 나는' },
          { id: 'herb-like', name: '허브 같은', description: '향긋하고 약초 향의' }
        ]
      }
    ]
  }
])

// Popular flavors (자주 선택되는 향미)
const popularFlavors = ref([
  { id: 'chocolate', name: '초콜릿' },
  { id: 'berry', name: '베리류' },
  { id: 'caramel', name: '캐러멜' },
  { id: 'nuts', name: '견과류' },
  { id: 'citrus', name: '시트러스' },
  { id: 'floral', name: '꽃향기' }
])

// Computed
const selectedFlavors = computed(() => {
  const selected = []
  
  // Helper function to find flavor by ID
  const findFlavorById = (id) => {
    for (const category of flavorCategories.value) {
      for (const level2 of category.level2Items) {
        if (level2.id === id) {
          return { ...level2, type: 'level2', categoryName: category.name }
        }
        if (level2.level3Items) {
          for (const level3 of level2.level3Items) {
            if (level3.id === id) {
              return { ...level3, type: 'level3', categoryName: category.name, parentLevel2: level2 }
            }
          }
        }
      }
    }
    return null
  }
  
  selectedFlavorIds.value.forEach(id => {
    const flavor = findFlavorById(id)
    if (flavor) {
      selected.push(flavor)
    }
  })
  
  return selected
})

// Methods
const clearSearch = () => {
  searchQuery.value = ''
}

const toggleCategory = (categoryId) => {
  const index = expandedCategories.value.indexOf(categoryId)
  if (index === -1) {
    expandedCategories.value.push(categoryId)
  } else {
    expandedCategories.value.splice(index, 1)
  }
}

const toggleLevel3Section = (level2Id) => {
  const index = expandedLevel3.value.indexOf(level2Id)
  if (index === -1) {
    expandedLevel3.value.push(level2Id)
  } else {
    expandedLevel3.value.splice(index, 1)
  }
}

const isFlavorSelected = (flavor) => {
  return selectedFlavorIds.value.includes(flavor.id)
}

const isLevel2Selected = (level2) => {
  return selectedFlavorIds.value.includes(level2.id)
}

const isLevel3Selected = (level3) => {
  return selectedFlavorIds.value.includes(level3.id)
}

const hasSelectedLevel3 = (level2) => {
  if (!level2.level3Items) return false
  return level2.level3Items.some(level3 => selectedFlavorIds.value.includes(level3.id))
}

const toggleLevel2 = (level2) => {
  const isSelected = selectedFlavorIds.value.includes(level2.id)
  
  if (isSelected) {
    // Level 2 해제: 해당 Level 2와 모든 Level 3 해제
    const index = selectedFlavorIds.value.indexOf(level2.id)
    selectedFlavorIds.value.splice(index, 1)
    
    // Level 3도 모두 해제
    if (level2.level3Items) {
      level2.level3Items.forEach(level3 => {
        const level3Index = selectedFlavorIds.value.indexOf(level3.id)
        if (level3Index !== -1) {
          selectedFlavorIds.value.splice(level3Index, 1)
        }
      })
    }
  } else {
    // Level 2 선택
    selectedFlavorIds.value.push(level2.id)
    
    // Level 3 섹션 자동 열기
    if (level2.level3Items && level2.level3Items.length > 0) {
      if (!expandedLevel3.value.includes(level2.id)) {
        expandedLevel3.value.push(level2.id)
      }
    }
  }
}

const toggleFlavor = (flavor) => {
  const isSelected = selectedFlavorIds.value.includes(flavor.id)
  
  if (isSelected) {
    const index = selectedFlavorIds.value.indexOf(flavor.id)
    selectedFlavorIds.value.splice(index, 1)
  } else {
    selectedFlavorIds.value.push(flavor.id)
  }
}

const toggleLevel3 = (level3, parentLevel2) => {
  const wasSelected = selectedFlavorIds.value.includes(level3.id)
  
  // Level 3를 토글
  toggleFlavor(level3)
  
  // Level 2 상태 업데이트
  const hasAnyLevel3Selected = parentLevel2.level3Items.some(l3 => 
    selectedFlavorIds.value.includes(l3.id)
  )
  
  const level2Index = selectedFlavorIds.value.indexOf(parentLevel2.id)
  
  if (hasAnyLevel3Selected) {
    // Level 3가 하나라도 선택된 경우: Level 2를 선택 상태로 만들되 비활성화
    if (level2Index === -1) {
      selectedFlavorIds.value.push(parentLevel2.id)
    }
  } else {
    // Level 3가 모두 해제된 경우: Level 2도 해제
    if (level2Index !== -1) {
      selectedFlavorIds.value.splice(level2Index, 1)
    }
  }
}

const removeFlavor = (flavor) => {
  toggleFlavor(flavor)
}

const clearAllSelections = () => {
  selectedFlavorIds.value = []
  expandedLevel3.value = []
}

const getSelectedCountInCategory = (category) => {
  let count = 0
  category.level2Items.forEach(level2 => {
    if (selectedFlavorIds.value.includes(level2.id)) {
      count++
    }
    if (level2.level3Items) {
      level2.level3Items.forEach(level3 => {
        if (selectedFlavorIds.value.includes(level3.id)) {
          count++
        }
      })
    }
  })
  return count
}

const handleNext = () => {
  if (selectedFlavors.value.length === 0) return
  
  // Convert selected flavors to simple format for storage
  const simplifiedFlavors = selectedFlavors.value.map(flavor => ({
    id: flavor.id,
    text: flavor.name
  }))
  
  // Save to store
  coffeeRecordStore.updateFlavorSelection(simplifiedFlavors)
  
  console.log('Flavors saved:', simplifiedFlavors)
  
  // Navigate to next step (Sensory Expression)
  router.push('/sensory-expression')
}

// Initialize
onMounted(() => {
  // Auto-expand categories with popular flavors
  const popularCategories = ['fruity', 'sweet', 'nutty-cocoa']
  expandedCategories.value = [...popularCategories]
})
</script>

<style scoped>
.flavor-selection-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  background: linear-gradient(135deg, #FFF8F0 0%, #F5F0E8 100%);
  min-height: 100vh;
}

/* Header */
.flavor-header {
  text-align: center;
  margin-bottom: 2rem;
}

.flavor-title {
  font-size: 2rem;
  font-weight: 700;
  color: #7C5842;
  margin-bottom: 0.5rem;
}

.flavor-subtitle {
  color: #A0796A;
  font-size: 1.1rem;
}

/* Search Section */
.search-section {
  margin-bottom: 2rem;
}

.search-input-container {
  position: relative;
  max-width: 400px;
  margin: 0 auto;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #E8D5C4;
  border-radius: 25px;
  font-size: 1rem;
  background: white;
  transition: border-color 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #7C5842;
  box-shadow: 0 0 0 3px rgba(124, 88, 66, 0.1);
}

.clear-search-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #A0796A;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem;
}

/* Popular Section */
.popular-section {
  margin-bottom: 2rem;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 1rem;
}

.popular-flavors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
}

.popular-btn {
  background: white;
  border: 2px solid #E8D5C4;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.popular-btn:hover {
  border-color: #D4B896;
}

.popular-btn.selected {
  background: #7C5842;
  border-color: #7C5842;
  color: white;
}

/* Categories Section */
.categories-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  margin-bottom: 2rem;
}

.flavor-categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.flavor-category {
  border: 1px solid #F0E8DC;
  border-radius: 12px;
  overflow: hidden;
}

.category-header {
  width: 100%;
  background: #F8F4F0;
  border: none;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  transition: background-color 0.2s ease;
}

.category-header:hover {
  background: #F0E8DC;
}

.category-icon {
  font-size: 1.2rem;
}

.category-name {
  flex: 1;
  text-align: left;
}

.category-count {
  color: #A0796A;
  font-size: 0.9rem;
}

.expand-icon {
  font-size: 0.8rem;
  color: #A0796A;
}

.category-content {
  padding: 1rem;
  background: white;
}

/* Level 2 Groups */
.level2-group {
  margin-bottom: 1rem;
}

.level2-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.level2-checkbox {
  flex: 1;
  font-weight: 500;
  color: #7C5842;
}

.expand-level3-btn {
  background: none;
  border: none;
  color: #7C5842;
  font-size: 0.9rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  margin-left: 0.5rem;
  flex-shrink: 0;
  position: relative;
  z-index: 1;
}

.expand-level3-btn:hover {
  background: rgba(124, 88, 66, 0.1);
  color: #5D3F2E;
}

/* Level 3 Section */
.level3-section {
  margin-top: 0.75rem;
  margin-left: 2rem;
  padding-left: 1rem;
  border-left: 2px solid #F0E8DC;
}

.level3-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.level3-checkbox {
  font-size: 0.9rem;
  color: #666;
}

/* Flavor Checkboxes */
.flavor-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem 0;
  transition: all 0.2s ease;
}

.flavor-checkbox:hover {
  background: rgba(124, 88, 66, 0.05);
  border-radius: 6px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.flavor-checkbox input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #E8D5C4;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.checkbox-custom.small {
  width: 16px;
  height: 16px;
}

.checkbox-custom.disabled {
  background: #F0F0F0;
  border-color: #DDD;
}

.flavor-checkbox input[type="checkbox"]:checked + .checkbox-custom {
  background: #7C5842;
  border-color: #7C5842;
}

.flavor-checkbox input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.flavor-checkbox input[type="checkbox"]:disabled + .checkbox-custom::after {
  color: #999;
}

.flavor-name {
  flex: 1;
  text-align: left;
}

.flavor-name.disabled {
  color: #999;
}

.flavor-category {
  font-size: 0.8rem;
  color: #A0796A;
}

.flavor-description {
  font-size: 0.8rem;
  color: #999;
  font-style: italic;
}

/* Search Results */
.search-results-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.search-result-item {
  padding: 0.75rem;
  background: #F8F4F0;
  border-radius: 8px;
  border: 1px solid #F0E8DC;
}

.no-results {
  text-align: center;
  color: #A0796A;
  padding: 2rem;
  font-style: italic;
}

/* Selected Section */
.selected-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(124, 88, 66, 0.1);
  margin-bottom: 2rem;
}

.selected-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.selected-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #7C5842;
  margin: 0;
}

.clear-all-btn {
  background: none;
  border: 1px solid #E8D5C4;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  color: #A0796A;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-all-btn:hover {
  border-color: #D4B896;
  background: #F8F4F0;
}

.selected-flavors {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.selected-flavor-tag {
  background: linear-gradient(135deg, #7C5842 0%, #A0796A 100%);
  color: white;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.selected-flavor-name {
  font-weight: 500;
}

.remove-flavor-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

.remove-flavor-btn:hover {
  opacity: 1;
}

.no-selection {
  color: #A0796A;
  font-style: italic;
  text-align: center;
  padding: 1rem;
}

/* Help Section */
.help-section {
  margin-bottom: 2rem;
}

.help-card {
  background: #FFF8F0;
  border: 1px solid #F0E8DC;
  border-radius: 12px;
  padding: 1.5rem;
}

.help-title {
  font-size: 1rem;
  font-weight: 600;
  color: #7C5842;
  margin-bottom: 0.75rem;
}

.help-list {
  margin: 0;
  padding-left: 1.5rem;
  color: #666;
}

.help-list li {
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: space-between;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E8D5C4;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
}

.btn-primary {
  background: #7C5842;
  color: white;
  border: 2px solid #7C5842;
}

.btn-primary:hover:not(:disabled) {
  background: #5D3F2E;
  border-color: #5D3F2E;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  background: #CCC;
  border-color: #CCC;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: white;
  color: #7C5842;
  border: 2px solid #E8D5C4;
}

.btn-secondary:hover {
  border-color: #D4B896;
  transform: translateY(-1px);
}

/* Responsive Design */
@media (max-width: 768px) {
  .flavor-selection-view {
    padding: 0.5rem;
  }
  
  .flavor-title {
    font-size: 1.5rem;
  }
  
  .categories-section {
    padding: 1rem;
  }
  
  .level3-section {
    margin-left: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .popular-flavors {
    justify-content: flex-start;
  }
}
</style>