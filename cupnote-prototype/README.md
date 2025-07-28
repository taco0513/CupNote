# CupNote HTML Prototype

30분 만에 만든 CupNote 프로토타입 - 한국어 커피 테이스팅 저널

## 🚀 실행 방법

1. 브라우저에서 `index.html` 파일 열기
2. 모바일 시뮬레이터 켜기: Chrome DevTools → Toggle device toolbar (Ctrl/Cmd + Shift + M)
3. iPhone 12 Pro 또는 Galaxy S20 프리셋 선택 권장

## 📱 구현된 기능

### 화면 구성
1. **모드 선택**: Cafe / HomeCafe / Lab 3가지 모드
2. **테이스팅 입력**: 기본 정보 + 한국어 감각 표현 선택
3. **결과 화면**: 선택한 표현 요약 + Match Score

### 핵심 기능
- ✅ 44개 한국어 감각 표현 (6개 카테고리)
- ✅ 카테고리별 최대 3개 선택 제한
- ✅ HOT/ICED 온도 선택
- ✅ 모바일 터치 최적화
- ✅ 화면 전환 애니메이션
- ✅ Achievement 팝업
- ✅ 공유 기능 (Web Share API)

## 🎨 디자인 특징

- **커피 테마 색상**: Saddle Brown (#8B4513) 메인
- **8px 그리드 시스템**: 일관된 간격
- **모바일 퍼스트**: 375px 기준 디자인
- **부드러운 전환**: 200-300ms 애니메이션

## 📂 파일 구조

```
cupnote-prototype/
├── index.html         # HTML 구조
├── design-tokens.css  # 디자인 토큰 시스템
├── components.css     # 재사용 컴포넌트
├── style.css         # 메인 스타일
└── script.js         # 인터랙션 로직
```

## 🔄 다음 단계

1. **HomeCafe Mode**: 다이얼 제어, 비율 프리셋 추가
2. **Lab Mode**: 슬라이더 평가, 차트 시각화
3. **데이터 저장**: LocalStorage 활용
4. **PWA 변환**: 오프라인 지원
5. **성능 최적화**: 이미지 lazy loading

## 💡 개선 아이디어

- 다크 모드 지원
- 사진 추가 기능
- 향미 휠 시각화
- 히스토리 기능
- 통계 대시보드

---

*30분 프로토타입으로 시작하는 CupNote의 여정*