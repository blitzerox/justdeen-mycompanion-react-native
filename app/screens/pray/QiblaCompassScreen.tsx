/**
 * Qibla Compass Screen
 *
 * CRITICAL - P0 Feature
 * Requirements: ±1 degree accuracy requirement
 */
import React from "react"
import { View, Text, StyleSheet } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { PrayStackScreenProps } from "@/navigators"

export const QiblaCompassScreen: React.FC<PrayStackScreenProps<"QiblaCompass">> = () => {
  const {
    theme: { colors },
  } = useAppTheme()

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.pray }]}>Qibla Compass</Text>
        <Text style={[styles.description, { color: colors.textDim }]}>
          Week 11: Compass with Qibla direction (±1 degree accuracy)
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 22 },
})
