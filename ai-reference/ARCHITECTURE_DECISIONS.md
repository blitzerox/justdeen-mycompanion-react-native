# Architecture Decisions

**Project:** JustDeen MyCompanion - React Native Migration
**Last Updated:** 2025-11-10

---

## Decision Log

### ADR-001: Use Ignite Boilerplate as Foundation

**Date:** 2025-11-10
**Status:** ✅ Accepted
**Context:**
- Need to migrate Flutter app to React Native
- Want best practices and proven architecture
- Need to accelerate development

**Decision:**
Use Ignite boilerplate (Infinite Red) as the foundation for the React Native app.

**Rationale:**
- Battle-tested React Native architecture
- Built-in state management (MobX-State-Tree)
- Excellent folder structure and conventions
- Active maintenance and community support
- TypeScript-first approach
- Includes navigation, theming, and utilities out of the box

**Consequences:**
- ✅ Faster development with proven patterns
- ✅ Less boilerplate code to write
- ✅ Better code organization
- ⚠️ Learning curve for Ignite conventions
- ⚠️ Must adapt Ignite theme to Flutter's Apple Health design

**Alternatives Considered:**
1. Custom setup - Too time-consuming
2. Expo - Less control over native modules
3. React Native CLI bare - More setup required

---

### ADR-002: MobX-State-Tree + React Query for State Management

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Flutter app uses BLoC pattern
- Need state management for local and server state
- Ignite includes MST by default

**Decision:**
Use MobX-State-Tree (MST) for local state and React Query for server state.

**Rationale:**
- **MST** (comes with Ignite):
  - Type-safe state management
  - Time-travel debugging
  - Snapshot/restore functionality
  - Good for local app state (auth, settings, UI state)

- **React Query**:
  - Excellent for server state (API calls)
  - Built-in caching, refetching, optimistic updates
  - Reduces boilerplate for API calls
  - Perfect for prayer times, Quran data fetching

**Consequences:**
- ✅ Clear separation: Local state (MST) vs Server state (React Query)
- ✅ Less boilerplate than Redux
- ✅ Better caching and offline support
- ⚠️ Two state management paradigms to learn

**Alternatives Considered:**
1. Redux Toolkit - More boilerplate
2. Zustand - Less structure
3. Recoil - Experimental

---

### ADR-003: Cloudflare D1 Instead of AWS DynamoDB

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Flutter app uses AWS DynamoDB
- Need to migrate database for community features, bookmarks, sync
- Want lower costs and better performance

**Decision:**
Migrate from AWS DynamoDB to Cloudflare D1 (SQLite at the edge).

**Rationale:**
- **Cost**: D1 is significantly cheaper than DynamoDB
- **Performance**: Edge computing = lower latency globally
- **SQL**: Easier to query than NoSQL for complex relationships
- **Simplicity**: Cloudflare Workers + D1 = simpler infrastructure
- **Scalability**: Auto-scales with Cloudflare
- **Developer Experience**: Standard SQL queries vs DynamoDB query syntax

**Migration Strategy:**
1. Create D1 schemas matching DynamoDB structure
2. Write migration scripts to export DynamoDB → D1
3. Run parallel systems during transition
4. Validate data integrity
5. Cutover to D1

**Consequences:**
- ✅ Lower costs (estimated 80% reduction)
- ✅ Better query capabilities with SQL
- ✅ Faster global access (edge compute)
- ✅ Easier to understand and maintain
- ⚠️ Migration effort required
- ⚠️ Team needs to learn Cloudflare Workers

**Alternatives Considered:**
1. Keep DynamoDB - High costs, harder queries
2. PostgreSQL (Supabase) - More expensive, overkill
3. Firebase - Vendor lock-in concerns

---

### ADR-004: WatermelonDB for Offline Quran Storage

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Quran must work 100% offline
- 6,236 verses + translations = significant data
- Need fast queries and efficient storage

**Decision:**
Use WatermelonDB for local Quran storage.

**Rationale:**
- **Performance**: Built for large datasets, lazy loading
- **Offline-first**: Designed for offline operation
- **React Native optimized**: Native performance
- **Observable**: Integrates well with MST/React
- **Sync capable**: Can sync with server if needed
- **SQLite underneath**: Reliable and battle-tested

**Schema Design:**
```typescript
// Surahs table
surahs: { id, number, name_arabic, name_english, revelation_place, verses_count }

// Verses table
verses: { id, surah_id, verse_number, text_arabic, text_simple }

// Translations table
translations: { id, verse_id, language, text }

// Bookmarks table
bookmarks: { id, verse_id, user_id, created_at, note }
```

**Consequences:**
- ✅ Excellent performance for large datasets
- ✅ True offline capability
- ✅ Fast queries and searches
- ⚠️ Initial setup complexity
- ⚠️ Database migration scripts needed

**Alternatives Considered:**
1. AsyncStorage - Too slow for 6,000+ verses
2. Realm - Discontinued React Native support
3. SQLite (direct) - Less React integration

---

### ADR-005: React Native MMKV for Secure Storage

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Need to store auth tokens, settings, preferences
- Must be fast and secure
- AsyncStorage is deprecated and slow

**Decision:**
Use react-native-mmkv for key-value storage.

**Rationale:**
- **Performance**: 30x faster than AsyncStorage
- **Encryption**: Built-in encryption support
- **Synchronous**: No async/await needed
- **Type-safe**: TypeScript support
- **Small footprint**: Lightweight
- **Battle-tested**: Used by major apps

**Use Cases:**
- Authentication tokens (encrypted)
- User preferences
- Last prayer times cache
- Theme preference
- Language selection
- Last read Quran position

**Consequences:**
- ✅ Very fast read/write operations
- ✅ Secure token storage
- ✅ No async complexity for simple storage
- ⚠️ Not suitable for complex queries (use WatermelonDB)

**Alternatives Considered:**
1. AsyncStorage - Too slow, deprecated
2. Keychain/Keystore (native) - Too complex for all use cases
3. SecureStore (Expo) - Not using Expo

---

### ADR-006: React Native Track Player for Audio

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Need Quran recitation playback
- Must support background playback
- Lock screen controls required
- Multiple reciters support

**Decision:**
Use react-native-track-player for audio playback.

**Rationale:**
- **Background playback**: Works when app is minimized
- **Lock screen controls**: Native media controls
- **Streaming**: Supports both streaming and local files
- **Events**: Rich event system for playback state
- **Platform support**: iOS and Android
- **Active maintenance**: Well-maintained library

**Features:**
- Verse-by-verse playback
- Continuous playback (full Surah)
- Repeat modes (verse, Surah, all)
- Playback speed control
- Download for offline listening

**Consequences:**
- ✅ Professional audio experience
- ✅ Lock screen integration
- ✅ Background playback works reliably
- ⚠️ Slightly complex setup
- ⚠️ Native module (requires linking)

**Alternatives Considered:**
1. Expo AV - Not using Expo
2. React Native Sound - No background support
3. React Native Audio - Less maintained

---

### ADR-007: AlAdhan API for Prayer Times

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Prayer times are mission-critical
- Must be accurate within ±1 minute
- Flutter app already uses AlAdhan API
- Need multiple calculation methods

**Decision:**
Continue using AlAdhan API (https://aladhan.com/prayer-times-api) for prayer time calculations.

**Rationale:**
- **Proven**: Already used in Flutter app
- **Accurate**: Well-tested calculation methods
- **Free**: No cost for reasonable usage
- **Multiple methods**: ISNA, MWL, Egypt, Makkah, etc.
- **Reliable**: 99.9% uptime
- **Cacheable**: Can cache for offline use

**Implementation:**
```typescript
// API endpoint
GET https://api.aladhan.com/v1/timings/:timestamp
  ?latitude=40.7128
  &longitude=-74.0060
  &method=2

// Cache strategy:
- Fetch daily at midnight
- Store 30 days in advance
- Use cached times when offline
- Refetch if location changes significantly
```

**Consequences:**
- ✅ Matches Flutter app accuracy
- ✅ No calculation complexity on device
- ✅ Multiple methods supported
- ⚠️ Requires internet for updates
- ⚠️ Need fallback for offline (cache)

**Alternatives Considered:**
1. Custom calculation - Too complex, error-prone
2. Local library (praytimes.js) - Less accurate
3. Google Calendar API - Not designed for this

---

### ADR-008: React Native Sensors for Qibla Compass

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Qibla compass requires device magnetometer
- Need accurate orientation data
- Must be smooth (30+ FPS)

**Decision:**
Use react-native-sensors for magnetometer access.

**Rationale:**
- **Direct access**: To device magnetometer
- **Observable streams**: RxJS-based, easy to filter/transform
- **Cross-platform**: Works on iOS and Android
- **Low-level control**: Can implement custom filtering

**Implementation:**
```typescript
import { magnetometer } from 'react-native-sensors';

// Subscribe to magnetometer
magnetometer.subscribe(({ x, y, z }) => {
  const angle = Math.atan2(y, x) * (180 / Math.PI);
  const qiblaDirection = calculateQibla(userLocation);
  const adjustedAngle = angle - qiblaDirection;
  updateCompass(adjustedAngle);
});
```

**Accuracy Improvements:**
- Low-pass filter to smooth jitter
- Magnetic declination correction
- Calibration UI when accuracy is low
- Combine with gyroscope for stability

**Consequences:**
- ✅ Direct sensor access
- ✅ Smooth animations possible
- ✅ Can implement custom smoothing
- ⚠️ Battery usage (when active)
- ⚠️ Need to handle sensor unavailability

**Alternatives Considered:**
1. React Native Compass Heading - Less control
2. Expo Sensors - Not using Expo
3. Native modules - Unnecessary complexity

---

### ADR-009: React Navigation v6 (Ignite Default)

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Ignite includes React Navigation v6
- Need bottom tabs + stack navigation
- Flutter uses custom bottom navigation

**Decision:**
Use React Navigation v6 (Ignite default) with Bottom Tabs and Stack navigators.

**Rationale:**
- **Industry standard**: Most popular React Native navigation
- **Well-maintained**: Active development
- **Feature-rich**: Supports all navigation patterns
- **Theme support**: Easily themed to match Flutter
- **TypeScript**: Excellent TypeScript support
- **Deep linking**: Built-in support

**Navigation Structure:**
```
Root Navigator (Stack)
├── AuthStack
│   ├── Welcome
│   └── SignIn
└── MainTabs (Bottom Tabs)
    ├── PrayTab (Stack)
    │   ├── Home
    │   └── PrayerDetails
    ├── ReadTab (Stack)
    │   ├── QuranList
    │   ├── SurahDetail
    │   └── BookmarksList
    ├── ReflectTab (Stack)
    │   ├── HadithList
    │   └── HadithDetail
    ├── AITab (Stack)
    │   └── Chatbot
    └── SettingsTab (Stack)
        ├── Settings
        ├── Profile
        └── NotificationSettings
```

**Consequences:**
- ✅ Standard React Native navigation
- ✅ Easy to customize bottom tabs to match Flutter
- ✅ Great documentation and community
- ⚠️ Must customize tab bar to match Apple Health style

**Alternatives Considered:**
1. React Native Navigation (Wix) - More complex
2. Custom navigation - Reinventing the wheel

---

### ADR-010: Adapt Ignite Theme to Flutter's Apple Health Design

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Flutter app uses Apple Health-inspired design
- Ignite has its own theme system
- Must match UI/UX exactly

**Decision:**
Adapt Ignite's theme system to match Flutter's Apple Health design, including WWDC colors and per-screen color themes.

**Implementation:**
- Override `app/theme/colors.ts` with Flutter colors
- Update `app/theme/typography.ts` with Flutter text styles
- Update `app/theme/spacing.ts` with Flutter spacing
- Add `app/theme/screenColors.ts` for per-screen theming
- Include Arabic fonts (Uthman, Jameel)

**Flutter Theme Mapping:**
```typescript
// Flutter theme.dart → React Native colors.ts
primaryColor → colors.primary
secondaryColor → colors.secondary
backgroundColor → colors.background
surfaceColor → colors.surface

// WWDC colors → colors.palette
wwdc_colors.dart → colors.palette.ios

// Screen colors → colors.screenColors
screen_themes.dart → colors.screenColors.pray/read/reflect/etc
```

**Consequences:**
- ✅ UI/UX matches Flutter app exactly
- ✅ Uses Ignite's theme system (DRY)
- ✅ Easy to toggle light/dark mode
- ✅ Per-screen color themes preserved
- ⚠️ Must maintain two theme files (Flutter + RN)

---

### ADR-011: TypeScript Strict Mode

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Ignite uses TypeScript
- Need to prevent bugs and improve code quality
- Team may not be TypeScript experts

**Decision:**
Enable TypeScript strict mode for the entire project.

**Rationale:**
- **Type safety**: Catch errors at compile time
- **Better IDE support**: Autocomplete and refactoring
- **Documentation**: Types serve as documentation
- **Maintainability**: Easier to refactor

**Configuration:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true
  }
}
```

**Consequences:**
- ✅ Fewer runtime errors
- ✅ Better code quality
- ✅ Easier to maintain
- ⚠️ Slightly more code to write
- ⚠️ Learning curve for TypeScript

---

### ADR-012: Feature-Based Folder Structure

**Date:** 2025-11-10
**Status:** ✅ Accepted

**Context:**
- Flutter app uses feature-based structure
- Ignite has its own structure
- Want to maintain feature cohesion

**Decision:**
Use feature-based folder structure within Ignite's conventions.

**Structure:**
```
app/
├── screens/
│   ├── AuthScreens/
│   │   ├── WelcomeScreen.tsx
│   │   └── SignInScreen.tsx
│   ├── PrayerScreens/
│   │   ├── HomeScreen.tsx
│   │   └── PrayerTimingScreen.tsx
│   ├── QuranScreens/
│   │   ├── SurahListScreen.tsx
│   │   └── SurahDetailScreen.tsx
│   └── ...
├── components/
│   ├── Prayer/
│   │   ├── PrayerCard.tsx
│   │   ├── PrayerListItem.tsx
│   │   └── index.ts
│   ├── Quran/
│   │   ├── VerseCard.tsx
│   │   ├── AudioPlayer.tsx
│   │   └── index.ts
│   └── Shared/
│       ├── ArabicText.tsx
│       ├── IslamicIcon.tsx
│       └── index.ts
├── models/ (MST stores)
│   ├── AuthStore.ts
│   ├── PrayerStore.ts
│   ├── QuranStore.ts
│   └── RootStore.ts
├── services/
│   ├── api/
│   │   ├── aladhanApi.ts
│   │   ├── cloudflareApi.ts
│   │   └── index.ts
│   └── storage/
│       ├── quranDb.ts (WatermelonDB)
│       └── mmkvStorage.ts
└── utils/
    ├── prayer/
    │   ├── qiblaCalculations.ts
    │   └── prayerHelpers.ts
    └── quran/
        ├── arabicUtils.ts
        └── verseHelpers.ts
```

**Consequences:**
- ✅ Features are co-located
- ✅ Easy to find related code
- ✅ Scales well with many features
- ⚠️ Some duplication across features

---

## Summary of Key Decisions

| Decision | Technology | Rationale |
|----------|------------|-----------|
| Boilerplate | Ignite | Proven patterns, faster development |
| State (Local) | MobX-State-Tree | Type-safe, Ignite default |
| State (Server) | React Query | Caching, refetching, optimistic updates |
| Database (Cloud) | Cloudflare D1 | Cost, performance, SQL |
| Database (Local) | WatermelonDB | Offline Quran, performance |
| Storage | react-native-mmkv | Fast, encrypted, synchronous |
| Audio | react-native-track-player | Background, lock screen |
| Prayer API | AlAdhan API | Proven, accurate, free |
| Sensors | react-native-sensors | Direct access, smooth |
| Navigation | React Navigation v6 | Industry standard |
| Theme | Ignite (customized) | Match Flutter Apple Health design |
| Language | TypeScript (strict) | Type safety, maintainability |
| Structure | Feature-based | Co-location, scalability |

---

## Open Questions & Future Decisions

### TBD-001: Analytics Platform
**Question:** Which analytics platform to use?
**Options:** Firebase Analytics, Mixpanel, Amplitude
**Decision Date:** TBD (after MVP)

### TBD-002: Error Tracking
**Question:** Which error tracking service?
**Options:** Sentry, Bugsnag, Firebase Crashlytics
**Decision Date:** Before beta launch

### TBD-003: Push Notifications
**Question:** Which push notification service?
**Options:** Firebase Cloud Messaging, OneSignal, Native iOS/Android
**Decision Date:** When implementing notifications (Phase 2)

### TBD-004: Testing Framework
**Question:** Which E2E testing framework?
**Options:** Detox, Appium, Maestro
**Decision Date:** Before QA phase

### TBD-005: CI/CD Platform
**Question:** Which CI/CD for builds and deployments?
**Options:** GitHub Actions, Bitrise, CircleCI
**Decision Date:** Before first production build

---

**Last Updated:** 2025-11-10
**Next Review:** Monthly during development
**Decision Authority:** Technical Lead + Team consensus
