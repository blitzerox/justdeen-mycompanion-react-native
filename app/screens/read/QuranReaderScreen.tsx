/**
 * Quran Reader Screen
 *
 * Verse-by-verse Quran reading with Arabic text and translations
 * Features: Scroll to verse, bookmarking, translation toggle
 */
import React, { useEffect, useState, useRef } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Verse, Surah } from "@/services/quran/quranApi"

export const QuranReaderScreen: React.FC<ReadStackScreenProps<"QuranReader">> = ({
  route,
  navigation,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { surahNumber, ayahNumber } = route.params

  const [surah, setSurah] = useState<Surah | null>(null)
  const [verses, setVerses] = useState<Verse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(true)

  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadSurah()
  }, [surahNumber])

  useEffect(() => {
    navigation.setOptions({
      title: surah ? surah.transliteration : "Loading...",
      headerShown: true,
    })
  }, [surah, navigation])

  const loadSurah = async () => {
    setLoading(true)
    setError(null)

    try {
      const surahData = quranApi.getSurah(surahNumber)
      if (!surahData) {
        throw new Error("Surah not found")
      }
      setSurah(surahData)

      const versesData = await quranApi.getVerses(surahNumber, 131) // Sahih International
      setVerses(versesData)

      // Scroll to specific ayah if provided
      if (ayahNumber && versesData.length > 0) {
        setTimeout(() => {
          const index = versesData.findIndex((v) => v.verseNumber === ayahNumber)
          if (index >= 0 && flatListRef.current) {
            flatListRef.current.scrollToIndex({ index, animated: true })
          }
        }, 500)
      }
    } catch (err) {
      console.error("Error loading Surah:", err)
      setError(err instanceof Error ? err.message : "Failed to load Surah")
    } finally {
      setLoading(false)
    }
  }

  const renderVerse = ({ item }: { item: Verse }) => (
    <View style={themed($verseContainer)}>
      {/* Verse Number Badge */}
      <View style={themed($verseHeader)}>
        <View style={themed($verseBadge)}>
          <Text style={themed($verseBadgeText)}>{item.verseNumber}</Text>
        </View>
      </View>

      {/* Arabic Text */}
      <View style={themed($arabicContainer)}>
        <Text style={themed($arabicText)}>{item.textUthmani}</Text>
      </View>

      {/* Translation */}
      {showTranslation && item.translations && item.translations.length > 0 && (
        <View style={themed($translationContainer)}>
          <Text style={themed($translationText)}>{item.translations[0].text}</Text>
          <Text style={themed($translatorName)}>— {item.translations[0].translatorName}</Text>
        </View>
      )}

      {/* Verse Actions */}
      <View style={themed($verseActions)}>
        <TouchableOpacity style={themed($actionButton)}>
          <Icon icon="heart" size={18} color={colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={themed($actionButton)}>
          <Icon icon="share" size={18} color={colors.textDim} />
        </TouchableOpacity>
        <TouchableOpacity style={themed($actionButton)}>
          <Icon icon="bell" size={18} color={colors.textDim} />
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Surah...</Text>
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>{error}</Text>
          <TouchableOpacity style={themed($retryButton)} onPress={loadSurah}>
            <Text style={themed($retryButtonText)}>Retry</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      {surah && (
        <View style={themed($surahHeader)}>
          <View style={themed($surahHeaderInfo)}>
            <Text style={themed($surahHeaderName)}>{surah.name}</Text>
            <Text style={themed($surahHeaderMeta)}>
              {surah.type === "meccan" ? "Meccan" : "Medinan"} • {surah.totalVerses} verses
            </Text>
          </View>
          <TouchableOpacity
            style={themed($translationToggle)}
            onPress={() => setShowTranslation(!showTranslation)}
          >
            <Icon
              icon={showTranslation ? "eyeOpen" : "hidden"}
              size={20}
              color={colors.read}
            />
            <Text style={themed($translationToggleText)}>
              {showTranslation ? "Hide" : "Show"} Translation
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bismillah (except for Surah 9) */}
      {surah && surah.id !== 9 && (
        <View style={themed($bismillahContainer)}>
          <Text style={themed($bismillahText)}>بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</Text>
        </View>
      )}

      {/* Verses List */}
      <FlatList
        ref={flatListRef}
        data={verses}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderVerse}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        onScrollToIndexFailed={(info) => {
          console.warn("Scroll to index failed:", info)
        }}
      />
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textDim,
  marginTop: spacing.md,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.error,
  fontSize: 16,
  textAlign: "center",
  marginBottom: spacing.md,
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontWeight: "600",
})

const $surahHeader: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
})

const $surahHeaderInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $surahHeaderName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
})

const $surahHeaderMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  marginTop: 2,
})

const $translationToggle: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
})

const $translationToggleText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.read,
  fontWeight: "500",
})

const $bismillahContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  alignItems: "center",
  marginHorizontal: spacing.md,
  marginTop: spacing.md,
  borderRadius: 12,
})

const $bismillahText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  color: colors.text,
  textAlign: "center",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $verseContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginTop: spacing.md,
})

const $verseHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.sm,
})

const $verseBadge: ThemedStyle<ViewStyle> = ({ colors }) => ({
  backgroundColor: colors.read,
  width: 32,
  height: 32,
  borderRadius: 16,
  alignItems: "center",
  justifyContent: "center",
})

const $verseBadgeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 14,
  fontWeight: "700",
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 26,
  lineHeight: 48,
  color: colors.text,
  textAlign: "right",
  fontWeight: "400",
})

const $translationContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.border,
  paddingTop: spacing.sm,
  marginTop: spacing.sm,
})

const $translationText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  lineHeight: 26,
  color: colors.text,
  marginBottom: spacing.xs,
})

const $translatorName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  fontStyle: "italic",
})

const $verseActions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.md,
  marginTop: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.xs,
})
