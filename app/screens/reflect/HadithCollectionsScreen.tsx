/**
 * Hadith Collections Screen
 *
 * Displays list of 6 major Hadith collections (Bukhari, Muslim, etc.)
 * Users can navigate to individual collection books
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
import { hadithApi, HadithCollection } from "@/services/hadith/hadithApi"

export const HadithCollectionsScreen: React.FC<ReadStackScreenProps<"HadithCollections">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [collections] = useState<HadithCollection[]>(hadithApi.getCollections())

  // Filter collections based on search
  const filteredCollections = collections.filter((collection) => {
    const query = searchQuery.toLowerCase()
    return (
      collection.name.toLowerCase().includes(query) ||
      collection.arabicName.includes(query) ||
      collection.description.toLowerCase().includes(query)
    )
  })

  const renderCollection = ({ item }: { item: HadithCollection }) => (
    <TouchableOpacity
      style={themed($collectionCard)}
      onPress={() => navigation.navigate("HadithBooks", { collectionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($collectionLeft)}>
        <View style={themed($collectionIcon)}>
          <Icon icon="book" size={24} color={colors.palette.white} />
        </View>
        <View style={themed($collectionInfo)}>
          <Text style={themed($collectionName)}>{item.name}</Text>
          <Text style={themed($collectionArabic)}>{item.arabicName}</Text>
        </View>
      </View>

      <View style={themed($collectionRight)}>
        <View style={themed($collectionMeta)}>
          <Text style={themed($collectionMetaText)}>{item.totalHadith.toLocaleString()} Hadiths</Text>
          <Text style={themed($collectionMetaText)}>{item.books} Books</Text>
        </View>
        <Icon icon="caretRight" size={16} color={colors.textDim} />
      </View>
    </TouchableOpacity>
  )

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>Hadith Collections</Text>
        <Text style={themed($headerSubtitle)}>
          Explore authentic collections of Prophet Muhammad's (ﷺ) sayings
        </Text>
      </View>

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder="Search collection name..."
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

      {/* Collections List */}
      <FlatList
        data={filteredCollections}
        keyExtractor={(item) => item.id}
        renderItem={renderCollection}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No collections found</Text>
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
  fontSize: 28,
  fontWeight: "700",
  color: colors.reflect,
  marginBottom: spacing.xxs,
})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
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

const $collectionCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
})

const $collectionLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
})

const $collectionIcon: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.reflect,
  alignItems: "center",
  justifyContent: "center",
})

const $collectionInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $collectionName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $collectionArabic: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  color: colors.textDim,
  fontFamily: "uthman",
  textAlign: "left",
})

const $collectionRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $collectionMeta: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $collectionMetaText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  marginBottom: 2,
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
