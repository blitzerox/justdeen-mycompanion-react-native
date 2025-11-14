/**
 * Community Tab Stack Navigator
 *
 * Screens:
 * - MoreHome: Community home screen with social feed (P0)
 * - Achievements: User achievements and badges (P0)
 * - SettingsHome: App settings (P0)
 * - ProfileSettings: User profile and account (P1)
 * - ThemeSettings: Dark mode, OLED mode (P0)
 * - LanguageSettings: App language and translation preferences (P1)
 * - AudioSettings: Audio player, reciter selection (P1)
 * - StorageSettings: Offline data, cache management (P1)
 * - PrivacySettings: Data privacy, analytics opt-out (P1)
 * - AboutScreen: App info, version, credits (P1)
 * - SubscriptionScreen: Premium features, IAP (P2)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { CommunityHomeScreen } from "@/screens/community/CommunityHomeScreen"
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

import type { MoreStackParamList } from "../navigationTypes"

const Stack = createNativeStackNavigator<MoreStackParamList>()

export const MoreStackNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.more,
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
        name="MoreHome"
        component={CommunityHomeScreen}
        options={{
          headerShown: false,
          headerTitle: "More", // Back button text
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
