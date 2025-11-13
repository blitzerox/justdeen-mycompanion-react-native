/**
 * Drawer Footer Component
 * Displays app version and copyright information
 */
import React from "react"
import { View, Text, ViewStyle, TextStyle } from "react-native"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import * as Application from "expo-application"

export const DrawerFooter: React.FC = () => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const appVersion = Application.nativeApplicationVersion || "1.0.0"
  const currentYear = new Date().getFullYear()

  return (
    <View style={themed($footer(colors))}>
      <Text style={themed($versionText(colors))}>Version {appVersion}</Text>
      <Text style={themed($copyrightText(colors))}>© {currentYear} JustDeen</Text>
    </View>
  )
}

// Styles
const $footer: ThemedStyle<ViewStyle> = (colors) => ({
  padding: 20,
  borderTopWidth: 1,
  borderTopColor: colors.border,
  alignItems: "center",
  backgroundColor: colors.background,
})

const $versionText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: 4,
})

const $copyrightText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})
