/**
 * Features Step
 *
 * Showcase key app features and USPs
 */
import React from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, MaterialCommunityIcons, Feather } from "@expo/vector-icons"

interface FeaturesStepProps {
  payload: {
    title: string
    features: { icon: string; text: string; color: string }[]
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

export const FeaturesStep: React.FC<FeaturesStepProps> = ({ payload, onNext, onBack, onSkip }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const getColor = (colorName: string) => {
    switch (colorName) {
      case "pray":
        return colors.pray
      case "read":
        return colors.read
      case "ai":
        return colors.ai
      case "home":
        return colors.home
      case "more":
        return colors.more
      default:
        return colors.pray
    }
  }

  const getIcon = (iconName: string, color: string) => {
    const iconColor = getColor(color)
    switch (iconName) {
      case "clock":
        return <Feather name="clock" size={28} color={iconColor} />
      case "book-open":
        return <Feather name="book-open" size={28} color={iconColor} />
      case "compass":
        return <Feather name="compass" size={28} color={iconColor} />
      case "robot":
        return <FontAwesome6 name="robot" size={26} color={iconColor} />
      case "hand":
        return <FontAwesome6 name="hand" size={26} color={iconColor} />
      default:
        return <FontAwesome6 name="star" size={26} color={iconColor} />
    }
  }

  return (
    <View style={themed($container)}>
      {/* Main Content */}
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($content)}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text style={themed($title(colors))}>{payload.title}</Text>

        {/* Subtitle */}
        <Text style={themed($subtitle(colors))}>
          Authentic. Secure. Beautiful.
        </Text>

        {/* Features Grid */}
        <View style={themed($featuresGrid)}>
          {payload.features.map((feature, index) => {
            const featureColor = getColor(feature.color)
            return (
              <View key={index} style={themed($featureCard(colors, featureColor))}>
                <View style={themed($featureIconContainer(featureColor))}>
                  {getIcon(feature.icon, feature.color)}
                </View>
                <Text style={themed($featureText(colors))}>{feature.text}</Text>
              </View>
            )
          })}
        </View>

        {/* Additional USPs */}
        <View style={themed($uspContainer)}>
          <View style={themed($uspItem)}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.home} />
            <Text style={themed($uspText(colors))}>Authentic Islamic content</Text>
          </View>
          <View style={themed($uspItem)}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.home} />
            <Text style={themed($uspText(colors))}>Multiple Quran translations</Text>
          </View>
          <View style={themed($uspItem)}>
            <MaterialCommunityIcons name="check-decagram" size={20} color={colors.home} />
            <Text style={themed($uspText(colors))}>Works offline</Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={themed($bottomContainer)}>
        <Button
          text="Continue"
          style={themed($primaryButton(colors))}
          textStyle={themed($primaryButtonText)}
          onPress={onNext}
        />
        <View style={themed($buttonRow)}>
          <Button
            text="Back"
            style={themed($secondaryButton)}
            textStyle={themed($secondaryButtonText(colors))}
            onPress={onBack}
          />
          <Button
            text="Skip"
            style={themed($secondaryButton)}
            textStyle={themed($skipButtonText(colors))}
            onPress={onSkip}
          />
        </View>
      </View>
    </View>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = {
  flex: 1,
  justifyContent: "space-between",
}

const $scrollView: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $content: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.md,
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 32,
  fontWeight: "700",
  color: colors.text,
  textAlign: "center",
  marginBottom: 8,
})

const $subtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 28,
})

const $featuresGrid: ThemedStyle<ViewStyle> = {
  gap: 12,
}

const $featureCard: ThemedStyle<ViewStyle> = (colors, accentColor: string) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  borderRadius: 16,
  padding: 16,
  gap: 16,
  borderLeftWidth: 4,
  borderLeftColor: accentColor,
})

const $featureIconContainer: ThemedStyle<ViewStyle> = (accentColor: string) => ({
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: accentColor + "15",
  alignItems: "center",
  justifyContent: "center",
})

const $featureText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
  flex: 1,
})

const $uspContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  marginTop: spacing.lg,
  gap: 12,
})

const $uspItem: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
}

const $uspText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  color: colors.textSecondary,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingBottom: spacing.xl,
  gap: 12,
})

const $primaryButton: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.pray,
  borderRadius: 14,
  paddingVertical: 16,
  borderWidth: 0,
})

const $primaryButtonText: ThemedStyle<TextStyle> = {
  color: "#FFFFFF",
  fontSize: 17,
  fontWeight: "600",
}

const $buttonRow: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "space-between",
}

const $secondaryButton: ThemedStyle<ViewStyle> = {
  backgroundColor: "transparent",
  borderRadius: 14,
  paddingVertical: 12,
  paddingHorizontal: 24,
  borderWidth: 0,
}

const $secondaryButtonText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.text,
  fontSize: 15,
  fontWeight: "500",
})

const $skipButtonText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.textSecondary,
  fontSize: 15,
  fontWeight: "500",
})
