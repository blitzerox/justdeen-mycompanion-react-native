/**
 * Home Stats Widget
 * Apple-style activity rings showing daily progress
 * Shows prayer, Quran, and dhikr progress with concentric rings
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
import Svg, { Circle } from "react-native-svg"

interface HomeStatsWidgetProps {
  onPrayerPress?: () => void
  onQuranPress?: () => void
  onTasbihPress?: () => void
}

export const HomeStatsWidget: React.FC<HomeStatsWidgetProps> = ({
  onPrayerPress,
  onQuranPress,
  onTasbihPress,
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

  // Goals (can be made dynamic later)
  const prayerGoal = 5
  const quranGoal = 2 // pages
  const dhikrGoal = 100 // count

  // Current values (using available data)
  const prayerCurrent = todayPrayerCount
  const quranCurrent = 0 // TODO: Add today's pages tracking
  const dhikrCurrent = 0 // TODO: Add today's dhikr tracking

  // Calculate progress percentages
  const prayerProgress = Math.min((prayerCurrent / prayerGoal) * 100, 100)
  const quranProgress = Math.min((quranCurrent / quranGoal) * 100, 100)
  const dhikrProgress = Math.min((dhikrCurrent / dhikrGoal) * 100, 100)

  // Ring dimensions for 3 concentric rings
  const size = 120
  const strokeWidth = 8
  const gap = 4

  // Outer ring (Prayers - largest)
  const outerRadius = (size - strokeWidth) / 2
  const outerCircumference = outerRadius * 2 * Math.PI
  const outerDashoffset = outerCircumference - (prayerProgress / 100) * outerCircumference

  // Middle ring (Quran)
  const middleRadius = outerRadius - strokeWidth - gap
  const middleCircumference = middleRadius * 2 * Math.PI
  const middleDashoffset = middleCircumference - (quranProgress / 100) * middleCircumference

  // Inner ring (Dhikr - smallest)
  const innerRadius = middleRadius - strokeWidth - gap
  const innerCircumference = innerRadius * 2 * Math.PI
  const innerDashoffset = innerCircumference - (dhikrProgress / 100) * innerCircumference

  return (
    <View style={themed($container(colors))}>
      <View style={themed($content)}>
        {/* Left side - Activity Rings */}
        <View style={themed($ringsContainer)}>
          <Svg width={size} height={size}>
            {/* Outer Ring - Prayers (Red/Pink) */}
            <Circle
              stroke={colors.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
            <Circle
              stroke={colors.pray}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={outerRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={outerCircumference}
              strokeDashoffset={outerDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />

            {/* Middle Ring - Quran (Green) */}
            <Circle
              stroke={colors.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={middleRadius}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
            <Circle
              stroke={colors.read}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={middleRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={middleCircumference}
              strokeDashoffset={middleDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />

            {/* Inner Ring - Dhikr (Purple) */}
            <Circle
              stroke={colors.border}
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
            <Circle
              stroke="#9C27B0"
              fill="none"
              cx={size / 2}
              cy={size / 2}
              r={innerRadius}
              strokeWidth={strokeWidth}
              strokeDasharray={innerCircumference}
              strokeDashoffset={innerDashoffset}
              strokeLinecap="round"
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </Svg>
        </View>

        {/* Right side - Progress Text */}
        <View style={themed($statsText)}>
          <TouchableOpacity onPress={onPrayerPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($colorDot(colors.pray))} />
              <Text style={themed($statLabel(colors))}>
                Prayers {prayerCurrent}/{prayerGoal}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onQuranPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($colorDot(colors.read))} />
              <Text style={themed($statLabel(colors))}>
                Quran {quranCurrent}/{quranGoal}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTasbihPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($colorDot("#9C27B0"))} />
              <Text style={themed($statLabel(colors))}>
                Dhikr {dhikrCurrent}/{dhikrGoal}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $content: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 20,
}

const $ringsContainer: ThemedStyle<ViewStyle> = {
  alignItems: "center",
  justifyContent: "center",
}

const $statsText: ThemedStyle<ViewStyle> = {
  flex: 1,
  gap: 8,
}

const $statRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $colorDot: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: color,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "500",
  color: colors.text,
})
