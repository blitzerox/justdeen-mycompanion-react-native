/**
 * JustDeen Spacing System
 * Based on 8pt grid system (Apple HIG / Material Design)
 * All spacing values are multiples of 4 or 8
 */
export const spacing = {
  // ============================================
  // BASE SPACING SCALE (8pt grid)
  // ============================================
  xxxs: 2,   // Minimal spacing
  xxs: 4,    // Tight spacing
  xs: 8,     // Small
  sm: 12,    // Medium-small (8 + 4)
  md: 16,    // Medium (8 × 2)
  lg: 24,    // Large (8 × 3)
  xl: 32,    // Extra large (8 × 4)
  xxl: 48,   // 2X large (8 × 6)
  xxxl: 64,  // 3X large (8 × 8)

  // ============================================
  // SCREEN-LEVEL SPACING
  // ============================================
  /**
   * Horizontal padding for screens (left/right)
   * iOS HIG: 16pt standard edge padding
   */
  screenHorizontal: 16,

  /**
   * Vertical padding for screens (top/bottom)
   * Slightly more than horizontal for breathing room
   */
  screenVertical: 20,

  // ============================================
  // COMPONENT-SPECIFIC SPACING
  // ============================================

  /**
   * Card spacing
   */
  cardPadding: 16,        // Inside padding of cards
  cardMargin: 12,         // Margin between cards
  cardSpacing: 12,        // Vertical spacing between card elements

  /**
   * Section spacing
   */
  sectionSpacing: 24,     // Vertical spacing between major sections

  /**
   * List items
   */
  listItemVertical: 12,   // Vertical padding inside list rows
  listItemHorizontal: 16, // Horizontal padding inside list rows
  listItemSpacing: 8,     // Spacing between list items

  /**
   * Prayer time components
   */
  prayerCardPadding: 16,  // Prayer card internal padding
  prayerCardMargin: 12,   // Space between prayer cards
  prayerListSpacing: 8,   // Space between prayer list items

  /**
   * Quran components
   */
  verseCardPadding: 20,   // Quran verse card padding (more generous)
  verseSpacing: 16,       // Space between verses
  surahHeaderPadding: 16, // Surah header padding

  /**
   * Navigation
   */
  tabBarHeight: 49,       // iOS standard tab bar height (excluding safe area)
  navBarHeight: 44,       // iOS standard navigation bar height

  /**
   * Safe area insets (automatically calculated at runtime)
   * These are placeholders - actual values come from SafeAreaContext
   */
  safeAreaTop: 0,
  safeAreaBottom: 0,
  safeAreaLeft: 0,
  safeAreaRight: 0,
} as const

/**
 * Component size constants
 * Reusable size values for common UI elements
 */
export const sizes = {
  // Buttons
  buttonHeightSmall: 36,    // Compact button
  buttonHeightMedium: 44,   // Standard button (min touch target)
  buttonHeightLarge: 50,    // Prominent CTA button

  // Icons
  iconXSmall: 16,
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 28,
  iconXLarge: 36,

  // Tab bar
  tabBarIconSize: 28,       // Tab bar icon size

  // Cards (Prayer times, Ayah, etc.)
  prayerCardHeight: 140,    // Prayer time card
  ayahCardMinHeight: 120,   // Daily ayah card minimum height
  quickMenuItemSize: 70,    // Quick access grid item

  // Lists
  listItemMinHeight: 44,    // iOS minimum touch target
  listItemStandardHeight: 60,

  // Avatar
  avatarSmall: 32,
  avatarMedium: 40,
  avatarLarge: 60,

  // Touch targets (iOS HIG)
  minTouchTarget: 44,       // Minimum 44×44 for accessibility
} as const
