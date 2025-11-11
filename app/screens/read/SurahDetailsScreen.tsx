/**
 * Surah Details Screen
 *
 * Displays Surah metadata and overview before reading
 */
import React from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, ScrollView } from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi } from "@/services/quran/quranApi"

export const SurahDetailsScreen: React.FC<ReadStackScreenProps<"SurahDetails">> = ({
  navigation,
  route,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { surahNumber } = route.params

  const surah = quranApi.getSurah(surahNumber)

  if (!surah) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>Surah not found</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Surah Header */}
        <View style={themed($header)}>
          <Text style={themed($surahName)}>{surah.name}</Text>
          <Text style={themed($surahTransliteration)}>{surah.transliteration}</Text>
          <Text style={themed($surahTranslation)}>{surah.translation}</Text>
        </View>

        {/* Bismillah (except for Surah 9 At-Tawbah) */}
        {surah.id !== 9 && (
          <View style={themed($bismillahContainer)}>
            <Text style={themed($bismillahText)}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
          </View>
        )}

        {/* Surah Info Cards */}
        <View style={themed($infoGrid)}>
          <View style={themed($infoCard)}>
            <Icon icon="book" size={24} color={colors.read} />
            <Text style={themed($infoLabel)}>Verses</Text>
            <Text style={themed($infoValue)}>{surah.totalVerses}</Text>
          </View>

          <View style={themed($infoCard)}>
            <Icon icon="mapPin" size={24} color={colors.read} />
            <Text style={themed($infoLabel)}>Revelation</Text>
            <Text style={themed($infoValue)}>
              {surah.type === "meccan" ? "Meccan" : "Medinan"}
            </Text>
          </View>

          <View style={themed($infoCard)}>
            <Icon icon="list" size={24} color={colors.read} />
            <Text style={themed($infoLabel)}>Order</Text>
            <Text style={themed($infoValue)}>{surah.revelationOrder}</Text>
          </View>

          <View style={themed($infoCard)}>
            <Icon icon="hash" size={24} color={colors.read} />
            <Text style={themed($infoLabel)}>Number</Text>
            <Text style={themed($infoValue)}>{surah.id}</Text>
          </View>
        </View>

        {/* Start Reading Button */}
        <TouchableOpacity
          style={themed($readButton)}
          onPress={() =>
            navigation.navigate("QuranReader", {
              surahNumber: surah.id,
              ayahNumber: 1,
            })
          }
        >
          <Icon icon="book" size={20} color={colors.palette.white} />
          <Text style={themed($readButtonText)}>Start Reading</Text>
        </TouchableOpacity>

        {/* Description */}
        <View style={themed($descriptionContainer)}>
          <Text style={themed($descriptionTitle)}>About this Surah</Text>
          <Text style={themed($descriptionText)}>
            {surah.type === "meccan"
              ? `This Surah was revealed in Mecca. It is the ${surah.revelationOrder}${getOrdinalSuffix(surah.revelationOrder)} chapter revealed chronologically. Meccan surahs generally focus on faith, the Day of Judgment, and stories of earlier prophets.`
              : `This Surah was revealed in Medina. It is the ${surah.revelationOrder}${getOrdinalSuffix(surah.revelationOrder)} chapter revealed chronologically. Medinan surahs often contain detailed legal and social guidance for the Muslim community.`}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Helper function for ordinal suffix
function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return "st"
  if (j === 2 && k !== 12) return "nd"
  if (j === 3 && k !== 13) return "rd"
  return "th"
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
})

const $surahName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 48,
  fontWeight: "700",
  color: colors.text,
  marginBottom: 8,
})

const $surahTransliteration: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $surahTranslation: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
})

const $bismillahContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $bismillahText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 24,
  color: colors.text,
  textAlign: "center",
})

const $infoGrid: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  flexWrap: "wrap",
  gap: spacing.sm,
  marginBottom: spacing.xl,
})

const $infoCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  minWidth: "45%",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  alignItems: "center",
  gap: spacing.xs,
})

const $infoLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  textTransform: "uppercase",
  letterSpacing: 0.5,
})

const $infoValue: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.text,
})

const $readButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  padding: spacing.md,
  borderRadius: 12,
  gap: spacing.sm,
  marginBottom: spacing.xl,
})

const $readButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 17,
  fontWeight: "600",
})

const $descriptionContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.xl,
})

const $descriptionTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.sm,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.textDim,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 17,
  color: colors.error,
})
