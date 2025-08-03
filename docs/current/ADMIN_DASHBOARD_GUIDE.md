# Admin Dashboard Guide

## Overview

CupNote Admin Dashboard는 시스템 전체를 관리하고 모니터링하는 통합 관리 플랫폼입니다.

**버전**: v1.2.0  
**최종 업데이트**: 2025-08-03

## 주요 기능

### 1. 시스템 모니터링
- 실시간 사용자 활동 추적
- 서버 성능 메트릭
- 에러 로그 및 알림
- 시스템 상태 대시보드

### 2. 데이터 관리
- **카페/로스터리 데이터**
  - CSV 업로드/다운로드
  - 데이터 크롤링
  - CRUD 작업
- **커피 원두 데이터**
  - CSV 임포트/익스포트
  - 사용자 기록 동기화
  - 로스터리별 필터링

### 3. 사용자 관리
- 사용자 목록 및 상태
- 활동 이력 추적
- 권한 관리
- 계정 활성화/비활성화

### 4. 피드백 시스템
- 베타 피드백 수집
- 버그 리포트 관리
- 사용자 문의 처리
- 피드백 통계 분석

## 접근 방법

### URL 구조
```
/admin                  # 메인 대시보드
/admin/users           # 사용자 관리
/admin/records         # 커피 기록 관리
/admin/data/cafes      # 카페/로스터리 데이터
/admin/data/coffees    # 커피 원두 데이터
/admin/performance     # 성능 모니터링
/admin/feedback        # 피드백 관리
/admin/settings        # 시스템 설정
```

### 권한 체크
```typescript
// AdminLayout에서 권한 확인
const checkAdminAccess = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  // Admin role 확인 로직
}
```

## 데이터 관리 워크플로우

### CSV 업로드 프로세스

1. **파일 준비**
   ```csv
   이름,타입,주소,도시,전화번호,웹사이트
   프릳츠 커피,둘다,서울 마포구,서울,02-1234-5678,https://fritz.coffee
   ```

2. **업로드**
   - "CSV 업로드" 버튼 클릭
   - 파일 선택
   - 자동 검증 및 처리

3. **결과 확인**
   - 성공/실패 메시지
   - 에러 상세 내용
   - 데이터 새로고침

### 사용자 기록 동기화

```typescript
// 사용자 기록에서 커피 정보 추출
const syncFromUserRecords = async () => {
  const result = await batchSyncCoffeeInfoFromRecords()
  // 새로운 커피 정보 자동 추가
}
```

## 데이터베이스 구조

### 주요 테이블

```sql
-- 카페/로스터리
cafe_roasteries (
  id, name, type, address, city, 
  is_verified, is_active, ...
)

-- 커피 원두
coffees (
  id, name, roastery_id, origin_country,
  processing, roast_level, sca_score, ...
)

-- 연결 테이블
cafe_roastery_coffees (
  cafe_roastery_id, coffee_id, 
  is_signature, is_seasonal
)

-- 변경 로그
data_update_logs (
  entity_type, entity_id, action, 
  changes, user_id, source
)
```

## 통계 및 분석

### 대시보드 메트릭

- **사용자 통계**
  - 총 사용자 수
  - 활성 사용자 (7일/30일)
  - 신규 가입자 추이

- **콘텐츠 통계**
  - 총 기록 수
  - 모드별 사용량
  - 평균 평점

- **성능 지표**
  - 평균 응답 시간
  - API 호출 수
  - 에러 발생률

## 보안 고려사항

### 접근 제어
- Admin role 기반 인증
- Session 기반 권한 확인
- API 레벨 보안

### 데이터 보호
- RLS (Row Level Security) 정책
- 민감 정보 마스킹
- 감사 로그 기록

## 문제 해결

### 일반적인 이슈

1. **CSV 업로드 실패**
   - 인코딩 확인 (UTF-8)
   - 필수 필드 검증
   - 형식 일치 확인

2. **동기화 오류**
   - 네트워크 상태 확인
   - Supabase 연결 확인
   - 권한 검증

3. **성능 저하**
   - 캐시 정리
   - 인덱스 최적화
   - 쿼리 개선

## 모범 사례

### 데이터 관리
- 정기적인 백업
- 검증 후 업데이트
- 변경 이력 추적

### 모니터링
- 일일 체크리스트
- 알림 설정
- 정기 리포트

### 유지보수
- 정기 데이터 정리
- 로그 아카이빙
- 성능 최적화

## 관련 문서

- [Database Schema](./DATABASE_SCHEMA.md)
- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 업데이트 이력

- **v1.2.0** (2025-08-03): Admin Dashboard 완성
- **v1.1.0** (2025-08-02): Mobile UX 개선
- **v1.0.0** (2025-07-31): 초기 배포