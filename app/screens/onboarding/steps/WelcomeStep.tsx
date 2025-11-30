/**
 * Welcome Step
 *
 * First onboarding step - Greeting and introduction
 */
import React from "react"
import { View, ViewStyle, TextStyle, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6 } from "@expo/vector-icons"

interface WelcomeStepProps {
  payload: {
    title: string
    subtitle: string
    description: string
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

export const WelcomeStep: React.FC<WelcomeStepProps> = ({ payload, onNext, onSkip }) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  return (
    <View style={themed($container)}>
      {/* Main Content */}
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($content)}
        showsVerticalScrollIndicator={false}
      >
        {/* Mosque Icon */}
        <View style={themed($iconContainer(colors))}>
          <FontAwesome6 name="mosque" size={80} color={colors.pray} />
        </View>

        {/* Arabic Greeting */}
        <Text style={themed($arabicGreeting(colors))}>
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </Text>

        {/* Title */}
        <Text style={themed($title(colors))}>{payload.title}</Text>

        {/* Subtitle */}
        <Text style={themed($subtitle(colors))}>{payload.subtitle}</Text>

        {/* Description */}
        <Text style={themed($description(colors))}>{payload.description}</Text>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={themed($bottomContainer)}>
        <Button
          text="Get Started"
          style={themed($primaryButton(colors))}
          textStyle={themed($primaryButtonText)}
          onPress={onNext}
        />
        <Button
          text="Skip"
          style={themed($skipButton)}
          textStyle={themed($skipButtonText(colors))}
          onPress={onSkip}
        />
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
  justifyContent: "center",
  paddingHorizontal: spacing.lg,
  paddingVertical: spacing.lg,
})

const $iconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 160,
  height: 160,
  borderRadius: 80,
  backgroundColor: colors.pray + "15",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 32,
})

const $arabicGreeting: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 22,
  fontWeight: "500",
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 24,
  fontFamily: "System",
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 36,
  fontWeight: "700",
  color: colors.text,
  textAlign: "center",
  marginBottom: 8,
})

const $subtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 28,
  fontWeight: "600",
  color: colors.pray,
  textAlign: "center",
  marginBottom: 16,
})

const $description: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  lineHeight: 24,
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

const $skipButton: ThemedStyle<ViewStyle> = {
  backgroundColor: "transparent",
  borderRadius: 14,
  paddingVertical: 12,
  borderWidth: 0,
}

const $skipButtonText: ThemedStyle<TextStyle> = (colors) => ({
  color: colors.textSecondary,
  fontSize: 15,
  fontWeight: "500",
})
