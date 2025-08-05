-- Coffee Products Table for Crawled Data
-- 웹 크롤링으로 수집한 커피 제품 정보를 저장하는 테이블

CREATE TABLE IF NOT EXISTS coffee_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 기본 제품 정보
  coffee_name TEXT NOT NULL,
  roastery TEXT NOT NULL,
  roastery_url TEXT,
  origin TEXT NOT NULL,
  
  -- 세부 정보 (선택사항)
  variety TEXT,
  processing TEXT,
  roast_level TEXT,
  tasting_notes TEXT[], -- 배열로 저장
  
  -- 가격 정보
  price INTEGER, -- 원화 기준 가격
  currency TEXT DEFAULT 'KRW',
  
  -- URL 및 이미지
  product_url TEXT NOT NULL UNIQUE,
  image_urls TEXT[], -- 여러 이미지 URL 배열
  label_image_url TEXT,
  
  -- 메타데이터
  crawled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'web_crawled',
  verified BOOLEAN DEFAULT FALSE,
  quality_score INTEGER DEFAULT 0,
  
  -- 인덱싱을 위한 필드
  search_text TEXT GENERATED ALWAYS AS (
    lower(coffee_name || ' ' || roastery || ' ' || origin || ' ' || COALESCE(variety, '') || ' ' || COALESCE(processing, ''))
  ) STORED,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_coffee_products_roastery ON coffee_products(roastery);
CREATE INDEX IF NOT EXISTS idx_coffee_products_origin ON coffee_products(origin);
CREATE INDEX IF NOT EXISTS idx_coffee_products_variety ON coffee_products(variety);
CREATE INDEX IF NOT EXISTS idx_coffee_products_processing ON coffee_products(processing);
CREATE INDEX IF NOT EXISTS idx_coffee_products_price ON coffee_products(price);
CREATE INDEX IF NOT EXISTS idx_coffee_products_quality_score ON coffee_products(quality_score);
CREATE INDEX IF NOT EXISTS idx_coffee_products_crawled_at ON coffee_products(crawled_at);
CREATE INDEX IF NOT EXISTS idx_coffee_products_search_text ON coffee_products USING gin(to_tsvector('korean', search_text));

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_coffee_products_updated_at 
  BEFORE UPDATE ON coffee_products 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) 설정
ALTER TABLE coffee_products ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능 (공개 데이터)
CREATE POLICY "Coffee products are viewable by everyone" 
  ON coffee_products FOR SELECT 
  USING (true);

-- 관리자만 삽입/수정/삭제 가능
CREATE POLICY "Coffee products are manageable by admin only" 
  ON coffee_products FOR ALL 
  USING (auth.jwt() ->> 'role' = 'admin');

-- 코멘트 추가
COMMENT ON TABLE coffee_products IS '웹 크롤링으로 수집한 커피 제품 정보를 저장하는 테이블';
COMMENT ON COLUMN coffee_products.coffee_name IS '커피 제품명';
COMMENT ON COLUMN coffee_products.roastery IS '로스터리명';
COMMENT ON COLUMN coffee_products.origin IS '원산지';
COMMENT ON COLUMN coffee_products.variety IS '커피 품종 (게이샤, 부르봉 등)';
COMMENT ON COLUMN coffee_products.processing IS '가공법 (워시드, 내추럴, 허니 등)';
COMMENT ON COLUMN coffee_products.tasting_notes IS '테이스팅 노트 배열';
COMMENT ON COLUMN coffee_products.quality_score IS '데이터 품질 점수 (0-100)';
COMMENT ON COLUMN coffee_products.search_text IS '검색용 텍스트 (자동 생성)';