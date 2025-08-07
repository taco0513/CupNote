#!/usr/bin/env node

/**
 * Static Build Script for Capacitor iOS App
 * Builds a simple static version of the app for offline use
 */

const fs = require('fs');
const path = require('path');

// Create static directory
const staticDir = path.join(__dirname, '..', 'ios-static');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Create a simple HTML file that redirects to the home page
const indexHTML = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>CupNote - 커피 기록 앱</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background: #FAF7F2;
      color: #1F170B;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }
    .logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 24px;
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 40px;
    }
    h1 {
      font-size: 28px;
      margin-bottom: 12px;
      font-weight: 700;
    }
    p {
      font-size: 16px;
      color: #666;
      margin-bottom: 32px;
      line-height: 1.5;
    }
    .button {
      background: linear-gradient(135deg, #8B4513 0%, #D2691E 100%);
      color: white;
      border: none;
      padding: 16px 32px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
      transition: transform 0.2s;
    }
    .button:active {
      transform: scale(0.98);
    }
    .loading {
      margin-top: 20px;
      color: #999;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">☕</div>
    <h1>CupNote</h1>
    <p>나만의 커피 이야기를 기록하세요</p>
    
    <div class="loading">앱을 시작하는 중...</div>
  </div>
  
  <script>
    // 로컬 개발 서버로 리다이렉트 (개발용)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      setTimeout(() => {
        window.location.href = 'http://localhost:5173';
      }, 1000);
    } else {
      // 프로덕션 환경에서는 온라인 상태 확인
      if (navigator.onLine) {
        // 온라인이면 프로덕션 서버로
        window.location.href = 'https://mycupnote.com';
      } else {
        // 오프라인이면 메시지 표시
        document.querySelector('.loading').innerHTML = 
          '인터넷 연결이 필요합니다.<br>연결 후 앱을 다시 시작해주세요.';
      }
    }
  </script>
</body>
</html>`;

// Write the HTML file
fs.writeFileSync(path.join(staticDir, 'index.html'), indexHTML);

console.log('✅ Static build created at:', staticDir);
console.log('📱 This is a simple static page that will redirect to the server.');
console.log('🔧 For full offline support, we need to implement service workers and caching.');