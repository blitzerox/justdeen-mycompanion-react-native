/**
 * Tafsir Reader Screen
 *
 * Displays tafsir (commentary) for each verse in a surah
 * Uses Tafsir Ibn Kathir from Quran API
 */
import React, { useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Surah } from "@/services/quran/quranApi"
import { getChapterWithTafsir } from "@/services/quran/tafsir-api"
import { FontAwesome6 } from "@expo/vector-icons"
import RenderHtml from "react-native-render-html"
import { useWindowDimensions } from "react-native"

interface VerseWithTafsir {
  verse_key: string
  verse_number: number
  text_uthmani: string
  translations: any[]
  tafsir_text: string
  tafsir_name: string
}

export const TafsirReaderScreen: React.FC<ReadStackScreenProps<"TafsirReader">> = ({
  navigation,
  route,
}) => {
  const { surahId } = route.params
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()

  const [surah, setSurah] = useState<Surah | null>(null)
  const [verses, setVerses] = useState<VerseWithTafsir[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedVerse, setExpandedVerse] = useState<string | null>(null)

  // Load surah info and tafsir
  useEffect(() => {
    const loadTafsir = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get surah info
        const surahs = await quranApi.getSurahs()
        const currentSurah = surahs.find(s => s.id === surahId)
        setSurah(currentSurah || null)

        // Get verses with tafsir
        const versesWithTafsir = await getChapterWithTafsir(surahId)
        console.log(`📖 Loaded ${versesWithTafsir.length} verses with tafsir`)
        if (versesWithTafsir.length > 0) {
          console.log(`First verse tafsir_text:`, versesWithTafsir[0].tafsir_text ? 'HAS DATA' : 'NULL')
        }
        setVerses(versesWithTafsir)

        // Update header title
        if (currentSurah) {
          navigation.setOptions({
            title: `Tafsir: ${currentSurah.transliteration}`,
          })
        }
      } catch (err) {
        console.error('Failed to load tafsir:', err)
        setError(err instanceof Error ? err.message : 'Failed to load tafsir')
      } finally {
        setIsLoading(false)
      }
    }
    loadTafsir()
  }, [surahId, navigation])

  const toggleVerse = (verseKey: string) => {
    setExpandedVerse(expandedVerse === verseKey ? null : verseKey)
  }

  const renderVerse = ({ item }: { item: VerseWithTafsir }) => {
    const isExpanded = expandedVerse === item.verse_key
    const hasTranslation = item.translations && item.translations.length > 0

    return (
      <View style={themed($verseCard)}>
        {/* Verse Header */}
        <TouchableOpacity
          style={themed($verseHeader)}
          onPress={() => toggleVerse(item.verse_key)}
          activeOpacity={0.7}
        >
          <View style={themed($verseNumber)}>
            <Text style={themed($verseNumberText)}>{item.verse_number}</Text>
          </View>
          <Text style={themed($verseKey)}>{item.verse_key}</Text>
          <FontAwesome6
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={14}
            color={colors.textDim}
          />
        </TouchableOpacity>

        {/* Arabic Text */}
        <View style={themed($arabicContainer)}>
          <Text style={themed($arabicText)}>{item.text_uthmani}</Text>
        </View>

        {/* Translation */}
        {hasTranslation && (
          <View style={themed($translationContainer)}>
            <Text style={themed($translationText)}>
              {item.translations[0]?.text || ""}
            </Text>
          </View>
        )}

        {/* Tafsir (Expandable) */}
        {isExpanded && item.tafsir_text && (
          <View style={themed($tafsirContainer)}>
            <View style={themed($tafsirHeader)}>
              <FontAwesome6 name="book-open" size={14} color={colors.read} />
              <Text style={themed($tafsirTitle)}>
                {item.tafsir_name || "Tafsir Ibn Kathir"}
              </Text>
            </View>
            <RenderHtml
              contentWidth={width - 64}
              source={{ html: item.tafsir_text }}
              baseStyle={{
                color: colors.text,
                fontSize: 14,
                lineHeight: 22,
              }}
              tagsStyles={{
                p: { marginBottom: 12 },
                h3: {
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                  color: colors.text,
                },
                h4: {
                  fontSize: 15,
                  fontWeight: "600",
                  marginBottom: 6,
                  color: colors.text,
                },
                em: { fontStyle: "italic" },
                strong: { fontWeight: "600" },
              }}
            />
          </View>
        )}

        {/* Expand Button */}
        {item.tafsir_text && !isExpanded && (
          <TouchableOpacity
            style={themed($expandButton)}
            onPress={() => toggleVerse(item.verse_key)}
            activeOpacity={0.7}
          >
            <FontAwesome6 name="book-open" size={12} color={colors.read} />
            <Text style={themed($expandButtonText)}>View Tafsir</Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Tafsir...</Text>
          <Text style={themed($loadingSubtext)}>
            Fetching commentary from Quran API
          </Text>
        </View>
      </Screen>
    )
  }

  if (error) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Icon icon="x" size={48} color={colors.error} />
          <Text style={themed($errorText)}>{error}</Text>
          <TouchableOpacity
            style={themed($retryButton)}
            onPress={() => navigation.goBack()}
          >
            <Text style={themed($retryButtonText)}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header Info */}
      {surah && (
        <View style={themed($headerInfo)}>
          <Text style={themed($headerArabic)}>{surah.name}</Text>
          <Text style={themed($headerSubtitle)}>
            {surah.translation} • {surah.totalVerses} Verses
          </Text>
        </View>
      )}

      {/* Verses List */}
      <FlatList
        data={verses}
        keyExtractor={(item) => item.verse_key}
        renderItem={renderVerse}
        contentContainerStyle={[themed($listContent), { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Icon icon="components" size={48} color={colors.textDim} />
            <Text style={themed($emptyText)}>No tafsir available</Text>
          </View>
        }
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
  gap: spacing.sm,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $loadingSubtext: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.xl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.text,
  textAlign: "center",
})

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 8,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 14,
  fontWeight: "600",
})

const $headerInfo: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
  alignItems: "center",
})

const $headerArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 28,
  color: colors.text,
  fontFamily: "uthman",
  marginBottom: 4,
})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
})

const $verseCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  marginBottom: spacing.md,
  overflow: "hidden",
})

const $verseHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: spacing.sm,
  gap: spacing.sm,
})

const $verseNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 32,
  height: 32,
  borderRadius: 16,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $verseNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 12,
  fontWeight: "700",
})

const $verseKey: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 13,
  color: colors.textDim,
  fontWeight: "500",
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  borderBottomWidth: 1,
  borderBottomColor: colors.palette.neutral200,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  lineHeight: 40,
  color: colors.text,
  fontFamily: "uthman",
  textAlign: "right",
})

const $translationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $translationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  lineHeight: 22,
  color: colors.text,
})

const $tafsirContainer: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.md,
  backgroundColor: colors.read + "10",
})

const $tafsirHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.sm,
})

const $tafsirTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.read,
})

const $expandButton: ThemedStyle<ViewStyle> = ({ spacing, colors }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  paddingVertical: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
})

const $expandButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.read,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
  gap: spacing.sm,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})
