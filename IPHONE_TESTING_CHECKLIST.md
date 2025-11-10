# iPhone Testing Checklist - JustDeen MyCompanion

**Build Status:** Building...
**Date:** November 10, 2025
**Completed:** Weeks 1-7 (27% complete)

---

## 🎯 What to Test

### 1. Authentication (Week 6-7) ✨ NEW
The app should now show the **LoginScreen** on first launch.

#### Apple Sign-In (iOS only)
- [ ] See "Continue with Apple" button (black background, white text)
- [ ] Tap the button
- [ ] System Apple Sign-In sheet appears
- [ ] Sign in with your Apple ID
- [ ] App navigates to main tabs
- [ ] Check if you stay logged in after closing and reopening the app

#### Google Sign-In
- [ ] See "Continue with Google" button (white background, dark text)
- [ ] Tap the button
- [ ] Google sign-in flow appears
- [ ] Sign in with your Google account
- [ ] App navigates to main tabs
- [ ] Check if you stay logged in after closing and reopening the app

#### Guest Mode
- [ ] See "Continue as Guest" button (transparent, text-only)
- [ ] Tap the button
- [ ] App immediately navigates to main tabs
- [ ] No authentication required

#### Error Handling
- [ ] Cancel sign-in - should show appropriate message
- [ ] Try signing in without internet - should show error alert

### 2. Navigation (Week 5) ✨ NEW
Once logged in, you should see **5-tab bottom navigation**.

#### Bottom Tabs
- [ ] **Pray Tab** - Purple color (#5856D6)
- [ ] **Read Tab** - Blue color (#007AFF)
- [ ] **Reflect Tab** - Orange color (#FF9500)
- [ ] **AI Tab** - Indigo color (#6366F1)
- [ ] **Settings Tab** - Green color (#34C759)

#### Tab Navigation
- [ ] Tap each tab - should navigate smoothly
- [ ] Tab icons highlight when selected
- [ ] Tab colors match WWDC design (purple, blue, orange, indigo, green)
- [ ] No crashes when switching tabs

### 3. Placeholder Screens (39 screens total)

#### Pray Tab Screens
- [ ] **Prayer Times Home** - Main screen (shows placeholder)
- [ ] **Qibla Compass** - Tap to navigate (placeholder)
- [ ] Check that header colors are purple

#### Read Tab Screens
- [ ] **Quran Home** - Main screen (placeholder)
- [ ] Navigate through: Quran Reader, Surah Details, Juz List
- [ ] Check that header colors are blue

#### Reflect Tab Screens
- [ ] **Reflect Home** - Main screen (placeholder)
- [ ] Navigate through: Duas, Hadith, Tasbih Counter
- [ ] Check that header colors are orange

#### AI Tab Screens
- [ ] **AI Chat Home** - Main screen (placeholder)
- [ ] Navigate to Chat History
- [ ] Check that header colors are indigo

#### Settings Tab Screens
- [ ] **Settings Home** - Main screen (placeholder)
- [ ] Navigate through: Theme, Profile, Language, About
- [ ] Check that header colors are green

### 4. Theme System (Week 2)

#### Light Mode
- [ ] Background is iOS system gray (#F2F2F7)
- [ ] Text is black with proper hierarchy
- [ ] Tab colors are vibrant and correct
- [ ] Buttons and cards have proper shadows

#### Dark Mode
- [ ] Toggle dark mode in iOS Settings → Display & Brightness
- [ ] Background is pure black (#000000) for OLED
- [ ] Text is white with proper hierarchy
- [ ] Tab colors are slightly brighter for visibility
- [ ] Buttons and cards adapt to dark mode

### 5. Prayer Context (Week 4)
The PrayerTimesHome screen should show:
- [ ] "Loading prayer times..." if fetching data
- [ ] Error message if location access denied
- [ ] Prayer times list if available (from cache or API)

### 6. Performance

#### App Launch
- [ ] Cold start takes less than 3 seconds
- [ ] No white flash or loading screens
- [ ] Smooth animation into main tabs

#### Navigation Performance
- [ ] Tab switching is instant
- [ ] Screen transitions are smooth (60fps)
- [ ] No lag when opening drawers or modals
- [ ] Back button works correctly

#### Memory Usage
- [ ] App doesn't crash after extended use
- [ ] Switching between tabs multiple times doesn't slow down
- [ ] Opening all screens doesn't cause memory issues

### 7. Logout & Re-authentication

#### Logout Flow
- [ ] Go to Welcome screen (from any tab)
- [ ] Tap "Log Out" button in header
- [ ] Should return to LoginScreen
- [ ] Previous user data cleared

#### Re-login
- [ ] Login again with same method
- [ ] Should see same tabs and navigation
- [ ] No errors or crashes

---

## 🐛 Known Issues / Expected Behavior

### Placeholders
- **All 39 screens are placeholders** showing text like:
  - "This screen will be implemented in Week X"
  - No actual functionality yet (Quran, Prayer Times, etc.)

### Authentication Backend
- **Backend API is not deployed yet**
  - Authentication will fail to connect to Cloudflare D1
  - This is expected - backend will be deployed later
  - Guest mode should work without backend

### Missing Features (Not Yet Implemented)
- ⏳ Prayer times calculation (Week 8-10)
- ⏳ Qibla compass (Week 11)
- ⏳ Quran reading (Week 12-15)
- ⏳ Duas and Hadith (Week 16-17)
- ⏳ AI Chatbot (Week 20-21)

---

## ✅ What Should Work Perfectly

1. **Authentication UI** - All 3 sign-in buttons display correctly
2. **5-Tab Navigation** - All tabs accessible and colored correctly
3. **39 Placeholder Screens** - All screens can be navigated to
4. **Theme System** - Light/Dark mode works flawlessly
5. **TypeScript** - No runtime errors (0 compilation errors)
6. **Navigation Flow** - Smooth transitions between screens
7. **Persistent Auth** - User stays logged in after app restart
8. **iOS HIG Design** - Matches Apple's design guidelines

---

## 📝 Report Issues

If you encounter any issues, note:
1. **What you were doing** (which screen, which button)
2. **What happened** (error message, crash, wrong behavior)
3. **What you expected** (correct behavior)
4. **Screenshots** (if possible)

---

## 🚀 Next Steps After Testing

Once testing is complete:
- **Week 8-10:** Implement Prayer Times (CRITICAL feature)
- **Week 11:** Implement Qibla Compass (CRITICAL feature)
- **Week 12-15:** Implement Quran Reading (6,236 verses offline)

---

**Enjoy testing!** 🎉
