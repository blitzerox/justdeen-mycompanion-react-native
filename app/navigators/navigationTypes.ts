import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
import { DrawerScreenProps as RNDrawerScreenProps } from "@react-navigation/drawer"
import {
  CompositeScreenProps,
  NavigationContainer,
  NavigatorScreenParams,
} from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"

/**
 * JustDeen Navigation Types
 *
 * This file defines all navigation routes and their parameters for the app.
 * The app uses a hybrid navigation structure:
 * - Root Stack: Auth flow (Login, Welcome)
 * - Main Tabs: 5-tab bottom navigation (Pray, Read, Reflect, AI, Settings)
 * - Stack per Tab: Each tab has its own stack navigator
 */

// =============================================================================
// TAB NAVIGATORS - Each tab has its own stack
// =============================================================================

/**
 * Pray Tab Stack (Purple)
 * Screens: Prayer times, Qibla, Adhan settings, Islamic calendar
 */
export type PrayStackParamList = {
  PrayerTimesHome: undefined
  QiblaCompass: undefined
  PrayerTimingSettings: undefined
  NotificationSettings: undefined
  IslamicCalendar: undefined
  TasbihCounter: undefined
}

/**
 * Read Tab Stack (Blue)
 * Screens: Quran reading, translations, bookmarks, reading groups, Hadith, Duas
 */
export type ReadStackParamList = {
  ReadHome: undefined
  QuranHome: undefined
  QuranReader: {
    surahNumber: number
    ayahNumber?: number
  }
  SurahDetails: {
    surahNumber: number
  }
  JuzList: undefined
  JuzReader: {
    juzNumber: number
  }
  PageReader: {
    pageNumber: number
  }
  BookmarksList: undefined
  ReadingHistory: undefined
  TranslationSettings: undefined
  TafsirHome: undefined
  TafsirReader: {
    surahId: number
  }
  ReadingGroups: undefined
  GroupDetails: {
    groupId: string
  }
  CreateGroup: undefined
  HadithCollections: undefined
  HadithBooks: {
    collectionId: string
  }
  HadithList: {
    collectionId: string
    bookId: string
  }
  HadithDetails: {
    hadithId: string
  }
  DuasCategories: undefined
  DuasList: {
    categoryId: string
  }
  DuaDetails: {
    duaId: string
  }
}

/**
 * Reflect Tab Stack (Orange)
 * Screens: Islamic names, Tasbih counter, Analytics
 */
export type ReflectStackParamList = {
  ReflectHome: undefined
  NamesOfAllah: undefined
  NamesOfProphet: undefined
  TasbihCounter: undefined
  PrayerAnalytics: undefined
  QuranAnalytics: undefined
  DhikrAnalytics: undefined
  SettingsHome: undefined
  ProfileSettings: undefined
  ThemeSettings: undefined
  LanguageSettings: undefined
  AudioSettings: undefined
  StorageSettings: undefined
  PrivacySettings: undefined
  About: undefined
  Subscription: undefined
}

/**
 * AI Tab Stack (Red)
 * Screens: AI landing page, chatbot, chat history
 */
export type AIStackParamList = {
  AIHome: undefined
  AIChatHome: {
    initialPrompt?: string
    chatId?: string
  } | undefined
  ChatHistory: undefined
  AISettings: undefined
}

/**
 * Settings Tab Stack (Legacy - kept for backward compatibility)
 * Screens: App settings, profile, theme, language, privacy, about
 */
export type SettingsStackParamList = {
  SettingsHome: undefined
  ProfileSettings: undefined
  ThemeSettings: undefined
  LanguageSettings: undefined
  AudioSettings: undefined
  StorageSettings: undefined
  PrivacySettings: undefined
  About: undefined
  Subscription: undefined
}

/**
 * Community Tab Stack (Orange)
 * Screens: Community feed, achievements, settings, profile, theme, language, privacy, about
 */
export type MoreStackParamList = {
  MoreHome: undefined // Community Home Screen
  Achievements: undefined
  SettingsHome: undefined
  ProfileSettings: undefined
  ThemeSettings: undefined
  LanguageSettings: undefined
  AudioSettings: undefined
  StorageSettings: undefined
  PrivacySettings: undefined
  About: undefined
  Subscription: undefined
}

// =============================================================================
// MAIN TAB NAVIGATOR
// =============================================================================

/**
 * Main Tab Navigator (Bottom tabs)
 * 5 tabs: Home (Green), Pray (Purple), Read (Blue), AI (Cyan), Community (Orange)
 */
export type TabParamList = {
  ReflectTab: NavigatorScreenParams<ReflectStackParamList>  // Home tab
  PrayTab: NavigatorScreenParams<PrayStackParamList>
  ReadTab: NavigatorScreenParams<ReadStackParamList>
  AITab: NavigatorScreenParams<AIStackParamList>
  MoreTab: NavigatorScreenParams<MoreStackParamList>  // Community tab
  SettingsTab?: NavigatorScreenParams<SettingsStackParamList>  // Legacy, kept for compatibility
}

// =============================================================================
// DRAWER NAVIGATOR
// =============================================================================

/**
 * Drawer Navigator
 * Wraps the Tab Navigator to provide drawer menu functionality
 */
export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<TabParamList> | undefined
}

// =============================================================================
// ROOT APP STACK
// =============================================================================

/**
 * Root App Stack Navigator
 * Handles auth flow and main app with drawer
 */
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  Onboarding: undefined
  Drawer: NavigatorScreenParams<DrawerParamList> | undefined
  // 🔥 Your screens go here
  // IGNITE_GENERATOR_ANCHOR_APP_STACK_PARAM_LIST
}

// =============================================================================
// SCREEN PROPS HELPERS
// =============================================================================

/**
 * Helper types for accessing screen props in components
 */
export type AppStackScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>

export type DrawerScreenProps<T extends keyof DrawerParamList> = CompositeScreenProps<
  RNDrawerScreenProps<DrawerParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
>

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  DrawerScreenProps<"MainTabs">
>

export type PrayStackScreenProps<T extends keyof PrayStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<PrayStackParamList, T>,
  TabScreenProps<"PrayTab">
>

export type ReadStackScreenProps<T extends keyof ReadStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ReadStackParamList, T>,
  TabScreenProps<"ReadTab">
>

export type ReflectStackScreenProps<T extends keyof ReflectStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ReflectStackParamList, T>,
  TabScreenProps<"ReflectTab">
>

export type AIStackScreenProps<T extends keyof AIStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<AIStackParamList, T>,
  TabScreenProps<"AITab">
>

export type SettingsStackScreenProps<T extends keyof SettingsStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<SettingsStackParamList, T>,
  TabScreenProps<"SettingsTab">
>

export type MoreStackScreenProps<T extends keyof MoreStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MoreStackParamList, T>,
  TabScreenProps<"MoreTab">
>

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}
