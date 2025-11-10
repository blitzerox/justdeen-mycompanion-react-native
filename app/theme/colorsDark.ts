/**
 * JustDeen Dark Theme Colors - WWDC Apple Design
 * Dark mode with OLED black backgrounds
 */

/**
 * Tab-specific colors (Dark Mode variants)
 * Slightly brighter than light mode for better visibility on dark backgrounds
 */
const tabColors = {
  // 🕌 Pray Tab (Purple - Dark)
  pray: {
    primary: "#5E5CE6",    // SF Purple (dark mode)
    light: "#7D7AFF",      // Lighter variant
    dark: "#5856D6",       // Darker variant
  },
  // 📖 Read Tab (Blue - Dark)
  read: {
    primary: "#0A84FF",    // SF Blue (dark mode)
    light: "#409CFF",
    dark: "#007AFF",
  },
  // 💭 Reflect Tab (Orange - Dark)
  reflect: {
    primary: "#FF9F0A",    // SF Orange (dark mode)
    light: "#FFB340",
    dark: "#FF9500",
  },
  // 🤖 AI Tab (Indigo - Dark)
  ai: {
    primary: "#7C7EF8",    // Indigo (brighter for dark mode)
    light: "#A5A6F6",
    dark: "#6366F1",
  },
  // ⚙️ Settings Tab (Green - Dark)
  settings: {
    primary: "#30D158",    // SF Green (dark mode)
    light: "#63E884",
    dark: "#34C759",
  },
} as const

/**
 * iOS System Colors (Dark Theme)
 * Pure black (#000000) for OLED optimization
 */
const palette = {
  // Backgrounds (Dark mode - OLED optimized)
  background: "#000000",           // Pure black for OLED
  surface: "#1C1C1E",              // Elevated dark surface
  elevated: "#2C2C2E",             // Modals, sheets (more elevated)
  groupedBackground: "#000000",    // Grouped lists background
  groupedSecondary: "#1C1C1E",     // Grouped lists items

  // Text Colors (Dark mode)
  text: "#FFFFFF",                 // Primary text
  textSecondary: "#EBEBF5",        // Secondary text (60% opacity)
  textTertiary: "#EBEBF599",       // Tertiary text (40% opacity)
  textQuaternary: "#EBEBF559",     // Placeholder text

  // iOS System Grays (Dark mode - 6 levels from darkest to lightest)
  systemGray6: "#1C1C1E",          // Darkest gray
  systemGray5: "#2C2C2E",
  systemGray4: "#3A3A3C",
  systemGray3: "#48484A",
  systemGray2: "#636366",
  systemGray: "#8E8E93",           // Base gray (same in both themes)

  // Separators (Dark mode)
  separator: "#54545899",          // Opaque separator
  separatorNonOpaque: "#38383A",   // Non-opaque separator

  // System Fills (Dark mode)
  systemFill: "#7878805C",         // 36% opacity
  systemFillSecondary: "#78788052", // 32% opacity
  systemFillTertiary: "#7676803D",  // 24% opacity
  systemFillQuaternary: "#74748029", // 16% opacity

  // Semantic Colors (Dark mode variants)
  success: "#30D158",              // SF Green (dark)
  warning: "#FF9F0A",              // SF Orange (dark)
  error: "#FF453A",                // SF Red (dark)
  info: "#0A84FF",                 // SF Blue (dark)

  // Islamic-specific colors (Dark mode)
  islamicGreen: "#30D158",         // Prayer active state
  islamicGold: "#FFD60A",          // Special occasions, Kaaba
  qiblaGreen: "#30D158",           // Qibla compass needle

  // Prayer time status colors (Dark mode)
  prayerActive: "#30D158",         // Current prayer (green)
  prayerUpcoming: "#FF9F0A",       // Next prayer (orange)
  prayerPassed: "#8E8E93",         // Passed prayer (gray)

  // Overlays (Dark mode)
  overlay20: "rgba(255, 255, 255, 0.1)",  // Light overlay on dark
  overlay50: "rgba(255, 255, 255, 0.2)",
  overlay75: "rgba(255, 255, 255, 0.3)",

  // Pure colors
  white: "#FFFFFF",
  black: "#000000",

  // Legacy Ignite neutral colors (mapped to iOS dark system grays)
  neutral100: "#1C1C1E",              // systemGray6
  neutral200: "#2C2C2E",              // systemGray5
  neutral300: "#3A3A3C",              // systemGray4
  neutral400: "#48484A",              // systemGray3
  neutral500: "#636366",              // systemGray2
  neutral600: "#8E8E93",              // systemGray
  neutral700: "#EBEBF5",              // textSecondary
  neutral800: "#FFFFFF",              // text
  neutral900: "#FFFFFF",              // text

  // Legacy Ignite primary/secondary/accent colors (dark mode)
  primary100: "#1A3A24",              // Dark green tint
  primary400: "#30D158",              // Settings tab primary (dark)
  secondary500: "#5E5CE6",            // Pray tab purple (dark)
  accent100: "#1A2A3A",               // Dark blue tint
} as const

/**
 * Semantic color mappings for dark mode
 */
export const colors = {
  /**
   * The palette and tab colors
   */
  palette,
  tabColors,

  /**
   * Transparent helper
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
   * Text colors (dark mode)
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
   * System fill colors
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
   * Tab-specific colors (WWDC 5-tab design - Dark mode)
   */
  pray: tabColors.pray.primary,
  prayLight: tabColors.pray.light,
  prayDark: tabColors.pray.dark,
  read: tabColors.read.primary,
  readLight: tabColors.read.light,
  readDark: tabColors.read.dark,
  reflect: tabColors.reflect.primary,
  reflectLight: tabColors.reflect.light,
  reflectDark: tabColors.reflect.dark,
  ai: tabColors.ai.primary,
  aiLight: tabColors.ai.light,
  aiDark: tabColors.ai.dark,
  settings: tabColors.settings.primary,
  settingsLight: tabColors.settings.light,
  settingsDark: tabColors.settings.dark,

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
   * Legacy compatibility
   */
  tint: tabColors.settings.primary,      // Default tint (Settings green)
  tintInactive: palette.textTertiary,    // Inactive state
  border: palette.separator,              // Border color
  textDim: palette.textSecondary,         // Dimmed text

  // Old Ignite neutral colors mapped to iOS dark system colors
  neutral100: palette.systemGray6,        // #1C1C1E
  neutral200: palette.systemGray5,        // #2C2C2E
  neutral300: palette.systemGray4,        // #3A3A3C
  neutral400: palette.systemGray3,        // #48484A
  neutral500: palette.systemGray2,        // #636366
  neutral600: palette.systemGray,         // #8E8E93
  neutral700: palette.textSecondary,      // #EBEBF5
  neutral800: palette.text,               // #FFFFFF
  neutral900: palette.text,               // #FFFFFF

  /**
   * Overlays
   */
  overlay20: palette.overlay20,
  overlay50: palette.overlay50,
  overlay75: palette.overlay75,
} as const
