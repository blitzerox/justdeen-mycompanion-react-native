/**
 * Home Stats Widget
 * Apple-style activity rings showing daily progress
 * Shows prayer, Quran, and dhikr progress with concentric rings
 */

import React, { useState } from "react"
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
import { getReadingStats } from "@/services/quran/user-progress"
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
  const [quranPagesRead, setQuranPagesRead] = useState(0)

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshStats()
      // Load Quran reading stats from database
      getReadingStats().then(readingStats => {
        setQuranPagesRead(readingStats.totalPagesRead)
      }).catch(err => {
        console.error('Failed to load reading stats:', err)
      })
    }, [refreshStats])
  )

  // Helper to get today's date string
  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Calculate today's Quran pages read
  const getTodayQuranPages = () => {
    try {
      const history = require("@/utils/storage").load(require("@/constants/storageKeys").STORAGE_KEYS.QURAN_HISTORY) || []
      const todayDate = getTodayDateString()

      const todaySessions = history.filter((session: any) => {
        const sessionDate = session.timestamp?.split("T")[0]
        return sessionDate === todayDate
      })

      return todaySessions.length
    } catch {
      return 0
    }
  }

  // Calculate today's dhikr count
  const getTodayDhikrCount = () => {
    try {
      const history = require("@/utils/storage").load(require("@/constants/storageKeys").STORAGE_KEYS.TASBIH_HISTORY) || []
      const todayDate = getTodayDateString()

      const todaySessions = history.filter((session: any) => {
        const sessionDate = session.timestamp?.split("T")[0]
        return sessionDate === todayDate
      })

      return todaySessions.reduce((sum: number, session: any) => sum + (session.count || 0), 0)
    } catch {
      return 0
    }
  }

  // Goals (can be made dynamic later)
  const prayerGoal = 5
  const quranGoal = 2 // pages
  const dhikrGoal = 100 // count

  // Current values (using available data from hooks and storage)
  const prayerCurrent = todayPrayerCount
  const quranCurrent = quranPagesRead // Use pages read from database
  const dhikrCurrent = getTodayDhikrCount()

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

        {/* Right side - Progress Text with Icons */}
        <View style={themed($statsText)}>
          <TouchableOpacity onPress={onPrayerPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($iconCircle(colors.pray))}>
                <FontAwesome6 name="person-praying" size={16} color={colors.pray} solid />
              </View>
              <Text style={themed($statLabel(colors))}>Prayers</Text>
              <View style={themed($spacer)} />
              <Text style={themed($statValue(colors))}>
                {prayerCurrent}/{prayerGoal}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onQuranPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($iconCircle(colors.read))}>
                <FontAwesome6 name="book-quran" size={16} color={colors.read} solid />
              </View>
              <Text style={themed($statLabel(colors))}>Quran</Text>
              <View style={themed($spacer)} />
              <Text style={themed($statValue(colors))}>
                {quranCurrent}/{quranGoal}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={onTasbihPress} activeOpacity={0.7}>
            <View style={themed($statRow)}>
              <View style={themed($iconCircle("#9C27B0"))}>
                <FontAwesome6 name="hand" size={16} color="#9C27B0" solid />
              </View>
              <Text style={themed($statLabel(colors))}>Dhikr</Text>
              <View style={themed($spacer)} />
              <Text style={themed($statValue(colors))}>
                {dhikrCurrent}/{dhikrGoal}
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
  gap: 80,
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
  gap: 12,
}

const $iconCircle: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "500",
  color: colors.text,
})

const $spacer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
})
