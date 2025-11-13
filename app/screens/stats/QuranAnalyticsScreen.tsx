/**
 * Quran Analytics Screen
 * Shows reading patterns, timing, and duration trends
 */

import React, { useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity } from "react-native"
import { Screen, Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { ReflectStackScreenProps } from "@/navigators"
import { useQuranTracking } from "@/hooks/useQuranTracking"

type TimeRange = "day" | "week" | "month" | "year"

export const QuranAnalyticsScreen: React.FC<
  ReflectStackScreenProps<"QuranAnalytics">
> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { quranStats } = useQuranTracking()
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week")

  // Mock timing pattern data (Hour of day vs frequency)
  const timingPattern = [
    { hour: "5AM", count: 15 },
    { hour: "9AM", count: 8 },
    { hour: "1PM", count: 5 },
    { hour: "5PM", count: 12 },
    { hour: "9PM", count: 18 },
  ]

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
        <Text style={themed($headerTitle(colors))}>Quran Analytics</Text>
        <View style={themed($placeholder)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Stats */}
        <View style={themed($heroSection)}>
          <View style={themed($heroCard(colors))}>
            <View style={themed($iconCircle(colors.read))}>
              <FontAwesome6 name="book-quran" size={32} color={colors.read} solid />
            </View>
            <Text style={themed($heroValue(colors))}>{quranStats.totalPagesRead}</Text>
            <Text style={themed($heroLabel(colors))}>Total Pages Read</Text>
          </View>

          <View style={themed($statsGrid)}>
            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall("#FF6B35"))}>
                <FontAwesome6 name="fire" size={16} color="#FF6B35" solid />
              </View>
              <Text style={themed($statCardValue(colors))}>{quranStats.streakDays}</Text>
              <Text style={themed($statCardLabel(colors))}>Day Streak</Text>
            </View>

            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall(colors.read))}>
                <FontAwesome6 name="clock" size={16} color={colors.read} solid />
              </View>
              <Text style={themed($statCardValue(colors))}>{quranStats.totalTimeMinutes}</Text>
              <Text style={themed($statCardLabel(colors))}>Total Minutes</Text>
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
                <Text style={themed($rangeTabText(colors, selectedRange === range.value))}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Reading Time Pattern */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Reading Time Pattern</Text>
            <Text style={themed($cardSubtitle(colors))}>When you read Quran most frequently</Text>

            <View style={themed($timingChart)}>
              {timingPattern.map((item, index) => {
                const maxCount = Math.max(...timingPattern.map((t) => t.count))
                const heightPercentage = (item.count / maxCount) * 100
                return (
                  <View key={index} style={themed($timingColumn)}>
                    <View style={themed($timingBar(colors.read, heightPercentage))} />
                    <Text style={themed($timingLabel(colors))}>{item.hour}</Text>
                  </View>
                )
              })}
            </View>

            <View style={themed($insightBox(colors))}>
              <FontAwesome6 name="lightbulb" size={16} color={colors.home} solid />
              <Text style={themed($insightText(colors))}>
                You read most consistently after Fajr (5 AM) and Isha (9 PM). These are your peak
                focus times.
              </Text>
            </View>
          </View>
        </View>

        {/* Average Duration */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Session Duration</Text>
            <Text style={themed($cardSubtitle(colors))}>Average reading time per session</Text>

            <View style={themed($durationCard(colors))}>
              <Text style={themed($durationValue(colors))}>
                {Math.round(quranStats.totalTimeMinutes / Math.max(quranStats.totalPagesRead, 1))}
              </Text>
              <Text style={themed($durationUnit(colors))}>minutes per page</Text>
            </View>
          </View>
        </View>

        <View style={themed($bottomSpacer)} />
      </ScrollView>
    </Screen>
  )
}

// Reuse most styles from PrayerAnalyticsScreen
const $screen: ThemedStyle<ViewStyle> = { flex: 1 }
const $header: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 20,
  paddingVertical: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})
const $backButton: ThemedStyle<ViewStyle> = { padding: 8 }
const $headerTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})
const $placeholder: ThemedStyle<ViewStyle> = { width: 36 }
const $heroSection: ThemedStyle<ViewStyle> = { padding: 20, gap: 16 }
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
const $statsGrid: ThemedStyle<ViewStyle> = { flexDirection: "row", gap: 12 }
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
const $section: ThemedStyle<ViewStyle> = { paddingHorizontal: 20, marginBottom: 16 }
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
const $timingChart: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
  height: 120,
  marginBottom: 20,
}
const $timingColumn: ThemedStyle<ViewStyle> = { flex: 1, alignItems: "center", gap: 8 }
const $timingBar: ThemedStyle<ViewStyle> = (color: string, percentage: number) => ({
  width: "70%",
  height: `${percentage}%`,
  backgroundColor: color,
  borderRadius: 4,
})
const $timingLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
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
const $durationCard: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.read + "15",
  borderRadius: 16,
  padding: 24,
  alignItems: "center",
  marginTop: 8,
})
const $durationValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 48,
  fontWeight: "800",
  color: colors.text,
})
const $durationUnit: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  color: colors.textDim,
  marginTop: 8,
})
const $bottomSpacer: ThemedStyle<ViewStyle> = { height: 40 }
