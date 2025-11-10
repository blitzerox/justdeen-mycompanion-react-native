/**
 * JustDeen Typography System
 * Based on iOS Human Interface Guidelines (WWDC)
 * Includes SF Pro fonts (system default on iOS) and Arabic fonts for Islamic content
 *
 * Documentation: https://developer.apple.com/design/human-interface-guidelines/typography
 */

import { Platform } from "react-native"

/**
 * Custom fonts to load
 * Arabic fonts (Uthman for Quran, Jameel for Islamic calligraphy) must be added to assets/fonts/
 */
export const customFontsToLoad = {
  // Arabic fonts for Quranic text
  "Uthman-Regular": require("../../assets/fonts/Uthman-Regular.ttf"),
  "Uthman-Bold": require("../../assets/fonts/Uthman-Bold.ttf"),
  // Arabic fonts for Islamic calligraphy (names, duas)
  "Jameel-Noori-Nastaleeq": require("../../assets/fonts/JameelNooriNastaleeq.ttf"),
}

/**
 * Font families
 * iOS uses SF Pro (system default), Android uses Roboto
 * Arabic content uses specialized fonts (Uthman for Quran, Jameel for other Arabic text)
 */
const fonts = {
  // System fonts (SF Pro on iOS, Roboto on Android)
  system: {
    // iOS: SF Pro Text is the system default, no need to load explicitly
    // Android: Roboto is the system default
    light: Platform.select({ ios: "System", android: "sans-serif-light" }),
    regular: Platform.select({ ios: "System", android: "sans-serif" }),
    normal: Platform.select({ ios: "System", android: "sans-serif" }), // Legacy alias for regular
    medium: Platform.select({ ios: "System", android: "sans-serif-medium" }),
    semibold: Platform.select({ ios: "System", android: "sans-serif-medium" }), // Android doesn't have semibold
    bold: Platform.select({ ios: "System", android: "sans-serif" }),
  },

  // Display font (SF Pro Display on iOS for large text)
  display: {
    regular: Platform.select({ ios: "System", android: "sans-serif" }),
    medium: Platform.select({ ios: "System", android: "sans-serif-medium" }),
    semibold: Platform.select({ ios: "System", android: "sans-serif-medium" }),
    bold: Platform.select({ ios: "System", android: "sans-serif" }),
  },

  // Arabic fonts
  arabic: {
    // Quran text (Uthmani script)
    quran: "Uthman-Regular",
    quranBold: "Uthman-Bold",
    // Islamic calligraphy (for names, duas, etc.)
    islamic: "Jameel-Noori-Nastaleeq",
  },

  // Monospace (for code, debugging)
  monospace: Platform.select({ ios: "Courier", android: "monospace" }),
}

/**
 * iOS Human Interface Guidelines Typography Scale
 * All sizes are in points (dp on Android)
 * Font weights: ultraLight, thin, light, regular, medium, semibold, bold, heavy, black
 */
export const typography = {
  /**
   * Font families
   */
  fonts,

  /**
   * Large Title (34pt) - Screen headers, navigation titles
   * Weight: Bold (700)
   */
  largeTitle: {
    fontFamily: fonts.display.bold,
    fontSize: 34,
    fontWeight: "700" as const,
    lineHeight: 41,
    letterSpacing: 0.37,
  },

  /**
   * Title 1 (28pt) - Section headers
   * Weight: Regular (400)
   */
  title1: {
    fontFamily: fonts.display.regular,
    fontSize: 28,
    fontWeight: "400" as const,
    lineHeight: 34,
    letterSpacing: 0.36,
  },

  /**
   * Title 2 (22pt) - Card headers, subsection titles
   * Weight: Regular (400)
   */
  title2: {
    fontFamily: fonts.system.regular,
    fontSize: 22,
    fontWeight: "400" as const,
    lineHeight: 28,
    letterSpacing: 0.35,
  },

  /**
   * Title 3 (20pt) - Group headers
   * Weight: Regular (400)
   */
  title3: {
    fontFamily: fonts.system.regular,
    fontSize: 20,
    fontWeight: "400" as const,
    lineHeight: 25,
    letterSpacing: 0.38,
  },

  /**
   * Headline (17pt, Semibold) - Emphasized content
   * Weight: Semibold (600)
   */
  headline: {
    fontFamily: fonts.system.semibold,
    fontSize: 17,
    fontWeight: "600" as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  /**
   * Body (17pt) - Primary body text
   * Weight: Regular (400)
   */
  body: {
    fontFamily: fonts.system.regular,
    fontSize: 17,
    fontWeight: "400" as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },

  /**
   * Callout (16pt) - Secondary content
   * Weight: Regular (400)
   */
  callout: {
    fontFamily: fonts.system.regular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 21,
    letterSpacing: -0.32,
  },

  /**
   * Subheadline (15pt) - Tertiary content
   * Weight: Regular (400)
   */
  subheadline: {
    fontFamily: fonts.system.regular,
    fontSize: 15,
    fontWeight: "400" as const,
    lineHeight: 20,
    letterSpacing: -0.24,
  },

  /**
   * Footnote (13pt) - Supporting text, captions
   * Weight: Regular (400)
   */
  footnote: {
    fontFamily: fonts.system.regular,
    fontSize: 13,
    fontWeight: "400" as const,
    lineHeight: 18,
    letterSpacing: -0.08,
  },

  /**
   * Caption 1 (12pt) - Small labels
   * Weight: Regular (400)
   */
  caption1: {
    fontFamily: fonts.system.regular,
    fontSize: 12,
    fontWeight: "400" as const,
    lineHeight: 16,
    letterSpacing: 0,
  },

  /**
   * Caption 2 (11pt) - Tiny text, timestamps
   * Weight: Regular (400)
   */
  caption2: {
    fontFamily: fonts.system.regular,
    fontSize: 11,
    fontWeight: "400" as const,
    lineHeight: 13,
    letterSpacing: 0.07,
  },

  // ============================================
  // ARABIC TEXT STYLES (Islamic Content)
  // ============================================

  /**
   * Quran Arabic Text (24pt)
   * Font: Uthman (Uthmani script)
   * Right-aligned (RTL)
   */
  quranArabic: {
    fontFamily: fonts.arabic.quran,
    fontSize: 24,
    fontWeight: "400" as const,
    lineHeight: 40,
    textAlign: "right" as const,
    letterSpacing: 0,
    writingDirection: "rtl" as const,
  },

  /**
   * Quran Translation Text (16pt)
   * Regular font, left-aligned
   */
  quranTranslation: {
    fontFamily: fonts.system.regular,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 24,
    letterSpacing: -0.32,
  },

  /**
   * Arabic Heading (20pt) - Surah names, section headers
   * Font: Jameel Noori Nastaleeq
   * Right-aligned (RTL)
   */
  arabicHeading: {
    fontFamily: fonts.arabic.islamic,
    fontSize: 20,
    fontWeight: "600" as const,
    lineHeight: 28,
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
  },

  /**
   * Dua Arabic Text (18pt) - Supplications
   * Font: Jameel Noori Nastaleeq
   * Right-aligned (RTL)
   */
  duaArabic: {
    fontFamily: fonts.arabic.islamic,
    fontSize: 18,
    fontWeight: "400" as const,
    lineHeight: 30,
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
  },

  /**
   * Arabic Body Text (16pt) - General Arabic content
   * Font: Jameel Noori Nastaleeq
   * Right-aligned (RTL)
   */
  arabicBody: {
    fontFamily: fonts.arabic.islamic,
    fontSize: 16,
    fontWeight: "400" as const,
    lineHeight: 26,
    textAlign: "right" as const,
    writingDirection: "rtl" as const,
  },

  // ============================================
  // LEGACY SUPPORT (for Ignite components)
  // ============================================

  /**
   * Primary font - maps to system font
   * Used by existing Ignite components
   */
  primary: fonts.system,

  /**
   * Secondary font - maps to display font
   * Used by existing Ignite components for titles
   */
  secondary: fonts.display,

  /**
   * Code font - monospace
   * Used for debugging, technical content
   */
  code: fonts.monospace,
}

/**
 * Font weight reference (for manual use)
 */
export const fontWeights = {
  ultraLight: "100" as const,
  thin: "200" as const,
  light: "300" as const,
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
  heavy: "800" as const,
  black: "900" as const,
}
