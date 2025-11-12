/**
 * Home Stats Widget
 * Comprehensive statistics widget for the home screen
 * Shows prayer, Quran, tasbih stats, level, and streak
 */

import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useFocusEffect } from "@react-navigation/native"
import type { ThemedStyle } from "@/theme/types"
import { useUserStats } from "@/hooks/useUserStats"
import { usePrayerTracking } from "@/hooks/usePrayerTracking"
import { useQuranTracking } from "@/hooks/useQuranTracking"
import { useTasbihCounter } from "@/hooks/useTasbihCounter"
import { getLevelProgress, getPointsForNextLevel } from "@/utils/pointsCalculator"

interface HomeStatsWidgetProps {
  onPrayerPress?: () => void
  onQuranPress?: () => void
  onTasbihPress?: () => void
  onLevelPress?: () => void
}

export const HomeStatsWidget: React.FC<HomeStatsWidgetProps> = ({
  onPrayerPress,
  onQuranPress,
  onTasbihPress,
  onLevelPress,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { stats, refreshStats } = useUserStats()
  const { todayPrayerCount } = usePrayerTracking()
  const { quranStats } = useQuranTracking()
  const { tasbihStats } = useTasbihCounter()

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshStats()
    }, [refreshStats])
  )

  const levelProgress = getLevelProgress(stats.totalPoints)
  const pointsForNextLevel = getPointsForNextLevel(stats.totalPoints)

  // Calculate max streak across all activities
  const maxStreak = Math.max(
    stats.prayersStreakDays,
    quranStats.streakDays,
    0 // Can add more streaks here
  )

  return (
    <View style={themed($container(colors))}>
      {/* Title */}
      <View style={themed($headerRow)}>
        <FontAwesome6 name="chart-line" size={20} color={colors.home} solid />
        <Text style={themed($title(colors))}>Your Progress</Text>
      </View>

      {/* Daily Stats Grid */}
      <View style={themed($statsGrid)}>
        {/* Prayers */}
        <TouchableOpacity
          style={themed($statCard(colors))}
          onPress={onPrayerPress}
          activeOpacity={0.7}
        >
          <View style={themed($statIconContainer(colors.pray))}>
            <FontAwesome6 name="person-praying" size={20} color={colors.pray} solid />
          </View>
          <Text style={themed($statValue(colors))}>{todayPrayerCount}/5</Text>
          <Text style={themed($statLabel(colors))}>Prayers</Text>
          <Text style={themed($statSublabel(colors))}>Today</Text>
        </TouchableOpacity>

        {/* Quran */}
        <TouchableOpacity
          style={themed($statCard(colors))}
          onPress={onQuranPress}
          activeOpacity={0.7}
        >
          <View style={themed($statIconContainer(colors.read))}>
            <FontAwesome6 name="book-quran" size={20} color={colors.read} solid />
          </View>
          <Text style={themed($statValue(colors))}>{quranStats.totalPagesRead}</Text>
          <Text style={themed($statLabel(colors))}>Quran</Text>
          <Text style={themed($statSublabel(colors))}>Pages read</Text>
        </TouchableOpacity>

        {/* Tasbih */}
        <TouchableOpacity
          style={themed($statCard(colors))}
          onPress={onTasbihPress}
          activeOpacity={0.7}
        >
          <View style={themed($statIconContainer("#9C27B0"))}>
            <FontAwesome6 name="hand" size={20} color="#9C27B0" solid />
          </View>
          <Text style={themed($statValue(colors))}>{tasbihStats.totalCount}</Text>
          <Text style={themed($statLabel(colors))}>Dhikr</Text>
          <Text style={themed($statSublabel(colors))}>Total count</Text>
        </TouchableOpacity>

        {/* Streak */}
        <View style={themed($statCard(colors))}>
          <View style={themed($statIconContainer("#FF6B35"))}>
            <FontAwesome6 name="fire" size={20} color="#FF6B35" solid />
          </View>
          <Text style={themed($statValue(colors))}>{maxStreak}</Text>
          <Text style={themed($statLabel(colors))}>Streak</Text>
          <Text style={themed($statSublabel(colors))}>Days</Text>
        </View>
      </View>

      {/* Level & Progress Bar */}
      <TouchableOpacity
        style={themed($levelContainer(colors))}
        onPress={onLevelPress}
        activeOpacity={0.7}
      >
        <View style={themed($levelHeader)}>
          <View style={themed($levelIconContainer)}>
            <FontAwesome6 name="trophy" size={18} color="#FFD700" solid />
          </View>
          <Text style={themed($levelText(colors))}>Level {stats.level}</Text>
          <View style={themed($spacer)} />
          <View style={themed($pointsBadge(colors))}>
            <FontAwesome6 name="star" size={12} color="#FFD700" solid />
            <Text style={themed($pointsText(colors))}>{stats.totalPoints}</Text>
          </View>
        </View>

        {/* Progress Bar */}
        {pointsForNextLevel !== null && (
          <View style={themed($progressContainer)}>
            <View style={themed($progressBarBackground(colors))}>
              <View style={themed($progressBarFill(colors, levelProgress))} />
            </View>
            <Text style={themed($progressText(colors))}>
              {pointsForNextLevel} points to Level {stats.level + 1}
            </Text>
          </View>
        )}

        {pointsForNextLevel === null && (
          <Text style={themed($maxLevelText(colors))}>Maximum Level Reached! 🎉</Text>
        )}
      </TouchableOpacity>
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
  gap: 8,
}

const $statCard: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  alignItems: "center",
  padding: 12,
  backgroundColor: colors.background + "60",
  borderRadius: 12,
  minWidth: 70,
})

const $statIconContainer: ThemedStyle<ViewStyle> = (bgColor: string) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: bgColor + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
})

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 2,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $statSublabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 9,
  color: colors.textDim,
})

const $levelContainer: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.background + "60",
  borderRadius: 12,
  padding: 16,
})

const $levelHeader: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
}

const $levelIconContainer: ThemedStyle<ViewStyle> = {
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: "#FFD70020",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 8,
}

const $levelText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
})

const $spacer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $pointsBadge: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.background,
  borderRadius: 12,
  paddingHorizontal: 10,
  paddingVertical: 6,
  gap: 6,
})

const $pointsText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  fontWeight: "700",
  color: colors.text,
})

const $progressContainer: ThemedStyle<ViewStyle> = {
  gap: 6,
}

const $progressBarBackground: ThemedStyle<ViewStyle> = (colors) => ({
  height: 8,
  backgroundColor: colors.border,
  borderRadius: 4,
  overflow: "hidden",
})

const $progressBarFill: ThemedStyle<ViewStyle> = (colors, progress: number) => ({
  height: "100%",
  width: `${progress}%`,
  backgroundColor: colors.home,
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
})

const $maxLevelText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.home,
  textAlign: "center",
})
