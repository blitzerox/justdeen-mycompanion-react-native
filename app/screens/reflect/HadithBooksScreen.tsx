/**
 * Hadith Books Screen
 *
 * Displays list of books within a specific Hadith collection
 * Users can navigate to view Hadiths within a book
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
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { hadithApi, HadithCollection, HadithBook } from "@/services/hadith/hadithApi"

export const HadithBooksScreen: React.FC<ReadStackScreenProps<"HadithBooks">> = ({
  navigation,
  route,
}) => {
  const { collectionId } = route.params
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [collection, setCollection] = useState<HadithCollection | null>(null)
  const [books, setBooks] = useState<HadithBook[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBooks()
  }, [collectionId])

  const loadBooks = () => {
    setLoading(true)

    // Get collection info
    const collectionData = hadithApi.getCollection(collectionId)
    setCollection(collectionData || null)

    // Get books
    const booksData = hadithApi.getBooks(collectionId)
    setBooks(booksData)

    setLoading(false)
  }

  const renderBook = ({ item }: { item: HadithBook }) => (
    <TouchableOpacity
      style={themed($bookCard)}
      onPress={() =>
        navigation.navigate("HadithList", {
          collectionId,
          bookId: item.id,
        })
      }
      activeOpacity={0.7}
    >
      <View style={themed($bookLeft)}>
        <View style={themed($bookNumber)}>
          <Text style={themed($bookNumberText)}>{item.number}</Text>
        </View>
        <View style={themed($bookInfo)}>
          <Text style={themed($bookName)}>{item.name}</Text>
          <Text style={themed($bookArabic)}>{item.arabicName}</Text>
        </View>
      </View>

      <View style={themed($bookRight)}>
        <View style={themed($bookMeta)}>
          <Text style={themed($bookMetaText)}>{item.totalHadith} Hadiths</Text>
          <Text style={themed($bookMetaText)}>
            #{item.hadithStart}-{item.hadithEnd}
          </Text>
        </View>
        <Icon icon="caretRight" size={16} color={colors.textDim} />
      </View>
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading books...</Text>
        </View>
      </Screen>
    )
  }

  if (!collection) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Icon icon="x" size={48} color={colors.error} />
          <Text style={themed($errorText)}>Collection not found</Text>
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
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>{collection.name}</Text>
        <Text style={themed($headerArabic)}>{collection.arabicName}</Text>
        <Text style={themed($headerSubtitle)}>{collection.description}</Text>
      </View>

      {/* Books List */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderBook}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Icon icon="components" size={48} color={colors.textDim} />
            <Text style={themed($emptyText)}>No books available yet</Text>
            <Text style={themed($emptySubtext)}>
              Books for this collection will be added in future updates
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

const $headerTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.read,
  marginBottom: spacing.xxs,
})

const $headerArabic: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 22,
  color: colors.textDim,
  fontFamily: "uthman",
  marginBottom: spacing.xs,
  textAlign: "left",
})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
})

const $bookCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
})

const $bookLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
})

const $bookNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $bookNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 16,
  fontWeight: "700",
})

const $bookInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $bookName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $bookArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontFamily: "uthman",
  textAlign: "left",
})

const $bookRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $bookMeta: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $bookMetaText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: 2,
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

const $retryButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read,
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.sm,
  borderRadius: 8,
  marginTop: spacing.sm,
})

const $retryButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 16,
  fontWeight: "600",
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
