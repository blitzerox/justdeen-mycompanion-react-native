/**
 * Onboarding Screen
 *
 * Main onboarding flow screen that renders all onboarding steps
 * Uses a step-by-step wizard pattern with progress indicator
 */
import React, { useState, useCallback } from "react"
import {
  View,
  ViewStyle,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from "react-native"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  SlideInRight,
  SlideOutLeft,
} from "react-native-reanimated"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { useAppTheme } from "@/theme/context"
import { useOnboardingContext, onboardingSteps, OnboardingStepType } from "@/context/OnboardingContext"
import type { ThemedStyle } from "@/theme/types"
import type { AppStackParamList } from "@/navigators/navigationTypes"

// Import step components
import { WelcomeStep } from "./steps/WelcomeStep"
import { PrivacyStep } from "./steps/PrivacyStep"
import { FeaturesStep } from "./steps/FeaturesStep"
import { LocationStep } from "./steps/LocationStep"
import { PrayerSettingsStep } from "./steps/PrayerSettingsStep"
import { ThemeStep } from "./steps/ThemeStep"
import { CompleteStep } from "./steps/CompleteStep"

const { width: SCREEN_WIDTH } = Dimensions.get("window")

type OnboardingNavigationProp = NativeStackNavigationProp<AppStackParamList, "Onboarding">

export const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<OnboardingNavigationProp>()
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { completeOnboarding, setShowOnboarding } = useOnboardingContext()

  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const progress = useSharedValue(0)

  const currentStep = onboardingSteps[currentStepIndex]
  const totalSteps = onboardingSteps.length

  // Update progress bar
  React.useEffect(() => {
    progress.value = withTiming((currentStepIndex + 1) / totalSteps, { duration: 300 })
  }, [currentStepIndex, totalSteps, progress])

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }))

  const handleNext = useCallback(() => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((prev) => prev + 1)
    }
  }, [currentStepIndex, totalSteps])

  const handleBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1)
    }
  }, [currentStepIndex])

  const handleComplete = useCallback(async () => {
    await completeOnboarding()
    // Navigate to Login screen after completing onboarding
    navigation.replace("Login")
  }, [completeOnboarding, navigation])

  const handleSkip = useCallback(() => {
    // Skip to login (complete step)
    setCurrentStepIndex(totalSteps - 1)
  }, [totalSteps])

  // Render step component based on type
  const renderStep = () => {
    const stepType = currentStep.type as OnboardingStepType
    const payload = currentStep.payload

    const commonProps = {
      onNext: handleNext,
      onBack: handleBack,
      onSkip: handleSkip,
      isFirst: currentStepIndex === 0,
      isLast: currentStepIndex === totalSteps - 1,
    }

    switch (stepType) {
      case "WELCOME":
        return <WelcomeStep {...commonProps} payload={payload} />
      case "PRIVACY":
        return <PrivacyStep {...commonProps} payload={payload} />
      case "FEATURES":
        return <FeaturesStep {...commonProps} payload={payload} />
      case "LOCATION":
        return <LocationStep {...commonProps} payload={payload} />
      case "PRAYER_SETTINGS":
        return <PrayerSettingsStep {...commonProps} payload={payload} />
      case "THEME":
        return <ThemeStep {...commonProps} payload={payload} />
      case "COMPLETE":
        return <CompleteStep {...commonProps} payload={payload} onComplete={handleComplete} />
      default:
        return null
    }
  }

  return (
    <SafeAreaView style={themed($container)}>
      <StatusBar barStyle="dark-content" />

      {/* Progress Bar */}
      <View style={themed($progressContainer)}>
        <View style={themed($progressBackground(colors))}>
          <Animated.View style={[themed($progressBar(colors)), progressStyle]} />
        </View>
        <View style={themed($stepIndicator)}>
          {onboardingSteps.map((_, index) => (
            <View
              key={index}
              style={[
                themed($stepDot(colors)),
                index <= currentStepIndex && themed($stepDotActive(colors)),
              ]}
            />
          ))}
        </View>
      </View>

      {/* Step Content */}
      <Animated.View
        key={currentStep.id}
        entering={SlideInRight.duration(300)}
        exiting={SlideOutLeft.duration(200)}
        style={themed($stepContainer)}
      >
        {renderStep()}
      </Animated.View>
    </SafeAreaView>
  )
}

// Styles
const $container: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $progressContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.md,
  paddingBottom: spacing.sm,
})

const $progressBackground: ThemedStyle<ViewStyle> = (colors) => ({
  height: 4,
  backgroundColor: colors.neutral200,
  borderRadius: 2,
  overflow: "hidden",
})

const $progressBar: ThemedStyle<ViewStyle> = (colors) => ({
  height: "100%",
  backgroundColor: colors.pray,
  borderRadius: 2,
})

const $stepIndicator: ThemedStyle<ViewStyle> = {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: 12,
  gap: 8,
}

const $stepDot: ThemedStyle<ViewStyle> = (colors) => ({
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: colors.neutral300,
})

const $stepDotActive: ThemedStyle<ViewStyle> = (colors) => ({
  backgroundColor: colors.pray,
})

const $stepContainer: ThemedStyle<ViewStyle> = {
  flex: 1,
}
