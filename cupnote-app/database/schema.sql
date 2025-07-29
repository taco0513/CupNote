-- CupNote Database Schema for Supabase
-- 사용자 프로필 확장 테이블
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  display_name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 커피 정보 테이블
CREATE TABLE IF NOT EXISTS coffees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  roaster VARCHAR(200),
  origin VARCHAR(100),
  roast_level VARCHAR(50),
  processing_method VARCHAR(100),
  variety VARCHAR(100),
  farm VARCHAR(200),
  altitude INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- 테이스팅 기록 테이블
CREATE TABLE IF NOT EXISTS tastings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  coffee_id UUID REFERENCES coffees(id) ON DELETE CASCADE,
  
  -- 기본 정보
  mode VARCHAR(20) NOT NULL CHECK (mode IN ('cafe', 'homecafe', 'lab')),
  session_id UUID DEFAULT gen_random_uuid(),
  
  -- 커피 정보 (중복 저장으로 히스토리 보존)
  coffee_info JSONB NOT NULL,
  
  -- 브루잉 정보
  brew_settings JSONB,
  experimental_data JSONB,
  
  -- 테이스팅 노트
  selected_flavors JSONB NOT NULL DEFAULT '[]',
  sensory_expressions JSONB DEFAULT '{}',
  personal_comment TEXT,
  roaster_notes TEXT,
  
  -- 매치 스코어
  match_score JSONB,
  
  -- 메타데이터
  total_duration INTEGER, -- 초 단위
  sensory_skipped BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 향미 마스터 데이터
CREATE TABLE IF NOT EXISTS flavor_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name_ko VARCHAR(50) NOT NULL,
  name_en VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color
  icon VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- 감각 표현 마스터 데이터
CREATE TABLE IF NOT EXISTS sensory_expressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category VARCHAR(20) NOT NULL CHECK (category IN ('acidity', 'sweetness', 'bitterness', 'body', 'aroma', 'finish')),
  expression_ko VARCHAR(50) NOT NULL,
  expression_en VARCHAR(50),
  intensity_level INTEGER DEFAULT 1 CHECK (intensity_level BETWEEN 1 AND 5),
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_tastings_user_id ON tastings(user_id);
CREATE INDEX IF NOT EXISTS idx_tastings_created_at ON tastings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tastings_mode ON tastings(mode);
CREATE INDEX IF NOT EXISTS idx_coffees_created_by ON coffees(created_by);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Row Level Security (RLS) 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE coffees ENABLE ROW LEVEL SECURITY;
ALTER TABLE tastings ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- 프로필: 본인 것만 읽기/쓰기
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 커피: 본인이 생성한 것만 관리, 모든 사용자 읽기 가능
CREATE POLICY "Anyone can view coffees" ON coffees
  FOR SELECT USING (true);

CREATE POLICY "Users can create coffees" ON coffees
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own coffees" ON coffees
  FOR UPDATE USING (auth.uid() = created_by);

-- 테이스팅: 본인 것만 관리
CREATE POLICY "Users can view own tastings" ON tastings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tastings" ON tastings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tastings" ON tastings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tastings" ON tastings
  FOR DELETE USING (auth.uid() = user_id);

-- 마스터 데이터: 모든 사용자 읽기 가능
CREATE POLICY "Anyone can view flavor categories" ON flavor_categories
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view sensory expressions" ON sensory_expressions
  FOR SELECT USING (true);

-- 함수: 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거: 새 사용자 가입 시 프로필 생성
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거: updated_at 자동 업데이트
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_tastings
  BEFORE UPDATE ON tastings
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();