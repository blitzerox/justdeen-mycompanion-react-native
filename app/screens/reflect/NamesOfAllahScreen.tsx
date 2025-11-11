/**
 * 99 Names of Allah Screen (Asma ul-Husna)
 *
 * Displays all 99 Beautiful Names of Allah with meanings
 * Grid layout with expandable cards for descriptions
 */
import React, { useState } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  FlatList,
  TouchableOpacity,
  TextInput,
  Dimensions,
} from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReflectStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { namesApi, AllahName } from "@/services/names/namesApi"

const { width } = Dimensions.get("window")
const CARD_WIDTH = (width - 48) / 2 // 2 columns with padding

export const NamesOfAllahScreen: React.FC<ReflectStackScreenProps<"NamesOfAllah">> = () => {
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [searchQuery, setSearchQuery] = useState("")
  const [names] = useState<AllahName[]>(namesApi.getNames())
  const [expandedId, setExpandedId] = useState<number | null>(null)

  // Filter names based on search
  const filteredNames = searchQuery
    ? namesApi.searchNames(searchQuery)
    : names

  const toggleExpanded = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderName = ({ item }: { item: AllahName }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity
        style={themed($nameCard, { width: isExpanded ? width - 32 : CARD_WIDTH })}
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.7}
      >
        {/* Number Badge */}
        <View style={themed($numberBadge)}>
          <Text style={themed($numberText)}>{item.id}</Text>
        </View>

        {/* Arabic Name */}
        <Text style={themed($arabicName)}>{item.name}</Text>

        {/* Transliteration */}
        <Text style={themed($transliteration)}>{item.transliteration}</Text>

        {/* Meaning */}
        <Text style={themed($meaning)}>{item.meaning}</Text>

        {/* Expanded Description */}
        {isExpanded && item.description && (
          <>
            <View style={themed($divider)} />
            <Text style={themed($description)}>{item.description}</Text>
          </>
        )}

        {/* Expand Indicator */}
        {item.description && (
          <View style={themed($expandIndicator)}>
            <Icon
              icon={isExpanded ? "caretUp" : "caretDown"}
              size={12}
              color={colors.textDim}
            />
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>Asma ul-Husna</Text>
        <Text style={themed($headerSubtitle)}>The 99 Beautiful Names of Allah</Text>
      </View>

      {/* Search Bar */}
      <View style={themed($searchContainer)}>
        <Icon icon="search" size={20} color={colors.textDim} />
        <TextInput
          style={themed($searchInput)}
          placeholder="Search names or meanings..."
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

      {/* Names Grid */}
      <FlatList
        data={filteredNames}
        key={expandedId ? "expanded" : "grid"} // Force re-render on expand
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderName}
        numColumns={expandedId ? 1 : 2}
        columnWrapperStyle={expandedId ? undefined : themed($row)}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Icon icon="search" size={48} color={colors.textDim} />
            <Text style={themed($emptyText)}>No names found</Text>
            <Text style={themed($emptySubtext)}>
              Try searching with different keywords
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

const $row: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  justifyContent: "space-between",
  marginBottom: spacing.sm,
})

const $nameCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
  minHeight: 150,
  position: "relative",
})

const $numberBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  position: "absolute",
  top: spacing.xs,
  right: spacing.xs,
  backgroundColor: colors.reflect,
  width: 24,
  height: 24,
  borderRadius: 12,
  alignItems: "center",
  justifyContent: "center",
})

const $numberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 11,
  fontWeight: "700",
  color: colors.palette.white,
})

const $arabicName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 28,
  fontFamily: "uthman",
  color: colors.text,
  textAlign: "center",
  marginBottom: spacing.xs,
})

const $transliteration: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 15,
  fontWeight: "600",
  color: colors.reflect,
  textAlign: "center",
  marginBottom: spacing.xxs,
})

const $meaning: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.textDim,
  textAlign: "center",
})

const $divider: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  height: 1,
  backgroundColor: colors.palette.neutral200,
  marginVertical: spacing.sm,
})

const $description: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  lineHeight: 20,
  color: colors.text,
  textAlign: "left",
})

const $expandIndicator: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  marginTop: spacing.xs,
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
