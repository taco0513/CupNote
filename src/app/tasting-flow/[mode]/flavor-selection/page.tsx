'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowRight, ArrowLeft, Palette, Search, X, Info, Check } from 'lucide-react'

import Navigation from '../../../../components/Navigation'
import { isFeatureEnabled } from '../../../../config/feature-flags.config'
import type { TastingSession, TastingMode, FlavorProfile } from '../../../../types/tasting-flow.types'

// SCA Flavor Wheel 데이터 (확장된 85개 향미)
const FLAVOR_CATEGORIES = {
  fruity: {
    name: '과일향',
    color: 'bg-red-100 border-red-300 text-red-800',
    subcategories: {
      berries: {
        name: '베리류',
        flavors: ['블루베리', '블랙베리', '라즈베리', '딸기', '크랜베리']
      },
      citrus: {
        name: '감귤류',
        flavors: ['레몬', '라임', '오렌지', '자몽', '귤']
      },
      stone_fruit: {
        name: '핵과류',
        flavors: ['복숭아', '살구', '체리', '자두', '망고']
      },
      tropical: {
        name: '열대과일',
        flavors: ['파인애플', '바나나', '파파야', '패션후르츠', '구아바']
      },
      apple_pear: {
        name: '사과/배',
        flavors: ['사과', '배', '포도', '키위', '무화과']
      }
    }
  },
  floral: {
    name: '꽃향',
    color: 'bg-purple-100 border-purple-300 text-purple-800',
    subcategories: {
      floral: {
        name: '꽃향',
        flavors: ['자스민', '라벤더', '장미', '히비스커스', '오렌지블라썸', '허니서클']
      }
    }
  },
  sweet: {
    name: '단맛',
    color: 'bg-pink-100 border-pink-300 text-pink-800',  
    subcategories: {
      chocolate: {
        name: '초콜릿',
        flavors: ['다크초콜릿', '밀크초콜릿', '코코아', '카카오']
      },
      vanilla: {
        name: '바닐라',
        flavors: ['바닐라', '캐러멜', '허니', '메이플시럽']
      },
      brown_sugar: {
        name: '갈색설탕',
        flavors: ['갈색설탕', '당밀', '캐러멜라이즈드 슈가']
      }
    }
  },
  nutty: {
    name: '견과류',
    color: 'bg-amber-100 border-amber-300 text-amber-800',
    subcategories: {
      nuts: {
        name: '견과류',
        flavors: ['아몬드', '헤이즐넛', '호두', '피칸', '땅콩', '마카다미아', '브라질넛']
      }
    }
  },
  spices: {
    name: '향신료',
    color: 'bg-orange-100 border-orange-300 text-orange-800',
    subcategories: {
      warm_spices: {
        name: '따뜻한 향신료',
        flavors: ['계피', '정향', '넛메그', '올스파이스', '카다몸']
      },
      pepper: {
        name: '후추류',
        flavors: ['블랙페퍼', '화이트페퍼', '핑크페퍼']
      }
    }
  },
  roasted: {
    name: '로스팅',
    color: 'bg-stone-100 border-stone-300 text-stone-800',
    subcategories: {
      cereal: {
        name: '곡물',
        flavors: ['토스트', '빵', '비스킷', '그레인', '맥아']
      },
      tobacco: {
        name: '담배/가죽',
        flavors: ['담배', '가죽', '삼나무', '스모키']
      }
    }
  },
  green: {
    name: '식물성',
    color: 'bg-green-100 border-green-300 text-green-800',
    subcategories: {
      vegetative: {
        name: '식물성',
        flavors: ['그래스', '허브', '민트', '유칼립투스']
      },
      beany: {
        name: '콩비린내',
        flavors: ['그린빈', '생콩', '풀냄새']
      }
    }
  },
  sour_fermented: {
    name: '신맛/발효',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
    subcategories: {
      sour: {
        name: '신맛',
        flavors: ['사워체리', '타마린드', '라임', '식초', '유산균']
      },
      fermented: {
        name: '발효',
        flavors: ['와인', '위스키', '브랜디', '럼', '사과주']
      }
    }
  },
  other: {
    name: '기타',
    color: 'bg-gray-100 border-gray-300 text-gray-800',
    subcategories: {
      chemical: {
        name: '화학적',
        flavors: ['메디신', '이오드', '고무', '페놀', '암모니아']
      },
      earthy: {
        name: '흙냄새',
        flavors: ['흙', '버섯', '습한 나무', '곰팡이']
      }
    }
  }
}

export default function FlavorSelectionPage() {
  const router = useRouter()
  const params = useParams()
  const mode = params.mode as TastingMode

  const [session, setSession] = useState<Partial<TastingSession> | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(false)

  const maxFlavors = 5

  // 세션 로드 및 검증
  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_NEW_TASTING_FLOW')) {
      router.push('/mode-selection')
      return
    }

    const sessionData = sessionStorage.getItem('tf_session')
    if (!sessionData) {
      router.push('/tasting-flow')
      return
    }

    const parsedSession = JSON.parse(sessionData)
    if (!parsedSession.mode || (parsedSession.mode !== 'cafe' && parsedSession.mode !== 'homecafe')) {
      router.push('/tasting-flow')
      return
    }

    setSession(parsedSession)
  }, [router])

  // 검색 기능
  const searchFlavors = () => {
    if (!searchQuery.trim()) return []
    
    const results: Array<{ flavor: string; category: string; subcategory: string }> = []
    
    Object.entries(FLAVOR_CATEGORIES).forEach(([categoryKey, category]) => {
      Object.entries(category.subcategories).forEach(([subKey, subcategory]) => {
        subcategory.flavors.forEach(flavor => {
          if (flavor.toLowerCase().includes(searchQuery.toLowerCase())) {
            results.push({
              flavor,
              category: category.name,
              subcategory: subcategory.name
            })
          }
        })
      })
    })
    
    return results
  }

  const handleFlavorToggle = (flavor: string) => {
    if (selectedFlavors.includes(flavor)) {
      setSelectedFlavors(prev => prev.filter(f => f !== flavor))
    } else if (selectedFlavors.length < maxFlavors) {
      setSelectedFlavors(prev => [...prev, flavor])
    }
  }

  const handleNext = () => {
    const flavorProfile: FlavorProfile = {
      selectedFlavors,
      intensity: selectedFlavors.length > 3 ? 'high' : selectedFlavors.length > 1 ? 'medium' : 'low',
      complexity: selectedFlavors.length,
    }

    const updatedSession = {
      ...session,
      flavorProfile,
      currentScreen: 'sensory-expression',
    }

    sessionStorage.setItem('tf_session', JSON.stringify(updatedSession))
    router.push(`/tasting-flow/${mode}/sensory-expression`)
  }

  const handleBack = () => {
    if (mode === 'homecafe') {
      router.push('/tasting-flow/homecafe/brew-setup')
    } else {
      router.push('/tasting-flow/cafe/coffee-info')
    }
  }

  const searchResults = searchFlavors()

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-coffee-600 mx-auto mb-4"></div>
          <p className="text-coffee-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-50 to-coffee-100">
      <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
        <Navigation showBackButton currentPage="record" />

        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-coffee-800">향미 선택</h1>
            <div className="text-sm text-coffee-600">
              {mode === 'cafe' ? '3' : '3'} / {mode === 'cafe' ? '6' : '7'}
            </div>
          </div>

          {/* 진행바 */}
          <div className="w-full bg-coffee-200 rounded-full h-2">
            <div
              className="bg-coffee-600 h-2 rounded-full transition-all duration-300"
              style={{ width: mode === 'cafe' ? '50%' : '42.86%' }}
            />
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Palette className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-xl md:text-2xl font-bold text-coffee-800 mb-2">
              이 커피는 어떤 향미였나요?
            </h2>
            <p className="text-coffee-600 mb-4">
              최대 {maxFlavors}개까지 선택할 수 있습니다 ({selectedFlavors.length}/{maxFlavors})
            </p>
          </div>

          {/* 검색 바 */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="향미 검색 (예: 베리, 초콜릿, 시트러스)"
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-coffee-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            {/* 검색 결과 */}
            {searchQuery && searchFlavors().length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  검색 결과 ({searchFlavors().length}개)
                </h4>
                <div className="space-y-2">
                  {searchFlavors().map((result, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        handleFlavorToggle(result.flavor)
                        setSearchQuery('')
                      }}
                      disabled={selectedFlavors.length >= maxFlavors && !selectedFlavors.includes(result.flavor)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedFlavors.includes(result.flavor)
                          ? 'border-coffee-600 bg-coffee-50'
                          : selectedFlavors.length >= maxFlavors
                          ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-200 hover:border-coffee-400 hover:bg-coffee-50'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{result.flavor}</span>
                        <span className="text-sm text-gray-500">
                          {result.category} › {result.subcategory}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {searchQuery && searchFlavors().length === 0 && (
              <div className="mt-4 p-4 bg-gray-50 rounded-xl text-center text-gray-500">
                "{searchQuery}"에 대한 검색 결과가 없습니다
              </div>
            )}
          </div>

          {/* 선택된 향미 표시 */}
          {selectedFlavors.length > 0 && (
            <div className="mb-8 p-4 bg-coffee-50 rounded-xl border border-coffee-200">
              <h3 className="text-sm font-medium text-coffee-700 mb-3">선택된 향미</h3>
              <div className="flex flex-wrap gap-2">
                {selectedFlavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => handleFlavorToggle(flavor)}
                    className="inline-flex items-center px-3 py-1 bg-coffee-600 text-white rounded-full text-sm hover:bg-coffee-700 transition-colors"
                  >
                    {flavor}
                    <X className="h-3 w-3 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 카테고리별 향미 선택 */}
          {!searchQuery && (
            <>
              {/* 카테고리 탭 */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-4 py-2 rounded-xl border-2 transition-all ${
                      selectedCategory === null
                        ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    전체
                  </button>
                  {Object.entries(FLAVOR_CATEGORIES).map(([key, category]) => (
                    <button
                      key={key}
                      onClick={() => setSelectedCategory(key)}
                      className={`px-4 py-2 rounded-xl border-2 transition-all ${
                        selectedCategory === key
                          ? category.color
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 향미 그리드 */}
              <div className="space-y-8">
                {Object.entries(FLAVOR_CATEGORIES)
                  .filter(([key]) => selectedCategory === null || selectedCategory === key)
                  .map(([categoryKey, category]) => (
                    <div key={categoryKey}>
                      <h3 className="text-lg font-medium text-coffee-800 mb-4 flex items-center">
                        <span className={`w-4 h-4 rounded-full mr-2 ${category.color.split(' ')[0]}`} />
                        {category.name}
                      </h3>
                      
                      {Object.entries(category.subcategories).map(([subKey, subcategory]) => (
                        <div key={subKey} className="mb-6">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{subcategory.name}</h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {subcategory.flavors.map((flavor) => (
                              <button
                                key={flavor}
                                onClick={() => handleFlavorToggle(flavor)}
                                disabled={!selectedFlavors.includes(flavor) && selectedFlavors.length >= maxFlavors}
                                className={`p-3 rounded-xl border-2 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                                  selectedFlavors.includes(flavor)
                                    ? 'border-coffee-500 bg-coffee-50 text-coffee-800'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                <div className="text-sm font-medium">{flavor}</div>
                                {selectedFlavors.includes(flavor) && (
                                  <Check className="h-4 w-4 mx-auto mt-1 text-coffee-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* 안내 메시지 */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-700">
                <p className="font-medium mb-1">향미 선택 팁</p>
                <ul className="space-y-1 text-xs">
                  <li>• 처음 느낀 향, 입 안에서의 맛, 뒷맛을 모두 고려해보세요</li>
                  <li>• 확실하지 않은 향미는 선택하지 않아도 괜찮습니다</li>
                  <li>• 나중에 개인 메모에서 더 자세히 표현할 수 있어요</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-8">
          <button
            onClick={handleBack}
            className="flex-1 py-4 px-6 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-lg font-medium flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            이전
          </button>
          <button
            onClick={handleNext}
            className="flex-2 py-4 px-8 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-colors text-lg font-medium flex items-center justify-center"
          >
            다음 단계
            <ArrowRight className="h-5 w-5 ml-2" />
          </button>
        </div>

        {/* 다음 단계 미리보기 */}
        <div className="mt-6 text-center">
          <p className="text-sm text-coffee-500">다음: 감각 표현</p>
        </div>
      </div>
    </div>
  )
}