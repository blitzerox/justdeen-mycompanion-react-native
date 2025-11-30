/**
 * Privacy Step
 *
 * Highlights privacy-first approach - no ads, no tracking
 */
import React from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"

interface PrivacyStepProps {
  payload: {
    title: string
    features: { icon: string; text: string }[]
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

export const PrivacyStep: React.FC<PrivacyStepProps> = ({ payload, onNext, onBack, onSkip }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "shield-check":
        return <MaterialCommunityIcons name="shield-check" size={28} color={colors.home} />
      case "lock":
        return <FontAwesome6 name="lock" size={24} color={colors.pray} />
      case "eye-off":
        return <MaterialCommunityIcons name="eye-off" size={28} color={colors.read} />
      case "server-off":
        return <MaterialCommunityIcons name="server-off" size={28} color={colors.ai} />
      default:
        return <FontAwesome6 name="check" size={24} color={colors.home} />
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
        {/* Shield Icon */}
        <View style={themed($iconContainer(colors))}>
          <FontAwesome6 name="shield-halved" size={64} color={colors.home} />
        </View>

        {/* Title */}
        <Text style={themed($title(colors))}>{payload.title}</Text>

        {/* Subtitle */}
        <Text style={themed($subtitle(colors))}>
          Your faith is personal. So is your data.
        </Text>

        {/* Features List */}
        <View style={themed($featuresList)}>
          {payload.features.map((feature, index) => (
            <View key={index} style={themed($featureItem(colors))}>
              <View style={themed($featureIconContainer(colors))}>
                {getIcon(feature.icon)}
              </View>
              <Text style={themed($featureText(colors))}>{feature.text}</Text>
            </View>
          ))}
        </View>

        {/* Trust Badge */}
        <View style={themed($trustBadge(colors))}>
          <FontAwesome6 name="heart" size={16} color={colors.pray} solid />
          <Text style={themed($trustText(colors))}>
            Built with love for the Muslim community
          </Text>
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
  flexGrow: 1,
  alignItems: "center",
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.md,
})

const $iconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 120,
  height: 120,
  borderRadius: 60,
  backgroundColor: colors.home + "15",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
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
  marginBottom: 32,
})

const $featuresList: ThemedStyle<ViewStyle> = {
  width: "100%",
  gap: 16,
}

const $featureItem: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  gap: 16,
})

const $featureIconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.background,
  alignItems: "center",
  justifyContent: "center",
})

const $featureText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  fontWeight: "600",
  color: colors.text,
  flex: 1,
})

const $trustBadge: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 24,
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: colors.pray + "10",
  borderRadius: 20,
})

const $trustText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
  color: colors.pray,
  fontWeight: "500",
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
