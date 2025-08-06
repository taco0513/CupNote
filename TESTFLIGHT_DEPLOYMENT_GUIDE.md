# CupNote TestFlight Deployment Guide

## Current Status ✅
- ✅ **Version Updated**: Package.json → 1.5.0, iOS App → 1.5.0 (Build 5)
- ✅ **Web App Built**: Next.js production build completed successfully
- ✅ **iOS Sync Completed**: Capacitor sync with iOS project
- ✅ **Xcode Project Ready**: App.xcworkspace opened and ready for archiving

## Manual Steps to Complete in Xcode

### 1. Build and Archive (5 minutes)
1. **Select Device**: In Xcode, select "Any iOS Device" from the device dropdown
2. **Archive**: Go to `Product` → `Archive` 
3. **Wait**: Let Xcode build and archive (usually 2-3 minutes)
4. **Verify**: Check that archive completes successfully

### 2. Upload to App Store Connect (3 minutes)  
1. **Organizer**: Xcode Organizer window should open automatically
2. **Select Archive**: Choose the latest archive (1.5.0 build 5)
3. **Distribute App**: Click "Distribute App"
4. **Select**: Choose "App Store Connect"
5. **Upload**: Follow the wizard to upload
6. **Processing**: Wait for Apple to process (5-10 minutes)

### 3. Configure TestFlight (2 minutes)
1. **App Store Connect**: Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. **Select CupNote**: Navigate to your CupNote app
3. **TestFlight Tab**: Click on TestFlight
4. **New Build**: Your 1.5.0 (5) build should appear
5. **Add to Test**: Add build to testing
6. **What to Test**: Add release notes (see below)

### 4. Add Beta Testers
1. **Internal Testing**: Add internal testers (App Store Connect users)
2. **External Testing**: 
   - Create external testing group
   - Add tester emails
   - Submit for Beta App Review (if needed)

## Release Notes for TestFlight

```
CupNote v1.5.0 Beta - Community Match Score Fix

🎯 What's Fixed:
- First recorder now gets 100% match score (was showing 40%)
- Real community data replaces dummy data displays  
- Records now save properly to database and appear in "My Records"
- Achievement system properly triggers for new records

🔍 What to Test:
- Create your first tasting record and verify 100% match score
- Check "My Records" tab to confirm record appears
- View "성취" (Achievements) to see progress
- Try different tasting modes (Cafe vs HomeCafe)

Known Issues: None

Please report any bugs or feedback through the in-app feedback button.
```

## Key Information
- **App ID**: com.mycupnote.app
- **Bundle Version**: 1.5.0  
- **Build Number**: 5
- **Minimum iOS**: 14.0
- **Target**: iPhone only

## What's New in This Build
- ✅ Fixed first recorder 40% match score → now 100%
- ✅ Records save to database and sync with achievements
- ✅ Removed dummy community data displays
- ✅ Enhanced error handling and fallback systems
- ✅ Full system integration verified and tested

## Post-Upload Checklist
- [ ] Verify build appears in App Store Connect
- [ ] Add release notes in TestFlight  
- [ ] Invite beta testers
- [ ] Monitor crash reports and feedback
- [ ] Test key user flows work correctly

---

**Ready to ship! 🚀** All technical preparations are complete. Just need the manual Xcode steps above.