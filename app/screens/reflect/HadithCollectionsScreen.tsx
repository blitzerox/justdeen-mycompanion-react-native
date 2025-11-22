/**
 * Hadith Collections Screen
 *
 * Displays list of 6 major Hadith collections (Bukhari, Muslim, etc.)
 * Users can navigate to individual collection books
 * Layout matches QuranHomeScreen with Last Read/Last Bookmark cards
 */
import React, { useState, useEffect, useCallback } from "react"
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
import { hadithApi, HadithCollection } from "@/services/hadith/hadithApi"
import { hadithDownloadService, DownloadProgress } from "@/services/hadith/hadithDownloadService"
import { FontAwesome6 } from "@expo/vector-icons"

export const HadithCollectionsScreen: React.FC<ReadStackScreenProps<"HadithCollections">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const insets = useSafeAreaInsets()

  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState<HadithCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [downloadProgress, setDownloadProgress] = useState<Map<string, DownloadProgress>>(new Map())

  // Load collections from backend
  useEffect(() => {
    const loadCollections = async () => {
      setLoading(true)
      try {
        const data = await hadithApi.getCollections()
        setCollections(data)

        // Initialize download progress for each collection
        const initialProgress = new Map<string, DownloadProgress>()
        data.forEach(collection => {
          initialProgress.set(collection.id, hadithDownloadService.getDownloadProgress(collection.id))
        })
        setDownloadProgress(initialProgress)
      } catch (error) {
        console.error("Failed to load hadith collections:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCollections()
  }, [])

  // Subscribe to download progress updates
  useEffect(() => {
    const unsubscribes: (() => void)[] = []

    collections.forEach(collection => {
      const unsubscribe = hadithDownloadService.subscribe(collection.id, (progress) => {
        setDownloadProgress(prev => {
          const newMap = new Map(prev)
          newMap.set(collection.id, progress)
          return newMap
        })
      })
      unsubscribes.push(unsubscribe)
    })

    return () => {
      unsubscribes.forEach(unsub => unsub())
    }
  }, [collections])

  const handleDownload = useCallback((collectionId: string) => {
    hadithDownloadService.downloadCollection(collectionId)
  }, [])

  const handleDelete = useCallback((collectionId: string) => {
    hadithDownloadService.deleteCollection(collectionId)
  }, [])

  const handleClearCache = useCallback(() => {
    hadithApi.clearCache()
    console.log("🧹 Cleared hadith API cache")
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

  const renderCollection = ({ item }: { item: HadithCollection }) => {
    const progress = downloadProgress.get(item.id) || { status: "idle", progress: 0 }
    const isDownloaded = progress.status === "completed"
    const isDownloading = progress.status === "downloading"

    return (
      <View style={themed($collectionCard)}>
        <TouchableOpacity
          style={themed($collectionContent)}
          onPress={() => navigation.navigate("HadithBooks", { collectionId: item.id })}
          activeOpacity={0.7}
        >
          <View style={themed($collectionHeader)}>
            <View style={themed($collectionNumber)}>
              <Icon icon="book" size={20} color={colors.palette.white} />
            </View>
            <View style={themed($collectionInfo)}>
              <Text style={themed($collectionName)}>{item.arabicName}</Text>
              <Text style={themed($collectionTransliteration)}>{item.name}</Text>
            </View>
            <FontAwesome6 name="chevron-right" size={14} color={colors.textDim} />
          </View>

          <Text style={themed($collectionDescription)} numberOfLines={2}>
            {item.description}
          </Text>
          <Text style={themed($collectionMetaText)}>
            {item.totalHadith.toLocaleString()} Hadiths • {item.books} Books
          </Text>
        </TouchableOpacity>

        {/* Download Section */}
        <View style={themed($downloadSection)}>
          {isDownloading ? (
            <View style={themed($downloadingContainer)}>
              <View style={themed($progressBarContainer)}>
                <View style={[themed($progressBar), { width: `${progress.progress}%` }]} />
              </View>
              <Text style={themed($downloadProgressText)}>
                {progress.currentBook}/{progress.totalBooks} books • {progress.progress}%
              </Text>
            </View>
          ) : isDownloaded ? (
            <TouchableOpacity
              style={themed($downloadedButton)}
              onPress={() => handleDelete(item.id)}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="check-circle" size={16} color={colors.palette.success500} solid />
              <Text style={themed($downloadedText)}>Downloaded</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={themed($downloadButton)}
              onPress={() => handleDownload(item.id)}
              activeOpacity={0.7}
            >
              <FontAwesome6 name="download" size={14} color={colors.read} />
              <Text style={themed($downloadButtonText)}>Download</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    )
  }

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

      {/* Debug: Clear Cache Button */}
      <TouchableOpacity
        style={themed($clearCacheButton)}
        onPress={handleClearCache}
        activeOpacity={0.7}
      >
        <FontAwesome6 name="trash" size={12} color={colors.error} />
        <Text style={themed($clearCacheText)}>Clear API Cache (Debug)</Text>
      </TouchableOpacity>

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
  backgroundColor: colors.palette.neutral100,
  borderRadius: 12,
  marginBottom: spacing.sm,
  overflow: "hidden",
})

const $collectionContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  gap: spacing.sm,
})

const $collectionHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
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

const $collectionDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.text,
  lineHeight: 20,
})

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

// Download styles
const $downloadSection: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
  paddingHorizontal: spacing.md,
  paddingVertical: spacing.sm,
})

const $downloadButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  paddingVertical: spacing.xs,
})

const $downloadButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.read,
})

const $downloadedButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  paddingVertical: spacing.xs,
})

const $downloadedText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.palette.success500,
})

const $downloadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  gap: spacing.xs,
})

const $progressBarContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: 4,
  backgroundColor: colors.palette.neutral200,
  borderRadius: 2,
  overflow: "hidden",
})

const $progressBar: ThemedStyle<ViewStyle> = ({ colors }) => ({
  height: "100%",
  backgroundColor: colors.read,
  borderRadius: 2,
})

const $downloadProgressText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
  textAlign: "center",
})

// Debug styles
const $clearCacheButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.xs,
  marginHorizontal: spacing.md,
  marginBottom: spacing.sm,
  paddingVertical: spacing.xs,
  backgroundColor: colors.error + "10",
  borderRadius: 8,
})

const $clearCacheText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.error,
  fontWeight: "500",
})
