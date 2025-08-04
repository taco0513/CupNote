#!/usr/bin/env node

/**
 * PWA 아이콘 생성 스크립트
 * 원본 로고에서 필요한 모든 사이즈의 아이콘을 생성합니다.
 * 
 * 사용법: node scripts/generate-pwa-icons.js
 */

const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// 필요한 아이콘 사이즈 (PWA 표준)
const sizes = [
  72,   // 구형 Android
  96,   // Chrome Web Store
  128,  // Chrome Web Store
  144,  // Chrome for Android
  152,  // iOS Safari
  192,  // Chrome for Android
  384,  // Chrome for Android (high-res)
  512,  // Chrome for Android (high-res)
];

// Apple Touch Icons (iOS 특별 처리)
const appleSizes = [
  180,  // iPhone Retina
  152,  // iPad Retina
  120,  // iPhone Retina (구형)
];

async function generateIcons() {
  const inputPath = path.join(__dirname, '../public/cupnote-logo-original.png');
  const outputDir = path.join(__dirname, '../public/icons');
  
  try {
    // 출력 디렉토리 확인
    await fs.mkdir(outputDir, { recursive: true });
    
    // 원본 이미지 로드
    const originalImage = sharp(inputPath);
    const metadata = await originalImage.metadata();
    
    console.log(`✅ 원본 이미지 로드 완료: ${metadata.width}x${metadata.height}`);
    
    // 표준 PWA 아이콘 생성
    for (const size of sizes) {
      const outputPath = path.join(outputDir, `icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 248, b: 243, alpha: 1 } // #FFF8F3 배경
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 생성: icon-${size}x${size}.png`);
    }
    
    // Apple Touch Icons 생성
    for (const size of appleSizes) {
      const outputPath = path.join(outputDir, `apple-icon-${size}x${size}.png`);
      
      await sharp(inputPath)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 248, b: 243, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 생성: apple-icon-${size}x${size}.png`);
    }
    
    // Favicon 생성 (16x16, 32x32)
    await sharp(inputPath)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 248, b: 243, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-32x32.png'));
    
    await sharp(inputPath)
      .resize(16, 16, {
        fit: 'contain',
        background: { r: 255, g: 248, b: 243, alpha: 1 }
      })
      .png()
      .toFile(path.join(__dirname, '../public/favicon-16x16.png'));
    
    console.log('✅ Favicon 생성 완료');
    
    // Maskable icon 생성 (패딩 추가)
    for (const size of [192, 512]) {
      const outputPath = path.join(outputDir, `maskable-icon-${size}x${size}.png`);
      const padding = Math.floor(size * 0.1); // 10% 패딩
      
      await sharp(inputPath)
        .resize(size - padding * 2, size - padding * 2, {
          fit: 'contain',
          background: { r: 255, g: 248, b: 243, alpha: 1 }
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 248, b: 243, alpha: 1 }
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ 생성: maskable-icon-${size}x${size}.png`);
    }
    
    console.log('\n🎉 모든 PWA 아이콘 생성 완료!');
    
  } catch (error) {
    console.error('❌ 아이콘 생성 중 오류:', error);
    process.exit(1);
  }
}

// Sharp 설치 확인
async function checkDependencies() {
  try {
    require.resolve('sharp');
  } catch (e) {
    console.log('📦 Sharp 패키지 설치 중...');
    const { execSync } = require('child_process');
    execSync('npm install sharp', { stdio: 'inherit' });
  }
}

// 실행
(async () => {
  await checkDependencies();
  await generateIcons();
})();