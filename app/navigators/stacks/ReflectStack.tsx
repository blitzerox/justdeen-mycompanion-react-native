/**
 * Home Tab Stack Navigator (Reflect/Spiritual Journey)
 *
 * Screens:
 * - ReflectHome: Home dashboard with daily stats and spiritual progress (P0)
 * - DuasCategories: Categories of duas (P0)
 * - DuasListScreen: List of duas in category (P0)
 * - DuaDetails: Full dua with translation (P0)
 * - HadithCollections: Sahih Bukhari, Muslim, etc. (P1)
 * - HadithBooks: Books within a collection (P1)
 * - HadithList: List of hadith (P1)
 * - HadithDetails: Full hadith with commentary (P1)
 * - NamesOfAllah: 99 Names of Allah (P1)
 * - NamesOfProphet: Names of Prophet Muhammad (P1)
 * - TasbihCounter: Digital tasbih counter (P1)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { ReflectHomeScreen } from "@/screens/reflect/ReflectHomeScreen"
import { DuasCategoriesScreen } from "@/screens/reflect/DuasCategoriesScreen"
import { DuasListScreen } from "@/screens/reflect/DuasListScreen"
import { DuaDetailsScreen } from "@/screens/reflect/DuaDetailsScreen"
import { HadithCollectionsScreen } from "@/screens/reflect/HadithCollectionsScreen"
import { HadithBooksScreen } from "@/screens/reflect/HadithBooksScreen"
import { HadithListScreen } from "@/screens/reflect/HadithListScreen"
import { HadithDetailsScreen } from "@/screens/reflect/HadithDetailsScreen"
import { NamesOfAllahScreen } from "@/screens/reflect/NamesOfAllahScreen"
import { NamesOfProphetScreen } from "@/screens/reflect/NamesOfProphetScreen"
import { TasbihCounterScreen } from "@/screens/reflect/TasbihCounterScreen"
import { PrayerAnalyticsScreen } from "@/screens/stats/PrayerAnalyticsScreen"
import { QuranAnalyticsScreen } from "@/screens/stats/QuranAnalyticsScreen"
import { DhikrAnalyticsScreen } from "@/screens/stats/DhikrAnalyticsScreen"
import { AchievementsScreen } from "@/screens/more/AchievementsScreen"

import type { ReflectStackParamList } from "../navigationTypes"

const Stack = createNativeStackNavigator<ReflectStackParamList>()

export const ReflectStackNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.home,
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
        name="ReflectHome"
        component={ReflectHomeScreen}
        options={{
          headerShown: false,
          headerTitle: "Home", // Back button text for child screens
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
        name="NamesOfAllah"
        component={NamesOfAllahScreen}
        options={{
          title: "99 Names of Allah",
        }}
      />
      <Stack.Screen
        name="NamesOfProphet"
        component={NamesOfProphetScreen}
        options={{
          title: "Names of Prophet",
        }}
      />
      <Stack.Screen
        name="TasbihCounter"
        component={TasbihCounterScreen}
        options={{
          title: "Tasbih",
        }}
      />
      <Stack.Screen
        name="PrayerAnalytics"
        component={PrayerAnalyticsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="QuranAnalytics"
        component={QuranAnalyticsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="DhikrAnalytics"
        component={DhikrAnalyticsScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Achievements"
        component={AchievementsScreen}
        options={{
          title: "Achievements",
        }}
      />
    </Stack.Navigator>
  )
}
