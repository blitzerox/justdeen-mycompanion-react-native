/**
 * Hadith Collections Screen
 *
 * Displays list of 6 major Hadith collections (Bukhari, Muslim, etc.)
 * Users can navigate to individual collection books
 * Layout matches QuranHomeScreen with Last Read/Last Bookmark cards
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
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { hadithApi, HadithCollection } from "@/services/hadith/hadithApi"
import { FontAwesome6 } from "@expo/vector-icons"

export const HadithCollectionsScreen: React.FC<ReadStackScreenProps<"HadithCollections">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const insets = useSafeAreaInsets()

  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState<HadithCollection[]>([])
  const [loading, setLoading] = useState(true)

  // Load collections from backend
  React.useEffect(() => {
    const loadCollections = async () => {
      setLoading(true)
      try {
        const data = await hadithApi.getCollections()
        setCollections(data)
      } catch (error) {
        console.error("Failed to load hadith collections:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCollections()
  }, [])

  // Filter collections based on search
  const filteredCollections = collections.filter((collection) => {
    const query = searchQuery.toLowerCase()
    return (
      collection.name.toLowerCase().includes(query) ||
      collection.arabicName.includes(query) ||
      collection.description.toLowerCase().includes(query)
    )
  })

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
      <View style={themed($quickActionIcon)}>
        <FontAwesome6 name={icon} size={18} color={colors.read} solid />
      </View>
      <View style={themed($quickActionInfo)}>
        <Text style={themed($quickActionTitle)}>{title}</Text>
        <Text style={themed($quickActionSubtitle)}>
          {subtitle || "No data yet"}
        </Text>
      </View>
      <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
    </TouchableOpacity>
  )

  const renderCollection = ({ item }: { item: HadithCollection }) => (
    <TouchableOpacity
      style={themed($collectionCard)}
      onPress={() => navigation.navigate("HadithBooks", { collectionId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($collectionLeft)}>
        <View style={themed($collectionNumber)}>
          <Icon icon="book" size={20} color={colors.palette.white} />
        </View>
        <View style={themed($collectionInfo)}>
          <Text style={themed($collectionName)}>{item.arabicName}</Text>
          <Text style={themed($collectionTransliteration)}>{item.name}</Text>
        </View>
      </View>

      <View style={themed($collectionRight)}>
        <Text style={themed($collectionTranslation)}>{item.description}</Text>
        <View style={themed($collectionMeta)}>
          <Text style={themed($collectionMetaText)}>
            {item.totalHadith.toLocaleString()} Hadiths • {item.books} Books
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )

  return (
    <Screen preset="fixed" safeAreaEdges={[]} contentContainerStyle={themed($container)}>
      {/* Quick Action Cards */}
      {!searchQuery && (
        <View style={[themed($quickActionsContainer), { paddingTop: insets.top / 2 }]}>
          {renderQuickActionCard(
            "Last Read",
            null, // TODO: Implement hadith reading tracking
            "book-open",
            () => {}
          )}
          {renderQuickActionCard(
            "Last Bookmark",
            null, // TODO: Implement hadith bookmark tracking
            "bookmark",
            () => {}
          )}
        </View>
      )}

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
        contentContainerStyle={[themed($listContent), { paddingBottom: insets.bottom + spacing.xl }]}
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

const $searchContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
  marginHorizontal: spacing.md,
  marginTop: 0,
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

const $collectionNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $collectionInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $collectionName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $collectionTransliteration: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $collectionRight: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $collectionTranslation: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "500",
  marginBottom: spacing.xxs,
  textAlign: "right",
})

const $collectionMeta: ThemedStyle<ViewStyle> = () => ({})

const $collectionMetaText: ThemedStyle<TextStyle> = ({ colors }) => ({
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
