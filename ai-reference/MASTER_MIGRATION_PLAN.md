# Master Migration Plan: Flutter → React Native

**Project:** JustDeen MyCompanion
**Duration:** 20-26 weeks
**Start Date:** TBD
**Last Updated:** 2025-11-10

---

## 📊 Executive Summary

**Objective:** Migrate JustDeen Islamic Companion app from Flutter to React Native using Ignite boilerplate while maintaining exact UI/UX fidelity.

**Scope:**
- 48+ screens
- 127 features (35 P0, 49 P1, 25 P2, 18 P3)
- 5 main tabs with sub-navigation
- Prayer times (CRITICAL accuracy)
- Quran reading (6,236 verses offline)
- Qibla compass (CRITICAL accuracy)
- Community features
- Cloud backend migration (DynamoDB → Cloudflare D1)

**Success Criteria:**
- ✅ UI matches Flutter app exactly (WWDC design preserved)
- ✅ Prayer times accurate within ±1 minute
- ✅ Qibla direction accurate within ±1 degree
- ✅ App cold start < 2 seconds
- ✅ 100% offline Quran functionality
- ✅ All 35 P0 features complete
- ✅ Zero data loss during migration

---

## 🗓️ Timeline Overview

```
Phase 1: Foundation & Setup              [Weeks 1-3]   ████████░░░░░░░░░░░░░░░░ 12%
Phase 2: Core Architecture               [Weeks 4-5]   ████░░░░░░░░░░░░░░░░░░░░  8%
Phase 3: Authentication                  [Weeks 6-7]   ████░░░░░░░░░░░░░░░░░░░░  8%
Phase 4: Prayer Times (CRITICAL)         [Weeks 8-10]  ██████░░░░░░░░░░░░░░░░░░ 12%
Phase 5: Qibla Compass (CRITICAL)        [Week 11]     ██░░░░░░░░░░░░░░░░░░░░░░  4%
Phase 6: Quran Reading                   [Weeks 12-15] ████████░░░░░░░░░░░░░░░░ 16%
Phase 7: Islamic Content                 [Weeks 16-17] ████░░░░░░░░░░░░░░░░░░░░  8%
Phase 8: Community Features              [Weeks 18-19] ████░░░░░░░░░░░░░░░░░░░░  8%
Phase 9: Premium & Advanced              [Weeks 20-21] ████░░░░░░░░░░░░░░░░░░░░  8%
Phase 10: Testing, Polish & Deployment   [Weeks 22-26] ██████████░░░░░░░░░░░░░░ 20%
```

---

## 📋 Phase Breakdown

---

### **PHASE 1: Foundation & Setup (Weeks 1-3)** [P0]

**Goal:** Set up project foundation, theme system, and infrastructure

#### Week 1: Project Setup & Documentation ✅
**Status:** Complete
**Effort:** 40 hours

**Completed:**
- [x] Create `ai-reference/` documentation folder
- [x] Extract UI design system from Flutter app
- [x] Document functional requirements (127 features)
- [x] Document non-functional requirements (161 requirements)
- [x] Create screen comparison templates
- [x] Document architecture decisions
- [x] Design Cloudflare D1 database schemas
- [x] Create component mapping guide
- [x] Analyze Ignite boilerplate structure

**Deliverables:**
- ✅ 10 comprehensive documentation files
- ✅ Flutter UI design system extracted (colors, fonts, spacing)
- ✅ Master migration plan (this document)

---

#### Week 2: Theme Customization & Fonts
**Status:** Pending
**Effort:** 30 hours
**Priority:** P0

**Tasks:**
- [ ] **Update `app/theme/colors.ts`** with WWDC 5-tab colors
  - Pray tab: Purple (#5856D6)
  - Read tab: Blue (#007AFF)
  - Reflect tab: Orange (#FF9500)
  - AI tab: Indigo (#6366F1)
  - Settings tab: Green (#34C759)
  - System colors (iOS style backgrounds, text, separators)

- [ ] **Update `app/theme/colorsDark.ts`** with dark theme variants
  - Adjust all tab colors for dark mode
  - Pure black backgrounds (#000000)
  - Dark surface colors

- [ ] **Update `app/theme/typography.ts`**
  - Add SF Pro Text/Display fonts
  - Add Arabic fonts (Uthman, Jameel Noori Nastaleeq)
  - Implement iOS HIG typography scale (largeTitle → caption2)
  - Add Arabic-specific text styles (quranArabic, duaArabic)

- [ ] **Add font files to `assets/fonts/`**
  - Download Uthman font (Quranic text)
  - Download Jameel Noori Nastaleeq font (Islamic calligraphy)
  - Configure font loading in `app/theme/typography.ts`

- [ ] **Update `app/theme/spacing.ts`**
  - Keep existing 8pt grid (already good!)
  - Add component-specific spacing (screenHorizontal, cardPadding, etc.)

- [ ] **Update `app/theme/timing.ts`**
  - Add animation timings from UI_DESIGN_SYSTEM.md
  - fast: 200ms, normal: 300ms, slow: 400ms

- [ ] **Create `app/theme/shadows.ts`**
  - iOS-style subtle shadows (small, medium, large, card)
  - Android elevation values

- [ ] **Test theme system**
  - Verify light/dark mode switching
  - Test all tab colors display correctly
  - Test Arabic fonts render properly (RTL)

**Deliverables:**
- Theme files updated to match Flutter WWDC design exactly
- Arabic fonts installed and working
- Light/dark mode fully functional

**Acceptance Criteria:**
- Theme colors match UI_DESIGN_SYSTEM.md exactly
- Arabic text renders correctly in RTL
- Dark mode works smoothly
- No hardcoded colors in components (all use theme)

---

#### Week 3: Infrastructure & Dependencies
**Status:** Pending
**Effort:** 25 hours
**Priority:** P0

**Tasks:**
- [ ] **Install additional dependencies**
  ```bash
  # Database
  yarn add @nozbe/watermelondb @nozbe/with-observables

  # State management
  yarn add @tanstack/react-query axios

  # Authentication
  yarn add @react-native-google-signin/google-signin
  yarn add @invertase/react-native-apple-authentication

  # Audio
  yarn add react-native-track-player

  # IAP
  yarn add react-native-iap

  # Location & Sensors
  yarn add react-native-geolocation-service
  yarn add react-native-sensors

  # Calendar
  yarn add react-native-calendars date-fns-jalali

  # Responsive sizing
  yarn add react-native-size-matters
  ```

- [ ] **Set up Cloudflare Workers project**
  - Create `cloudflare-workers/` folder
  - Initialize wrangler project
  - Set up D1 database (justdeen-production)
  - Run schema.sql to create tables
  - Configure environment variables

- [ ] **Configure environment variables**
  - Create `.env.development` and `.env.production`
  - Add AlAdhan API URL
  - Add Cloudflare Workers API URL
  - Add Google OAuth client IDs
  - Add Apple OAuth client IDs

- [ ] **Set up WatermelonDB for Quran**
  - Create `app/database/` folder
  - Define Quran schema (surahs, verses, translations)
  - Set up database connection
  - Test database creation

- [ ] **Remove demo code**
  - Delete `app/screens/DemoShowroomScreen/`
  - Delete `app/screens/DemoPodcastListScreen.tsx`
  - Delete `app/screens/DemoCommunityScreen.tsx`
  - Delete `app/screens/DemoDebugScreen.tsx`
  - Delete `app/context/EpisodeContext.tsx`
  - Delete `app/i18n/demo-*.ts` files

**Deliverables:**
- All dependencies installed
- Cloudflare Workers + D1 initialized
- WatermelonDB configured for Quran
- Demo code removed

**Acceptance Criteria:**
- `yarn install` completes successfully
- Cloudflare D1 database accessible via wrangler
- WatermelonDB creates database on app start
- App builds without demo screens

---

### **PHASE 2: Core Architecture (Weeks 4-5)** [P0]

**Goal:** Set up navigation, state management, and API services

#### Week 4: Navigation Structure
**Status:** Pending
**Effort:** 30 hours
**Priority:** P0

**Tasks:**
- [ ] **Update navigation types** (`app/navigators/navigationTypes.ts`)
  ```typescript
  export type AuthStackParamList = {
    Welcome: undefined
    SignIn: undefined
  }

  export type PrayTabParamList = {
    Home: undefined
    PrayerDetails: { prayerId: string }
  }

  export type ReadTabParamList = {
    QuranList: undefined
    SurahDetail: { surahNumber: number }
    VerseBookmarks: undefined
  }

  // ... all 5 tab stacks
  ```

- [ ] **Create `MainTabNavigator.tsx`** (replace DemoNavigator)
  - 5 bottom tabs (Pray, Read, Reflect, AI, Settings)
  - Each tab has its own stack navigator
  - Custom tab bar with WWDC styling
  - Tab-specific colors from theme

- [ ] **Update `AppNavigator.tsx`**
  - AuthStack when !authenticated
  - MainTabs when authenticated
  - Deep linking configuration

- [ ] **Create placeholder screens**
  - `app/screens/WelcomeScreen.tsx` (auth)
  - `app/screens/SignInScreen.tsx` (auth)
  - `app/screens/HomeScreen.tsx` (prayer tab)
  - `app/screens/QuranListScreen.tsx` (read tab)
  - `app/screens/HadithListScreen.tsx` (reflect tab)
  - `app/screens/ChatbotScreen.tsx` (AI tab)
  - `app/screens/SettingsScreen.tsx` (settings tab)

- [ ] **Style custom tab bar**
  - Match Flutter bottom navigation exactly
  - Active/inactive states with tab colors
  - Icon + label layout
  - Active indicator line (iOS 15 style)

**Deliverables:**
- 5-tab navigation working
- Placeholder screens navigable
- Tab bar matches Flutter design

**Acceptance Criteria:**
- All 5 tabs accessible
- Tab colors match WWDC design
- Navigation state persists
- Deep linking works

---

#### Week 5: State Management & API Setup
**Status:** Pending
**Effort:** 35 hours
**Priority:** P0

**Tasks:**
- [ ] **Adapt `AuthContext.tsx`** for JustDeen
  - Support Google, Apple, Anonymous sign-in
  - JWT token storage (MMKV)
  - Token refresh logic
  - Sign-out handling

- [ ] **Create `PrayerContext.tsx`**
  - Prayer times state
  - Current location state
  - Calculation method preference
  - Fetch prayer times method
  - Cache prayer times (MMKV)

- [ ] **Create `SettingsContext.tsx`**
  - Theme preference (light/dark/auto)
  - Language preference
  - Prayer calculation method
  - Notification settings
  - Persist to MMKV

- [ ] **Set up API service** (`app/services/api/`)
  - Extend base Api class
  - Add `getPrayerTimes(lat, lng, method)` for AlAdhan API
  - Add Cloudflare D1 endpoints (signIn, getBookmarks, etc.)
  - Add error handling
  - Add request/response logging (dev mode)

- [ ] **Set up React Query**
  - Configure QueryClient
  - Add QueryClientProvider to app.tsx
  - Create hooks for prayer times (`usePrayerTimes`)
  - Create hooks for bookmarks (`useBookmarks`)
  - Configure caching strategy

**Deliverables:**
- Contexts for Auth, Prayer, Settings
- API service with AlAdhan integration
- React Query configured

**Acceptance Criteria:**
- Auth context handles sign-in/sign-out
- Prayer context fetches and caches times
- Settings persist across app restarts
- API calls work with proper error handling

---

### **PHASE 3: Authentication (Weeks 6-7)** [P0]

**Goal:** Implement user authentication with Google, Apple, Anonymous sign-in

#### Week 6: Auth UI & Google Sign-In
**Status:** Pending
**Effort:** 30 hours
**Priority:** P0

**Tasks:**
- [ ] **Design Welcome Screen** (match Flutter)
  - App logo
  - Tagline
  - Onboarding slides (3 slides, swipeable)
  - "Sign in with Google" button
  - "Sign in with Apple" button (iOS)
  - "Continue as Guest" link
  - Background gradient (theme colors)

- [ ] **Implement Google Sign-In**
  - Configure Google OAuth in Firebase/Google Cloud Console
  - Add client IDs to config
  - Implement sign-in flow
  - Get user profile (name, email, photo)
  - Store auth token in MMKV
  - Call Cloudflare D1 API to create/update user

- [ ] **Implement Anonymous Sign-In**
  - Generate anonymous user ID
  - Store in MMKV
  - Create anonymous user in D1 backend
  - Allow upgrade to authenticated account later

- [ ] **Auth state persistence**
  - Check for existing token on app start
  - Auto-sign in if valid token exists
  - Redirect to MainTabs if authenticated
  - Show Welcome screen if not authenticated

**Deliverables:**
- Welcome screen matching Flutter UI
- Google Sign-In working
- Anonymous Sign-In working
- Persistent auth state

**Acceptance Criteria:**
- User can sign in with Google (< 3 seconds)
- User can continue as guest
- Auth state persists across app restarts
- UI matches Flutter Welcome screen exactly

---

#### Week 7: Apple Sign-In & Profile Management
**Status:** Pending
**Effort:** 25 hours
**Priority:** P0 (iOS only)

**Tasks:**
- [ ] **Implement Apple Sign-In** (iOS)
  - Configure Apple Sign-In in Apple Developer Portal
  - Implement sign-in flow
  - Get user profile
  - Store auth token
  - Call D1 API

- [ ] **Create Profile Screen** (Settings tab)
  - Display user profile (photo, name, email)
  - Edit display name
  - Sign out button
  - Delete account button
  - Theme preference toggle
  - Language selector

- [ ] **Implement Sign-Out**
  - Clear MMKV auth token
  - Clear React Query cache
  - Reset all contexts
  - Navigate to Welcome screen

- [ ] **Implement Delete Account**
  - Confirmation dialog
  - Call D1 API to delete user data
  - Clear local data
  - Sign out

**Deliverables:**
- Apple Sign-In working (iOS)
- Profile management screen
- Sign-out functionality
- Account deletion

**Acceptance Criteria:**
- Apple Sign-In works on iOS 13+
- User can edit profile
- Sign-out clears all local data
- Account deletion removes data from D1

---

### **PHASE 4: Prayer Times (Weeks 8-10)** [P0 - CRITICAL]

**Goal:** Implement accurate prayer times with AlAdhan API

#### Week 8: Prayer Time Calculation & Home Screen
**Status:** Pending
**Effort:** 35 hours
**Priority:** P0 (MISSION CRITICAL)

**Tasks:**
- [ ] **Integrate AlAdhan API**
  - Create `aladhanApi.ts` service
  - Implement `getPrayerTimes(lat, lng, method)` method
  - Parse response and extract 5 daily prayer times
  - Handle timezone conversion
  - Handle DST transitions
  - Cache times for 30 days

- [ ] **Get user location**
  - Request location permissions
  - Use react-native-geolocation-service
  - Get current location (latitude, longitude)
  - Reverse geocode to city name
  - Store location in PrayerContext
  - Allow manual location selection

- [ ] **Design Home Screen** (match Flutter exactly!)
  - Header with Hijri + Gregorian date
  - Location display with edit button
  - Current/next prayer card (large, highlighted)
  - Countdown timer to next prayer
  - List of 5 daily prayers with times
  - Prayer status indicators (active/upcoming/passed)
  - Daily Ayah card
  - Quick menu (8 icons grid)

- [ ] **Create `PrayerCard` component**
  - Match Flutter design exactly
  - Display prayer name, time, countdown
  - Status dot (green/orange/gray)
  - Highlight next prayer
  - Use Pray tab purple color (#5856D6)

- [ ] **Implement countdown timer**
  - Calculate time until next prayer
  - Update every second
  - Display in format "2h 15m" or "45m" or "5m"
  - Auto-update when prayer time passes

**Deliverables:**
- AlAdhan API integration
- Home screen with prayer times
- Accurate countdown timer
- Location detection

**Acceptance Criteria:**
- Prayer times accurate within ±1 minute (tested in 20+ cities)
- Location detected in < 5 seconds
- Countdown updates smoothly
- UI matches Flutter Home screen exactly
- Times update at midnight automatically

---

#### Week 9: Prayer Notifications & Settings
**Status:** Pending
**Effort:** 30 hours
**Priority:** P0

**Tasks:**
- [ ] **Implement prayer notifications**
  - Request notification permissions
  - Schedule notifications for each prayer time
  - Configurable offset (0-60 minutes before)
  - Play Adhan audio (iOS) or notification sound
  - Show notification even when app is closed
  - Update notifications when times change

- [ ] **Create Prayer Settings screen**
  - Calculation method selector (ISNA, MWL, Egypt, Makkah, etc.)
  - Notification settings (enable/disable per prayer)
  - Notification offset slider
  - Adhan audio selection
  - Do Not Disturb schedule

- [ ] **Prayer Timing Details screen**
  - Calendar view (current month)
  - Daily prayer times for selected date
  - Past and future times
  - Export to device calendar

- [ ] **Handle edge cases**
  - High latitude locations (special calculations)
  - Midnight rollover (update times)
  - Location change (re-fetch times)
  - Airplane mode (use cached times)
  - No internet (use last known times for 30 days)

**Deliverables:**
- Prayer notifications working
- Settings screen for prayer customization
- Prayer timing details screen
- Edge cases handled

**Acceptance Criteria:**
- Notifications delivered within ±5 seconds of scheduled time
- User can configure notification offset
- Calculation method changes update times immediately
- App works offline with cached times

---

#### Week 10: Prayer Accuracy Testing & Polish
**Status:** Pending
**Effort:** 25 hours
**Priority:** P0

**Tasks:**
- [ ] **Test prayer time accuracy** (CRITICAL!)
  - Test in 100+ cities worldwide
  - Compare with AlAdhan API reference
  - Verify DST transitions
  - Test timezone edge cases
  - Test near poles (high latitudes)
  - Document any discrepancies

- [ ] **Polish Home Screen UI**
  - Match Flutter spacing exactly
  - Match shadows and elevations
  - Smooth animations
  - Test light and dark modes
  - Test on small screens (iPhone SE)
  - Test on large screens (iPad)

- [ ] **Optimize performance**
  - Lazy load Daily Ayah
  - Optimize countdown timer updates
  - Reduce re-renders
  - Test cold start time (must be < 2s)

- [ ] **Add error handling**
  - Handle AlAdhan API errors gracefully
  - Show cached times when offline
  - Retry failed requests
  - Show user-friendly error messages

**Deliverables:**
- Prayer times tested in 100+ cities
- Home screen UI polished
- Performance optimized
- Error handling complete

**Acceptance Criteria:**
- Prayer times accurate in all 100 test cities
- UI matches Flutter pixel-perfect
- Cold start < 2 seconds
- No crashes or errors

---

### **PHASE 5: Qibla Compass (Week 11)** [P0 - CRITICAL]

**Goal:** Implement accurate Qibla direction finder

#### Week 11: Qibla Compass Implementation
**Status:** Pending
**Effort:** 35 hours
**Priority:** P0 (MISSION CRITICAL)

**Tasks:**
- [ ] **Calculate Qibla direction**
  - Create `qiblaCalculations.ts`
  - Implement great circle formula
  - Calculate bearing from user location to Kaaba (21.4225° N, 39.8262° E)
  - Correct for magnetic declination
  - Return angle in degrees

- [ ] **Implement compass**
  - Use react-native-sensors (magnetometer)
  - Subscribe to magnetometer readings (30 FPS)
  - Apply low-pass filter to smooth jitter
  - Combine with gyroscope for stability
  - Update compass rotation smoothly

- [ ] **Design Qibla Screen** (match Flutter)
  - Compass rose (rotating based on device orientation)
  - Kaaba icon/arrow pointing to Qibla
  - Degree display
  - Distance to Kaaba
  - Location display
  - Calibration instructions (when accuracy low)

- [ ] **Create `CompassRose` component**
  - Use react-native-svg for graphics
  - Rotate compass based on device heading
  - Kaaba icon points to Qibla direction
  - Smooth rotation animation (Reanimated 2)
  - Gold color for Kaaba icon (#FFD60A)

- [ ] **Handle compass calibration**
  - Detect low accuracy from magnetometer
  - Show calibration overlay with instructions
  - "Figure-8 motion" animation
  - Dismiss when accuracy improves

- [ ] **Test Qibla accuracy**
  - Test in 50+ locations worldwide
  - Compare with reference Qibla apps
  - Verify accuracy within ±1 degree
  - Test with magnetic interference detection

**Deliverables:**
- Qibla compass working accurately
- Smooth rotation animations
- Calibration UI
- Tested in 50 locations

**Acceptance Criteria:**
- Qibla direction accurate within ±1 degree
- Compass updates at 30 FPS (smooth)
- Calibration UI appears when needed
- Distance calculation accurate
- UI matches Flutter Qibla screen

---

### **PHASE 6: Quran Reading (Weeks 12-15)** [P0]

**Goal:** Implement complete Quran with translations, bookmarks, and audio

#### Week 12: Quran Database & Surah List
**Status:** Pending
**Effort:** 40 hours
**Priority:** P0

**Tasks:**
- [ ] **Set up WatermelonDB schema**
  - Surahs table (114 surahs)
  - Verses table (6,236 verses)
  - Translations table (multiple languages)
  - Bookmarks table (user bookmarks)

- [ ] **Import Quran data**
  - Source Uthmanic text (Tanzil.net or similar)
  - Import all 114 Surahs with metadata
  - Import all 6,236 verses (Arabic text)
  - Import English translation (Sahih International)
  - Import Urdu translation
  - Verify data integrity (checksums)

- [ ] **Create Surah List Screen** (match Flutter)
  - Search bar at top
  - List of 114 Surahs
  - Each item: Surah number, Arabic name, English name, revelation place, verse count
  - Scroll to top button
  - Tab navigation: Surah / Juz / Bookmarks

- [ ] **Implement search**
  - Search Surahs by name (Arabic or English)
  - Filter list in real-time
  - Debounce input
  - Highlight matches

- [ ] **Optimize list performance**
  - Use FlashList (faster than FlatList)
  - Implement getItemLayout for smooth scrolling
  - Lazy load Surah details
  - Test with all 114 items

**Deliverables:**
- WatermelonDB with complete Quran data
- Surah List screen
- Search functionality
- Optimized performance

**Acceptance Criteria:**
- All 6,236 verses imported correctly
- Surah list displays all 114 Surahs
- Search works instantly
- No dropped frames when scrolling
- UI matches Flutter Surah list

---

#### Week 13: Quran Reading View
**Status:** Pending
**Effort:** 40 hours
**Priority:** P0

**Tasks:**
- [ ] **Create Surah Detail Screen** (match Flutter)
  - Top header: Surah name, info button, audio button, bookmark button
  - Bismillah at top (except Surah 9)
  - List of verses (FlashList)
  - Each verse: Arabic text (Uthman font), translation, verse number
  - Long press menu: Copy, Share, Bookmark, Add Note

- [ ] **Create `VerseCard` component**
  - Arabic text (24sp, Uthman font, RTL)
  - Translation text (16sp)
  - Verse number badge
  - Bookmark icon
  - Spacing matches Flutter exactly

- [ ] **Implement long press menu**
  - Bottom sheet with actions
  - Copy Arabic text
  - Copy translation
  - Share verse
  - Bookmark verse
  - Add personal note

- [ ] **Handle RTL text properly**
  - Arabic text right-aligned
  - Proper line breaking
  - No word splitting
  - Correct text direction

- [ ] **Save last reading position**
  - Store last Surah and verse in MMKV
  - Restore on app restart
  - "Resume reading" button on Surah list

**Deliverables:**
- Surah Detail screen with verses
- VerseCard component
- Long press menu
- Last reading position saved

**Acceptance Criteria:**
- All verses display correctly with proper Arabic rendering
- Translation toggles on/off
- Long press menu works smoothly
- Last position restored on restart
- UI matches Flutter Surah reading screen

---

#### Week 14: Bookmarks & Translations
**Status:** Pending
**Effort:** 30 hours
**Priority:** P1

**Tasks:**
- [ ] **Implement bookmarks**
  - Bookmark any verse
  - Add personal notes to bookmarks
  - Organize with tags/categories
  - Bookmark list screen
  - Search bookmarks
  - Sync bookmarks to Cloudflare D1 (authenticated users)

- [ ] **Add multiple translations**
  - Support 5+ translations (English, Urdu, Turkish, French, Indonesian)
  - Download translations on-demand
  - Store in WatermelonDB
  - Switch between translations
  - Display multiple translations side-by-side

- [ ] **Translation settings**
  - Select default translation
  - Download/delete translations
  - Translation language selector

- [ ] **Juz view**
  - List of 30 Juz
  - Navigate to any Juz
  - Display verses across Surahs

**Deliverables:**
- Bookmark functionality
- Multiple translations
- Translation management
- Juz navigation

**Acceptance Criteria:**
- Bookmarks sync to cloud (authenticated users)
- User can switch translations instantly
- Notes support rich text
- Juz view works correctly

---

#### Week 15: Quran Audio Player
**Status:** Pending
**Effort:** 35 hours
**Priority:** P1

**Tasks:**
- [ ] **Integrate audio player**
  - Use react-native-track-player
  - Support multiple reciters (Mishary, Sudais, etc.)
  - Stream audio from online source
  - Download for offline listening
  - Verse-by-verse playback
  - Continuous playback (full Surah)

- [ ] **Create `AudioPlayer` component**
  - Floating player (bottom of screen)
  - Play/pause button
  - Next/previous verse buttons
  - Progress bar
  - Current verse display
  - Repeat modes (verse, Surah, all)

- [ ] **Implement background playback**
  - Continue playing when app minimized
  - Lock screen controls (media player)
  - Handle interruptions (phone calls)

- [ ] **Audio settings**
  - Select reciter
  - Download Surahs for offline
  - Playback speed control
  - Auto-scroll to playing verse

**Deliverables:**
- Audio player working
- Background playback
- Lock screen controls
- Multiple reciters

**Acceptance Criteria:**
- Audio plays within 2 seconds
- Background playback works when app minimized
- Lock screen shows Surah/verse info
- Downloaded audio plays offline

---

### **PHASE 7: Islamic Content (Weeks 16-17)** [P1]

**Goal:** Add Hadith, Duas, Tasbih, and Islamic Calendar

#### Week 16: Hadith & Duas
**Status:** Pending
**Effort:** 35 hours
**Priority:** P1

**Tasks:**
- [ ] **Hadith database**
  - Import Sahih Bukhari
  - Import Sahih Muslim
  - Store in WatermelonDB
  - Hadith List screen
  - Hadith Detail screen
  - Search Hadiths
  - Bookmark Hadiths

- [ ] **Duas (Supplications)**
  - Import common duas (morning, evening, travel, food, etc.)
  - Duas List screen
  - Dua Detail screen (Arabic + transliteration + translation)
  - Audio recitation
  - Favorite duas
  - Reminders for morning/evening duas

**Deliverables:**
- Hadith collections (Bukhari, Muslim)
- Duas collection
- Search and bookmark functionality

**Acceptance Criteria:**
- At least 2 major Hadith collections available
- At least 50 duas available
- Search returns results in < 1 second
- Audio plays smoothly

---

#### Week 17: Tasbih Counter & Islamic Calendar
**Status:** Pending
**Effort:** 25 hours
**Priority:** P1

**Tasks:**
- [ ] **Digital Tasbih (Counter)**
  - Increment on tap/swipe
  - Haptic feedback
  - Optional sound on count
  - Reset button
  - Set target count (33, 99, custom)
  - Track dhikr history
  - Multiple dhikr types (Subhanallah, Alhamdulillah, Allahu Akbar)

- [ ] **Islamic Calendar (Hijri)**
  - Display current Hijri date
  - Upcoming Islamic events (Ramadan, Eid, etc.)
  - Convert Hijri ↔ Gregorian
  - Month view calendar
  - Highlight special days (Jumma, 15th Shaban)
  - Notifications for upcoming events

**Deliverables:**
- Tasbih counter
- Islamic calendar
- Event reminders

**Acceptance Criteria:**
- Tasbih responds instantly to taps
- Haptics feel natural
- Hijri date matches official calendar
- Date conversion is accurate

---

### **PHASE 8: Community Features (Weeks 18-19)** [P2]

**Goal:** Implement reading groups with Cloudflare D1 sync

#### Week 18: Reading Groups
**Status:** Pending
**Effort:** 35 hours
**Priority:** P2

**Tasks:**
- [ ] **Create Group screen**
  - Create new reading group
  - Set group name, description
  - Set reading target (Quran complete, Juz 30, custom)
  - Set target date
  - Generate invite code
  - Public/private toggle

- [ ] **Join Group screen**
  - Join with invite code
  - View group details
  - See member list
  - View group progress

- [ ] **Group Progress tracking**
  - Log individual progress
  - View group leaderboard
  - Progress statistics
  - Sync to Cloudflare D1

**Deliverables:**
- Group creation
- Group joining
- Progress tracking
- Real-time sync

**Acceptance Criteria:**
- Groups sync in real-time
- Progress updates instantly
- Invite codes work reliably
- Leaderboard calculates correctly

---

#### Week 19: Community Feed & Nearby Places
**Status:** Pending
**Effort:** 30 hours
**Priority:** P2

**Tasks:**
- [ ] **Group Feed**
  - Post updates in group
  - React to posts (like, encourage, pray for them)
  - Notifications for group activity
  - Moderation (admin can delete posts)

- [ ] **Nearby Islamic Places**
  - Find mosques within 5km
  - Display on map
  - Show distance and directions
  - Display details (name, address, prayer times)
  - Call mosque
  - Navigate using Google/Apple Maps
  - Find halal restaurants

**Deliverables:**
- Community feed
- Nearby places finder
- Map integration

**Acceptance Criteria:**
- Posts appear in < 2 seconds
- Map shows at least 10 places (if available)
- Directions open in native maps app
- Search completes in < 3 seconds

---

### **PHASE 9: Premium & Advanced Features (Weeks 20-21)** [P3]

**Goal:** Implement in-app purchases and premium features

#### Week 20: In-App Purchases
**Status:** Pending
**Effort:** 30 hours
**Priority:** P3

**Tasks:**
- [ ] **Set up IAP**
  - Configure products in App Store Connect and Play Console
  - Monthly and annual subscriptions
  - Implement purchase flow with react-native-iap
  - Unlock premium features after purchase
  - Restore purchases on new devices
  - Handle subscription expiration

- [ ] **Premium features**
  - Ad-free experience (if ads added)
  - Unlimited bookmarks
  - Advanced analytics
  - Custom themes
  - Offline audio downloads (all reciters)

- [ ] **Subscription management**
  - Show subscription status in settings
  - Manage subscription (cancel, change plan)

**Deliverables:**
- IAP working on iOS and Android
- Premium features unlocked
- Subscription management

**Acceptance Criteria:**
- Purchase flow completes in < 30 seconds
- Features unlock immediately
- Restore purchases works reliably

---

#### Week 21: AI Chatbot (Optional)
**Status:** Pending
**Effort:** 35 hours
**Priority:** P3 (Future)

**Tasks:**
- [ ] **AI Chatbot integration**
  - Chat interface (message list)
  - AI generates answers from authentic sources
  - Cite Quran/Hadith references
  - Support multiple languages
  - Maintain conversation context
  - Save chat history

**Deliverables:**
- AI chatbot functional
- Accurate responses with citations

**Acceptance Criteria:**
- Responses within 5 seconds
- Answers are accurate and referenced
- Chat history syncs to cloud

---

### **PHASE 10: Testing, Polish & Deployment (Weeks 22-26)** [P0]

**Goal:** Comprehensive testing, bug fixes, and production deployment

#### Week 22: Comprehensive Testing
**Status:** Pending
**Effort:** 40 hours
**Priority:** P0

**Tasks:**
- [ ] **Prayer time accuracy testing**
  - Test in 100+ cities worldwide
  - Verify DST transitions
  - Test timezone edge cases
  - Document any discrepancies

- [ ] **Qibla accuracy testing**
  - Test in 50+ locations
  - Compare with reference apps
  - Verify ±1 degree accuracy

- [ ] **Unit tests**
  - Prayer calculations
  - Qibla calculations
  - Date conversions
  - Utility functions
  - State management (contexts)
  - Target: ≥ 70% coverage

- [ ] **Integration tests**
  - API calls (AlAdhan, Cloudflare D1)
  - Database operations (WatermelonDB)
  - Navigation flows

**Deliverables:**
- Prayer times tested in 100+ cities
- Qibla tested in 50+ locations
- Unit tests written (70% coverage)
- Integration tests written

**Acceptance Criteria:**
- All accuracy tests pass
- No critical bugs found
- Code coverage ≥ 70%

---

#### Week 23: E2E Testing & Performance
**Status:** Pending
**Effort:** 35 hours
**Priority:** P0

**Tasks:**
- [ ] **E2E tests** (Maestro or Detox)
  - Sign in → View prayer times → Get notification
  - Open app → Read Quran → Bookmark verse → Reopen → Verify bookmark
  - Join group → Log progress → See leaderboard
  - Find Qibla → Verify compass rotates

- [ ] **Performance optimization**
  - Optimize cold start (< 2s)
  - Reduce memory usage
  - Optimize scroll performance (Quran, lists)
  - Optimize image loading
  - Reduce bundle size

- [ ] **Battery optimization**
  - Optimize location tracking
  - Optimize notification scheduling
  - Test battery drain (< 5% per hour active use)

**Deliverables:**
- E2E tests for critical flows
- Performance optimized
- Battery usage minimized

**Acceptance Criteria:**
- Cold start < 2 seconds
- No dropped frames when scrolling
- Battery drain < 5% per hour

---

#### Week 24: UI Polish & Accessibility
**Status:** Pending
**Effort:** 30 hours
**Priority:** P0

**Tasks:**
- [ ] **UI Polish**
  - Compare all screens with Flutter app side-by-side
  - Match colors exactly
  - Match spacing exactly
  - Match fonts exactly
  - Smooth animations
  - Test light and dark modes
  - Test on small screens (iPhone SE, Android small phones)
  - Test on large screens (iPad, Android tablets)

- [ ] **Accessibility**
  - VoiceOver/TalkBack support
  - All UI elements labeled
  - Proper reading order
  - Color contrast ratios (WCAG AA)
  - Touch targets ≥ 44×44
  - Dynamic Type support (iOS)
  - Test with accessibility features enabled

**Deliverables:**
- UI matches Flutter pixel-perfect
- Accessibility compliant (WCAG AA)

**Acceptance Criteria:**
- All screens match Flutter design
- App passes accessibility audit
- Works with screen readers

---

#### Week 25: Beta Testing & Bug Fixes
**Status:** Pending
**Effort:** 35 hours
**Priority:** P0

**Tasks:**
- [ ] **Beta testing**
  - Deploy to TestFlight (iOS) and Google Play Beta (Android)
  - Recruit 50+ beta testers
  - Collect feedback
  - Monitor crash reports
  - Monitor performance metrics

- [ ] **Bug fixes**
  - Fix all critical bugs (P0)
  - Fix high-priority bugs (P1)
  - Fix medium-priority bugs (P2) if time permits

- [ ] **Final polish**
  - Improve onboarding flow based on feedback
  - Optimize user experience
  - Add helpful tooltips
  - Improve error messages

**Deliverables:**
- Beta version deployed
- All critical bugs fixed
- Feedback incorporated

**Acceptance Criteria:**
- Crash-free rate ≥ 99.5%
- 4+ star rating from beta testers
- No critical bugs remaining

---

#### Week 26: Production Deployment
**Status:** Pending
**Effort:** 25 hours
**Priority:** P0

**Tasks:**
- [ ] **App Store preparation**
  - App screenshots (iOS and Android)
  - App description
  - Keywords
  - Privacy policy
  - Terms of service
  - Support contact
  - Promotional materials

- [ ] **iOS submission**
  - Build production IPA
  - Upload to App Store Connect
  - Submit for review
  - Respond to review feedback

- [ ] **Android submission**
  - Build production APK/AAB
  - Upload to Google Play Console
  - Submit for review
  - Respond to review feedback

- [ ] **Cloudflare Workers deployment**
  - Deploy production Workers
  - Migrate DynamoDB data to D1
  - Verify data integrity
  - Monitor API performance

- [ ] **Launch preparation**
  - Set up analytics (Firebase, Mixpanel)
  - Set up error tracking (Sentry)
  - Set up push notifications (FCM)
  - Prepare launch announcement

**Deliverables:**
- App live on App Store and Play Store
- Cloudflare Workers deployed
- Data migrated successfully

**Acceptance Criteria:**
- App approved by both stores
- No critical issues on launch
- All services operational

---

## 📊 Progress Tracking

### Weekly Check-ins
- Every Monday: Review previous week's progress
- Update MIGRATION_PROGRESS.md
- Identify blockers
- Adjust timeline if needed

### Milestones
- ✅ Week 3: Theme system complete
- ✅ Week 5: Navigation and API setup complete
- ✅ Week 7: Authentication complete
- ✅ Week 10: Prayer times complete (CRITICAL)
- ✅ Week 11: Qibla compass complete (CRITICAL)
- ✅ Week 15: Quran reading complete
- ✅ Week 17: Islamic content complete
- ✅ Week 19: Community features complete
- ✅ Week 21: Premium features complete
- ✅ Week 26: Production launch

---

## 🚨 Risk Management

### High-Risk Items

**1. Prayer Time Accuracy (P0 - CRITICAL)**
- **Risk:** Inaccurate prayer times could harm users' religious practice
- **Mitigation:** Test in 100+ cities, compare with multiple sources, verify DST handling
- **Contingency:** Use multiple calculation methods, allow manual adjustment

**2. Qibla Direction Accuracy (P0 - CRITICAL)**
- **Risk:** Inaccurate Qibla direction misleads prayer direction
- **Mitigation:** Test in 50+ locations, compare with reference apps, accurate magnetic declination
- **Contingency:** Show accuracy indicator, allow compass calibration

**3. DynamoDB → D1 Migration**
- **Risk:** Data loss during migration
- **Mitigation:** Run parallel systems, verify data integrity, maintain backups
- **Contingency:** Rollback to DynamoDB if issues arise

**4. Quran Data Integrity**
- **Risk:** Corrupted or incorrect verses
- **Mitigation:** Use verified sources (Tanzil.net), verify with checksums, triple-check
- **Contingency:** Have backup Quran database ready

**5. Performance (Cold Start < 2s)**
- **Risk:** Slow startup frustrates users
- **Mitigation:** Optimize bundle size, lazy load, use Hermes engine, profile regularly
- **Contingency:** Remove non-critical features from initial load

### Medium-Risk Items

**6. Arabic Font Rendering**
- **Risk:** Arabic text doesn't display correctly (RTL issues)
- **Mitigation:** Test extensively, use proven fonts (Uthman, Jameel)
- **Contingency:** Use web view for Arabic text if native rendering fails

**7. Audio Playback**
- **Risk:** Background audio or lock screen controls don't work
- **Mitigation:** Use battle-tested library (react-native-track-player)
- **Contingency:** Use simpler audio library, disable background playback

**8. In-App Purchases**
- **Risk:** IAP doesn't work reliably
- **Mitigation:** Test thoroughly on both platforms, handle edge cases
- **Contingency:** Launch without IAP initially, add later

---

## 📈 Success Metrics

### Launch Criteria (All must be met)
- ✅ Prayer times accurate in 100+ cities (±1 minute)
- ✅ Qibla direction accurate in 50+ locations (±1 degree)
- ✅ Cold start time < 2 seconds
- ✅ Crash-free rate ≥ 99.5%
- ✅ All 35 P0 features complete
- ✅ UI matches Flutter app (confirmed by side-by-side comparison)
- ✅ 100% Quran offline functionality
- ✅ Zero data loss during migration

### Post-Launch KPIs (30 days)
- 70% daily active users (of total installs)
- 10+ minutes average session duration
- 60% 30-day retention rate
- 4.5+ star rating on both stores
- < 1% API error rate
- < 0.5% crash rate

---

## 🎯 Next Immediate Actions

**Week 2 starts NOW:**
1. Update `app/theme/colors.ts` with WWDC 5-tab colors
2. Update `app/theme/typography.ts` with SF Pro + Arabic fonts
3. Add Uthman and Jameel fonts to assets
4. Test theme system (light/dark mode)
5. Update `MIGRATION_PROGRESS.md` after each day

---

**Last Updated:** 2025-11-10
**Status:** Ready to begin Week 2
**Timeline:** 20-26 weeks total
**Current Phase:** Phase 1, Week 2 (Theme Customization)
**Overall Progress:** ~4% complete (Week 1 done)

**Document Version:** 1.0
**Review Cycle:** Weekly during migration
