# Google Cloud Vision API 설정 가이드

CupNote의 OCR 기능을 위한 Google Cloud Vision API 설정 방법입니다.

## 1. Google Cloud Console 설정

### 1.1 프로젝트 생성/선택
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 프로젝트 선택 드롭다운 → "새 프로젝트"
3. 프로젝트 이름: "cupnote-ocr" (예시)
4. 프로젝트 생성

### 1.2 Vision API 활성화
1. 좌측 메뉴 → "API 및 서비스" → "라이브러리"
2. "Cloud Vision API" 검색
3. "사용" 버튼 클릭

### 1.3 서비스 계정 생성
1. 좌측 메뉴 → "API 및 서비스" → "사용자 인증 정보"
2. "+ 사용자 인증 정보 만들기" → "서비스 계정"
3. 서비스 계정 이름: "cupnote-ocr-service"
4. 역할: "기본" → "Cloud Vision API User"
5. "완료"

### 1.4 키 생성 및 다운로드
1. 생성된 서비스 계정 클릭
2. "키" 탭 → "키 추가" → "새 키 만들기"
3. JSON 형식 선택
4. 키 파일이 자동으로 다운로드됨

## 2. 프로젝트 설정

### 2.1 환경 변수 설정 (방법 1: 키 파일 경로)
```bash
# .env.local 파일에 추가
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
```

### 2.2 환경 변수 설정 (방법 2: 직접 입력)
```bash
# .env.local 파일에 추가
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_CLIENT_EMAIL=cupnote-ocr-service@your-project.iam.gserviceaccount.com
GOOGLE_CLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 2.3 Vercel 배포 시 환경 변수 설정
1. Vercel 대시보드 → Settings → Environment Variables
2. 위의 환경 변수들 추가
3. GOOGLE_CLOUD_PRIVATE_KEY는 줄바꿈을 \n으로 변환하여 한 줄로 입력

## 3. 사용량 및 비용

### 무료 한도 (월별)
- 첫 1,000개 이미지: 무료
- TEXT_DETECTION 기능 사용

### 유료 요금
- 1,001 ~ 5,000,000개: $1.50 per 1,000 images
- 5,000,001개 이상: $0.60 per 1,000 images

### 예상 사용량 (CupNote 기준)
- 일일 활성 사용자 100명 × 평균 2회 스캔 = 200회/일
- 월간: 6,000회
- 예상 비용: (6,000 - 1,000) × $1.50 / 1,000 = $7.50/월

## 4. 보안 주의사항

### ⚠️ 중요
1. **서비스 계정 키 파일을 절대 Git에 커밋하지 마세요**
2. `.gitignore`에 키 파일 경로 추가 확인
3. 키 파일은 안전한 장소에 보관
4. 프로덕션에서는 환경 변수 사용 권장

### 권한 최소화
- Vision API User 역할만 부여 (최소 권한 원칙)
- 필요시 추가 API 권한 부여

## 5. 테스트

### 로컬 테스트
```bash
# 환경 변수 설정 후
npm run dev

# 브라우저에서 테스트
# 1. 커피 정보 입력 페이지로 이동
# 2. "OCR 스캔" 버튼 클릭
# 3. 커피 백 이미지 업로드
# 4. 결과 확인
```

### API 직접 테스트
```bash
curl -X POST http://localhost:5173/api/ocr \
  -F "image=@/path/to/coffee-bag.jpg"
```

## 6. 모니터링

### Cloud Console에서 사용량 확인
1. [API 대시보드](https://console.cloud.google.com/apis/dashboard)
2. Cloud Vision API 클릭
3. 측정항목 탭에서 사용량 확인

### 할당량 설정
1. "할당량" 탭
2. 일일 한도 설정으로 비용 제어 가능

## 7. 문제 해결

### 자주 발생하는 오류

#### "The request is missing a valid API key"
- 환경 변수가 제대로 설정되었는지 확인
- 서버 재시작 필요

#### "Cloud Vision API has not been used in project"
- Vision API가 활성화되었는지 확인
- 프로젝트 ID가 올바른지 확인

#### "Permission denied"
- 서비스 계정에 Vision API User 역할이 있는지 확인
- 키 파일 경로가 올바른지 확인

## 8. 팔백 모드

Google Vision API가 설정되지 않았거나 오류가 발생하면 자동으로 시뮬레이션 모드로 전환됩니다.
- 개발 중에는 시뮬레이션 모드 사용 가능
- 프로덕션에서는 실제 API 사용 권장

## 참고 링크
- [Google Cloud Vision API 문서](https://cloud.google.com/vision/docs)
- [Node.js 클라이언트 라이브러리](https://cloud.google.com/vision/docs/libraries#client-libraries-install-nodejs)
- [가격 정책](https://cloud.google.com/vision/pricing)