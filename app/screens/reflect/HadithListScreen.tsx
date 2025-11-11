/**
 * Hadith List Screen
 *
 * Displays list of Hadiths within a specific book
 * Shows narrator, Arabic text, and English translation
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
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReflectStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { hadithApi, HadithBook, Hadith } from "@/services/hadith/hadithApi"

export const HadithListScreen: React.FC<ReflectStackScreenProps<"HadithList">> = ({
  route,
}) => {
  const { collectionId, bookId } = route.params
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [book, setBook] = useState<HadithBook | null>(null)
  const [hadiths, setHadiths] = useState<Hadith[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadHadiths()
  }, [bookId])

  const loadHadiths = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get book info
      const bookData = hadithApi.getBook(bookId)
      setBook(bookData || null)

      // Get hadiths for this book
      const hadithsData = await hadithApi.getHadithsFromBook(bookId)
      setHadiths(hadithsData)
    } catch (err) {
      console.error("Error loading Hadiths:", err)
      setError(err instanceof Error ? err.message : "Failed to load Hadiths")
    } finally {
      setLoading(false)
    }
  }

  const renderHadith = ({ item }: { item: Hadith }) => (
    <View style={themed($hadithCard)}>
      {/* Hadith Header */}
      <View style={themed($hadithHeader)}>
        <View style={themed($hadithNumber)}>
          <Text style={themed($hadithNumberText)}>#{item.hadithNumber}</Text>
        </View>
        <View style={themed($hadithHeaderRight)}>
          <Text style={themed($narratorText)}>Narrated by {item.narrator}</Text>
          {item.grade && (
            <View
              style={themed($gradeBadge, {
                backgroundColor:
                  item.grade === "Sahih"
                    ? colors.palette.success100
                    : item.grade === "Hassan"
                      ? colors.palette.warning100
                      : colors.palette.neutral200,
              })}
            >
              <Text style={themed($gradeText)}>{item.grade}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Arabic Text */}
      <View style={themed($arabicContainer)}>
        <Text style={themed($arabicText)}>{item.arabicText}</Text>
      </View>

      {/* English Translation */}
      <View style={themed($translationContainer)}>
        <Text style={themed($translationText)}>{item.englishText}</Text>
      </View>

      {/* Reference */}
      <View style={themed($referenceContainer)}>
        <Icon icon="book" size={12} color={colors.textDim} />
        <Text style={themed($referenceText)}>{item.reference}</Text>
      </View>

      {/* Actions */}
      <View style={themed($actions)}>
        <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
          <Icon icon="heart" size={18} color={colors.reflect} />
          <Text style={themed($actionText)}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
          <Icon icon="share" size={18} color={colors.reflect} />
          <Text style={themed($actionText)}>Share</Text>
        </TouchableOpacity>
        <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
          <Icon icon="more" size={18} color={colors.reflect} />
          <Text style={themed($actionText)}>More</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.reflect} />
          <Text style={themed($loadingText)}>Loading Hadiths...</Text>
        </View>
      </Screen>
    )
  }

  if (error || !book) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Icon icon="x" size={48} color={colors.error} />
          <Text style={themed($errorText)}>{error || "Book not found"}</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>Book {book.number}: {book.name}</Text>
        <Text style={themed($headerArabic)}>{book.arabicName}</Text>
      </View>

      {/* Hadiths List */}
      <FlatList
        data={hadiths}
        keyExtractor={(item) => item.id}
        renderItem={renderHadith}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Icon icon="components" size={48} color={colors.textDim} />
            <Text style={themed($emptyText)}>No Hadiths available yet</Text>
            <Text style={themed($emptySubtext)}>
              Hadiths for this book will be added in future updates
            </Text>
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

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.reflect,
  marginBottom: spacing.xxs,
})

const $headerArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
  fontFamily: "uthman",
  textAlign: "left",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
})

const $hadithCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.md,
})

const $hadithHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.sm,
  marginBottom: spacing.md,
})

const $hadithNumber: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.reflect,
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 6,
})

const $hadithNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 12,
  fontWeight: "700",
})

const $hadithHeaderRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  gap: spacing.xxs,
})

const $narratorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "600",
})

const $gradeBadge: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignSelf: "flex-start",
  paddingHorizontal: spacing.xs,
  paddingVertical: 2,
  borderRadius: 4,
})

const $gradeText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  fontWeight: "600",
  color: colors.text,
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
  paddingVertical: spacing.sm,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: colors.palette.neutral200,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  lineHeight: 36,
  color: colors.text,
  fontFamily: "uthman",
  textAlign: "right",
})

const $translationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.md,
})

const $translationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  lineHeight: 24,
  color: colors.text,
})

const $referenceContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginBottom: spacing.sm,
})

const $referenceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontStyle: "italic",
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
  paddingTop: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingVertical: spacing.xxs,
})

const $actionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.reflect,
  fontWeight: "500",
})

const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
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
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
  paddingHorizontal: spacing.xl,
  gap: spacing.sm,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
})

const $emptySubtext: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
})
