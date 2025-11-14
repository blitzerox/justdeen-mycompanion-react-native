/**
 * Quran Home Screen
 *
 * Displays list of 114 Surahs or 30 Juz with search functionality
 * Users can navigate to individual Surah/Juz reading screens
 * Shows last read position and last bookmark
 */
import React, { useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Surah } from "@/services/quran/quranApi"
import { FontAwesome6 } from "@expo/vector-icons"
import { useQuranTracking } from "@/hooks/useQuranTracking"

// Juz interface
interface JuzData {
  id: number
  name: string
  nameArabic: string
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
}

// 30 Juz data
const JUZ_DATA: JuzData[] = [
  { id: 1, name: "Juz 1", nameArabic: "الجزء ١", startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { id: 2, name: "Juz 2", nameArabic: "الجزء ٢", startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { id: 3, name: "Juz 3", nameArabic: "الجزء ٣", startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { id: 4, name: "Juz 4", nameArabic: "الجزء ٤", startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { id: 5, name: "Juz 5", nameArabic: "الجزء ٥", startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { id: 6, name: "Juz 6", nameArabic: "الجزء ٦", startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { id: 7, name: "Juz 7", nameArabic: "الجزء ٧", startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { id: 8, name: "Juz 8", nameArabic: "الجزء ٨", startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { id: 9, name: "Juz 9", nameArabic: "الجزء ٩", startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { id: 10, name: "Juz 10", nameArabic: "الجزء ١٠", startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { id: 11, name: "Juz 11", nameArabic: "الجزء ١١", startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { id: 12, name: "Juz 12", nameArabic: "الجزء ١٢", startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { id: 13, name: "Juz 13", nameArabic: "الجزء ١٣", startSurah: 12, startAyah: 53, endSurah: 15, endAyah: 1 },
  { id: 14, name: "Juz 14", nameArabic: "الجزء ١٤", startSurah: 15, startAyah: 2, endSurah: 16, endAyah: 128 },
  { id: 15, name: "Juz 15", nameArabic: "الجزء ١٥", startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { id: 16, name: "Juz 16", nameArabic: "الجزء ١٦", startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { id: 17, name: "Juz 17", nameArabic: "الجزء ١٧", startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { id: 18, name: "Juz 18", nameArabic: "الجزء ١٨", startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { id: 19, name: "Juz 19", nameArabic: "الجزء ١٩", startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { id: 20, name: "Juz 20", nameArabic: "الجزء ٢٠", startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { id: 21, name: "Juz 21", nameArabic: "الجزء ٢١", startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { id: 22, name: "Juz 22", nameArabic: "الجزء ٢٢", startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { id: 23, name: "Juz 23", nameArabic: "الجزء ٢٣", startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { id: 24, name: "Juz 24", nameArabic: "الجزء ٢٤", startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { id: 25, name: "Juz 25", nameArabic: "الجزء ٢٥", startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { id: 26, name: "Juz 26", nameArabic: "الجزء ٢٦", startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { id: 27, name: "Juz 27", nameArabic: "الجزء ٢٧", startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { id: 28, name: "Juz 28", nameArabic: "الجزء ٢٨", startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { id: 29, name: "Juz 29", nameArabic: "الجزء ٢٩", startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { id: 30, name: "Juz 30", nameArabic: "الجزء ٣٠", startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
]

type ViewMode = "surah" | "juz"

export const QuranHomeScreen: React.FC<ReadStackScreenProps<"QuranHome">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const { lastReadPosition, bookmarks } = useQuranTracking()

  const [viewMode, setViewMode] = useState<ViewMode>("surah")
  const [searchQuery, setSearchQuery] = useState("")
  const [surahs] = useState<Surah[]>(quranApi.getSurahs())
  const [juzList] = useState<JuzData[]>(JUZ_DATA)

  // Set header right button
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => setViewMode(viewMode === "surah" ? "juz" : "surah")}
          style={{ padding: 8 }}
        >
          <FontAwesome6
            name={viewMode === "surah" ? "book-quran" : "list"}
            size={20}
            color={colors.read}
          />
        </TouchableOpacity>
      ),
    })
  }, [navigation, viewMode, colors.read])

  // Filter surahs based on search
  const filteredSurahs = surahs.filter((surah) => {
    const query = searchQuery.toLowerCase()
    return (
      surah.name.includes(query) ||
      surah.transliteration.toLowerCase().includes(query) ||
      surah.translation.toLowerCase().includes(query) ||
      surah.id.toString().includes(query)
    )
  })

  // Filter juz based on search
  const filteredJuz = juzList.filter((juz) => {
    const query = searchQuery.toLowerCase()
    return (
      juz.name.toLowerCase().includes(query) ||
      juz.nameArabic.includes(query) ||
      juz.id.toString().includes(query)
    )
  })

  // Get last read Surah info
  const getLastReadSurah = () => {
    if (!lastReadPosition.surahNumber) return null
    const surah = surahs.find((s) => s.id === lastReadPosition.surahNumber)
    return surah ? `${surah.transliteration} ${lastReadPosition.ayahNumber}` : null
  }

  // Get last bookmark info
  const getLastBookmark = () => {
    if (bookmarks.length === 0) return null
    const lastBookmark = bookmarks[bookmarks.length - 1]
    const surah = surahs.find((s) => s.id === lastBookmark.surahNumber)
    return surah ? `${surah.transliteration} ${lastBookmark.ayahNumber}` : null
  }

  const renderQuickActionCard = (
    title: string,
    subtitle: string | null,
    icon: string,
    onPress: () => void
  ) => (
    <TouchableOpacity
      style={themed($quickActionCard)}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!subtitle}
    >
      <View style={themed($quickActionIcon(colors))}>
        <FontAwesome6 name={icon} size={18} color={colors.read} solid />
      </View>
      <View style={themed($quickActionInfo)}>
        <Text style={themed($quickActionTitle(colors))}>{title}</Text>
        <Text style={themed($quickActionSubtitle(colors))}>
          {subtitle || "No data yet"}
        </Text>
      </View>
      <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
    </TouchableOpacity>
  )

  const renderSurah = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={themed($surahCard)}
      onPress={() => navigation.navigate("SurahDetails", { surahNumber: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($surahLeft)}>
        <View style={themed($surahNumber)}>
          <Text style={themed($surahNumberText)}>{item.id}</Text>
        </View>
        <View style={themed($surahInfo)}>
          <Text style={themed($surahName)}>{item.name}</Text>
          <Text style={themed($surahTransliteration)}>{item.transliteration}</Text>
        </View>
      </View>

      <View style={themed($surahRight)}>
        <Text style={themed($surahTranslation)}>{item.translation}</Text>
        <View style={themed($surahMeta)}>
          <Text style={themed($surahMetaText)}>
            {item.type === "meccan" ? "Meccan" : "Medinan"} • {item.totalVerses} verses
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  const renderJuz = ({ item }: { item: JuzData }) => {
    const startSurah = surahs.find((s) => s.id === item.startSurah)
    const endSurah = surahs.find((s) => s.id === item.endSurah)

    return (
      <TouchableOpacity
        style={themed($surahCard)}
        onPress={() => navigation.navigate("JuzReader", { juzNumber: item.id })}
        activeOpacity={0.7}
      >
        <View style={themed($surahLeft)}>
          <View style={themed($surahNumber)}>
            <Text style={themed($surahNumberText)}>{item.id}</Text>
          </View>
          <View style={themed($surahInfo)}>
            <Text style={themed($surahName)}>{item.nameArabic}</Text>
            <Text style={themed($surahTransliteration)}>{item.name}</Text>
          </View>
        </View>

        <View style={themed($surahRight)}>
          {startSurah && endSurah && (
            <>
              <Text style={themed($surahTranslation)}>
                {startSurah.transliteration} - {endSurah.transliteration}
              </Text>
              <View style={themed($surahMeta)}>
                <Text style={themed($surahMetaText)}>
                  {item.startSurah}:{item.startAyah} - {item.endSurah}:{item.endAyah}
                </Text>
              </View>
            </>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const lastReadText = getLastReadSurah()
  const lastBookmarkText = getLastBookmark()

  return (
    <Screen preset="fixed" safeAreaEdges={["top", "bottom"]} contentContainerStyle={themed($container)}>
      {/* Quick Action Cards */}
      {!searchQuery && (
        <View style={themed($quickActionsContainer)}>
          {renderQuickActionCard(
            "Continue Reading",
            lastReadText,
            "book-open",
            () => {
              if (lastReadPosition.surahNumber) {
                navigation.navigate("QuranReader", {
                  surahNumber: lastReadPosition.surahNumber,
                  startAyah: lastReadPosition.ayahNumber || 1,
                })
              }
            }
          )}
          {renderQuickActionCard(
            "Last Bookmark",
            lastBookmarkText,
            "bookmark",
            () => {
              if (bookmarks.length > 0) {
                const lastBookmark = bookmarks[bookmarks.length - 1]
                navigation.navigate("QuranReader", {
                  surahNumber: lastBookmark.surahNumber,
                  startAyah: lastBookmark.ayahNumber,
                })
              }
            }
          )}
        </View>
      )}

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder={viewMode === "surah" ? "Search Surah name, number..." : "Search Juz number..."}
          placeholderTextColor={colors.textDim}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Icon icon="x" size={20} color={colors.textDim} />
          </TouchableOpacity>
        )}
      </View>

      {/* List - Surahs or Juz */}
      {viewMode === "surah" ? (
        <FlatList
          data={filteredSurahs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderSurah}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={themed($emptyContainer)}>
              <Text style={themed($emptyText)}>No Surahs found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredJuz}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderJuz}
          contentContainerStyle={themed($listContent)}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={themed($emptyContainer)}>
              <Text style={themed($emptyText)}>No Juz found</Text>
            </View>
          }
        />
      )}
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.md,
  marginTop: spacing.sm,
  marginBottom: spacing.md,
  borderRadius: 12,
  gap: spacing.sm,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 16,
  color: colors.text,
  paddingVertical: 8,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingBottom: spacing.xl,
})

const $surahCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
})

const $surahLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
})

const $surahNumber: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $surahNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 16,
  fontWeight: "700",
})

const $surahInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $surahName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $surahTransliteration: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $surahRight: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $surahTranslation: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "500",
  marginBottom: spacing.xxs,
  textAlign: "right",
})

const $surahMeta: ThemedStyle<ViewStyle> = () => ({})

const $surahMetaText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
})

const $emptyContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: spacing.xxl,
})

const $emptyText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

// Quick Action Card Styles
const $quickActionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  marginBottom: spacing.sm,
})

const $quickActionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.sm,
  borderRadius: 12,
  gap: spacing.sm,
})

const $quickActionIcon: ThemedStyle<ViewStyle> = (colors) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read + "20",
  alignItems: "center",
  justifyContent: "center",
})

const $quickActionInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $quickActionTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $quickActionSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textDim,
})
