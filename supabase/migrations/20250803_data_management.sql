-- 카페/로스터리 테이블
CREATE TABLE IF NOT EXISTS cafe_roasteries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cafe', 'roastery', 'both')) NOT NULL,
  
  -- 기본 정보
  description TEXT,
  established_year INTEGER,
  owner_name TEXT,
  
  -- 위치 정보
  address TEXT NOT NULL,
  address_detail TEXT,
  city TEXT NOT NULL,
  district TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- 연락처
  phone TEXT,
  email TEXT,
  website TEXT,
  instagram TEXT,
  
  -- 영업 정보
  business_hours JSONB DEFAULT '{}',
  
  -- 특징
  features TEXT[] DEFAULT '{}',
  signature_menu TEXT[] DEFAULT '{}',
  roasting_style TEXT,
  
  -- 이미지
  logo_url TEXT,
  images TEXT[] DEFAULT '{}',
  
  -- 상태 및 메타데이터
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1),
  review_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_verified_at TIMESTAMPTZ,
  
  -- 인덱스를 위한 검색 필드
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(address, '')), 'C')
  ) STORED
);

-- 커피 원두 테이블
CREATE TABLE IF NOT EXISTS coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_en TEXT,
  
  -- 로스터리 정보
  roastery_id UUID REFERENCES cafe_roasteries(id) ON DELETE SET NULL,
  roastery_name TEXT NOT NULL,
  
  -- 원산지 정보
  origin_country TEXT NOT NULL,
  origin_region TEXT,
  origin_farm TEXT,
  origin_altitude TEXT,
  
  -- 품종 및 가공
  variety TEXT[] DEFAULT '{}',
  processing TEXT NOT NULL,
  
  -- 로스팅 정보
  roast_level TEXT CHECK (roast_level IN ('Light', 'Light-Medium', 'Medium', 'Medium-Dark', 'Dark')) NOT NULL,
  roasted_date DATE,
  
  -- 맛 프로파일
  flavor_notes TEXT[] DEFAULT '{}',
  aroma TEXT[] DEFAULT '{}',
  acidity INTEGER CHECK (acidity >= 1 AND acidity <= 5),
  body INTEGER CHECK (body >= 1 AND body <= 5),
  sweetness INTEGER CHECK (sweetness >= 1 AND sweetness <= 5),
  bitterness INTEGER CHECK (bitterness >= 1 AND bitterness <= 5),
  
  -- 로스터 노트
  roaster_notes JSONB DEFAULT '{}',
  
  -- SCA 점수
  sca_score DECIMAL(3, 1) CHECK (sca_score >= 0 AND sca_score <= 100),
  
  -- 가격 정보
  price_retail INTEGER,
  price_per_kg INTEGER,
  price_currency TEXT DEFAULT 'KRW',
  
  -- 재고 및 판매 정보
  availability TEXT CHECK (availability IN ('in_stock', 'out_of_stock', 'seasonal', 'limited')) DEFAULT 'in_stock',
  harvest_year INTEGER,
  best_before DATE,
  
  -- 이미지
  package_image_url TEXT,
  bean_image_url TEXT,
  
  -- 태그 및 카테고리
  tags TEXT[] DEFAULT '{}',
  category TEXT CHECK (category IN ('single_origin', 'blend', 'decaf')) NOT NULL,
  
  -- 상태 및 메타데이터
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  popularity_score INTEGER DEFAULT 50,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  data_source TEXT CHECK (data_source IN ('manual', 'crawled', 'api', 'csv')) DEFAULT 'manual',
  
  -- 검색을 위한 인덱스
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('simple', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(name_en, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(roastery_name, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(origin_country || ' ' || coalesce(origin_region, ''), '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(flavor_notes, ' '), '')), 'C')
  ) STORED
);

-- 카페/로스터리와 커피 연결 테이블
CREATE TABLE IF NOT EXISTS cafe_roastery_coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_roastery_id UUID REFERENCES cafe_roasteries(id) ON DELETE CASCADE,
  coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE,
  is_signature BOOLEAN DEFAULT false,
  is_seasonal BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(cafe_roastery_id, coffee_id)
);

-- 데이터 업데이트 로그
CREATE TABLE IF NOT EXISTS data_update_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT CHECK (entity_type IN ('cafe_roastery', 'coffee')) NOT NULL,
  entity_id UUID,
  action TEXT CHECK (action IN ('create', 'update', 'delete', 'import', 'crawl')) NOT NULL,
  changes JSONB,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  source TEXT CHECK (source IN ('manual', 'crawl', 'api', 'csv')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX idx_cafe_roasteries_type ON cafe_roasteries(type);
CREATE INDEX idx_cafe_roasteries_city ON cafe_roasteries(city);
CREATE INDEX idx_cafe_roasteries_is_verified ON cafe_roasteries(is_verified);
CREATE INDEX idx_cafe_roasteries_is_active ON cafe_roasteries(is_active);
CREATE INDEX idx_cafe_roasteries_search ON cafe_roasteries USING GIN(search_vector);

CREATE INDEX idx_coffees_roastery_id ON coffees(roastery_id);
CREATE INDEX idx_coffees_category ON coffees(category);
CREATE INDEX idx_coffees_origin_country ON coffees(origin_country);
CREATE INDEX idx_coffees_roast_level ON coffees(roast_level);
CREATE INDEX idx_coffees_availability ON coffees(availability);
CREATE INDEX idx_coffees_is_featured ON coffees(is_featured);
CREATE INDEX idx_coffees_search ON coffees USING GIN(search_vector);

-- 트리거: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cafe_roasteries_updated_at BEFORE UPDATE ON cafe_roasteries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coffees_updated_at BEFORE UPDATE ON coffees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS 정책
ALTER TABLE cafe_roasteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE cafe_roastery_coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_update_logs ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Public can read cafe_roasteries" ON cafe_roasteries
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read coffees" ON coffees
  FOR SELECT USING (is_active = true);

-- 관리자만 쓰기 가능 (추후 관리자 role 구현 시 수정)
CREATE POLICY "Admins can manage cafe_roasteries" ON cafe_roasteries
  FOR ALL USING (true);

CREATE POLICY "Admins can manage coffees" ON coffees
  FOR ALL USING (true);

CREATE POLICY "Admins can manage cafe_roastery_coffees" ON cafe_roastery_coffees
  FOR ALL USING (true);

CREATE POLICY "Admins can manage data_update_logs" ON data_update_logs
  FOR ALL USING (true);