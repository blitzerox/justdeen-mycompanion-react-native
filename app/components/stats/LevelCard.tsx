/**
 * Level Card Component
 * Shows user level and progress towards next level
 */

import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useFocusEffect } from "@react-navigation/native"
import type { ThemedStyle } from "@/theme/types"
import { useUserStats } from "@/hooks/useUserStats"
import { getLevelProgress, getPointsForNextLevel } from "@/utils/pointsCalculator"
import Svg, { Circle } from "react-native-svg"

interface LevelCardProps {
  onPress?: () => void
}

export const LevelCard: React.FC<LevelCardProps> = ({ onPress }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { stats, refreshStats } = useUserStats()

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshStats()
    }, [refreshStats])
  )

  const levelProgress = getLevelProgress(stats.totalPoints)
  const pointsForNextLevel = getPointsForNextLevel(stats.totalPoints)

  // Calculate progress for the circular ring
  const progressPercentage = pointsForNextLevel !== null ? levelProgress : 100
  const size = 80
  const strokeWidth = 6
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference

  return (
    <TouchableOpacity
      style={themed($container(colors))}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={themed($left)}>
        <View style={themed($iconContainer(colors))}>
          <FontAwesome6 name="trophy" size={24} color="#FFD700" solid />
        </View>
        <View>
          <Text style={themed($levelText(colors))}>Level {stats.level}</Text>
          {pointsForNextLevel !== null ? (
            <Text style={themed($subtitle(colors))}>
              {pointsForNextLevel} points to next level
            </Text>
          ) : (
            <Text style={themed($subtitle(colors))}>Maximum level reached</Text>
          )}
        </View>
      </View>
      <View style={themed($right)}>
        {/* Circular Progress Ring */}
        <View style={themed($progressRing)}>
          <Svg width={size} height={size}>
            {/* Background Circle */}
            <Circle
              stroke={colors.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
            />
            {/* Progress Circle */}
            <Circle
              stroke={colors.home}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={radius}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
          {/* Center Content - Points */}
          <View style={themed($ringCenter)}>
            <Text style={themed($ringValue(colors))}>{stats.totalPoints}</Text>
            <Text style={themed($ringLabel(colors))}>pts</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 20,
  marginHorizontal: 20,
  marginTop: 6,
  marginBottom: 24,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $left: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  flex: 1,
}

const $iconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.home + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $levelText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $subtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $right: ThemedStyle<ViewStyle> = {
  alignItems: "center",
  justifyContent: "center",
}

const $progressRing: ThemedStyle<ViewStyle> = {
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
}

const $ringCenter: ThemedStyle<ViewStyle> = {
  position: "absolute",
  alignItems: "center",
  justifyContent: "center",
}

const $ringValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  lineHeight: 20,
})

const $ringLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 10,
  fontWeight: "600",
  color: colors.textDim,
  marginTop: 2,
})
