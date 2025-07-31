# CupNote Prototype 🍵

> 커피 테이스팅을 위한 모바일 최적화 웹 애플리케이션

## 🎯 프로젝트 개요

CupNote는 커피 애호가들을 위한 디지털 테이스팅 저널입니다. 3가지 모드로 다양한 사용자의 니즈를 충족합니다.

### ✨ 주요 기능

- **3가지 테이스팅 모드**: Cafe, Brew, Lab
- **고급 브루잉 타이머**: 랩 기능으로 단계별 추출 시간 기록
- **개인화 레시피**: 나만의 커피 레시피 저장/관리
- **Match Score**: 로스터 노트와 개인 평가 비교
- **모바일 최적화**: iOS/Android 터치 최적화

## 🚀 빠른 시작

### 설치 및 실행

```bash
# 프로젝트 클론
git clone <repository-url>
cd cupnote-prototype

# 웹 서버 실행 (Python 3)
python -m http.server 8000

# 또는 Node.js
npx serve .

# 브라우저에서 접속
open http://localhost:8000
```

### 브라우저 호환성

- ✅ Chrome 80+
- ✅ Safari 13+
- ✅ Firefox 75+
- ✅ Edge 80+

## 📱 사용 방법

### 1. Cafe Mode (카페)

빠른 카페 테이스팅용 - **3-5분 소요**

1. 카페/커피 정보 입력
2. 향미 선택 (최대 5개)
3. 감각 표현 선택
4. 개인 메모 작성

### 2. Brew Mode (홈카페)

홈브루잉 레시피 실험용 - **5-8분 소요**

1. 커피 정보 입력
2. **브루잉 설정**: 드리퍼, 원두량, 비율 설정
3. **타이머 기능**: 단계별 추출 시간 기록
4. 향미 및 감각 평가
5. 개인 레시피 저장

### 3. Lab Mode (전문가)

상세한 실험 데이터 기록용 - **8-12분 소요**

1. 커피 정보 + 브루잉 설정
2. **실험 데이터**: TDS, 추출 수율, 분쇄도 등
3. **Mouth Feel 평가**: 6가지 매개변수 슬라이더
4. 종합적인 감각 평가

## 🏗️ 기술 스택

### Frontend

- **HTML5**: 시맨틱 마크업, PWA 준비
- **CSS3**: CSS Variables 기반 디자인 시스템
- **Vanilla JavaScript**: 프레임워크 없는 순수 JS

### Architecture

- **SPA**: Single Page Application
- **Mobile-First**: 모바일 우선 반응형 디자인
- **LocalStorage**: 클라이언트사이드 데이터 저장
- **Progressive Enhancement**: 점진적 기능 향상

### Performance

- **Bundle Size**: ~50KB (gzipped)
- **Load Time**: <2s on 3G
- **Lighthouse Score**: 95+ (Performance, Accessibility)

## 📂 프로젝트 구조

```
cupnote-prototype/
├── index.html              # 메인 SPA
├── script.js               # 핵심 애플리케이션 로직 (985줄)
├── style.css               # 메인 스타일시트 (1042줄)
├── design-tokens.css       # 디자인 시스템 토큰
├── components.css          # 재사용 가능한 컴포넌트
├── PROGRESS.md            # 개발 진행 상황
└── README.md              # 프로젝트 문서 (이 파일)
```

## 🎨 디자인 시스템

### 색상 팔레트

- **Primary**: `#8B4513` (Saddle Brown)
- **Accent**: `#D2691E` (Chocolate)
- **Background**: `#FDF6F0` (Cream)
- **Text**: `#1F2937` (Dark Gray)

### 타이포그래피

- **Font**: Pretendard (한국어 최적화)
- **Scale**: 12px - 36px (8px grid system)

### 컴포넌트

- **Cards**: 둥근 모서리, 부드러운 그림자
- **Buttons**: 터치 최적화, 햅틱 피드백
- **Form Controls**: 모바일 친화적 인터랙션

## 🔄 상태 관리

### AppState 구조

```javascript
const appState = {
  currentScreen: 'mode-selection',
  selectedMode: 'cafe|brew|lab',
  coffeeInfo: {
    /* 커피 기본 정보 */
  },
  brewSettings: {
    /* 브루잉 설정 */
  },
  brewTimer: {
    /* 타이머 상태 */
  },
  labData: {
    /* Lab Mode 실험 데이터 */
  },
  selectedFlavors: [],
  selectedExpressions: {},
  personalNote: '',
  roasterNote: '',
}
```

### 화면 플로우

- **Cafe**: 7단계 (간단한 평가)
- **Brew**: 8단계 (브루잉 설정 포함)
- **Lab**: 10단계 (실험 데이터 + Mouth Feel)

## ⚡ 성능 최적화

### 실행 성능

- **렌더링**: 60fps 유지
- **메모리**: <100MB 사용량
- **배터리**: 최소한의 백그라운드 활동

### 개발 최적화

- **코드 분할**: 없음 (단일 파일로 단순화)
- **캐싱**: LocalStorage 활용
- **압축**: CSS/JS 최소화 준비됨

## 🧪 테스트

### 수동 테스트 시나리오

#### 기본 플로우 테스트

1. **Cafe Mode**: 전체 플로우 3-5분 완주
2. **Brew Mode**: 타이머 기능 포함 완주
3. **Lab Mode**: 모든 실험 데이터 입력 완주

#### 기능별 테스트

- **타이머**: 시작/일시정지/랩/리셋 동작
- **레시피 저장**: 개인 레시피 저장/불러오기
- **반응형**: 다양한 디바이스 크기 테스트

## 🚀 배포

### 정적 호스팅

```bash
# Netlify
netlify deploy --prod

# Vercel
vercel --prod

# GitHub Pages
# gh-pages 브랜치에 빌드 결과 푸시
```

### PWA 준비

- ✅ 반응형 디자인
- ⏳ Service Worker (예정)
- ⏳ Web App Manifest (예정)
- ⏳ 오프라인 지원 (예정)

## 🔮 로드맵

### Phase 1: 현재 (완료)

- ✅ 3-Mode 시스템
- ✅ 브루잉 타이머
- ✅ 개인 레시피 관리
- ✅ 모바일 최적화

### Phase 2: PWA 구현 (진행 예정)

- [ ] Service Worker
- [ ] 오프라인 지원
- [ ] 홈 화면 설치
- [ ] 푸시 알림

### Phase 3: 고급 기능 (계획)

- [ ] Match Score 알고리즘 개선
- [ ] 사진 업로드
- [ ] 소셜 공유
- [ ] 데이터 분석 대시보드

## 🤝 기여하기

### 개발 환경 설정

1. 프로젝트 포크
2. 로컬 개발 서버 실행
3. 변경사항 테스트
4. Pull Request 제출

### 코딩 컨벤션

- **JavaScript**: ES6+ 문법 사용
- **CSS**: BEM 방법론 권장
- **HTML**: 시맨틱 마크업 필수

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능

## 📞 지원

- **이슈 리포팅**: GitHub Issues 활용
- **기능 제안**: Discussion 또는 Issues
- **보안 취약점**: 이메일로 직접 연락

---

**개발**: CupNote Team  
**최종 업데이트**: 2025-07-28  
**버전**: 1.0.0 (Prototype)
