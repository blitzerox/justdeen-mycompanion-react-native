# UI Design System (Extracted from Flutter App)

**Source:** `/Users/husainshah/Documents/Projects/justdeen`
**Last Updated:** 2025-11-10
**Design Language:** **WWDC Apple Design Principles** + iOS Human Interface Guidelines

---

## 🎯 Design Philosophy

### Core Principles

JustDeen follows **Apple's WWDC design language** with these foundational principles:

1. **Clarity** - Legible text, precise icons, purposeful adornments
2. **Deference** - Fluid motion, crisp interface, content-focused
3. **Depth** - Visual layers and realistic motion convey hierarchy
4. **Minimalism** - Clean, uncluttered interfaces
5. **Typography-first** - San Francisco (SF Pro) as primary typeface
6. **Color as meaning** - Each tab has semantic color identity
7. **Consistent spacing** - 8pt grid system (4, 8, 12, 16, 20, 24, 32...)

### Visual Inspiration
- Apple Health app (card-based layouts, subtle shadows)
- WWDC app (tab-specific colors, modern gradients)
- iOS System apps (native feel, smooth animations)
- Material Design 3 (elevation, state layers) - Used sparingly for Android

---

## 🎨 Color System

### 🏠 App Structure: 5 Main Tabs

**CRITICAL:** The app has exactly **5 main tabs**. Each tab has its own color identity. **ALL screens and sub-pages inherit their parent tab's color.**

```
┌─────────────────────────────────────────┐
│  🕌 Pray    📖 Read    💭 Reflect    🤖 AI    ⚙️ Settings  │
│  Purple     Blue      Orange      Indigo    Green       │
└─────────────────────────────────────────┘
```

#### Tab 1: 🕌 Pray (Purple)
```typescript
const prayColors = {
  primary: '#5856D6',      // SF Purple
  light: '#7B79E8',        // Lighter variant for gradients
  dark: '#4745B8',         // Darker variant for pressed states
  
  // Usage: Prayer times, Qibla, Adhan settings
  // Sub-pages: Prayer timing details, Qibla compass
}
```

#### Tab 2: 📖 Read (Blue)
```typescript
const readColors = {
  primary: '#007AFF',      // SF Blue
  light: '#4DA6FF',        // Lighter variant
  dark: '#0062CC',         // Darker variant
  
  // Usage: Quran reading, translations, bookmarks
  // Sub-pages: Surah details, Juz view, Reading settings
}
```

#### Tab 3: 💭 Reflect (Orange)
```typescript
const reflectColors = {
  primary: '#FF9500',      // SF Orange
  light: '#FFAD33',        // Lighter variant
  dark: '#CC7700',         // Darker variant
  
  // Usage: Duas, Hadith, Islamic names, Tasbih
  // Sub-pages: Dua categories, Hadith collections, Tasbih counter
}
```

#### Tab 4: 🤖 AI (Indigo)
```typescript
const aiColors = {
  primary: '#6366F1',      // Indigo (AI theme color)
  light: '#8B8DF4',        // Lighter variant
  dark: '#4F52C1',         // Darker variant
  
  // Usage: AI chatbot, Islamic Q&A
  // Sub-pages: Chat history, AI settings
}
```

#### Tab 5: ⚙️ Settings (Green)
```typescript
const settingsColors = {
  primary: '#34C759',      // SF Green
  light: '#5EE272',        // Lighter variant
  dark: '#28AC3C',         // Darker variant
  
  // Usage: App settings, profile, preferences
  // Sub-pages: Theme settings, notification settings, about
}
```

### 🚨 Color Usage Rules

**MUST FOLLOW:**

1. ✅ **Use ONLY the 5 tab colors** defined above
2. ✅ **Sub-pages inherit parent tab color**
   - Example: "Prayer Timing Details" screen uses Pray tab purple (`#5856D6`)
   - Example: "Surah Reading" screen uses Read tab blue (`#007AFF`)
   - Example: "Theme Settings" screen uses Settings tab green (`#34C759`)
3. ✅ **No custom colors for individual features**
4. ✅ **Semantic colors** (success, error, warning) are system-wide exceptions

**Color Hierarchy:**
```
Tab Color (Primary) → Sub-page uses same → Component uses same
   #5856D6 (Pray)   →   Prayer Detail   →   Prayer time card
   #34C759 (Settings) →  Theme Settings →   Setting list item
```

### System-Wide Colors

These colors apply **across all tabs** and **do not change**:

#### Light Theme Base
```typescript
const lightTheme = {
  // Backgrounds (iOS style)
  background: '#F2F2F7',        // iOS System background
  surface: '#FFFFFF',           // Cards, sheets, elevated surfaces
  elevated: '#FFFFFF',          // Modal backgrounds

  // Text hierarchy
  text: '#000000',              // Primary text (100% opacity)
  textSecondary: '#3C3C43',     // Secondary text (~60% opacity)
  textTertiary: '#3C3C4399',    // Tertiary text (~40% opacity)
  textQuaternary: '#3C3C4359',  // Placeholder text

  // Separators (iOS native)
  separator: '#3C3C4329',       // Opaque separator
  separatorNonOpaque: '#C6C6C8', // Non-opaque

  // System fills (for overlays, buttons)
  systemFill: '#78788033',
  systemFillSecondary: '#78788029',
  systemFillTertiary: '#7676801F',
  systemFillQuaternary: '#74748014',

  // Grouped backgrounds (Settings style)
  groupedBackground: '#F2F2F7',
  groupedSecondaryBackground: '#FFFFFF',
}
```

#### Dark Theme Base
```typescript
const darkTheme = {
  // Backgrounds
  background: '#000000',        // Pure black (OLED)
  surface: '#1C1C1E',          // Elevated dark
  elevated: '#2C2C2E',         // Modal/sheet backgrounds

  // Text hierarchy
  text: '#FFFFFF',             // Primary text
  textSecondary: '#EBEBF5',    // Secondary text (~60% opacity)
  textTertiary: '#EBEBF599',   // Tertiary text (~40% opacity)
  textQuaternary: '#EBEBF559', // Placeholder

  // Separators
  separator: '#54545899',
  separatorNonOpaque: '#38383A',

  // System fills
  systemFill: '#7878805C',
  systemFillSecondary: '#78788052',
  systemFillTertiary: '#7676803D',
  systemFillQuaternary: '#74748029',

  // Grouped backgrounds
  groupedBackground: '#000000',
  groupedSecondaryBackground: '#1C1C1E',
}
```

#### Semantic Colors (System-wide)
```typescript
const semanticColors = {
  // Status colors (consistent across all tabs)
  success: '#34C759',       // SF Green
  warning: '#FF9500',       // SF Orange
  error: '#FF3B30',         // SF Red
  info: '#007AFF',          // SF Blue

  // Special Islamic colors
  islamicGreen: '#34C759',  // Used for prayer active state
  islamicGold: '#FFD60A',   // Used for special occasions
  qiblaGreen: '#32D74B',    // Qibla compass needle
}
```

---

## 📝 Typography

### Font System (SF Pro)

**Primary:** San Francisco (SF Pro Text / SF Pro Display)
- iOS: Uses system font automatically
- Android: Download and include SF Pro fonts

**Arabic/Islamic:** Specialized fonts for Quranic text
- Quran: **Uthman** (traditional Uthmani script)
- Islamic calligraphy: **Jameel Noori Nastaleeq**

```typescript
const fontFamilies = {
  // System fonts (auto-selects based on platform)
  system: {
    ios: 'SF Pro Text',
    android: 'Roboto',  // Fallback if SF Pro not available
  },

  // Display variant for large text
  display: {
    ios: 'SF Pro Display',
    android: 'Roboto',
  },

  // Arabic fonts (must be included in project)
  arabic: {
    quran: 'Uthman',              // Main Quran reading font
    quranBold: 'Uthman-Bold',     // Bold variant (if needed)
    islamic: 'Jameel Noori Nastaleeq',  // For Arabic names, duas
  },
}
```

### Required Font Files

Add to `assets/fonts/`:
```
fonts/
├── Uthman-Regular.ttf
├── Uthman-Bold.ttf
└── JameelNooriNastaleeq.ttf
```

### Typography Scale (WWDC Style)

**Based on iOS Human Interface Guidelines + responsive sizing**

```typescript
const typography = {
  // Large Titles (34pt) - Screen headers
  largeTitle: {
    fontSize: 34,
    fontWeight: '700',      // Bold
    lineHeight: 41,
    letterSpacing: 0.37,
  },

  // Title 1 (28pt) - Section headers
  title1: {
    fontSize: 28,
    fontWeight: '400',      // Regular
    lineHeight: 34,
    letterSpacing: 0.36,
  },

  // Title 2 (22pt) - Card headers
  title2: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 28,
    letterSpacing: 0.35,
  },

  // Title 3 (20pt) - Group headers
  title3: {
    fontSize: 20,
    fontWeight: '400',
    lineHeight: 25,
    letterSpacing: 0.38,
  },

  // Headline (17pt semi-bold) - Emphasis
  headline: {
    fontSize: 17,
    fontWeight: '600',      // Semi-bold
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  // Body (17pt) - Primary content
  body: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  // Callout (16pt) - Secondary content
  callout: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: -0.32,
  },

  // Subheadline (15pt) - Tertiary content
  subheadline: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: -0.24,
  },

  // Footnote (13pt) - Supporting text
  footnote: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: -0.08,
  },

  // Caption 1 (12pt) - Small labels
  caption1: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
  },

  // Caption 2 (11pt) - Tiny text
  caption2: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 13,
    letterSpacing: 0.07,
  },

  // ====================================
  // Arabic Text Styles
  // ====================================

  // Quran verse (larger, right-aligned)
  quranArabic: {
    fontSize: 24,
    fontFamily: 'Uthman',
    fontWeight: '400',
    lineHeight: 40,
    textAlign: 'right',
    letterSpacing: 0,
  },

  // Quran translation
  quranTranslation: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: -0.32,
  },

  // Arabic heading (Surah names, etc.)
  arabicHeading: {
    fontSize: 20,
    fontFamily: 'Jameel Noori Nastaleeq',
    fontWeight: '600',
    lineHeight: 28,
    textAlign: 'right',
  },

  // Dua Arabic text
  duaArabic: {
    fontSize: 18,
    fontFamily: 'Jameel Noori Nastaleeq',
    fontWeight: '400',
    lineHeight: 30,
    textAlign: 'right',
  },
}
```

### Font Weight Reference
```typescript
const fontWeights = {
  ultraLight: '100',
  thin: '200',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  heavy: '800',
  black: '900',
}
```

---

## 📐 Spacing & Layout (8pt Grid)

### Base Spacing System

Apple uses an **8-point grid system**. All spacing should be multiples of 4 or 8.

```typescript
const spacing = {
  // Core spacing scale (multiples of 4/8)
  xxs: 2,     // 2pt - Minimal spacing
  xs: 4,      // 4pt - Tight spacing
  sm: 8,      // 8pt - Small
  md: 12,     // 12pt - Medium (8 + 4)
  lg: 16,     // 16pt - Large (8 × 2)
  xl: 20,     // 20pt - Extra large (16 + 4)
  xxl: 24,    // 24pt - 2X large (8 × 3)
  xxxl: 32,   // 32pt - 3X large (8 × 4)

  // Screen-level spacing
  screenHorizontal: 16,   // Left/right screen padding
  screenVertical: 20,     // Top/bottom screen padding

  // Component spacing
  cardPadding: 16,        // Inside cards
  cardMargin: 12,         // Between cards
  sectionSpacing: 24,     // Between sections

  // List items
  listItemVertical: 12,   // Vertical padding in list rows
  listItemHorizontal: 16, // Horizontal padding

  // Safe areas (platform-specific, use react-native-safe-area-context)
  safeAreaInsets: 'auto',
}
```

### Component Sizes

```typescript
const sizes = {
  // Navigation
  navigationBarHeight: 44,    // iOS standard nav bar
  tabBarHeight: 49,           // iOS standard tab bar (+ safe area)
  tabBarIconSize: 28,         // Tab bar icon size

  // Buttons
  buttonHeightSmall: 36,      // Compact button
  buttonHeightMedium: 44,     // Standard button (min touch target)
  buttonHeightLarge: 50,      // Prominent CTA button

  // Icons
  iconXSmall: 16,
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 28,
  iconXLarge: 36,

  // Cards
  prayerCardHeight: 140,      // Prayer time card
  quickMenuItemSize: 70,      // Quick access grid item

  // Lists
  listItemMinHeight: 44,      // iOS minimum touch target
  listItemStandardHeight: 60,

  // Avatar
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 60,

  // Touch targets (iOS HIG)
  minTouchTarget: 44,         // Minimum 44×44 for accessibility
}
```

### Border Radius (Smooth Continuous Curves)

```typescript
const borderRadius = {
  xs: 4,      // Minimal rounding
  sm: 8,      // Small elements
  md: 12,     // Standard cards
  lg: 16,     // Large cards
  xl: 20,     // Sheets, modals
  xxl: 28,    // Extra rounded

  // Special
  pill: 999,  // Fully rounded (capsule)
  circle: '50%', // Perfect circle

  // Component-specific
  card: 12,
  button: 10,
  bottomSheet: 20,    // Top corners only
  modal: 16,
}
```

---

## 🎭 Elevation & Shadows

### iOS-Style Shadows

Apple uses subtle shadows with blur. No harsh drop shadows.

```typescript
const shadows = {
  // Card shadow (standard)
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,  // Android
  },

  // Small shadow (subtle)
  small: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // Medium shadow (cards, buttons)
  medium: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },

  // Large shadow (modals, sheets)
  large: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 8,
  },

  // No shadow (flat)
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
}
```

---

## 🧩 Component Styles

### 1. Prayer Time Card

**Used in:** Pray tab
**Color:** Pray purple (`#5856D6`)

```typescript
const prayerCardStyle = {
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    marginHorizontal: spacing.screenHorizontal,
    marginVertical: spacing.sm,
    minHeight: sizes.prayerCardHeight,
    ...shadows.card,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  prayerName: {
    ...typography.headline,
    color: colors.text,
  },

  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    backgroundColor: prayColors.primary + '15', // 15% opacity
  },

  statusText: {
    ...typography.caption1,
    color: prayColors.primary,
    fontWeight: '600',
  },

  timeContainer: {
    marginVertical: spacing.md,
  },

  timeText: {
    ...typography.largeTitle,
    color: prayColors.primary,
    fontWeight: '700',
  },

  countdownText: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  },

  nextPrayerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  nextPrayerLabel: {
    ...typography.subheadline,
    color: colors.textSecondary,
  },

  nextPrayerTime: {
    ...typography.subheadline,
    color: colors.text,
    fontWeight: '600',
  },
}
```

### 2. Quran Ayah Card

**Used in:** Read tab
**Color:** Read blue (`#007AFF`)

```typescript
const ayahCardStyle = {
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.card,
    padding: spacing.xl,
    marginHorizontal: spacing.screenHorizontal,
    marginVertical: spacing.md,
    ...shadows.card,
  },

  ayahNumber: {
    ...typography.caption1,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
  },

  arabicText: {
    ...typography.quranArabic,
    color: colors.text,
    marginBottom: spacing.lg,
    textAlign: 'right',
    lineHeight: 40,
  },

  translationText: {
    ...typography.quranTranslation,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: colors.separator,
    marginVertical: spacing.md,
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  surahInfo: {
    ...typography.footnote,
    color: colors.textTertiary,
  },

  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: readColors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
}
```

### 3. Bottom Tab Bar (WWDC Style)

**5 tabs with individual colors**

```typescript
const tabBarStyle = {
  container: {
    height: sizes.tabBarHeight,
    backgroundColor: colors.surface,
    borderTopWidth: 0.5,
    borderTopColor: colors.separator,
    flexDirection: 'row',
    paddingBottom: spacing.safeAreaInsets,
    ...shadows.small,
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },

  iconContainer: {
    width: sizes.tabBarIconSize,
    height: sizes.tabBarIconSize,
    marginBottom: 2,
  },

  label: {
    ...typography.caption2,
    fontWeight: '500',
  },

  // Active state (uses tab-specific color)
  activeLabel: {
    color: 'currentTabColor', // #5856D6 for Pray, #34C759 for Settings, etc.
  },

  // Inactive state
  inactiveLabel: {
    color: colors.textTertiary,
  },

  // Active indicator (thin line on top - iOS 15+ style)
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 40,
    height: 2,
    backgroundColor: 'currentTabColor',
    borderRadius: 1,
  },
}
```

### 4. Quick Menu Grid (8 Items)

**Used in:** Home screen
**Colors:** Each item uses its destination tab's color

```typescript
const quickMenuStyle = {
  container: {
    padding: spacing.screenHorizontal,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  item: {
    width: (screenWidth - spacing.screenHorizontal * 2 - spacing.lg * 3) / 4,
    aspectRatio: 1,
    marginBottom: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.systemFillSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },

  icon: {
    width: sizes.iconMedium,
    height: sizes.iconMedium,
    // Tint color: destination tab color
  },

  label: {
    ...typography.caption2,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
}
```

### 5. Standard Button

```typescript
const buttonStyle = {
  // Primary button (filled)
  primary: {
    height: sizes.buttonHeightMedium,
    backgroundColor: 'currentTabColor', // Tab-specific color
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.small,
  },

  primaryText: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Secondary button (tinted background)
  secondary: {
    height: sizes.buttonHeightMedium,
    backgroundColor: 'currentTabColor' + '15', // 15% opacity
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },

  secondaryText: {
    ...typography.body,
    color: 'currentTabColor',
    fontWeight: '600',
  },

  // Text button (no background)
  text: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },

  textLabel: {
    ...typography.body,
    color: 'currentTabColor',
    fontWeight: '600',
  },

  // Disabled state
  disabled: {
    opacity: 0.4,
  },
}
```

### 6. List Item (Settings Style)

**Used in:** Settings tab (green theme)

```typescript
const listItemStyle = {
  container: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.screenHorizontal,
    paddingVertical: spacing.listItemVertical,
    minHeight: sizes.listItemMinHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  icon: {
    width: sizes.iconMedium,
    height: sizes.iconMedium,
    marginRight: spacing.md,
    tintColor: settingsColors.primary, // Green for settings
  },

  textContainer: {
    flex: 1,
  },

  title: {
    ...typography.body,
    color: colors.text,
  },

  subtitle: {
    ...typography.footnote,
    color: colors.textSecondary,
    marginTop: 2,
  },

  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  value: {
    ...typography.body,
    color: colors.textSecondary,
  },

  chevron: {
    width: 20,
    height: 20,
    tintColor: colors.textTertiary,
  },

  separator: {
    height: 0.5,
    backgroundColor: colors.separator,
    marginLeft: spacing.screenHorizontal + sizes.iconMedium + spacing.md,
  },
}
```

---

## 🎬 Animations & Transitions

### Animation Timings (Apple Standard)

```typescript
const animations = {
  // Durations (in milliseconds)
  instant: 0,
  fast: 200,          // Quick interactions
  normal: 300,        // Standard transitions
  slow: 400,          // Emphasized transitions

  // Specific use cases
  tabSwitch: 250,
  modalPresent: 350,
  cardFlip: 400,
  pageTransition: 300,

  // Spring animations (React Native Animated.spring)
  spring: {
    tension: 200,
    friction: 20,
  },

  // Easing curves (use with Animated.timing)
  easing: {
    standard: 'ease-in-out',
    decelerate: 'ease-out',
    accelerate: 'ease-in',
  },
}
```

### Common Animation Patterns

1. **Screen transitions**
   - iOS: Slide from right with parallax
   - Android: Fade + slight scale

2. **Modal presentation**
   - Slide up from bottom
   - Background dimming (fade to 50% black)

3. **Tab switching**
   - Crossfade between content
   - No horizontal slide

4. **Card interactions**
   - Press: Scale to 0.97
   - Release: Spring back to 1.0

5. **List item press**
   - Highlight background (fade in/out)
   - iOS: No ripple
   - Android: Optional ripple

---

## ♿ Accessibility

### Contrast Requirements (WCAG AA)
- **Normal text**: 4.5:1 minimum
- **Large text** (≥18pt regular or ≥14pt bold): 3:1 minimum
- **Icons**: 3:1 against background

### Touch Targets
- **Minimum**: 44×44 points (iOS HIG)
- **Ideal**: 48×48 points
- **Spacing**: 8pt minimum between targets

### Dynamic Type Support
- Support iOS Dynamic Type (text scaling)
- Test at 100%, 150%, 200%, 300% scale
- Ensure layouts adapt gracefully

### VoiceOver / TalkBack
- Meaningful accessibility labels
- Proper reading order
- Announce state changes

---

## 🌙 Dark Mode

### Automatic Theme Switching
- System-based (respects device setting)
- Smooth 250ms crossfade transition
- All colors adapt automatically

### Dark Mode Best Practices
1. Use semantic colors (not hardcoded)
2. Reduce shadow intensity
3. Increase separator opacity slightly
4. Test all screens in both themes

---

## 📱 Platform-Specific Adaptations

### iOS
- SF Pro fonts (system default)
- Native blur effects (`@react-native-community/blur`)
- Haptic feedback on interactions
- Swipe-back gesture
- Large title headers

### Android
- Roboto fonts (if SF Pro not available)
- Material ripple effects (optional)
- Navigation drawer (if needed)
- Hardware back button support
- Material elevation

---

## 📦 Required Packages

```bash
# Responsive sizing
yarn add react-native-size-matters

# Navigation & theming
yarn add @react-navigation/native
yarn add @react-navigation/bottom-tabs
yarn add @react-navigation/native-stack

# Safe area
yarn add react-native-safe-area-context

# Vector icons
yarn add react-native-vector-icons

# SVG support
yarn add react-native-svg

# Blur effects (iOS-style)
yarn add @react-native-community/blur

# Haptic feedback
yarn add react-native-haptic-feedback

# Bottom sheets
yarn add @gorhom/bottom-sheet

# Reanimated (smooth animations)
yarn add react-native-reanimated
```

---

## 🎯 Implementation Checklist

### Theme Setup
- [ ] Create `app/theme/colors.ts` with all 5 tab colors + system colors
- [ ] Create `app/theme/typography.ts` with SF Pro text styles
- [ ] Create `app/theme/spacing.ts` with 8pt grid system
- [ ] Create `app/theme/shadows.ts` with iOS-style shadows
- [ ] Create `app/theme/animations.ts` with timing configs
- [ ] Set up dark mode context/provider

### Fonts
- [ ] Add Uthman font to assets
- [ ] Add Jameel Noori Nastaleeq font to assets
- [ ] Configure font loading in React Native
- [ ] Test Arabic text rendering (RTL)

### Components
- [ ] Build base Button component (primary/secondary/text variants)
- [ ] Build Prayer Card component (with tab color)
- [ ] Build Ayah Card component (with tab color)
- [ ] Build Bottom Tab Bar (5 tabs with colors)
- [ ] Build List Item component (Settings style)
- [ ] Build Quick Menu Grid

### Testing
- [ ] Test all screens in light mode
- [ ] Test all screens in dark mode
- [ ] Test tab color consistency across sub-pages
- [ ] Test on small screens (iPhone SE)
- [ ] Test on large screens (iPad, Android tablets)
- [ ] Test with Dynamic Type enabled (iOS)
- [ ] Verify accessibility contrast ratios

---

## 📸 Reference Screenshots

**Capture from Flutter app:** `~/Documents/Projects/justdeen`

Required screenshots:
1. Home screen (all 5 tabs visible)
2. Each main tab screen (Pray, Read, Reflect, AI, Settings)
3. Sample sub-pages for each tab
4. Prayer time card variations
5. Quran reading screen
6. Dark mode versions of above

**Save to:** `ai-reference/screenshots/flutter/`

---

## 🔗 Key Flutter Files for Reference

1. **WWDC Colors**: `lib/src/core/theme/wwdc_colors.dart`
2. **Screen Themes**: `lib/src/core/util/theme/screen_themes.dart`
3. **Main Theme**: `lib/src/core/util/theme.dart`
4. **Constants**: `lib/src/core/util/constants.dart`
5. **Responsive**: `lib/src/core/util/responsive_helper.dart`
6. **Home Widgets**: `lib/src/features/home/widgets/`

---

## 🚨 Critical Rules Summary

1. ✅ **5 tabs only**: Pray, Read, Reflect, AI, Settings
2. ✅ **Tab colors are fixed**: Purple, Blue, Orange, Indigo, Green
3. ✅ **Sub-pages inherit tab color**: No custom colors per feature
4. ✅ **WWDC design language**: Clean, minimal, typography-first
5. ✅ **8pt grid system**: All spacing in multiples of 4 or 8
6. ✅ **SF Pro fonts**: System fonts on iOS, include on Android
7. ✅ **Arabic fonts**: Uthman for Quran, Jameel for Islamic text
8. ✅ **iOS-style shadows**: Subtle with blur, not harsh drop shadows
9. ✅ **Dark mode support**: All colors adapt automatically
10. ✅ **Accessibility**: 44pt touch targets, proper contrast ratios

---

**Last Updated:** 2025-11-10
**Design System Version:** 1.0
**React Native Target:** 0.73+
**Design Reference:** Apple WWDC + Health app + iOS HIG

**Color Scheme:**
- 🕌 Pray: Purple (#5856D6)
- 📖 Read: Blue (#007AFF)
- 💭 Reflect: Orange (#FF9500)
- 🤖 AI: Indigo (#6366F1)
- ⚙️ Settings: Green (#34C759) ✅
