/**
 * Reflect Home Screen
 *
 * Week 17: Personal progress tracking and gamification
 * - User stats dashboard with daily progress cards
 * - Activity tracker with bar chart visualization
 * - Spiritual metrics (Khushu, Sins avoided, Good deeds)
 * - Overall spiritual score
 * - Quick access to Islamic practices
 */
import React, { useState, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Animated,
  Modal,
  TextInput,
} from "react-native"
import { Screen, Icon } from "@/components"
import { HomeStatsWidget, LevelCard, ActivityOverviewCard } from "@/components/stats"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import { FontAwesome6 } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { DrawerNavigationProp } from "@react-navigation/drawer"
import type { ReflectStackScreenProps } from "@/navigators"
import type { DrawerParamList } from "@/navigators/navigationTypes"
import type { ThemedStyle } from "@/theme/types"
import { usePrayerTracking } from "@/hooks/usePrayerTracking"
import { useQuranTracking } from "@/hooks/useQuranTracking"
import { useTasbihCounter } from "@/hooks/useTasbihCounter"
import * as storage from "@/utils/storage"
import { STORAGE_KEYS } from "@/constants/storageKeys"

const { width } = Dimensions.get("window")

interface DailyStatCard {
  icon: string
  iconBg: string
  value: string
  label: string
  sublabel: string
  change?: string
  isPositive?: boolean
}

interface SpiritualMetric {
  icon: string
  iconBg: string
  value: string
  label: string
  sublabel: string
  color: string
}

export const ReflectHomeScreen: React.FC<ReflectStackScreenProps<"ReflectHome">> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { user, isAuthenticated } = useAuth()
  const drawerNavigation = useNavigation<DrawerNavigationProp<DrawerParamList>>()

  // Hooks for activity data
  const { todayPrayers, prayerStats } = usePrayerTracking()
  const { quranStats } = useQuranTracking()
  const { tasbihStats } = useTasbihCounter()

  // Calculate today's prayer count
  const todayPrayerCount = Object.values(todayPrayers).filter(Boolean).length

  // Helper to get today's date
  const getTodayDateString = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  // Calculate today's values
  const getTodayQuranPages = () => {
    try {
      const history = storage.load(STORAGE_KEYS.QURAN_HISTORY) || []
      const todayDate = getTodayDateString()
      return history.filter((session: any) => session.timestamp?.split("T")[0] === todayDate).length
    } catch {
      return 0
    }
  }

  const getTodayDhikrCount = () => {
    try {
      const history = storage.load(STORAGE_KEYS.TASBIH_HISTORY) || []
      const todayDate = getTodayDateString()
      const todaySessions = history.filter((session: any) => session.timestamp?.split("T")[0] === todayDate)
      return todaySessions.reduce((sum: number, session: any) => sum + (session.count || 0), 0)
    } catch {
      return 0
    }
  }

  // Mock data - replace with actual user stats from backend
  const [activityType, setActivityType] = useState<"Prayers" | "Quran" | "Dhikr">("Prayers")
  const [timeframe, setTimeframe] = useState<"Day" | "Week" | "Month">("Week")
  const [hasNotifications, setHasNotifications] = useState(true) // Track if there are notifications
  const [showGoalsModal, setShowGoalsModal] = useState(false)

  // Goals state
  const [prayerGoal, setPrayerGoal] = useState("5")
  const [quranGoal, setQuranGoal] = useState("3")
  const [dhikrGoal, setDhikrGoal] = useState("200")

  // Daily stats cards at the top
  const dailyStats: DailyStatCard[] = [
    {
      icon: "person-praying",
      iconBg: colors.pray,
      value: "4/5",
      label: "Prayers",
      sublabel: "Today",
      change: "+12.3%",
      isPositive: true,
    },
    {
      icon: "book-quran",
      iconBg: colors.read,
      value: "2",
      label: "Quran",
      sublabel: "Pages read",
      change: "+5.2%",
      isPositive: true,
    },
    {
      icon: "heart",
      iconBg: "#9C27B0",
      value: "156",
      label: "Dhikr",
      sublabel: "Count today",
      change: "+8.1%",
      isPositive: true,
    },
    {
      icon: "fire",
      iconBg: colors.more,
      value: "7",
      label: "Streak",
      sublabel: "Days",
      change: "Personal best",
      isPositive: true,
    },
  ]

  // Weekly activity data for bar chart
  const weeklyActivity = [
    { day: "Sun", value: 65, kcal: 18000 },
    { day: "Mon", value: 85, kcal: 22000 },
    { day: "Tue", value: 45, kcal: 14000 },
    { day: "Wed", value: 90, kcal: 24000 },
    { day: "Thu", value: 70, kcal: 19000 },
    { day: "Fri", value: 100, kcal: 25000 },
    { day: "Sat", value: 80, kcal: 21000 },
  ]

  // Spiritual metrics
  const spiritualMetrics: SpiritualMetric[] = [
    {
      icon: "heart",
      iconBg: "#FFE5E5",
      value: "72",
      label: "Khushu",
      sublabel: "Focus level",
      color: "#FF6B6B",
    },
    {
      icon: "fire",
      iconBg: "#FFF4E5",
      value: "-18",
      label: "Sins avoided",
      sublabel: "This week",
      color: colors.more,
    },
    {
      icon: "star",
      iconBg: "#FFF9E5",
      value: "170k",
      label: "Good deeds",
      sublabel: "Total count",
      color: "#FFD700",
    },
  ]

  const overallScore = 1425
  const scoreChange = 52

  const maxBarHeight = 100
  const maxValue = Math.max(...weeklyActivity.map(d => d.value))

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container(colors))}>
      {/* Fixed Greeting Header */}
      <View style={themed($header)}>
        <View style={themed($headerLeft)}>
          <TouchableOpacity
            style={themed($hamburger(colors))}
            onPress={() => drawerNavigation.openDrawer()}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bars" size={24} color={colors.home} />
          </TouchableOpacity>
          <View>
            <Text style={themed($greeting(colors))}>
              {isAuthenticated && user?.displayName
                ? `Hello, ${user.displayName.split(' ')[0]}`
                : "Hello, Believer"}
            </Text>
            <Text style={themed($headerSubtitle(colors))}>
              Your spiritual journey
            </Text>
          </View>
        </View>
        <View style={themed($headerRight)}>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bell" size={20} color={colors.home} />
            {hasNotifications && (
              <View style={themed($notificationBadge)} />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={themed($iconButton(colors))}
            onPress={() => setShowGoalsModal(true)}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="bullseye" size={20} color={colors.home} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={themed($scrollView)}
        showsVerticalScrollIndicator={false}
      >
        {/* Level Card */}
        <LevelCard />

        {/* Today Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Today</Text>
          <HomeStatsWidget
            onPrayerPress={() => navigation.navigate("PrayTab")}
            onQuranPress={() => navigation.navigate("ReadTab")}
            onTasbihPress={() => navigation.navigate("PrayTab", { screen: "TasbihCounter" })}
          />
        </View>

        {/* Activity Overview Cards */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Overview</Text>
          <View style={themed($cardsRow)}>
            <ActivityOverviewCard
              type="prayer"
              current={todayPrayerCount}
              goal={5}
              streak={prayerStats.streakDays}
              icon="person-praying"
              color={colors.pray}
              onPress={() => navigation.navigate("PrayerAnalytics")}
            />
            <ActivityOverviewCard
              type="quran"
              current={getTodayQuranPages()}
              goal={2}
              streak={quranStats.streakDays}
              icon="book-quran"
              color={colors.read}
              onPress={() => navigation.navigate("QuranAnalytics")}
            />
          </View>
          <View style={themed($cardsRow)}>
            <ActivityOverviewCard
              type="dhikr"
              current={getTodayDhikrCount()}
              goal={100}
              streak={0}
              icon="hand"
              color="#9C27B0"
              onPress={() => navigation.navigate("DhikrAnalytics")}
            />
            <View style={{ flex: 1 }} />
          </View>
        </View>

        {/* Activity Tracker Section */}
        <View style={themed($section)}>
          {/* Section Header with Dropdown */}
          <View style={themed($sectionHeader)}>
            <Text style={themed($sectionTitle(colors))}>Activity Tracker</Text>
            {/* Timeframe Dropdown */}
            <TouchableOpacity
              style={themed($dropdown(colors))}
              onPress={() => {
                // Cycle through timeframes
                const timeframes: Array<"Day" | "Week" | "Month"> = ["Day", "Week", "Month"]
                const currentIndex = timeframes.indexOf(timeframe)
                const nextIndex = (currentIndex + 1) % timeframes.length
                setTimeframe(timeframes[nextIndex])
              }}
              activeOpacity={0.7}
            >
              <Text style={themed($dropdownText(colors))}>{timeframe}</Text>
              <FontAwesome6 name="chevron-down" size={12} color={colors.textDim} />
            </TouchableOpacity>
          </View>

          {/* Activity Card */}
          <View style={themed($activityCard(colors))}>

          {/* Activity Type Segmented Control */}
          <View style={themed($segmentedControl(colors))}>
            {["Prayers", "Quran", "Dhikr"].map((type, index) => {
              const typeColor = type === "Prayers" ? colors.pray : type === "Quran" ? colors.read : "#9C27B0"
              return (
                <TouchableOpacity
                  key={type}
                  style={themed($segment(activityType === type, typeColor))}
                  onPress={() => setActivityType(type as any)}
                  activeOpacity={1}
                >
                  <Text style={themed($segmentText(colors, activityType === type, typeColor))}>
                    {type}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </View>

          {/* Chart Content based on timeframe */}
          {timeframe === "Day" ? (
            <View style={themed($dayView)}>
              {/* Ring Chart on Left */}
              <View style={themed($ringContainer)}>
                <View style={themed($circleProgress)}>
                  {/* Background Circle */}
                  <View style={themed($circleBackground(activityType, colors))} />
                  {/* Progress Circle */}
                  <View style={themed($circleProgressBar(activityType, colors, 75))} />
                  {/* Center Content */}
                  <View style={themed($ringCenter(colors))}>
                    <Text style={themed($ringValue(colors))}>75%</Text>
                    <Text style={themed($ringLabel(colors))}>Goal</Text>
                  </View>
                </View>
              </View>

              {/* Summary on Right */}
              <View style={themed($daySummary)}>
                <View style={themed($summaryRow)}>
                  <Text style={themed($summaryLabel(colors))}>Completed</Text>
                  <Text style={themed($summaryValue(colors))}>
                    {activityType === "Prayers" ? "4/5" : activityType === "Quran" ? "2 pages" : "156"}
                  </Text>
                </View>
                <View style={themed($summaryRow)}>
                  <Text style={themed($summaryLabel(colors))}>Goal</Text>
                  <Text style={themed($summaryValue(colors))}>
                    {activityType === "Prayers" ? "5/5" : activityType === "Quran" ? "3 pages" : "200"}
                  </Text>
                </View>
                <View style={themed($summaryRow)}>
                  <Text style={themed($summaryLabel(colors))}>Streak</Text>
                  <Text style={themed($summaryValue(colors))}>7 days</Text>
                </View>
              </View>
            </View>
          ) : timeframe === "Week" ? (
            <View>
              {/* Bar Chart for Week */}
              <View style={themed($barsContainer)}>
                {weeklyActivity.map((day, index) => (
                  <View key={index} style={themed($barColumn)}>
                    <View style={themed($barWrapper)}>
                      <View
                        style={themed($bar(colors, (day.value / maxValue) * maxBarHeight, activityType))}
                      />
                    </View>
                    <Text style={themed($barLabel(colors))}>{day.day}</Text>
                  </View>
                ))}
              </View>

              {/* Chart Stats */}
              <View style={themed($chartStats)}>
                <View style={themed($chartStat)}>
                  <FontAwesome6 name="fire" size={16} color={colors.home} />
                  <View>
                    <Text style={themed($chartStatValue(colors))}>19,000</Text>
                    <Text style={themed($chartStatLabel(colors))}>Daily average</Text>
                  </View>
                </View>
                <View style={themed($chartStat)}>
                  <FontAwesome6 name="hand" size={16} color={colors.home} />
                  <View>
                    <Text style={themed($chartStatValue(colors))}>4/5</Text>
                    <Text style={themed($chartStatLabel(colors))}>
                      {activityType === "Prayers" ? "Prayers" : activityType === "Quran" ? "Pages read" : "Dhikr count"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={themed($monthView)}>
              {/* GitHub-style Heatmap */}
              <View style={themed($heatmapContainer)}>
                {[0, 1, 2, 3, 4].map((week) => (
                  <View key={week} style={themed($heatmapWeek)}>
                    {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                      const intensity = Math.random() // Replace with actual data
                      return (
                        <View
                          key={`${week}-${day}`}
                          style={themed($heatmapDay(colors, intensity, activityType))}
                        />
                      )
                    })}
                  </View>
                ))}
              </View>

              {/* Month Summary */}
              <View style={themed($monthSummary)}>
                <View style={themed($summaryRow)}>
                  <Text style={themed($summaryLabel(colors))}>Total days active</Text>
                  <Text style={themed($summaryValue(colors))}>23/30</Text>
                </View>
                <View style={themed($summaryRow)}>
                  <Text style={themed($summaryLabel(colors))}>Average per day</Text>
                  <Text style={themed($summaryValue(colors))}>
                    {activityType === "Prayers" ? "4.2/5" : activityType === "Quran" ? "2.1 pages" : "145"}
                  </Text>
                </View>
              </View>
            </View>
          )}
          </View>
        </View>

        {/* Spiritual Metrics Section */}
        <View style={themed($section)}>
          <Text style={themed($sectionTitle(colors))}>Spiritual Metrics</Text>
          <View style={themed($metricsGrid)}>
            {spiritualMetrics.map((metric, index) => (
              <View key={index} style={themed($metricCard(colors, metric.iconBg))}>
                <View style={themed($metricIconContainer(metric.iconBg))}>
                  <FontAwesome6 name={metric.icon as any} size={24} color={metric.color} solid />
                </View>
                <Text style={themed($metricValue(colors))}>{metric.value}</Text>
                <Text style={themed($metricLabel(colors))}>{metric.label}</Text>
                <Text style={themed($metricSublabel(colors))}>{metric.sublabel}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Spacer */}
        <View style={themed($bottomSpacer)} />
      </ScrollView>

      {/* Goals Modal */}
      <Modal
        visible={showGoalsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGoalsModal(false)}
      >
        <View style={themed($modalOverlay)}>
          <View style={themed($modalContent(colors))}>
            {/* Modal Header */}
            <View style={themed($modalHeader)}>
              <Text style={themed($modalTitle(colors))}>Set Your Goals</Text>
              <TouchableOpacity
                onPress={() => setShowGoalsModal(false)}
                style={themed($closeButton(colors))}
                activeOpacity={0.7}
              >
                <FontAwesome6 name="xmark" size={20} color={colors.textDim} />
              </TouchableOpacity>
            </View>

            <Text style={themed($modalSubtitle(colors))}>
              Set daily goals to track your spiritual progress
            </Text>

            {/* Goals Form */}
            <View style={themed($goalsForm)}>
              {/* Prayer Goal */}
              <View style={themed($goalItem)}>
                <View style={themed($goalHeader)}>
                  <View style={themed($goalIconContainer(colors.pray))}>
                    <FontAwesome6 name="person-praying" size={20} color="#FFFFFF" solid />
                  </View>
                  <View style={themed($goalInfo)}>
                    <Text style={themed($goalLabel(colors))}>Daily Prayers</Text>
                    <Text style={themed($goalHint(colors))}>Number of prayers per day</Text>
                  </View>
                </View>
                <TextInput
                  style={themed($goalInput(colors))}
                  value={prayerGoal}
                  onChangeText={setPrayerGoal}
                  keyboardType="number-pad"
                  maxLength={1}
                  placeholder="5"
                  placeholderTextColor={colors.textDim}
                />
              </View>

              {/* Quran Goal */}
              <View style={themed($goalItem)}>
                <View style={themed($goalHeader)}>
                  <View style={themed($goalIconContainer(colors.read))}>
                    <FontAwesome6 name="book-quran" size={20} color="#FFFFFF" solid />
                  </View>
                  <View style={themed($goalInfo)}>
                    <Text style={themed($goalLabel(colors))}>Quran Reading</Text>
                    <Text style={themed($goalHint(colors))}>Pages to read per day</Text>
                  </View>
                </View>
                <TextInput
                  style={themed($goalInput(colors))}
                  value={quranGoal}
                  onChangeText={setQuranGoal}
                  keyboardType="number-pad"
                  maxLength={2}
                  placeholder="3"
                  placeholderTextColor={colors.textDim}
                />
              </View>

              {/* Dhikr Goal */}
              <View style={themed($goalItem)}>
                <View style={themed($goalHeader)}>
                  <View style={themed($goalIconContainer("#9C27B0"))}>
                    <FontAwesome6 name="heart" size={20} color="#FFFFFF" solid />
                  </View>
                  <View style={themed($goalInfo)}>
                    <Text style={themed($goalLabel(colors))}>Dhikr Count</Text>
                    <Text style={themed($goalHint(colors))}>Number of dhikr per day</Text>
                  </View>
                </View>
                <TextInput
                  style={themed($goalInput(colors))}
                  value={dhikrGoal}
                  onChangeText={setDhikrGoal}
                  keyboardType="number-pad"
                  maxLength={4}
                  placeholder="200"
                  placeholderTextColor={colors.textDim}
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={themed($saveButton(colors))}
              onPress={() => {
                // TODO: Save goals to storage/backend
                setShowGoalsModal(false)
              }}
              activeOpacity={0.8}
            >
              <Text style={themed($saveButtonText)}>Save Goals</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<any> = {
  flex: 1,
}

// Header Styles
const $header: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 8,
  paddingBottom: 16,
}

const $headerLeft: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $hamburger: ThemedStyle<any> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.home + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $avatar: ThemedStyle<any> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.home + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $greeting: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "700",
  color: colors.text,
})

const $headerSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $headerRight: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 12,
}

const $iconButton: ThemedStyle<any> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
  position: "relative",
})

const $notificationBadge: ThemedStyle<any> = {
  position: "absolute",
  top: 8,
  right: 8,
  width: 10,
  height: 10,
  borderRadius: 5,
  backgroundColor: "#FF3B30",
  borderWidth: 2,
  borderColor: "#FFFFFF",
}

// Stats Grid Styles
const $statsGrid: ThemedStyle<any> = {
  flexDirection: "row",
  flexWrap: "wrap",
  paddingLeft: 16,
  paddingRight: 8,
  gap: 8,
  marginBottom: 24,
}

const $statCard: ThemedStyle<any> = (colors) => ({
  width: (width - 40) / 2,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  position: "relative",
})

const $statIconContainer: ThemedStyle<any> = (bgColor: string) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 8,
})

const $statChange: ThemedStyle<any> = (isPositive?: boolean) => ({
  position: "absolute",
  top: 12,
  right: 12,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: isPositive ? "#E8F5E9" : "#FFEBEE",
})

const $statChangeText: ThemedStyle<any> = (isPositive: boolean | undefined, colors) => ({
  fontSize: 11,
  fontWeight: "600",
  color: isPositive ? "#4CAF50" : colors.error,
})

const $statValue: ThemedStyle<any> = (colors) => ({
  fontSize: 28,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $statLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $statSublabel: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

// Activity Card Styles
const $activityCard: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
})

const $activityCardHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 20,
}

const $activityCardTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
})

const $timeframeTabs: ThemedStyle<any> = {
  flexDirection: "row",
  backgroundColor: "rgba(0, 0, 0, 0.05)",
  borderRadius: 8,
  padding: 2,
  gap: 2,
}

const $timeframeTab: ThemedStyle<any> = (colors, isSelected: boolean) => ({
  paddingHorizontal: 12,
  paddingVertical: 6,
  borderRadius: 6,
  backgroundColor: isSelected ? colors.background : "transparent",
})

const $timeframeTabText: ThemedStyle<any> = (colors, isSelected: boolean) => ({
  fontSize: 13,
  fontWeight: "600",
  color: isSelected ? colors.text : colors.textDim,
})

const $segmentedControl: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  backgroundColor: colors.palette.surface,
  borderRadius: 10,
  padding: 2,
  marginBottom: 20,
  borderWidth: 1,
  borderColor: colors.border,
})

const $segment: ThemedStyle<any> = (isSelected: boolean, typeColor: string) => ({
  flex: 1,
  paddingVertical: 8,
  paddingHorizontal: 12,
  borderRadius: 8,
  backgroundColor: isSelected ? typeColor : "transparent",
  alignItems: "center",
  justifyContent: "center",
  shadowColor: isSelected ? "#000" : "transparent",
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: isSelected ? 0.15 : 0,
  shadowRadius: isSelected ? 3 : 0,
  elevation: isSelected ? 3 : 0,
})

const $segmentText: ThemedStyle<any> = (colors, isSelected: boolean, typeColor: string) => ({
  fontSize: 14,
  fontWeight: "600",
  color: isSelected ? "#FFFFFF" : colors.textDim,
})

const $swipeContainer: ThemedStyle<any> = {
  marginBottom: 0,
}

const $chartPage: ThemedStyle<any> = {
  width: width - 64, // Full card width minus padding (32px on each side)
  paddingHorizontal: 0,
}

// Section Styles
const $section: ThemedStyle<any> = {
  paddingHorizontal: 16,
  marginBottom: 24,
}

const $sectionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 12,
})

const $cardsRow: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 12,
  marginBottom: 12,
}

const $sectionHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 12,
}

const $dropdown: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: colors.palette.surface,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: colors.border,
  minWidth: 85,
  justifyContent: "center",
})

const $dropdownText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.text,
})

const $barsContainer: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-end",
  height: 140,
  marginBottom: 16,
}

const $barColumn: ThemedStyle<any> = {
  flex: 1,
  alignItems: "center",
}

const $barWrapper: ThemedStyle<any> = {
  flex: 1,
  justifyContent: "flex-end",
  width: "80%",
  marginBottom: 8,
}

const $bar: ThemedStyle<any> = (colors, height: number, activityType?: string) => {
  const barColor = activityType === "Prayers" ? colors.pray : activityType === "Quran" ? colors.read : "#9C27B0"
  return {
    width: "100%",
    height: height,
    backgroundColor: barColor,
    borderRadius: 8,
  }
}

const $barLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  marginTop: 4,
})

const $chartStats: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-around",
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.05)",
}

const $chartStat: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
}

const $chartStatValue: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "700",
  color: colors.text,
})

const $chartStatLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

// Day View Styles
const $dayView: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 8,
  paddingVertical: 8,
}

const $ringContainer: ThemedStyle<any> = {
  flex: 1,
  alignItems: "flex-start",
  justifyContent: "center",
}

const $ringCenter: ThemedStyle<any> = (colors) => ({
  alignItems: "center",
  justifyContent: "center",
})

const $ringValue: ThemedStyle<any> = (colors) => ({
  fontSize: 28,
  fontWeight: "700",
  color: colors.text,
})

const $ringLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  marginTop: 4,
})

// Simple CSS Circular Progress Styles
const $circleProgress: ThemedStyle<any> = {
  width: 140,
  height: 140,
  position: "relative",
  alignItems: "center",
  justifyContent: "center",
}

const $circleBackground: ThemedStyle<any> = (activityType: string, colors) => {
  const color = activityType === "Prayers" ? colors.pray : activityType === "Quran" ? colors.read : "#9C27B0"
  return {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 14,
    borderColor: color + "20", // 20% opacity for background
  }
}

const $circleProgressBar: ThemedStyle<any> = (activityType: string, colors, percentage: number) => {
  const color = activityType === "Prayers" ? colors.pray : activityType === "Quran" ? colors.read : "#9C27B0"
  // Create a semi-circle progress effect using border and rotation
  // This is a simplified version - showing a ring with fixed progress
  return {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 14,
    borderColor: "transparent",
    borderTopColor: color,
    borderRightColor: color,
    borderBottomColor: percentage > 50 ? color : "transparent",
    borderLeftColor: percentage > 75 ? color : "transparent",
    transform: [{ rotate: "-45deg" }],
  }
}

const $daySummary: ThemedStyle<any> = {
  flex: 1,
  justifyContent: "center",
  gap: 12,
}

const $summaryRow: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
}

const $summaryLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $summaryValue: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
})

// Month View Styles
const $monthView: ThemedStyle<any> = {
  paddingVertical: 8,
}

const $heatmapContainer: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 4,
  marginBottom: 16,
}

const $heatmapWeek: ThemedStyle<any> = {
  flex: 1,
  gap: 4,
}

const $heatmapDay: ThemedStyle<any> = (colors, intensity: number, activityType: string) => {
  const baseColor = activityType === "Prayers" ? colors.pray : activityType === "Quran" ? colors.read : "#9C27B0"
  const opacity = intensity === 0 ? 0.1 : intensity < 0.25 ? 0.3 : intensity < 0.5 ? 0.5 : intensity < 0.75 ? 0.7 : 1
  return {
    height: 16,
    borderRadius: 3,
    backgroundColor: `${baseColor}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
  }
}

const $monthSummary: ThemedStyle<any> = {
  gap: 12,
  paddingTop: 16,
  borderTopWidth: 1,
  borderTopColor: "rgba(0,0,0,0.05)",
}

// Spiritual Metrics Styles
const $metricsGrid: ThemedStyle<any> = {
  flexDirection: "row",
  gap: 8,
}

const $metricCard: ThemedStyle<any> = (colors, bgColor: string) => ({
  flex: 1,
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 16,
  alignItems: "center",
})

const $metricIconContainer: ThemedStyle<any> = (bgColor: string) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
})

const $metricValue: ThemedStyle<any> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $metricLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
  marginBottom: 2,
})

const $metricSublabel: ThemedStyle<any> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
})

// Overall Score Styles
const $scoreCard: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 16,
  padding: 20,
  marginHorizontal: 20,
  marginTop: 12,
  marginBottom: 6,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $scoreLeft: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  flex: 1,
}

const $scoreIconContainer: ThemedStyle<any> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.home + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $scoreTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $scoreSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $scoreRight: ThemedStyle<any> = {
  alignItems: "flex-end",
}

const $scoreValue: ThemedStyle<any> = (colors) => ({
  fontSize: 32,
  fontWeight: "700",
  color: colors.home,
  marginBottom: 4,
})

const $scoreChange: ThemedStyle<any> = (isPositive: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  backgroundColor: isPositive ? "#E8F5E9" : "#FFEBEE",
})

const $scoreChangeText: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  fontWeight: "600",
  color: "#4CAF50",
})

const $bottomSpacer: ThemedStyle<any> = {
  height: 32,
}

// Goals Modal Styles
const $modalOverlay: ThemedStyle<any> = {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "flex-end",
}

const $modalContent: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.background,
  borderTopLeftRadius: 24,
  borderTopRightRadius: 24,
  paddingTop: 24,
  paddingHorizontal: 20,
  paddingBottom: 40,
  maxHeight: "80%",
})

const $modalHeader: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
}

const $modalTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
})

const $closeButton: ThemedStyle<any> = (colors) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.palette.surface,
  alignItems: "center",
  justifyContent: "center",
})

const $modalSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: 24,
})

const $goalsForm: ThemedStyle<any> = {
  gap: 16,
  marginBottom: 24,
}

const $goalItem: ThemedStyle<any> = {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 16,
}

const $goalHeader: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
  flex: 1,
}

const $goalIconContainer: ThemedStyle<any> = (bgColor: string) => ({
  width: 44,
  height: 44,
  borderRadius: 22,
  backgroundColor: bgColor,
  alignItems: "center",
  justifyContent: "center",
})

const $goalInfo: ThemedStyle<any> = {
  flex: 1,
}

const $goalLabel: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $goalHint: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $goalInput: ThemedStyle<any> = (colors) => ({
  width: 80,
  height: 44,
  borderRadius: 12,
  backgroundColor: colors.palette.surface,
  borderWidth: 1,
  borderColor: colors.border,
  paddingHorizontal: 16,
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
})

const $saveButton: ThemedStyle<any> = (colors) => ({
  backgroundColor: colors.home,
  borderRadius: 12,
  paddingVertical: 16,
  alignItems: "center",
  justifyContent: "center",
})

const $saveButtonText: ThemedStyle<any> = {
  fontSize: 16,
  fontWeight: "700",
  color: "#FFFFFF",
}
