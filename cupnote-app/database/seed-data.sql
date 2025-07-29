-- CupNote 마스터 데이터 초기화

-- 향미 카테고리 데이터
INSERT INTO flavor_categories (name_ko, name_en, category, description, color, sort_order) VALUES
-- 과일류
('딸기', 'strawberry', 'fruits', '상큼하고 달콤한 베리류 향미', '#FF6B6B', 1),
('체리', 'cherry', 'fruits', '달콤하고 새콤한 체리 향미', '#DC143C', 2),
('블루베리', 'blueberry', 'fruits', '부드럽고 달콤한 베리 향미', '#4169E1', 3),
('사과', 'apple', 'fruits', '상큼하고 과즙이 풍부한 향미', '#32CD32', 4),
('레몬', 'lemon', 'fruits', '밝고 산뜻한 시트러스 향미', '#FFD700', 5),
('오렌지', 'orange', 'fruits', '달콤하고 상큼한 시트러스 향미', '#FFA500', 6),
('자몽', 'grapefruit', 'fruits', '쌉싸름하고 상큼한 시트러스 향미', '#FF69B4', 7),
('복숭아', 'peach', 'fruits', '달콤하고 부드러운 과일 향미', '#FFCBA4', 8),
('포도', 'grape', 'fruits', '달콤하고 풍부한 과일 향미', '#9932CC', 9),

-- 견과류
('아몬드', 'almond', 'nuts', '고소하고 부드러운 견과류 향미', '#D2B48C', 10),
('헤이즐넛', 'hazelnut', 'nuts', '진하고 고소한 견과류 향미', '#A0522D', 11),
('호두', 'walnut', 'nuts', '진하고 쌉싸름한 견과류 향미', '#8B4513', 12),
('땅콩', 'peanut', 'nuts', '고소하고 짭짤한 견과류 향미', '#DEB887', 13),

-- 초콜릿/당류
('초콜릿', 'chocolate', 'sweet', '달콤하고 진한 초콜릿 향미', '#6B4423', 14),
('다크초콜릿', 'dark chocolate', 'sweet', '쌉싸름하고 진한 초콜릿 향미', '#3C1810', 15),
('밀크초콜릿', 'milk chocolate', 'sweet', '부드럽고 달콤한 초콜릿 향미', '#8B4513', 16),
('캐러멜', 'caramel', 'sweet', '달콤하고 고소한 캐러멜 향미', '#CD853F', 17),
('흑설탕', 'brown sugar', 'sweet', '진하고 달콤한 설탕 향미', '#8B4513', 18),
('꿀', 'honey', 'sweet', '달콤하고 부드러운 꿀 향미', '#FFD700', 19),
('바닐라', 'vanilla', 'sweet', '달콤하고 크리미한 바닐라 향미', '#F5DEB3', 20),

-- 꽃/허브
('꽃', 'floral', 'floral', '우아하고 향긋한 꽃 향미', '#FFB6C1', 21),
('재스민', 'jasmine', 'floral', '우아하고 향긋한 재스민 향미', '#F8F8FF', 22),
('라벤더', 'lavender', 'floral', '은은하고 향긋한 라벤더 향미', '#E6E6FA', 23),
('장미', 'rose', 'floral', '우아하고 달콤한 장미 향미', '#FFB6C1', 24),
('허브', 'herbal', 'floral', '상쾌하고 풀내음이 나는 허브 향미', '#9ACD32', 25),

-- 기타
('와인', 'wine', 'other', '깊고 복합적인 와인 향미', '#722F37', 26),
('홍차', 'black tea', 'other', '깊고 진한 홍차 향미', '#8B4513', 27),
('담배', 'tobacco', 'other', '깊고 스모키한 담배 향미', '#654321', 28),
('향신료', 'spice', 'other', '따뜻하고 자극적인 향신료 향미', '#D2691E', 29),
('흙', 'earthy', 'other', '깊고 자연스러운 흙 향미', '#8B4513', 30);

-- 감각 표현 데이터
INSERT INTO sensory_expressions (category, expression_ko, expression_en, intensity_level, description, sort_order) VALUES
-- 산미 (Acidity)
('acidity', '상큼한', 'bright', 3, '밝고 생기있는 산미', 1),
('acidity', '부드러운', 'mild', 2, '온화하고 부드러운 산미', 2),
('acidity', '날카로운', 'sharp', 5, '강하고 날카로운 산미', 3),
('acidity', '과일같은', 'fruity', 3, '과일을 연상시키는 산미', 4),
('acidity', '와인같은', 'wine-like', 4, '와인을 연상시키는 복합적 산미', 5),
('acidity', '시트러스', 'citrus', 4, '감귤류 같은 밝은 산미', 6),
('acidity', '사과같은', 'apple-like', 3, '사과 같은 상큼한 산미', 7),
('acidity', '레몬같은', 'lemon-like', 4, '레몬 같은 강한 산미', 8),

-- 단맛 (Sweetness)
('sweetness', '달콤한', 'sweet', 4, '전반적으로 달콤한 느낌', 1),
('sweetness', '은은한', 'subtle', 2, '은은하고 부드러운 단맛', 2),
('sweetness', '꿀같은', 'honey-like', 4, '꿀 같은 진한 단맛', 3),
('sweetness', '과일단맛', 'fruity sweetness', 3, '과일 같은 자연스러운 단맛', 4),
('sweetness', '캐러멜같은', 'caramel-like', 4, '캐러멜 같은 깊은 단맛', 5),
('sweetness', '초콜릿같은', 'chocolate-like', 4, '초콜릿 같은 풍부한 단맛', 6),
('sweetness', '바닐라같은', 'vanilla-like', 3, '바닐라 같은 크리미한 단맛', 7),

-- 쓴맛 (Bitterness)
('bitterness', '깔끔한', 'clean', 2, '깔끔하고 상쾌한 쓴맛', 1),
('bitterness', '진한', 'intense', 4, '강하고 진한 쓴맛', 2),
('bitterness', '부드러운', 'smooth', 2, '부드럽고 온화한 쓴맛', 3),
('bitterness', '다크초콜릿같은', 'dark chocolate-like', 4, '다크초콜릿 같은 깊은 쓴맛', 4),
('bitterness', '허브같은', 'herbal', 3, '허브 같은 자연스러운 쓴맛', 5),

-- 바디 (Body)
('body', '가벼운', 'light', 2, '가볍고 물 같은 질감', 1),
('body', '중간', 'medium', 3, '적당한 무게감', 2),
('body', '무거운', 'heavy', 4, '묵직하고 진한 질감', 3),
('body', '크리미한', 'creamy', 4, '크림 같은 부드러운 질감', 4),
('body', '실키한', 'silky', 4, '비단 같은 매끄러운 질감', 5),
('body', '벨벳같은', 'velvety', 5, '벨벳 같은 풍부한 질감', 6),
('body', '오일리한', 'oily', 3, '기름기가 느껴지는 질감', 7),

-- 향 (Aroma)
('aroma', '향긋한', 'fragrant', 4, '향긋하고 기분 좋은 향', 1),
('aroma', '진한', 'intense', 4, '강하고 진한 향', 2),
('aroma', '은은한', 'subtle', 2, '은은하고 부드러운 향', 3),
('aroma', '꽃향기', 'floral', 3, '꽃 같은 우아한 향', 4),
('aroma', '과일향', 'fruity', 3, '과일 같은 상큼한 향', 5),
('aroma', '견과류향', 'nutty', 3, '견과류 같은 고소한 향', 6),
('aroma', '초콜릿향', 'chocolate', 4, '초콜릿 같은 달콤한 향', 7),

-- 여운 (Finish)
('finish', '긴', 'long', 4, '오래 지속되는 여운', 1),
('finish', '짧은', 'short', 2, '빠르게 사라지는 여운', 2),
('finish', '깔끔한', 'clean', 3, '깔끔하고 상쾌한 여운', 3),
('finish', '부드러운', 'smooth', 3, '부드럽고 온화한 여운', 4),
('finish', '달콤한', 'sweet', 3, '달콤하게 마무리되는 여운', 5),
('finish', '쌉싸름한', 'bitter', 3, '쌉싸름하게 마무리되는 여운', 6),
('finish', '복합적인', 'complex', 4, '복잡하고 변화하는 여운', 7);