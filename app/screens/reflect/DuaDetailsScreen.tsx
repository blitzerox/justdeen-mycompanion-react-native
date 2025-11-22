/**
 * Dua Details Screen
 *
 * Displays full dua with Arabic text, transliteration, translation, reference, and benefits
 */
import React, { useState, useEffect } from "react"
import {
  View,
  ViewStyle,
  TextStyle,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native"
import { Screen, Text, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import type { ReadStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"
import { duasApi, Dua } from "@/services/duas/duasApi"

export const DuaDetailsScreen: React.FC<ReadStackScreenProps<"DuaDetails">> = ({
  route,
  navigation,
}) => {
  const { duaId } = route.params
  const { themed, theme: { colors, spacing } } = useAppTheme()

  const [dua, setDua] = useState<Dua | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDua()
  }, [duaId])

  // Set header title based on dua name
  useEffect(() => {
    if (dua) {
      navigation.setOptions({
        title: dua.name,
      })
    }
  }, [dua, navigation])

  const loadDua = async () => {
    setLoading(true)
    setError(null)

    try {
      const duaData = await duasApi.getDua(duaId)
      setDua(duaData || null)
    } catch (err) {
      console.error("Error loading Dua:", err)
      setError(err instanceof Error ? err.message : "Failed to load Dua")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($loadingContainer)}>
          <ActivityIndicator size="large" color={colors.read} />
          <Text style={themed($loadingText)}>Loading Dua...</Text>
        </View>
      </Screen>
    )
  }

  if (error || !dua) {
    return (
      <Screen preset="fixed" contentContainerStyle={themed($container)}>
        <View style={themed($errorContainer)}>
          <Icon icon="x" size={48} color={colors.error} />
          <Text style={themed($errorText)}>{error || "Dua not found"}</Text>
        </View>
      </Screen>
    )
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($container)}>
      <ScrollView
        contentContainerStyle={themed($scrollContent)}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View style={themed($titleSection)}>
          <Text style={themed($duaName)}>{dua.name}</Text>
          <Text style={themed($duaArabicName)}>{dua.arabicName}</Text>
          {dua.occasion && (
            <View style={themed($occasionBadge)}>
              <Text style={themed($occasionText)}>{dua.occasion}</Text>
            </View>
          )}
        </View>

        {/* Arabic Text */}
        <View style={themed($section)}>
          <Text style={themed($sectionLabel)}>Arabic</Text>
          <View style={themed($arabicContainer)}>
            <Text style={themed($arabicText)}>{dua.arabicText}</Text>
          </View>
        </View>

        {/* Transliteration */}
        <View style={themed($section)}>
          <Text style={themed($sectionLabel)}>Transliteration</Text>
          <View style={themed($contentContainer)}>
            <Text style={themed($transliterationText)}>{dua.transliteration}</Text>
          </View>
        </View>

        {/* English Translation */}
        <View style={themed($section)}>
          <Text style={themed($sectionLabel)}>Translation</Text>
          <View style={themed($contentContainer)}>
            <Text style={themed($translationText)}>{dua.englishTranslation}</Text>
          </View>
        </View>

        {/* Reference */}
        {dua.reference && (
          <View style={themed($section)}>
            <Text style={themed($sectionLabel)}>Reference</Text>
            <View style={themed($referenceContainer)}>
              <Icon icon="book" size={14} color={colors.read} />
              <Text style={themed($referenceText)}>{dua.reference}</Text>
            </View>
          </View>
        )}

        {/* Benefits */}
        {dua.benefits && (
          <View style={themed($section)}>
            <Text style={themed($sectionLabel)}>Benefits</Text>
            <View style={themed($benefitsContainer)}>
              <Text style={themed($benefitsText)}>{dua.benefits}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={themed($actionsContainer)}>
          <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
            <Icon icon="heart" size={20} color={colors.read} />
            <Text style={themed($actionText)}>Save</Text>
          </TouchableOpacity>
          {dua.audioUrl && (
            <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
              <Icon icon="play" size={20} color={colors.read} />
              <Text style={themed($actionText)}>Listen</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={themed($actionButton)} activeOpacity={0.7}>
            <Icon icon="share" size={20} color={colors.read} />
            <Text style={themed($actionText)}>Share</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = () => ({
  flex: 1,
})

const $scrollContent: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  padding: spacing.md,
  paddingBottom: spacing.xxl,
})

const $titleSection: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $duaName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 24,
  fontWeight: "700",
  color: colors.text,
  marginBottom: spacing.xs,
})

const $duaArabicName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 20,
  color: colors.textDim,
  fontFamily: "uthman",
  marginBottom: spacing.sm,
})

const $occasionBadge: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  alignSelf: "flex-start",
  backgroundColor: colors.read + "20",
  paddingHorizontal: spacing.sm,
  paddingVertical: spacing.xxs,
  borderRadius: 6,
})

const $occasionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.read,
  fontWeight: "600",
  textTransform: "capitalize",
})

const $section: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginBottom: spacing.lg,
})

const $sectionLabel: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 12,
  fontWeight: "700",
  color: colors.read,
  textTransform: "uppercase",
  letterSpacing: 1,
  marginBottom: spacing.sm,
})

const $arabicContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
})

const $arabicText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 26,
  lineHeight: 48,
  color: colors.text,
  fontFamily: "uthman",
  textAlign: "right",
})

const $contentContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
})

const $transliterationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  lineHeight: 26,
  color: colors.text,
  fontStyle: "italic",
})

const $translationText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 16,
  lineHeight: 26,
  color: colors.text,
})

const $referenceContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: spacing.sm,
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
})

const $referenceText: ThemedStyle<TextStyle> = ({ colors }) => ({
  flex: 1,
  fontSize: 14,
  color: colors.text,
  fontStyle: "italic",
})

const $benefitsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.read + "10",
  padding: spacing.md,
  borderRadius: 12,
  borderLeftWidth: 3,
  borderLeftColor: colors.read,
})

const $benefitsText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 14,
  lineHeight: 22,
  color: colors.text,
})

const $actionsContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  flexDirection: "row",
  justifyContent: "space-around",
  backgroundColor: colors.palette.neutral100,
  padding: spacing.md,
  borderRadius: 12,
  marginTop: spacing.md,
})

const $actionButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  alignItems: "center",
  gap: spacing.xs,
  paddingVertical: spacing.xs,
  paddingHorizontal: spacing.md,
})

const $actionText: ThemedStyle<TextStyle> = ({ colors }) => ({
  fontSize: 12,
  color: colors.read,
  fontWeight: "600",
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
