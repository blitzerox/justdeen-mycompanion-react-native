/**
 * Read Tab Stack Navigator
 *
 * Screens:
 * - ReadHome: Library home with Quran, Tafsir, Hadith, Dua cards (P0)
 * - QuranHome: Main Quran reading screen with Surah/Juz/Page list (CRITICAL - P0)
 * - QuranReader: Verse-by-verse reading with translations (CRITICAL - P0)
 * - SurahDetails: Surah overview and metadata (P1)
 * - JuzList: List of 30 Juz (P1)
 * - JuzReader: Read by Juz (P1)
 * - PageReader: Read by Page (P1)
 * - BookmarksList: Saved bookmarks (P1)
 * - ReadingHistory: Recently read verses (P1)
 * - TranslationSettings: Manage translations (P1)
 * - ReadingGroups: Community reading groups (P2)
 * - GroupDetails: Group info and members (P2)
 * - CreateGroup: Create new reading group (P2)
 * - HadithCollections: Sahih Bukhari, Muslim, etc. (P1)
 * - HadithBooks: Books within a collection (P1)
 * - HadithList: List of hadith (P1)
 * - HadithDetails: Full hadith with commentary (P1)
 * - DuasCategories: Categories of duas (P0)
 * - DuasList: List of duas in category (P0)
 * - DuaDetails: Full dua with translation (P0)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { ReadHomeScreen } from "@/screens/read/ReadHomeScreen"
import { QuranHomeScreen } from "@/screens/read/QuranHomeScreen"
import { QuranReaderScreen } from "@/screens/read/QuranReaderScreen"
import { SurahDetailsScreen } from "@/screens/read/SurahDetailsScreen"
import { JuzListScreen } from "@/screens/read/JuzListScreen"
import { JuzReaderScreen } from "@/screens/read/JuzReaderScreen"
import { PageReaderScreen } from "@/screens/read/PageReaderScreen"
import { BookmarksListScreen } from "@/screens/read/BookmarksListScreen"
import { ReadingHistoryScreen } from "@/screens/read/ReadingHistoryScreen"
import { TranslationSettingsScreen } from "@/screens/read/TranslationSettingsScreen"
import { TafsirHomeScreen } from "@/screens/read/TafsirHomeScreen"
import { TafsirReaderScreen } from "@/screens/read/TafsirReaderScreen"
import { ReadingGroupsScreen } from "@/screens/read/ReadingGroupsScreen"
import { GroupDetailsScreen } from "@/screens/read/GroupDetailsScreen"
import { CreateGroupScreen } from "@/screens/read/CreateGroupScreen"
import { HadithCollectionsScreen } from "@/screens/reflect/HadithCollectionsScreen"
import { HadithBooksScreen } from "@/screens/reflect/HadithBooksScreen"
import { HadithListScreen } from "@/screens/reflect/HadithListScreen"
import { HadithDetailsScreen } from "@/screens/reflect/HadithDetailsScreen"
import { DuasCategoriesScreen } from "@/screens/reflect/DuasCategoriesScreen"
import { DuasListScreen } from "@/screens/reflect/DuasListScreen"
import { DuaDetailsScreen } from "@/screens/reflect/DuaDetailsScreen"

import type { ReadStackParamList } from "../navigationTypes"

const Stack = createNativeStackNavigator<ReadStackParamList>()

export const ReadStackNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.read,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        headerLargeTitleShadowVisible: false,
        headerBlurEffect: undefined,
        headerTransparent: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="ReadHome"
        component={ReadHomeScreen}
        options={{
          headerShown: false,
          headerTitle: "Read", // Back button text
        }}
      />
      <Stack.Screen
        name="QuranHome"
        component={QuranHomeScreen}
        options={{
          title: "Al-Qur'an",
        }}
      />
      <Stack.Screen
        name="QuranReader"
        component={QuranReaderScreen}
        options={{
          title: "Reading",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SurahDetails"
        component={SurahDetailsScreen}
        options={{
          title: "Surah Details",
        }}
      />
      <Stack.Screen
        name="JuzList"
        component={JuzListScreen}
        options={{
          title: "Juz",
        }}
      />
      <Stack.Screen
        name="JuzReader"
        component={JuzReaderScreen}
        options={{
          title: "Reading",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="PageReader"
        component={PageReaderScreen}
        options={{
          title: "Reading",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="BookmarksList"
        component={BookmarksListScreen}
        options={{
          title: "Bookmarks",
        }}
      />
      <Stack.Screen
        name="ReadingHistory"
        component={ReadingHistoryScreen}
        options={{
          title: "History",
        }}
      />
      <Stack.Screen
        name="TranslationSettings"
        component={TranslationSettingsScreen}
        options={{
          title: "Translations",
        }}
      />
      <Stack.Screen
        name="TafsirHome"
        component={TafsirHomeScreen}
        options={{
          title: "Tafsir",
        }}
      />
      <Stack.Screen
        name="TafsirReader"
        component={TafsirReaderScreen}
        options={{
          title: "Tafsir",
        }}
      />
      <Stack.Screen
        name="ReadingGroups"
        component={ReadingGroupsScreen}
        options={{
          title: "Reading Groups",
        }}
      />
      <Stack.Screen
        name="GroupDetails"
        component={GroupDetailsScreen}
        options={{
          title: "Group",
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: "Create Group",
        }}
      />
      <Stack.Screen
        name="HadithCollections"
        component={HadithCollectionsScreen}
        options={{
          title: "Hadith",
        }}
      />
      <Stack.Screen
        name="HadithBooks"
        component={HadithBooksScreen}
        options={{
          title: "Books",
        }}
      />
      <Stack.Screen
        name="HadithList"
        component={HadithListScreen}
        options={{
          title: "Hadith",
        }}
      />
      <Stack.Screen
        name="HadithDetails"
        component={HadithDetailsScreen}
        options={{
          title: "Hadith",
        }}
      />
      <Stack.Screen
        name="DuasCategories"
        component={DuasCategoriesScreen}
        options={{
          title: "Duas",
        }}
      />
      <Stack.Screen
        name="DuasList"
        component={DuasListScreen}
        options={{
          title: "Duas",
        }}
      />
      <Stack.Screen
        name="DuaDetails"
        component={DuaDetailsScreen}
        options={{
          title: "Dua",
        }}
      />
    </Stack.Navigator>
  )
}
