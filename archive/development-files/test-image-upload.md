# 이미지 업로드 기능 테스트 가이드

## 구현 완료 사항

### 1. Supabase 이미지 서비스 (`src/lib/supabase-image-service.ts`)
- ✅ 파일 업로드 및 압축 기능
- ✅ 이미지 검증 (크기, 형식)
- ✅ 썸네일 URL 생성
- ✅ 프로그레스 트래킹

### 2. ImageUpload 컴포넌트 (`src/components/ImageUpload.tsx`)
- ✅ 카메라/갤러리 선택 UI
- ✅ 미리보기 기능
- ✅ 업로드 진행률 표시
- ✅ 이미지 삭제 기능

### 3. 데이터베이스 마이그레이션
- ✅ image_url, thumbnail_url, additional_images 컬럼 추가
- ✅ Supabase Storage 버킷 설정

### 4. UI 통합
- ✅ Step 3: 이미지 업로드 필드 추가
- ✅ Step 4: 업로드된 이미지 미리보기
- ✅ CoffeeList: 카드에 이미지 표시
- ✅ CoffeeDetail: 상세 페이지에 이미지 갤러리

## 테스트 절차

1. **새 기록 생성 테스트**
   - /mode-selection 접속
   - 모드 선택 후 기록 시작
   - Step 3에서 이미지 업로드 버튼 확인
   - 이미지 선택 및 업로드
   - Step 4에서 미리보기 확인
   - 저장 후 결과 확인

2. **목록 페이지 확인**
   - 홈 화면의 커피 카드에 이미지 표시 확인
   - 이미지가 있는 카드의 레이아웃 확인

3. **상세 페이지 확인**
   - 커피 카드 클릭하여 상세 페이지 이동
   - 기본 정보 섹션의 사진 갤러리 확인
   - 이미지 클릭 시 새 탭에서 원본 열림

## 주의사항

- Supabase Storage 설정이 필요합니다
- 이미지는 5MB 이하로 제한됩니다
- 지원 형식: JPEG, PNG, WebP
- 자동 압축: 1920x1920 최대 크기