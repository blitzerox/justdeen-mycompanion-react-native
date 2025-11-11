/**
 * Duas Categories Screen
 *
 * Displays categories of Islamic supplications (duas)
 * Users can navigate to view duas within each category
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
import type { ReflectStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { duasApi, DuaCategory } from "@/services/duas/duasApi"

export const DuasCategoriesScreen: React.FC<ReflectStackScreenProps<"DuasCategories">> = ({
  navigation,
}) => {
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [categories] = useState<DuaCategory[]>(duasApi.getCategories())

  // Filter categories based on search
  const filteredCategories = categories.filter((category) => {
    const query = searchQuery.toLowerCase()
    return (
      category.name.toLowerCase().includes(query) ||
      category.arabicName.includes(query) ||
      category.description.toLowerCase().includes(query)
    )
  })

  const renderCategory = ({ item }: { item: DuaCategory }) => (
    <TouchableOpacity
      style={themed($categoryCard)}
      onPress={() => navigation.navigate("DuasList", { categoryId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($categoryLeft)}>
        <View style={themed($categoryIcon)}>
          <Icon icon={item.icon as any} size={28} color={colors.palette.white} />
        </View>
        <View style={themed($categoryInfo)}>
          <Text style={themed($categoryName)}>{item.name}</Text>
          <Text style={themed($categoryArabic)}>{item.arabicName}</Text>
          <Text style={themed($categoryDescription)} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>

      <View style={themed($categoryRight)}>
        <View style={themed($duasCount)}>
          <Text style={themed($duasCountText)}>{item.duasCount}</Text>
          <Text style={themed($duasCountLabel)}>Duas</Text>
        </View>
        <Icon icon="caretRight" size={16} color={colors.textDim} />
      </View>
    </TouchableOpacity>
  )

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>Duas & Adhkar</Text>
        <Text style={themed($headerSubtitle)}>
          Supplications for daily life and special occasions
        </Text>
      </View>

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder="Search categories..."
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
        contentContainerStyle={themed($listContent)}
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

const $header: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $headerTitle: ThemedStyle<TextStyle> = ({ colors }) => ({
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

const $categoryCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.md,
})

const $categoryLeft: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "flex-start",
  gap: spacing.md,
  flex: 1,
})

const $categoryIcon: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: colors.reflect,
  alignItems: "center",
  justifyContent: "center",
})

const $categoryInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $categoryName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $categoryArabic: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  color: colors.textDim,
  fontFamily: "uthman",
  textAlign: "left",
  marginBottom: spacing.xs,
})

const $categoryDescription: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  lineHeight: 18,
})

const $categoryRight: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
})

const $duasCount: ThemedStyle<ViewStyle> = () => ({
  alignItems: "center",
})

const $duasCountText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 20,
  fontWeight: "700",
  color: colors.reflect,
})

const $duasCountLabel: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  color: colors.textDim,
  fontWeight: "500",
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
