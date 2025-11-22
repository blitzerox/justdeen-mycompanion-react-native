/**
 * Tafsir Home Screen
 *
 * Displays list of 114 Surahs for selecting tafsir commentary
 * Users can navigate to view tafsir for each surah
 */
import React, { useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { quranApi, Surah } from "@/services/quran/quranApi"
import { FontAwesome6 } from "@expo/vector-icons"

export const TafsirHomeScreen: React.FC<ReadStackScreenProps<"TafsirHome">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const insets = useSafeAreaInsets()

  const [searchQuery, setSearchQuery] = useState("")
  const [surahs, setSurahs] = useState<Surah[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load surahs from API
  useEffect(() => {
    const loadSurahs = async () => {
      try {
        setIsLoading(true)
        const data = await quranApi.getSurahs()
        setSurahs(data)
      } catch (error) {
        console.error('Failed to load surahs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadSurahs()
  }, [])

  // Filter surahs based on search
  const filteredSurahs = surahs.filter((surah) => {
    const query = searchQuery.toLowerCase()
    return (
      surah.transliteration.toLowerCase().includes(query) ||
      surah.name.includes(query) ||
      surah.translation.toLowerCase().includes(query) ||
      surah.id.toString() === query
    )
  })

  const renderSurah = ({ item }: { item: Surah }) => (
    <TouchableOpacity
      style={themed($surahCard)}
      onPress={() => navigation.navigate("TafsirReader", { surahId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($surahLeft)}>
        <View style={themed($surahNumber)}>
          <Text style={themed($surahNumberText)}>{item.id}</Text>
        </View>
        <View style={themed($surahInfo)}>
          <Text style={themed($surahName)}>{item.transliteration}</Text>
          <Text style={themed($surahTranslation)}>{item.translation}</Text>
        </View>
      </View>

      <View style={themed($surahRight)}>
        <Text style={themed($surahArabic)}>{item.name}</Text>
        <Text style={themed($surahMeta)}>
          {item.totalVerses} Ayahs • {item.type}
        </Text>
      </View>
    </TouchableOpacity>
  )

  if (isLoading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Surahs...</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={themed($container)}>
      {/* Quick Action Cards */}
      {!searchQuery && (
        <View style={[themed($quickActionsContainer), { paddingTop: insets.top / 2 }]}>
          <TouchableOpacity
            style={themed($quickActionCard)}
            activeOpacity={0.7}
            disabled
          >
            <View style={themed($quickActionIcon)}>
              <FontAwesome6 name="book-open" size={18} color={colors.read} solid />
            </View>
            <View style={themed($quickActionInfo)}>
              <Text style={themed($quickActionTitle)}>Last Read</Text>
              <Text style={themed($quickActionSubtitle)}>No data yet</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
          </TouchableOpacity>

          <TouchableOpacity
            style={themed($quickActionCard)}
            activeOpacity={0.7}
            disabled
          >
            <View style={themed($quickActionIcon)}>
              <FontAwesome6 name="bookmark" size={18} color={colors.read} solid />
            </View>
            <View style={themed($quickActionInfo)}>
              <Text style={themed($quickActionTitle)}>Last Bookmark</Text>
              <Text style={themed($quickActionSubtitle)}>No data yet</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder="Search surah name or number..."
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

      {/* Tafsir Info */}
      <View style={themed($tafsirInfoContainer)}>
        <FontAwesome6 name="circle-info" size={14} color={colors.read} />
        <Text style={themed($tafsirInfoText)}>
          Tafsir Ibn Kathir (English)
        </Text>
      </View>

      {/* Surahs List */}
      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderSurah}
        contentContainerStyle={[themed($listContent), { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No surahs found</Text>
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
  gap: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  color: colors.textDim,
})

const $quickActionsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  gap: spacing.sm,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.md,
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

const $quickActionIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
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

const $quickActionTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $quickActionSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
})

const $searchContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.md,
  marginBottom: spacing.sm,
  borderRadius: 12,
  gap: spacing.sm,
})

const $searchInput: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 16,
  color: colors.text,
  paddingVertical: 8,
})

const $tafsirInfoContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  paddingHorizontal: spacing.md,
  marginBottom: spacing.sm,
})

const $tafsirInfoText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.read,
  fontWeight: "500",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
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

const $surahNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $surahNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 14,
  fontWeight: "700",
})

const $surahInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $surahName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $surahTranslation: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
})

const $surahRight: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $surahArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  color: colors.text,
  fontFamily: "uthman",
  marginBottom: 4,
})

const $surahMeta: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
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
