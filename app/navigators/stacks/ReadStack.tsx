/**
 * Read Tab Stack Navigator
 *
 * Screens:
 * - QuranHome: Main Quran reading screen with Surah list (CRITICAL - P0)
 * - QuranReader: Verse-by-verse reading with translations (CRITICAL - P0)
 * - SurahDetails: Surah overview and metadata (P1)
 * - JuzList: List of 30 Juz (P1)
 * - JuzReader: Read by Juz (P1)
 * - BookmarksList: Saved bookmarks (P1)
 * - ReadingHistory: Recently read verses (P1)
 * - TranslationSettings: Manage translations (P1)
 * - ReadingGroups: Community reading groups (P2)
 * - GroupDetails: Group info and members (P2)
 * - CreateGroup: Create new reading group (P2)
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
import { BookmarksListScreen } from "@/screens/read/BookmarksListScreen"
import { ReadingHistoryScreen } from "@/screens/read/ReadingHistoryScreen"
import { TranslationSettingsScreen } from "@/screens/read/TranslationSettingsScreen"
import { ReadingGroupsScreen } from "@/screens/read/ReadingGroupsScreen"
import { GroupDetailsScreen } from "@/screens/read/GroupDetailsScreen"
import { CreateGroupScreen } from "@/screens/read/CreateGroupScreen"

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
    </Stack.Navigator>
  )
}
