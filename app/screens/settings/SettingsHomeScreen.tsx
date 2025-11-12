/**
 * Settings Home Screen
 *
 * Week 5: Main settings screen with grouped sections
 * - User profile section (if authenticated)
 * - Appearance settings (Theme, Text Size)
 * - Prayer settings (Calculation method, Notifications)
 * - Quran settings (Translation, Audio, Text size)
 * - General settings (Language, Storage, About)
 * - Account management (Sign out, Delete account)
 */
import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native"
import { Screen, Icon } from "@/components"
import { useAppTheme } from "@/theme/context"
import { useAuth } from "@/context/AuthContext"
import type { SettingsStackScreenProps } from "@/navigators"
import type { ThemedStyle } from "@/theme/types"

interface SettingRow {
  label: string
  value?: string
  icon?: string
  type: "navigation" | "toggle" | "picker" | "action"
  onPress?: () => void
  toggleValue?: boolean
  onToggle?: (value: boolean) => void
  destructive?: boolean
}

interface SettingSection {
  title: string
  rows: SettingRow[]
}

export const SettingsHomeScreen: React.FC<SettingsStackScreenProps<"SettingsHome">> = () => {
  const { themed, theme: { colors, isDark }, setThemeContextOverride } = useAppTheme()
  const { user, isAuthenticated, logout, signInWithAuth0 } = useAuth()

  // Local state for settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  // Handle sign in
  const handleSignIn = async () => {
    const result = await signInWithAuth0()
    if (!result.success) {
      Alert.alert("Sign In Failed", result.error || "Unable to sign in. Please try again.")
    }
  }

  // Handle theme toggle
  const handleThemeChange = () => {
    Alert.alert(
      "Theme",
      "Choose your preferred theme",
      [
        { text: "Light", onPress: () => setThemeContextOverride("light") },
        { text: "Dark", onPress: () => setThemeContextOverride("dark") },
        { text: "Auto", onPress: () => setThemeContextOverride(undefined) },
        { text: "Cancel", style: "cancel" },
      ]
    )
  }

  // Handle sign out
  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout()
            Alert.alert("Signed Out", "You have been signed out successfully.")
          },
        },
      ]
    )
  }

  // Handle delete account
  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. All your data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Coming Soon", "Account deletion will be available in a future update.")
          },
        },
      ]
    )
  }

  // Settings sections
  const sections: SettingSection[] = [
    {
      title: "APPEARANCE",
      rows: [
        {
          label: "Theme",
          value: isDark ? "Dark" : "Light",
          type: "picker",
          onPress: handleThemeChange,
        },
        {
          label: "Text Size",
          value: "Medium",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Text size adjustment will be available in a future update."),
        },
      ],
    },
    {
      title: "PRAYER",
      rows: [
        {
          label: "Calculation Method",
          value: "ISNA",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Calculation method settings will be available in a future update."),
        },
        {
          label: "Notifications",
          type: "toggle",
          toggleValue: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          label: "Location Settings",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Location settings will be available in a future update."),
        },
      ],
    },
    {
      title: "QURAN",
      rows: [
        {
          label: "Translation",
          value: "Sahih International",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Translation selection will be available in a future update."),
        },
        {
          label: "Audio Reciter",
          value: "Mishary Alafasy",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Audio reciter selection will be available in a future update."),
        },
        {
          label: "Arabic Text Size",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Text size adjustment will be available in a future update."),
        },
      ],
    },
    {
      title: "GENERAL",
      rows: [
        {
          label: "Language",
          value: "English",
          type: "picker",
          onPress: () => Alert.alert("Coming Soon", "Language selection will be available in a future update."),
        },
        {
          label: "Storage",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Storage management will be available in a future update."),
        },
        {
          label: "About",
          type: "navigation",
          onPress: () => Alert.alert("JustDeen", "Version 1.0.0\n\nYour companion for Islamic practices.\n\n© 2025 JustDeen"),
        },
        {
          label: "Help & Support",
          type: "navigation",
          onPress: () => Alert.alert("Coming Soon", "Help & Support will be available in a future update."),
        },
      ],
    },
  ]

  // Account section (only if authenticated)
  if (isAuthenticated) {
    sections.push({
      title: "ACCOUNT",
      rows: [
        {
          label: "Sign Out",
          type: "action",
          onPress: handleSignOut,
        },
        {
          label: "Delete Account",
          type: "action",
          destructive: true,
          onPress: handleDeleteAccount,
        },
      ],
    })
  }

  const renderRow = (row: SettingRow, index: number, totalRows: number) => {
    const isLast = index === totalRows - 1

    return (
      <TouchableOpacity
        key={row.label}
        style={themed($row(colors, isLast))}
        onPress={row.onPress}
        disabled={row.type === "toggle"}
        activeOpacity={row.type === "toggle" ? 1 : 0.6}
      >
        <View style={themed($rowContent)}>
          <Text style={themed($rowLabel(colors, row.destructive))}>{row.label}</Text>

          {/* Right side content */}
          <View style={themed($rowRight)}>
            {row.type === "toggle" && (
              <Switch
                value={row.toggleValue}
                onValueChange={row.onToggle}
                trackColor={{ false: colors.palette.systemGray4, true: colors.settings }}
                thumbColor="#FFFFFF"
              />
            )}

            {(row.type === "navigation" || row.type === "picker") && row.value && (
              <Text style={themed($rowValue(colors))}>{row.value}</Text>
            )}

            {(row.type === "navigation" || row.type === "picker") && (
              <Icon icon="caretRight" size={16} color={colors.textDim} style={themed($chevron)} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  return (
    <Screen preset="fixed" safeAreaEdges={["bottom"]} contentContainerStyle={themed($container(colors))}>
      <ScrollView
        style={themed($scrollView)}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        {isAuthenticated && user ? (
          <View style={themed($profileSection(colors))}>
            <View style={themed($profileAvatar(colors))}>
              {user.photoUrl ? (
                <Text style={themed($avatarText(colors))}>
                  {user.displayName?.charAt(0).toUpperCase() || "U"}
                </Text>
              ) : (
                <Icon icon="components" size={32} color={colors.settings} />
              )}
            </View>
            <View style={themed($profileInfo)}>
              <Text style={themed($profileName(colors))}>
                {user.displayName || "Guest User"}
              </Text>
              {user.email && (
                <Text style={themed($profileEmail(colors))}>{user.email}</Text>
              )}
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={themed($signInSection(colors))}
            onPress={handleSignIn}
            activeOpacity={0.7}
          >
            <View style={themed($signInAvatar(colors))}>
              <Icon icon="components" size={32} color={colors.settings} />
            </View>
            <View style={themed($signInInfo)}>
              <Text style={themed($signInTitle(colors))}>Sign In</Text>
              <Text style={themed($signInSubtitle(colors))}>
                Sign in to sync your progress across devices
              </Text>
            </View>
            <Icon icon="caretRight" size={20} color={colors.textDim} />
          </TouchableOpacity>
        )}

        {/* Settings Sections */}
        {sections.map((section) => (
          <View key={section.title} style={themed($section)}>
            <Text style={themed($sectionTitle(colors))}>{section.title}</Text>
            <View style={themed($sectionContent(colors))}>
              {section.rows.map((row, rowIndex) => renderRow(row, rowIndex, section.rows.length))}
            </View>
          </View>
        ))}

        {/* Version info at bottom */}
        <View style={themed($footer)}>
          <Text style={themed($footerText(colors))}>JustDeen v1.0.0</Text>
          <Text style={themed($footerSubtext(colors))}>
            Built with React Native & Expo
          </Text>
        </View>
      </ScrollView>
    </Screen>
  )
}

// Styles
const $container: ThemedStyle<any> = (colors) => ({
  flex: 1,
  backgroundColor: colors.background,
})

const $scrollView: ThemedStyle<any> = {
  flex: 1,
}

const $profileSection: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 20,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 8,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
})

const $profileAvatar: ThemedStyle<any> = (colors) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.palette.systemGray5,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 16,
})

const $avatarText: ThemedStyle<any> = (colors) => ({
  fontSize: 28,
  fontWeight: "700",
  color: colors.settings,
})

const $profileInfo: ThemedStyle<any> = {
  flex: 1,
}

const $profileName: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.text,
  marginBottom: 4,
})

const $profileEmail: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})

const $section: ThemedStyle<any> = {
  marginTop: 24,
}

const $sectionTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 13,
  fontWeight: "600",
  color: colors.textDim,
  marginLeft: 20,
  marginBottom: 8,
  letterSpacing: 0.5,
})

const $sectionContent: ThemedStyle<any> = (colors) => ({
  marginHorizontal: 16,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
  overflow: "hidden",
})

const $row: ThemedStyle<any> = (colors, isLast: boolean) => ({
  paddingVertical: 14,
  paddingHorizontal: 16,
  borderBottomWidth: isLast ? 0 : 1,
  borderBottomColor: colors.border,
})

const $rowContent: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
}

const $rowLabel: ThemedStyle<any> = (colors, destructive?: boolean) => ({
  fontSize: 16,
  fontWeight: "400",
  color: destructive ? colors.error : colors.text,
})

const $rowRight: ThemedStyle<any> = {
  flexDirection: "row",
  alignItems: "center",
}

const $rowValue: ThemedStyle<any> = (colors) => ({
  fontSize: 16,
  color: colors.textDim,
  marginRight: 8,
})

const $chevron: ThemedStyle<any> = {
  marginLeft: 4,
}

const $footer: ThemedStyle<any> = {
  alignItems: "center",
  paddingVertical: 32,
  paddingBottom: 48,
}

const $footerText: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
  marginBottom: 4,
})

const $footerSubtext: ThemedStyle<any> = (colors) => ({
  fontSize: 12,
  color: colors.textDim,
  opacity: 0.6,
})

// Sign In Section (for unauthenticated users)
const $signInSection: ThemedStyle<any> = (colors) => ({
  flexDirection: "row",
  alignItems: "center",
  padding: 20,
  marginHorizontal: 16,
  marginTop: 16,
  marginBottom: 8,
  backgroundColor: colors.palette.surface,
  borderRadius: 12,
})

const $signInAvatar: ThemedStyle<any> = (colors) => ({
  width: 64,
  height: 64,
  borderRadius: 32,
  backgroundColor: colors.palette.systemGray5,
  alignItems: "center",
  justifyContent: "center",
  marginRight: 16,
})

const $signInInfo: ThemedStyle<any> = {
  flex: 1,
}

const $signInTitle: ThemedStyle<any> = (colors) => ({
  fontSize: 18,
  fontWeight: "600",
  color: colors.settings,
  marginBottom: 4,
})

const $signInSubtitle: ThemedStyle<any> = (colors) => ({
  fontSize: 14,
  color: colors.textDim,
})
