# Functional Requirements

**Project:** JustDeen MyCompanion - React Native Migration
**Last Updated:** 2025-11-10
**Source:** Flutter app at `~/Documents/Projects/justdeen`

---

## 1. Authentication & User Management

### 1.1 User Registration & Login

**User Story:** As a user, I want to sign in using multiple methods so I can access the app conveniently and securely.

**Requirements:**
- [ ] FR-AUTH-001: Support Google Sign-In (OAuth 2.0)
- [ ] FR-AUTH-002: Support Apple Sign-In (iOS)
- [ ] FR-AUTH-003: Support Anonymous Sign-In for guest users
- [ ] FR-AUTH-004: Securely store authentication tokens
- [ ] FR-AUTH-005: Auto-refresh expired tokens
- [ ] FR-AUTH-006: Handle sign-out and clear local data
- [ ] FR-AUTH-007: Migrate existing user accounts from DynamoDB to D1

**Acceptance Criteria:**
- Users can sign in with Google in < 3 seconds
- Apple Sign-In works on iOS 13+
- Anonymous users can upgrade to authenticated accounts
- Tokens are stored securely using react-native-mmkv
- Auth state persists across app restarts

**Dependencies:** None

**Priority:** P0 (Must have)

---

## 2. Prayer Times (CRITICAL)

### 2.1 Prayer Time Calculation & Display

**User Story:** As a Muslim user, I need accurate prayer times for my location so I can pray at the correct times.

**Requirements:**
- [ ] FR-PRAYER-001: Calculate 5 daily prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
- [ ] FR-PRAYER-002: Integrate with AlAdhan API for accurate calculations
- [ ] FR-PRAYER-003: Support multiple calculation methods (ISNA, MWL, Egypt, Makkah, etc.)
- [ ] FR-PRAYER-004: Auto-detect user location using GPS
- [ ] FR-PRAYER-005: Allow manual location selection
- [ ] FR-PRAYER-006: Display countdown to next prayer
- [ ] FR-PRAYER-007: Show prayer status (passed, current, upcoming)
- [ ] FR-PRAYER-008: Update automatically at midnight
- [ ] FR-PRAYER-009: Work offline using last known location and cached times

**Acceptance Criteria:**
- Prayer times accurate within ±1 minute
- Location detected in < 5 seconds
- UI updates in real-time
- Times match Flutter app exactly
- Offline mode works for 30 days

**Dependencies:** Geolocation permission, AlAdhan API

**Priority:** P0 (Must have - CRITICAL)

### 2.2 Prayer Notifications

**User Story:** As a user, I want to be notified before prayer times so I don't miss prayers.

**Requirements:**
- [ ] FR-PRAYER-010: Send notifications before each prayer (configurable offset)
- [ ] FR-PRAYER-011: Support Adhan audio playback in notifications (iOS)
- [ ] FR-PRAYER-012: Allow custom notification tones
- [ ] FR-PRAYER-013: Support Do Not Disturb schedule
- [ ] FR-PRAYER-014: Show notification even when app is closed

**Acceptance Criteria:**
- Notifications delivered within ±5 seconds of scheduled time
- User can configure notification offset (0-60 minutes)
- Audio plays correctly on both platforms

**Dependencies:** FR-PRAYER-001 to 009, Notification permissions

**Priority:** P0 (Must have)

---

## 3. Qibla Compass (CRITICAL)

### 3.1 Qibla Direction Finder

**User Story:** As a Muslim user, I need to find the Qibla direction accurately so I can face Kaaba during prayer.

**Requirements:**
- [ ] FR-QIBLA-001: Calculate Qibla direction based on user location
- [ ] FR-QIBLA-002: Display animated compass pointing to Kaaba
- [ ] FR-QIBLA-003: Use device magnetometer for real-time orientation
- [ ] FR-QIBLA-004: Show distance to Kaaba in km/miles
- [ ] FR-QIBLA-005: Display compass calibration UI when needed
- [ ] FR-QIBLA-006: Work offline once location is obtained

**Acceptance Criteria:**
- Qibla direction accurate within ±1 degree
- Compass updates at 30 FPS (smooth animation)
- Calibration UI appears when accuracy is low
- Distance calculation accurate

**Dependencies:** Geolocation, Magnetometer sensor

**Priority:** P0 (Must have - CRITICAL)

---

## 4. Quran Reading

### 4.1 Complete Quran Text

**User Story:** As a user, I want to read the complete Quran offline so I can read anytime, anywhere.

**Requirements:**
- [ ] FR-QURAN-001: Display all 114 Surahs with Arabic text
- [ ] FR-QURAN-002: Store 6,236 verses locally in WatermelonDB
- [ ] FR-QURAN-003: Use Uthman Taha font for Arabic text
- [ ] FR-QURAN-004: Support right-to-left text rendering
- [ ] FR-QURAN-005: Display Surah metadata (name, revelation place, verses count)
- [ ] FR-QURAN-006: Navigate by Surah, Juz, or Verse number
- [ ] FR-QURAN-007: Remember last reading position
- [ ] FR-QURAN-008: Work 100% offline

**Acceptance Criteria:**
- All verses display correctly with proper Arabic rendering
- Navigation is instant (< 500ms)
- Last position restored on app restart
- No internet required after initial setup

**Dependencies:** WatermelonDB setup, Quran database migration

**Priority:** P0 (Must have)

### 4.2 Translations

**User Story:** As a non-Arabic speaker, I want translations so I can understand the Quran.

**Requirements:**
- [ ] FR-QURAN-009: Support multiple translations (English, Urdu, Turkish, etc.)
- [ ] FR-QURAN-010: Display translations alongside Arabic text
- [ ] FR-QURAN-011: Allow switching between translations
- [ ] FR-QURAN-012: Download translations on-demand
- [ ] FR-QURAN-013: Store translations locally

**Acceptance Criteria:**
- At least 5 translations available
- User can toggle translations on/off
- Translations load in < 1 second

**Dependencies:** FR-QURAN-001 to 008

**Priority:** P1 (Should have)

### 4.3 Audio Recitation

**User Story:** As a user, I want to listen to Quran recitation so I can learn pronunciation.

**Requirements:**
- [ ] FR-QURAN-014: Stream audio recitation from multiple reciters
- [ ] FR-QURAN-015: Support verse-by-verse playback
- [ ] FR-QURAN-016: Background audio playback
- [ ] FR-QURAN-017: Download audio for offline listening
- [ ] FR-QURAN-018: Playback controls (play, pause, next, previous, repeat)
- [ ] FR-QURAN-019: Display waveform or progress bar
- [ ] FR-QURAN-020: Lock screen controls

**Acceptance Criteria:**
- Audio plays within 2 seconds of tapping play
- Background playback works when app is minimized
- Lock screen shows Surah/verse info

**Dependencies:** FR-QURAN-001 to 008, react-native-track-player

**Priority:** P1 (Should have)

### 4.4 Bookmarks & Notes

**User Story:** As a user, I want to bookmark verses and add notes so I can reference them later.

**Requirements:**
- [ ] FR-QURAN-021: Bookmark any verse
- [ ] FR-QURAN-022: Add personal notes to verses
- [ ] FR-QURAN-023: Organize bookmarks with tags/categories
- [ ] FR-QURAN-024: Search bookmarks and notes
- [ ] FR-QURAN-025: Sync bookmarks to cloud (Cloudflare D1)

**Acceptance Criteria:**
- Bookmarks save instantly
- Notes support rich text
- Sync works bidirectionally
- Search returns results in < 500ms

**Dependencies:** FR-QURAN-001 to 008, Cloudflare D1 setup

**Priority:** P1 (Should have)

---

## 5. Hadith Collections

### 5.1 Hadith Database

**User Story:** As a user, I want to read authentic Hadiths so I can learn Prophet Muhammad's teachings.

**Requirements:**
- [ ] FR-HADITH-001: Display Sahih Bukhari collection
- [ ] FR-HADITH-002: Display Sahih Muslim collection
- [ ] FR-HADITH-003: Display other major collections (Abu Dawud, Tirmidhi, etc.)
- [ ] FR-HADITH-004: Show Hadith in Arabic and translation
- [ ] FR-HADITH-005: Navigate by book and chapter
- [ ] FR-HADITH-006: Search Hadiths by keywords
- [ ] FR-HADITH-007: Bookmark favorite Hadiths
- [ ] FR-HADITH-008: Work offline

**Acceptance Criteria:**
- At least 2 major collections available
- Search returns results in < 1 second
- All Hadiths display properly formatted

**Dependencies:** Hadith database migration

**Priority:** P1 (Should have)

---

## 6. Duas (Supplications)

### 6.1 Daily Duas

**User Story:** As a user, I want to access daily supplications so I can recite them at appropriate times.

**Requirements:**
- [ ] FR-DUA-001: Display morning and evening duas
- [ ] FR-DUA-002: Show duas for specific occasions (travel, food, sleep, etc.)
- [ ] FR-DUA-003: Display Arabic text with transliteration
- [ ] FR-DUA-004: Show English translation
- [ ] FR-DUA-005: Play audio recitation of duas
- [ ] FR-DUA-006: Favorite frequently used duas
- [ ] FR-DUA-007: Send reminders for morning/evening duas
- [ ] FR-DUA-008: Work offline

**Acceptance Criteria:**
- At least 50 duas available
- Audio plays smoothly
- Reminders delivered on time

**Dependencies:** None

**Priority:** P1 (Should have)

---

## 7. Digital Tasbih (Counter)

### 7.1 Dhikr Counter

**User Story:** As a user, I want a digital counter to track my dhikr (remembrance) so I don't need physical beads.

**Requirements:**
- [ ] FR-TASBIH-001: Increment counter on tap/swipe
- [ ] FR-TASBIH-002: Support haptic feedback on count
- [ ] FR-TASBIH-003: Play sound on count (optional)
- [ ] FR-TASBIH-004: Reset counter
- [ ] FR-TASBIH-005: Set target count (33, 99, custom)
- [ ] FR-TASBIH-006: Track dhikr history
- [ ] FR-TASBIH-007: Multiple dhikr types (Subhanallah, Alhamdulillah, etc.)
- [ ] FR-TASBIH-008: Visual progress indicator

**Acceptance Criteria:**
- Counter responds instantly to taps
- Haptics feel natural
- History syncs to cloud

**Dependencies:** Haptic feedback library

**Priority:** P1 (Should have)

---

## 8. Islamic Calendar (Hijri)

### 8.1 Hijri Date Display

**User Story:** As a user, I want to see the Islamic calendar so I can know important dates.

**Requirements:**
- [ ] FR-CALENDAR-001: Display current Hijri date
- [ ] FR-CALENDAR-002: Show upcoming Islamic events (Ramadan, Eid, etc.)
- [ ] FR-CALENDAR-003: Convert between Hijri and Gregorian dates
- [ ] FR-CALENDAR-004: Display month view calendar
- [ ] FR-CALENDAR-005: Highlight special days (Jumma, 15th Shaban, etc.)
- [ ] FR-CALENDAR-006: Send notifications for upcoming events

**Acceptance Criteria:**
- Hijri date matches official calendar
- Date conversion is accurate
- Events display correctly

**Dependencies:** date-fns-jalali library

**Priority:** P2 (Could have)

---

## 9. Community Reading Groups

### 9.1 Group Management

**User Story:** As a user, I want to join reading groups so I can study Quran with others.

**Requirements:**
- [ ] FR-COMMUNITY-001: Create a reading group
- [ ] FR-COMMUNITY-002: Join existing groups with invite code
- [ ] FR-COMMUNITY-003: Set group reading schedule
- [ ] FR-COMMUNITY-004: Track individual progress in group
- [ ] FR-COMMUNITY-005: View group leaderboard
- [ ] FR-COMMUNITY-006: Leave/delete groups
- [ ] FR-COMMUNITY-007: Sync group data to Cloudflare D1

**Acceptance Criteria:**
- Groups sync in real-time
- Progress updates instantly
- Invite codes work reliably

**Dependencies:** Cloudflare D1 setup, Authentication

**Priority:** P2 (Could have)

### 9.2 Group Communication

**User Story:** As a group member, I want to communicate with others so we can motivate each other.

**Requirements:**
- [ ] FR-COMMUNITY-008: Post updates in group feed
- [ ] FR-COMMUNITY-009: React to posts (like, encourage)
- [ ] FR-COMMUNITY-010: Send notifications for group activity
- [ ] FR-COMMUNITY-011: Moderate content (group admin)

**Acceptance Criteria:**
- Posts appear in < 2 seconds
- Notifications delivered promptly
- Admins can remove inappropriate content

**Dependencies:** FR-COMMUNITY-001 to 007

**Priority:** P2 (Could have)

---

## 10. Nearby Islamic Places

### 10.1 Mosque Finder

**User Story:** As a traveler, I want to find nearby mosques so I can pray in congregation.

**Requirements:**
- [ ] FR-PLACES-001: Find mosques within 5km radius
- [ ] FR-PLACES-002: Display on map view
- [ ] FR-PLACES-003: Show distance and directions
- [ ] FR-PLACES-004: Display mosque details (name, address, prayer times)
- [ ] FR-PLACES-005: Call mosque (if phone number available)
- [ ] FR-PLACES-006: Navigate using Google/Apple Maps
- [ ] FR-PLACES-007: Filter by distance, rating
- [ ] FR-PLACES-008: Find halal restaurants

**Acceptance Criteria:**
- Search completes in < 3 seconds
- At least 10 places shown (if available)
- Directions open in native maps app

**Dependencies:** Google Places API, Geolocation

**Priority:** P2 (Could have)

---

## 11. Premium Features & In-App Purchases

### 11.1 Subscription Management

**User Story:** As a user, I want to upgrade to premium so I can access advanced features.

**Requirements:**
- [ ] FR-IAP-001: Offer monthly and annual subscriptions
- [ ] FR-IAP-002: Process payments via Apple/Google stores
- [ ] FR-IAP-003: Unlock premium features after purchase
- [ ] FR-IAP-004: Restore purchases on new devices
- [ ] FR-IAP-005: Show subscription status in settings
- [ ] FR-IAP-006: Handle subscription expiration
- [ ] FR-IAP-007: Allow cancellation

**Acceptance Criteria:**
- Purchase flow completes in < 30 seconds
- Features unlock immediately
- Restore purchases works reliably

**Dependencies:** react-native-iap, App Store/Play Store setup

**Priority:** P3 (Nice to have)

### 11.2 Premium Features

**Requirements:**
- [ ] FR-IAP-008: Ad-free experience
- [ ] FR-IAP-009: Unlimited bookmarks
- [ ] FR-IAP-010: Advanced analytics
- [ ] FR-IAP-011: Custom themes
- [ ] FR-IAP-012: Offline audio downloads

**Dependencies:** FR-IAP-001 to 007

**Priority:** P3 (Nice to have)

---

## 12. AI Chatbot (Future Phase)

### 12.1 Islamic Q&A Bot

**User Story:** As a user, I want to ask Islamic questions so I can learn more about Islam.

**Requirements:**
- [ ] FR-AI-001: Chat interface for asking questions
- [ ] FR-AI-002: AI generates answers from authentic sources
- [ ] FR-AI-003: Cite Quran/Hadith references
- [ ] FR-AI-004: Support multiple languages
- [ ] FR-AI-005: Maintain conversation context
- [ ] FR-AI-006: Save chat history

**Acceptance Criteria:**
- Responses within 5 seconds
- Answers are accurate and referenced
- Chat history syncs to cloud

**Dependencies:** AI API integration, Authentication

**Priority:** P3 (Nice to have - Future)

---

## 13. Settings & Customization

### 13.1 App Settings

**User Story:** As a user, I want to customize the app so it fits my preferences.

**Requirements:**
- [ ] FR-SETTINGS-001: Change theme (Light/Dark/Auto)
- [ ] FR-SETTINGS-002: Change language
- [ ] FR-SETTINGS-003: Adjust text size
- [ ] FR-SETTINGS-004: Configure prayer calculation method
- [ ] FR-SETTINGS-005: Set notification preferences
- [ ] FR-SETTINGS-006: Manage storage (clear cache)
- [ ] FR-SETTINGS-007: View app version and credits
- [ ] FR-SETTINGS-008: Delete account

**Acceptance Criteria:**
- Settings save immediately
- Changes apply without app restart (where possible)
- Account deletion removes all data

**Dependencies:** None

**Priority:** P1 (Should have)

---

## Feature Summary

| Category | Total Features | P0 (Must) | P1 (Should) | P2 (Could) | P3 (Nice) |
|----------|----------------|-----------|-------------|------------|-----------|
| Authentication | 7 | 7 | 0 | 0 | 0 |
| Prayer Times | 14 | 14 | 0 | 0 | 0 |
| Qibla | 6 | 6 | 0 | 0 | 0 |
| Quran | 25 | 8 | 17 | 0 | 0 |
| Hadith | 8 | 0 | 8 | 0 | 0 |
| Duas | 8 | 0 | 8 | 0 | 0 |
| Tasbih | 8 | 0 | 8 | 0 | 0 |
| Calendar | 6 | 0 | 0 | 6 | 0 |
| Community | 11 | 0 | 0 | 11 | 0 |
| Places | 8 | 0 | 0 | 8 | 0 |
| IAP | 12 | 0 | 0 | 0 | 12 |
| AI | 6 | 0 | 0 | 0 | 6 |
| Settings | 8 | 0 | 8 | 0 | 0 |
| **TOTAL** | **127** | **35** | **49** | **25** | **18** |

---

## Traceability Matrix

Each functional requirement maps to:
- Screen wireframes (when created)
- API endpoints (in CLOUDFLARE_INFRASTRUCTURE.md)
- Database tables (in DATA_MIGRATION_PLAN.md)
- Test cases (in TESTING_STRATEGY.md)

---

**Last reviewed:** 2025-11-10
**Status:** Draft - To be refined during implementation
