/**
 * Quran Home Screen
 *
 * Displays list of 114 Surahs with search functionality
 * Users can navigate to individual Surah reading screens
 */
import React, { useState } from "react"
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

export const QuranHomeScreen: React.FC<ReadStackScreenProps<"QuranHome">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [surahs] = useState<Surah[]>(quranApi.getSurahs())

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

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder="Search Surah name, number..."
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

      {/* Surahs List */}
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
