import { ComponentProps } from "react"
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs"
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
}

/**
 * Read Tab Stack (Blue)
 * Screens: Quran reading, translations, bookmarks, reading groups
 */
export type ReadStackParamList = {
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
  BookmarksList: undefined
  ReadingHistory: undefined
  TranslationSettings: undefined
  ReadingGroups: undefined
  GroupDetails: {
    groupId: string
  }
  CreateGroup: undefined
}

/**
 * Reflect Tab Stack (Orange)
 * Screens: Duas, Hadith, Islamic names, Tasbih counter
 */
export type ReflectStackParamList = {
  ReflectHome: undefined
  DuasCategories: undefined
  DuasList: {
    categoryId: string
  }
  DuaDetails: {
    duaId: string
  }
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
  NamesOfAllah: undefined
  NamesOfProphet: undefined
  TasbihCounter: undefined
}

/**
 * AI Tab Stack (Indigo)
 * Screens: AI chatbot, chat history
 */
export type AIStackParamList = {
  AIChatHome: undefined
  ChatHistory: undefined
  AISettings: undefined
}

/**
 * Settings Tab Stack (Green)
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

// =============================================================================
// MAIN TAB NAVIGATOR
// =============================================================================

/**
 * Main Tab Navigator (Bottom tabs)
 * 5 tabs: Pray, Read, Reflect, AI, Settings
 */
export type TabParamList = {
  PrayTab: NavigatorScreenParams<PrayStackParamList>
  ReadTab: NavigatorScreenParams<ReadStackParamList>
  ReflectTab: NavigatorScreenParams<ReflectStackParamList>
  AITab: NavigatorScreenParams<AIStackParamList>
  SettingsTab: NavigatorScreenParams<SettingsStackParamList>
}

// =============================================================================
// ROOT APP STACK
// =============================================================================

/**
 * Root App Stack Navigator
 * Handles auth flow and main app
 */
export type AppStackParamList = {
  Welcome: undefined
  Login: undefined
  MainTabs: NavigatorScreenParams<TabParamList> | undefined
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

export type TabScreenProps<T extends keyof TabParamList> = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, T>,
  AppStackScreenProps<keyof AppStackParamList>
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

export interface NavigationProps
  extends Partial<ComponentProps<typeof NavigationContainer<AppStackParamList>>> {}
