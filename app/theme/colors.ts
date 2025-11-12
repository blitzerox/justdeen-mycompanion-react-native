/**
 * JustDeen Color System - WWDC Apple Design
 * Based on iOS Human Interface Guidelines + 5-tab structure
 * Each tab has its own semantic color identity
 */

/**
 * Tab-specific colors - Each main tab has its unique color
 * Home: Green, Pray: Purple, Read: Blue, AI: Cyan, More: Orange
 */
const tabColors = {
  // 🏠 Home Tab (Green) - formerly Reflect
  home: {
    primary: "#34C759",    // SF Green
    light: "#5EE272",
    dark: "#28AC3C",
  },
  // 🕌 Pray Tab (Purple)
  pray: {
    primary: "#5856D6",    // SF Purple
    light: "#7B79E8",      // Lighter for gradients/pressed states
    dark: "#4745B8",       // Darker for shadows/depth
  },
  // 📖 Read Tab (Blue)
  read: {
    primary: "#007AFF",    // SF Blue
    light: "#4DA6FF",
    dark: "#0062CC",
  },
  // 🤖 AI Tab (Cyan)
  ai: {
    primary: "#32ADE6",    // SF Cyan
    light: "#64C7F0",
    dark: "#1E8BBD",
  },
  // ⋯ More Tab (Orange)
  more: {
    primary: "#FF9500",    // SF Orange
    light: "#FFAD33",
    dark: "#CC7700",
  },
} as const

/**
 * iOS System Colors (Light Theme)
 * Following Apple's WWDC color guidelines
 */
const palette = {
  // Backgrounds (iOS native)
  background: "#F2F2F7",           // iOS system background
  surface: "#FFFFFF",              // Cards, elevated surfaces
  elevated: "#FFFFFF",             // Modals, sheets
  groupedBackground: "#F2F2F7",    // Grouped lists background
  groupedSecondary: "#FFFFFF",     // Grouped lists items

  // Text Colors (iOS label colors)
  text: "#000000",                 // Primary text (label)
  textSecondary: "#3C3C43",        // Secondary text (60% opacity)
  textTertiary: "#3C3C4399",       // Tertiary text (40% opacity)
  textQuaternary: "#3C3C4359",     // Placeholder text

  // iOS System Grays (6 levels from lightest to darkest)
  systemGray6: "#F2F2F7",          // Lightest gray
  systemGray5: "#E5E5EA",
  systemGray4: "#D1D1D6",
  systemGray3: "#C7C7CC",
  systemGray2: "#AEAEB2",
  systemGray: "#8E8E93",           // Base gray

  // Separators (iOS native)
  separator: "#3C3C4329",          // Opaque separator
  separatorNonOpaque: "#C6C6C8",   // Non-opaque separator

  // System Fills (for overlays, button backgrounds)
  systemFill: "#78788033",         // 20% opacity
  systemFillSecondary: "#78788029", // 16% opacity
  systemFillTertiary: "#7676801F",  // 12% opacity
  systemFillQuaternary: "#74748014", // 8% opacity

  // Semantic Colors (status, alerts)
  success: "#34C759",              // SF Green
  warning: "#FF9500",              // SF Orange
  error: "#FF3B30",                // SF Red
  info: "#007AFF",                 // SF Blue

  // Islamic-specific colors
  islamicGreen: "#34C759",         // Used for prayer active state
  islamicGold: "#FFD60A",          // Used for special occasions, Kaaba icon
  qiblaGreen: "#32D74B",           // Qibla compass needle

  // Prayer time status colors
  prayerActive: "#34C759",         // Current prayer (green)
  prayerUpcoming: "#FF9500",       // Next prayer (orange)
  prayerPassed: "#8E8E93",         // Passed prayer (gray)

  // Overlays
  overlay20: "rgba(0, 0, 0, 0.2)",
  overlay50: "rgba(0, 0, 0, 0.5)",
  overlay75: "rgba(0, 0, 0, 0.75)",

  // Pure colors for reference
  white: "#FFFFFF",
  black: "#000000",

  // Legacy Ignite neutral colors (mapped to iOS system grays)
  neutral100: "#F2F2F7",              // systemGray6
  neutral200: "#E5E5EA",              // systemGray5
  neutral300: "#D1D1D6",              // systemGray4
  neutral400: "#C7C7CC",              // systemGray3
  neutral500: "#AEAEB2",              // systemGray2
  neutral600: "#8E8E93",              // systemGray
  neutral700: "#3C3C43",              // textSecondary
  neutral800: "#000000",              // text
  neutral900: "#000000",              // text

  // Legacy Ignite primary/secondary/accent colors (mapped to Settings green)
  primary100: "#D6F5E0",              // Light green tint
  primary400: "#34C759",              // Settings tab primary
  secondary500: "#5856D6",            // Pray tab purple
  accent100: "#E5F3FF",               // Light blue tint
} as const

/**
 * Semantic color mappings for the app
 * These colors adapt based on context (light/dark theme)
 */
export const colors = {
  /**
   * The palette and tab colors are available to use,
   * but prefer using semantic names below for consistency
   */
  palette,
  tabColors,

  /**
   * A helper for making something see-thru.
   */
  transparent: "rgba(0, 0, 0, 0)",

  /**
   * Background colors
   */
  background: palette.background,
  surface: palette.surface,
  elevated: palette.elevated,
  groupedBackground: palette.groupedBackground,
  groupedSecondary: palette.groupedSecondary,

  /**
   * Text colors (iOS label hierarchy)
   */
  text: palette.text,
  textSecondary: palette.textSecondary,
  textTertiary: palette.textTertiary,
  textQuaternary: palette.textQuaternary,

  /**
   * Separator colors
   */
  separator: palette.separator,
  separatorNonOpaque: palette.separatorNonOpaque,

  /**
   * System fill colors (for buttons, overlays)
   */
  systemFill: palette.systemFill,
  systemFillSecondary: palette.systemFillSecondary,
  systemFillTertiary: palette.systemFillTertiary,
  systemFillQuaternary: palette.systemFillQuaternary,

  /**
   * Semantic colors
   */
  success: palette.success,
  warning: palette.warning,
  error: palette.error,
  errorBackground: palette.error + "15", // 15% opacity
  info: palette.info,

  /**
   * Tab-specific colors (WWDC 5-tab design)
   */
  home: tabColors.home.primary,
  homeLight: tabColors.home.light,
  homeDark: tabColors.home.dark,
  pray: tabColors.pray.primary,
  prayLight: tabColors.pray.light,
  prayDark: tabColors.pray.dark,
  read: tabColors.read.primary,
  readLight: tabColors.read.light,
  readDark: tabColors.read.dark,
  ai: tabColors.ai.primary,
  aiLight: tabColors.ai.light,
  aiDark: tabColors.ai.dark,
  more: tabColors.more.primary,
  moreLight: tabColors.more.light,
  moreDark: tabColors.more.dark,

  // Legacy color names for backward compatibility
  reflect: tabColors.home.primary,      // Reflect is now Home (green)
  reflectLight: tabColors.home.light,
  reflectDark: tabColors.home.dark,
  settings: tabColors.more.primary,      // Settings is now More (orange)
  settingsLight: tabColors.more.light,
  settingsDark: tabColors.more.dark,

  /**
   * Islamic-specific colors
   */
  islamicGreen: palette.islamicGreen,
  islamicGold: palette.islamicGold,
  qiblaGreen: palette.qiblaGreen,

  /**
   * Prayer time status
   */
  prayerActive: palette.prayerActive,
  prayerUpcoming: palette.prayerUpcoming,
  prayerPassed: palette.prayerPassed,

  /**
   * Legacy compatibility - map to new color system
   * TODO: Gradually migrate components to use tab-specific colors
   */
  tint: tabColors.home.primary,          // Default tint (Home green)
  tintInactive: palette.textTertiary,    // Inactive state
  border: palette.separator,              // Border color
  textDim: palette.textSecondary,         // Dimmed text

  // Old Ignite neutral colors mapped to iOS system colors
  neutral100: palette.systemGray6,        // #F2F2F7
  neutral200: palette.systemGray5,        // #E5E5EA
  neutral300: palette.systemGray4,        // #D1D1D6
  neutral400: palette.systemGray3,        // #C7C7CC
  neutral500: palette.systemGray2,        // #AEAEB2
  neutral600: palette.systemGray,         // #8E8E93
  neutral700: palette.textSecondary,      // #3C3C43
  neutral800: palette.text,               // #000000
  neutral900: palette.text,               // #000000

  /**
   * Overlays
   */
  overlay20: palette.overlay20,
  overlay50: palette.overlay50,
  overlay75: palette.overlay75,
} as const
