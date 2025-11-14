/**
 * Prayer Analytics Screen
 * Detailed view of prayer statistics with trends and insights
 * Similar to Apple Health's activity details
 */

import React, { useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, Dimensions, TouchableOpacity } from "react"
import { Screen, Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { ReflectStackScreenProps } from "@/navigators"
import { usePrayerTracking } from "@/hooks/usePrayerTracking"
import { useUserStats } from "@/hooks/useUserStats"

type TimeRange = "day" | "week" | "month" | "year"

export const PrayerAnalyticsScreen: React.FC<
  ReflectStackScreenProps<"PrayerAnalytics">
> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { todayPrayers, prayerStats } = usePrayerTracking()
  const { stats } = useUserStats()
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week")

  // Calculate today's prayer count
  const todayPrayerCount = Object.values(todayPrayers).filter(Boolean).length
  const prayerStreak = prayerStats.streakDays

  // Mock data for spider/radar chart - Prayer distribution
  // In real implementation, calculate from prayer history
  const prayerDistribution = {
    fajr: 85,
    dhuhr: 92,
    asr: 78,
    maghrib: 95,
    isha: 88,
  }

  const ranges: { value: TimeRange; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ]

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screen)}>
      {/* Header */}
      <View style={themed($header(colors))}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={themed($backButton)}>
          <FontAwesome6 name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={themed($headerTitle(colors))}>Prayer Analytics</Text>
        <View style={themed($placeholder)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Stats */}
        <View style={themed($heroSection)}>
          <View style={themed($heroCard(colors))}>
            <View style={themed($iconCircle(colors.pray))}>
              <FontAwesome6 name="person-praying" size={32} color={colors.pray} solid />
            </View>
            <Text style={themed($heroValue(colors))}>{todayPrayerCount}/5</Text>
            <Text style={themed($heroLabel(colors))}>Prayers Today</Text>
          </View>

          <View style={themed($statsGrid)}>
            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall("#FF6B35"))}>
                <FontAwesome6 name="fire" size={16} color="#FF6B35" solid />
              </View>
              <Text style={themed($statCardValue(colors))}>{prayerStreak}</Text>
              <Text style={themed($statCardLabel(colors))}>Day Streak</Text>
            </View>

            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall(colors.pray))}>
                <FontAwesome6 name="chart-line" size={16} color={colors.pray} solid />
              </View>
              <Text style={themed($statCardValue(colors))}>{stats.totalPrayersCompleted}</Text>
              <Text style={themed($statCardLabel(colors))}>Total Prayers</Text>
            </View>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={themed($section)}>
          <View style={themed($rangeTabs(colors))}>
            {ranges.map((range) => (
              <TouchableOpacity
                key={range.value}
                style={themed($rangeTab(colors, selectedRange === range.value))}
                onPress={() => setSelectedRange(range.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={themed($rangeTabText(colors, selectedRange === range.value))}
                >
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Prayer Distribution - Spider/Radar Chart */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Prayer Strength Analysis</Text>
            <Text style={themed($cardSubtitle(colors))}>
              Which prayers you complete most consistently
            </Text>

            {/* Spider Chart Placeholder - Using simple bars for now */}
            <View style={themed($distributionChart)}>
              {Object.entries(prayerDistribution).map(([prayer, percentage]) => (
                <View key={prayer} style={themed($distributionRow)}>
                  <Text style={themed($distributionLabel(colors))}>
                    {prayer.charAt(0).toUpperCase() + prayer.slice(1)}
                  </Text>
                  <View style={themed($distributionBarContainer(colors))}>
                    <View style={themed($distributionBarFill(colors.pray, percentage))} />
                  </View>
                  <Text style={themed($distributionValue(colors))}>{percentage}%</Text>
                </View>
              ))}
            </View>

            {/* Insights */}
            <View style={themed($insightBox(colors))}>
              <FontAwesome6 name="lightbulb" size={16} color={colors.home} solid />
              <Text style={themed($insightText(colors))}>
                You're most consistent with Maghrib prayers. Try setting a reminder for Fajr
                to improve your morning routine.
              </Text>
            </View>
          </View>
        </View>

        {/* Weekly Trend */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>This Week's Progress</Text>
            <Text style={themed($cardSubtitle(colors))}>Daily prayer completion rate</Text>

            {/* Simple bar chart - 7 days */}
            <View style={themed($weekChart)}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <View key={index} style={themed($weekDayColumn)}>
                  <View style={themed($weekBar(colors.pray, Math.random() * 100))} />
                  <Text style={themed($weekDayLabel(colors))}>{day}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Milestones */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Milestones</Text>

            <View style={themed($milestone(colors, true))}>
              <View style={themed($milestoneIcon(colors.pray, true))}>
                <FontAwesome6 name="check" size={14} color="#FFF" solid />
              </View>
              <View style={themed($milestoneContent)}>
                <Text style={themed($milestoneTitle(colors))}>7 Day Streak</Text>
                <Text style={themed($milestoneSubtitle(colors))}>Completed</Text>
              </View>
            </View>

            <View style={themed($milestone(colors, false))}>
              <View style={themed($milestoneIcon(colors.border, false))}>
                <Text style={themed($milestoneNumber(colors))}>?</Text>
              </View>
              <View style={themed($milestoneContent)}>
                <Text style={themed($milestoneTitle(colors))}>30 Day Streak</Text>
                <Text style={themed($milestoneSubtitle(colors))}>
                  {30 - prayerStreak} days to go
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={themed($bottomSpacer)} />
      </ScrollView>
    </Screen>
  )
}

// Styles
const $screen: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $header: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $backButton: ThemedStyle<ViewStyle> = {
  padding: 8,
}

const $headerTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})

const $placeholder: ThemedStyle<ViewStyle> = {
  width: 36,
}

const $heroSection: ThemedStyle<ViewStyle> = {
  padding: 20,
  gap: 16,
}

const $heroCard: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 20,
  padding: 24,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $iconCircle: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
})

const $heroValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 36,
  fontWeight: "800",
  color: colors.text,
  marginBottom: 4,
})

const $heroLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $statsGrid: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 12,
}

const $statCard: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $statIconSmall: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
})

const $statCardValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $statCardLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
})

const $section: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 20,
  marginBottom: 16,
}

const $rangeTabs: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 4,
  gap: 4,
})

const $rangeTab: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 16,
  borderRadius: 8,
  backgroundColor: isSelected ? colors.home : "transparent",
  alignItems: "center",
})

const $rangeTabText: ThemedStyle<TextStyle> = (colors, isSelected: boolean) => ({
  fontSize: 14,
  fontWeight: isSelected ? "600" : "500",
  color: isSelected ? "#FFF" : colors.text,
})

const $card: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $cardTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $cardSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: 20,
})

const $distributionChart: ThemedStyle<ViewStyle> = {
  gap: 16,
  marginBottom: 20,
}

const $distributionRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $distributionLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "500",
  color: colors.text,
  width: 70,
})

const $distributionBarContainer: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  height: 8,
  backgroundColor: colors.border,
  borderRadius: 4,
  overflow: "hidden",
})

const $distributionBarFill: ThemedStyle<ViewStyle> = (color: string, percentage: number) => ({
  height: "100%",
  width: `${percentage}%`,
  backgroundColor: color,
  borderRadius: 4,
})

const $distributionValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
  width: 40,
  textAlign: "right",
})

const $insightBox: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  gap: 12,
  backgroundColor: colors.home + "15",
  padding: 16,
  borderRadius: 12,
  alignItems: "flex-start",
})

const $insightText: ThemedStyle<TextStyle> = (colors) => ({
  flex: 1,
  fontSize: 14,
  color: colors.text,
  lineHeight: 20,
})

const $weekChart: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
  height: 120,
  marginTop: 20,
}

const $weekDayColumn: ThemedStyle<ViewStyle> = {
  flex: 1,
  alignItems: "center",
  gap: 8,
}

const $weekBar: ThemedStyle<ViewStyle> = (color: string, percentage: number) => ({
  width: "70%",
  height: `${percentage}%`,
  backgroundColor: color,
  borderRadius: 4,
})

const $weekDayLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $milestone: ThemedStyle<ViewStyle> = (colors, _isComplete: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingVertical: 12,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})

const $milestoneIcon: ThemedStyle<ViewStyle> = (color: string, isComplete: boolean) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: isComplete ? color : color + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $milestoneNumber: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.textDim,
})

const $milestoneContent: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $milestoneTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $milestoneSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $bottomSpacer: ThemedStyle<ViewStyle> = {
  height: 40,
}
