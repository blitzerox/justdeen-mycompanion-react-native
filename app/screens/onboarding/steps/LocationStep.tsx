/**
 * Location Step
 *
 * Request location permission for prayer times and Qibla
 */
import React, { useState, useCallback } from "react"
import { View, ViewStyle, TextStyle, Alert, Platform, Linking, ScrollView } from "react-native"
import { Text } from "@/components/Text"
import { Button } from "@/components/Button"
import { useAppTheme } from "@/theme/context"
import { useOnboardingContext } from "@/context/OnboardingContext"
import type { ThemedStyle } from "@/theme/types"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import * as Location from "expo-location"

interface LocationStepProps {
  payload: {
    title: string
    description: string
    note: string
  }
  onNext: () => void
  onBack: () => void
  onSkip: () => void
  isFirst: boolean
  isLast: boolean
}

export const LocationStep: React.FC<LocationStepProps> = ({
  payload,
  onNext,
  onBack,
  onSkip,
}) => {
  const {
    themed,
    theme: { colors },
  } = useAppTheme()
  const { updateOnboardingData } = useOnboardingContext()
  const [isRequesting, setIsRequesting] = useState(false)
  const [permissionGranted, setPermissionGranted] = useState(false)

  const requestLocationPermission = useCallback(async () => {
    setIsRequesting(true)
    try {
      const { status } = await Location.requestForegroundPermissionsAsync()

      if (status === "granted") {
        setPermissionGranted(true)
        updateOnboardingData({ locationEnabled: true })

        // Small delay to show success state
        setTimeout(() => {
          onNext()
        }, 500)
      } else {
        Alert.alert(
          "Location Permission",
          "Location access is needed for accurate prayer times. You can enable it later in Settings.",
          [
            { text: "Continue Anyway", onPress: () => onNext() },
            {
              text: "Open Settings",
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:")
                } else {
                  Linking.openSettings()
                }
              },
            },
          ]
        )
        updateOnboardingData({ locationEnabled: false })
      }
    } catch (error) {
      console.error("Location permission error:", error)
      Alert.alert("Error", "Could not request location permission. Please try again.")
    } finally {
      setIsRequesting(false)
    }
  }, [onNext, updateOnboardingData])

  const handleSkipLocation = useCallback(() => {
    updateOnboardingData({ locationEnabled: false })
    onNext()
  }, [onNext, updateOnboardingData])

  return (
    <View style={themed($container)}>
      {/* Main Content */}
      <ScrollView
        style={themed($scrollView)}
        contentContainerStyle={themed($content)}
        showsVerticalScrollIndicator={false}
      >
        {/* Location Icon */}
        <View style={themed($iconContainer(colors, permissionGranted))}>
          {permissionGranted ? (
            <MaterialCommunityIcons name="check-circle" size={80} color={colors.home} />
          ) : (
            <FontAwesome6 name="location-dot" size={64} color={colors.pray} />
          )}
        </View>

        {/* Title */}
        <Text style={themed($title(colors))}>
          {permissionGranted ? "Location Enabled!" : payload.title}
        </Text>

        {/* Description */}
        <Text style={themed($description(colors))}>
          {permissionGranted
            ? "Prayer times will be calculated for your exact location."
            : payload.description}
        </Text>

        {/* Benefits List */}
        {!permissionGranted && (
          <View style={themed($benefitsList)}>
            <View style={themed($benefitItem(colors))}>
              <FontAwesome6 name="clock" size={20} color={colors.pray} />
              <Text style={themed($benefitText(colors))}>
                Accurate prayer times for your location
              </Text>
            </View>
            <View style={themed($benefitItem(colors))}>
              <FontAwesome6 name="compass" size={20} color={colors.pray} />
              <Text style={themed($benefitText(colors))}>
                Precise Qibla direction
              </Text>
            </View>
            <View style={themed($benefitItem(colors))}>
              <FontAwesome6 name="bell" size={20} color={colors.pray} />
              <Text style={themed($benefitText(colors))}>
                Location-based prayer notifications
              </Text>
            </View>
          </View>
        )}

        {/* Privacy Note */}
        <View style={themed($privacyNote(colors))}>
          <FontAwesome6 name="shield-halved" size={16} color={colors.home} />
          <Text style={themed($privacyText(colors))}>{payload.note}</Text>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={themed($bottomContainer)}>
        {permissionGranted ? (
          <Button
            text="Continue"
            style={themed($primaryButton(colors))}
            textStyle={themed($primaryButtonText)}
            onPress={onNext}
          />
        ) : (
          <>
            <Button
              text={isRequesting ? "Requesting..." : "Enable Location"}
              style={themed($primaryButton(colors))}
              textStyle={themed($primaryButtonText)}
              onPress={requestLocationPermission}
              disabled={isRequesting}
            />
            <View style={themed($buttonRow)}>
              <Button
                text="Back"
                style={themed($secondaryButton)}
                textStyle={themed($secondaryButtonText(colors))}
                onPress={onBack}
              />
              <Button
                text="Skip for Now"
                style={themed($secondaryButton)}
                textStyle={themed($skipButtonText(colors))}
                onPress={handleSkipLocation}
              />
            </View>
          </>
        )}
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

const $iconContainer: ThemedStyle<ViewStyle> = (colors, granted: boolean) => ({
  width: 140,
  height: 140,
  borderRadius: 70,
  backgroundColor: granted ? colors.home + "15" : colors.pray + "15",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 24,
})

const $title: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 32,
  fontWeight: "700",
  color: colors.text,
  textAlign: "center",
  marginBottom: 12,
})

const $description: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  lineHeight: 24,
  marginBottom: 28,
  paddingHorizontal: 16,
})

const $benefitsList: ThemedStyle<ViewStyle> = {
  width: "100%",
  gap: 16,
}

const $benefitItem: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: colors.surface,
  borderRadius: 12,
  padding: 16,
  gap: 14,
})

const $benefitText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 15,
  color: colors.text,
  flex: 1,
})

const $privacyNote: ThemedStyle<ViewStyle> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginTop: 24,
  paddingVertical: 12,
  paddingHorizontal: 16,
  backgroundColor: colors.home + "10",
  borderRadius: 12,
})

const $privacyText: ThemedStyle<TextStyle> = (colors) => ({
  fontSize: 13,
  color: colors.textSecondary,
  flex: 1,
  lineHeight: 18,
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
