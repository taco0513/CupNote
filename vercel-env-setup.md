# Vercel 환경 변수 설정 가이드

## Google Vision API 설정

### 1. Google Cloud Console 설정 확인
1. https://console.cloud.google.com 접속
2. 프로젝트: `mycupnote` 선택
3. APIs & Services → Library
4. "Cloud Vision API" 검색 후 활성화 확인

### 2. 서비스 계정 정보
- **Service Account**: cupnote-ocr@mycupnote.iam.gserviceaccount.com
- **Project ID**: mycupnote
- **Key ID**: 3b278293ac8c52811914375b3bf7ffabf76656c8

### 3. Vercel 환경 변수 설정

Vercel 대시보드에서 다음 환경 변수 추가:

#### 방법 1: JSON 키 직접 입력 (권장)
1. https://vercel.com/dashboard → CupNote 프로젝트
2. Settings → Environment Variables
3. 다음 변수 추가:

**변수 이름**: `GOOGLE_VISION_CREDENTIALS`
**값**: (google-vision-key.json 파일의 전체 내용을 한 줄로)
```json
{"type":"service_account","project_id":"mycupnote","private_key_id":"YOUR_PRIVATE_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"cupnote-ocr@mycupnote.iam.gserviceaccount.com","client_id":"YOUR_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/cupnote-ocr%40mycupnote.iam.gserviceaccount.com","universe_domain":"googleapis.com"}
```

#### 방법 2: 개별 환경 변수 (대안)
각 키를 개별 환경 변수로 설정:
- `GOOGLE_PROJECT_ID`: mycupnote
- `GOOGLE_CLIENT_EMAIL`: cupnote-ocr@mycupnote.iam.gserviceaccount.com
- `GOOGLE_PRIVATE_KEY`: (private key 내용)

### 4. 배포 확인
```bash
git add -A
git commit -m "feat: Add Google Vision OCR API endpoint"
git push origin main
```

### 5. 테스트
배포 후 다음 URL에서 OCR 기능 테스트:
- https://mycupnote.com/tasting-flow/cafe/coffee-info

### 주의사항
- Private Key는 절대 GitHub에 커밋하지 마세요
- Vercel 환경 변수는 Production, Preview, Development 환경에 모두 적용하세요
- JSON 문자열로 저장할 때 줄바꿈 문자(\n)가 올바르게 포함되었는지 확인하세요