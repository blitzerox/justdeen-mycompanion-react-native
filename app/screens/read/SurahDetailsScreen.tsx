/**
 * Surah Details Screen
 *
 * Displays Surah metadata and overview before reading
 */
import React, { useState, useEffect } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, ActivityIndicator } from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { getChapterById, getChapterInfo, type Chapter } from "@/services/quran/chapters-api"

interface ChapterInfo {
  chapter_id: number
  short_text: string
  text: string
  source: string
  language_name: string
}

export const SurahDetailsScreen: React.FC<ReadStackScreenProps<"SurahDetails">> = ({
  navigation,
  route,
}) => {
  const { themed, theme: { colors } } = useAppTheme()
  const { surahNumber } = route.params
  const [chapter, setChapter] = useState<Chapter | null>(null)
  const [chapterInfo, setChapterInfo] = useState<ChapterInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadChapterData = async () => {
      try {
        setIsLoading(true)

        // Load chapter metadata and info in parallel
        const [chapterData, infoData] = await Promise.all([
          getChapterById(surahNumber),
          getChapterInfo(surahNumber)
        ])

        setChapter(chapterData)
        setChapterInfo(infoData)
      } catch (error) {
        console.error('Failed to load chapter data:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadChapterData()
  }, [surahNumber])

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Surah...</Text>
        </View>
      </Screen>
    )
  }

  if (!chapter) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Text style={themed($errorText)}>Surah not found</Text>
        </View>
      </Screen>
    )
  }

  const revelationType = chapter.revelation_place === 'makkah' ? 'Meccan' : 'Madani'

  return (
    <Screen preset="scroll" contentContainerStyle={themed($container)}>
      {/* Surah Header */}
      <View style={themed($header)}>
        <Text style={themed($surahName)}>{chapter.name_arabic}</Text>
        <Text style={themed($surahTransliteration)}>{chapter.name_complex}</Text>
      </View>

      {/* Translation Card */}
      <View style={themed($translationCard)}>
        <Text style={themed($translationCardText)}>{chapter.translated_name}</Text>
      </View>

      {/* Surah Info Cards */}
      <View style={themed($infoGrid)}>
        <View style={themed($infoCard)}>
          <Icon icon="book" size={24} color={colors.read} />
          <Text style={themed($infoLabel)}>Verses</Text>
          <Text style={themed($infoValue)}>{chapter.verses_count}</Text>
        </View>

        <View style={themed($infoCard)}>
          <Icon icon="mapPin" size={24} color={colors.read} />
          <Text style={themed($infoLabel)}>Revelation</Text>
          <Text style={themed($infoValue)}>{revelationType}</Text>
        </View>

        <View style={themed($infoCard)}>
          <Icon icon="list" size={24} color={colors.read} />
          <Text style={themed($infoLabel)}>Order</Text>
          <Text style={themed($infoValue)}>{chapter.revelation_order}</Text>
        </View>

        <View style={themed($infoCard)}>
          <Icon icon="hash" size={24} color={colors.read} />
          <Text style={themed($infoLabel)}>Number</Text>
          <Text style={themed($infoValue)}>{chapter.id}</Text>
        </View>
      </View>

      {/* Start Reading Button */}
      <TouchableOpacity
        style={themed($readButton)}
        onPress={() =>
          navigation.navigate("QuranReader", {
            surahNumber: chapter.id,
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
        {chapterInfo?.text ? (
          <>
            {parseHTMLContent(chapterInfo.text).map((section, index) => (
              <Text
                key={index}
                style={themed(section.type === 'heading' ? $descriptionSubheading : $descriptionText)}
              >
                {section.content}
              </Text>
            ))}
          </>
        ) : (
          <Text style={themed($descriptionText)}>
            {revelationType === "Meccan"
              ? `This Surah was revealed in Mecca. It is the ${chapter.revelation_order}${getOrdinalSuffix(chapter.revelation_order)} chapter revealed chronologically. Meccan surahs generally focus on faith, the Day of Judgment, and stories of earlier prophets.`
              : `This Surah was revealed in Medina. It is the ${chapter.revelation_order}${getOrdinalSuffix(chapter.revelation_order)} chapter revealed chronologically. Madani surahs often contain detailed legal and social guidance for the Muslim community.`}
          </Text>
        )}
        {chapterInfo?.source && (
          <Text style={themed($sourceText)}>Source: {chapterInfo.source}</Text>
        )}
      </View>
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

// Helper function to parse HTML content
interface ParsedSection {
  type: 'heading' | 'paragraph'
  content: string
  hasEmphasis?: boolean
}

function parseHTMLContent(html: string): ParsedSection[] {
  const sections: ParsedSection[] = []

  // First, remove all <a> tags but keep their text content
  let cleanedHtml = html.replace(/<a[^>]*>(.*?)<\/a>/gi, '$1')

  // Match both <h2> and <p> tags in order they appear
  const tagRegex = /<(h2|p)[^>]*>(.*?)<\/\1>/gi
  let match

  // Extract tags in the order they appear
  while ((match = tagRegex.exec(cleanedHtml)) !== null) {
    const tagName = match[1].toLowerCase()
    let content = match[2].trim()

    if (content) { // Only add non-empty content
      // Check if content has emphasis tags
      const hasEmphasis = /<(strong|em|b|i)[^>]*>/.test(content)

      // Remove HTML tags from content but keep the text
      // Replace <strong> and <b> with the text (bold effect will be handled in rendering)
      content = content.replace(/<(strong|b)[^>]*>(.*?)<\/\1>/gi, '$2')
      // Replace <em> and <i> with the text (italic effect will be handled in rendering)
      content = content.replace(/<(em|i)[^>]*>(.*?)<\/\1>/gi, '$2')

      sections.push({
        type: tagName === 'h2' ? 'heading' : 'paragraph',
        content: content,
        hasEmphasis: hasEmphasis
      })
    }
  }

  return sections
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.xl,
  paddingVertical: spacing.md,
})

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  paddingVertical: spacing.xl,
  paddingHorizontal: spacing.md,
  width: "100%",
})

const $surahName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 48,
  fontWeight: "700",
  color: colors.text,
  marginBottom: spacing.xs,
  textAlign: "center",
  paddingHorizontal: spacing.md,
  lineHeight: 56, // Add this - slightly more than fontSize for proper rendering
})

const $surahTransliteration: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $translationCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.lg,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: spacing.lg,
})

const $translationCardText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.text,
  textAlign: "center",
  fontWeight: "500",
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

const $descriptionSubheading: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginTop: spacing.md,
  marginBottom: spacing.xs,
})

const $descriptionText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  lineHeight: 24,
  color: colors.textDim,
  marginBottom: spacing.sm,
})

const $sourceText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  fontStyle: 'italic',
  color: colors.textDim,
  marginTop: spacing.sm,
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
  gap: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 17,
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
