#!/bin/bash

echo "🚀 Preparing for TestFlight deployment..."

# 1. 프로덕션 설정 사용
echo "📱 Switching to production configuration..."
cp capacitor.config.production.ts capacitor.config.ts

# 2. 프로덕션 빌드
echo "🏗️ Building production app..."
npm run build

# 3. iOS 동기화
echo "📲 Syncing iOS project..."
npx cap sync ios

# 4. 빌드 번호 증가
echo "🔢 Incrementing build number..."
CURRENT_BUILD=$(grep -o 'CFBundleVersion.*' ios/App/App/Info.plist | grep -o '[0-9]*')
NEW_BUILD=$((CURRENT_BUILD + 1))
sed -i '' "s/<string>$CURRENT_BUILD<\/string>/<string>$NEW_BUILD<\/string>/" ios/App/App/Info.plist

echo "✅ Ready for TestFlight!"
echo "📝 Current version: 1.5.0"
echo "📝 New build number: $NEW_BUILD"
echo ""
echo "Next steps:"
echo "1. Open Xcode: open ios/App/App.xcworkspace"
echo "2. Select 'Any iOS Device (arm64)'"
echo "3. Product → Archive"
echo "4. Distribute App → App Store Connect → Upload"