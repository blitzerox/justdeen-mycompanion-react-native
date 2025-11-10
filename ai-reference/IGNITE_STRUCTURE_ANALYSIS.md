# Ignite Boilerplate Structure Analysis

**Project:** JustDeen MyCompanion - React Native Migration
**Last Updated:** 2025-11-10
**Ignite Version:** Expo 54 + React Native 0.81
**Status:** ✅ Analysis Complete

---

## Overview

This project uses the **modern Ignite boilerplate** (Expo-based) with:
- Expo 54 with native development
- React Navigation 7 (stack + bottom tabs)
- Theme Context for design tokens (light/dark)
- i18next for internationalization
- MMKV for persistent storage
- React Context for state management (no Redux/MobX)
- TypeScript with strict mode
- Component-driven architecture

---

## 📁 Complete Folder Structure

```
app/
├── app.tsx                          # Root component with providers
├── components/                      # Reusable UI components (production-ready)
│   ├── AutoImage.tsx
│   ├── Button.tsx                  # Button with presets (default/filled/reversed)
│   ├── Card.tsx
│   ├── EmptyState.tsx
│   ├── Header.tsx
│   ├── Icon.tsx
│   ├── ListItem.tsx
│   ├── Screen.tsx                  # Safe area wrapper
│   ├── Text.tsx                    # i18n + theme support
│   ├── TextField.tsx
│   └── Toggle/
│       ├── Checkbox.tsx
│       ├── Radio.tsx
│       ├── Switch.tsx
│       └── Toggle.tsx
├── config/                          # Environment configuration
│   ├── config.base.ts
│   ├── config.dev.ts
│   ├── config.prod.ts
│   └── index.ts
├── context/                         # React Context (state management)
│   ├── AuthContext.tsx             # ⚠️ Demo - adapt for JustDeen auth
│   └── EpisodeContext.tsx          # ⚠️ Demo - remove
├── devtools/                        # Reactotron debugging
│   ├── ReactotronClient.ts
│   └── ReactotronConfig.ts
├── i18n/                            # Internationalization
│   ├── index.ts                    # i18next setup
│   ├── translate.ts
│   ├── en.ts, ar.ts, es.ts, etc.  # ✅ Arabic (RTL) already included!
│   └── demo-*.ts                   # ⚠️ Demo translations - remove
├── navigators/                      # Navigation
│   ├── AppNavigator.tsx            # Main stack navigator
│   ├── DemoNavigator.tsx           # ⚠️ Demo bottom tabs - replace
│   ├── navigationTypes.ts
│   └── navigationUtilities.ts
├── screens/                         # Screen components
│   ├── WelcomeScreen.tsx           # ⚠️ Demo - replace
│   ├── LoginScreen.tsx             # ⚠️ Demo - use as template
│   ├── DemoShowroomScreen/         # ⚠️ Demo - remove
│   ├── DemoPodcastListScreen.tsx   # ⚠️ Demo - remove
│   ├── DemoCommunityScreen.tsx     # ⚠️ Demo - remove
│   ├── DemoDebugScreen.tsx         # ⚠️ Demo - remove
│   └── ErrorScreen/
│       ├── ErrorBoundary.tsx       # ✅ Keep
│       └── ErrorDetails.tsx        # ✅ Keep
├── services/                        # API and external services
│   └── api/
│       ├── index.ts                # API class (apisauce)
│       ├── apiProblem.ts           # Error handling
│       └── types.ts
├── theme/                           # ⭐ THEME SYSTEM - Will customize
│   ├── colors.ts                   # Light theme colors
│   ├── colorsDark.ts               # Dark theme colors
│   ├── spacing.ts                  # Light theme spacing
│   ├── spacingDark.ts              # Dark theme spacing
│   ├── typography.ts               # Font configuration
│   ├── timing.ts                   # Animation timing
│   ├── styles.ts                   # Global utility styles
│   ├── theme.ts                    # Theme definitions
│   ├── types.ts                    # Theme type definitions
│   ├── context.tsx                 # ThemeProvider
│   └── context.utils.ts            # Theme utilities
└── utils/                           # Utility functions
    ├── storage/
    │   ├── index.ts                # MMKV wrapper
    │   └── storage.test.ts
    ├── useHeader.tsx               # Navigation header hook
    ├── useSafeAreaInsetsStyle.ts
    ├── useIsMounted.ts
    ├── gestureHandler.ts
    ├── openLinkInBrowser.ts
    ├── formatDate.ts
    ├── delay.ts
    └── crashReporting.ts
```

---

## 🎨 Theme System (Current Ignite Structure)

### Current Color System

**app/theme/colors.ts** (Light theme)
```typescript
Palette:
- neutral100-900: White to black gradient
- primary100-600: Warm brown tones (brand)
- secondary100-500: Blue/purple tones
- accent100-500: Golden/orange highlights
- angry100, angry500: Red error states
- overlay20, overlay50: Semi-transparent overlays

Semantic mappings:
- text: neutral800
- textDim: neutral600
- background: neutral200
- border: neutral400
- tint: primary500
- separator: neutral300
- error: angry500
```

### ⭐ What We'll Change for JustDeen

**Will replace with WWDC 5-tab color system:**
```typescript
// NEW: app/theme/colors.ts
const tabColors = {
  pray: { primary: '#5856D6', light: '#7B79E8', dark: '#4745B8' },     // Purple
  read: { primary: '#007AFF', light: '#4DA6FF', dark: '#0062CC' },     // Blue
  reflect: { primary: '#FF9500', light: '#FFAD33', dark: '#CC7700' },  // Orange
  ai: { primary: '#6366F1', light: '#8B8DF4', dark: '#4F52C1' },       // Indigo
  settings: { primary: '#34C759', light: '#5EE272', dark: '#28AC3C' }, // Green
}

// System colors (iOS style)
const systemColors = {
  background: '#F2F2F7',       // iOS background
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#3C3C43',
  separator: '#3C3C4329',
  // ... all from UI_DESIGN_SYSTEM.md
}
```

### Current Typography

**app/theme/typography.ts**
```typescript
Current fonts:
- Primary: Space Grotesk (Google Font)
- Secondary: Platform default (Helvetica Neue/sans-serif)
```

### ⭐ What We'll Change

**Add SF Pro + Arabic fonts:**
```typescript
const fonts = {
  system: Platform.select({
    ios: 'SF Pro Text',
    android: 'Roboto',  // Or include SF Pro for Android
  }),
  display: Platform.select({
    ios: 'SF Pro Display',
    android: 'Roboto',
  }),
  arabic: {
    quran: 'Uthman',
    islamic: 'Jameel Noori Nastaleeq',
  },
}

// Typography scale from UI_DESIGN_SYSTEM.md
const typography = {
  largeTitle: { fontSize: 34, fontWeight: '700', ... },
  title1: { fontSize: 28, ... },
  // ... all iOS HIG styles
}
```

### Current Spacing

**app/theme/spacing.ts**
```typescript
Current spacing:
xxxs: 2, xxs: 4, xs: 8, sm: 12, md: 16,
lg: 24, xl: 32, xxl: 48, xxxl: 64
```

### ⭐ What We'll Keep/Add

**Already follows 8pt grid! Will add component-specific spacing:**
```typescript
const spacing = {
  // Keep existing
  ...currentSpacing,

  // Add JustDeen-specific
  screenHorizontal: 16,
  screenVertical: 20,
  cardPadding: 16,
  cardMargin: 12,
  sectionSpacing: 24,
  // ... from UI_DESIGN_SYSTEM.md
}
```

---

## 🧭 Navigation Structure

### Current Structure

```
NavigationContainer
└── AppStack (NativeStackNavigator)
    ├── Login (if !authenticated)
    └── Demo (DemoNavigator with bottom tabs)
        ├── DemoShowroom
        ├── DemoCommunity
        ├── DemoPodcastList
        └── DemoDebug
```

### ⭐ What We'll Change to JustDeen

```
NavigationContainer
└── AppStack
    ├── AuthStack (if !authenticated)
    │   ├── Welcome
    │   └── SignIn
    └── MainTabs (Bottom Tabs - 5 tabs)
        ├── PrayTab (Stack)
        │   ├── Home (Prayer times)
        │   └── PrayerDetails
        ├── ReadTab (Stack)
        │   ├── QuranList
        │   ├── SurahDetail
        │   └── Bookmarks
        ├── ReflectTab (Stack)
        │   ├── HadithList
        │   ├── DuasList
        │   └── Tasbih
        ├── AITab (Stack)
        │   └── Chatbot
        └── SettingsTab (Stack)
            ├── Settings
            ├── Profile
            └── Preferences
```

**Navigation files to modify:**
- `app/navigators/AppNavigator.tsx` - Update main stack
- `app/navigators/DemoNavigator.tsx` - Replace with `MainTabNavigator.tsx`
- `app/navigators/navigationTypes.ts` - Add JustDeen route types

---

## 💾 State Management

### Current Pattern: React Context (No Redux/MobX)

**Existing contexts:**
1. **AuthContext** - Authentication state with MMKV persistence
   - ✅ Pattern is good - adapt for JustDeen auth
   - Methods: setAuthToken, setAuthEmail, logout
   - Storage: MMKV (react-native-mmkv)

2. **EpisodeContext** - Demo podcast state
   - ⚠️ Remove - replace with JustDeen contexts

### ⭐ JustDeen Contexts to Create

Based on Ignite's pattern, create:

```
app/context/
├── AuthContext.tsx             # ✅ Already exists - adapt
├── PrayerContext.tsx           # NEW: Prayer times, location
├── QuranContext.tsx            # NEW: Quran reading state
├── SettingsContext.tsx         # NEW: User preferences
├── CommunityContext.tsx        # NEW: Reading groups
└── ThemeContext.tsx            # ✅ Already exists - customize
```

**Pattern to follow (from AuthContext):**
```typescript
// Example: PrayerContext.tsx
export const PrayerProvider = ({ children }) => {
  const [prayerTimes, setPrayerTimes] = useState(null)
  const [location, setLocation] = useState(null)

  // MMKV persistence
  useEffect(() => {
    const cached = storage.getString('prayer.times')
    if (cached) setPrayerTimes(JSON.parse(cached))
  }, [])

  // Methods
  const fetchPrayerTimes = async (lat, lng) => {
    // AlAdhan API call
  }

  return (
    <PrayerContext.Provider value={{ prayerTimes, location, fetchPrayerTimes }}>
      {children}
    </PrayerContext.Provider>
  )
}
```

---

## 🔌 Services Layer

### Current API Structure

**app/services/api/index.ts**
```typescript
export class Api {
  apisauce: ApisauceInstance

  constructor() {
    this.apisauce = create({
      baseURL: Config.API_URL,
      timeout: 10000,
      headers: { Accept: "application/json" },
    })
  }

  async getEpisodes(): Promise<GetEpisodesResult> {
    // Demo implementation
  }
}
```

### ⭐ JustDeen API Services to Add

```
app/services/
├── api/
│   ├── index.ts                # ✅ Keep base API class
│   ├── apiProblem.ts           # ✅ Keep error handling
│   ├── types.ts                # Update with JustDeen types
│   ├── aladhanApi.ts           # NEW: Prayer times API
│   └── cloudflareApi.ts        # NEW: D1 backend API
├── prayer/
│   ├── prayerCalculations.ts  # NEW: Prayer time logic
│   └── qiblaCalculations.ts   # NEW: Qibla direction
├── quran/
│   ├── watermelonDb.ts        # NEW: WatermelonDB setup
│   └── quranQueries.ts        # NEW: Quran data queries
└── storage/
    ├── index.ts                # ✅ Already exists (MMKV)
    ├── prayerStorage.ts       # NEW: Prayer times cache
    └── settingsStorage.ts     # NEW: User settings
```

**API methods to add:**
```typescript
class Api {
  // Prayer times
  async getPrayerTimes(lat: number, lng: number, method: number)

  // Cloudflare D1
  async signIn(token: string)
  async getBookmarks(userId: string)
  async createBookmark(data: Bookmark)
  async joinGroup(inviteCode: string)
  async getGroupProgress(groupId: string)

  // ... more endpoints from CLOUDFLARE_INFRASTRUCTURE.md
}
```

---

## 🧩 Component Library

### ✅ Keep All Base Components

Ignite's components are production-ready:
- `Button` - Has presets (default/filled/reversed) - perfect for JustDeen
- `Text` - i18n + theme support - perfect
- `Card` - Good for Prayer cards, Ayah cards
- `ListItem` - Good for Surah lists, settings
- `Screen` - Safe area wrapper - keep
- `Header` - Navigation header - customize
- `TextField` - Input fields - keep
- `Toggle` components - Settings switches - keep

### ⭐ JustDeen-Specific Components to Add

```
app/components/
├── Shared/                      # Keep Ignite components here
│   ├── Button.tsx              # ✅ Already exists
│   ├── Text.tsx                # ✅ Already exists
│   ├── Card.tsx                # ✅ Already exists
│   ├── ListItem.tsx            # ✅ Already exists
│   └── ArabicText.tsx          # NEW: RTL Arabic text wrapper
├── Prayer/                      # NEW folder
│   ├── PrayerCard.tsx
│   ├── PrayerListItem.tsx
│   └── PrayerCountdown.tsx
├── Quran/                       # NEW folder
│   ├── VerseCard.tsx
│   ├── SurahListItem.tsx
│   ├── AudioPlayer.tsx
│   └── BookmarkButton.tsx
├── Qibla/                       # NEW folder
│   ├── CompassRose.tsx
│   └── CalibrationOverlay.tsx
└── Community/                   # NEW folder
    ├── GroupCard.tsx
    ├── PostCard.tsx
    └── MemberListItem.tsx
```

---

## 🌐 Internationalization (i18n)

### ✅ Already Configured!

**app/i18n/** has:
- i18next setup
- Arabic (RTL) support already included!
- Translation helper functions
- Multiple languages (en, ar, es, fr, hi, ja, ko)

### ⭐ What to Add for JustDeen

```
app/i18n/
├── index.ts                    # ✅ Keep
├── translate.ts                # ✅ Keep
├── en.ts                       # Update with JustDeen translations
├── ar.ts                       # Update with Islamic terms
├── ur.ts                       # NEW: Add Urdu
└── translations/               # NEW: Organize by feature
    ├── common.ts
    ├── prayer.ts
    ├── quran.ts
    ├── hadith.ts
    └── settings.ts
```

**Translation keys to add:**
```typescript
// en.ts
export const en = {
  common: {
    ok: "OK",
    cancel: "Cancel",
    // ...
  },
  prayer: {
    fajr: "Fajr",
    dhuhr: "Dhuhr",
    asr: "Asr",
    maghrib: "Maghrib",
    isha: "Isha",
    nextPrayer: "Next Prayer",
    // ...
  },
  // ... more
}
```

---

## 📦 Package Dependencies

### ✅ Already Installed

**Perfect for JustDeen:**
- `react-native-mmkv` - Fast storage (for prayer times cache, settings)
- `react-native-reanimated` - Smooth animations (Qibla compass)
- `react-native-gesture-handler` - Gestures
- `react-native-safe-area-context` - Safe areas
- `apisauce` - HTTP client (for AlAdhan API, Cloudflare D1)
- `i18next` - Internationalization (already set up!)
- `date-fns` - Date utilities (for Hijri calendar)
- `expo-font` - Custom fonts (for Uthman, Jameel)

### ⚠️ Need to Add for JustDeen

```bash
# Database (Quran offline)
yarn add @nozbe/watermelondb @nozbe/with-observables

# API & State
yarn add @tanstack/react-query axios

# Authentication
yarn add @react-native-google-signin/google-signin
yarn add @invertase/react-native-apple-authentication

# Audio (Quran recitation)
yarn add react-native-track-player

# In-App Purchases
yarn add react-native-iap

# Location & Sensors (Prayer times, Qibla)
yarn add react-native-geolocation-service
yarn add react-native-sensors

# Calendar (Hijri)
yarn add react-native-calendars
yarn add date-fns-jalali

# Responsive sizing (like flutter_screenutil)
yarn add react-native-size-matters

# SVG (for icons, compass)
# ✅ Already have react-native-svg
```

---

## 🗑️ Demo Code to Remove

### Files to Delete

**Screens:**
- `app/screens/DemoShowroomScreen/` (entire folder)
- `app/screens/DemoPodcastListScreen.tsx`
- `app/screens/DemoCommunityScreen.tsx`
- `app/screens/DemoDebugScreen.tsx`
- `app/screens/WelcomeScreen.tsx` (use as template, then delete)

**Context:**
- `app/context/EpisodeContext.tsx`

**Translations:**
- `app/i18n/demo-*.ts` files

**Navigator:**
- `app/navigators/DemoNavigator.tsx` (replace with MainTabNavigator)

### Files to Adapt (Not Delete)

**Keep & Modify:**
- `app/screens/LoginScreen.tsx` - Use as template for auth screens
- `app/context/AuthContext.tsx` - Adapt for JustDeen authentication
- `app/services/api/index.ts` - Extend with JustDeen API methods
- `app/navigators/AppNavigator.tsx` - Update navigation structure

---

## 🎯 Ignite Conventions to Follow

1. **ThemedStyle Pattern**
   ```typescript
   const $container: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
     backgroundColor: colors.background,
     padding: spacing.md,
   })

   // In component:
   const { themed } = useAppTheme()
   <View style={themed($container)} />
   ```

2. **i18n in Components**
   ```typescript
   <Text tx="prayer:fajr" />          // Translation key
   <Text text="Manual text" />        // Direct text
   ```

3. **Navigation Types**
   ```typescript
   // Define in navigationTypes.ts
   export type AppStackParamList = {
     Home: undefined
     PrayerDetails: { prayerId: string }
   }

   // Use in component
   type Props = NativeStackScreenProps<AppStackParamList, "Home">
   ```

4. **MMKV Storage**
   ```typescript
   import { storage } from "@/utils/storage"

   storage.set("prayer.times", JSON.stringify(times))
   const cached = storage.getString("prayer.times")
   ```

5. **Generator Anchors**
   - Keep comments like `// IGNITE_GENERATOR_ANCHOR_*` for CLI generators

---

## ✅ Summary: What's Already Perfect

1. **Theme System** - Just needs WWDC colors + SF Pro fonts
2. **Navigation** - Structure is good, just change screens
3. **Storage** - MMKV is perfect for prayer times cache
4. **i18n** - Arabic already supported!
5. **Components** - All base components production-ready
6. **TypeScript** - Strict mode enabled
7. **API Pattern** - apisauce is perfect for AlAdhan + Cloudflare D1

## 🔧 What We Need to Customize

1. **Theme colors** - Replace with WWDC 5-tab colors
2. **Typography** - Add SF Pro + Arabic fonts
3. **Navigation** - Create 5 main tabs + sub-stacks
4. **Contexts** - Add Prayer, Quran, Settings contexts
5. **Services** - Add AlAdhan API, Cloudflare D1, WatermelonDB
6. **Components** - Add Prayer/Quran/Qibla specific components
7. **Translations** - Add Islamic terminology

---

**Next Steps:**
1. Update theme files with WWDC colors
2. Add SF Pro + Arabic fonts
3. Create MainTabNavigator (5 tabs)
4. Begin implementing authentication screens
5. Add AlAdhan API service
6. Set up WatermelonDB for Quran

**Status:** ✅ Ready to begin implementation!
**Estimated Effort:** ~20-26 weeks for complete migration
