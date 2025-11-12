/**
 * Achievements Screen
 * Display all achievements, unlocked and locked
 * Show progress and rarity
 */

import React, { useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity } from "react-native"
import { Text, Screen } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useFocusEffect } from "@react-navigation/native"
import type { ThemedStyle } from "@/theme/types"
import type { MoreStackScreenProps } from "@/navigators"
import { useUserStats } from "@/hooks/useUserStats"
import {
  ACHIEVEMENTS,
  getUnlockedAchievements,
  getLockedAchievements,
  getAchievementsByCategory,
  getAchievementProgress,
  getRarityColor,
  type Achievement,
  type AchievementCategory,
} from "@/constants/achievements"

interface AchievementsScreenProps extends MoreStackScreenProps<"Achievements"> {}

export const AchievementsScreen: React.FC<AchievementsScreenProps> = ({ navigation }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { stats, refreshStats } = useUserStats()
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory | "all">("all")

  // Refresh stats when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      refreshStats()
    }, [refreshStats])
  )

  const unlockedAchievements = getUnlockedAchievements(stats)
  const lockedAchievements = getLockedAchievements(stats)
  const progress = getAchievementProgress(stats)

  // Filter achievements by selected category
  const displayedAchievements =
    selectedCategory === "all"
      ? ACHIEVEMENTS
      : getAchievementsByCategory(selectedCategory)

  const categories: Array<{ id: AchievementCategory | "all"; label: string; icon: string }> = [
    { id: "all", label: "All", icon: "trophy" },
    { id: "prayer", label: "Prayer", icon: "person-praying" },
    { id: "quran", label: "Quran", icon: "book-quran" },
    { id: "tasbih", label: "Dhikr", icon: "hand" },
    { id: "streak", label: "Streak", icon: "fire" },
    { id: "level", label: "Level", icon: "star" },
    { id: "general", label: "General", icon: "circle-check" },
  ]

  const isUnlocked = (achievement: Achievement) =>
    unlockedAchievements.some((a) => a.id === achievement.id)

  return (
    <Screen preset="fixed" safeAreaEdges={["top"]} contentContainerStyle={themed($screenContainer)}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Stats */}
        <View style={themed($header(colors))}>
          <View style={themed($headerContent)}>
            <View style={themed($headerIcon(colors))}>
              <FontAwesome6 name="trophy" size={32} color="#FFD700" solid />
            </View>
            <View style={themed($headerStats)}>
              <Text style={themed($headerTitle(colors))}>Achievements</Text>
              <Text style={themed($headerSubtitle(colors))}>
                {unlockedAchievements.length} / {ACHIEVEMENTS.length} Unlocked
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={themed($progressContainer)}>
            <View style={themed($progressBarBackground(colors))}>
              <View style={themed($progressBarFill(colors, progress))} />
            </View>
            <Text style={themed($progressText(colors))}>{progress}% Complete</Text>
          </View>
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={themed($categoryScrollView)}
          contentContainerStyle={themed($categoryContainer)}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={themed($categoryChip(colors, selectedCategory === category.id))}
              onPress={() => setSelectedCategory(category.id)}
              activeOpacity={0.7}
            >
              <FontAwesome6
                name={category.icon as any}
                size={14}
                color={selectedCategory === category.id ? "#FFFFFF" : colors.text}
                solid
              />
              <Text style={themed($categoryText(colors, selectedCategory === category.id))}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Achievements List */}
        <View style={themed($achievementsList)}>
          {displayedAchievements.map((achievement) => {
            const unlocked = isUnlocked(achievement)
            const rarityColor = getRarityColor(achievement.rarity)

            return (
              <View
                key={achievement.id}
                style={themed($achievementCard(colors, unlocked, rarityColor))}
              >
                {/* Rarity Badge */}
                <View style={themed($rarityBadge(rarityColor))}>
                  <Text style={themed($rarityText)}>{achievement.rarity.toUpperCase()}</Text>
                </View>

                {/* Icon & Content */}
                <View style={themed($achievementContent)}>
                  <View
                    style={themed($achievementIcon(colors, unlocked, achievement.iconColor))}
                  >
                    <FontAwesome6
                      name={achievement.icon as any}
                      size={24}
                      color={unlocked ? achievement.iconColor : colors.textDim}
                      solid
                    />
                  </View>

                  <View style={themed($achievementInfo)}>
                    <Text style={themed($achievementTitle(colors, unlocked))}>
                      {achievement.title}
                    </Text>
                    <Text style={themed($achievementDescription(colors, unlocked))}>
                      {achievement.description}
                    </Text>
                    <View style={themed($achievementFooter)}>
                      <View style={themed($pointsBadge(colors, unlocked))}>
                        <FontAwesome6
                          name="star"
                          size={10}
                          color={unlocked ? "#FFD700" : colors.textDim}
                          solid
                        />
                        <Text style={themed($pointsText(colors, unlocked))}>
                          +{achievement.points}
                        </Text>
                      </View>
                      {unlocked && (
                        <View style={themed($unlockedBadge)}>
                          <FontAwesome6 name="check" size={10} color="#10B981" solid />
                          <Text style={themed($unlockedText)}>Unlocked</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            )
          })}
        </View>

        {/* Bottom Spacer */}
        <View style={themed($bottomSpacer)} />
      </ScrollView>
    </Screen>
  )
}

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $header: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.palette.surface,
  padding: 20,
  marginHorizontal: 20,
  marginTop: 20,
  marginBottom: 16,
  borderRadius: 16,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
})

const $headerContent: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 16,
}

const $headerIcon: ThemedStyle<ViewStyle> = (colors) => ({
  width: 60,
  height: 60,
  borderRadius: 30,
  backgroundColor: "#FFD70020",
  alignItems: "center",
  justifyContent: "center",
  marginRight: 16,
})

const $headerStats: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $headerTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 4,
})

const $headerSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $progressContainer: ThemedStyle<ViewStyle> = {
  gap: 8,
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
  backgroundColor: "#FFD700",
  borderRadius: 4,
})

const $progressText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  textAlign: "center",
})

const $categoryScrollView: ThemedStyle<ViewStyle> = {
  marginBottom: 16,
}

const $categoryContainer: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 20,
  gap: 8,
}

const $categoryChip: ThemedStyle<ViewStyle> = (colors, selected: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 20,
  backgroundColor: selected ? colors.more : colors.palette.surface,
  gap: 6,
})

const $categoryText: ThemedStyle<TextStyle> = (colors, selected: boolean) => ({
  fontSize: 13,
  fontWeight: "600",
  color: selected ? "#FFFFFF" : colors.text,
})

const $achievementsList: ThemedStyle<ViewStyle> = {
  paddingHorizontal: 20,
  gap: 12,
}

const $achievementCard: ThemedStyle<ViewStyle> = (
  colors,
  unlocked: boolean,
  rarityColor: string
) => ({
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  padding: 16,
  borderLeftWidth: 4,
  borderLeftColor: rarityColor,
  opacity: unlocked ? 1 : 0.6,
})

const $rarityBadge: ThemedStyle<ViewStyle> = (rarityColor: string) => ({
  position: "absolute",
  top: 8,
  right: 8,
  backgroundColor: rarityColor + "20",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
})

const $rarityText: ThemedStyle<TextStyle> = {
  fontSize: 9,
  fontWeight: "700",
  color: "#FFFFFF",
}

const $achievementContent: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 12,
}

const $achievementIcon: ThemedStyle<ViewStyle> = (
  colors,
  unlocked: boolean,
  iconColor: string
) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: unlocked ? iconColor + "20" : colors.background,
  alignItems: "center",
  justifyContent: "center",
})

const $achievementInfo: ThemedStyle<ViewStyle> = {
  flex: 1,
  paddingTop: 4,
}

const $achievementTitle: ThemedStyle<TextStyle> = (colors, unlocked: boolean) => ({
  fontSize: 16,
  fontWeight: "700",
  color: unlocked ? colors.text : colors.textDim,
  marginBottom: 4,
})

const $achievementDescription: ThemedStyle<TextStyle> = (colors, unlocked: boolean) => ({
  fontSize: 13,
  color: colors.textDim,
  marginBottom: 8,
  opacity: unlocked ? 1 : 0.7,
})

const $achievementFooter: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
}

const $pointsBadge: ThemedStyle<ViewStyle> = (colors, unlocked: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: unlocked ? "#FFD70020" : colors.background,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  gap: 4,
})

const $pointsText: ThemedStyle<TextStyle> = (colors, unlocked: boolean) => ({
  fontSize: 11,
  fontWeight: "700",
  color: unlocked ? "#FFD700" : colors.textDim,
})

const $unlockedBadge: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#10B98120",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 8,
  gap: 4,
}

const $unlockedText: ThemedStyle<TextStyle> = {
  fontSize: 11,
  fontWeight: "700",
  color: "#10B981",
}

const $bottomSpacer: ThemedStyle<ViewStyle> = {
  height: 40,
}
