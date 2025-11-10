/**
 * AI Tab Stack Navigator
 *
 * Screens:
 * - AIChatHome: Main AI chatbot screen (P2)
 * - ChatHistory: Previous conversations (P3)
 * - AISettings: AI preferences and model settings (P3)
 */
import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"

// Screens
import { AIChatHomeScreen } from "@/screens/ai/AIChatHomeScreen"
import { ChatHistoryScreen } from "@/screens/ai/ChatHistoryScreen"
import { AISettingsScreen } from "@/screens/ai/AISettingsScreen"

import type { AIStackParamList } from "../navigationTypes"

const Stack = createNativeStackNavigator<AIStackParamList>()

export const AIStackNavigator = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTintColor: colors.ai,
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
        name="AIChatHome"
        component={AIChatHomeScreen}
        options={{
          title: "AI Assistant",
          headerLargeTitle: true,
        }}
      />
      <Stack.Screen
        name="ChatHistory"
        component={ChatHistoryScreen}
        options={{
          title: "History",
        }}
      />
      <Stack.Screen
        name="AISettings"
        component={AISettingsScreen}
        options={{
          title: "AI Settings",
        }}
      />
    </Stack.Navigator>
  )
}
