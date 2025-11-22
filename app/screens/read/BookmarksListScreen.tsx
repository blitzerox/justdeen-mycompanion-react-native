/**
 * Bookmarks List Screen
 *
 * Displays last 10 bookmarked verses with navigation to QuranReader
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
import { getBookmarkedVerses, type UserProgress } from "@/services/quran/user-progress"
import { quranApi } from "@/services/quran/quranApi"
import { FontAwesome6 } from "@expo/vector-icons"
import { useFocusEffect } from "@react-navigation/native"
import { useCallback } from "react"

export const BookmarksListScreen: React.FC<ReadStackScreenProps<"BookmarksList">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [bookmarks, setBookmarks] = useState<UserProgress[]>([])
  const [surahNames, setSurahNames] = useState<Map<number, string>>(new Map())
  const [loading, setLoading] = useState(true)
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  // Load bookmarks when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks()
    }, [])
  )

  const loadBookmarks = async () => {
    // Only show loading indicator on initial load
    if (isInitialLoad) {
      setLoading(true)
    }
    try {
      // Get last 10 bookmarks
      const data = await getBookmarkedVerses(10)
      setBookmarks(data)

      // Load surah names for display
      const surahs = await quranApi.getSurahs()
      const nameMap = new Map<number, string>()
      surahs.forEach(s => nameMap.set(s.id, s.transliteration))
      setSurahNames(nameMap)
    } catch (error) {
      console.error("Failed to load bookmarks:", error)
    } finally {
      setLoading(false)
      setIsInitialLoad(false)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const renderBookmark = ({ item }: { item: UserProgress }) => {
    const surahName = surahNames.get(item.chapterId) || `Surah ${item.chapterId}`

    return (
      <TouchableOpacity
        style={themed($bookmarkCard)}
        onPress={() => navigation.navigate("QuranReader", {
          surahNumber: item.chapterId,
          ayahNumber: item.verseNumber,
        })}
        activeOpacity={0.7}
      >
        <View style={themed($bookmarkIcon)}>
          <FontAwesome6 name="bookmark" size={16} color={colors.palette.white} solid />
        </View>

        <View style={themed($bookmarkInfo)}>
          <Text style={themed($bookmarkTitle)}>{surahName}</Text>
          <Text style={themed($bookmarkVerse)}>Verse {item.verseNumber}</Text>
          {item.bookmarkedAt && (
            <Text style={themed($bookmarkDate)}>{formatDate(item.bookmarkedAt)}</Text>
          )}
        </View>

        <View style={themed($bookmarkRight)}>
          <Text style={themed($verseKey)}>{item.verseKey}</Text>
          <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
        </View>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Bookmarks...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      <FlatList
        data={bookmarks}
        keyExtractor={(item) => item.verseKey}
        renderItem={renderBookmark}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <FontAwesome6 name="bookmark" size={48} color={colors.textDim} />
            <Text style={themed($emptyTitle)}>No Bookmarks Yet</Text>
            <Text style={themed($emptyText)}>
              Tap the bookmark icon on any verse while reading to save it here
            </Text>
          </View>
        }
        ListHeaderComponent={
          bookmarks.length > 0 ? (
            <Text style={themed($headerText)}>Last {bookmarks.length} Bookmarks</Text>
          ) : null
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
  gap: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
})

const $headerText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: spacing.md,
})

const $bookmarkCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
  gap: spacing.md,
})

const $bookmarkIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $bookmarkInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $bookmarkTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $bookmarkVerse: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  marginBottom: 2,
})

const $bookmarkDate: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $bookmarkRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "flex-end",
  gap: spacing.xs,
})

const $verseKey: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.read,
  fontWeight: "600",
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
  gap: spacing.md,
})

const $emptyTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  textAlign: "center",
  paddingHorizontal: 40,
})
