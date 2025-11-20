/**
 * Duas List Screen
 *
 * Displays list of duas within a specific category
 * Shows Arabic text, transliteration, and translation
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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
      const categoryData = duasApi.getCategory(categoryId)
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

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const renderDua = ({ item }: { item: Dua }) => {
    const isExpanded = expandedId === item.id

    return (
      <TouchableOpacity
        style={themed($duaCard)}
        onPress={() => toggleExpanded(item.id)}
        activeOpacity={0.7}
      >
        {/* Dua Header */}
        <View style={themed($duaHeader)}>
          <View style={themed($duaHeaderLeft)}>
            <Text style={themed($duaName)}>{item.name}</Text>
            {item.occasion && (
              <Text style={themed($occasionText)}>{item.occasion}</Text>
            )}
          </View>
          <Icon
            icon={isExpanded ? "caretUp" : "caretDown"}
            size={20}
            color={colors.textDim}
          />
        </View>

        {/* Arabic Text (Always Visible) */}
        <View style={themed($arabicContainer)}>
          <Text style={themed($arabicText)}>{item.arabicText}</Text>
        </View>

        {/* Expanded Content */}
        {isExpanded && (
          <>
            {/* Transliteration */}
            <View style={themed($transliterationContainer)}>
              <Text style={themed($sectionLabel)}>Transliteration:</Text>
              <Text style={themed($transliterationText)}>{item.transliteration}</Text>
            </View>

            {/* English Translation */}
            <View style={themed($translationContainer)}>
              <Text style={themed($sectionLabel)}>Translation:</Text>
              <Text style={themed($translationText)}>{item.englishTranslation}</Text>
            </View>

            {/* Reference */}
            {item.reference && (
              <View style={themed($referenceContainer)}>
                <Icon icon="book" size={12} color={colors.textDim} />
                <Text style={themed($referenceText)}>{item.reference}</Text>
              </View>
            )}

            {/* Benefits */}
            {item.benefits && (
              <View style={themed($benefitsContainer)}>
                <Text style={themed($sectionLabel)}>Benefits:</Text>
                <Text style={themed($benefitsText)}>{item.benefits}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={themed($actions)}>
              <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
                <Icon icon="heart" size={18} color={colors.read} />
                <Text style={themed($actionText)}>Save</Text>
              </TouchableOpacity>
              {item.audioUrl && (
                <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
                  <Icon icon="play" size={18} color={colors.read} />
                  <Text style={themed($actionText)}>Listen</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
                <Icon icon="share" size={18} color={colors.read} />
                <Text style={themed($actionText)}>Share</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </TouchableOpacity>
    )
  }

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

const $headerSubtitle: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  color: colors.textDim,
  lineHeight: 20,
})

const $listContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.md,
  paddingTop: spacing.sm,
  paddingBottom: spacing.xl,
})

const $duaCard: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginBottom: spacing.md,
})

const $duaHeader: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: spacing.sm,
})

const $duaHeaderLeft: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $duaName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  marginBottom: spacing.xxs,
})

const $occasionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.read,
  fontWeight: "500",
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingVertical: spacing.sm,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 22,
  lineHeight: 40,
  color: colors.text,
  fontFamily: "uthman",
  textAlign: "right",
})

const $transliterationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  paddingTop: spacing.sm,
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  fontWeight: "600",
  color: colors.textDim,
  textTransform: "uppercase",
  marginBottom: spacing.xxs,
})

const $transliterationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  lineHeight: 24,
  color: colors.text,
  fontStyle: "italic",
})

const $translationContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
})

const $translationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 15,
  lineHeight: 24,
  color: colors.text,
})

const $referenceContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xs,
  marginTop: spacing.sm,
})

const $referenceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.textDim,
  fontStyle: "italic",
})

const $benefitsContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.sm,
  padding: spacing.sm,
  backgroundColor: colors.palette.success100,
  borderRadius: 8,
})

const $benefitsText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  lineHeight: 20,
  color: colors.text,
})

const $actions: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  borderTopWidth: 1,
  borderTopColor: colors.palette.neutral200,
  paddingTop: spacing.sm,
  marginTop: spacing.sm,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.xxs,
  paddingVertical: spacing.xxs,
})

const $actionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 13,
  color: colors.read,
  fontWeight: "500",
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
