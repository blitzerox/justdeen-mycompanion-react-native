/**
 * Prayer Settings Step
 *
 * Configure calculation method and madhab
 */
import React, { useState } from "react"
import { View, ViewStyle, TextStyle, ScrollView, TouchableOpacity } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { useOnboardingContext } from "@/context/OnboardingContext"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"

interface PrayerSettingsStepProps {
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

// Calculation methods from AlAdhan API
const calculationMethods = [
  { id: 2, name: "Islamic Society of North America (ISNA)", region: "North America" },
  { id: 1, name: "University of Islamic Sciences, Karachi", region: "Pakistan" },
  { id: 3, name: "Muslim World League", region: "Global" },
  { id: 4, name: "Umm Al-Qura University, Makkah", region: "Saudi Arabia" },
  { id: 5, name: "Egyptian General Authority of Survey", region: "Egypt" },
  { id: 7, name: "Institute of Geophysics, University of Tehran", region: "Iran" },
  { id: 9, name: "Kuwait", region: "Kuwait" },
  { id: 10, name: "Qatar", region: "Qatar" },
  { id: 11, name: "Majlis Ugama Islam Singapura", region: "Singapore" },
  { id: 12, name: "UOIF (France)", region: "France" },
  { id: 13, name: "Diyanet (Turkey)", region: "Turkey" },
]

const madhabs = [
  { id: 1, name: "Shafi'i", description: "Earlier Asr time" },
  { id: 2, name: "Hanafi", description: "Later Asr time" },
]

export const PrayerSettingsStep: React.FC<PrayerSettingsStepProps> = ({
  payload,
  onNext,
  onBack,
  onSkip,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { updateOnboardingData, onboardingData } = useOnboardingContext()

  const [selectedMethod, setSelectedMethod] = useState<number>(onboardingData.calculationMethod || 2)
  const [selectedMadhab, setSelectedMadhab] = useState<number>(onboardingData.madhab || 1)

  const handleMethodSelect = (methodId: number) => {
    setSelectedMethod(methodId)
    updateOnboardingData({ calculationMethod: methodId })
  }

  const handleMadhabSelect = (madhabId: number) => {
    setSelectedMadhab(madhabId)
    updateOnboardingData({ madhab: madhabId })
  }

  const handleContinue = () => {
    updateOnboardingData({
      calculationMethod: selectedMethod,
      madhab: selectedMadhab,
    })
    onNext()
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
          <FontAwesome6 name="calculator" size={48} color={colors.pray} />
        </View>

        {/* Title */}
        <Text style={themed($title(colors))}>{payload.title}</Text>

        {/* Description */}
        <Text style={themed($description(colors))}>{payload.description}</Text>

        {/* Madhab Selection */}
        <View style={themed($sectionContainer)}>
          <Text style={themed($sectionTitle(colors))}>Madhab (School of Thought)</Text>
          <Text style={themed($sectionSubtitle(colors))}>
            Affects Asr prayer time calculation
          </Text>
          <View style={themed($optionsRow)}>
            {madhabs.map((madhab) => (
              <TouchableOpacity
                key={madhab.id}
                style={themed($madhabOption(colors, selectedMadhab === madhab.id))}
                onPress={() => handleMadhabSelect(madhab.id)}
                activeOpacity={0.7}
              >
                <View style={themed($radioOuter(colors, selectedMadhab === madhab.id))}>
                  {selectedMadhab === madhab.id && (
                    <View style={themed($radioInner(colors))} />
                  )}
                </View>
                <View style={themed($madhabTextContainer)}>
                  <Text style={themed($madhabName(colors))}>{madhab.name}</Text>
                  <Text style={themed($madhabDesc(colors))}>{madhab.description}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Calculation Method Selection */}
        <View style={themed($sectionContainer)}>
          <Text style={themed($sectionTitle(colors))}>Calculation Method</Text>
          <Text style={themed($sectionSubtitle(colors))}>
            Select based on your region or preference
          </Text>
          <View style={themed($methodsList)}>
            {calculationMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={themed($methodOption(colors, selectedMethod === method.id))}
                onPress={() => handleMethodSelect(method.id)}
                activeOpacity={0.7}
              >
                <View style={themed($radioOuter(colors, selectedMethod === method.id))}>
                  {selectedMethod === method.id && (
                    <View style={themed($radioInner(colors))} />
                  )}
                </View>
                <View style={themed($methodTextContainer)}>
                  <Text style={themed($methodName(colors, selectedMethod === method.id))}>
                    {method.name}
                  </Text>
                  <Text style={themed($methodRegion(colors))}>{method.region}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
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
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.md,
})

const $iconContainer: ThemedStyle<ViewStyle> = (colors) => ({
  width: 100,
  height: 100,
  borderRadius: 50,
  backgroundColor: colors.pray + "15",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
  marginBottom: 16,
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 28,
  fontWeight: "700",
  color: colors.text,
  textAlign: "center",
  marginBottom: 8,
})

const $description: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: 24,
})

const $sectionContainer: ThemedStyle<ViewStyle> = {
  marginBottom: 24,
}

const $sectionTitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $sectionSubtitle: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textSecondary,
  marginBottom: 12,
})

const $optionsRow: ThemedStyle<ViewStyle> = {
  gap: 12,
}

const $madhabOption: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: isSelected ? colors.pray + "10" : colors.surface,
  borderRadius: 12,
  padding: 16,
  gap: 14,
  borderWidth: isSelected ? 2 : 1,
  borderColor: isSelected ? colors.pray : colors.border,
})

const $madhabTextContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $madhabName: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 16,
  fontWeight: "600",
  color: colors.text,
})

const $madhabDesc: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textSecondary,
  marginTop: 2,
})

const $methodsList: ThemedStyle<ViewStyle> = {
  gap: 8,
}

const $methodOption: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: isSelected ? colors.pray + "10" : colors.surface,
  borderRadius: 12,
  padding: 14,
  gap: 12,
  borderWidth: isSelected ? 2 : 1,
  borderColor: isSelected ? colors.pray : colors.border,
})

const $methodTextContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}

const $methodName: ThemedStyle<TextStyle> = (colors, isSelected: boolean) => ({
  fontSize: 14,
  fontWeight: isSelected ? "600" : "500",
  color: colors.text,
})

const $methodRegion: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 12,
  color: colors.textSecondary,
  marginTop: 2,
})

const $radioOuter: ThemedStyle<ViewStyle> = (colors, isSelected: boolean) => ({
  width: 22,
  height: 22,
  borderRadius: 11,
  borderWidth: 2,
  borderColor: isSelected ? colors.pray : colors.neutral400,
  alignItems: "center",
  justifyContent: "center",
})

const $radioInner: ThemedStyle<ViewStyle> = (colors) => ({
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: colors.pray,
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
