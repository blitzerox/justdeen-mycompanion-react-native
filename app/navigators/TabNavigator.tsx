/**
 * JustDeen Tab Navigator
 *
 * WWDC 5-Tab Design:
 * - 🏠 Home (Green): Daily stats, spiritual journey, progress tracking
 * - 🕌 Pray (Purple): Prayer times, Qibla, Adhan settings
 * - 📖 Read (Blue): Quran reading, translations, bookmarks
 * - 🤖 AI (Cyan): AI chatbot, Islamic Q&A
 * - 👥 Community (Orange): Social feed, achievements, settings
 */
import React from "react"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import { useAppTheme } from "@/theme/context"
import { Icon } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"

// Tab Stack Navigators
import { PrayStackNavigator } from "./stacks/PrayStack"
import { ReadStackNavigator } from "./stacks/ReadStack"
import { ReflectStackNavigator } from "./stacks/ReflectStack"
import { AIStackNavigator } from "./stacks/AIStack"
import { MoreStackNavigator } from "./stacks/MoreStack"

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
          paddingBottom: 24,
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="ReflectTab"
        component={ReflectStackNavigator}
        options={{
          tabBarLabel: "Home",
          tabBarActiveTintColor: colors.home,
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome6 name="house" color={color} size={size} solid={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="PrayTab"
        component={PrayStackNavigator}
        options={{
          tabBarLabel: "Pray",
          tabBarActiveTintColor: colors.pray,
          tabBarIcon: ({ focused, color, size }) => (
            <FontAwesome6 name="person-praying" color={color} size={size} solid={focused} />
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
            <FontAwesome6 name="book-quran" color={color} size={size} solid={focused} />
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
            <FontAwesome6 name="robot" color={color} size={size} solid={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="MoreTab"
        component={MoreStackNavigator}
        options={{
          tabBarLabel: "Community",
          tabBarActiveTintColor: colors.more,
          tabBarIcon: ({ focused, color, size}) => (
            <FontAwesome6 name="users" color={color} size={size} solid={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
