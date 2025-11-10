/**
 * Prayer Times Home Screen
 *
 * CRITICAL - P0 Feature
 * Displays:
 * - Current prayer time and countdown to next prayer
 * - Today's 5 prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha)
 * - Location-based calculation
 * - Prayer logging (mark as prayed)
 * - Quick access to Qibla compass
 *
 * Requirements:
 * - ±1 minute accuracy requirement
 * - AlAdhan API integration
 * - MMKV caching for offline support
 */
import React from "react"
import { View, Text, StyleSheet, ScrollView } from "react-native"
import { Screen } from "@/components"
import { useAppTheme } from "@/theme/context"
import { usePrayer } from "@/context/PrayerContext"
import type { PrayStackScreenProps } from "@/navigators"

export const PrayerTimesHomeScreen: React.FC<PrayStackScreenProps<"PrayerTimesHome">> = ({
  navigation,
}) => {
  const {
    theme: { colors, spacing },
  } = useAppTheme()
  const { prayerTimes, loading, error, getNextPrayer } = usePrayer()

  return (
    <Screen preset="scroll" contentContainerStyle={styles.container}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.pray }]}>Prayer Times</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          This is a placeholder screen for Prayer Times.
        </Text>
        <Text style={[styles.description, { color: colors.textDim }]}>
          Week 8-10: This screen will display today's prayer times with countdown, location-based
          calculation, and prayer logging functionality.
        </Text>
        {loading && (
          <Text style={[styles.status, { color: colors.textDim }]}>Loading prayer times...</Text>
        )}
        {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
        {prayerTimes.length > 0 && (
          <View style={styles.timesContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Prayer Times:</Text>
            {prayerTimes.map((prayer) => (
              <Text key={prayer.name} style={[styles.prayerTime, { color: colors.text }]}>
                {prayer.name}: {prayer.time}
              </Text>
            ))}
          </View>
        )}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  status: {
    fontSize: 15,
    marginBottom: 16,
  },
  error: {
    fontSize: 15,
    marginBottom: 16,
  },
  timesContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 12,
  },
  prayerTime: {
    fontSize: 15,
    marginBottom: 8,
  },
})
