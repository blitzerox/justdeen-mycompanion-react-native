/**
 * Prayer Stats Card
 * Displays user's prayer statistics on the prayer times screen
 */

import React, { useEffect } from "react"
import { View, ViewStyle, TextStyle, StyleSheet } from "react-native"
import { Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useFocusEffect } from "@react-navigation/native"
import type { ThemedStyle } from "@/theme/types"
import { useUserStats } from "@/hooks/useUserStats"
import { getLevelProgress, getPointsForNextLevel } from "@/utils/pointsCalculator"

export const PrayerStatsCard: React.FC = () => {
  const { themed, theme: { colors } } = useAppTheme()
  const { stats, loading, refreshStats } = useUserStats()

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshStats()
    }, [refreshStats])
  )

  if (loading) {
    return null
  }

  const levelProgress = getLevelProgress(stats.totalPoints)
  const pointsForNextLevel = getPointsForNextLevel(stats.totalPoints)

  return (
    <View style={themed($container(colors))}>
      {/* Title */}
      <View style={themed($headerRow)}>
        <FontAwesome6 name="chart-line" size={20} color={colors.pray} solid />
        <Text style={themed($title(colors))}>Your Progress</Text>
      </View>

      {/* Stats Grid */}
      <View style={themed($statsGrid)}>
        {/* Streak */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="fire" size={24} color="#FF6B35" solid />
          <Text style={themed($statValue(colors))}>{stats.prayersStreakDays}</Text>
          <Text style={themed($statLabel(colors))}>Day Streak</Text>
        </View>

        {/* Total Prayers */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="person-praying" size={24} color={colors.pray} solid />
          <Text style={themed($statValue(colors))}>{stats.totalPrayersPrayed}</Text>
          <Text style={themed($statLabel(colors))}>Prayers</Text>
        </View>

        {/* Level */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="trophy" size={24} color="#FFD700" solid />
          <Text style={themed($statValue(colors))}>Level {stats.level}</Text>
          <Text style={themed($statLabel(colors))}>
            {pointsForNextLevel ? `${pointsForNextLevel} to next` : "Max Level"}
          </Text>
        </View>
      </View>

      {/* Level Progress Bar */}
      {pointsForNextLevel !== null && (
        <View style={themed($progressContainer)}>
          <View style={themed($progressBarBackground(colors))}>
            <View style={themed($progressBarFill(colors, levelProgress))} />
          </View>
          <Text style={themed($progressText(colors))}>
            {Math.round(levelProgress)}% to Level {stats.level + 1}
          </Text>
        </View>
      )}

      {/* Points Display */}
      <View style={themed($pointsRow)}>
        <FontAwesome6 name="star" size={14} color="#FFD700" solid />
        <Text style={themed($pointsText(colors))}>{stats.totalPoints} points earned</Text>
      </View>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  marginHorizontal: 20,
  marginVertical: 12,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $headerRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
  gap: 8,
}

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})

const $statsGrid: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 16,
}

const $statItem: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  alignItems: "center",
  padding: 12,
  backgroundColor: colors.background + "40",
  borderRadius: 12,
  marginHorizontal: 4,
})

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginTop: 8,
  marginBottom: 2,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
})

const $progressContainer: ThemedStyle<ViewStyle> = {
  marginBottom: 12,
}

const $progressBarBackground: ThemedStyle<ViewStyle> = (colors) => ({
  height: 8,
  backgroundColor: colors.border,
  borderRadius: 4,
  overflow: "hidden",
  marginBottom: 6,
})

const $progressBarFill: ThemedStyle<ViewStyle> = (colors, progress: number) => ({
  height: "100%",
  width: `${progress}%`,
  backgroundColor: colors.pray,
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
})

const $pointsRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
}

const $pointsText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
})
