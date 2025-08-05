# 커피 라벨 ML 학습 도구 기획서

## 1. 개요

### 1.1 목적
- 커피 라벨 이미지를 수집하고 라벨링하여 ML 모델을 학습시키기 위한 로컬 도구
- 수동으로 정확한 학습 데이터를 구축하여 향후 자동 라벨 인식 기능 개발

### 1.2 핵심 기능
- 이미지 업로드 및 관리
- 수동 라벨링 인터페이스
- 학습 데이터 구축 및 관리
- ML 모델 학습 및 테스트

## 2. 기술 스택

### 2.1 Frontend
- **Framework**: Next.js (로컬 개발 서버)
- **UI**: Tailwind CSS + shadcn/ui
- **이미지 처리**: Canvas API, react-image-crop
- **상태관리**: React Context + LocalStorage

### 2.2 Backend
- **Runtime**: Node.js
- **Database**: SQLite (로컬 DB)
- **File Storage**: 로컬 파일 시스템
- **Queue**: Bull (백그라운드 작업)

### 2.3 ML/AI
- **OCR**: Tesseract.js (초기 텍스트 추출)
- **ML Framework**: TensorFlow.js
- **이미지 처리**: Sharp
- **데이터 형식**: JSON + CSV export

## 3. 주요 기능 상세

### 3.1 이미지 업로드
```
- 드래그 앤 드롭 지원
- 멀티 파일 업로드
- 지원 형식: JPG, PNG, WEBP
- 이미지 미리보기
- 자동 크기 조정 (최대 2048px)
```

### 3.2 라벨링 인터페이스
```
입력 필드:
- 커피명 (필수)
- 로스터리 (필수)
- 원산지
- 품종
- 가공방식
- 로스팅 레벨
- 테이스팅 노트 (태그 형식)
- 가격
- 용량

추가 기능:
- Bounding Box 그리기 (텍스트 영역 표시)
- OCR 결과 미리보기
- 자동 완성 (기존 데이터 기반)
```

### 3.3 데이터 관리
```
- 라벨링 진행 상황 대시보드
- 데이터 검색 및 필터링
- 중복 확인
- 데이터 수정/삭제
- Export (JSON, CSV)
```

### 3.4 학습 파이프라인
```
1. 데이터 전처리
   - 이미지 정규화
   - 텍스트 영역 추출
   - 데이터 증강

2. 모델 학습
   - 텍스트 검출 모델
   - 텍스트 인식 모델
   - 필드 분류 모델

3. 평가 및 테스트
   - 정확도 측정
   - 혼동 행렬
   - 실패 케이스 분석
```

## 4. UI/UX 설계

### 4.1 메인 화면
```
+------------------+------------------+
|   이미지 업로드   |   라벨링 큐      |
|   (Drag & Drop)  |   - 대기중: 150  |
|                  |   - 완료: 45     |
+------------------+------------------+
|          최근 라벨링 목록            |
| [이미지] [이미지] [이미지] [이미지]   |
+------------------------------------+
```

### 4.2 라벨링 화면
```
+------------------+------------------+
|                  |   라벨 입력      |
|   이미지 뷰어    |   커피명: [____] |
|   (Bbox 도구)    |   로스터리:[___] |
|                  |   원산지: [____] |
|                  |   ...           |
+------------------+------------------+
|   OCR 결과       |   저장 | 다음    |
+------------------+------------------+
```

## 5. 데이터 스키마

### 5.1 라벨 데이터
```typescript
interface CoffeeLabelData {
  id: string
  imageUrl: string
  imagePath: string
  uploadedAt: Date
  labeledAt?: Date
  labeledBy?: string
  
  // 라벨 정보
  coffeeName: string
  roastery: string
  origin?: string
  variety?: string
  processing?: string
  roastLevel?: string
  tastingNotes?: string[]
  price?: number
  weight?: string
  
  // 바운딩 박스
  boundingBoxes?: {
    field: string
    x: number
    y: number
    width: number
    height: number
    text: string
  }[]
  
  // OCR 결과
  ocrResult?: {
    fullText: string
    confidence: number
    blocks: any[]
  }
  
  // 검증 상태
  verified: boolean
  notes?: string
}
```

### 5.2 학습 데이터
```typescript
interface TrainingData {
  version: string
  createdAt: Date
  totalImages: number
  labeledImages: number
  
  stats: {
    roasteries: { [key: string]: number }
    origins: { [key: string]: number }
    avgConfidence: number
  }
  
  data: CoffeeLabelData[]
}
```

## 6. 개발 로드맵

### Phase 1: 기본 도구 구축 (1주)
- [ ] 프로젝트 셋업
- [ ] 이미지 업로드 기능
- [ ] 기본 라벨링 UI
- [ ] 로컬 저장소

### Phase 2: 라벨링 기능 고도화 (1주)
- [ ] Bounding Box 도구
- [ ] OCR 통합
- [ ] 자동완성
- [ ] 데이터 관리

### Phase 3: ML 파이프라인 (2주)
- [ ] 데이터 전처리
- [ ] 모델 아키텍처 설계
- [ ] 학습 인터페이스
- [ ] 평가 도구

### Phase 4: 통합 및 최적화 (1주)
- [ ] 성능 최적화
- [ ] 배치 처리
- [ ] Export 기능
- [ ] CupNote 통합 준비

## 7. 기대 효과

1. **정확한 학습 데이터**: 수동 라벨링으로 고품질 데이터셋 구축
2. **효율적인 워크플로우**: 체계적인 라벨링 프로세스
3. **ML 모델 개발**: 실제 서비스 적용 가능한 모델
4. **확장성**: 다양한 라벨 형식 학습 가능

## 8. 참고 사항

- 초기에는 한국 로스터리 위주로 데이터 수집
- 최소 1,000장 이상의 라벨 이미지 목표
- 다양한 라벨 디자인 패턴 포함 필요
- 향후 크라우드소싱 가능성 고려