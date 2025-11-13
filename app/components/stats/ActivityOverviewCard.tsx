/**
 * Activity Overview Card
 * Shows today's completion status and streak for Prayer, Quran, or Dhikr
 */

import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"

interface ActivityOverviewCardProps {
  type: "prayer" | "quran" | "dhikr"
  current: number
  goal: number
  streak: number
  icon: string
  color: string
  onPress: () => void
}

export const ActivityOverviewCard: React.FC<ActivityOverviewCardProps> = ({
  type,
  current,
  goal,
  streak,
  icon,
  color,
  onPress,
}) => {
  const { themed, theme: { colors } } = useAppTheme()

  const progress = Math.min((current / goal) * 100, 100)
  const isComplete = current >= goal

  const getTitle = () => {
    switch (type) {
      case "prayer":
        return "Prayers"
      case "quran":
        return "Quran"
      case "dhikr":
        return "Dhikr"
    }
  }

  const getUnit = () => {
    switch (type) {
      case "prayer":
        return "prayers"
      case "quran":
        return "pages"
      case "dhikr":
        return "counts"
    }
  }

  return (
    <TouchableOpacity
      style={themed($container(colors))}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header with Icon */}
      <View style={themed($header)}>
        <View style={themed($iconContainer(color))}>
          <FontAwesome6 name={icon} size={20} color={color} solid />
        </View>
        <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
      </View>

      {/* Title */}
      <Text style={themed($title(colors))}>{getTitle()}</Text>

      {/* Progress Bar */}
      <View style={themed($progressBarContainer(colors))}>
        <View style={themed($progressBarFill(color, progress))} />
      </View>

      {/* Stats Row */}
      <View style={themed($statsRow)}>
        <View style={themed($stat)}>
          <Text style={themed($statValue(colors))}>
            {current}/{goal}
          </Text>
          <Text style={themed($statLabel(colors))}>{getUnit()}</Text>
        </View>

        <View style={themed($divider(colors))} />

        <View style={themed($stat)}>
          <View style={themed($streakRow)}>
            <Text style={themed($statValue(colors))}>{streak}</Text>
            <FontAwesome6 name="fire" size={14} color="#FF6B35" solid />
          </View>
          <Text style={themed($statLabel(colors))}>day streak</Text>
        </View>
      </View>

      {/* Completion Badge */}
      {isComplete && (
        <View style={themed($completionBadge(color))}>
          <FontAwesome6 name="circle-check" size={14} color={color} solid />
          <Text style={themed($completionText(color))}>Goal Complete</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
  minHeight: 160,
})

const $header: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
}

const $iconContainer: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 12,
})

const $progressBarContainer: ThemedStyle<ViewStyle> = (colors) => ({
  height: 6,
  backgroundColor: colors.border,
  borderRadius: 3,
  overflow: "hidden",
  marginBottom: 16,
})

const $progressBarFill: ThemedStyle<ViewStyle> = (color: string, progress: number) => ({
  height: "100%",
  width: `${progress}%`,
  backgroundColor: color,
  borderRadius: 3,
})

const $statsRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
}

const $stat: ThemedStyle<ViewStyle> = {
  flex: 1,
  alignItems: "center",
}

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $streakRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
}

const $divider: ThemedStyle<ViewStyle> = (colors) => ({
  width: 1,
  height: 32,
  backgroundColor: colors.border,
})

const $completionBadge: ThemedStyle<ViewStyle> = (color: string) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  backgroundColor: color + "15",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 8,
  alignSelf: "flex-start",
})

const $completionText: ThemedStyle<TextStyle> = (color: string) => ({
  fontSize: 12,
  fontWeight: "600",
  color: color,
})
