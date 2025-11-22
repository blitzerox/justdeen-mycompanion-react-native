/**
 * Duas List Screen
 *
 * Displays list of duas within a specific category
 * Shows only heading and number - click to view details
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
import { duasApi, DuaCategory, Dua } from "@/services/duas/duasApi"

export const DuasListScreen: React.FC<ReadStackScreenProps<"DuasList">> = ({
  route,
  navigation,
}) => {
  const { categoryId } = route.params
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [category, setCategory] = useState<DuaCategory | null>(null)
  const [duas, setDuas] = useState<Dua[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDuas()
  }, [categoryId])

  // Set header title based on category
  useEffect(() => {
    if (category) {
      navigation.setOptions({
        title: category.name,
      })
    }
  }, [category, navigation])

  const loadDuas = async () => {
    setLoading(true)
    setError(null)

    try {
      // Get category info
      const categoryData = await duasApi.getCategory(categoryId)
      setCategory(categoryData || null)

      // Get duas for this category
      const duasData = await duasApi.getDuasFromCategory(categoryId)
      setDuas(duasData)
    } catch (err) {
      console.error("Error loading Duas:", err)
      setError(err instanceof Error ? err.message : "Failed to load Duas")
    } finally {
      setLoading(false)
    }
  }

  const renderDua = ({ item, index }: { item: Dua; index: number }) => (
    <TouchableOpacity
      style={themed($duaCard)}
      onPress={() => navigation.navigate("DuaDetails", { duaId: item.id })}
      activeOpacity={0.7}
    >
      <View style={themed($duaNumber)}>
        <Text style={themed($duaNumberText)}>{index + 1}</Text>
      </View>
      <View style={themed($duaInfo)}>
        <Text style={themed($duaName)}>{item.name}</Text>
        <Text style={themed($duaArabicName)}>{item.arabicName}</Text>
      </View>
      <Icon icon="caretRight" size={16} color={colors.textDim} />
    </TouchableOpacity>
  )

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Duas...</Text>
        </View>
      </Screen>
    )
  }

  if (error || !category) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Icon icon="x" size={48} color={colors.error} />
          <Text style={themed($errorText)}>{error || "Category not found"}</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      {/* Header */}
      <View style={themed($header)}>
        <Text style={themed($headerTitle)}>{category.name}</Text>
        <Text style={themed($headerArabic)}>{category.arabicName}</Text>
        <Text style={themed($headerSubtitle)}>{category.description}</Text>
        <Text style={themed($headerCount)}>{duas.length} Duas</Text>
      </View>

      {/* Duas List */}
      <FlatList
        data={duas}
        keyExtractor={(item) => item.id}
        renderItem={renderDua}
        contentContainerStyle={themed($listContent)}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={themed($emptyContainer)}>
            <Icon icon="components" size={48} color={colors.textDim} />
            <Text style={themed($emptyText)}>No duas available yet</Text>
            <Text style={themed($emptySubtext)}>
              Duas for this category will be added in future updates
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

const $headerTitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.read,
  marginBottom: spacing.xxs,
})

const $headerArabic: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  color: colors.textDim,
  fontFamily: "uthman",
  marginBottom: spacing.xs,
  textAlign: "left",
})

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
  marginBottom: spacing.xs,
})

const $headerCount: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.read,
  fontWeight: "600",
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
})

const $duaCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.sm,
  gap: spacing.md,
})

const $duaNumber: ThemedStyle<ViewStyle> = ({ colors }) => ({
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: colors.read,
  alignItems: "center",
  justifyContent: "center",
})

const $duaNumberText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  fontWeight: "600",
  color: colors.palette.white,
})

const $duaInfo: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $duaName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $duaArabicName: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  fontFamily: "uthman",
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

const $errorContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: spacing.md,
  paddingHorizontal: spacing.xl,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  textAlign: "center",
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
