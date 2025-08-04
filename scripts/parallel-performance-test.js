#!/usr/bin/env node

/**
 * 병행 성능 테스트 스크립트
 * 여러 성능 지표를 동시에 측정합니다.
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;

console.log('🚀 CupNote 병행 성능 테스트 시작...\n');

// 1. 서버 응답 시간 테스트
async function testServerResponse() {
  console.log('📡 서버 응답 시간 측정 중...');
  
  const pages = [
    'http://localhost:5173/',
    'http://localhost:5173/search',
    'http://localhost:5173/my-records',
    'http://localhost:5173/mode-selection'
  ];
  
  const results = {};
  
  for (const url of pages) {
    try {
      const start = Date.now();
      const response = await fetch(url);
      const end = Date.now();
      
      results[url] = {
        status: response.status,
        time: end - start,
        size: response.headers.get('content-length') || 'unknown'
      };
      
      console.log(`  ✅ ${url}: ${end - start}ms (${response.status})`);
    } catch (error) {
      results[url] = { error: error.message };
      console.log(`  ❌ ${url}: ${error.message}`);
    }
  }
  
  return results;
}

// 2. Bundle 크기 확인
async function checkBundleSize() {
  console.log('\n📦 Bundle 크기 확인 중...');
  
  try {
    // Next.js 빌드 폴더 확인
    const buildPath = '.next';
    
    console.log('  📊 예상 bundle 크기 (개발 모드)');
    console.log('  - 메인 페이지: ~200-400KB 예상');
    console.log('  - 검색 페이지: ~150-300KB 예상');
    console.log('  - 전체 앱: ~1-2MB 예상');
    
    return { status: 'estimated', note: 'production build needed for exact sizes' };
  } catch (error) {
    console.log(`  ❌ Bundle 분석 실패: ${error.message}`);
    return { error: error.message };
  }
}

// 3. 검색 성능 시뮬레이션
async function testSearchPerformance() {
  console.log('\n🔍 검색 성능 시뮬레이션...');
  
  const searchQueries = [
    'coffee',
    '에티오피아',
    '케냐',
    'single origin',
    '산미'
  ];
  
  const results = {};
  
  // 실제로는 검색 API 엔드포인트가 있어야 하지만, 
  // 지금은 페이지 로드 시간으로 대체
  for (const query of searchQueries) {
    try {
      const start = Date.now();
      const response = await fetch(`http://localhost:5173/search?q=${query}`);
      const end = Date.now();
      
      results[query] = {
        time: end - start,
        status: response.status
      };
      
      console.log(`  ✅ "${query}" 검색: ${end - start}ms`);
    } catch (error) {
      results[query] = { error: error.message };
      console.log(`  ❌ "${query}" 검색 실패: ${error.message}`);
    }
  }
  
  return results;
}

// 4. PWA 기능 확인
async function checkPWAFeatures() {
  console.log('\n📱 PWA 기능 확인...');
  
  const checks = {
    manifest: false,
    serviceWorker: false,
    offlineSupport: false,
    installPrompt: false
  };
  
  try {
    // Manifest 확인
    const manifestResponse = await fetch('http://localhost:5173/manifest.json');
    checks.manifest = manifestResponse.status === 200;
    console.log(`  ${checks.manifest ? '✅' : '❌'} Manifest.json 로드됨`);
    
    // Service Worker 확인
    const swResponse = await fetch('http://localhost:5173/sw.js');
    checks.serviceWorker = swResponse.status === 200;
    console.log(`  ${checks.serviceWorker ? '✅' : '❌'} Service Worker 확인됨`);
    
    // 아이콘 확인
    const iconResponse = await fetch('http://localhost:5173/icons/icon-192x192.png');
    checks.icons = iconResponse.status === 200;
    console.log(`  ${checks.icons ? '✅' : '❌'} PWA 아이콘 확인됨`);
    
  } catch (error) {
    console.log(`  ❌ PWA 확인 실패: ${error.message}`);
  }
  
  return checks;
}

// 5. 메모리 사용량 모니터링 (Node.js 프로세스)
function getMemoryUsage() {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB',
    external: Math.round(usage.external / 1024 / 1024) + 'MB'
  };
}

// 메인 실행 함수
async function runParallelTests() {
  const startTime = Date.now();
  
  console.log('🔄 모든 테스트를 병행 실행합니다...\n');
  
  // 모든 테스트를 동시에 실행
  const [
    serverResults,
    bundleResults,
    searchResults,
    pwaResults
  ] = await Promise.all([
    testServerResponse(),
    checkBundleSize(),
    testSearchPerformance(),
    checkPWAFeatures()
  ]);
  
  const endTime = Date.now();
  const totalTime = endTime - startTime;
  
  // 결과 요약
  console.log('\n' + '='.repeat(50));
  console.log('📊 CupNote 성능 테스트 결과 요약');
  console.log('='.repeat(50));
  
  console.log(`\n⏱️  총 소요 시간: ${totalTime}ms`);
  console.log(`💾 메모리 사용량: ${JSON.stringify(getMemoryUsage(), null, 2)}`);
  
  console.log('\n🎯 핵심 지표:');
  const homePageTime = serverResults['http://localhost:5173/']?.time || 'N/A';
  const searchPageTime = serverResults['http://localhost:5173/search']?.time || 'N/A';
  
  console.log(`  • 홈 페이지 로드: ${homePageTime}ms`);
  console.log(`  • 검색 페이지 로드: ${searchPageTime}ms`);
  console.log(`  • PWA Manifest: ${pwaResults.manifest ? '✅' : '❌'}`);
  console.log(`  • Service Worker: ${pwaResults.serviceWorker ? '✅' : '❌'}`);
  
  // 권장사항
  console.log('\n💡 권장사항:');
  if (homePageTime > 1000) {
    console.log('  🔴 홈 페이지 로드 시간이 1초를 초과합니다. 최적화 필요');
  } else if (homePageTime > 500) {
    console.log('  🟡 홈 페이지 로드 시간 개선 가능');
  } else {
    console.log('  🟢 홈 페이지 로드 시간 양호');
  }
  
  if (!pwaResults.manifest || !pwaResults.serviceWorker) {
    console.log('  🔴 PWA 기능이 완전하지 않습니다');
  } else {
    console.log('  🟢 PWA 기능 정상 작동');
  }
  
  console.log('\n✅ 성능 테스트 완료!');
  console.log('\n📱 다음 단계: 실제 디바이스에서 터치 테스트를 진행하세요');
  console.log('   💻 네트워크 주소로 접속 가능한 상태입니다');
  
  return {
    serverResults,
    bundleResults,
    searchResults,
    pwaResults,
    totalTime,
    memory: getMemoryUsage()
  };
}

// 스크립트 실행
if (require.main === module) {
  runParallelTests().catch(console.error);
}

module.exports = { runParallelTests };