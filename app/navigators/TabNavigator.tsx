/**
 * JustDeen Tab Navigator
 *
 * WWDC 5-Tab Design:
 * - 🕌 Pray (Purple): Prayer times, Qibla, Adhan settings
 * - 📖 Read (Blue): Quran reading, translations, bookmarks
 * - 💭 Reflect (Orange): Duas, Hadith, Islamic names, Tasbih
 * - 🤖 AI (Indigo): AI chatbot, Islamic Q&A
 * - ⚙️ Settings (Green): App settings, profile, preferences
 */
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useAppTheme } from "@/theme/context"
import { Icon } from "@/components"

// Tab Stack Navigators
import { PrayStackNavigator } from "./stacks/PrayStack"
import { ReadStackNavigator } from "./stacks/ReadStack"
import { ReflectStackNavigator } from "./stacks/ReflectStack"
import { AIStackNavigator } from "./stacks/AIStack"
import { SettingsStackNavigator } from "./stacks/SettingsStack"

import type { TabParamList } from "./navigationTypes"

const Tab = createBottomTabNavigator<TabParamList>()

export const TabNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="PrayTab"
        component={PrayStackNavigator}
        options={{
          tabBarLabel: "Pray",
          tabBarActiveTintColor: colors.pray,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon icon="community" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReadTab"
        component={ReadStackNavigator}
        options={{
          tabBarLabel: "Read",
          tabBarActiveTintColor: colors.read,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon icon="components" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReflectTab"
        component={ReflectStackNavigator}
        options={{
          tabBarLabel: "Reflect",
          tabBarActiveTintColor: colors.reflect,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon icon="heart" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="AITab"
        component={AIStackNavigator}
        options={{
          tabBarLabel: "AI",
          tabBarActiveTintColor: colors.ai,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon icon="settings" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsStackNavigator}
        options={{
          tabBarLabel: "Settings",
          tabBarActiveTintColor: colors.settings,
          tabBarIcon: ({ focused, color, size }) => (
            <Icon icon="settings" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
