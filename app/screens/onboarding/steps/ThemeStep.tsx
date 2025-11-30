/**
 * Theme Step
 *
 * Choose light or dark theme preference
 */
import React, { useState } from "react"
import { View, ViewStyle, TextStyle, TouchableOpacity, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { useOnboardingContext } from "@/context/OnboardingContext"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, Feather } from "@expo/vector-icons"

interface ThemeStepProps {
  payload: {
    title: string
    description: string
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

type ThemeOption = "light" | "dark" | "system"

const themeOptions: { id: ThemeOption; name: string; icon: string; description: string }[] = [
  {
    id: "light",
    name: "Light",
    icon: "sun",
    description: "Clean and bright appearance",
  },
  {
    id: "dark",
    name: "Dark",
    icon: "moon",
    description: "Easier on the eyes at night",
  },
  {
    id: "system",
    name: "System",
    icon: "smartphone",
    description: "Match your device settings",
  },
]

export const ThemeStep: React.FC<ThemeStepProps> = ({
  payload,
  onNext,
  onBack,
  onSkip,
}) => {
  const {
    themed,
    theme: { colors },
    setThemeContextOverride,
  } = useAppTheme()
  const { updateOnboardingData, onboardingData } = useOnboardingContext()

  const [selectedTheme, setSelectedTheme] = useState<ThemeOption>(
    onboardingData.theme || "system"
  )

  const handleThemeSelect = (themeId: ThemeOption) => {
    setSelectedTheme(themeId)
    updateOnboardingData({ theme: themeId })

    // Apply theme preview
    if (themeId === "dark") {
      setThemeContextOverride("dark")
    } else if (themeId === "light") {
      setThemeContextOverride("light")
    } else {
      setThemeContextOverride(undefined)
    }
  }

  const handleContinue = () => {
    updateOnboardingData({ theme: selectedTheme })
    onNext()
  }

  const getIcon = (iconName: string, isSelected: boolean) => {
    const iconColor = isSelected ? colors.pray : colors.textSecondary
    switch (iconName) {
      case "sun":
        return <Feather name="sun" size={32} color={iconColor} />
      case "moon":
        return <Feather name="moon" size={32} color={iconColor} />
      case "smartphone":
        return <Feather name="smartphone" size={32} color={iconColor} />
      default:
        return <Feather name="circle" size={32} color={iconColor} />
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
        {/* Icon */}
        <View style={themed($iconContainer(colors))}>
          <FontAwesome6 name="palette" size={56} color={colors.pray} />
        </View>

        {/* Title */}
        <Text style={themed($title(colors))}>{payload.title}</Text>

        {/* Description */}
        <Text style={themed($description(colors))}>{payload.description}</Text>

        {/* Theme Options */}
        <View style={themed($themeOptionsContainer)}>
          {themeOptions.map((option) => {
            const isSelected = selectedTheme === option.id
            return (
              <TouchableOpacity
                key={option.id}
                style={themed($themeOption(colors, isSelected))}
                onPress={() => handleThemeSelect(option.id)}
                activeOpacity={0.7}
              >
                <View style={themed($themeIconContainer(colors, isSelected))}>
                  {getIcon(option.icon, isSelected)}
                </View>
                <Text style={themed($themeName(colors, isSelected))}>{option.name}</Text>
                <Text style={themed($themeDescription(colors))}>{option.description}</Text>
                {isSelected && (
                  <View style={themed($selectedBadge(colors))}>
                    <FontAwesome6 name="check" size={12} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            )
          })}
        </View>

        {/* Preview Note */}
        <View style={themed($previewNote(colors))}>
          <Feather name="info" size={16} color={colors.textSecondary} />
          <Text style={themed($previewText(colors))}>
            You can change this later in Settings
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={themed($bottomContainer)}>
        <Button
          text="Continue"
          style={themed($primaryButton(colors))}
          textStyle={themed($primaryButtonText)}
          onPress={handleContinue}
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
  backgroundColor: colors.pray + "15",
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

const $description: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 32,
})

const $themeOptionsContainer: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  gap: 12,
  width: "100%",
}

const $themeOption: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  flex: 1,
  alignItems: "center",
  backgroundColor: isSelected ? colors.pray + "10" : colors.surface,
  borderRadius: 16,
  padding: 20,
  borderWidth: isSelected ? 2 : 1,
  borderColor: isSelected ? colors.pray : colors.border,
  position: "relative",
})

const $themeIconContainer: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: isSelected ? colors.pray + "20" : colors.background,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
})

const $themeName: ThemedStyle<TextStyle> = (colors, isSelected: boolean) => ({
  fontSize: 16,
  fontWeight: "600",
  color: isSelected ? colors.pray : colors.text,
  marginBottom: 4,
})

const $themeDescription: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 11,
  color: colors.textSecondary,
  textAlign: "center",
})

const $selectedBadge: ThemedStyle<ViewStyle> = (colors) => ({
  position: "absolute",
  top: 8,
  right: 8,
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: colors.pray,
  alignItems: "center",
  justifyContent: "center",
})

const $previewNote: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 24,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.surface,
  borderRadius: 12,
})

const $previewText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 14,
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
