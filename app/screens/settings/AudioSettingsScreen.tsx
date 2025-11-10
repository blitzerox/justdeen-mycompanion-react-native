/**
 * Audio Settings Screen
 *
 * Week 12-15: Audio player, reciter selection
 */
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { SettingsStackScreenProps } from "@/navigators"

export const AudioSettingsScreen: React.FC<SettingsStackScreenProps<"AudioSettings">> = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.settings }]}>Audio Settings</Text>
        <Text style={[styles.description, { color: colors.textDim }]}>
          Week 12-15: Audio player, reciter selection
        </Text>
        <Text style={[styles.placeholder, { color: colors.textDim }]}>
          🚧 This screen will be implemented in future phases.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22, marginBottom: 16 },
  placeholder: { fontSize: 13, fontStyle: "italic" },
})
