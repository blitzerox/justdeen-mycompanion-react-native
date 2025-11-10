/**
 * Pray Tab Stack Navigator
 *
 * Screens:
 * - PrayerTimesHome: Main prayer times screen (CRITICAL - P0)
 * - QiblaCompass: Qibla direction compass (CRITICAL - P0)
 * - PrayerTimingSettings: Configure prayer calculation method (P1)
 * - NotificationSettings: Adhan and notification settings (P1)
 * - IslamicCalendar: Hijri calendar with Islamic events (P1)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { PrayerTimesHomeScreen } from "@/screens/pray/PrayerTimesHomeScreen"
import { QiblaCompassScreen } from "@/screens/pray/QiblaCompassScreen"
import { PrayerTimingSettingsScreen } from "@/screens/pray/PrayerTimingSettingsScreen"
import { NotificationSettingsScreen } from "@/screens/pray/NotificationSettingsScreen"
import { IslamicCalendarScreen } from "@/screens/pray/IslamicCalendarScreen"

import type { PrayStackParamList } from "../navigationTypes"

const Stack = createNativeStackNavigator<PrayStackParamList>()

export const PrayStackNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.pray,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      <Stack.Screen
        name="PrayerTimesHome"
        component={PrayerTimesHomeScreen}
        options={{
          title: "Prayer Times",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="QiblaCompass"
        component={QiblaCompassScreen}
        options={{
          title: "Qibla",
        }}
      />
      <Stack.Screen
        name="PrayerTimingSettings"
        component={PrayerTimingSettingsScreen}
        options={{
          title: "Prayer Timing",
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: "Notifications",
        }}
      />
      <Stack.Screen
        name="IslamicCalendar"
        component={IslamicCalendarScreen}
        options={{
          title: "Islamic Calendar",
        }}
      />
    </Stack.Navigator>
  )
}
