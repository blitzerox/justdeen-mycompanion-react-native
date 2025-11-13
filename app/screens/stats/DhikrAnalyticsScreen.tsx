/**
 * Dhikr Analytics Screen
 * Shows average trends and most recited dhikr
 */

import React, { useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity } from "react-native"
import { Screen, Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import type { ReflectStackScreenProps } from "@/navigators"
import { useTasbihCounter } from "@/hooks/useTasbihCounter"

type TimeRange = "day" | "week" | "month" | "year"

export const DhikrAnalyticsScreen: React.FC<
  ReflectStackScreenProps<"DhikrAnalytics">
> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { tasbihStats, getRecentSessions } = useTasbihCounter()
  const [selectedRange, setSelectedRange] = useState<TimeRange>("week")

  const recentSessions = getRecentSessions(20)

  // Calculate most recited dhikr
  const dhikrCounts = recentSessions.reduce((acc, session) => {
    acc[session.tasbihName] = (acc[session.tasbihName] || 0) + session.count
    return acc
  }, {} as Record<string, number>)

  const topDhikr = Object.entries(dhikrCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const ranges: { value: TimeRange; label: string }[] = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
    { value: "year", label: "Year" },
  ]

  const dhikrColor = "#9C27B0"

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screen)}>
      {/* Header */}
      <View style={themed($header(colors))}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={themed($backButton)}>
          <FontAwesome6 name="chevron-left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={themed($headerTitle(colors))}>Dhikr Analytics</Text>
        <View style={themed($placeholder)} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Stats */}
        <View style={themed($heroSection)}>
          <View style={themed($heroCard(colors))}>
            <View style={themed($iconCircle(dhikrColor))}>
              <FontAwesome6 name="hand" size={32} color={dhikrColor} solid />
            </View>
            <Text style={themed($heroValue(colors))}>{tasbihStats.totalCount}</Text>
            <Text style={themed($heroLabel(colors))}>Total Dhikr Count</Text>
          </View>

          <View style={themed($statsGrid)}>
            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall(dhikrColor))}>
                <FontAwesome6 name="list-check" size={16} color={dhikrColor} solid />
              </View>
              <Text style={themed($statCardValue(colors))}>{tasbihStats.sessionsCompleted}</Text>
              <Text style={themed($statCardLabel(colors))}>Sessions</Text>
            </View>

            <View style={themed($statCard(colors))}>
              <View style={themed($statIconSmall(dhikrColor))}>
                <FontAwesome6 name="chart-simple" size={16} color={dhikrColor} solid />
              </View>
              <Text style={themed($statCardValue(colors))}>
                {Math.round(tasbihStats.totalCount / Math.max(tasbihStats.sessionsCompleted, 1))}
              </Text>
              <Text style={themed($statCardLabel(colors))}>Avg per Session</Text>
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

        {/* Most Recited Dhikr */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Most Recited Dhikr</Text>
            <Text style={themed($cardSubtitle(colors))}>Your top 5 most practiced remembrances</Text>

            <View style={themed($dhikrList)}>
              {topDhikr.length > 0 ? (
                topDhikr.map(([name, count], index) => {
                  const maxCount = topDhikr[0][1]
                  const percentage = (count / maxCount) * 100
                  return (
                    <View key={name} style={themed($dhikrRow(colors))}>
                      <View style={themed($rankBadge(dhikrColor))}>
                        <Text style={themed($rankText)}>{index + 1}</Text>
                      </View>
                      <View style={themed($dhikrInfo)}>
                        <Text style={themed($dhikrName(colors))}>{name}</Text>
                        <View style={themed($dhikrBarContainer(colors))}>
                          <View style={themed($dhikrBarFill(dhikrColor, percentage))} />
                        </View>
                      </View>
                      <Text style={themed($dhikrCount(colors))}>{count}</Text>
                    </View>
                  )
                })
              ) : (
                <Text style={themed($emptyText(colors))}>
                  No dhikr sessions yet. Start practicing to see your stats!
                </Text>
              )}
            </View>

            <View style={themed($insightBox(colors))}>
              <FontAwesome6 name="lightbulb" size={16} color={colors.home} solid />
              <Text style={themed($insightText(colors))}>
                {topDhikr.length > 0
                  ? `You've recited "${topDhikr[0][0]}" the most. Consistency in remembrance brings peace to the heart.`
                  : "Start your dhikr practice to unlock personalized insights."}
              </Text>
            </View>
          </View>
        </View>

        {/* Daily Average Trend */}
        <View style={themed($section)}>
          <View style={themed($card(colors))}>
            <Text style={themed($cardTitle(colors))}>Daily Average</Text>
            <Text style={themed($cardSubtitle(colors))}>Your dhikr practice over time</Text>

            {/* Simple line chart visualization */}
            <View style={themed($trendChart)}>
              {[65, 72, 80, 75, 85, 90, 95].map((value, index) => (
                <View key={index} style={themed($trendColumn)}>
                  <View style={themed($trendBar(dhikrColor, value))} />
                </View>
              ))}
            </View>

            <View style={themed($trendLabels)}>
              {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                <Text key={index} style={themed($trendLabel(colors))}>
                  {day}
                </Text>
              ))}
            </View>
          </View>
        </View>

        <View style={themed($bottomSpacer)} />
      </ScrollView>
    </Screen>
  )
}

// Styles
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
const $dhikrList: ThemedStyle<ViewStyle> = { gap: 16, marginBottom: 20 }
const $dhikrRow: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  paddingBottom: 16,
  borderBottomWidth: 1,
  borderBottomColor: colors.border,
})
const $rankBadge: ThemedStyle<ViewStyle> = (color: string) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: color + "20",
  alignItems: "center",
  justifyContent: "center",
})
const $rankText: ThemedStyle<TextStyle> = {
  fontSize: 14,
  fontWeight: "700",
  color: "#9C27B0",
}
const $dhikrInfo: ThemedStyle<ViewStyle> = { flex: 1, gap: 8 }
const $dhikrName: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
})
const $dhikrBarContainer: ThemedStyle<ViewStyle> = (colors) => ({
  height: 6,
  backgroundColor: colors.border,
  borderRadius: 3,
  overflow: "hidden",
})
const $dhikrBarFill: ThemedStyle<ViewStyle> = (color: string, percentage: number) => ({
  height: "100%",
  width: `${percentage}%`,
  backgroundColor: color,
  borderRadius: 3,
})
const $dhikrCount: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
  minWidth: 50,
  textAlign: "right",
})
const $emptyText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  paddingVertical: 20,
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
const $trendChart: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  height: 100,
  alignItems: "flex-end",
  gap: 8,
  marginBottom: 8,
}
const $trendColumn: ThemedStyle<ViewStyle> = { flex: 1 }
const $trendBar: ThemedStyle<ViewStyle> = (color: string, percentage: number) => ({
  width: "100%",
  height: `${percentage}%`,
  backgroundColor: color,
  borderRadius: 4,
})
const $trendLabels: ThemedStyle<ViewStyle> = { flexDirection: "row", gap: 8 }
const $trendLabel: ThemedStyle<TextStyle> = (colors) => ({
  flex: 1,
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
})
const $bottomSpacer: ThemedStyle<ViewStyle> = { height: 40 }
