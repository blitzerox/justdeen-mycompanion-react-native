/**
 * Quran Progress Card
 * Displays Quran reading progress and last read position
 */

import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity } from "react-native"
import { Text } from "@/components"
import { FontAwesome6 } from "@expo/vector-icons"
import { useAppTheme } from "@/theme/context"
import { useFocusEffect } from "@react-navigation/native"
import type { ThemedStyle } from "@/theme/types"
import { useQuranTracking } from "@/hooks/useQuranTracking"

interface QuranProgressCardProps {
  onContinueReading?: () => void
}

export const QuranProgressCard: React.FC<QuranProgressCardProps> = ({ onContinueReading }) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { lastReadPosition, quranStats } = useQuranTracking()

  const hasLastRead = lastReadPosition.surahNumber !== null

  return (
    <View style={themed($container(colors))}>
      {/* Title */}
      <View style={themed($headerRow)}>
        <FontAwesome6 name="book-quran" size={20} color={colors.read} solid />
        <Text style={themed($title(colors))}>Your Quran Journey</Text>
      </View>

      {/* Last Read Position */}
      {hasLastRead && (
        <TouchableOpacity
          style={themed($lastReadContainer(colors))}
          onPress={onContinueReading}
          activeOpacity={0.7}
        >
          <View style={themed($lastReadIcon(colors))}>
            <FontAwesome6 name="bookmark" size={24} color={colors.read} solid />
          </View>
          <View style={themed($lastReadInfo)}>
            <Text style={themed($lastReadLabel(colors))}>Continue Reading</Text>
            <Text style={themed($lastReadText(colors))}>
              Surah {lastReadPosition.surahNumber}, Ayah {lastReadPosition.ayahNumber}
            </Text>
            {lastReadPosition.pageNumber && (
              <Text style={themed($lastReadPage(colors))}>
                Page {lastReadPosition.pageNumber} • Juz {lastReadPosition.juzNumber}
              </Text>
            )}
          </View>
          <FontAwesome6 name="chevron-right" size={16} color={colors.textDim} />
        </TouchableOpacity>
      )}

      {/* Stats Grid */}
      <View style={themed($statsGrid)}>
        {/* Pages Read */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="book-open" size={20} color={colors.read} solid />
          <Text style={themed($statValue(colors))}>{quranStats.totalPagesRead}</Text>
          <Text style={themed($statLabel(colors))}>Pages Read</Text>
        </View>

        {/* Reading Time */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="clock" size={20} color={colors.read} solid />
          <Text style={themed($statValue(colors))}>{Math.floor(quranStats.totalTimeMinutes / 60)}h</Text>
          <Text style={themed($statLabel(colors))}>Time Spent</Text>
        </View>

        {/* Streak */}
        <View style={themed($statItem(colors))}>
          <FontAwesome6 name="fire" size={20} color="#FF6B35" solid />
          <Text style={themed($statValue(colors))}>{quranStats.streakDays}</Text>
          <Text style={themed($statLabel(colors))}>Day Streak</Text>
        </View>
      </View>
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

const $lastReadContainer: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.background + "40",
  borderRadius: 12,
  padding: 12,
  marginBottom: 16,
  gap: 12,
})

const $lastReadIcon: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.read + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $lastReadInfo: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $lastReadLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.read,
  marginBottom: 4,
})

const $lastReadText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $lastReadPage: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $statsGrid: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $statItem: ThemedStyle<ViewStyle> = (colors) => ({
  flex: 1,
  alignItems: "center",
  padding: 12,
  backgroundColor: colors.background + "40",
  borderRadius: 12,
  marginHorizontal: 4,
})

const $statValue: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
  marginTop: 8,
  marginBottom: 2,
})

const $statLabel: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 10,
  color: colors.textDim,
  textAlign: "center",
})
