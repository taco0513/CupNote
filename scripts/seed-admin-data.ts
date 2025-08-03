/**
 * Seed script for admin dashboard testing
 * Creates sample Korean cafe, roastery, and coffee data
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import * as path from 'path'

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Sample Korean cafe/roastery data
const sampleCafeRoasteries = [
  {
    name: '앤트러사이트',
    type: 'both' as const,
    address: '서울시 성동구 서울숲2길 44-13',
    city: '서울',
    region: '성동구',
    phone: '02-469-9305',
    website: 'https://anthracitecoffee.com',
    social_instagram: '@anthracitecoffee',
    opening_hours: {
      mon: '08:00-22:00',
      tue: '08:00-22:00',
      wed: '08:00-22:00',
      thu: '08:00-22:00',
      fri: '08:00-22:00',
      sat: '09:00-22:00',
      sun: '09:00-22:00'
    },
    features: ['로스팅', '브루잉바', '베이커리', '와이파이'],
    is_verified: true
  },
  {
    name: '프릳츠 커피 컴퍼니',
    type: 'both' as const,
    address: '서울시 마포구 양화로3길 74',
    city: '서울',
    region: '마포구',
    phone: '02-3144-5701',
    website: 'https://fritz.co.kr',
    social_instagram: '@fritzcoffeecompany',
    opening_hours: {
      mon: '08:00-21:00',
      tue: '08:00-21:00',
      wed: '08:00-21:00',
      thu: '08:00-21:00',
      fri: '08:00-21:00',
      sat: '09:00-21:00',
      sun: '09:00-21:00'
    },
    features: ['로스팅', '큐그레이더', '브루잉바', '파티세리'],
    is_verified: true
  },
  {
    name: '센터커피',
    type: 'roastery' as const,
    address: '서울시 용산구 한강대로 92길 6-6',
    city: '서울',
    region: '용산구',
    phone: '02-790-7386',
    website: 'https://centercoffee.kr',
    social_instagram: '@center_coffee',
    features: ['로스팅', 'SCA 교육', '큐그레이더'],
    is_verified: true
  },
  {
    name: '커피리브레',
    type: 'roastery' as const,
    address: '서울시 마포구 토정로 49',
    city: '서울',
    region: '마포구',
    phone: '02-334-0055',
    website: 'https://coffeelibre.kr',
    social_instagram: '@coffeelibre',
    features: ['로스팅', '도매', '온라인판매'],
    is_verified: true
  },
  {
    name: '모모스커피',
    type: 'roastery' as const,
    address: '서울시 종로구 북촌로5길 8',
    city: '서울',
    region: '종로구',
    phone: '02-730-7033',
    website: 'https://momoscoffee.com',
    social_instagram: '@momoscoffee',
    features: ['로스팅', '원두도매', '카페컨설팅'],
    is_verified: true
  },
  {
    name: '블루보틀 성수',
    type: 'cafe' as const,
    address: '서울시 성동구 아차산로17길 11',
    city: '서울',
    region: '성동구',
    phone: '02-462-6240',
    website: 'https://bluebottlecoffee.com/kr',
    social_instagram: '@bluebottlecoffee',
    opening_hours: {
      mon: '08:00-19:00',
      tue: '08:00-19:00',
      wed: '08:00-19:00',
      thu: '08:00-19:00',
      fri: '08:00-19:00',
      sat: '08:00-19:00',
      sun: '08:00-19:00'
    },
    features: ['핸드드립', '에스프레소바', '베이커리'],
    is_verified: true
  },
  {
    name: '알베르 연남',
    type: 'cafe' as const,
    address: '서울시 마포구 연남로1길 41',
    city: '서울',
    region: '마포구',
    phone: '070-8888-0897',
    social_instagram: '@alver_coffee',
    opening_hours: {
      mon: '10:00-22:00',
      tue: '10:00-22:00',
      wed: '10:00-22:00',
      thu: '10:00-22:00',
      fri: '10:00-22:00',
      sat: '10:00-22:00',
      sun: '10:00-22:00'
    },
    features: ['브루잉바', '디저트', '시그니처메뉴'],
    is_verified: true
  },
  {
    name: '나무사이로',
    type: 'roastery' as const,
    address: '서울시 마포구 성미산로29안길 29',
    city: '서울',
    region: '마포구',
    website: 'https://namusairo.com',
    social_instagram: '@namusairo',
    features: ['로스팅', '원두판매', '브루잉클래스'],
    is_verified: true
  },
  {
    name: '매뉴팩트 커피',
    type: 'both' as const,
    address: '서울시 은평구 연서로29길 24-11',
    city: '서울',
    region: '은평구',
    phone: '02-6949-1889',
    website: 'https://manufact.co.kr',
    social_instagram: '@manufact_coffee',
    features: ['로스팅', '베이커리', '브런치'],
    is_verified: true
  },
  {
    name: '스트롱홀드',
    type: 'roastery' as const,
    address: '경기도 양주시 광적면 효촌리 334-1',
    city: '양주',
    region: '경기도',
    phone: '031-878-0868',
    website: 'https://stronghold-coffee.com',
    features: ['로스팅장비제조', '로스팅', '교육'],
    is_verified: true
  }
]

// Sample coffee data
const sampleCoffees = [
  // 앤트러사이트 원두
  {
    name: '에티오피아 예가체프 코체레',
    roastery_name: '앤트러사이트',
    origin: {
      country: '에티오피아',
      region: '예가체프',
      farm: '코체레'
    },
    processing: 'Washed',
    roast_level: 'Light' as const,
    flavor_notes: ['자스민', '베르가못', '레몬', '흑설탕'],
    description: '밝고 깨끗한 산미와 플로럴한 향미가 특징인 에티오피아 워시드 커피',
    sca_score: 87,
    price: 18000,
    weight: '200g',
    harvest_date: '2024-11',
    roasted_date: '2025-01'
  },
  {
    name: '콜롬비아 핑크 버번',
    roastery_name: '앤트러사이트',
    origin: {
      country: '콜롬비아',
      region: '우일라',
      farm: '엘 디비소'
    },
    processing: 'Washed',
    roast_level: 'Light-Medium' as const,
    flavor_notes: ['딸기', '오렌지', '밀크초콜릿', '캐러멜'],
    description: '희귀한 핑크 버번 품종의 달콤하고 과일향이 풍부한 커피',
    sca_score: 88,
    price: 22000,
    weight: '200g',
    harvest_date: '2024-09',
    roasted_date: '2025-01'
  },
  // 프릳츠 원두
  {
    name: '브라질 세하도 펄프드 내추럴',
    roastery_name: '프릳츠 커피 컴퍼니',
    origin: {
      country: '브라질',
      region: '세하도',
      farm: '파젠다 캄포 알레그레'
    },
    processing: 'Pulped Natural',
    roast_level: 'Medium' as const,
    flavor_notes: ['헤이즐넛', '초콜릿', '황설탕', '크림'],
    description: '균형잡힌 바디감과 단맛이 특징인 브라질 스페셜티 커피',
    sca_score: 85,
    price: 15000,
    weight: '250g',
    harvest_date: '2024-07',
    roasted_date: '2025-01'
  },
  {
    name: '케냐 키암부 AA',
    roastery_name: '프릳츠 커피 컴퍼니',
    origin: {
      country: '케냐',
      region: '키암부',
      farm: '게이샤 에스테이트'
    },
    processing: 'Washed',
    roast_level: 'Light' as const,
    flavor_notes: ['블랙커런트', '와인', '토마토', '흑설탕'],
    description: '진한 과일향과 와인같은 바디감이 특징인 케냐 AA 등급 커피',
    sca_score: 89,
    price: 24000,
    weight: '200g',
    harvest_date: '2024-10',
    roasted_date: '2025-01'
  },
  // 센터커피 원두
  {
    name: '과테말라 안티구아 SHB',
    roastery_name: '센터커피',
    origin: {
      country: '과테말라',
      region: '안티구아',
      farm: '파스토레스 밀'
    },
    processing: 'Washed',
    roast_level: 'Medium' as const,
    flavor_notes: ['초콜릿', '오렌지', '캐러멜', '아몬드'],
    description: '화산 토양에서 자란 고급 과테말라 커피',
    sca_score: 86,
    price: 16000,
    weight: '250g',
    harvest_date: '2024-12',
    roasted_date: '2025-01'
  },
  // 커피리브레 원두
  {
    name: '에티오피아 시다모 내추럴',
    roastery_name: '커피리브레',
    origin: {
      country: '에티오피아',
      region: '시다모',
      farm: '구지'
    },
    processing: 'Natural',
    roast_level: 'Light' as const,
    flavor_notes: ['블루베리', '다크초콜릿', '와인', '꽃향'],
    description: '복합적인 베리류 향미와 와인같은 질감의 내추럴 프로세싱 커피',
    sca_score: 88,
    price: 20000,
    weight: '200g',
    harvest_date: '2024-11',
    roasted_date: '2025-01'
  },
  // 모모스커피 원두
  {
    name: '코스타리카 따라주 허니',
    roastery_name: '모모스커피',
    origin: {
      country: '코스타리카',
      region: '따라주',
      farm: '라 칸델리야'
    },
    processing: 'Honey',
    roast_level: 'Light-Medium' as const,
    flavor_notes: ['꿀', '살구', '카라멜', '오렌지'],
    description: '허니 프로세싱의 단맛과 과일향이 조화로운 커피',
    sca_score: 87,
    price: 19000,
    weight: '200g',
    harvest_date: '2024-12',
    roasted_date: '2025-01'
  },
  // 나무사이로 원두
  {
    name: '파나마 게이샤 워시드',
    roastery_name: '나무사이로',
    origin: {
      country: '파나마',
      region: '보케테',
      farm: '에스메랄다'
    },
    processing: 'Washed',
    roast_level: 'Light' as const,
    flavor_notes: ['자스민', '베르가못', '복숭아', '꿀'],
    description: '최고급 게이샤 품종의 독특하고 화려한 향미',
    sca_score: 92,
    price: 45000,
    weight: '100g',
    harvest_date: '2024-12',
    roasted_date: '2025-01'
  },
  // 매뉴팩트 원두
  {
    name: '인도네시아 수마트라 만델링',
    roastery_name: '매뉴팩트 커피',
    origin: {
      country: '인도네시아',
      region: '수마트라',
      farm: '린통'
    },
    processing: 'Semi-Washed',
    roast_level: 'Medium-Dark' as const,
    flavor_notes: ['허브', '다크초콜릿', '흙향', '담배'],
    description: '묵직한 바디감과 독특한 흙향이 특징인 수마트라 커피',
    sca_score: 84,
    price: 14000,
    weight: '250g',
    harvest_date: '2024-10',
    roasted_date: '2025-01'
  },
  // 스트롱홀드 원두
  {
    name: '페루 차마야 유기농',
    roastery_name: '스트롱홀드',
    origin: {
      country: '페루',
      region: '차마야',
      farm: '코퍼라티브'
    },
    processing: 'Washed',
    roast_level: 'Medium' as const,
    flavor_notes: ['밀크초콜릿', '너트', '브라운슈가', '오렌지'],
    description: '유기농 인증을 받은 깔끔하고 균형잡힌 페루 커피',
    sca_score: 85,
    price: 17000,
    weight: '250g',
    harvest_date: '2024-08',
    roasted_date: '2025-01'
  }
]

async function seedData() {
  console.log('🌱 Starting data seeding...')

  try {
    // 1. Insert cafe/roastery data
    console.log('📍 Inserting cafe/roastery data...')
    const { data: cafeData, error: cafeError } = await supabase
      .from('cafe_roasteries')
      .insert(sampleCafeRoasteries)
      .select()

    if (cafeError) {
      console.error('Error inserting cafes:', cafeError)
      return
    }
    console.log(`✅ Inserted ${cafeData.length} cafe/roasteries`)

    // 2. Create roastery name to ID mapping
    const roasteryMap = new Map(
      cafeData
        .filter(c => c.type === 'roastery' || c.type === 'both')
        .map(c => [c.name, c.id])
    )

    // 3. Insert coffee data with roastery IDs
    console.log('☕ Inserting coffee data...')
    const coffeesWithIds = sampleCoffees.map(coffee => {
      const { roastery_name, ...coffeeData } = coffee
      return {
        ...coffeeData,
        roastery_id: roasteryMap.get(roastery_name) || null
      }
    })

    const { data: coffeeData, error: coffeeError } = await supabase
      .from('coffees')
      .insert(coffeesWithIds)
      .select()

    if (coffeeError) {
      console.error('Error inserting coffees:', coffeeError)
      return
    }
    console.log(`✅ Inserted ${coffeeData.length} coffees`)

    // 4. Create relationships between cafes and coffees
    console.log('🔗 Creating cafe-coffee relationships...')
    const relationships = []
    
    // 앤트러사이트는 자사 원두 취급
    const anthracite = cafeData.find(c => c.name === '앤트러사이트')
    const anthraciteCoffees = coffeeData.filter(c => 
      c.roastery_id === anthracite?.id
    )
    anthraciteCoffees.forEach(coffee => {
      relationships.push({
        cafe_roastery_id: anthracite.id,
        coffee_id: coffee.id
      })
    })

    // 프릳츠는 자사 원두 취급
    const fritz = cafeData.find(c => c.name === '프릳츠 커피 컴퍼니')
    const fritzCoffees = coffeeData.filter(c => 
      c.roastery_id === fritz?.id
    )
    fritzCoffees.forEach(coffee => {
      relationships.push({
        cafe_roastery_id: fritz.id,
        coffee_id: coffee.id
      })
    })

    // 블루보틀은 여러 로스터리 원두 취급
    const bluebottle = cafeData.find(c => c.name === '블루보틀 성수')
    if (bluebottle) {
      // 랜덤으로 몇 개 원두 취급
      const randomCoffees = coffeeData.slice(0, 4)
      randomCoffees.forEach(coffee => {
        relationships.push({
          cafe_roastery_id: bluebottle.id,
          coffee_id: coffee.id
        })
      })
    }

    if (relationships.length > 0) {
      const { error: relError } = await supabase
        .from('cafe_roastery_coffees')
        .insert(relationships)

      if (relError) {
        console.error('Error creating relationships:', relError)
      } else {
        console.log(`✅ Created ${relationships.length} cafe-coffee relationships`)
      }
    }

    // 5. Log the operation
    await supabase.from('data_update_logs').insert({
      update_type: 'seed',
      source: 'admin_script',
      records_affected: cafeData.length + coffeeData.length,
      details: {
        cafes_inserted: cafeData.length,
        coffees_inserted: coffeeData.length,
        relationships_created: relationships.length
      }
    })

    console.log('\n✨ Data seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - ${cafeData.length} cafe/roasteries`)
    console.log(`   - ${coffeeData.length} coffees`)
    console.log(`   - ${relationships.length} relationships`)

  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

// Run the seed function
seedData()