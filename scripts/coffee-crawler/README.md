# ☕ Coffee Data Crawler

커피 로스터리 웹사이트에서 제품 정보를 크롤링하여 OCR 학습 데이터를 생성하는 시스템

## 📋 프로젝트 개요

CupNote의 OCR 정확도 향상을 위해 전 세계 로스터리 웹사이트에서 커피 제품 정보를 수집하여 머신러닝 학습 데이터셋을 구축합니다.

## 🎯 목표

- **정확도 90%+** OCR 성능 달성
- **1000+개** 커피 제품 데이터 수집  
- **다양한 라벨 패턴** 학습 (한국어, 영어, 일본어 등)
- **실시간 학습** 사용자 피드백 + 크롤링 데이터 결합

## 📊 Phase 별 계획

### Phase 1: 프로토타입 (2-3주) ⚡ 진행중
- [x] 기본 크롤링 시스템 구축
- [ ] 5-10개 로스터리 테스트 크롤링
- [ ] 100-200개 제품 데이터 수집
- [ ] Supabase 저장 시스템 구축

### Phase 2: 확장 (1-2개월)
- [ ] 20-30개 로스터리로 확장
- [ ] 1000-2000개 제품 데이터 수집
- [ ] OCR 정확도 측정 시스템

### Phase 3: ML 통합 (2-3개월)
- [ ] 수집 데이터로 OCR 파싱 로직 개선
- [ ] 사용자 피드백 + 크롤링 데이터 결합
- [ ] 정확도 90%+ 달성

## 🏗️ 시스템 아키텍처

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Roastery      │    │   Coffee Data    │    │   Supabase      │
│   Websites      │───▶│   Crawler        │───▶│   Database      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   OCR Learning   │
                       │   Pipeline       │
                       └──────────────────┘
```

## 📁 디렉토리 구조

```
scripts/coffee-crawler/
├── README.md                 # 이 파일
├── src/
│   ├── crawlers/            # 로스터리별 크롤러
│   │   ├── base-crawler.ts  # 기본 크롤러 클래스
│   │   ├── korean/          # 한국 로스터리
│   │   │   ├── unspecialty.ts
│   │   │   ├── nams.ts
│   │   │   └── elcafe.ts
│   │   └── global/          # 해외 로스터리
│   │       ├── blue-bottle.ts
│   │       └── stumptown.ts
│   ├── types/
│   │   └── coffee-data.ts   # 타입 정의
│   ├── utils/
│   │   ├── image-processor.ts
│   │   └── data-validator.ts
│   └── database/
│       └── supabase-client.ts
├── config/
│   └── roasteries.json      # 로스터리 설정
└── docs/
    ├── crawling-strategy.md
    └── data-schema.md
```

## 🎨 데이터 스키마

```typescript
interface CoffeeProductData {
  // 기본 정보
  coffeeName: string           // "El Diviso - Ombligon Decaf"
  roastery: string            // "Blue Bottle Coffee"
  
  // 원산지 정보
  origin: string              // "Colombia"
  region?: string             // "Bruselas, Pitalito-Huila"
  farm?: string               // "Granja Paraiso 92"
  
  // 커피 특성
  variety?: string            // "Red Bourbon"
  processing?: string         // "Double anaerobic + Thermal shock"
  roastLevel?: string         // "Medium", "Light", "Dark"
  altitude?: number           // 1950
  
  // 테이스팅 정보
  tastingNotes: string[]      // ["히비스커스 차", "리치", "딸기"]
  
  // 메타데이터
  price?: number              // 28000
  productUrl: string          // 원본 페이지
  imageUrls: string[]         // 제품 이미지들
  labelImageUrl?: string      // 라벨 이미지 (OCR 학습용)
  
  // 추적 정보
  crawledAt: Date
  source: 'web_crawled' | 'user_feedback'
  verified: boolean
}
```

## 🚀 사용법

### 개발 환경 설정

```bash
# 의존성 설치 (이미 완료)
npm install --save-dev puppeteer cheerio axios @types/cheerio

# 환경 변수 설정
cp .env.example .env.local
# SUPABASE_URL, SUPABASE_ANON_KEY 설정

# 크롤러 실행
npm run crawler:start
```

### 단일 로스터리 테스트

```bash
# 특정 로스터리만 크롤링
npm run crawler:test -- --roastery=unspecialty
```

## 📈 모니터링 & 분석

- **크롤링 성공률**: 95%+ 목표
- **데이터 품질**: 이미지 + 텍스트 매칭 검증
- **중복 제거**: URL 기반 중복 방지
- **에러 트래킹**: 실패한 페이지 로깅

## ⚖️ 법적 고려사항

- **robots.txt 준수**: 모든 사이트 크롤링 전 확인
- **요청 간격**: 서버 부하 방지 (2-5초 간격)
- **저작권 준수**: 교육/연구 목적으로만 사용
- **개인정보 보호**: 개인 식별 정보 수집 금지

## 🔧 기술 스택

- **Node.js + TypeScript**: 메인 언어
- **Puppeteer**: 브라우저 자동화
- **Cheerio**: HTML 파싱
- **Supabase**: 데이터 저장
- **Axios**: HTTP 요청

## 📝 참고 문서

- [크롤링 전략](./docs/crawling-strategy.md)
- [데이터 스키마](./docs/data-schema.md)
- [로스터리 추가 가이드](./docs/adding-roasteries.md)

---

**Last Updated**: 2025-08-05  
**Version**: 1.0.0  
**Status**: Phase 1 진행중 ⚡