/**
 * Home Tab Stack Navigator (Reflect/Spiritual Journey)
 *
 * Screens:
 * - ReflectHome: Home dashboard with daily stats and spiritual progress (P0)
 * - NamesOfAllah: 99 Names of Allah (P1)
 * - NamesOfProphet: Names of Prophet Muhammad (P1)
 * - TasbihCounter: Digital tasbih counter (P1)
 * - PrayerAnalytics: Prayer statistics and streaks (P1)
 * - QuranAnalytics: Quran reading progress and insights (P1)
 * - DhikrAnalytics: Dhikr counter analytics (P1)
 * - Achievements: Badges and achievements (P2)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { ReflectHomeScreen } from "@/screens/reflect/ReflectHomeScreen"
import { NamesOfAllahScreen } from "@/screens/reflect/NamesOfAllahScreen"
import { NamesOfProphetScreen } from "@/screens/reflect/NamesOfProphetScreen"
import { TasbihCounterScreen } from "@/screens/reflect/TasbihCounterScreen"
import { PrayerAnalyticsScreen } from "@/screens/stats/PrayerAnalyticsScreen"
import { QuranAnalyticsScreen } from "@/screens/stats/QuranAnalyticsScreen"
import { DhikrAnalyticsScreen } from "@/screens/stats/DhikrAnalyticsScreen"
import { AchievementsScreen } from "@/screens/more/AchievementsScreen"
import { SettingsHomeScreen } from "@/screens/settings/SettingsHomeScreen"
import { ProfileSettingsScreen } from "@/screens/settings/ProfileSettingsScreen"
import { ThemeSettingsScreen } from "@/screens/settings/ThemeSettingsScreen"
import { LanguageSettingsScreen } from "@/screens/settings/LanguageSettingsScreen"
import { AudioSettingsScreen } from "@/screens/settings/AudioSettingsScreen"
import { StorageSettingsScreen } from "@/screens/settings/StorageSettingsScreen"
import { PrivacySettingsScreen } from "@/screens/settings/PrivacySettingsScreen"
import { AboutScreen } from "@/screens/settings/AboutScreen"
import { SubscriptionScreen } from "@/screens/settings/SubscriptionScreen"

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
      <Stack.Screen
        name="SettingsHome"
        component={SettingsHomeScreen}
        options={{
          title: "Settings",
        }}
      />
      <Stack.Screen
        name="ProfileSettings"
        component={ProfileSettingsScreen}
        options={{
          title: "Profile",
        }}
      />
      <Stack.Screen
        name="ThemeSettings"
        component={ThemeSettingsScreen}
        options={{
          title: "Theme",
        }}
      />
      <Stack.Screen
        name="LanguageSettings"
        component={LanguageSettingsScreen}
        options={{
          title: "Language",
        }}
      />
      <Stack.Screen
        name="AudioSettings"
        component={AudioSettingsScreen}
        options={{
          title: "Audio",
        }}
      />
      <Stack.Screen
        name="StorageSettings"
        component={StorageSettingsScreen}
        options={{
          title: "Storage",
        }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{
          title: "Privacy",
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: "About",
        }}
      />
      <Stack.Screen
        name="Subscription"
        component={SubscriptionScreen}
        options={{
          title: "Premium",
        }}
      />
    </Stack.Navigator>
  )
}
