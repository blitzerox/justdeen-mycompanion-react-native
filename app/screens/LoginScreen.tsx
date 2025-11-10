/**
 * Login Screen
 *
 * Provides Google, Apple, and Anonymous sign-in options
 * Follows iOS HIG and WWDC design principles
 */
import { FC } from "react"
import { View, ViewStyle, TextStyle, ActivityIndicator, Platform, Alert } from "react-native"
import { Button } from "@/components/Button"
import { Screen } from "@/components/Screen"
import { Text } from "@/components/Text"
import { useAuth } from "@/context/AuthContext"
import type { AppStackScreenProps } from "@/navigators/navigationTypes"
import type { ThemedStyle } from "@/theme/types"
import { useAppTheme } from "@/theme/context"
import { useSafeAreaInsetsStyle } from "@/utils/useSafeAreaInsetsStyle"

interface LoginScreenProps extends AppStackScreenProps<"Login"> {}

export const LoginScreen: FC<LoginScreenProps> = ({ navigation }) => {
  const {
    signInWithGoogle,
    signInWithApple,
    signInAnonymously,
    isLoading,
    error,
    clearError,
  } = useAuth()

  const {
    themed,
    theme: { colors },
  } = useAppTheme()

  const $bottomContainerInsets = useSafeAreaInsetsStyle(["bottom"])

  /**
   * Handle Google Sign-In
   */
  const handleGoogleSignIn = async () => {
    clearError()
    const result = await signInWithGoogle()

    if (result.success) {
      // Navigation is handled automatically by AuthContext
      navigation.navigate("MainTabs")
    } else {
      Alert.alert("Sign-In Failed", result.error || "Could not sign in with Google")
    }
  }

  /**
   * Handle Apple Sign-In (iOS only)
   */
  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert("Not Available", "Apple Sign-In is only available on iOS devices")
      return
    }

    clearError()
    const result = await signInWithApple()

    if (result.success) {
      // Navigation is handled automatically by AuthContext
      navigation.navigate("MainTabs")
    } else {
      Alert.alert("Sign-In Failed", result.error || "Could not sign in with Apple")
    }
  }

  /**
   * Handle Anonymous Sign-In
   */
  const handleAnonymousSignIn = async () => {
    clearError()
    const result = await signInAnonymously()

    if (result.success) {
      // Navigation is handled automatically by AuthContext
      navigation.navigate("MainTabs")
    } else {
      Alert.alert("Sign-In Failed", result.error || "Could not continue as guest")
    }
  }

  return (
    <Screen preset="fixed" contentContainerStyle={themed($screenContainer)}>
      {/* Top Section: Logo and Welcome Text */}
      <View style={themed($topContainer)}>
        <Text preset="heading" style={themed($appName)}>
          JustDeen
        </Text>
        <Text preset="subheading" style={themed($tagline)}>
          Your companion for prayer, Quran, and reflection
        </Text>
      </View>

      {/* Bottom Section: Sign-In Buttons */}
      <View style={themed([$bottomContainer, $bottomContainerInsets])}>
        {error && (
          <View style={themed($errorContainer)}>
            <Text style={themed($errorText)}>{error}</Text>
          </View>
        )}

        {/* Apple Sign-In (iOS only) */}
        {Platform.OS === "ios" && (
          <Button
            testID="apple-sign-in-button"
            text="Continue with Apple"
            style={themed($appleButton)}
            textStyle={themed($appleButtonText)}
            preset="default"
            onPress={handleAppleSignIn}
            disabled={isLoading}
          />
        )}

        {/* Google Sign-In */}
        <Button
          testID="google-sign-in-button"
          text="Continue with Google"
          style={themed($googleButton)}
          textStyle={themed($googleButtonText)}
          preset="default"
          onPress={handleGoogleSignIn}
          disabled={isLoading}
        />

        {/* Anonymous Sign-In (Guest) */}
        <Button
          testID="guest-sign-in-button"
          text="Continue as Guest"
          style={themed($guestButton)}
          textStyle={themed($guestButtonText)}
          preset="default"
          onPress={handleAnonymousSignIn}
          disabled={isLoading}
        />

        {/* Loading Indicator */}
        {isLoading && (
          <View style={themed($loadingContainer)}>
            <ActivityIndicator size="small" color={colors.tint} />
            <Text style={themed($loadingText)}>Signing in...</Text>
          </View>
        )}

        {/* Privacy Note */}
        <Text size="xs" style={themed($privacyNote)}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </Screen>
  )
}

// Styles
const $screenContainer: ThemedStyle<ViewStyle> = ({ colors }) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $topContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: spacing.lg,
})

const $appName: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 48,
  fontWeight: "700",
  color: colors.pray, // Purple (main brand color)
  marginBottom: spacing.md,
  textAlign: "center",
})

const $tagline: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  fontSize: 17,
  color: colors.textSecondary,
  textAlign: "center",
  marginBottom: spacing.xl,
})

const $bottomContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  paddingHorizontal: spacing.lg,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
})

const $errorContainer: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.errorBackground,
  borderRadius: 8,
  padding: spacing.md,
  marginBottom: spacing.md,
})

const $errorText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.error,
  fontSize: 15,
  textAlign: "center",
})

// Apple Sign-In Button (Black background, white text)
const $appleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.black,
  borderRadius: 12,
  paddingVertical: spacing.md,
  marginBottom: spacing.sm,
  borderWidth: 0,
})

const $appleButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.palette.white,
  fontSize: 17,
  fontWeight: "600",
})

// Google Sign-In Button (White background, dark text, border)
const $googleButton: ThemedStyle<ViewStyle> = ({ colors, spacing }) => ({
  backgroundColor: colors.palette.white,
  borderRadius: 12,
  paddingVertical: spacing.md,
  marginBottom: spacing.sm,
  borderWidth: 1,
  borderColor: colors.separator,
})

const $googleButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.text,
  fontSize: 17,
  fontWeight: "600",
})

// Guest Sign-In Button (Transparent, text only)
const $guestButton: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  backgroundColor: "transparent",
  borderRadius: 12,
  paddingVertical: spacing.md,
  marginBottom: spacing.md,
  borderWidth: 0,
})

const $guestButtonText: ThemedStyle<TextStyle> = ({ colors }) => ({
  color: colors.tint,
  fontSize: 17,
  fontWeight: "600",
})

// Loading Indicator
const $loadingContainer: ThemedStyle<ViewStyle> = ({ spacing }) => ({
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  marginTop: spacing.md,
})

const $loadingText: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textSecondary,
  fontSize: 15,
  marginLeft: spacing.sm,
})

// Privacy Note
const $privacyNote: ThemedStyle<TextStyle> = ({ colors, spacing }) => ({
  color: colors.textTertiary,
  textAlign: "center",
  marginTop: spacing.md,
  lineHeight: 18,
})
