# Screen Comparison: Flutter vs React Native

**Project:** JustDeen MyCompanion Migration
**Last Updated:** 2025-11-10
**Purpose:** Track UI/UX parity between Flutter and React Native implementations

---

## How to Use This Document

For each screen migrated:
1. Document Flutter implementation details
2. Create React Native equivalent
3. Note any differences or compromises
4. Attach screenshots for visual comparison
5. Mark status (🔴 Not Started | 🟡 In Progress | 🟢 Complete)

---

## 1. Authentication Screens

### 1.1 Welcome/Onboarding Screen

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/auth/screens/welcome_screen.dart`

**Key Elements:**
- [ ] App logo at top
- [ ] Tagline/description
- [ ] 3 onboarding slides (swipeable)
- [ ] "Sign in with Google" button
- [ ] "Sign in with Apple" button (iOS only)
- [ ] "Continue as Guest" link
- [ ] Background gradient

**Colors:**
- Background: Gradient (primary to secondary)
- Buttons: White with brand colors
- Text: White

**Animations:**
- Slide transition between onboarding screens
- Fade-in for content

#### React Native Implementation
**File:** `app/screens/WelcomeScreen.tsx`

**Status:** Not started

**Differences:** None expected

**Notes:**
- Use react-native-swiper for onboarding slides
- Implement Google Sign-In using @react-native-google-signin/google-signin
- Implement Apple Sign-In using @invertase/react-native-apple-authentication

---

## 2. Home Screen (Prayer Times)

### 2.1 Main Prayer Times Dashboard

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/home/screens/home_screen.dart`

**Key Elements:**
- [ ] Top header with date (Hijri + Gregorian)
- [ ] Location display with edit button
- [ ] Current/next prayer card (large, highlighted)
- [ ] Countdown timer to next prayer
- [ ] List of 5 daily prayers with times
- [ ] Prayer status indicators (dot: active/upcoming/passed)
- [ ] Daily Ayah card
- [ ] Quick menu (8 icons grid)
- [ ] Health rings card (Apple Health style)
- [ ] Bottom tab navigation

**Layout:**
```
┌─────────────────────────────┐
│  [Date] [Location] [Edit]   │ <- Header
├─────────────────────────────┤
│                             │
│   ┌─────────────────────┐   │
│   │  DHUHR - Next       │   │ <- Current prayer card
│   │  2:15 PM            │   │    (Highlighted, larger)
│   │  in 1h 23m          │   │
│   └─────────────────────┘   │
│                             │
│  Fajr     ● 5:30 AM        │ <- Prayer list
│  Dhuhr    ● 12:15 PM       │
│  Asr      ○ 3:45 PM        │
│  Maghrib  ○ 6:20 PM        │
│  Isha     ○ 7:45 PM        │
│                             │
│  ┌─────────────────────┐   │
│  │ Daily Ayah Card     │   │ <- Ayah card
│  │ Arabic text...      │   │
│  │ Translation...      │   │
│  └─────────────────────┘   │
│                             │
│  ┌───┬───┬───┬───┐         │ <- Quick menu (8 icons)
│  │[1]│[2]│[3]│[4]│         │
│  ├───┼───┼───┼───┤         │
│  │[5]│[6]│[7]│[8]│         │
│  └───┴───┴───┴───┘         │
│                             │
│  ┌─────────────────────┐   │
│  │ Health Rings Card   │   │ <- Apple Health style
│  │   ⭕⭕⭕            │   │
│  └─────────────────────┘   │
└─────────────────────────────┘
│ [Tab] [Tab] [Tab] [Tab]   │ <- Bottom navigation
└─────────────────────────────┘
```

**Colors:**
- Header background: colors.surface
- Current prayer card: colors.primary with shadow
- Prayer list: colors.surface cards
- Status dots: green (active), orange (upcoming), gray (passed)
- Screen background: colors.background

**Typography:**
- Header date: typography.body.medium
- Location: typography.body.small
- Current prayer name: typography.title.large
- Current prayer time: typography.display.medium
- Countdown: typography.body.small
- Prayer list names: typography.title.medium
- Prayer list times: typography.body.large

**Spacing:**
- Screen padding: 16.w
- Card margin: 12.h
- Between elements: 12-16.h

**Animations:**
- Countdown updates every second
- Prayer card transitions smoothly when next prayer comes
- Health rings animate on load

#### React Native Implementation
**File:** `app/screens/HomeScreen.tsx`

**Status:** Not started

**Differences:** None expected

**Components to Create:**
- `PrayerTimeCard.tsx` - Large highlighted card
- `PrayerListItem.tsx` - List item with status dot
- `DailyAyahCard.tsx` - Verse of the day
- `QuickMenuGrid.tsx` - 8-icon grid
- `HealthRingsCard.tsx` - Apple Health style rings
- `IslamicDateHeader.tsx` - Hijri + Gregorian date

**State Management:**
- Prayer times (from AlAdhan API)
- Current location
- Countdown timer
- Daily ayah

**Notes:**
- Match exact spacing and shadow from Flutter
- Ensure countdown updates smoothly
- Test prayer time transitions (midnight rollover)

---

## 3. Quran Reading Screen

### 3.1 Surah List

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/quran/screens/quran_reading_screen.dart`

**Key Elements:**
- [ ] Search bar at top
- [ ] List of 114 Surahs
- [ ] Each item shows: Surah number, Arabic name, English name, revelation place, verse count
- [ ] Scroll to top button
- [ ] Tab navigation: Surah / Juz / Bookmarks

**Layout:**
```
┌─────────────────────────────┐
│  [Search Surahs...]         │
├─────────────────────────────┤
│ [Surah] [Juz] [Bookmarks]  │ <- Tabs
├─────────────────────────────┤
│                             │
│  1  Al-Fatihah              │ <- Surah item
│     الفاتحة                 │
│     Makkah • 7 verses       │
│  ─────────────────────      │
│  2  Al-Baqarah              │
│     البقرة                  │
│     Madinah • 286 verses    │
│  ─────────────────────      │
│  ...                        │
│                             │
│                      [↑]    │ <- Scroll to top
└─────────────────────────────┘
```

**Colors:**
- Search bar: colors.surface
- Surah items: colors.surface with separator
- Arabic text: colors.text
- Metadata: colors.textSecondary

**Typography:**
- Surah number: typography.title.large
- Surah name (English): typography.title.medium
- Surah name (Arabic): typography.arabic.heading
- Metadata: typography.label.medium

#### React Native Implementation
**File:** `app/screens/QuranSurahListScreen.tsx`

**Status:** Not started

**Differences:** None expected

**Notes:**
- Use FlatList with getItemLayout for performance
- Implement search with debouncing
- Add pull-to-refresh

---

### 3.2 Surah Reading View

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/quran/screens/surah_detail_screen.dart`

**Key Elements:**
- [ ] Top header: Surah name, info button, audio button, bookmark button
- [ ] Bismillah at top (except Surah 9)
- [ ] List of verses
- [ ] Each verse: Arabic text, translation (toggle), verse number
- [ ] Long press menu: Copy, Share, Bookmark, Note
- [ ] Floating audio player (when playing)

**Layout:**
```
┌─────────────────────────────┐
│ [←] Al-Baqarah  [ℹ] [🎵] [★]│ <- Header
├─────────────────────────────┤
│                             │
│  ﷽                         │ <- Bismillah
│                             │
│  ┌─────────────────────┐   │
│  │ ٱلَّذِينَ يُؤْمِنُونَ │   │ <- Verse (RTL)
│  │ بِٱلْغَيْبِ...       │   │
│  │                     │   │
│  │ Those who believe   │   │ <- Translation
│  │ in the unseen...    │   │
│  │                 [3] │   │ <- Verse number
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │ وَيُقِيمُونَ...      │   │
│  │                     │   │
│  │ And they establish  │   │
│  │ prayer...           │   │
│  │                 [4] │   │
│  └─────────────────────┘   │
│                             │
│  ...                        │
│                             │
│ ┌───────────────────────┐  │ <- Floating audio player
│ │ [◄◄] [▶] [►►]  3:45   │  │
│ └───────────────────────┘  │
└─────────────────────────────┘
```

**Colors:**
- Verse cards: colors.surface
- Arabic text: colors.text (larger font)
- Translation: colors.textSecondary
- Verse number: colors.primary

**Typography:**
- Arabic: typography.arabic.quran (24sp, Uthman font)
- Translation: typography.arabic.translation (16sp)
- Verse number: typography.label.medium

**Animations:**
- Smooth scroll to verse
- Fade in verses on load
- Audio player slides up from bottom

#### React Native Implementation
**File:** `app/screens/QuranSurahDetailScreen.tsx`

**Status:** Not started

**Differences:** None expected

**Components to Create:**
- `VerseCard.tsx` - Arabic + translation card
- `AudioPlayer.tsx` - Floating audio controls
- `VerseLongPressMenu.tsx` - Context menu

**Notes:**
- Use FlatList with windowSize optimization
- Implement verse highlighting when audio plays
- Save last read position
- Handle RTL Arabic text properly

---

## 4. Qibla Compass Screen

### 4.1 Compass View

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/qibla/screens/qibla_screen.dart`

**Key Elements:**
- [ ] Compass rose (rotating based on device orientation)
- [ ] Kaaba icon/arrow pointing to Qibla
- [ ] Degree display
- [ ] Distance to Kaaba
- [ ] Location display
- [ ] Calibration instructions (when needed)

**Layout:**
```
┌─────────────────────────────┐
│         Qibla Direction     │
├─────────────────────────────┤
│                             │
│         Your Location       │
│         New York, USA       │
│                             │
│       ┌─────────────┐       │
│       │      N      │       │
│       │             │       │
│       │  W     🕋  E│       │ <- Rotating compass
│       │             │       │    Kaaba icon points
│       │      S      │       │    to Qibla
│       └─────────────┘       │
│                             │
│         56° NE              │ <- Qibla direction
│         9,234 km            │ <- Distance
│                             │
│  [Calibrate Compass]        │ <- Button (if needed)
│                             │
└─────────────────────────────┘
```

**Colors:**
- Compass background: gradient (primary to secondary)
- Compass rose: white/light
- Kaaba icon: colors.islamicGold
- Text: white on gradient, colors.text on background

**Typography:**
- Title: typography.headline.medium
- Location: typography.body.medium
- Degree: typography.display.large
- Distance: typography.title.medium

**Animations:**
- Compass rotates smoothly (30 FPS)
- Kaaba icon pulses gently

#### React Native Implementation
**File:** `app/screens/QiblaScreen.tsx`

**Status:** Not started

**Differences:** None expected

**Components to Create:**
- `CompassRose.tsx` - Rotating compass using react-native-svg
- `KaabaIcon.tsx` - Kaaba/arrow indicator
- `CalibrationOverlay.tsx` - Calibration instructions

**Libraries:**
- react-native-sensors (magnetometer)
- react-native-svg (compass graphics)

**Notes:**
- Calculate Qibla using great circle formula
- Correct for magnetic declination
- Smooth out sensor jitter
- Show calibration UI when accuracy is low
- Test accuracy with reference apps

---

## 5. Prayer Timing Details Screen

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/prayer_timing/screens/prayer_timing_screen.dart`

**Key Elements:**
- [ ] Calendar view (current month)
- [ ] Highlighted current day
- [ ] Daily prayer times for selected date
- [ ] Calculation method selector
- [ ] Location selector

**Layout:**
```
┌─────────────────────────────┐
│  [←] Prayer Times           │
├─────────────────────────────┤
│  November 2025              │
│  S  M  T  W  T  F  S        │
│           1  2  3  4  5     │
│  6  7  8  9 [10] 11 12      │ <- Today highlighted
│  13 14 15 16 17 18 19       │
│  ...                        │
├─────────────────────────────┤
│  Prayer Times for Nov 10    │
│                             │
│  Fajr         5:30 AM       │
│  Sunrise      6:45 AM       │
│  Dhuhr        12:15 PM      │
│  Asr          3:45 PM       │
│  Maghrib      6:20 PM       │
│  Isha         7:45 PM       │
│                             │
│  Calculation Method         │
│  [Islamic Society of NA ▼] │
│                             │
│  Location                   │
│  [New York, USA        ▼]  │
└─────────────────────────────┘
```

#### React Native Implementation
**File:** `app/screens/PrayerTimingScreen.tsx`

**Status:** Not started

**Components to Create:**
- `IslamicCalendar.tsx` - Calendar with Hijri dates
- `PrayerTimesList.tsx` - Detailed prayer times

**Notes:**
- Use react-native-calendars with custom styling
- Allow date selection to see past/future times

---

## 6. Settings Screen

**Status:** 🔴 Not Started

#### Flutter Implementation
**File:** `lib/src/features/settings/screens/settings_screen.dart`

**Key Elements:**
- [ ] User profile section (if authenticated)
- [ ] Theme toggle (Light/Dark/Auto)
- [ ] Language selector
- [ ] Text size slider
- [ ] Notification settings
- [ ] Prayer calculation method
- [ ] Audio settings
- [ ] About/Help
- [ ] Sign out button

**Layout:**
```
┌─────────────────────────────┐
│  Settings                   │
├─────────────────────────────┤
│                             │
│  ┌─────────────────────┐   │
│  │ [👤] John Doe       │   │ <- Profile
│  │      john@email.com │   │
│  └─────────────────────┘   │
│                             │
│  APPEARANCE                 │
│  Theme          [Dark  ▼]  │
│  Text Size      [● ─────]  │ <- Slider
│                             │
│  PRAYER                     │
│  Calculation    [ISNA  ▼]  │
│  Notifications  [>]         │
│  Location       [>]         │
│                             │
│  QURAN                      │
│  Translation    [>]         │
│  Audio Reciter  [>]         │
│  Text Size      [>]         │
│                             │
│  GENERAL                    │
│  Language       [English ▼]│
│  Storage        [>]         │
│  About          [>]         │
│  Help & Support [>]         │
│                             │
│  ACCOUNT                    │
│  [Sign Out]                 │
│  [Delete Account]           │
│                             │
└─────────────────────────────┘
```

#### React Native Implementation
**File:** `app/screens/SettingsScreen.tsx`

**Status:** Not started

**Notes:**
- Group settings by category
- Use native pickers for iOS (UIPickerView)
- Use bottom sheets for Android
- Persist all settings immediately

---

## 7. Additional Screens (To be documented)

### Screens to Document:

- [ ] 7.1 Hadith List Screen
- [ ] 7.2 Hadith Detail Screen
- [ ] 7.3 Duas List Screen
- [ ] 7.4 Dua Detail Screen
- [ ] 7.5 Tasbih Screen
- [ ] 7.6 Islamic Calendar Screen
- [ ] 7.7 Community Groups List
- [ ] 7.8 Community Group Detail
- [ ] 7.9 Nearby Mosques Map
- [ ] 7.10 Mosque Detail Screen
- [ ] 7.11 AI Chatbot Screen
- [ ] 7.12 Profile Screen
- [ ] 7.13 Bookmarks Screen
- [ ] 7.14 Notification Settings
- [ ] 7.15 Premium Subscription Screen

---

## Screenshot Checklist

### Flutter App Screenshots Needed:

**Priority 1 (P0 screens):**
- [ ] Welcome/Auth screen
- [ ] Home screen (Prayer times) - Light mode
- [ ] Home screen - Dark mode
- [ ] Quran Surah list
- [ ] Quran reading view
- [ ] Qibla compass
- [ ] Prayer timing details
- [ ] Settings screen

**Priority 2 (P1 screens):**
- [ ] Hadith list
- [ ] Duas list
- [ ] Tasbih counter
- [ ] Bookmarks view
- [ ] Audio player (Quran)

**Priority 3 (P2+ screens):**
- [ ] Calendar view
- [ ] Community groups
- [ ] Nearby mosques
- [ ] Profile screen

**Screenshot Location:** `ai-reference/screenshots/flutter/`

---

## React Native Implementation Checklist

For each screen:
- [ ] Create screen component
- [ ] Create child components
- [ ] Implement state management
- [ ] Match colors exactly
- [ ] Match typography exactly
- [ ] Match spacing exactly
- [ ] Implement animations
- [ ] Test on iOS
- [ ] Test on Android
- [ ] Test light mode
- [ ] Test dark mode
- [ ] Compare screenshots side-by-side
- [ ] Get approval before marking complete

---

## Comparison Template (Copy for new screens)

```markdown
### X.X Screen Name

**Status:** 🔴 Not Started | 🟡 In Progress | 🟢 Complete

#### Flutter Implementation
**File:** `path/to/flutter/file.dart`

**Key Elements:**
- [ ] Element 1
- [ ] Element 2

**Layout:**
[ASCII layout diagram or description]

**Colors:**
- Element: color

**Typography:**
- Element: typography style

**Spacing:**
- Element: spacing value

**Animations:**
- Animation description

#### React Native Implementation
**File:** `app/screens/ScreenName.tsx`

**Status:** Not started | In progress | Complete

**Differences:**
- Difference 1
- Difference 2

**Components to Create:**
- Component1.tsx
- Component2.tsx

**Notes:**
- Implementation notes
- Gotchas
- Test cases
```

---

**Last Updated:** 2025-11-10
**Next Review:** After each screen implementation
**Maintained By:** Development team
