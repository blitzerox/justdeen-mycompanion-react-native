/**
 * JustDeen Shadow System
 * iOS-style subtle shadows with low opacity and soft blur
 * Based on Apple HIG - shadows should be subtle, not harsh Material Design drop shadows
 */

import { Platform, ViewStyle } from "react-native"

/**
 * Shadow presets for different elevation levels
 * iOS uses subtle shadows with low opacity and blur
 * Android uses elevation (converted to shadow automatically)
 */
export const shadows = {
  /**
   * No shadow - flat surface
   */
  none: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
    },
    android: {
      elevation: 0,
    },
  }),

  /**
   * Small shadow - subtle elevation for buttons, chips
   * Elevation: ~1-2dp
   */
  small: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),

  /**
   * Medium shadow - standard cards, list items
   * Elevation: ~4dp
   * This is the default for most card components
   */
  medium: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),

  /**
   * Large shadow - elevated cards, modals
   * Elevation: ~8dp
   */
  large: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),

  /**
   * Extra large shadow - dialogs, bottom sheets, major overlays
   * Elevation: ~16dp
   */
  xlarge: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.16,
      shadowRadius: 16,
    },
    android: {
      elevation: 16,
    },
  }),

  // ============================================
  // COMPONENT-SPECIFIC SHADOWS
  // ============================================

  /**
   * Prayer time cards
   * Slightly more prominent than standard cards
   */
  prayerCard: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.10,
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
  }),

  /**
   * Active/current prayer highlight
   * More prominent shadow for visual emphasis
   */
  activePrayer: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#5856D6", // Pray tab purple
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),

  /**
   * Quran verse cards
   * Soft, gentle shadow for reading comfort
   */
  verseCard: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),

  /**
   * Qibla compass container
   * Subtle shadow to lift compass from background
   */
  qiblaCompass: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.10,
      shadowRadius: 8,
    },
    android: {
      elevation: 6,
    },
  }),

  /**
   * Bottom navigation bar
   * iOS standard tab bar shadow
   */
  tabBar: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: -1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 8,
    },
  }),

  /**
   * Modal/Bottom sheet overlay
   */
  modal: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.12,
      shadowRadius: 12,
    },
    android: {
      elevation: 12,
    },
  }),

  /**
   * Floating Action Button (FAB)
   * More prominent for interactive elements
   */
  fab: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.14,
      shadowRadius: 10,
    },
    android: {
      elevation: 10,
    },
  }),

  /**
   * Today's Ayah / Daily content card
   * Slightly elevated to draw attention
   */
  dailyCard: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.09,
      shadowRadius: 6,
    },
    android: {
      elevation: 5,
    },
  }),

  /**
   * Settings menu items / List items with interaction
   */
  listItem: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
    },
    android: {
      elevation: 1,
    },
  }),

  /**
   * Search bar
   */
  searchBar: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    android: {
      elevation: 3,
    },
  }),
} as const

/**
 * Helper function to combine shadow with other styles
 * Usage: style={[shadows.medium, { backgroundColor: 'white' }]}
 */
export type ShadowPreset = keyof typeof shadows

/**
 * Dark mode shadow adjustments
 * In dark mode, we increase shadow opacity slightly for better visibility
 * These can be used with ThemedStyle pattern
 */
export const shadowsDark = {
  small: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.20, // Increased from 0.05
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
  }),

  medium: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.24, // Increased from 0.08
      shadowRadius: 4,
    },
    android: {
      elevation: 4,
    },
  }),

  large: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.30, // Increased from 0.12
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  }),

  prayerCard: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.28, // Increased from 0.10
      shadowRadius: 6,
    },
    android: {
      elevation: 6,
    },
  }),

  verseCard: Platform.select<ViewStyle>({
    ios: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.20, // Increased from 0.06
      shadowRadius: 4,
    },
    android: {
      elevation: 3,
    },
  }),
} as const
