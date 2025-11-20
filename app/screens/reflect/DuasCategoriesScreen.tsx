/**
 * Duas Categories Screen
 *
 * Displays categories of duas (Morning Adhkar, Evening Adhkar, etc.)
 * Users can navigate to view duas within each category
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
import { duasApi, DuaCategory } from "@/services/duas/duasApi"
import { FontAwesome6 } from "@expo/vector-icons"

export const DuasCategoriesScreen: React.FC<ReadStackScreenProps<"DuasCategories">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()
  const insets = useSafeAreaInsets()

  const [searchQuery, setSearchQuery] = useState("")
  const [categories, setCategories] = useState<DuaCategory[]>([])
  const [loading, setLoading] = useState(true)

  // Load categories from backend
  React.useEffect(() => {
    const loadCategories = async () => {
      setLoading(true)
      try {
        const data = await duasApi.getCategories()
        setCategories(data)
      } catch (error) {
        console.error("Failed to load dua categories:", error)
      } finally {
        setLoading(false)
      }
    }
    loadCategories()
  }, [])

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase()
    return (
      category.name.toLowerCase().includes(query) ||
      category.arabicName.includes(query) ||
      category.description.toLowerCase().includes(query)
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

  const renderCategory = ({ item }: { item: DuaCategory }) => (
    <TouchableOpacity
      style={themed($categoryCard)}
      onPress={() => navigation.navigate("DuasList", { categoryId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($categoryLeft)}>
        <View style={themed($categoryNumber)}>
          <Icon icon={item.icon as any} size={20} color={colors.palette.white} />
        </View>
        <View style={themed($categoryInfo)}>
          <Text style={themed($categoryName)}>{item.arabicName}</Text>
          <Text style={themed($categoryTransliteration)}>{item.name}</Text>
        </View>
      </View>

      <View style={themed($categoryRight)}>
        <Text style={themed($categoryTranslation)}>{item.description}</Text>
        <View style={themed($categoryMeta)}>
          <Text style={themed($categoryMetaText)}>
            {item.duasCount} Duas
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
            null, // TODO: Implement dua reading tracking
            "book-open",
            () => {}
          )}
          {renderQuickActionCard(
            "Last Bookmark",
            null, // TODO: Implement dua bookmark tracking
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
          placeholder="Search category name..."
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

      {/* Categories List */}
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={[themed($listContent), { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Text style={themed($emptyText)}>No categories found</Text>
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

const $categoryCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
})

const $categoryLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.md,
  flex: 1,
})

const $categoryNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 40,
  height: 40,
  borderRadius: 20,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $categoryInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $categoryName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 2,
})

const $categoryTransliteration: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $categoryRight: ThemedStyle<ViewStyle> = () => ({
  alignItems: "flex-end",
})

const $categoryTranslation: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.text,
  fontWeight: "500",
  marginBottom: spacing.xxs,
  textAlign: "right",
})

const $categoryMeta: ThemedStyle<ViewStyle> = () => ({})

const $categoryMetaText: ThemedStyle<TextStyle> = ({ colors }) => ({
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
